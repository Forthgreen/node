import { ResponseUtility } from 'appknit-backend-bundle';
import { StripeService } from '../../services';
import {
	BrandModel,
} from '../../schemas';
/**
* @description This service model function is for listing transactions of user
* @author Santgurlal Singh
* @since 16 June, 2020
* @param {String} id the unique id of the user
*/

export default ({
	id,
}) => new Promise(async (resolve, reject) => {
	try {
		const user = await BrandModel.findOne({ _id: id });
		if (!user || user.deleted) {
			return reject(ResponseUtility.GENERIC_ERR({ code: 401, message: 'Requested brand not found.' }));
		}

		if (user.blocked) {
			return reject(ResponseUtility.GENERIC_ERR({ code: 401, message: 'Your account has been blocked by admin.' }));
		}
		const transactions = await StripeService.ListTransactions({
			customerId: user.stripeCustomerId,
		});
		return resolve(ResponseUtility.SUCCESS({ data: transactions.data }));
	} catch (err) {
		return reject(ResponseUtility.GENERIC_ERR({ message: err.message, error: err }));
	}
});
