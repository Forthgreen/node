import {
	ResponseUtility, SchemaMapperUtility,
} from 'appknit-backend-bundle';
import {
	PostModel,
	CommentModel,
} from '../../schemas';
import {
	AMQP_QUEUES,
	DELETED_BY,
} from '../../constants';
/**
* @description service model function to delete
* a specific post and its properties from the application
* @author Nikhil Negi
* @since 24-04-2021
*/

export default ({
	postId,
	AMQPChannel,
}) => new Promise(async (resolve, reject) => {
	try {
		if (!postId) {
			return reject(ResponseUtility.MISSING_PROPS({ message: 'Missing Property postId' }));
		}
		const post = await PostModel.findOne({ _id: postId, status: true });
		if (!post) {
			return reject(ResponseUtility.NO_USER({ message: 'postId not found' }));
		}

		const updateschema = await SchemaMapperUtility({
			status: false,
			deletedOn: new Date(),
			deletedBy: DELETED_BY.ADMIN,
		});

		post.image.forEach((element) => {
			AMQPChannel.sendToQueue(
				AMQP_QUEUES.PICTURE_DELETE,
				Buffer.from(JSON.stringify({
					name: element,
				})),
			);
		});
		await PostModel.update({ _id: postId, status: true }, updateschema);
		await CommentModel.update({ postRef: postId, status: true }, updateschema);
		return resolve(ResponseUtility.SUCCESS({ message: 'Success in deletion of post' }));
	} catch (err) {
		return reject(ResponseUtility.GENERIC_ERR({ message: err, error: err }));
	}
});
