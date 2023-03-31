/* eslint-disable no-underscore-dangle */
import { ResponseUtility } from 'appknit-backend-bundle';
import { StripeService } from '../../services';
import {
	SubscriptionModel,
	BrandModel,
} from '../../schemas';
import { SUBSRIPTION_STATUS, MONTH_NAMES_FULL } from '../../constants';
import { PaymentModel as PaymentModelService } from '..';
/**
* @description This service model function is for adding a credit card
* @author Santgurlal Singh
* @since 16 June, 2020
* @param {String} id the unique id of the user
*/

export default ({
	id,
}) => new Promise(async (resolve, reject) => {
	try {
		const brand = await BrandModel.findOne({ _id: id, deleted: false });

		if (!brand || brand.deleted) {
			return reject(ResponseUtility.GENERIC_ERR({ code: 401, message: 'Requested brand not found.' }));
		}

		if (brand.blocked) {
			return reject(ResponseUtility.GENERIC_ERR({ code: 401, message: 'Your account has been blocked by admin.' }));
		}

		const dateNow = new Date().getTime();
		const subscriptionDetails = await PaymentModelService.PaymentPlanDetailsService({ id });
		if (subscriptionDetails.data.status === SUBSRIPTION_STATUS.REQUESTED_TO_CANCEL) {
			const planEndDate = new Date(subscriptionDetails.data.details.current_period_end * 1000);
			const message = `Your account has been successfully downgraded to Starter. Changes will take place from ${planEndDate.getDate()} ${MONTH_NAMES_FULL[planEndDate.getMonth()]}.`;
			return reject(ResponseUtility.SUCCESS({ message }));
		}
		if (subscriptionDetails.data.status === SUBSRIPTION_STATUS.CANCELLED) {
			return reject(ResponseUtility.GENERIC_ERR({ message: 'You don\'t have any active subscriptions.' }));
		}

		const subscription = await StripeService.CancelSubscription({
			subscriptionId: subscriptionDetails.data.details.id,
		});

		await SubscriptionModel.findOneAndUpdate(
			{ _id: subscriptionDetails.data._id },
			{
				cancellationRequested: true,
				cancellationRequestedOn: dateNow,
				endsOn: (subscription.current_period_end * 1000),
			},
		);

		const planEndDate = new Date(subscriptionDetails.data.details.current_period_end * 1000);
		const message = `Your account has been successfully downgraded to Starter. Changes will take place from ${planEndDate.getDate()} ${planEndDate.toLocaleString('default', { month: 'long' })}.`;
		return resolve(ResponseUtility.SUCCESS({ message }));
	} catch (err) {
		return reject(ResponseUtility.GENERIC_ERR({ message: err.message, error: err }));
	}
});
