/* eslint-disable no-underscore-dangle */
import {
	ResponseUtility,
	RandomCodeUtility,
	EmailServices,
} from 'appknit-backend-bundle';
import {
	TemplateMailService,
} from '../../services';
import { BrandModel } from '../../schemas';
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

		let emailMessage;
		let emailSubject;
		const account = await BrandModel.findOne({ email });
		if (!account) {
			return reject(ResponseUtility.GENERIC_ERR({ message: 'No account registered with this email address.' }));
		}
		switch (requestType) {
			case VERIFICATION_TYPE.EMAIL_VERIFICATION:
				updateQuery = {
					emailToken: token,
					emailTokenDate: tokenExpirationDate,
				};
				await TemplateMailService.VerificationMail({
					to: email,
					name: account.name,
					link: `${HOST}brand/verify?id=${account._id.toString()}&emailToken=${token}`,
				});
				break;
			case VERIFICATION_TYPE.CHANGE_PASSWORD:
				updateQuery = {
					changePassToken: token,
					changePassTokenDate: tokenExpirationDate,
				};
				emailMessage = `Click the following link to change your password ${HOST.startsWith('http://localhost')
					? 'http://localhost:8001/newpassword' : `${HOST.slice(0, (HOST.indexOf('.com/') + 5))}newpassword`}?id=${account._id.toString()}&tok=${token}`;
				emailSubject = 'Change Forthgreen password';
				await EmailServices({
					to: email,
					text: emailMessage,
					subject: emailSubject,
				});
				break;
			default:
				return reject(ResponseUtility.GENERIC_ERR({ message: 'Invalid request type.' }));
		}
		updateQuery.updateOn = new Date();
		await BrandModel.findOneAndUpdate({ email }, updateQuery);

		return resolve(ResponseUtility.SUCCESS({ message: 'An email with verification link has been sent to your email id.' }));
	} catch (err) {
		return reject(ResponseUtility.GENERIC_ERR({ message: err.message, error: err }));
	}
});
