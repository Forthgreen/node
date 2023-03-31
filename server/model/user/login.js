/* eslint-disable no-underscore-dangle */
/* eslint-disable import/named */
import {
	ResponseUtility,
	HashUtility,
	TokenUtility,
} from 'appknit-backend-bundle';
import { UserModel } from '../../schemas';

/**
* @description service model function to handle the
* login of the user
* @author Jagmohan Singh
* @since 2 May, 2020
* @param {String} email the email of the user.
* @param {String} password the password of the user.
* @param {String} fcmToken the fcm token of the user's device for notifications.
* @param {String} device the device of the user [ ios or android ].
*/
export default ({
	email,
	password,
	fcmToken,
	device,
}) => new Promise(async (resolve, reject) => {
	try {
		if (!email || !password) {
			return reject(ResponseUtility.MISSING_PROPS({ message: `Missing property ${email ? 'password' : 'email'}.` }));
		}
		// eslint-disable-next-line no-param-reassign
		email = email.toLowerCase();
		const checkUnique = await UserModel.findOne({ email });
		if (checkUnique) {
			if (!checkUnique.isVerified) {
				return reject(ResponseUtility.GENERIC_ERR({ message: 'Please verify your email id to login' }));
			}
			if (checkUnique.deleted) {
				return reject(ResponseUtility.GENERIC_ERR({ message: 'User account is deleted by admin' }));
			}
			if (checkUnique.blocked) {
				return reject(ResponseUtility.GENERIC_ERR({ message: 'User account is freezed by admin' }));
			}
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
					role: 'user',
				});
				const updateQuery = { fcmToken, device };
				const user = await UserModel.findOneAndUpdate({ _id: checkUnique._id }, updateQuery);
				return resolve(ResponseUtility.SUCCESS({
					data: {
						accessToken: token,
						user: {
							...user._doc,
							password: undefined,
							isVerified: undefined,
							blocked: undefined,
							deleted: undefined,
							fcmToken: undefined,
							device: undefined,
							emailToken: undefined,
							emailTokenDate: undefined,
							socialId: undefined,
							socialToken: undefined,
							socialIdentifier: undefined,
							createdOn: undefined,
							updatedOn: undefined,
							changePassToken: undefined,
							changePassTokenDate: undefined,
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
