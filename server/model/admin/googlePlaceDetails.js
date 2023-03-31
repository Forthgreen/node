/* eslint-disable no-underscore-dangle */
import { ResponseUtility } from 'appknit-backend-bundle';
import request from 'request-promise';
import { PLACE_API_KEY } from '../../constants';

/**
* @description service model function to fetch the details of a place from google API
* @author Santgurlal Singh
* @since 10 Sep, 2020
*/

export default ({
	placeId,
}) => new Promise(async (resolve, reject) => {
	try {
		const payload = {
			url: `https://maps.googleapis.com/maps/api/place/details/json?place_id=${placeId}&fields=geometry&key=${PLACE_API_KEY}`,
			method: 'GET',
			'Content-Type': 'application/json',
		};
		request(payload, (error, response, body) => {
			if (error) {
				return resolve(ResponseUtility.GENERIC_ERR({
					message: error,
				}));
			}
			const data = JSON.parse(body);
			const { result: { geometry: { location: { lat, lng } = {} } = {} } = {} } = data;
			return resolve(ResponseUtility.SUCCESS({
				data: { lat, lng },
			}));
		});
	} catch (err) {
		return reject(ResponseUtility.GENERIC_ERR({ message: err.message, error: err }));
	}
});
