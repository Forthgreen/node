/* eslint-disable no-underscore-dangle */
/* eslint-disable import/named */
import {
	ResponseUtility,
	HashUtility,
	RandomCodeUtility,
	EmailServices,
	SchemaMapperUtility,
} from 'appknit-backend-bundle';
import { Types } from 'mongoose';
import { UserModel } from '../../schemas';
import { ImageUploadUtility, DeletePictureUtility } from '../../utility';
import {
	HOST,
	NODE_ENV,
	USER_BIO_MAX_CHAR,
} from '../../constants';

/**
* @description service model function to handle the
* login of the user
* @author Jagmohan Singh
* @since 1 April, 2020
 * @param {String} firstName the firstname of the user.
 * @param {String} lastName the lastName of a user.
 * @param {String} oldPassword the old password of the user.
 * @param {String} newPassword the new  password of a user.
 * @param {String} image the image of the user.
*/
export default ({
	id,
	oldPassword,
	newPassword,
	firstName,
	lastName,
	images,
	newEmail,
	username,
	bio,
}) => new Promise(async (resolve, reject) => {
	try {
		const checkUnique = await UserModel.findOne({ _id: Types.ObjectId.createFromHexString(id) });

		if (!checkUnique || checkUnique.deleted) {
			return reject(ResponseUtility.GENERIC_ERR({ code: 401, message: 'Requested user not found.' }));
		}

		if (checkUnique.blocked) {
			return reject(ResponseUtility.GENERIC_ERR({ code: 401, message: 'Your account has been blocked by admin.' }));
		}

		if (username) {
			if (/\s/.test(username)) {
				return reject(ResponseUtility.GENERIC_ERR({ message: 'No space required for username field.' }));
			}
			username = username.toLowerCase();

			const usernameExists = await UserModel.findOne({
				_id: { $ne: id },
				username,
				deleted: false
			});
			if (usernameExists) {
				return reject(ResponseUtility.GENERIC_ERR({ message: 'Username already exist.' }));
			}
		}

		if (bio && bio.length > USER_BIO_MAX_CHAR) {
			return reject(ResponseUtility.GENERIC_ERR({ message: 'You can set bio upto 150 character.' }));
		}

		let message = 'Update Successful';
		let newHashPassword;
		if (oldPassword && newPassword) {
			const passwordMatch = await HashUtility.compare({
				text: oldPassword,
				hash: checkUnique.password,
			});
			if (!passwordMatch) {
				return reject(ResponseUtility.GENERIC_ERR({ message: 'Old password is incorrect' }));
			}
			newHashPassword = await HashUtility.generate({ text: newPassword });
		}

		const date = new Date();

		let profilePic;
		if (images && images.image) {
			if (checkUnique.image) {
				DeletePictureUtility(checkUnique.image);
			}
			profilePic = `${NODE_ENV}-${Date.now() * RandomCodeUtility(3)}`;
			await ImageUploadUtility(profilePic, images.image);
		}

		let updateQuery = await SchemaMapperUtility({
			firstName,
			lastName,
			username,
			password: newHashPassword,
			image: profilePic,
			bio,
			updatedOn: date,
		});

		let updateEmailQuery;
		if (newEmail) {
			const checkNewEmail = await UserModel.findOne({ email: newEmail });
			if (checkNewEmail) {
				return reject(ResponseUtility.GENERIC_ERR({ message: 'New email is alrady registered.' }));
			}
			const token = RandomCodeUtility(10);
			updateEmailQuery = await SchemaMapperUtility({
				secondaryEmail: newEmail,
				changeEmailToken: token,
				changeEmailTokenDate: date,
			});
			message = 'Email has been sent for verification of new email';

			await EmailServices({
				to: newEmail,
				text: `Click the following link to change your email ${HOST}user/verifyNewEmail?id=${id}&tok=${token}`,
				subject: 'Change Forthgreen email',
			});
		}

		if (updateEmailQuery) {
			updateQuery = {
				...updateQuery,
				...updateEmailQuery,
			};
		}

		const user = await UserModel.findOneAndUpdate(
			{ _id: checkUnique._id },
			updateQuery,
			{ new: true },
		);

		return resolve(ResponseUtility.SUCCESS({
			message,
			data: {
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
				socialIdentifier: user.socialIdentifier || undefined,
				createdOn: undefined,
				updatedOn: undefined,
				secondaryEmail: undefined,
				changeEmailToken: undefined,
				changeEmailTokenDate: undefined,
				changePassToken: undefined,
				changePassTokenDate: undefined,
			},
		}));
	} catch (err) {
		return reject(ResponseUtility.GENERIC_ERR({ message: err.message, error: err }));
	}
});
