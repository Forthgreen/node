import {
	ResponseUtility,
	HashUtility,
} from 'appknit-backend-bundle';
import {
	BrandModel,
} from '../../schemas';

/**
* @description This service model function handles the
* details of brands for self.
* @author Santgurlal Singh
* @since 16 may 2020
* @param {String} id the unique id of brand.
* @param {String} currentPassword the current password of user.
* @param {String} newPassword the new password of user.
*/

export default ({
	id,
	currentPassword,
	newPassword,
}) => new Promise(async (resolve, reject) => {
	try {
		const brand = await BrandModel.findOne({ _id: id });

		if (!brand || brand.deleted) {
			return reject(ResponseUtility.GENERIC_ERR({ code: 401, message: 'Requested brand not found.' }));
		}

		if (brand.blocked) {
			return reject(ResponseUtility.GENERIC_ERR({ code: 401, message: 'Your account has been blocked by admin.' }));
		}

		const passwordMatch = await HashUtility.compare({
			text: currentPassword,
			hash: brand.password,
		});
		if (!passwordMatch) {
			return reject(ResponseUtility.MISSING_PROPS({ message: 'Incorrect Password.' }));
		}

		await BrandModel.findOneAndUpdate({ _id: id },
			{ password: await HashUtility.generate({ text: newPassword }) });

		return resolve(ResponseUtility.SUCCESS({
			message: 'Password Updated Successfully.',
		}));
	} catch (err) {
		return reject(ResponseUtility.GENERIC_ERR({ message: err.message, error: err }));
	}
});
