/* eslint-disable guard-for-in */
import {
	ResponseUtility,
} from 'appknit-backend-bundle';
import { Types } from 'mongoose';
import {
	RestaurantModel,
} from '../../schemas';
/**
* @description A service model function to handle the
* details of restaurants for guest user.
* @author Santgurlal Singh
* @since 5 Oct, 2020
*/

export default ({
	restaurantId,
}) => new Promise(async (resolve, reject) => {
	try {
		const [restaurant] = await RestaurantModel.aggregate([
			{
				$match: {
					_id: Types.ObjectId.createFromHexString(restaurantId),
					deleted: false,
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
					showPhoneNumber: { $ifNull: ['$showPhoneNumber', false] },
					phoneCode: { $cond: [{ $eq: ['$showPhoneNumber', true] }, { $ifNull: ['$phoneCode', ''] }, ''] },
					phoneNumber: { $cond: [{ $eq: ['$showPhoneNumber', true] }, { $ifNull: ['$phoneNumber', ''] }, 'Not Available'] },
					portCode: '$portCode',
					typeOfFood: '$typeOfFood',
					price: '$price',
					categories: '$categories',
					thumbnail: '$thumbnail',
					placePicture: '$placePicture',
					ratings: { $ifNull: ['$ratings', {}] },
					createdOn: '$createdOn',
				},
			},
		]);
		return resolve(ResponseUtility.SUCCESS({ data: restaurant }));
	} catch (err) {
		return reject(ResponseUtility.GENERIC_ERR({ message: err.message, error: err }));
	}
});
