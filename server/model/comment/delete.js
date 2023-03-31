/* eslint-disable no-underscore-dangle */
import {
	ResponseUtility,
} from 'appknit-backend-bundle';
import {
	UserModel,
	CommentModel,
	NotificationModel,
} from '../../schemas';
import {
	DELETED_BY,
} from '../../constants';

/**
* @description This service model function handles the
* delete a comment of the user
* @author Nikhil Negi
* @since 09-04-2021
* @param {String} id the unique id of user.
* @param {String} commentRef the unique id of comment.
*/

export default ({
	id,
	commentRef,
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

		const commentReply = (await CommentModel.find({
			commentRef,
		}, {
			_id: 1,
		}) || []).map(doc => doc._id);

		const dateNow = new Date().getTime();
		const comment = await CommentModel.findOneAndUpdate({
			_id: commentRef,
			userRef: id,
			status: true,
		},
		{
			status: false,
			deletedBy: DELETED_BY.SELF,
			deletedOn: dateNow,
		});
		if (!comment) {
			return reject(ResponseUtility.GENERIC_ERR({ message: 'No comment found.' }));
		}

		await CommentModel.updateMany({
			_id: { $in: commentReply },
			status: true,
		}, {
			deletedBy: DELETED_BY.AUTHOR,
			status: false,
			deletedOn: dateNow
		});

		await NotificationModel.updateMany({
			$or: [{ ref: commentRef }, { ref: { $in: commentReply } }],
		}, { deleted: true, deletedOn: dateNow });
		return resolve(ResponseUtility.SUCCESS({ message: 'Comment Removed Successfully.' }));
	} catch (err) {
		return reject(ResponseUtility.GENERIC_ERR({ message: err.message, error: err }));
	}
});
