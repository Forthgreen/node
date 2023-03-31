import { S3Services } from 'appknit-backend-bundle';
import { S3_IMAGES } from '../constants';

/**
 * the consumer function to handle the video upload process.
 * @author Nikhil Negi
 * @since 22-05-2021
 * application
 * The content payload that contains the following values:
 * - name: String representing the name of the picture
 * - video: bytes[] representing the original video.
 */

export default async (name, video) => {

	try {
		const buffer = Buffer.from(video.data);

		await S3Services.uploadPublicObject({
			Bucket: S3_IMAGES.VIDEO,
			Key: name,
			data: buffer,
		});
	} catch (err) {
		global.logger.info('Error uploading video', err);
	}
};