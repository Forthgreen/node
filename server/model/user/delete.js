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
		console.log(checkUnique)
		
		if (!checkUnique || checkUnique.deleted) {
			return reject(ResponseUtility.GENERIC_ERR({ code: 401, message: 'Requested user not found.' }));
		}

		if (checkUnique.blocked) {
			return reject(ResponseUtility.GENERIC_ERR({ code: 401, message: 'Your account has been blocked by admin.' }));
		}

		let message = 'Delete Successful';
		

		const date = new Date();
		const intdateresult = date.getTime();		
		newEmail = checkUnique.email+'_'+intdateresult+'_delete';

		let updateQuery = await SchemaMapperUtility({
			updatedOn: date,
		});

		let updateEmailQuery;
		if (newEmail) {
			const checkNewEmail = await UserModel.findOne({ email: newEmail });
			
			const token = RandomCodeUtility(10);
			updateEmailQuery = await SchemaMapperUtility({
				firstName: 'anonymous',
				lastName: 'user',
				email: newEmail,
				socialIdentifier:0,
				isVerified:false,
				deleted:true,
				changeEmailToken: token,
				fcmToken:token,
				socialToken:token,
				changeEmailTokenDate: date,
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
				firstName:undefined,
				lastName:undefined,
				email:undefined,
				image:undefined,
				bio:undefined,
				gender:undefined,
				_id:undefined,
				socialIdentifier:undefined,
				__v:undefined,
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
				// socialIdentifier: user.socialIdentifier || undefined,
				socialIdentifier: undefined,
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
