/* eslint-disable no-underscore-dangle */
import {
	ResponseUtility,
	RandomCodeUtility,
	EmailServices,
} from 'appknit-backend-bundle';
import { UserModel } from '../../schemas';
import {
	HOST,
	VERIFICATION_TYPE,
	TOKEN_EXPIRATION_TIME,
} from '../../constants';
/**
* @description Service model function to resend the verification code email
* in case user hasn't received it and inititates the password change request
* @author Jagmohan Singh
* @since 1 May, 2020
* @param {String} email to resend the verification email to change password
* @param {Number} requestType represent the request type @see constants to see mapping
* 1. resend verification email.
* 2. initiate the change password request.
* Both the actions will be handled at front end by the web interfaces
* the password change process will also take place via a web page.
*/
export default ({
	email,
	requestType,
}) => new Promise(async (resolve, reject) => {
	try {
		if (!email) {
			return reject(ResponseUtility.MISSING_PROPS({ message: 'Missing some required property.' }));
		}
		// eslint-disable-next-line no-param-reassign
		email = email.toLowerCase();
		let updateQuery;
		const token = RandomCodeUtility(10);
		const tokenExpirationDate = new Date().getTime() + TOKEN_EXPIRATION_TIME;
		const date = new Date();
		let emailMessage;
		let emailSubject;
		const account = await UserModel.findOne({ email });
		if (!account) {
			return reject(ResponseUtility.GENERIC_ERR({ message: 'No account registered with this email address.' }));
		}
		switch (requestType) {
			case VERIFICATION_TYPE.EMAIL_VERIFICATION:
				updateQuery = {
					emailToken: token,
					emailTokenDate: tokenExpirationDate,
					updatedOn: date,
				};
				emailMessage = `Click the URL to verify ${HOST}user/verify?id=${account._id.toString()}&emailToken=${token}`;
				emailSubject = 'Please Verify your email';
				break;
			case VERIFICATION_TYPE.CHANGE_PASSWORD:
				updateQuery = {
					changePassToken: token,
					changePassTokenDate: tokenExpirationDate,
					updatedOn: date,
				};
				emailMessage = `Click the following link to change your password ${HOST}user/password?id=${account._id.toString()}&tok=${token}`;
				emailSubject = 'Change Forthgreen password';
				break;
			default:
				return reject(ResponseUtility.GENERIC_ERR({ message: 'Invalid request type.' }));
		}
		await UserModel.findOneAndUpdate({ email }, updateQuery);

		await EmailServices({
			to: email,
			text: emailMessage,
			subject: emailSubject,
		});
		return resolve(ResponseUtility.SUCCESS({ message: 'An email with verification link has been sent to your email id.' }));
	} catch (err) {
		return reject(ResponseUtility.GENERIC_ERR({ message: err.message, error: err }));
	}
});
