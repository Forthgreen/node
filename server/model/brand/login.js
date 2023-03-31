/* eslint-disable no-underscore-dangle */
/* eslint-disable import/named */
import {
	ResponseUtility,
	HashUtility,
	TokenUtility,
} from 'appknit-backend-bundle';
import { BrandModel } from '../../schemas';

/**
* @description service model function to handle the
* login of the brand owner
* @author Jagmohan Singh
* @since 6 May, 2020
* @param {String} email the email of the brand owner.
* @param {String} password the password of the brand owner.
* @param {String} fcmToken the fcm token of the brand owner's device for notifications.
* @param {String} device the device of the brand owner [ ios or android ].
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
		const checkUnique = await BrandModel.findOne({ email, deleted: false });
		if (checkUnique) {
			if (!checkUnique.isVerified) {
				return reject(ResponseUtility.GENERIC_ERR({ message: 'Please verify your email id to login' }));
			}
			if (checkUnique.blocked) {
				return reject(ResponseUtility.GENERIC_ERR({ message: 'Your account has been blocked by admin' }));
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
					role: 'brandOwner',
				});
				const updateQuery = { fcmToken, device };
				if (checkUnique.firstLogin) {
					updateQuery.firstLogin = false;
				}
				const user = await BrandModel.findOneAndUpdate({ _id: checkUnique._id }, updateQuery);
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
