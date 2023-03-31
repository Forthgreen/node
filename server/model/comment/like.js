/* eslint-disable no-underscore-dangle */
/* eslint-disable guard-for-in */
import { ResponseUtility } from 'appknit-backend-bundle';
import { Types } from 'mongoose';
import {
	UserModel,
	CommentModel,
	LikeModel,
	NotificationModel,
} from '../../schemas';
import { FirebaseNotificationService } from '../../services';
import {
	LIKES_TYPE,
	NOTIFICATION_REF_TYPE,
} from '../../constants';
/**
* @description A service model function to handle the
*  addtion of like in comments by the user
* @param {String} commentRef id of the comment.
* @param {Boolean} like like/unlike the post.
* @author Nikhil Negi
* @since 06-04-2021
*/
export default ({
	id,
	commentRef,
	like = true,
}) => new Promise(async (resolve, reject) => {
	try {
		if (!commentRef) {
			return reject(ResponseUtility.MISSING_PROPS({ message: 'Missing Property commentRef' }));
		}

		const checkUser = await UserModel.findOne({
			_id: id,
			deleted: false,
			blocked: false,
		});

		if (!checkUser) {
			return reject(ResponseUtility.GENERIC_ERR({ code: 401, message: 'Requested user not found.' }));
		}

		const [checkComment] = await CommentModel.aggregate([
			{
				$match: {
					_id: Types.ObjectId(commentRef),
					status: true,
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
					commentRef: '$commentRef',
					fcmToken: '$users.fcmToken',
					device: '$users.device',
					userRef: '$users._id',
				},
			},
		]);

		if (!checkComment) {
			return reject(ResponseUtility.GENERIC_ERR({ message: 'Invalid commentRef.' }));
		}

		const dateNow = new Date().getTime();
		const commentObject = await LikeModel.findOneAndUpdate({
			userRef: id,
			ref: commentRef,
			type: LIKES_TYPE.COMMENT,
		}, {
			status: like,
			updatedOn: dateNow,
		}, { setDefaultsOnInsert: true, upsert: true, new: true });

		let notificationRefType;
		let notificationMessage;
		if (like === true && String(checkComment.userRef) !== String(id)) {
			const payload = {
				user: {
					_id: checkUser._id,
					username: checkUser.username,
					firstName: checkUser.firstName || 'User',
					lastName: checkUser.lastName || '',
					image: checkUser.image || '',
				},
			};

			if (checkComment.commentRef) {
				notificationRefType = NOTIFICATION_REF_TYPE.REPLY_LIKE;
				notificationMessage = 'liked your reply.';
				payload.refType = notificationRefType;
			} else {
				notificationRefType = NOTIFICATION_REF_TYPE.COMMENT_LIKE;
				notificationMessage = 'liked your comment.';
				payload.refType = notificationRefType;
			}

			const deviceTokens = [];
			deviceTokens.push(checkComment.fcmToken)
			const notification = new NotificationModel({
				notifyTo: checkComment.userRef,
				userRef: checkUser._id,
				ref: commentRef,
				refType: notificationRefType,
				message: notificationMessage,
				createdOn: dateNow,
				updatedOn: dateNow,
			});
			await notification.save();

			payload.notificationId = notification._id;
			FirebaseNotificationService({
				deviceTokens,
				device: checkComment.device,
				body: `${checkUser.firstName} ${checkUser.lastName} ${notificationMessage}`,
				title: 'Forthgreen',
				reference: notification._id,
				type: notification.refType,
				payload,
			});
		}

		return resolve(ResponseUtility.SUCCESS({ data: commentObject, message: `Comment ${(like === true) ? 'liked' : 'unlike'} successfully.` }));
	} catch (err) {
		return reject(ResponseUtility.GENERIC_ERR({ message: err.message, error: err }));
	}
});
