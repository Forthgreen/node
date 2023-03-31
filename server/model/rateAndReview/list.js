import {
	ResponseUtility,
} from 'appknit-backend-bundle';
import { Types } from 'mongoose';
import {
	RateAndReviewModel,
} from '../../schemas';

/**
 * @description A service model function to handle the
 *  list of rating and review given by user.
 * @param {String} productRef the unique id of a product.
 * @author Jagmohan Singh
 * @since 7 May 2020
 */


export default ({
	id,
	productRef,
	restaurantRef,
	limit = 30,
	page = 1,
}) => new Promise(async (resolve, reject) => {
	try {
		const matchCondition = {
			freeze: false,
		};
		if (id) {
			matchCondition.userRef = Types.ObjectId.createFromHexString(id);
		} else if (productRef) {
			matchCondition.productRef = Types.ObjectId.createFromHexString(productRef);
		} else if (restaurantRef) {
			matchCondition.restaurantRef = Types.ObjectId.createFromHexString(restaurantRef);
		} else {
			return reject(ResponseUtility.GENERIC_ERR({ message: 'ProductRef or restaurantRef is reqeuired.' }));
		}
		const query = [
			{
				$match: matchCondition,
			}, {
				$sort: {
					createdOn: -1,
				},
			}, {
				$skip: limit * (page - 1),
			}, {
				$limit: limit,
			}, {
				$lookup: {
					from: 'users',
					let: { id: '$userRef' },
					pipeline: [
						{ $match: { $expr: { $and: [{ $eq: ['$_id', '$$id'] }] } } },
						{
							$project: {
								_id: '$_id',
								firstName: '$firstName',
								lastName: '$lastName',
								image: '$image',
							},
						},
					],
					as: 'userDetails',
				},
			}, {
				$unwind: {
					path: '$userDetails',
				},
			},
			{
				$lookup: {
					from: 'products',
					localField: 'productRef',
					foreignField: '_id',
					as: 'product',
				},
			}, {
				$unwind: {
					path: '$product',
					preserveNullAndEmptyArrays: true,
				},
			},
			{
				$lookup: {
					from: 'restaurants',
					localField: 'restaurantRef',
					foreignField: '_id',
					as: 'restaurant',
				},
			}, {
				$unwind: {
					path: '$restaurant',
					preserveNullAndEmptyArrays: true,
				},
			},
			{
				$project: {
					_id: '$_id',
					rating: '$rating',
					review: '$review',
					title: '$title',
					productRef: '$productRef',
					restaurantRef: '$restaurantRef',
					userDetails: '$userDetails',
					name: { $cond: ['$product', '$product.name', '$restaurant.name'] },
					images: { $cond: ['$product', '$product.images', '$restaurant.images'] },
					createdOn: '$createdOn',
					type: '$type',
				},
			},
		];

		const data = await RateAndReviewModel.aggregate(query);
		return resolve(ResponseUtility.SUCCESS_PAGINATION({ data, limit, page }));
	} catch (err) {
		return reject(ResponseUtility.GENERIC_ERR({ message: err.message, error: err }));
	}
});
