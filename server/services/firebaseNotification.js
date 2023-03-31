/* eslint-disable consistent-return */
/* eslint-disable import/no-extraneous-dependencies */

import {
	ResponseUtility,
} from 'appknit-backend-bundle';
import request from 'request';


/* eslint-disable no-underscore-dangle */
/* eslint-disable global-require */
/**
* This is the indexer for services
* @author Jagmohan Singh
* @since 28 April, 2020
*/
const { FCM_SERVER_KEY } = process.env;


export default ({
	deviceTokens,
	device,
	body,
	title,
	payload,
	reference,
	type,
}) => new Promise((resolve, reject) => {
	try {
		if (!FCM_SERVER_KEY) {
			return reject(ResponseUtility.GENERIC_ERR({ message: 'Missing required FCM_SERVER_KEY environment vraible.' }));
		}

		const headers = {
			'Content-Type': 'application/json',
			Authorization: `key=${FCM_SERVER_KEY}`,
		};

		const data = {
			title,
			body,
			payload,
			reference,
			type,
		};
		const payloadData = {
			registration_ids: deviceTokens,
			priority: 'high',
			timeToLive: 86400,
		};
		Object.assign(payloadData, device === 'android' ? { data } : { notification: data });

		const options = {
			url: 'https://fcm.googleapis.com/fcm/send',
			method: 'POST',
			body: payloadData,
			rejectUnauthorized: false,
			json: true,
			headers,
		};

		request(options, (error, response, result) => {
			if (error) {
				return reject(error);
			}
			resolve(result);
		});
	} catch (err) {
		return reject(ResponseUtility.GENERIC_ERR({ message: err.message, error: err }));
	}
});
