import {
	ResponseUtility,
} from 'appknit-backend-bundle';
import { Types } from 'mongoose';
import {
	BlockUserModel,
	UserModel,
} from '../../schemas';

/**
 * @description A service model function to handle the
 * list of user's blockers.
 * @author Hitendra Pratap Singh
 * @since 06-04-2023
 */

export default ({
	id,
	userId,
	isBlocking,
	limit = 20,
	page = 1,
}) => new Promise(async (resolve, reject) => {
	try {
		const user = await UserModel.findOne({ _id: userId || id });

		if (!user || user.deleted) {
			return reject(ResponseUtility.GENERIC_ERR({ code: 401, message: 'Requested user not found.' }));
		}

		if (user.blocked) {
			return reject(ResponseUtility.GENERIC_ERR({ code: 401, message: 'Your account has been blocked by admin.' }));
		}

		let match;
		let lookupQuery;
		let userLocalfield;
		if (isBlocking === true) {
			match = { userRef: userId ? Types.ObjectId(userId) : Types.ObjectId(id) };

			lookupQuery = {
				from: 'blockusers',
				let: {
					localField: '$blockingRef',
				},
				pipeline: [
					{
						$match: {
							$expr: {
								$and: [
									{
										$eq: ['$blockingRef', '$$localField'],
									},
									{
										$eq: ['$userRef', Types.ObjectId(id)],
									},
								],
							},
						},
					},
				],
				as: 'blockers',
			};

			userLocalfield = '$blockingRef';
		} else {
			match = { blockingRef: userId ? Types.ObjectId(userId) : Types.ObjectId(id) };

			lookupQuery = {
				from: 'blockusers',
				let: {
					localField: '$userRef',
				},
				pipeline: [
					{
						$match: {
							$expr: {
								$and: [
									{
										$eq: ['$blockingRef', '$$localField'],
									},
									{
										$eq: ['$userRef', Types.ObjectId(id)],
									},
								],
							},
						},
					},
				],
				as: 'blockers',
			};

			userLocalfield = '$userRef';
		}

		const data = await FollowUserModel.aggregate([
			{
				$match: match,
			},
			{
				$lookup: lookupQuery,
			},
			{
				$unwind: {
					path: '$blockers',
					preserveNullAndEmptyArrays: true,
				},

			},
			{
				$lookup: {
					from: 'users',
					let: {
						localField: userLocalfield,
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
					username: '$users.username',
					bio: '$users.bio',
					firstName: '$users.firstName',
					lastName: '$users.lastName',
					image: '$users.image',
					isFollow: {
						$eq: [Types.ObjectId(id), '$blockers.userRef'],
					},
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
