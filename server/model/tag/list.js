/* eslint-disable no-restricted-syntax */
/* eslint-disable indent */
/**
 * @description A service model function to handle the
 *  list of products.
 * @author Nikhil Negi
 * @since 22-10-2021
*/

import {
	ResponseUtility,
} from 'appknit-backend-bundle';
import { Types } from 'mongoose';

import {
	FollowUserModel,
} from '../../schemas';
import { TAG_TYPE } from '../../constants';

export default ({
	id,
	limit = 30,
	page = 1,
	text = '',
}) => new Promise(async (resolve, reject) => {
	try {
		const users = await FollowUserModel.aggregate([
			{
				$match: {
					followingRef: Types.ObjectId(id),
				},
			},
			{
				$lookup: {
					from: 'users',
					let: {
						localField: '$userRef',
					},
					pipeline: [
						{
							$match: {
								$expr: {
									$and: [
										{
											$eq: ['$_id', '$$localField'],
										},
										{
											$eq: ['$deleted', false],
										},
										{
											$eq: ['$blocked', false],
										},
									],
								},
								username: { $regex: new RegExp(text, 'i') },
							},
						},
					],
					as: 'followers',
				},
			},
			{
				$unwind: {
					path: '$followers',
					preserveNullAndEmptyArrays: true,
				},

			},
			{
				$match: {
					'followers._id': { $exists: true },
				},
			},
			{
				$project: {
					_id: '$followers._id',
					name: '$followers.username',
					image: '$followers.image',
					type: { $cond: ['$followers._id', TAG_TYPE.USERS, '$$REMOVE'] },
				},
			},
			{
				$unionWith: {
					coll: 'users',
					pipeline: [
						{
							$match: {
								deleted: false,
								blocked: false,
								username: { $regex: new RegExp(text, 'i') },
								dummyUser: true,
							},
						},
						{
							$project: {
								_id: '$_id',
								name: '$username',
								image: '$image',
								type: { $cond: ['$_id', TAG_TYPE.USERS, '$$REMOVE'] },
							},
						},
					],
				},
			},
			{
				$unionWith: {
					coll: 'brands',
					pipeline: [
						{
							$match: {
								deleted: false,
								blocked: false,
								isVerified: true,
								isVerifiedByAdmin: true,
								companyName: { $regex: new RegExp(text, 'i') },
							},
						},
						{
							$project: {
								_id: '$_id',
								name: '$companyName',
								image: '$logo',
								type: { $cond: ['$_id', TAG_TYPE.BRAND, '$$REMOVE'] },
							},
						},
					],
				},
			},
			{
				$unionWith: {
					coll: 'restaurants',
					pipeline: [
						{
							$match: {
								deleted: false,
								blocked: false,
								name: { $regex: new RegExp(text, 'i') },
							},
						},
						{
							$project: {
								_id: '$_id',
								name: '$name',
								image: '$thumbnail',
								type: { $cond: ['$_id', TAG_TYPE.RESTAURANTS, '$$REMOVE'] },
							},
						},
					],
				},
			},
			{ $sort: { name: 1 } },
			{ $skip: limit * (page - 1) },
			{ $limit: limit },
		]);
		return resolve(ResponseUtility.SUCCESS_PAGINATION({ data: users, limit, page }));
	} catch (err) {
		return reject(ResponseUtility.GENERIC_ERR({ message: err.message, error: err }));
	}
});
