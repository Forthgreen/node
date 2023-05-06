import {
	ResponseUtility,
} from 'appknit-backend-bundle';
import { ObjectID } from 'mongodb';
import { Types } from 'mongoose';
import {
	PostModel,
	UserModel,
	FollowUserModel,
	BlockUserModel,
} from '../../schemas';
import {
	LIKES_TYPE,
	LIMIT,
} from '../../constants';
/**
* @description This service model function handles the
* listing of the posts for a particular user or a guest
* @author Nikhil Negi
* @since 02-04-2021
* @param {String} id the unique id of user.
*/

export default ({
	id,
	page = 1,
	limit = LIMIT.POST,
}) => new Promise(async (resolve, reject) => {
	try {
		let checkLike;
		if (id) {
			const userInfo = await UserModel.findOne({
				_id: id,
				deleted: false,
				blocked: false,
			});

			if (!userInfo) {
				return reject(ResponseUtility.GENERIC_ERR({ code: 401, message: 'Requested user not found.' }));
			}

			checkLike = { $in: [Types.ObjectId(id), '$likes.userRef'] };
		}

		const userFollowing = (await FollowUserModel.find({
			userRef: id,
		}, {
			_id: 0,
			followingRef: 1,
		}) || []).map(arr => arr.followingRef);


		
		const userBlocking = (await BlockUserModel.find({
			userRef: id,
		}, {
			_id: 0,
			blockingRef: 1,
		}) || []).map(arr => arr.blockingRef);

		const Blockinguser = (await BlockUserModel.find({
			blockingRef: id,
		}, {
			_id: 0,
			userRef: 1,
		}) || []).map(arr => arr.userRef);


		const list = await PostModel.aggregate([
			{
				$match: {
					status: true,
					userRef : { $nin : userBlocking},
				},
			},
			{
				$match: {
					userRef : { $nin : Blockinguser},
				},
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
				$lookup: {
					from: 'users',
					let: { localField: '$userRef' },
					pipeline: [
						{
							$match: {
								$expr: {
									$and: [
										{ $eq: ['$_id', '$$localField'] },
										{ $eq: ['$deleted', false] },
										{ $eq: ['$blocked', false] },
									],
								},
							},
						},
					],
					as: 'users',
				},
			},
			{
				$unwind: '$users',
			},
			{
				$lookup: {
					from: 'likes',
					let: { postRef: '$_id', postUserRef: '$userRef' },
					pipeline: [
						{
							$match: {
								$expr: {
									$and: [
										// { $in: ['$userRef', userFollowing] },
										{ $eq: ['$ref', '$$postRef'] },
										{ $eq: ['$status', true] },
										{ $eq: ['$type', LIKES_TYPE.POST] },
										{ $ne: ['$userRef', '$$postUserRef'] },

									],
								},
							},
						},
						{
							$lookup: {
								from: 'posts',
								let: { postRef: '$ref', userId: '$userRef' },
								pipeline: [
									{
										$match: {
											$expr: {
												$and: [
													{ $eq: ['$_id', '$$postRef'] },
													{ $eq: ['$status', true] },
													{ $ne: ['$userRef', '$$userId'] },
													{ $ne: ['$userRef', ObjectID(id)] },
												],
											},
										},
									},
								],
								as: 'postLiked',
							},
						},
						{
							$unwind: '$postLiked',
						},
						{
							$lookup: {
								from: 'users',
								let: { userId: '$userRef' },
								pipeline: [
									{
										$match: {
											$expr: {
												$and: [
													{ $eq: ['$_id', '$$userId'] },
													{ $eq: ['$deleted', false] },
													{ $eq: ['$blocked', false] },
												],
											},
										},
									},
									{
										$project: {
											_id: '$_id',
											firstName: '$firstName',
											lastName: '$lastName',
										},
									},
								],
								as: 'usernames',
							},
						},
						{
							$unwind: '$usernames',
						},
						{
							$sort: {
								createdOn: -1,
							},
						},
						{
							$limit: 2,
						},
					],
					as: 'followersliked',
				},
			},
			{
				$lookup: {
					from: 'likes',
					let: { postRef: '$_id',  postUserRef: '$userRef' },
					pipeline: [
						{
							$match: {
								$expr: {
									$and: [
										{ $eq: ['$ref', '$$postRef'] },
										{ $eq: ['$type', LIKES_TYPE.POST] },
										// { $in: ['$userRef', userFollowing] },
										{ $ne: ['$userRef', '$$postUserRef'] },
										{ $eq: ['$status', true] },
									],
								},
							},
						},
						{
							$lookup: {
								from: 'posts',
								let: { postRef: '$ref' },
								pipeline: [
									{
										$match: {
											$expr: {
												$and: [
													{ $eq: ['$_id', '$$postRef'] },
													{ $eq: ['$status', true] },
													{ $ne: ['$userRef', ObjectID(id)] },
												],
											},
										},
									},
								],
								as: 'postsIncluded',
							},
						},
						{
							$unwind: {
								path: '$postsIncluded',
							},
						},
						{
							$group: {
								_id: '$postsIncluded._id',
								updatedLike: { $max: '$updatedOn' },
							},
						},
					],
					as: 'updatedLike',
				},
			},
			{
				$unwind: {
					path: '$updatedLike',
					preserveNullAndEmptyArrays: true,
				},
			},
			{
				$lookup: {
					from: 'posts',
					let: { postRef: '$_id' },
					pipeline: [
						{
							$match: {
								$expr: {
									$and: [
										{ $eq: ['$_id', '$$postRef'] },
										// { $in: ['$userRef', [...userFollowing, ObjectID(id)]] },
										{ $eq: ['$status', true] },
									],
								},
							},
						},
						{
							$group: {
								_id: '$$postRef',
								updatedPost: { $max: '$updatedOn' },
							},
						},
					],
					as: 'updatedPost',
				},
			},
			{
				$unwind: {
					path: '$updatedPost',
					preserveNullAndEmptyArrays: true,
				},
			},
			{
				$project: {
					_id: 1,
					text: '$text',
					image: '$image',
					video: '$video',
					thumbnail: '$thumbnail',
					videoWidth: '$videoWidth',
					videoHeight: '$videoHeight',
					type: '$type',
					tags: '$tags',
					likes: { $size: '$likes' },
					comments: { $size: '$comments' },
					isLike: { $cond: [id, checkLike, '$$REMOVE'] },
					addedBy: {
						_id: '$users._id',
						username: '$users.username',
						firstName: '$users.firstName',
						lastName: '$users.lastName',
						image: '$users.image',
						dummyUser: { $ifNull: ['$users.dummyUser',false] },
					},
					priority: {
						$or: [
							{ $eq: ['$users.dummyUser', true] },
							{ $in: ['$userRef', userFollowing] },
							 { $eq: ['$userRef', Types.ObjectId(id)] },
						],
					},
					createdOn: '$createdOn',
					whoLiked: { $cond: [{ $eq: ['$userRef', ObjectID(id)] }, [], '$followersliked.usernames'] },
					time: {
						$cond: {
							if: {
								$gt: ['$updatedLike.updatedLike', '$updatedPost.updatedPost']
							},
							then: '$updatedLike.updatedLike',
							else: '$updatedPost.updatedPost',
						},
					},
				},
			},
			{
				// $sort: { time: -1, priority: -1, createdOn: -1 },
				$sort: {  createdOn: -1 },
			},
			{
				$skip: (page - 1) * limit,
			},
			{
				$limit: limit,
			},
		]);

		return resolve({
			code: 100,
			message: 'success',
			data: list,
			page,
			limit,
			size: list.length,
			format: 'response',
			timestamp: new Date(),
			hasMore: list.length === limit || !1,
		});
	} catch (err) {
		return reject(ResponseUtility.GENERIC_ERR({ message: err.message, error: err }));
	}
});

