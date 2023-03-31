import {
	ResponseUtility,
} from 'appknit-backend-bundle';

import {
	CreditCardModel,
	BrandModel,
} from '../../schemas';

import { MONTH_NAMES } from '../../constants';

/**
* @description This service model function is to get
* credit card details of a user
* @author Santgurlal Singh
* @since 16 june, 2020
* @param {String} id the unique id of the user
*/

export default ({
	id,
}) => new Promise(async (resolve, reject) => {
	try {
		if (!id) {
			return reject(ResponseUtility.GENERIC_ERR({ message: 'There is missing required property id.' }));
		}
		const user = await BrandModel.findOne({ _id: id });

		if (!user || user.deleted) {
			return reject(ResponseUtility.GENERIC_ERR({ code: 401, message: 'Requested brand not found.' }));
		}

		if (user.blocked) {
			return reject(ResponseUtility.GENERIC_ERR({ code: 401, message: 'Your account has been blocked by admin.' }));
		}

		const creditCard = await CreditCardModel.findOne({ userRef: id, deleted: false },
			{
				stripeToken: 0,
				stripeId: 0,
			});
		if (!creditCard) {
			return reject(ResponseUtility.GENERIC_ERR({ message: 'Can not find any cards.' }));
		}

		const expiresOn = `${MONTH_NAMES[creditCard.expiryMonth - 1]} ${creditCard.expiryYear}`;

		return resolve(ResponseUtility.SUCCESS({
			data: {
				...creditCard._doc,
				expiresOn,
			}
		}));
	} catch (err) {
		return reject(ResponseUtility.GENERIC_ERR({ message: err.message, error: err }));
	}
});
