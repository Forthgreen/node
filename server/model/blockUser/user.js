/* eslint-disable no-underscore-dangle */
import {
	ResponseUtility,
} from 'appknit-backend-bundle';
import {
	BlockUserModel,
	UserModel,
	NotificationModel,
} from '../../schemas';
import { FirebaseNotificationService } from '../../services';
import { NOTIFICATION_REF_TYPE } from '../../constants';

/**
 * @description A service model function to handle the blocking of user
 * @param {String} userRef the uique id of a user.
 * @param {Boolean} status block/unblock.
 * @author Hitendra Pratap Singh
 * @since 06-04-2023
 */

export default ({
	id,
	blockingRef,
	block,
}) => new Promise(async (resolve, reject) => {
	try {
		if (!blockingRef || typeof block !== 'boolean') {
			return reject(ResponseUtility.MISSING_PROPS({ message: `Missing property ${blockingRef ? 'block' : 'blockingRef'}.` }));
		}

		const user = await UserModel.findOne({ _id: id });

		if (!user || user.deleted) {
			return reject(ResponseUtility.GENERIC_ERR({ code: 401, message: 'Requested user not found.' }));
		}

		if (user.blocked) {
			return reject(ResponseUtility.GENERIC_ERR({ code: 401, message: 'Your account has been blocked by admin.' }));
		}

		const blockingInfo = await UserModel.findOne({
			_id: blockingRef,
			deleted: false,
			blocked: false,
		});

		if (!blockingInfo) {
			return reject(ResponseUtility.GENERIC_ERR({ message: 'Invalid blockingRef.' }));
		}

		const userBlock = await BlockUserModel.findOne({
			userRef: id,
			blockingRef,
		});

		const dateNow = new Date().getTime();

		if (block) {
			if (userBlock) {
				return reject(ResponseUtility.GENERIC_ERR({ message: 'You are already blocking this user.' }));
			}
			const blockuserObject = new BlockUserModel({
				userRef: id,
				blockingRef,
				createdOn: dateNow,
				updatedOn: dateNow,
			});
			await blockuserObject.save();

			// const notification = new NotificationModel({
			// 	notifyTo: blockingRef,
			// 	userRef: user._id,
			// 	ref: user._id,
			// 	refType: NOTIFICATION_REF_TYPE.FOLLOWING,
			// 	message: 'started blocking you.',
			// 	createdOn: dateNow,
			// 	updatedOn: dateNow,
			// });
			// await notification.save();

			// const deviceTokens = [];
			// deviceTokens.push(blockingInfo.fcmToken);
			// await FirebaseNotificationService({
			// 	deviceTokens,
			// 	device: blockingInfo.device,
			// 	body: `${user.firstName || 'User'} started blocking you.`,
			// 	title: 'Forthgreen',
			// 	reference: user._id,
			// 	type: NOTIFICATION_REF_TYPE.FOLLOWING,
			// 	payload: {
			// 		notificationId: notification._id,
			// 		userRef: user._id,
			// 		refType: NOTIFICATION_REF_TYPE.FOLLOWING,
			// 		user: {
			// 			_id: user._id,
			// 			username: user.username,
			// 			firstName: user.firstName || 'User',
			// 			lastName: user.lastName || '',
			// 			image: user.image || '',
			// 		},
			// 	},
			// });

			
		} else {
			if (!userBlock) {
				return reject(ResponseUtility.GENERIC_ERR({ message: 'You are not blocking this user.' }));
			}

			await BlockUserModel.findOneAndRemove({ _id: userBlock._id });
		}

		return resolve(ResponseUtility.SUCCESS({ message: 'Block status updated.' }));
	} catch (err) {
		return reject(ResponseUtility.GENERIC_ERR({ message: err.message, error: err }));
	}
});
