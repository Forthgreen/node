/* eslint-disable import/named */
/**
 * @description This service model function is for post's/comment's likes listing
 * @author Nikhil Negi
 * @since 22-07-2021
*/
import { ResponseUtility } from 'appknit-backend-bundle';
import { Types } from 'mongoose';
import {
	LikeModel,
} from '../../schemas';
import {
	PAGINATION_LIMIT,
	LIKES_TYPE,
} from '../../constants';

export default ({
	id,
	ref,
	likeType = LIKES_TYPE.POST,
	limit = PAGINATION_LIMIT,
	page = 1,
}) => new Promise(async (resolve, reject) => {
	try {
		if (!ref) {
			return reject(ResponseUtility.GENERIC_ERR({ message: 'Missing required field ref' }));
		}

		const list = await LikeModel.aggregate([
			{
				$match: {
					ref: Types.ObjectId(ref),
					status: true,
					type: likeType,
				},
			},
			{
				$lookup: {
					from: 'users',
					let: { local: '$userRef' },
					pipeline: [
						{
							$match: {
								$expr: {
									$and: [
										{ $eq: ['$_id', '$$local'] },
										{ $eq: ['$deleted', false] },
										{ $eq: ['$blocked', false] },
									],
								},
							},
						},
						{
							$lookup: {
								from: 'followusers',
								let: { local: '$_id' },
								pipeline: [
									{
										$match: {
											$expr: {
												$and: [
													{ $eq: ['$userRef', Types.ObjectId(id)] },
													{ $eq: ['$followingRef', '$$local'] },
												],
											},
										},
									},
								],
								as: 'following',
							},
						},
						{
							$unwind: {
								path: '$following',
								preserveNullAndEmptyArrays: true,
							},
						},
						{
							$project: {
								_id: '$_id',
								firstName: { $ifNull: ['$firstName', ''] },
								lastName: { $ifNull: ['$lastName', ''] },
								image: { $ifNull: ['$image', ''] },
								isFollowing: { $cond: ['$following._id', true, false] },
								dummyUser: { $ifNull: ['$dummyUser', false] },
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
				$project: {
					_id: '$users._id',
					firstName: '$users.firstName',
					lastName: '$users.lastName',
					image: '$users.image',
					isFollowing: '$users.isFollowing',
					dummyUser: '$users.dummyUser',
				},
			},
			{ $sort: { createdOn: -1 } },
			{ $skip: (page - 1) * limit },
			{ $limit: limit },
		]);
		return resolve(ResponseUtility.SUCCESS_PAGINATION({ data: list, page, limit }));
	} catch (err) {
		return reject(ResponseUtility.GENERIC_ERR({ message: err.message, error: err }));
	}
});
