import { ResponseUtility } from 'appknit-backend-bundle';
import { StripeService } from '../../services';
import {
	BrandModel,
	CreditCardModel,
	SubscriptionModel,
	UsedCouponModel,
} from '../../schemas';
import {
	STRIPE_PRODUCT_ID, SUBSRIPTION_STATUS,
} from '../../constants';
import { PaymentModel as PaymentModelService } from '..';
/**
* @description This service model function is for adding a credit card
* @author Santgurlal Singh
* @since 12 June, 2020
* @param {String} id the unique id of the user
* @param {String} stripeToken the stripe token of the credit card
* @param {Boolean} useExistingCard the boolean that tells us to use existing card
* @param {String} coupon the coupon code
*/

export default ({
	id,
	stripeToken,
	useExistingCard = false,
	coupon,
}) => new Promise(async (resolve, reject) => {
	try {
		if (!(useExistingCard || stripeToken)) {
			return reject(ResponseUtility.GENERIC_ERR({ message: 'Some required property missing.' }));
		}
		if (coupon) {
			const couponDetails = await PaymentModelService.PaymentCouponDetailsService({ coupon });
			if ((couponDetails.code !== 100) || (couponDetails.data && !couponDetails.data.valid)) {
				return reject(ResponseUtility.GENERIC_ERR({ message: 'Invalid Coupon.' }));
			}
			const couponAlreadyUsed = await UsedCouponModel.findOne({ userRef: id, coupon });
			if (couponAlreadyUsed) {
				return reject(ResponseUtility.GENERIC_ERR({ message: 'You have already used this coupon.' }));
			}
		}
		const dateNow = new Date().getTime();
		const subscriptionDetails = await PaymentModelService.PaymentPlanDetailsService({ id });
		if (subscriptionDetails.data.status === SUBSRIPTION_STATUS.REQUESTED_TO_CANCEL
			|| subscriptionDetails.data.status === SUBSRIPTION_STATUS.ACTIVE) {
			return reject(ResponseUtility.GENERIC_ERR({ message: 'You already have an active subscription.' }));
		}
		const user = await BrandModel.findOne({ _id: id });
		if (!user || user.deleted) {
			return reject(ResponseUtility.GENERIC_ERR({ code: 401, message: 'Requested brand not found.' }));
		}

		if (user.blocked) {
			return reject(ResponseUtility.GENERIC_ERR({ code: 401, message: 'Your account has been blocked by admin.' }));
		}
		if (useExistingCard) {
			const { stripeCustomerId } = user;
			if (!stripeCustomerId) {
				return reject(ResponseUtility.GENERIC_ERR({ message: 'User not registered with stripe.' }));
			}
			const existingCard = await CreditCardModel.findOne({ userRef: id, deleted: false });
			if (!existingCard) {
				return reject(ResponseUtility.GENERIC_ERR({ message: 'You don\'t have any existing card on this account.' }));
			}
		} else {
			let { stripeCustomerId } = user;
			if (!stripeCustomerId) {
				const stripeUser = await StripeService.CreateUser({ email: user.email });
				const updateQuery = {
					stripeCustomerId: stripeUser.altered.id,
				};
				await BrandModel.updateOne({ _id: id }, updateQuery);
				stripeCustomerId = stripeUser.altered.id;
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
		}
		const userUpdated = await BrandModel.findOneAndUpdate({ _id: id }, { isPremium: true });
		const subscription = await StripeService.CreateSubscription({
			customerId: userUpdated.stripeCustomerId, planId: STRIPE_PRODUCT_ID, coupon,
		});
		if (coupon) {
			const usedCouponObject = new UsedCouponModel({
				userRef: id,
				coupon,
				createdOn: dateNow,
				updatedOn: dateNow,
			});
			await usedCouponObject.save();
		}
		const SubscriptionObject = new SubscriptionModel({
			userRef: id,
			productId: STRIPE_PRODUCT_ID,
			stripeResponse: subscription,
			createdOn: dateNow,
			updatedOn: dateNow,
		});
		await SubscriptionObject.save();
		return resolve(ResponseUtility.SUCCESS({ message: 'Plan upgraded Successfully.' }));
	} catch (err) {
		return reject(ResponseUtility.GENERIC_ERR({ message: err.message, error: err }));
	}
});
