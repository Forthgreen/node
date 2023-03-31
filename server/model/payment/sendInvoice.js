import { ResponseUtility } from 'appknit-backend-bundle';
import {
	BrandModel,
} from '../../schemas';
import { TemplateMailService } from '../../services';
import { MONTH_NAMES_FULL } from '../../constants';
/**
* @description This service model function is for sending billing invoice
* to user email
* @author Santgurlal Singh
* @since 17 June, 2020
* @param {String} id the unique id of the user
*/

export default ({
	id,
	transactionId,
	date,
	card,
	amount,
}) => new Promise(async (resolve, reject) => {
	try {
		const brand = await BrandModel.findOne({ _id: id });
		if (!brand || brand.deleted) {
			return reject(ResponseUtility.GENERIC_ERR({ code: 401, message: 'Requested brand not found.' }));
		}

		if (brand.blocked) {
			return reject(ResponseUtility.GENERIC_ERR({ code: 401, message: 'Your account has been blocked by admin.' }));
		}

		const dateObject = new Date(date);
		const dateString = `${MONTH_NAMES_FULL[dateObject.getMonth()]} ${dateObject.getDate()}, ${dateObject.getFullYear()}`;

		await TemplateMailService.SendInvoice({
			to: brand.email,
			transactionId,
			cardLast4: card.last4,
			cardType: card.brand,
			amount,
			date: dateString,
		});
		return resolve(ResponseUtility.SUCCESS({ message: 'Invoice Sent Successfully.' }));
	} catch (err) {
		return reject(ResponseUtility.GENERIC_ERR({ message: err.message, error: err }));
	}
});
