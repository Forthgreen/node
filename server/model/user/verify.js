import {
	ResponseUtility,
} from 'appknit-backend-bundle';

import { UserModel } from '../../schemas';

/**
 * @description handle the otp verificiation process
 * @author Jagmohan Singh
 * @since 1 May 2020
 */


export default ({
	id,
	emailToken,
}) => new Promise(async (resolve, reject) => {
	try {
		if (!(id && emailToken)) {
			return reject(ResponseUtility.GENERIC_ERR({ message: 'Missing either of the required properties.' }));
		}
		const user = await UserModel.findOne({ _id: id, emailToken });
		if (!user) {
			return reject(ResponseUtility.GENERIC_ERR({ message: 'Invalid Access Token.' }));
		}
		if (user.isVerified) {
			return resolve('<h1 style="text-align: center">Your account is already verified.</h1>');
		}
		const updateQuery = {
			$set: {
				isVerified: true,
			},
			$unset:
			{
				emailToken: 1,
				emailTokenDate: 1,
			},
		};
		await UserModel.updateOne({ _id: id }, updateQuery);
		return resolve('<h1 style="text-align: center">Your account has been verified.</h1>');
	} catch (err) {
		return reject(ResponseUtility.GENERIC_ERR({ message: err.message, error: err }));
	}
});
