/* eslint-disable no-underscore-dangle */
import {
	ResponseUtility,
} from 'appknit-backend-bundle';
import { NotificationModel, UserModel } from '../../schemas';
/**
* @description A service model function to
* mark notification as read.
* @author Nikhil Negi
* @since 21-04-2021
* @param {String} id unique _id of the user.
* @param {String} notificationId unique _id of the notification.
*/

export default ({
	id,
	notificationId,
}) => new Promise(async (resolve, reject) => {
	try {
		if (!notificationId) {
			return reject(ResponseUtility.MISSING_PROPS({ message: 'Missing Property notificationId!' }));
		}

		const user = await UserModel.findOne({ _id: id });
		if (!user || user.deleted) {
			return reject(ResponseUtility.GENERIC_ERR({ code: 401, message: 'Requested user not found.' }));
		}

		if (user.blocked) {
			return reject(ResponseUtility.GENERIC_ERR({ code: 401, message: 'Your account has been blocked by admin.' }));
		}

		const notificationUpdate = await NotificationModel.findOneAndUpdate({
			_id: notificationId, notifyTo: id, seen: false,
		}, { seen: true }, { new: true });
		if (!notificationUpdate) {
			return reject(ResponseUtility.GENERIC_ERR({ message: 'Invalid notificationId!' }));
		}
		return resolve(ResponseUtility.SUCCESS({ message: 'Notification marked as seen!' }));
	} catch (err) {
		return reject(ResponseUtility.GENERIC_ERR({ message: err.message, error: err }));
	}
});
