import { ResponseUtility } from 'appknit-backend-bundle';
import { StripeService } from '../../services';
import {
	BrandModel,
	CreditCardModel,
} from '../../schemas';
/**
* @description This service model function is for changing credit card of user
* @author Santgurlal Singh
* @since 21 June, 2020
* @param {String} id the unique id of the user
* @param {String} stripeToken the stripe token of the credit card
*/

export default ({
	id,
	stripeToken,
}) => new Promise(async (resolve, reject) => {
	try {
		const dateNow = new Date().getTime();
		if (!stripeToken) {
			return reject(ResponseUtility.GENERIC_ERR({ message: 'Some required property missing.' }));
		}
		const user = await BrandModel.findOne({ _id: id });

		if (!user || user.deleted) {
			return reject(ResponseUtility.GENERIC_ERR({ code: 401, message: 'Requested brand not found.' }));
		}

		if (user.blocked) {
			return reject(ResponseUtility.GENERIC_ERR({ code: 401, message: 'Your account has been blocked by admin.' }));
		}
		const { stripeCustomerId } = user;
		if (!stripeCustomerId) {
			return reject(ResponseUtility.GENERIC_ERR({ message: 'User not registered with stripe.' }));
		}
		const source = await StripeService.CreateSource({
			customer: stripeCustomerId, source: stripeToken,
		});
		const creditCard = await CreditCardModel.findOne({
			userRef: id, deleted: false,
		});
		if (creditCard) {
			await CreditCardModel.findOneAndUpdate({
				// eslint-disable-next-line no-underscore-dangle
				_id: creditCard._id,
			},
			{
				deleted: true,
			});
			await StripeService.DeleteSource({
				customer: user.stripeCustomerId, source: creditCard.stripeId,
			});
		}
		const CreditCardObject = new CreditCardModel({
			userRef: id,
			stripeToken,
			stripeId: source.id,
			lastDigitsOfCard: source.last4,
			cardType: source.brand,
			country: source.country,
			expiryMonth: source.exp_month,
			expiryYear: source.exp_year,
			createdOn: dateNow,
			updatedOn: dateNow,
		});
		await CreditCardObject.save();
		return resolve(ResponseUtility.SUCCESS({ message: 'Card changed Successfully.' }));
	} catch (err) {
		return reject(ResponseUtility.GENERIC_ERR({ message: err.message, error: err }));
	}
});
