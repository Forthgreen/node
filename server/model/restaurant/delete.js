/* eslint-disable guard-for-in */
import {
	ResponseUtility,
} from 'appknit-backend-bundle';
import {
	RestaurantModel,
} from '../../schemas';
/**
* @description A service model function to handle the
* deletion of restaurant.
* @author Santgurlal Singh
* @since 5 Oct, 2020
*/

export default ({
	id,
	restaurantId,
}) => new Promise(async (resolve, reject) => {
	try {
		const deleted = await RestaurantModel.findOneAndUpdate({ _id: restaurantId, deleted: false }, {
			deleted: true,
			deletedOn: new Date(),
		});
		if (!deleted) {
			return reject(ResponseUtility.GENERIC_ERR({ code: 401, message: 'Requested place not found.' }));
		}
		return resolve(ResponseUtility.SUCCESS({}));
	} catch (err) {
		return reject(ResponseUtility.GENERIC_ERR({ message: err.message, error: err }));
	}
});
