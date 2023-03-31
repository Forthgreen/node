/* eslint-disable no-underscore-dangle */
/* eslint-disable import/named */
import {
	ResponseUtility,
	HashUtility,
	TokenUtility,
} from 'appknit-backend-bundle';
import { AdminModel } from '../../schemas';

/**
* @description service model function to handle the
* login of the admin
* @author Abhinav Sharma
* @since 29 May, 2020
* @param {String} email the email of the admin.
* @param {String} password the password of the admin.
* @param {String} fcmToken the fcm token of the admin's device for notifications.
* @param {String} device the device of the admin [ ios or android ].
*/
export default ({
	email,
	password
}) => new Promise(async (resolve, reject) => {
	try {
		if (!email || !password) {
			return reject(ResponseUtility.MISSING_PROPS({ message: `Missing property ${email ? 'password' : 'email'}.` }));
		}
		// eslint-disable-next-line no-param-reassign
		email = email.toLowerCase();
		const checkUnique = await AdminModel.findOne({ email });
		if (checkUnique) {

			const passwordMatch = await HashUtility.compare({
				text: password,
				hash: checkUnique.password,
			});
			if (passwordMatch) {
				// update the fcmToken and device
				const token = await TokenUtility.generateToken({
					id: checkUnique._id,
					email,
					tokenLife: '360d',
					role: 'admin',
				});
				return resolve(ResponseUtility.SUCCESS({
					data: {
						accessToken: token,
						user: {
							...checkUnique._doc,
							password: undefined,
							createdOn: undefined,
							updatedOn: undefined,
						},
					},
				}));
			}
			return reject(ResponseUtility.LOGIN_AUTH_FAILED());
		}
		return reject(ResponseUtility.NO_USER());
	} catch (err) {
		return reject(ResponseUtility.GENERIC_ERR({ message: err.message, error: err }));
	}
});
