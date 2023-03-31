/* eslint-disable guard-for-in */
import {
	ResponseUtility,
} from 'appknit-backend-bundle';
import { Types } from 'mongoose';
import {
	RestaurantModel,
	RestaurantVisitModel,
} from '../../schemas';
import { BOOKMARK_TYPE } from '../../constants';
/**
* @description A service model function to handle the
* details of restaurants.
* @author Santgurlal Singh
* @since 5 Oct, 2020
*/

export default ({
	id,
	restaurantId,
	longitude = 0.1,
	latitude = 0.1,
}) => new Promise(async (resolve, reject) => {
	try {
		const [restaurant] = await RestaurantModel.aggregate([
			{
				$geoNear: {
					near: { type: 'Point', coordinates: [longitude, latitude] },
					distanceField: 'distance',
					key: 'location',
					query: {
						_id: Types.ObjectId.createFromHexString(restaurantId),
						deleted: false,
					},
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
					from: 'rateandreviews',
					let: {
						restaurantRef: '$_id',
						userRef: Types.ObjectId.createFromHexString(id),
					},
					pipeline: [
						{
							$match: {
								$expr: {
									$and: [
										{
											$eq: [
												'$userRef',
												'$$userRef',
											],
										},
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
					as: 'selfRating',
				},
			},
			{
				$unwind: {
					path: '$selfRating',
					preserveNullAndEmptyArrays: true,
				},
			},
			{
				$lookup: {
					from: 'followrestaurants',
					let: {
						restaurantRef: '$_id',
						userRef: Types.ObjectId.createFromHexString(id),
					},
					pipeline: [
						{
							$match: {
								$expr: {
									$and: [
										{
											$eq: [
												'$userRef',
												'$$userRef',
											],
										},
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
					showPhoneNumber: { $ifNull: ['$showPhoneNumber', false] },
					phoneCode: { $cond: [{ $eq: ['$showPhoneNumber', true] }, { $ifNull: ['$phoneCode', ''] }, ''] },
					phoneNumber: { $cond: [{ $eq: ['$showPhoneNumber', true] }, { $ifNull: ['$phoneNumber', ''] }, 'Not Available'] },
					portCode: '$portCode',
					typeOfFood: '$typeOfFood',
					price: '$price',
					categories: '$categories',
					thumbnail: '$thumbnail',
					placePicture: '$placePicture',
					selfRating: '$selfRating',
					ratings: { $ifNull: ['$ratings', {}] },
					createdOn: '$createdOn',
					distance: '$distance',
					isFollowed: { $cond: [{ $size: '$following' }, true, false] },
					isBookmark: { $cond: ['$bookmarks._id', true, false] },
				},
			},
		]);
		if (!restaurant) {
			return reject(ResponseUtility.GENERIC_ERR({ code: 401, message: 'Requested place not found.' }));
		}
		const dateNow = new Date();
		const restaurantVisitObject = new RestaurantVisitModel({
			restaurantRef: restaurantId,
			userRef: id,
			createdOn: dateNow,
			updatedOn: dateNow,
		});
		await restaurantVisitObject.save();
		return resolve(ResponseUtility.SUCCESS({ data: restaurant }));
	} catch (err) {
		return reject(ResponseUtility.GENERIC_ERR({ message: err.message, error: err }));
	}
});
