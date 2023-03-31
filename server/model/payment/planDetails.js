/* eslint-disable no-underscore-dangle */
import { ResponseUtility } from 'appknit-backend-bundle';
import { StripeService } from '../../services';
import {
	SubscriptionModel,
	BrandModel,
} from '../../schemas';
import {
	SUBSRIPTION_STATUS,
} from '../../constants';
/**
* @description This service model function is for checking if user has an active plan
* @author Santgurlal Singh
* @since 16 June, 2020
* @param {String} id the unique id of the user
*/

export default ({
	id,
}) => new Promise(async (resolve, reject) => {
	try {
		const response = {
			status: SUBSRIPTION_STATUS.CANCELLED,
		};
		const alreadySubscribed = await SubscriptionModel.findOne({
			userRef: id,
			isActive: true,
		});
		if (alreadySubscribed) {
			const subscriptionDetails = await StripeService.SubscriptionDetails({
				subscriptionId: alreadySubscribed.stripeResponse.id,
			});
			response.details = subscriptionDetails;
			if (subscriptionDetails.status !== 'active') {
				await SubscriptionModel.findOneAndUpdate(
					{ _id: alreadySubscribed._id }, { isActive: false },
				);
				await BrandModel.findOneAndUpdate(
					{ _id: id, deleted: false, blocked: false }, { isPremium: false },
				);
				response.status = SUBSRIPTION_STATUS.CANCELLED;
			} else if (alreadySubscribed.cancellationRequested) {
				response._id = alreadySubscribed._id;
				response.status = SUBSRIPTION_STATUS.REQUESTED_TO_CANCEL;
			} else {
				response._id = alreadySubscribed._id;
				response.status = SUBSRIPTION_STATUS.ACTIVE;
			}
		}
		return resolve(ResponseUtility.SUCCESS({ data: response }));
	} catch (err) {
		return reject(ResponseUtility.GENERIC_ERR({ message: err.message, error: err }));
	}
});
