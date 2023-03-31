import { ResponseUtility } from 'appknit-backend-bundle';
import { AppDetailsModel } from '../../schemas';

/**
 * @description To get list of app details.
 * @author Jagmohan Singh
 * @since 14 May, 2020
*/
export default () => new Promise(async (resolve, reject) => {
	try {
		const list = await AppDetailsModel.findOne({});
		return resolve(ResponseUtility.SUCCESS({ data: list }));
	} catch (err) {
		return reject(ResponseUtility.GENERIC_ERR({ message: err.message, error: err }));
	}
});
