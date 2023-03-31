import {
	ResponseUtility,
} from 'appknit-backend-bundle';
import {
	WebsiteClickModel,
} from '../../schemas';

/**
* @description A service model function to handle the
* website click to a product.
* @param {String} id the unique id of a user.
* @param {String} productRef the uique id of a product.
* @author Santgurlal Singh
* @since 18 June, 2020
*/


export default ({
	id,
	productRef,
}) => new Promise(async (resolve, reject) => {
	try {
		const dateNow = new Date().getTime();
		if (!productRef) {
			return reject(ResponseUtility.GENERIC_ERR({ message: 'Missing productRef.' }));
		}
		const WebsiteClickObject = new WebsiteClickModel({
			productRef,
			userRef: id,
			createdOn: dateNow,
			updatedOn: dateNow,
		});
		await WebsiteClickObject.save();
		return resolve(ResponseUtility.SUCCESS({}));
	} catch (err) {
		return reject(ResponseUtility.GENERIC_ERR({ message: err.message, error: err }));
	}
});
