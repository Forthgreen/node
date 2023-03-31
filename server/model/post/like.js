/* eslint-disable no-underscore-dangle */
/* eslint-disable guard-for-in */
import { ResponseUtility } from 'appknit-backend-bundle';
import { Types } from 'mongoose';
import {
	PostModel,
	UserModel,
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
*  addtion of like in post by the user
* @param {String} postRef id of the post.
* @param {Boolean} like like/unlike the post.
* @author Nikhil Negi
* @since 06-04-2021
*/
export default ({
	id,
	postRef,
	like = true,
}) => new Promise(async (resolve, reject) => {
	try {
		if (!postRef) {
			return reject(ResponseUtility.MISSING_PROPS({ message: 'Missing Property postRef' }));
		}

		const checkUser = await UserModel.findOne({
			_id: id,
			deleted: false,
			blocked: false,
		});

		if (!checkUser) {
			return reject(ResponseUtility.GENERIC_ERR({ code: 401, message: 'Requested user not found.' }));
		}

		const [checkPost] = await PostModel.aggregate([
			{
				$match: {
					_id: Types.ObjectId(postRef),
					status: true,
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
				$project: {
					_id: 1,
					fcmToken: '$users.fcmToken',
					device: '$users.device',
					userRef: '$users._id',
				},
			},
		]);

		if (!checkPost) {
			return reject(ResponseUtility.GENERIC_ERR({ code: 401, message: 'Invalid postRef.' }));
		}

		const dateNow = new Date().getTime();
		const postObject = await LikeModel.findOneAndUpdate({
			userRef: id,
			ref: postRef,
			type: LIKES_TYPE.POST,
		}, {
			status: like,
			updatedOn: dateNow,
		}, { setDefaultsOnInsert: true, upsert: true, new: true });

		if (like === true && String(checkPost.userRef) !== String(id)) {
			const notification = new NotificationModel({
				notifyTo: checkPost.userRef,
				userRef: checkUser._id,
				ref: postRef,
				refType: NOTIFICATION_REF_TYPE.POST_LIKE,
				message: 'liked your post.',
				createdOn: dateNow,
				updatedOn: dateNow,
			});
			await notification.save();

			const deviceTokens = [];
			deviceTokens.push(checkPost.fcmToken)
			FirebaseNotificationService({
				deviceTokens,
				device: checkPost.device,
				body: `${checkUser.firstName || 'User'} liked your post.`,
				title: 'Forthgreen',
				reference: notification._id,
				type: NOTIFICATION_REF_TYPE.POST_LIKE,
				payload: {
					notificationId: notification._id,
					refType: NOTIFICATION_REF_TYPE.POST_LIKE,
					user: {
						_id: checkUser._id,
						username: checkUser.username,
						firstName: checkUser.firstName || 'User',
						lastName: checkUser.lastName || '',
						image: checkUser.image || '',
						video: checkUser.video || '',

					},
				},
			});
		}

		return resolve(ResponseUtility.SUCCESS({ data: postObject, message: `Post ${(like === true) ? 'liked' : 'unlike'} successfully.` }));
	} catch (err) {
		return reject(ResponseUtility.GENERIC_ERR({ message: err.message, error: err }));
	}
});
