import { ResponseUtility } from 'appknit-backend-bundle';
import { Types } from 'mongoose';
import {
	UserModel,
	NotificationModel,
} from '../../schemas';
import { LIKES_TYPE, NOTIFICATION_REF_TYPE } from '../../constants';
/**
 * @description service model function to fetch the details of the post
 * @author Nikhil Negi
 * @since 26-04-2021
 */
export default ({
	id,
	notificationId,
}) => new Promise(async (resolve, reject) => {
	try {

		if (!notificationId) {
			return reject(ResponseUtility.MISSING_PROPS({ message: 'Missing Property postRef' }));
		}

		const user = await UserModel.findOne({ _id: id });

		if (!user || user.deleted) {
			return reject(ResponseUtility.GENERIC_ERR({ code: 401, message: 'Requested user not found.' }));
		}

		if (user.blocked) {
			return reject(ResponseUtility.GENERIC_ERR({ code: 401, message: 'Your account has been blocked by admin.' }));
		}

		const notification = await NotificationModel.findOne({
			_id: notificationId,
			notifyTo: id,
			deleted: false,
		});

		if (!notification) {
			return reject(ResponseUtility.GENERIC_ERR({ code: 302, message: 'Invalid notificationId.' }));
		}

		let query;
		switch (notification.refType) {
			case NOTIFICATION_REF_TYPE.COMMENT:
			//case NOTIFICATION_REF_TYPE.REPLY_COMMENT:
			case NOTIFICATION_REF_TYPE.COMMENT_LIKE:
			case NOTIFICATION_REF_TYPE.TAG_COMMENT:
				query = [
					{
						$match: {
							_id: Types.ObjectId(notificationId),
							deleted: false,
						},
					},
					{
						$lookup: {
							from: 'comments',
							let: { localField: '$ref' },
							pipeline: [
								{
									$match: {
										$expr: {
											$and: [
												{ $eq: ['$_id', '$$localField'] },
												{ $eq: ['$status', true] },
											],
										},
									},
								},
								{
									$lookup: {
										from: 'likes',
										let: { localField: '$_id' },
										pipeline: [
											{
												$match: {
													$expr: {
														$and: [
															{ $eq: ['$type', LIKES_TYPE.COMMENT] },
															{ $eq: ['$ref', '$$localField'] },
															{ $eq: ['$status', true] },
														],
													},
												},
											},
										],
										as: 'likes',
									},
								},
								{
									$lookup: {
										from: 'comments',
										let: { localField: '$_id' },
										pipeline: [
											{
												$match: {
													$expr: {
														$and: [
															{ $eq: ['$commentRef', '$$localField'] },
															{ $eq: ['$status', true] },
														],
													},
												},
											},
										],
										as: 'replies',
									},
								},
								{
									$lookup: {
										from: 'users',
										let: { localField: '$userRef' },
										pipeline: [
											{
												$match: {
													$expr: {
														$and: [
															{ $eq: ['$_id', '$$localField'] },
															{ $eq: ['$deleted', false] },
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
									$lookup: {
										from: 'posts',
										let: { localField: '$postRef' },
										pipeline: [
											{
												$match: {
													$expr: {
														$and: [
															{ $eq: ['$_id', '$$localField'] },
															{ $eq: ['$status', true] },
														],
													},
												},
											},
											{
												$lookup: {
													from: 'likes',
													let: { localField: '$_id' },
													pipeline: [
														{
															$match: {
																$expr: {
																	$and: [
																		{ $eq: ['$type', LIKES_TYPE.POST] },
																		{ $eq: ['$ref', '$$localField'] },
																		{ $eq: ['$status', true] },
																	],
																},
															},
														},
													],
													as: 'likes',
												},
											},
											{
												$lookup: {
													from: 'comments',
													let: { localField: '$_id' },
													pipeline: [
														{
															$match: {
																$expr: {
																	$and: [
																		{ $eq: ['$postRef', '$$localField'] },
																		{ $eq: ['$status', true] },
																	],
																},
															},
														},
													],
													as: 'comments',
												},
											},
											{
												$lookup: {
													from: 'users',
													let: { localField: '$userRef' },
													pipeline: [
														{
															$match: {
																$expr: {
																	$and: [
																		{ $eq: ['$_id', '$$localField'] },
																		{ $eq: ['$deleted', false] },
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
													_id: '$_id',
													text: { $ifNull: ['$text', ''] },
													type: '$type',
													image: { $ifNull: ['$image', []] },
													status: '$status',
													tags: '$tags',
													isLike: { $in: [Types.ObjectId(id), '$likes.userRef'] },
													likes: { $size: '$likes' },
													comments: { $size: '$comments' },
													addedBy: {
														_id: '$users._id',
														username: '$users.username',
														firstName: '$users.firstName',
														lastName: '$users.lastName',
														image: '$users.image',
														dummyUser: { $ifNull: ['$users.dummyUser', false] },
													},
													createdOn: '$createdOn',
													video: { $ifNull: ['$video', ''] },
													thumbnail: { $ifNull: ['$thumbnail', ''] },
													videoWidth: '$videoWidth',
													videoHeight: '$videoHeight',
												},
											},
										],
										as: 'posts',
									},
								},
								{
									$unwind: '$posts',
								},
								{
									$project: {
										_id: '$_id',
										comment: '$comment',
										tags: '$tags',
										status: '$status',
										post: '$posts',
										isLike: { $in: [Types.ObjectId(id), '$likes.userRef'] },
										likes: { $size: '$likes' },
										replies: { $size: '$replies' },
										addedBy: {
											_id: '$users._id',
											username: '$users.username',
											firstName: '$users.firstName',
											lastName: '$users.lastName',
											image: '$users.image',
											dummyUser: { $ifNull: ['$users.dummyUser', false] },

										},
										createdOn: '$createdOn',
									},
								},
							],
							as: 'comments',
						},
					},
					{
						$unwind: '$comments',
					},
					{
						$project: {
							_id: '$_id',
							refType: '$refType',
							posts: {
								_id: '$comments.post._id',
								text: '$comments.post.text',
								video: '$comments.post.video',
								videoWidth: '$comments.post.videoWidth',
								videoHeight: '$comments.post.videoHeight',
								thumbnail: '$comments.post.thumbnail',
								type: '$comments.post.type',
								image: '$comments.post.image',
								tags: '$comments.post.tags',
								status: '$comments.post.status',
								isLike: '$comments.post.isLike',
								likes: '$comments.post.likes',
								comments: '$comments.post.comments',
								comment: {
									_id: '$comments._id',
									comment: '$comments.comment',
									tags: '$comments.tags',
									status: '$comments.status',
									isLike: '$comments.isLike',
									likes: '$comments.likes',
									replies: '$comments.replies',
									addedBy: '$comments.addedBy',
									createdOn: '$comments.createdOn',
								},
								addedBy: '$comments.post.addedBy',
								createdOn: '$comments.post.createdOn',
							},
						},
					},
				];
				break;
			case NOTIFICATION_REF_TYPE.REPLY_COMMENT:
			case NOTIFICATION_REF_TYPE.REPLY_LIKE:
				query = [
					{
						$match: {
							_id: Types.ObjectId(notificationId),
							deleted: false,
						},
					},
					{
						$lookup: {
							from: 'comments',
							let: { localField: '$ref' },
							pipeline: [
								{
									$match: {
										$expr: {
											$and: [
												{ $eq: ['$_id', '$$localField'] },
												{ $eq: ['$status', true] },
											],
										},
									},
								},
								{
									$lookup: {
										from: 'likes',
										let: { localField: '$_id' },
										pipeline: [
											{
												$match: {
													$expr: {
														$and: [
															{ $eq: ['$type', LIKES_TYPE.COMMENT] },
															{ $eq: ['$ref', '$$localField'] },
															{ $eq: ['$status', true] },
														],
													},
												},
											},
										],
										as: 'replyLikes',
									},
								},
								{
									$lookup: {
										from: 'users',
										let: { localField: '$userRef' },
										pipeline: [
											{
												$match: {
													$expr: {
														$and: [
															{ $eq: ['$_id', '$$localField'] },
															{ $eq: ['$deleted', false] },
														],
													},
												},
											},
										],
										as: 'replyBy',
									},
								},
								{
									$unwind: '$replyBy',
								},
								{
									$lookup: {
										from: 'comments',
										let: { localField: '$commentRef' },
										pipeline: [
											{
												$match: {
													$expr: {
														$and: [
															{ $eq: ['$_id', '$$localField'] },
															{ $eq: ['$status', true] },
														],
													},
												},
											},
											{
												$lookup: {
													from: 'likes',
													let: { localField: '$_id' },
													pipeline: [
														{
															$match: {
																$expr: {
																	$and: [
																		{ $eq: ['$type', LIKES_TYPE.COMMENT] },
																		{ $eq: ['$ref', '$$localField'] },
																		{ $eq: ['$status', true] },
																	],
																},
															},
														},
													],
													as: 'likes',
												},
											},
											{
												$lookup: {
													from: 'comments',
													let: { localField: '$_id' },
													pipeline: [
														{
															$match: {
																$expr: {
																	$and: [
																		{ $eq: ['$commentRef', '$$localField'] },
																		{ $eq: ['$status', true] },
																	],
																},
															},
														},
													],
													as: 'replies',
												},
											},
											{
												$lookup: {
													from: 'posts',
													let: { localField: '$postRef' },
													pipeline: [
														{
															$match: {
																$expr: {
																	$and: [
																		{ $eq: ['$_id', '$$localField'] },
																		{ $eq: ['$status', true] },
																	],
																},
															},
														},
														{
															$lookup: {
																from: 'likes',
																let: { localField: '$_id' },
																pipeline: [
																	{
																		$match: {
																			$expr: {
																				$and: [
																					{ $eq: ['$type', LIKES_TYPE.POST] },
																					{ $eq: ['$ref', '$$localField'] },
																					{ $eq: ['$status', true] },
																				],
																			},
																		},
																	},
																],
																as: 'likes',
															},
														},
														{
															$lookup: {
																from: 'comments',
																let: { localField: '$_id' },
																pipeline: [
																	{
																		$match: {
																			$expr: {
																				$and: [
																					{ $eq: ['$postRef', '$$localField'] },
																					{ $eq: ['$status', true] },
																				],
																			},
																		},
																	},
																],
																as: 'comments',
															},
														},
														{
															$lookup: {
																from: 'users',
																let: { localField: '$userRef' },
																pipeline: [
																	{
																		$match: {
																			$expr: {
																				$and: [
																					{ $eq: ['$_id', '$$localField'] },
																					{ $eq: ['$deleted', false] },
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
																_id: '$_id',
																text: { $ifNull: ['$text', ''] },
																type: '$type',
																image: { $ifNull: ['$image', []] },
																tags: '$tags',
																status: '$status',
																isLike: { $in: [Types.ObjectId(id), '$likes.userRef'] },
																likes: { $size: '$likes' },
																comments: { $size: '$comments' },
																addedBy: {
																	_id: '$users._id',
																	username: '$users.username',
																	firstName: '$users.firstName',
																	lastName: '$users.lastName',
																	image: '$users.image',
																	dummyUser: { $ifNull: ['$users.dummyUser', false] },
																},
																createdOn: '$createdOn',
																video: { $ifNull: ['$video', ''] },
																videoWidth: '$videoWidth',
																videoHeight: '$videoHeight',
																thumbnail: { $ifNull: ['$thumbnail', ''] },
															},
														},
													],
													as: 'posts',
												},
											},
											{
												$unwind: '$posts',
											},
											{
												$lookup: {
													from: 'users',
													let: { localField: '$userRef' },
													pipeline: [
														{
															$match: {
																$expr: {
																	$and: [
																		{ $eq: ['$_id', '$$localField'] },
																		{ $eq: ['$deleted', false] },
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
													_id: '$_id',
													comment: '$comment',
													tags: '$tags',
													status: '$status',
													post: '$posts',
													isLike: { $in: [Types.ObjectId(id), '$likes.userRef'] },
													likes: { $size: '$likes' },
													replies: { $size: '$replies' },
													addedBy: {
														_id: '$users._id',
														username: '$users.username',
														firstName: '$users.firstName',
														lastName: '$users.lastName',
														image: '$users.image',
														dummyUser: { $ifNull: ['$users.dummyUser', false] },
													},
													createdOn: '$createdOn',
												},
											},
										],
										as: 'comments',
									},
								},
								{
									$unwind: '$comments',
								},
								{
									$project: {
										_id: '$_id',
										comment: '$comment',
										tags: '$tags',
										comments: '$comments',
										status: '$status',
										isLike: { $in: [Types.ObjectId(id), '$replyLikes.userRef'] },
										likes: { $size: '$replyLikes' },
										addedBy: {
											_id: '$replyBy._id',
											username: '$replyBy.username',
											firstName: '$replyBy.firstName',
											lastName: '$replyBy.lastName',
											image: '$replyBy.image',
											dummyUser: { $ifNull: ['$replyBy.dummyUser', false] },
										},
										createdOn: '$createdOn',
									},
								},
							],
							as: 'reply',
						},
					},
					{
						$unwind: '$reply',
					},
					{
						$project: {
							_id: '$_id',
							refType: '$refType',
							posts: {
								_id: '$reply.comments.post._id',
								text: '$reply.comments.post.text',
								video: '$reply.comments.post.video',
								videoWidth: '$reply.post.videoWidth',
								videoHeight: '$reply.post.videoHeight',
								thumbnail: '$reply.comments.post.thumbnail',
								tags: '$reply.comments.post.tags',
								type: '$reply.comments.post.type',
								image: '$reply.comments.post.image',
								status: '$reply.comments.post.status',
								isLike: '$reply.comments.post.isLike',
								likes: '$reply.comments.post.likes',
								comments: '$reply.comments.post.comments',
								comment: {
									_id: '$reply.comments._id',
									comment: '$reply.comments.comment',
									tags: '$reply.comments.tags',
									status: '$reply.comments.status',
									isLike: '$reply.comments.isLike',
									likes: '$reply.comments.likes',
									replies: '$reply.comments.replies',
									addedBy: '$reply.comments.addedBy',
									createdOn: '$reply.comments.createdOn',
									reply: {
										_id: '$reply._id',
										comment: '$reply.comment',
										tags: '$reply.tags',
										status: '$reply.status',
										isLike: '$reply.isLike',
										likes: '$reply.likes',
										addedBy: '$reply.addedBy',
										createdOn: '$reply.createdOn',
									},
								},
								addedBy: '$reply.comments.post.addedBy',
								createdOn: '$reply.comments.post.createdOn',
							},
						},
					},
				];
				break;
			case NOTIFICATION_REF_TYPE.POST_LIKE:
			case NOTIFICATION_REF_TYPE.TAG_POST:
				query = [
					{
						$match: {
							_id: Types.ObjectId(notificationId),
							deleted: false,
						},
					},
					{
						$lookup: {
							from: 'posts',
							let: { localField: '$ref' },
							pipeline: [
								{
									$match: {
										$expr: {
											$and: [
												{ $eq: ['$_id', '$$localField'] },
												{ $eq: ['$status', true] },
											],
										},
									},
								},
								{
									$lookup: {
										from: 'likes',
										let: { localField: '$_id' },
										pipeline: [
											{
												$match: {
													$expr: {
														$and: [
															{ $eq: ['$type', LIKES_TYPE.POST] },
															{ $eq: ['$ref', '$$localField'] },
															{ $eq: ['$status', true] },
														],
													},
												},
											},
										],
										as: 'likes',
									},
								},
								{
									$lookup: {
										from: 'comments',
										let: { localField: '$_id' },
										pipeline: [
											{
												$match: {
													$expr: {
														$and: [
															{ $eq: ['$postRef', '$$localField'] },
															{ $eq: ['$status', true] },
														],
													},
												},
											},
										],
										as: 'comments',
									},
								},
								{
									$lookup: {
										from: 'users',
										let: { localField: '$userRef' },
										pipeline: [
											{
												$match: {
													$expr: {
														$and: [
															{ $eq: ['$_id', '$$localField'] },
															{ $eq: ['$deleted', false] },
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
										_id: '$_id',
										text: { $ifNull: ['$text', ''] },
										tags: '$tags',
										type: '$type',
										image: { $ifNull: ['$image', []] },
										status: '$status',
										isLike: { $in: [Types.ObjectId(id), '$likes.userRef'] },
										likes: { $size: '$likes' },
										comments: { $size: '$comments' },
										addedBy: {
											_id: '$users._id',
											username: '$users.username',
											firstName: '$users.firstName',
											lastName: '$users.lastName',
											image: '$users.image',
											dummyUser: { $ifNull: ['$users.dummyUser', false] },
										},
										createdOn: '$createdOn',
										video: { $ifNull: ['$video', ''] },
										videoWidth: '$videoWidth',
										videoHeight: '$videoHeight',
										thumbnail: { $ifNull: ['$thumbnail', ''] },
									},
								},
							],
							as: 'posts',
						},
					},
					{
						$unwind: '$posts',
					},
					{
						$project: {
							_id: '$_id',
							refType: '$refType',
							posts: '$posts',
						},
					},
				];
				break;
			case NOTIFICATION_REF_TYPE.FOLLOWING:
				query = [
					{
						$match: {
							_id: Types.ObjectId(notificationId),
							deleted: false,
						},
					},
					{
						$lookup: {
							from: 'users',
							let: { localField: '$ref' },
							pipeline: [
								{
									$match: {
										$expr: {
											$and: [
												{ $eq: ['$_id', '$$localField'] },
												{ $eq: ['$deleted', false] },
												{ $eq: ['$blocked', false] },
											],
										},
									},
								},
								{
									$lookup: {
										from: 'followusers',
										let: { userRef: '$_id' },
										pipeline: [
											{
												$match: {
													$expr: {
														$and: [
															{ $eq: ['$followingRef', '$$userRef'] },
														],
													},
												},
											},
										],
										as: 'followers',
									},
								},
								{
									$project: {
										_id: '$_id',
										username: '$username',
										firstName: '$firstName',
										lastName: '$lastName',
										image: '$image',
										isFollow: { $in: [Types.ObjectId(id), '$followers.userRef'] },
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
							_id: '$_id',
							refType: '$refType',
							follower: '$users',
						},
					},
				];
				break;
			default:
				query = [];
		}

		const data = await NotificationModel.aggregate([query]);
		await NotificationModel.findOneAndUpdate({
			_id: notificationId,
			notifyTo: id,
			seen: false,
		}, { seen: true });

		return resolve(ResponseUtility.SUCCESS({ data }));
	} catch (err) {
		return reject(ResponseUtility.GENERIC_ERR({ message: err.message, error: err.error }));
	}
});
