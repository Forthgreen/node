import { S3Services } from 'appknit-backend-bundle';
import { S3_IMAGES_URL } from '../constants';

/**
 * the consumer function to handle the image delete process.
 * @author SantGurlal Singh
 * @since 13 May, 2021
 *
 * @param {Object} channel is the channel created using AMQP connection
 * application
 * The content payliad that contains the following values:
 * - name: String representing the name of the picture
 */

export default async (name) => {
	try {
		console.log('starting delete');
		const deletePromises = [];
		deletePromises.push(S3Services.removeFile({
			Bucket: S3_IMAGES_URL.SMALL,
			Key: name,
		}));
		deletePromises.push(S3Services.removeFile({
			Bucket: S3_IMAGES_URL.AVERAGE,
			Key: name,
		}));
		deletePromises.push(S3Services.removeFile({
			Bucket: S3_IMAGES_URL.BEST,
			Key: name,
		}));
		await Promise.all(deletePromises);
		console.log('delete done');
	} catch (err) {
		console.log('Error deleting images', err);
	}
};
