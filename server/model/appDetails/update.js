import { ResponseUtility, SchemaMapperUtility } from 'appknit-backend-bundle';
import { AppDetailsModel } from '../../schemas';

/**
 * @description To update app details.
 * @author Jagmohan Singh
 * @param {String} aboutUs basic info of app.
 * @param {String} termsAndCondition terms and condition of app.
 * @param {String} privacy privacy policy of app.
 * @since 14 May, 2020
*/

export default ({
	aboutUs,
	privacyPolicy,
	termsAndCondition,
}) => new Promise(async (resolve, reject) => {
	try {
		const today = new Date();
		const updateQuery = await SchemaMapperUtility({
			aboutUs,
			aboutUsUpdated: today,
			termsAndCondition,
			termsAndConditionUpdated: today,
			privacyPolicy,
			privacyPolicyUpdated: today,
		});

		await AppDetailsModel.findOneAndUdate({ }, updateQuery);
		return resolve(ResponseUtility.SUCCESS({ message: 'Data Updated.' }));
	} catch (err) {
		return reject(ResponseUtility.GENERIC_ERR({ message: err.message, error: err }));
	}
});
