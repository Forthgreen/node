import {
	ResponseUtility,
} from 'appknit-backend-bundle';
import {
	BrandModel,
} from '../../schemas';
import { PaymentModel as PaymentModelService } from '..';

/**
* @description This service model function handles the
* details of brands for self.
* @author Santgurlal Singh
* @since 16 may 2020
* @param {String} id the unique id of brand.
*/

export default ({
	id,
}) => new Promise(async (resolve, reject) => {
	try {
		const brand = await BrandModel.findOne({ _id: id });

		if (!brand || brand.deleted) {
			return reject(ResponseUtility.GENERIC_ERR({ code: 401, message: 'Requested brand not found.' }));
		}

		if (brand.blocked) {
			return reject(ResponseUtility.GENERIC_ERR({ code: 401, message: 'Your account has been blocked by admin.' }));
		}

		const planDetails = await PaymentModelService.PaymentPlanDetailsService({ id });
		const planData = planDetails.data;
		return resolve(ResponseUtility.SUCCESS({
			data: {
				...brand._doc,
				planData,
				password: undefined,
			},
		}));
	} catch (err) {
		return reject(ResponseUtility.GENERIC_ERR({ message: err.message, error: err }));
	}
});
