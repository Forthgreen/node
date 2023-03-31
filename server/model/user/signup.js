import {
	ResponseUtility,
	HashUtility,
	RandomCodeUtility,
	EmailServices,
	PropsValidationUtility,
} from 'appknit-backend-bundle';
import {
	UserModel,
} from '../../schemas';
import {
	HOST,
} from '../../constants';
import { TemplateMailService } from '../../services';
/**
* @description service model function to handle the
* signup of the user
* @author Jagmohan Singh
* @since 1 May, 2020
* @param {String} firstName the firstName of the user.
* @param {String} lastName the lastName of the user.
* @param {String} email the email of the user.
* @param {Object} image the image of the user.
* @param {String} password the password of the user.
* @param {String} mobileNumber the mobile number of the user.
* @param {Number} userType the type of app user
* 1. USER
* 2. BRAND OWNER
* @param {Number} gender the type of app user
* 1. MALE
* 2. FEMALE
* @param {Number} dateOfBirth the type of app user
* 1. USER
* 2. BRAND OWNER
* @param {String} fcmToken the fcm token of the user's device for notifications.
* @param {String} device the device of the user [ ios or android ].
* @param {Object} AMQPChannel the channel for AMQP queuing service.
*/
export default ({
	username,
	firstName,
	lastName,
	email,
	password,
	gender,
	dateOfBirth,
	device,
	fcmToken,
}) => new Promise(async (resolve, reject) => {
	try {
		// eslint-disable-next-line no-param-reassign
		const { code, message } = await PropsValidationUtility({
			validProps: [
				'firstName', 'email', 'password',
			],
			sourceDocument: {
				firstName, email, password,
			},
		});
		if (code !== 100) {
			return reject(ResponseUtility.MISSING_PROPS({ message }));
		}

		if (/\s/.test(username)) {
			return reject(ResponseUtility.GENERIC_ERR({ message: 'No space required for username field.' }));
		}

		email = email.toLowerCase();
		const dateNow = new Date().getTime();

		const userExists = await UserModel.findOne({ email, deleted: false });
		if (userExists) {
			return reject(ResponseUtility.GENERIC_ERR({ message: 'Email is already Registered.' }));
		}

		const usernameExists = await UserModel.findOne({ username, deleted: false });
		if (username && usernameExists) {
			return reject(ResponseUtility.GENERIC_ERR({ message: 'Username already exist.' }));
		}

		const emailToken = RandomCodeUtility(10);

		const userObject = new UserModel({
			username,
			firstName,
			lastName,
			email,
			password: await HashUtility.generate({ text: password }),
			fcmToken,
			gender,
			dateOfBirth: dateOfBirth ? new Date(dateOfBirth) : undefined,
			emailToken,
			device,
			emailTokenDate: dateNow,
			createdOn: dateNow,
			updatedOn: dateNow,
		});
		await userObject.save();

		// eslint-disable-next-line no-underscore-dangle
		await TemplateMailService.VerificationMail({
			to: email,
			link: `${HOST}user/verify?id=${userObject._id}&emailToken=${emailToken}`,
		});
		return resolve(ResponseUtility.SUCCESS({ message: 'Please Verify your email to continue.' }));
	} catch (err) {
		return reject(ResponseUtility.GENERIC_ERR({ message: err.message, error: err }));
	}
});
