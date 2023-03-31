/* eslint-disable import/no-extraneous-dependencies */
import {
	ResponseUtility,
	TokenUtility,
	RandomCodeUtility,
	SchemaMapperUtility,
	S3Services,
	PropsValidationUtility,
	VerifyFacebookTokenService,
} from 'appknit-backend-bundle';
import { UserModel } from '../../schemas';
import {
	GoogleVerificationUtility,
	AppleVerificationUtility,
} from '../../utility';
import {
	SOCIAL_IDENTIFIER,
	S3_IMAGES,
	NODE_ENV,
} from '../../constants';

/**
 * @description service model function to handle the creation
 * This is a common function that could be used to create as
 * well as update the existing user.
 * of the new user. This will handle the profile completion process
 * @author Jagmohan Singh
 * @since 4 May, 2019
 *
 */
export default ({
	firstName,
	lastName,
	gender,
	email,
	device,
	fcmToken,
	socialId,
	socialToken,
	socialIdentifier,
	images,
}) => new Promise(async (resolve, reject) => {
	try {
		const { code, message } = await PropsValidationUtility({
			validProps: ['firstName', 'socialId', 'socialToken', 'socialIdentifier'],
			sourceDocument: {
				firstName, socialId, socialToken, socialIdentifier,
			},
		});

		if (code !== 100) {
			return reject(ResponseUtility.MISSING_PROPS({ message }));
		}

		if (!(socialId && socialToken && socialIdentifier)) {
			return reject(ResponseUtility.MISSING_PROPS({ message: 'Missing either of the required properties for login.' }));
		}
		if (socialIdentifier === SOCIAL_IDENTIFIER.FB) {
			const fbVerification = await VerifyFacebookTokenService({ accessToken: socialToken });
			if (fbVerification.data.id !== socialId.toString()) {
				return reject(ResponseUtility.GENERIC_ERR({ message: 'Invalid Social Id' }));
			}
		} else if (socialIdentifier === SOCIAL_IDENTIFIER.GOOGLE) {
			const googleVerification = await GoogleVerificationUtility({ accessToken: socialToken });
			if (googleVerification.data.sub !== socialId.toString()) {
				return reject(ResponseUtility.GENERIC_ERR({ message: 'Invalid Social Id' }));
			}
		} else if (socialIdentifier === SOCIAL_IDENTIFIER.APPLE) {
			const appleVerification = await AppleVerificationUtility({ accessToken: socialToken });
			if (appleVerification.data.payload.sub !== socialId.toString()) {
				return reject(ResponseUtility.GENERIC_ERR({ message: 'Invalid Social Id' }));
			}
		} else {
			return reject(ResponseUtility.GENERIC_ERR({ message: 'Invalid Social Identifier.' }));
		}
		let userId;
		const alreadyRegistered = await UserModel.findOne({ socialId, socialIdentifier });
		if (alreadyRegistered && alreadyRegistered.deleted) {
			return reject(ResponseUtility.GENERIC_ERR({ message: 'User account is deleted by admin' }));
		}
		if (alreadyRegistered && alreadyRegistered.blocked) {
			return reject(ResponseUtility.GENERIC_ERR({ message: 'User account is freezed by admin' }));
		}

		if (!alreadyRegistered) {
			let picture;
			if (images && images.image) {
				picture = `${NODE_ENV}-${Date.now() * RandomCodeUtility(3)}`;
				// trigger async image upload
				S3Services.uploadPublicObject({
					Bucket: S3_IMAGES.GLOBAL_IMAGES,
					Key: picture,
					data: Buffer.from(images.image.data),
				});
			}
			const userObject = new UserModel({
				socialId,
				socialToken,
				socialIdentifier,
				firstName,
				lastName,
				email,
				fcmToken,
				device,
				gender,
				image: picture,
				createdOn: new Date(),
				updatedOn: new Date(),
			});
			await userObject.save();
			// eslint-disable-next-line no-underscore-dangle
			userId = userObject._id;
		} else {
			// eslint-disable-next-line no-underscore-dangle
			userId = alreadyRegistered._id;
		}

		const updateQuery = await SchemaMapperUtility({
			fcmToken,
			device,
			updatedOn: new Date(),
		});

		const user = await UserModel.findOneAndUpdate({ _id: userId }, updateQuery);

		const token = await TokenUtility.generateToken({
			id: userId,
			email,
			tokenLife: '360d',
			role: 'user',
		});
		return resolve(ResponseUtility.SUCCESS({
			data: {
				accessToken: token,
				user: {
					// eslint-disable-next-line no-underscore-dangle
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
					socialIdentifier: socialIdentifier || undefined,
					createdOn: undefined,
					updatedOn: undefined,
					changePassToken: undefined,
					changePassTokenDate: undefined,
				},
			},
		}));
	} catch (err) {
		console.log(err)
		return reject(ResponseUtility.GENERIC_ERR({ message: 'There was some error while creating user.', error: `${err}` }));
	}
});
