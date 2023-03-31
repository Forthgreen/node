import {
	ResponseUtility, SchemaMapperUtility,
} from 'appknit-backend-bundle';
import {
	UserModel,
	FollowBrandModel,
	RateAndReviewModel,
	ReportModel,
	PostModel,
	FollowUserModel,
	CommentModel,
	NotificationModel,
} from '../../schemas';
import {
	AMQP_QUEUES,
	DELETED_BY,
} from '../../constants';
/**
* @description service model function to delete
* a specific user and its properties from the application
* @author Abhinav Sharma
* @since 2 June, 2020
*/

export default ({
	userId,
	AMQPChannel,
}) => new Promise(async (resolve, reject) => {
	try {
		if (!userId) {
			return reject(ResponseUtility.MISSING_PROPS({ message: 'Missing Property userId' }));
		}
		const user = await UserModel.findOne({ _id: userId, deleted: false });
		if (!user) {
			return reject(ResponseUtility.NO_USER({ message: 'Requested user not found' }));
		}

		AMQPChannel.sendToQueue(
			AMQP_QUEUES.PICTURE_DELETE,
			Buffer.from(JSON.stringify({
				name: user.image,
			})),
		);

		const updateschema = await SchemaMapperUtility({
			status: false,
			deletedOn: new Date(),
			deletedBy: DELETED_BY.ADMIN,
		});
		const userPost = await PostModel.find({ userRef: userId, status: true });
		userPost.forEach((post) => {
			post.image.forEach((element) => {
				AMQPChannel.sendToQueue(
					AMQP_QUEUES.PICTURE_DELETE,
					Buffer.from(JSON.stringify({
						name: element,
					})),
				);
			});
		});
		await PostModel.update({ userRef: userId }, updateschema);
		await CommentModel.update({ userRef: userId, status: true }, updateschema);
		await FollowUserModel.deleteMany({ userRef: userId });
		await FollowUserModel.deleteMany({ followingRef: userId });
		await NotificationModel.update({ userRef: userId, deleted: false }, { deleted: true, deletedOn: new Date() });

		const userUpdate = await SchemaMapperUtility({
			deleted: true,
			updatedOn: new Date(),
		});
		await UserModel.findOneAndUpdate({ _id: userId }, userUpdate, { new: true });
		await RateAndReviewModel.deleteMany({ userRef: userId });
		const followUpdate = await SchemaMapperUtility({
			status: false,
			updatedOn: new Date(),
		});
		await FollowBrandModel.findOneAndUpdate({ userRef: userId }, followUpdate, { new: true });
		await ReportModel.deleteMany({ userRef: userId });
		return resolve(ResponseUtility.SUCCESS({ message: 'Success in deletion of User' }));
	} catch (err) {
		return reject(ResponseUtility.GENERIC_ERR({ message: err, error: err }));
	}
});
