/* eslint-disable no-underscore-dangle */
/* eslint-disable import/named */
// import { S3Services } from 'appknit-backend-bundle';
import { DeletePictureProcess } from './processes';
/**
 * @description
 * This is the channel that will handle the backend process.
 * The background process must include
 * @author Santgurlal Singh
 * @since 8 May, 2020
 */
export default channel => async (data) => {
	/**
	 * Acknowledge the incoming queue.
	 * Not acknowledging the incoming data will keep the data in
	 * queue and will keep it executing contineously everytime the
	 * RabbitMQ starts.
	 */
	channel.ack(data);
	const {
		name,
	} = JSON.parse(data.content.toString());
	if (name) {
		try {
			await DeletePictureProcess(name);
		} catch (err) {
			console.log(err);
		}
	}
};
