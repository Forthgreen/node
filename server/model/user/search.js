import {
	ResponseUtility,
} from 'appknit-backend-bundle';
import { Types } from 'mongoose';
import {
	UserModel,
} from '../../schemas';

/**
* @description This service model function handles the
* searching the particular user by name, username and email
* @author Nikhil Negi
* @since 22-04-2021
* @param {String} id the unique id of user.
* @param {String} text the search text.
*/

export default ({
	id,
	text,
	page = 1,
	limit = 15,
}) => new Promise(async (resolve, reject) => {
	try {
		const userInfo = await UserModel.findOne({
			_id: id,
			deleted: false,
			blocked: false,
		});

		if (!userInfo) {
			return reject(ResponseUtility.GENERIC_ERR({ code: 401, message: 'Requested user not found.' }));
		}

		const findUser = await UserModel.aggregate([
			{
				$match: {
					$and: [
						{
							$or: [
								{ firstName: { $regex: new RegExp(text, 'i') } },
								{ lastName: { $regex: new RegExp(text, 'i') } },
								{ username: { $regex: new RegExp(text, 'i') } },
							],
						},
						{
							deleted: false,
						},
						{
							blocked: false,
						},
						{
							_id: { $ne: Types.ObjectId(id) },
						},
					],
				},
			},
			{
				$addFields: {
					tmpOrder: { '$rand': {} },
				},
			},
			{
				$sort: {
					tmpOrder: 1,
				},
			},
			{
				$lookup: {
					from: 'followusers',
					let: {
						localField: '$_id',
					},
					pipeline: [
						{
							$match: {
								$expr: {
									$and: [
										{
											$eq: ['$followingRef', '$$localField'],
										},
										{
											$eq: ['$userRef', Types.ObjectId(id)],
										},
									],
								},
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
				$lookup: {
					from: 'blockusers',
					let: {
						localField: '$_id',
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
				},
			},
			{
				$unwind: {
					path: '$blockers',
					preserveNullAndEmptyArrays: true,
				},

			},

			{
				$skip: (page - 1) * limit,
			},
			{
				$limit: limit,
			},
			{
				$project: {
					_id: '$_id',
					username: '$username',
					email: '$email',
					firstName: '$firstName',
					lastName: '$lastName',
					image: '$image',
					bio: '$bio',
					dummyUser: { $ifNull: ['$dummyUser', false] },
					isFollow: {
						$cond: ['$followers', true, false],
					},
					isBlock: {
						$cond: ['$blockers', true, false],
					},
				},
			},
		]);
		return resolve(ResponseUtility.SUCCESS_PAGINATION({
			data: findUser,
			page,
			limit,
		}));
	} catch (err) {
		return reject(ResponseUtility.GENERIC_ERR({ message: err.message, error: err }));
	}
});
