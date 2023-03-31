/* eslint-disable no-underscore-dangle */
import {
	ResponseUtility,
} from 'appknit-backend-bundle';
import {
	FollowUserModel,
	UserModel,
	NotificationModel,
} from '../../schemas';
import { FirebaseNotificationService } from '../../services';
import { NOTIFICATION_REF_TYPE } from '../../constants';

/**
 * @description A service model function to handle the following of user
 * @param {String} userRef the uique id of a user.
 * @param {Boolean} status follow/unfollow.
 * @author Nikhil Negi
 * @since 16-04-2021
 */

export default ({
	id,
	followingRef,
	follow,
}) => new Promise(async (resolve, reject) => {
	try {
		if (!followingRef || typeof follow !== 'boolean') {
			return reject(ResponseUtility.MISSING_PROPS({ message: `Missing property ${followingRef ? 'follow' : 'followingRef'}.` }));
		}

		const user = await UserModel.findOne({ _id: id });

		if (!user || user.deleted) {
			return reject(ResponseUtility.GENERIC_ERR({ code: 401, message: 'Requested user not found.' }));
		}

		if (user.blocked) {
			return reject(ResponseUtility.GENERIC_ERR({ code: 401, message: 'Your account has been blocked by admin.' }));
		}

		const followingInfo = await UserModel.findOne({
			_id: followingRef,
			deleted: false,
			blocked: false,
		});

		if (!followingInfo) {
			return reject(ResponseUtility.GENERIC_ERR({ message: 'Invalid followingRef.' }));
		}

		const userFollow = await FollowUserModel.findOne({
			userRef: id,
			followingRef,
		});

		const dateNow = new Date().getTime();

		if (follow) {
			if (userFollow) {
				return reject(ResponseUtility.GENERIC_ERR({ message: 'You are already following this user.' }));
			}
			const followuserObject = new FollowUserModel({
				userRef: id,
				followingRef,
				createdOn: dateNow,
				updatedOn: dateNow,
			});
			await followuserObject.save();

			const notification = new NotificationModel({
				notifyTo: followingRef,
				userRef: user._id,
				ref: user._id,
				refType: NOTIFICATION_REF_TYPE.FOLLOWING,
				message: 'started following you.',
				createdOn: dateNow,
				updatedOn: dateNow,
			});
			await notification.save();

			const deviceTokens = [];
			deviceTokens.push(followingInfo.fcmToken);
			await FirebaseNotificationService({
				deviceTokens,
				device: followingInfo.device,
				body: `${user.firstName || 'User'} started following you.`,
				title: 'Forthgreen',
				reference: user._id,
				type: NOTIFICATION_REF_TYPE.FOLLOWING,
				payload: {
					notificationId: notification._id,
					userRef: user._id,
					refType: NOTIFICATION_REF_TYPE.FOLLOWING,
					user: {
						_id: user._id,
						username: user.username,
						firstName: user.firstName || 'User',
						lastName: user.lastName || '',
						image: user.image || '',
					},
				},
			});
		} else {
			if (!userFollow) {
				return reject(ResponseUtility.GENERIC_ERR({ message: 'You are not following this user.' }));
			}

			await FollowUserModel.findOneAndRemove({ _id: userFollow._id });
		}

		return resolve(ResponseUtility.SUCCESS({ message: 'Follow status updated.' }));
	} catch (err) {
		return reject(ResponseUtility.GENERIC_ERR({ message: err.message, error: err }));
	}
});
