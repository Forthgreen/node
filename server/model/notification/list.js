import {
	ResponseUtility,
} from 'appknit-backend-bundle';
import { Types } from 'mongoose';
import {
	NotificationModel,
	UserModel,
} from '../../schemas';
import { MAX_NOTIFY_MONTH, NOTIFICATION_REF_TYPE, LIMIT } from '../../constants';

/**
 * @description A service model function to handle the
 * list of user's followers.
 * @author Nikhil Negi
 * @since 19-04-2021
 */

export default ({
	id,
	limit = LIMIT.NOTIFICATION,
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

		const date = new Date();
		date.setMonth(date.getMonth() - MAX_NOTIFY_MONTH)
		const data = await NotificationModel.aggregate([
			{
				$match: {
					notifyTo: Types.ObjectId(id),
					createdOn: { $gte: date },
					deleted: false,
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
					_id: 1,
					message: '$message',
					seen: '$seen',
					ref: '$ref',
					refType: '$refType',
					createdOn: '$createdOn',
					username: '$users.username',
					name: { $concat: ['$users.firstName', ' ', '$users.lastName'] },
					image: '$users.image',
				},
			},
			{
				$sort: { createdOn: -1 },
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
