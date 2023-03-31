import { S3Services } from 'appknit-backend-bundle';
import { S3_IMAGES_URL } from '../../constants';

/**
 * the consumer function to handle the image delete process.
 * @author Santgurlal Singh
 * @since 8 May, 2020
 *
 * @param {Object} channel is the channel created using AMQP connection
 * application
 * The content payliad that contains the following values:
 * - name: String representing the name of the picture
 */
export default async (name) => {
	try {
		console.log('starting delete');
		await S3Services.removeFile({
			Bucket: S3_IMAGES_URL.SMALL,
			Key: name,
		});
		await S3Services.removeFile({
			Bucket: S3_IMAGES_URL.AVERAGE,
			Key: name,
		});
		await S3Services.removeFile({
			Bucket: S3_IMAGES_URL.BEST,
			Key: name,
		});
		console.log('delete done');
	} catch (err) {
		console.log(err);
	}
};
