import {
	ResponseUtility,
} from 'appknit-backend-bundle';
import { Types } from 'mongoose';
import {
	PostModel,
	UserModel,
	CommentModel,
} from '../../schemas';
import {
	LIKES_TYPE,
	LIMIT,
} from '../../constants';

/**
* @description This service model function handles the
* listing the comments of the particular post
* @author Nikhil Negi
* @since 10-04-2021
* @param {String} id the unique id of user.
* @param {String} postRef post's comment.
* @param {String} commentRef comment's replies.
*/

export default ({
	id,
	postRef,
	commentRef,
	page = 1,
	limit = LIMIT.COMMENTS,
}) => new Promise(async (resolve, reject) => {
	try {
		if (!postRef) {
			return reject(ResponseUtility.MISSING_PROPS({ message: 'Missing Property postRef.' }));
		}
		const checkUser = await UserModel.findOne({
			_id: id,
			deleted: false,
			blocked: false,
		});

		if (!checkUser) {
			return reject(ResponseUtility.GENERIC_ERR({ code: 401, message: 'Requested user not found.' }));
		}

		const checkPost = await PostModel.findOne({
			_id: postRef,
			status: true,
		});

		if (!checkPost) {
			return reject(ResponseUtility.GENERIC_ERR({ code: 401, message: 'Invalid PostRef.' }));
		}

		if (commentRef) {
			limit = LIMIT.REPLIES
		}

		const list = await CommentModel.aggregate([
			{
				$match: {
					postRef: Types.ObjectId(postRef),
					commentRef: commentRef ? Types.ObjectId(commentRef) : null,
					status: true,
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
										{ $eq: ['$commentRef', '$$localField'] },
										{ $eq: ['$status', true] },
									],
								},
							},
						},
					],
					as: 'replies',
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
										{ $eq: ['$type', LIKES_TYPE.COMMENT] },
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
					from: 'users',
					localField: 'userRef',
					foreignField: '_id',
					as: 'users',
				},
			},
			{
				$unwind: '$users',
			},
			{
				$sort: { createdOn: 1 },
			},
			{
				$skip: (page - 1) * limit,
			},
			{
				$limit: limit,
			},
			{
				$project: {
					_id: 1,
					comment: '$comment',
					reply: { $size: '$replies' },
					likes: { $size: '$likes' },
					tags: '$tags',
					isLike: {
						$in: [Types.ObjectId(id), '$likes.userRef'],
					},
					addedBy: {
						_id: '$users._id',
						username: '$users.username',
						firstName: '$users.firstName',
						lastName: '$users.lastName',
						image: '$users.image',
						dummyUser: { $ifNull: ['$users.dummyUser', false] },
					},
					createdOn: '$createdOn',
				},
			},
		]);
		return resolve(ResponseUtility.SUCCESS_PAGINATION({
			data: list,
			page,
			limit,
		}));
	} catch (err) {
		return reject(ResponseUtility.GENERIC_ERR({ message: err.message, error: err }));
	}
});
