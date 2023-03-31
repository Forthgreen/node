import {
	ResponseUtility,
} from 'appknit-backend-bundle';
import {
	RestaurantModel,
} from '../../schemas';
/**
* @description A service model function to handle the
* listing of all restaurants.
* @author Santgurlal Singh
* @since 13 Oct, 2020
*/

export default ({
	text,
	sortBy = {
		field: 'createdOn',
		order: 1,
	},
	page = 1,
	limit = 20,
}) => new Promise(async (resolve, reject) => {
	try {
		const query = {
			deleted: false,
		};
		if (text) {
			query.name = { $regex: new RegExp(text, 'i') };
		}
		const sortQuery = { $sort: { createdOn: -1 } };
		if (sortBy.field === 'name') {
			sortQuery.$sort = { createdOn: sortBy.order };
		} else if (sortBy.field === 'reviews') {
			sortQuery.$sort = { ratings: sortBy.order };
		} else if (sortBy.field === 'followers') {
			sortQuery.$sort = { followers: sortBy.order };
		} else if (sortBy.field === 'visits') {
			sortQuery.$sort = { visits: sortBy.order };
		}
		const restaurants = await RestaurantModel.aggregate([
			{
				$match: query,
			},
			{
				$lookup: {
					from: 'rateandreviews',
					let: {
						restaurantRef: '$_id',
					},
					pipeline: [
						{
							$match: {
								$expr: {
									$and: [
										{
											$eq: [
												'$restaurantRef',
												'$$restaurantRef',
											],
										},
										{
											$eq: [
												'$blocked',
												false,
											],
										},
									],
								},
							},
						},
					],
					as: 'ratings',
				},
			},
			{
				$lookup: {
					from: 'followrestaurants',
					let: {
						restaurantRef: '$_id',
					},
					pipeline: [
						{
							$match: {
								$expr: {
									$and: [
										{
											$eq: [
												'$restaurantRef',
												'$$restaurantRef',
											],
										},
									],
								},
							},
						},
					],
					as: 'following',
				},
			},
			{
				$lookup: {
					from: 'restaurantvisits',
					let: {
						restaurantRef: '$_id',
					},
					pipeline: [
						{
							$match: {
								$expr: {
									$and: [
										{
											$eq: [
												'$restaurantRef',
												'$$restaurantRef',
											],
										},
									],
								},
							},
						},
					],
					as: 'visits',
				},
			},
			{
				$project: {
					_id: '$_id',
					name: '$name',
					nameLowercase: { $toLower: '$name' },
					about: '$about',
					website: '$website',
					phoneCode: { $ifNull: ['$phoneCode', ''] },
					phoneNumber: { $ifNull: ['$phoneNumber', ''] },
					location: {
						address: '$location.address',
						type: '$location.type',
						coordinates: { $reverseArray: [{ $ifNull: ['$location.coordinates', []] }] },
					},
					portCode: '$portCode',
					typeOfFood: '$typeOfFood',
					price: '$price',
					categories: '$categories',
					thumbnail: '$thumbnail',
					images: '$images',
					showPhoneNumber: '$showPhoneNumber',
					blocked: '$blocked',
					createdOn: '$createdOn',
					updatedOn: '$updatedOn',
					followers: { $size: '$following' },
					ratings: { $size: '$ratings' },
					visits: { $size: '$visits' },
				},
			},
			sortQuery,
			{
				$skip: limit * (page - 1),
			},
			{
				$limit: limit,
			},
		]);
		const totalItems = await RestaurantModel.countDocuments({
			$and: [
				{ name: { $regex: new RegExp(text, 'i') } },
				{ deleted: false },
			],
		});
		return resolve(ResponseUtility.SUCCESS_PAGINATION(
			{ data: { list: restaurants, totalItems }, page, limit },
		));
	} catch (err) {
		return reject(ResponseUtility.GENERIC_ERR({ message: err.message, error: err }));
	}
});
