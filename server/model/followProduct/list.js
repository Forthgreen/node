import {
	ResponseUtility,
} from 'appknit-backend-bundle';
import { Types } from 'mongoose';
import {
	FollowProductModel,
	UserModel,
} from '../../schemas';

/**
 * @description A service model function to handle the
 * list of products followed by user.
 * @author Santgurlal Singh
 * @since 15 Jan, 2020
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

		const data = await FollowProductModel.aggregate([
			{
				$match: {
					userRef: Types.ObjectId.createFromHexString(id),
				},
			},
			{
				$lookup: {
					from: 'products',
					let: {
						productRef: '$productRef',
					},
					pipeline: [
						{
							$match: {
								$expr: {
									$and: [
										{
											$eq: [
												'$_id',
												'$$productRef',
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
								from: 'brands',
								let: {
									brandRef: '$brandRef',
								},
								pipeline: [
									{
										$match: {
											$expr: {
												$and: [
													{
														$eq: [
															'$_id',
															'$$brandRef',
														],
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
									{
										$project: {
											_id: '$_id',
											name: '$name',
											email: '$email',
											mobileCode: '$mobileCode',
											mobileNumber: '$mobileNumber',
											companyName: '$companyName',
											coverImage: '$coverImage',
											logo: '$logo',
											about: '$about',
											website: '$website',
										},
									},
								],
								as: 'brandDetails',
							},
						},
						{
							$unwind: {
								path: '$brandDetails',
								preserveNullAndEmptyArrays: true,
							},
						},
					],
					as: 'product',
				},
			},
			{
				$unwind: {
					path: '$product',
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
