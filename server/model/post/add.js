/* eslint-disable no-await-in-loop */
/* eslint-disable no-restricted-syntax */
/* eslint-disable no-underscore-dangle */
/* eslint-disable guard-for-in */
import {
	ResponseUtility,
	RandomCodeUtility,
} from 'appknit-backend-bundle';
import {
	FollowUserModel,
	PostModel,
	UserModel,
	NotificationModel,
} from '../../schemas';
import {
	NODE_ENV,
	MAX_IMAGES_FOR_POST,
	POST_TYPES,
	NOTIFICATION_REF_TYPE,
} from '../../constants';
import { ImageUploadUtility } from '../../utility';
import VideoUploadUtility from '../../utility/videoUpload';
import { FirebaseNotificationService } from '../../services';
import mime from 'mime-types';


/**
* @description A service model function to handle the
*  addtion of new post by the user
* @param {String} text text to share as post.
* @param {file} images images to share as post.
* @author Nikhil Negi
* @since 01-04-2021
*/
export default ({
	id,
	text,
	images,
	videoWidth,
	videoHeight,
	video,
	tags = [],
	thumbnailImage,
}) => new Promise(async (resolve, reject) => {
	try {
		if (!text && !images && !video) {
			return reject(ResponseUtility.MISSING_PROPS({ message: 'Missing Property either text, images or video!' }));
		}
		let postType;
		if (text && video) {
            postType = POST_TYPES.VIDEO_WITH_TEXT;
        }
        else if (text && images) {
            postType = POST_TYPES.IMAGE_WITH_TEXT;
        } else if (images) {
            postType = POST_TYPES.IMAGE;
        } else if (video) {
            postType = POST_TYPES.VIDEO;
        }
        else{
            postType = POST_TYPES.TEXT;
        }
		const userInfo = await UserModel.findOne({
			_id: id,
			deleted: false,
			blocked: false,
		});

		if (!userInfo) {
			return reject(ResponseUtility.GENERIC_ERR({ code: 401, message: 'Requested user not found.' }));
		}

		const imageNames = [];
		if (images) {
			if (Object.keys(images).length > MAX_IMAGES_FOR_POST) {
				return reject(ResponseUtility.GENERIC_ERR({ message: `Cannot upload more than ${MAX_IMAGES_FOR_POST} images` }));
			}

			for (const key in images) {
				const imageName = `${NODE_ENV}-${Date.now() * RandomCodeUtility(3)}`;
				await ImageUploadUtility(imageName, images[key]);
				imageNames.push(imageName);
			}
		}

		let videoName = '';
		let thumbnailName = '';
		if (video) {
			if (thumbnailImage) {
				thumbnailName = `${Date.now() * RandomCodeUtility(3)}`;
				await ImageUploadUtility(thumbnailName, thumbnailImage);
			}
			videoName = `${Date.now() * RandomCodeUtility(3)}.${mime.extension(video.mimetype)}`;
			await VideoUploadUtility(videoName, video);
		}
		const dateNow = new Date().getTime();
		const addedBy = {
			_id: userInfo._id,
			username: userInfo.username,
			firstName: userInfo.firstName,
			lastName: userInfo.lastName,
			image: userInfo.image,
		};

		const postObject = new PostModel({
			userRef: id,
			text,
			type: postType,
			tags,
			image: imageNames,
			video: videoName,
			thumbnail: thumbnailName,
			createdOn: dateNow,
			updatedOn: dateNow,
			videoWidth,
			videoHeight,
		});
		await postObject.save();
		delete postObject._doc.deletedOn;
		delete postObject._doc.deletedBy;
		delete postObject._doc.userRef;
		postObject._doc.addedBy = addedBy;

		if (tags.length > 0) {
			for (const tag of tags) {
				const checkUserTag = await UserModel.findOne({
					_id: tag._id,
				});
				if (checkUserTag) {
					const notificationTaggedId = new NotificationModel({
						notifyTo: tag._id,
						userRef: userInfo._id,
						ref: postObject._id,
						refType: NOTIFICATION_REF_TYPE.TAG_POST,
						message: 'tagged you in a Post.',
						createdOn: dateNow,
						updatedOn: dateNow,
					});
					notificationTaggedId.save();

					if (checkUserTag && checkUserTag.device && checkUserTag.fcmToken) {
						FirebaseNotificationService({
							deviceTokens: [checkUserTag.fcmToken],
							device: checkUserTag.device,
							body: `${userInfo.firstName} tagged you in a Post.`,
							title: 'Forthgreen',
							reference: notificationTaggedId._id,
							type: NOTIFICATION_REF_TYPE.TAG_POST,
							payload: {
								notificationId: notificationTaggedId._id,
								user: {
									_id: userInfo._id,
									username: userInfo.username,
									firstName: userInfo.firstName || 'User',
									lastName: userInfo.lastName || '',
									image: userInfo.image || '', 
								},
							},
						});
					}
				}
			}
		}

// Notification to following user


		const payload = {
			user: {
				_id: userInfo._id,
				username: userInfo.username,
				firstName: userInfo.firstName || 'User',
				lastName: userInfo.lastName || '',
				image: userInfo.image || '', 
			},
		};

		let notificationRefType;
		let notificationMessage;
		let notifyTo;
		const deviceTokens = [];
		let device;
		let etetette;
		notificationRefType = NOTIFICATION_REF_TYPE.POST_ADD;
		notificationMessage = 'created a post.';
		const followUsers = await FollowUserModel.find({
			userRef: id,
		});
		console.log(followUsers)
		if (followUsers) {
			for (const followUser of followUsers) {
				const checkUser = await UserModel.findOne({
					_id: followUser.followingRef,
				});
				if (checkUser) {
					const notificationFollowId = new NotificationModel({
						notifyTo: followUser.followingRef,
						userRef: followUser.userRef,
						ref: postObject._id,
						refType: notificationRefType,
						message: notificationMessage,
						createdOn: dateNow,
						updatedOn: dateNow,
					});
					notificationFollowId.save();

					payload.refType = notificationRefType;
					payload.notificationId = notificationFollowId._id;
					if (checkUser && checkUser.device && checkUser.fcmToken) {
						// console.log('hhhhhhhhhhhhhhhhhhh')
						FirebaseNotificationService({
							deviceTokens: [checkUser.fcmToken],
							device: checkUser.device,
							body: `${userInfo.firstName} created a post.`,
							title: 'Forthgreen',
							reference: notificationFollowId._id,
							type: notificationRefType,
							payload,
						});
					}
				}
			}
		}
// end notification
		return resolve(ResponseUtility.SUCCESS({ data: postObject._doc, message: 'Post added successfully.' }));
	} catch (err) {
		return reject(ResponseUtility.GENERIC_ERR({ message: err.message, error: err }));
	}
});
