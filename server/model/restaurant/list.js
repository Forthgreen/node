/* eslint-disable guard-for-in */
import {
	ResponseUtility,
} from 'appknit-backend-bundle';
import { Types } from 'mongoose';
import {
	RestaurantModel,
} from '../../schemas';
import {
	DEFAULT_RESTAURANT_MAX_DISTANCE,
	BOOKMARK_TYPE,
} from '../../constants';

/**
* @description A service model function to handle the
* listing of restaurants.
* @author Santgurlal Singh
* @since 5 Oct, 2020
*/

export default ({
	id,
	longitude,
	latitude,
	categories,
	distance = DEFAULT_RESTAURANT_MAX_DISTANCE,
	text,
	page = 1,
	limit = 20,
}) => new Promise(async (resolve, reject) => {
	try {
		if (!(latitude && longitude)) {
			return reject(ResponseUtility.GENERIC_ERR({ message: 'Coordinates are required.' }));
		}
		console.log(limit);
		if (limit > 30) {
			limit = 30;
		}
		const query = {
			deleted: false,
		};
		if (categories && categories.length) {
			query.categories = { $in: categories };
		}
		if (text) {
			query.name = { $regex: new RegExp(text, 'i') };
		}
		const restaurants = await RestaurantModel.aggregate([
			{
				$geoNear: {
					near: { type: 'Point', coordinates: [longitude, latitude] },
					distanceField: 'distance',
					key: 'location',
					query,
					maxDistance: Number(distance) * 1000,
				},
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
						{
							$group: {
								_id: '$restaurantRef',
								count: { $sum: 1 },
								averageRating: { $avg: '$rating' },
							},
						},
					],
					as: 'ratings',
				},
			},
			{
				$unwind: {
					path: '$ratings',
					preserveNullAndEmptyArrays: true,
				},
			},
			{
				$lookup: {
					from: 'bookmarks',
					let: { ref: '$_id' },
					pipeline: [
						{
							$match: {
								$expr: {
									$and: [
										{ $eq: ['$ref', '$$ref'] },
										{ $eq: ['$status', true] },
										{ $eq: ['$userRef', Types.ObjectId(id)] },
										{ $eq: ['$refType', BOOKMARK_TYPE.RESTAURANT] },
									],
								},
							},
						},
					],
					as: 'bookmarks',
				},
			},
			{
				$unwind: {
					path: '$bookmarks',
					preserveNullAndEmptyArrays: true,
				},
			},
			{
				$project: {
					_id: '$_id',
					location: {
						address: '$location.address',
						type: '$location.type',
						coordinates: { $reverseArray: [{ $ifNull: ['$location.coordinates', []] }] },
					},
					images: '$images',
					name: '$name',
					website: '$website',
					about: '$about',
					phoneCode: { $ifNull: ['$phoneCode', ''] },
					phoneNumber: { $ifNull: ['$phoneNumber', ''] },
					portCode: '$portCode',
					typeOfFood: '$typeOfFood',
					price: '$price',
					categories: '$categories',
					thumbnail: '$thumbnail',
					placePicture: '$placePicture',
					ratings: { $ifNull: ['$ratings', {}] },
					createdOn: '$createdOn',
					distance: '$distance',
					isBookmark: { $cond: ['$bookmarks._id', true, false] },
				},
			},
			{
				$skip: limit * (page - 1),
			},
			{
				$limit: limit,
			},
		]);
		return resolve(ResponseUtility.SUCCESS_PAGINATION({ data: restaurants, page, limit }));
	} catch (err) {
		return reject(ResponseUtility.GENERIC_ERR({ message: err.message, error: err }));
	}
});
