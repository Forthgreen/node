import { ResponseUtility } from 'appknit-backend-bundle';
import { StripeService } from '../../services';
import {
	UsedCouponModel,
} from '../../schemas';

/**
* @description This service model function is for getting details of a stripe coupon
* @author Santgurlal Singh
* @since 23 July, 2020
* @param {String} coupon the unique coupon code
*/

export default ({
	id,
	coupon,
}) => new Promise(async (resolve, reject) => {
	try {
		if (!coupon) {
			return reject(ResponseUtility.GENERIC_ERR({ message: 'Required Property Missing.' }));
		}
		const couponAlreadyUsed = await UsedCouponModel.findOne({ userRef: id, coupon });
		if (couponAlreadyUsed) {
			return reject(ResponseUtility.GENERIC_ERR({ message: 'You have already used this coupon.' }));
		}
		const couponDetails = await StripeService.CouponDetails(coupon);
		if (couponDetails.valid) {
			return resolve(ResponseUtility.SUCCESS({ data: couponDetails }));
		}
		return reject(ResponseUtility.GENERIC_ERR({ message: 'Coupon is not Valid', error: couponDetails }));
	} catch (err) {
		return reject(ResponseUtility.GENERIC_ERR({ message: err.message, error: err }));
	}
});
