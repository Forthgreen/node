import {
	ResponseUtility,
	HashUtility,
	RandomCodeUtility,
	EmailServices,
	PropsValidationUtility,
} from 'appknit-backend-bundle';
import {
	BrandModel,
} from '../../schemas';
import {
	TemplateMailService,
} from '../../services';
import {
	HOST,
	NEW_BUSINESS_ALERT_EMAIL,
} from '../../constants';
/**
* @description service model function to handle the
* signup of the brand owner and new addition of a brand.
* @author Jagmohan Singh
* @since 5 May, 2020
* @param {String} name the name of the brand owner.
* @param {String} email the email of the brand owner.
* @param {String} password the password of the brand owner.
* @param {String} mobileCode the country code of mobile number.
* @param {String} mobileNumber the mobile number of the brand owner.
* @param {String} companyName the name of brand.
*/
export default ({
	name,
	email,
	password,
	mobileCode,
	mobileNumber,
	companyName,
}) => new Promise(async (resolve, reject) => {
	try {
		const validProps = [
			'name', 'email', 'password', 'mobileCode', 'mobileNumber', 'companyName',
		];
		const { code, message } = await PropsValidationUtility({
			validProps,
			sourceDocument: {
				name, email, password, mobileCode, mobileNumber, companyName,
			},
		});

		if (code !== 100) {
			return reject(ResponseUtility.MISSING_PROPS({ message }));
		}

		// eslint-disable-next-line no-param-reassign
		email = email.toLowerCase();
		const dateNow = new Date().getTime();
		const userExists = await BrandModel.findOne({ email, deleted: false });
		if (userExists) {
			return reject(ResponseUtility.GENERIC_ERR({ message: 'Email is already Registered.' }));
		}
		const brandNameExists = await BrandModel.aggregate([
			{
				$project: {
					companyNameLowercase: { $toLower: '$companyName' },
					deleted: '$deleted',
				},
			},
			{
				$match: {
					companyNameLowercase: companyName.toLowerCase().trim(),
					deleted: false,
				},
			},
		]);
		if (brandNameExists.length) {
			return reject(ResponseUtility.GENERIC_ERR({ message: 'This Brand name is already Taken.' }));
		}

		// const emailToken = RandomCodeUtility(10);

		const brandObject = new BrandModel({
			name,
			mobileCode,
			email,
			companyName,
			mobileNumber,
			password: await HashUtility.generate({ text: password }),
			isVerified: true,
			// emailToken,
			// emailTokenDate: dateNow,
			createdOn: dateNow,
			updatedOn: dateNow,
		});

		// eslint-disable-next-line no-underscore-dangle
		// await TemplateMailService.VerificationMail({
		// 	to: email,
		// 	link: `${HOST}brand/verify?id=${brandObject._id}&emailToken=${emailToken}`,
		// });
		// await EmailServices({ to: NEW_BUSINESS_ALERT_EMAIL, text: ` New brand ${companyName} waiting to be verified.`, subject: 'New Brand Signup' });
		await brandObject.save();

		return resolve(ResponseUtility.SUCCESS({ message: 'Profile Created Successfully, Please login to continue.' }));
	} catch (err) {
		return reject(ResponseUtility.GENERIC_ERR({ message: err.message, error: err }));
	}
});
