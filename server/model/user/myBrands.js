import {
	ResponseUtility,
} from 'appknit-backend-bundle';

import { Types } from 'mongoose';
import {
	FollowBrandModel,
	UserModel,
} from '../../schemas';


/**
 * @description A service model function to handle the
 *  list of following brands.
 * @author Jagmohan Singh
 * @since 2 May 2020
 */


export default ({
	id,
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

		const query = [{
			$match: {
				userRef: Types.ObjectId.createFromHexString(id),
				status: true,
			},
		}, {
			$lookup: {
				from: 'brands',
				let: {
					brandRef: '$brandRef',
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
								}, {
									$eq: [
										'$deleted',
										false,
									],
								}, {
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
		}, {
			$unwind: {
				path: '$brands',
			},
		},
		{
			$lookup: {
				from: 'products',
				let: {
					brandRef: '$brandRef',
				},
				pipeline: [
					{
						$match: {
							$expr: {
								$and: [{
									$eq: [
										'$brandRef',
										'$$brandRef',
									],
								}, {
									$eq: [
										'$deleted',
										false,
									],
								}, {
									$eq: [
										'$uploadedToProfile',
										true,
									],
								},
								],
							},
						},
					},
				],
				as: 'products',
			},
		}, {
			$unwind: {
				path: '$products',
				preserveNullAndEmptyArrays: true,
			},
		},
		{
			$project: {
				brandRef: '$brands._id',
				companyName: '$brands.companyName',
				count: {
					$cond: { if: { $gt: ['$products.createdOn', '$lastProductDate'] }, then: 1, else: 0 },
				},
				coverImage: '$brands.coverImage',
				logo: '$brands.logo',
			},
		},
		{
			$group: {
				_id: '$brandRef',
				brandName: { $first: '$companyName' },
				count: { $sum: '$count' },
				coverImage: { $first: '$coverImage' },
				logo: { $first: '$logo' },
			},
		}, {
			$skip: limit * (page - 1),
		},
		{
			$limit: limit,
		}];


		const data = await FollowBrandModel.aggregate(query);

		return resolve(ResponseUtility.SUCCESS_PAGINATION({ data, limit, page }));
	} catch (err) {
		return reject(ResponseUtility.GENERIC_ERR({ message: err.message, error: err }));
	}
});
