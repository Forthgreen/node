import {
	ResponseUtility,
} from 'appknit-backend-bundle';

import { Types } from 'mongoose';
import {
	FollowRestaurantModel,
	UserModel,
} from '../../schemas';

/**
* @description A service model function to handle the
* list of restaurants followed by user.
* @author Santgurlal Singh
* @since 7 Oct, 2020
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

		const data = await FollowRestaurantModel.aggregate([
			{
				$match: {
					userRef: Types.ObjectId.createFromHexString(id),
				},
			},
			{
				$lookup: {
					from: 'restaurants',
					let: {
						restaurantRef: '$restaurantRef',
					},
					pipeline: [
						{
							$match: {
								$expr: {
									$and: [
										{
											$eq: [
												'$_id',
												'$$restaurantRef',
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
										},
									],
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
					],
					as: 'restaurant',
				},
			},
			{
				$unwind: {
					path: '$restaurant',
				},
			},
			{
				$skip: limit * (page - 1),
			},
			{
				$limit: limit,
			},
		]);

		return resolve(ResponseUtility.SUCCESS_PAGINATION({ data, limit, page }));
	} catch (err) {
		return reject(ResponseUtility.GENERIC_ERR({ message: err.message, error: err }));
	}
});
