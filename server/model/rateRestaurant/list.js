import {
	ResponseUtility,
} from 'appknit-backend-bundle';
import { Types } from 'mongoose';
import {
	RateAndReviewModel,
} from '../../schemas';
import { REVIEW_TYPE } from '../../constants';

/**
* @description A service model function to handle the
* list of rating and review given by users for a restaurant.
* @param {String} restaurantRef the unique id of a restaurant.
* @author Santgurlal Singh
* @since 6 Oct, 2020
*/

export default ({
	userRef,
	restaurantRef,
	limit = 20,
	page = 1,
}) => new Promise(async (resolve, reject) => {
	try {
		const matchCondition = { type: REVIEW_TYPE.RESTAURANT };
		if (userRef) {
			matchCondition.userRef = Types.ObjectId.createFromHexString(userRef);
		} else if (restaurantRef) {
			matchCondition.restaurantRef = Types.ObjectId.createFromHexString(restaurantRef);
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
			},
			{
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
					from: 'restaurants',
					localField: 'restaurantRef',
					foreignField: '_id',
					as: 'restaurant',
				},
			}, {
				$unwind: {
					path: '$restaurant',
				},
			},
			{
				$project: {
					_id: '$_id',
					rating: '$rating',
					review: '$review',
					title: '$title',
					userDetails: '$userDetails',
					name: '$restaurant.name',
					images: '$restaurant.images',
					createdOn: '$createdOn',
					type: '$type',
					restaurantRef: '$restaurantRef',
				},
			},
		];

		const data = await RateAndReviewModel.aggregate(query);
		return resolve(ResponseUtility.SUCCESS_PAGINATION({ data, limit, page }));
	} catch (err) {
		return reject(ResponseUtility.GENERIC_ERR({ message: err.message, error: err }));
	}
});
