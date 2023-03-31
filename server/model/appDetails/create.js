import {
	ResponseUtility,
} from 'appknit-backend-bundle';
import { AppDetailsModel } from '../../schemas';

/**
 * @description To add app details.
 * @author Jagmohan Singh
 * @param {String} aboutUs basic info of app.
 * @param {String} termsAndCondition terms and condition of app.
 * @param {String} privacyPolicy privacy policy of app.
 * @since 14 May, 2020
*/
export default ({
	aboutUs,
	termsAndCondition,
	privacyPolicy,
}) => new Promise(async (resolve, reject) => {
	try {
		if (!(aboutUs || termsAndCondition || privacyPolicy)) {
			return reject(ResponseUtility.GENERIC_ERR({ message: 'Missing required properties.' }));
		}

		const appDetails = await AppDetailsModel.find({});
		if (appDetails.length) {
			return reject(ResponseUtility.GENERIC_ERR({ message: 'Already added details. Please update' }));
		}
		const today = new Date();
		const appDetailsObject = new AppDetailsModel({
			aboutUs,
			aboutUsUpdated: today,
			termsAndCondition,
			termsAndConditionUpdated: today,
			privacyPolicy,
			privacyPolicyUpdated: today,
		});
		await appDetailsObject.save();
		return resolve(ResponseUtility.SUCCESS({ message: 'Data Added Successfully.' }));
	} catch (err) {
		return reject(ResponseUtility.GENERIC_ERR({ message: err.message, error: err }));
	}
});
