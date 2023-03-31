/* eslint-disable no-underscore-dangle */
import {
	ResponseUtility,
} from 'appknit-backend-bundle';
import { Types } from 'mongoose';
import {
	PostModel,
	UserModel,
	NotificationModel,
	CommentModel,
} from '../../schemas';
import {
	AMQP_QUEUES,
	DELETED_BY,
} from '../../constants';

/**
* @description This service model function handles the
* delete a post of the user
* @author Nikhil Negi
* @since 02-04-2021
* @param {String} id the unique id of brand.
* @param {String} productRef the unique id of product.
*/

export default ({
	id,
	postRef,
	AMQPChannel,
}) => new Promise(async (resolve, reject) => {
	try {
		if (!postRef) {
			return reject(ResponseUtility.MISSING_PROPS({ message: 'Missing Property postRef' }));
		}
		const postComments = (await CommentModel.find({
			postRef,
		}, {
			_id: 1,
		}) || []).map(doc => doc._id);

		const userInfo = await UserModel.findOne({
			_id: id,
			deleted: false,
			blocked: false,
		});

		if (!userInfo) {
			return reject(ResponseUtility.GENERIC_ERR({ code: 401, message: 'Requested user not found.' }));
		}

		const checkPost = await PostModel.findOne({
			_id: Types.ObjectId(postRef),
			status: true,
		});

		if (!checkPost) {
			return reject(ResponseUtility.GENERIC_ERR({ code: 404, message: 'No post found.' }));
		}

		if (String(checkPost.userRef) !== id) {
			return reject(ResponseUtility.GENERIC_ERR({ message: 'You cannot delete this post.' }));
		}

		const dateNow = new Date().getTime();
		const post = await PostModel.findOneAndUpdate({
			_id: postRef,
			userRef: id,
			status: true,
		},
		{
			status: false,
			deletedBy: DELETED_BY.SELF,
			deletedOn: dateNow,
		});
		if (!post) {
			return reject(ResponseUtility.GENERIC_ERR({ message: 'No post found.' }));
		}

		post.image.forEach((element) => {
			AMQPChannel.sendToQueue(
				AMQP_QUEUES.PICTURE_DELETE,
				Buffer.from(JSON.stringify({
					name: element,
				})),
			);
		});

		await NotificationModel.updateMany({
			$or: [{ ref: { $in: postComments } }, { ref: postRef }],
			deleted: false,
		}, { deleted: true, deletedOn: new Date() });

		return resolve(ResponseUtility.SUCCESS({ message: 'Post Removed Successfully.' }));
	} catch (err) {
		return reject(ResponseUtility.GENERIC_ERR({ message: err.message, error: err }));
	}
});
