import { ResponseUtility } from 'appknit-backend-bundle';
import {
	UserModel,
} from '../../schemas';
/**
 * @description service model function to logout the user
 * @author Nikhil Negi
 * @since 23-04-2021
 */
export default ({
	id,
}) => new Promise(async (resolve, reject) => {
	try {
		const user = await UserModel.findOneAndUpdate({
			_id: id,
			deleted: false,
			blocked: false,
		}, {
			fcmToken: null,
			device: null,
		});

		if (!user) {
			return reject(ResponseUtility.GENERIC_ERR({ code: 401, message: 'Requested user not found.' }));
		}

		return resolve(ResponseUtility.SUCCESS({ message: 'Logout successfully.' }));
	} catch (err) {
		return reject(ResponseUtility.GENERIC_ERR({ message: err.message, error: err.error }));
	}
});
