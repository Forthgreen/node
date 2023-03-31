import { ResponseUtility } from 'appknit-backend-bundle';
import {
	UserModel,
} from '../../schemas';
/**
 * @description service model function to fetch the details of the user
 * @author Jagmohan Singh
 * @since 11 May 2020
 */
export default ({
	id,
}) => new Promise(async (resolve, reject) => {
	try {
		const user = await UserModel.findOne({ _id: id });

		if (!user || user.deleted) {
			return reject(ResponseUtility.GENERIC_ERR({ code: 401, message: 'Requested user not found.' }));
		}

		if (user.blocked) {
			return reject(ResponseUtility.GENERIC_ERR({ code: 401, message: 'Your account has been blocked by admin.' }));
		}

		return resolve(ResponseUtility.SUCCESS({
			data: user,
		}));
	} catch (err) {
		return reject(ResponseUtility.GENERIC_ERR({ message: err.message, error: err.error }));
	}
});
