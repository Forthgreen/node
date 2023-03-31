/* eslint-disable no-await-in-loop */
/* eslint-disable no-restricted-syntax */
/* eslint-disable prefer-destructuring */
/* eslint-disable max-len */
/* eslint-disable no-underscore-dangle */
import { ResponseUtility } from 'appknit-backend-bundle';
import { Types } from 'mongoose';
import {
	UserModel,
	CommentModel,
	PostModel,
	NotificationModel,
} from '../../schemas';
import { FirebaseNotificationService } from '../../services';
import {
	NOTIFICATION_REF_TYPE,
} from '../../constants';
/**
* @description A service model function to handle the
*  addtion of comment or reply to particular to the post by the user
* @param {String} comment the comment of a user.
* @param {String} postRef the post in which user comment.
* @param optional {String} commentRef the comment in which user replies.
* @author Nikhil Negi
* @since 08-04-2021
*/
export default ({
	id,
	postRef,
	comment,
	commentRef,
	tags = [],
}) => new Promise(async (resolve, reject) => {
	try {
		if (!postRef || !comment) {
			return reject(ResponseUtility.MISSING_PROPS({ message: `Missing required Property ${postRef ? 'comment' : 'postRef'}.` }));
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
			return reject(ResponseUtility.GENERIC_ERR({ message: 'Invalid postRef.' }));
		}

		let checkCommentExist;
		if (commentRef) {
			[checkCommentExist] = await CommentModel.aggregate([
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
						fcmToken: '$users.fcmToken',
						device: '$users.device',
						userRef: '$users._id',
					},
				},
			]);
			if (!checkCommentExist) {
				return reject(ResponseUtility.GENERIC_ERR({ message: 'Invalid commentRef' }));
			}
		}

		const dateNow = new Date().getTime();
		const addedBy = {
			_id: checkUser._id,
			username: checkUser.username,
			firstName: checkUser.firstName,
			lastName: checkUser.lastName,
			image: checkUser.image,
		};

		const commentObject = new CommentModel({
			userRef: id,
			postRef,
			comment,
			tags,
			commentRef: commentRef || null,	// if user replies comment's
			createdOn: dateNow,
			updatedOn: dateNow,
		});
		await commentObject.save();
		delete commentObject._doc.deletedOn;
		delete commentObject._doc.deletedBy;
		commentObject._doc.commentRef = (commentObject._doc.commentRef) ? commentObject._doc.commentRef : '';
		commentObject._doc.addedBy = addedBy;
		const payload = {
			user: {
				_id: checkUser._id,
				username: checkUser.username,
				firstName: checkUser.firstName || 'User',
				lastName: checkUser.lastName || '',
				image: checkUser.image || '',
			},
		};

//  get all comments list
		
		const commentListObject = await CommentModel.find({
			postRef:postRef,
		}).distinct("userRef");

		const postUsers = await UserModel.findOne({
			_id: checkPost.userRef,
			deleted: false,
			blocked: false,
		});

		for (const commentListVal of commentListObject) {
			
			if ((commentListVal.toString() != payload.user._id.toString()) && (commentListVal.toString() != postUsers._id.toString()) ){

				const anothercommentUsers = await UserModel.findOne({
					_id: commentListVal.toString(),
					deleted: false,
					blocked: false,
					});
		
		//////////////////////////////////////////////////////////////////////

					const notificationCommentId = new NotificationModel({
						notifyTo: commentListVal.toString(),
						userRef: checkUser._id,
						ref: commentObject._id,
						refType: NOTIFICATION_REF_TYPE.COMMENT,
						message: `made a comment on ${postUsers.firstName} post.`,
						createdOn: dateNow,
						updatedOn: dateNow,
					});
					notificationCommentId.save();

					// console.log(notificationCommentId._id);
					// console.log(notificationCommentId);
		
					payload.refType = NOTIFICATION_REF_TYPE.COMMENT;
					payload.notificationId = notificationCommentId._id;
					payload.postId = postRef;
					payload.commentId = commentObject.userRef.toString();
					payload.firstName = checkUser.firstName;
					// payload.anothercommentUsers = anothercommentUsers._id;
					// payload.postUsers = postUsers._id;
					// payload.commentObject = commentObject._id;
					if (anothercommentUsers && anothercommentUsers.device && anothercommentUsers.fcmToken) {
						FirebaseNotificationService({
							deviceTokens: [anothercommentUsers.fcmToken],
							device: anothercommentUsers.device,
							body: `${checkUser.firstName} made a comment on ${postUsers.firstName} post.`,
							title: 'Forthgreen',
							reference: notificationCommentId._id,
							type: NOTIFICATION_REF_TYPE.COMMENT,
							payload,
						});
					}
		
		////////////////////////////////////////////////////////////////////////////

			}

		}

// end get all comments list
	
		let notificationRefType;
		let notificationMessage;
		let notifyTo;
		const deviceTokens = [];
		let device;
		if (commentObject.commentRef) {
			notificationRefType = NOTIFICATION_REF_TYPE.REPLY_COMMENT;
			notificationMessage = 'replied to your comment.';
			notifyTo = checkCommentExist.userRef;
			deviceTokens.push(checkCommentExist.fcmToken);
			device = checkCommentExist.device;
			payload.refType = notificationRefType;
		} else {
			notificationRefType = NOTIFICATION_REF_TYPE.COMMENT;
			notificationMessage = 'made a comment in your post.';
			notifyTo = checkPost.userRef;
			deviceTokens.push(checkPost.fcmToken);
			device = checkPost.device;
			payload.refType = notificationRefType;
		}

		if (String(notifyTo) !== String(id)) {
			const notification = new NotificationModel({
				notifyTo,
				userRef: checkUser._id,
				ref: commentObject._id,
				refType: notificationRefType,
				message: notificationMessage,
				createdOn: dateNow,
				updatedOn: dateNow,
			});
			await notification.save();

			payload.notificationId = notification._id;
			FirebaseNotificationService({
				deviceTokens,
				device,
				body: `${checkUser.firstName} ${checkUser.lastName} ${notificationMessage}`,
				title: 'Forthgreen',
				reference: notification._id,
				type: notification.refType,
				payload,
			});
		}

		if (tags.length > 0) {
			for (const tag of tags) {
				const checkUserTag = await UserModel.findOne({
					_id: tag._id,
				});
				if (checkUserTag) {
					const notificationTaggedId = new NotificationModel({
						notifyTo: tag._id,
						userRef: checkUser._id,
						ref: commentObject._id,
						refType: NOTIFICATION_REF_TYPE.TAG_COMMENT,
						message: 'tagged you in a comment.',
						createdOn: dateNow,
						updatedOn: dateNow,
					});
					notificationTaggedId.save();

					payload.notificationId = notificationTaggedId._id;
					if (checkUserTag && checkUserTag.device && checkUserTag.fcmToken) {
						FirebaseNotificationService({
							deviceTokens: checkUserTag.fcmToken,
							device: checkUserTag.device,
							body: `${checkUser.firstName} tagged you in a comment.`,
							title: 'Forthgreen',
							reference: notificationTaggedId._id,
							type: NOTIFICATION_REF_TYPE.TAG_COMMENT,
							payload,
						});
					}

					
				}
			}
		}
		// console.log(payload);
		return resolve(ResponseUtility.SUCCESS({ data: commentObject._doc, message: 'Comment added successfully.' }));
	} catch (err) {
		return reject(ResponseUtility.GENERIC_ERR({ message: err.message, error: err }));
	}
});
