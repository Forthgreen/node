import { ResponseUtility } from 'appknit-backend-bundle';
import UserModel from '../../schemas/user';
/**
* @description A service model function to handle the verification of
* new mail.
* @author Jagmohan Singh
* @since 6 May, 2020
* @param {String} id unique id of user
* @param {String} tok the email change token sent to user via email
*/
export default ({
	id,
	tok,
}) => new Promise(async (resolve, reject) => {
	try {
		if (!(id && tok)) {
			return resolve('<h1 style="text-align: center">Some required property missing.</h1>');
		}
		const user = await UserModel.findOne({ _id: id, changeEmailToken: tok });
		if (!user) {
			return resolve('<h1 style="text-align: center">Invalid Access Token.</h1>');
		}
		const checkNewEmail = await UserModel.findOne({ email: user.secondaryEmail });
		if (checkNewEmail) {
			return resolve('<h1 style="text-align: center">New email already registered.</h1>');
		}
		const updateQuery = {
			$set: {
				email: user.secondaryEmail,
				secondaryEmail: user.email,
			},
			$unset:
			{
				changePassToken: 1,
				changePassTokenDate: 1,
			},
		};
		await UserModel.updateOne({ _id: id }, updateQuery);
		return resolve('<h1 style="text-align: center">Your Forthgreen Account email has been updated successfully.</h1>');
	} catch (err) {
		return reject(ResponseUtility.GENERIC_ERR({ message: err.message, error: err }));
	}
});
