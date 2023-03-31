import {
	ResponseUtility, SchemaMapperUtility,
} from 'appknit-backend-bundle';
import {
	CommentModel,
} from '../../schemas';
import {
	DELETED_BY,
} from '../../constants';
/**
* @description service model function to delete
* a specific comment and its replies from the posts
* @author Nikhil Negi
* @since 24-04-2021
*/

export default ({
	commentId,
}) => new Promise(async (resolve, reject) => {
	try {
		if (!commentId) {
			return reject(ResponseUtility.MISSING_PROPS({ message: 'Missing Property commentId' }));
		}
		const comment = await CommentModel.findOne({ _id: commentId, status: true });
		if (!comment) {
			return reject(ResponseUtility.NO_USER({ message: 'commentId not found' }));
		}

		const updateschema = await SchemaMapperUtility({
			status: false,
			deletedOn: new Date(),
			deletedBy: DELETED_BY.ADMIN,
		});

		await CommentModel.update({ _id: commentId, status: true }, updateschema);
		await CommentModel.update({ commentRef: commentId, status: true }, updateschema);

		return resolve(ResponseUtility.SUCCESS({ message: 'Success in deletion of comment' }));
	} catch (err) {
		return reject(ResponseUtility.GENERIC_ERR({ message: err, error: err }));
	}
});
