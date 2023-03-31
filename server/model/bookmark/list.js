/**
 * @description A service model function to handle listing of bookmark.
 * @author Nikhil Negi
 * @since 22-10-2021
*/

import {
	ResponseUtility,
} from 'appknit-backend-bundle';
import { Types } from 'mongoose';
import {
	UserModel,
	BookmarkModel,
} from '../../schemas';
import { BOOKMARK_TYPE } from '../../constants';

export default ({
	id,
	refType = BOOKMARK_TYPE.PRODUCT,
	longitude = 0.1,
	latitude = 0.1,
	limit = 30,
	page = 1,
}) => new Promise(async (resolve, reject) => {
	try {
		const user = await UserModel.findOne({ _id: id });

		if (!user || user.deleted) {
			return reject(ResponseUtility.GENERIC_ERR({ code: 401, message: 'Requested user not found.' }));
		}

		if (user.blocked) {
			return reject(ResponseUtility.GENERIC_ERR({ code: 401, message: 'Your account has been blocked by admin.' }));
		}

		const matchQuery = {
			$match: {
				refType,
				status: true,
				userRef: Types.ObjectId(id),
			},
		};

		let agregateQuery;
		if (refType === BOOKMARK_TYPE.RESTAURANT) {
			agregateQuery = [
				matchQuery,
				{
					$lookup: {
						from: 'restaurants',
						let: {
							restaurantRef: '$ref',
						},
						pipeline: [
							{
								$geoNear: {
									near: { type: 'Point', coordinates: [longitude, latitude] },
									distanceField: 'distance',
									key: 'location',
									query: {
									//	_id: '$$restaurantRef',
										deleted: false,
										blocked: false,
									},
								},
							},
							{
								$match: {
									$expr: {
										$and: [
											{ $eq: ['$_id', '$$restaurantRef'] },
										],
									},
								},
							},
						],
						as: 'restaurants',
					},
				},
				{
					$unwind: {
						path: '$restaurants',
						preserveNullAndEmptyArrays: true,
					},
				},
				{
					$lookup: {
						from: 'rateandreviews',
						let: {
							restaurantRef: '$restaurants._id',
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
						_id: '$restaurants._id',
						location: '$restaurants.location',
						images: '$restaurants.images',
						name: '$restaurants.name',
						website: '$restaurants.website',
						about: '$restaurants.about',
						showPhoneNumber: { $ifNull: ['$restaurants.showPhoneNumber', false] },
						phoneCode: { $cond: [{ $eq: ['$restaurants.showPhoneNumber', true] }, { $ifNull: ['$restaurants.phoneCode', ''] }, ''] },
						phoneNumber: { $cond: [{ $eq: ['$restaurants.showPhoneNumber', true] }, { $ifNull: ['$restaurants.phoneNumber', ''] }, 'Not Available'] },
						portCode: '$restaurants.portCode',
						typeOfFood: '$restaurants.typeOfFood',
						price: '$restaurants.price',
						categories: '$restaurants.categories',
						thumbnail: '$restaurants.thumbnail',
						distance: '$restaurants.distance',
						ratings: { $ifNull: ['$ratings', {}] },
						placePicture: '$restaurants.placePicture',
						createdOn: '$restaurants.createdOn',
					},
				},
				{ $sort: { updatedOn: -1 } },
				{ $skip: (page - 1) * limit },
				{ $limit: limit },
			];
		} else if (refType === BOOKMARK_TYPE.BRAND) {
			agregateQuery = [
				matchQuery,
				{
					$lookup: {
						from: 'brands',
						let: {
							brandRef: '$ref',
						},
						pipeline: [
							{
								$match: {
									$expr: {
										$and: [
											{
												$eq: ['$_id', '$$brandRef'],
											},
											{
												$eq: ['$deleted', false],
											},
											{
												$eq: ['$blocked', false],
											},
										],
									},
								},
							},
						],
						as: 'brands',
					},
				},
				{
					$unwind: {
						path: '$brands',
						preserveNullAndEmptyArrays: true,
					},
				},
				{
					$project: {
						_id: '$brands._id',
						brandName: '$brands.companyName',
						coverImage: '$brands.coverImage',
						logo: '$brands.logo',
						about: '$brands.about',
						website: '$brands.website',
					},
				},
				{ $sort: { updatedOn: -1 } },
				{ $skip: (page - 1) * limit },
				{ $limit: limit },
			];
		} else {
			agregateQuery = [
				matchQuery,
				{
					$lookup: {
						from: 'products',
						let: {
							productRef: '$ref',
						},
						pipeline: [
							{
								$match: {
									$expr: {
										$and: [
											{
												$eq: ['$_id', '$$productRef'],
											},
											{
												$eq: ['$deleted', false],
											},
											{
												$eq: ['$blocked', false],
											},
										],
									},
								},
							},
						],
						as: 'products',
					},
				},
				{
					$unwind: {
						path: '$products',
						preserveNullAndEmptyArrays: true,
					},
				},
				{
					$lookup: {
						from: 'brands',
						let: {
							brandRef: '$products.brandRef',
						},
						pipeline: [
							{
								$match: {
									$expr: {
										$and: [{
											$eq: [
												'$_id',
												'$$brandRef',
											],
										},
										{
											$eq: [
												'$deleted',
												false,
											],
										},
										{
											$eq: [
												'$blocked',
												false,
											],
										}],
									},
								},
							},
						],
						as: 'brands',
					},
				},
				{
					$unwind: {
						path: '$brands',
					},
				},
				{
					$project: {
						_id: '$products._id',
						name: '$products.name',
						keywords: '$products.keywords',
						price: '$products.price',
						brandName: '$brands.companyName',
						brandRef: '$brands._id',
						currency: '$products.currency',
						images: '$products.images',
						category: '$products.category',
						subCategory: '$products.subCategory',
						gender: '$products.gender',
						link: '$products.link',
						info: '$products.info',
					},
				},
				{ $sort: { updatedOn: -1 } },
				{ $skip: (page - 1) * limit },
				{ $limit: limit },
			];
		}

		const list = await BookmarkModel.aggregate(agregateQuery);

		return resolve(ResponseUtility.SUCCESS({ data: list }));
	} catch (err) {
		return reject(ResponseUtility.GENERIC_ERR({ message: err.message, error: err }));
	}
});
