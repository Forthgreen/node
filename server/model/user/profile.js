/* eslint-disable no-underscore-dangle */
import { ResponseUtility } from 'appknit-backend-bundle';
import { Types } from 'mongoose';
import {
	UserModel,
	BlockUserModel,
} from '../../schemas';

import {
	LIKES_TYPE,
} from '../../constants';

/**
 * @description service model function to fetch the profile of the user
 * @author Nikhil Negi
 * @param {String} id the unique id of current user.
 * @param {String} userRef the unique id of specific user.
 * @since 12-04-2021
 */
export default ({
	id,
	userRef,
	page = 1,
	limit = 30,
}) => new Promise(async (resolve, reject) => {
	try {
		const user = await UserModel.findOne({ _id: id });

		if (!user || user.deleted) {
			return reject(ResponseUtility.GENERIC_ERR({ code: 401, message: 'Requested user not found.' }));
		}

		if (user.blocked) {
			return reject(ResponseUtility.GENERIC_ERR({ code: 401, message: 'Your account has been blocked by admin.' }));
		}

		if (userRef) {
			const otherUser = await UserModel.findOne({
				_id: userRef,
				deleted: false,
				blocked: false,
			});
			if (!otherUser) {
				return reject(ResponseUtility.GENERIC_ERR({ message: 'Invalid userRef' }));
			}
		}

		const userBlocking = await BlockUserModel.find({
			userRef: userRef,
			blockingRef: id,
		});


		const [userDetails] = await UserModel.aggregate([
			{
				$match: {
					_id: userRef ? Types.ObjectId(userRef) : Types.ObjectId(id),
					deleted: false,
				},
			},
			{
				$lookup: {
					from: 'posts',
					let: { userRef: '$_id' },
					pipeline: [
						{
							$match: {
								$expr: {
									$and: [
										{ $eq: ['$userRef', '$$userRef'] },
										{ $eq: ['$status', true] },
									],
								},
							},
						},
						{
							$sort: {
								createdOn: -1,
							},
						},
						{
							$skip: (page - 1) * limit,
						},
						{
							$limit: limit,
						},
						{
							$lookup: {
								from: 'likes',
								let: { localField: '$_id' },
								pipeline: [
									{
										$match: {
											$expr: {
												$and: [
													{ $eq: ['$type', LIKES_TYPE.POST] },
													{ $eq: ['$ref', '$$localField'] },
													{ $eq: ['$status', true] },
												],
											},
										},
									},
								],
								as: 'likes',
							},
						},
						{
							$lookup: {
								from: 'comments',
								let: { localField: '$_id' },
								pipeline: [
									{
										$match: {
											$expr: {
												$and: [
													{ $eq: ['$postRef', '$$localField'] },
													{ $eq: ['$status', true] },
												],
											},
										},
									},
								],
								as: 'comments',
							},
						},
						{
							$project: {
								_id: '$_id',
								text: { $ifNull: ['$text', ''] },
								type: '$type',
								tags: '$tags',
								image: { $ifNull: ['$image', []] },
								status: '$status',
								isLike: { $in: [Types.ObjectId(id), '$likes.userRef'] },
								likes: { $size: '$likes' },
								comments: { $size: '$comments' },
								createdOn: '$createdOn',
								updatedOn: '$updatedOn',
								video: { $ifNull: ['$video', ''] },
								thumbnail: { $ifNull: ['$thumbnail', ''] },
								videoHeight: '$videoHeight',
								videoWidth: '$videoWidth'
							},
						},
					],
					as: 'posts',
				},
			},
			{
				$lookup: {
					from: 'followusers',
					let: { userRef: '$_id' },
					pipeline: [
						{
							$match: {
								$expr: {
									$and: [
										{ $eq: ['$followingRef', '$$userRef'] },
									],
								},
							},
						},
					],
					as: 'followers',
				},
			},
			{
				$lookup: {
					from: 'followusers',
					let: { userRef: '$_id' },
					pipeline: [
						{
							$match: {
								$expr: {
									$and: [
										{ $eq: ['$userRef', '$$userRef'] },
									],
								},
							},
						},
					],
					as: 'followings',
				},
			},


			{
				$lookup: {
					from: 'blockusers',
					let: { userRef: '$_id' },
					pipeline: [
						{
							$match: {
								$expr: {
									$and: [
										{ $eq: ['$blockingRef', '$$userRef'] },
									],
								},
							},
						},
					],
					as: 'blockers',
				},
			},
			{
				$lookup: {
					from: 'blockusers',
					let: { userRef: '$_id' },
					pipeline: [
						{
							$match: {
								$expr: {
									$and: [
										{ $eq: ['$userRef', '$$userRef'] },
									],
								},
							},
						},
					],
					as: 'blockings',
				},
			},
			

			

			{
				$project: {
					_id: '$_id',
					firstName: '$firstName',
					lastName: '$lastName',
					email: '$email',
					socialIdentifier: { $ifNull: ['$socialIdentifier', '$$REMOVE'] },
					username: '$username',
					image: '$image',
					bio: '$bio',
					gender: '$gender',
					dateOfBirth: '$dateOfBirth',
					isFollow: { $in: [Types.ObjectId(id), '$followers.userRef'] },
					isBlock: { $in: [Types.ObjectId(id), '$blockers.userRef'] },
					isSenderBlock: userBlocking,
					dummyUser: { $ifNull: ['$dummyUser', false] },
					posts: '$posts',
					followings: { $size: '$followings' },
					followers: { $size: '$followers' },
					createdOn: '$createdOn',
				},
			},
		]);

		return resolve(ResponseUtility.SUCCESS_PAGINATION({
			data: userDetails,
			page,
			limit,
		}));
	} catch (err) {
		return reject(ResponseUtility.GENERIC_ERR({ message: err.message, error: err.error }));
	}
});
