import {
	ResponseUtility,
	RandomCodeUtility,
	SchemaMapperUtility,
	EmailServices,
	S3Services,
} from 'appknit-backend-bundle';
import { Types } from 'mongoose';
import { ObjectId } from 'mongodb';
import {
	BrandModel,
	FollowBrandModel,
	ProductModel,
} from '../../schemas';
import { FirebaseNotificationService } from '../../services';
import {
	HOST,
	AMQP_QUEUES,
	S3_IMAGES, NODE_ENV,
} from '../../constants';
/**
* @description A service model function to handle the
* uodate of brands
* @param {String} id the unique id of a brand.
* @param {String} name the name of the brand owner.
* @param {String} companyName the name of brand.
* @param {String} mobileCode the country code of mobile number.
* @param {String} mobileNumber the mobile number of the brand owner.
* @param {String} about some description of brand.
* @param {String} website the website of brand.
* @param {String} images the images array.
* @author Jagmohan Singh
* @since 2 May 2020
*/
export default ({
	id,
	name,
	companyName,
	mobileCode,
	mobileNumber,
	about,
	website,
	images,
	newEmail,
	AMQPChannel,
}) => new Promise(async (resolve, reject) => {
	try {
		if (
			!(name || companyName || mobileCode || mobileNumber
				|| about || website || newEmail || images)) {
			return reject(ResponseUtility.GENERIC_ERR({ message: 'Nothing to update.' }));
		}

		const brand = await BrandModel.findOne({ _id: id, deleted: false });

		if (!brand || brand.deleted) {
			return reject(ResponseUtility.GENERIC_ERR({ code: 401, message: 'Requested brand not found.' }));
		}

		if (brand.blocked) {
			return reject(ResponseUtility.GENERIC_ERR({ code: 401, message: 'Your account has been blocked by admin.' }));
		}

		let message = 'The profile has been uploaded successfully in Forthgreen app, you can go check it!';
		const date = new Date();

		let coverImage;
		let logo;

		if (images && images.coverPicture) {
			if (brand.coverImage) {
				await AMQPChannel.sendToQueue(
					AMQP_QUEUES.PICTURE_DELETE,
					Buffer.from(JSON.stringify({
						name: brand.coverImage,
					})),
				);
			}
			coverImage = `${NODE_ENV}-${Date.now() * RandomCodeUtility(3)}`;
			await S3Services.uploadPublicObject({
				Bucket: S3_IMAGES.GLOBAL_IMAGES,
				Key: coverImage,
				data: Buffer.from(images.coverPicture.data),
			});
		}

		if (images && images.logoPicture) {
			if (brand.logo) {
				await AMQPChannel.sendToQueue(
					AMQP_QUEUES.PICTURE_DELETE,
					Buffer.from(JSON.stringify({
						name: brand.logo,
					})),
				);
			}
			logo = `${NODE_ENV}-${Date.now() * RandomCodeUtility(3)}`;
			await S3Services.uploadPublicObject({
				Bucket: S3_IMAGES.GLOBAL_IMAGES,
				Key: logo,
				data: Buffer.from(images.logoPicture.data),
			});
		}

		let updateQuery = await SchemaMapperUtility({
			name,
			companyName,
			mobileCode,
			mobileNumber,
			about,
			website,
			coverImage,
			logo,
			updatedOn: date,
		});
		let updateEmailQuery;

		if (newEmail && (newEmail.toLowerCase() !== brand.email)) {
			// eslint-disable-next-line no-param-reassign
			newEmail = newEmail.toLowerCase();
			const newEmailAleadyInUse = await BrandModel.findOne({ email: newEmail });
			if (newEmailAleadyInUse) {
				return reject(ResponseUtility.GENERIC_ERR({ message: 'Given email is already registered with another account.' }));
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
				text: `Click the following link to change your email ${HOST}brand/verifyNewEmail?id=${id}&tok=${token}`,
				subject: 'Change Forthgreen email',
			});
		}

		if (updateEmailQuery) {
			updateQuery = {
				...updateQuery,
				...updateEmailQuery,
			};
		}

		const brandUpdated = await BrandModel.findOneAndUpdate({ _id: id }, updateQuery, { new: true });

		if (!brandUpdated.profileUploaded) {
			await BrandModel.findOneAndUpdate({ _id: id }, { profileUploaded: true });
		}

		const productsNotUploaded = await ProductModel.countDocuments({
			$and: [
				{ brandRef: ObjectId.createFromHexString(id) },
				{ deleted: false },
				{ blocked: false },
				{ uploadedToProfile: false },
			],
		});

		if (productsNotUploaded) {
			await ProductModel.updateMany({
				$and: [
					{ brandRef: ObjectId.createFromHexString(id) },
					{ deleted: false },
					{ blocked: false },
					{ uploadedToProfile: false },
				],
			}, {
				uploadedToProfile: true,
			});
			const usersBrandDetails = await FollowBrandModel.aggregate([
				{
					$match: {
						brandRef: Types.ObjectId.createFromHexString(id),
						status: true,
					},
				},
				{
					$lookup: {
						from: 'users',
						let: {
							userRef: '$userRef',
						},
						pipeline: [
							{
								$match: {
									$expr: {
										$and: [{
											$eq: [
												'$_id',
												'$$userRef',
											],
										}, {
											$ne: [
												'$fcmToken',
												null,
											],
										}],
									},
								},
							},
						],
						as: 'users',
					},
				}, {
					$unwind: {
						path: '$users',
					},
				}]);
			if (usersBrandDetails.length) {
				const tokensToSendPush = [];
				// eslint-disable-next-line no-restricted-syntax
				for (const data of usersBrandDetails) {
					tokensToSendPush.push(data.users.fcmToken);
				}
				FirebaseNotificationService({
					deviceTokens: tokensToSendPush,
					title: brandUpdated.companyName,
					body: 'added new products.',
				});
			}
		}

		return resolve(ResponseUtility.SUCCESS({ message }));
	} catch (err) {
		return reject(ResponseUtility.GENERIC_ERR({ message: err.message, error: err }));
	}
});
