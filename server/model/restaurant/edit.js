/* eslint-disable guard-for-in */
import {
	ResponseUtility,
	RandomCodeUtility,
	SchemaMapperUtility,
	S3Services,
} from 'appknit-backend-bundle';
import fs from 'fs';
import {
	RestaurantModel,
} from '../../schemas';
import { DownloadFileService } from '../../services';
import { NODE_ENV, S3_IMAGES, PLACE_API_KEY } from '../../constants';

/**
* @description A service model function to handle the
* edit of a restaurant
* @authoe Santgurlal Singh
* @since 5 Oct, 2020
*/

export default ({
	restaurantId,
	name,
	website,
	about,
	phoneCode,
	phoneNumber,
	address,
	longitude,
	latitude,
	portCode,
	typeOfFood,
	price,
	categories,
	images,
	showPhoneNumber,
	removeFiles = [],
}) => new Promise(async (resolve, reject) => {
	try {
		const dateNow = new Date();
		const restaurant = await RestaurantModel.findOne({
			_id: restaurantId,
			deleted: false,
		});
		if (!restaurant) {
			return reject(ResponseUtility.GENERIC_ERR({ code: 401, message: 'Requested place not found.' }));
		}

		const imagesExisting = restaurant.images;
		const imagesExistingFiltered = imagesExisting.filter(item => !removeFiles.includes(item));
		const imagesExistinglength = imagesExistingFiltered.length;
		let newImages = imagesExistingFiltered;
		let thumbnailImage = restaurant.thumbnail;
		if (images) {
			newImages = [];
			if (images.thumbnailEdit) {
				const imageName = `${NODE_ENV}-${Date.now() * RandomCodeUtility(3)}`;
				S3Services.uploadPublicObject({
					Bucket: S3_IMAGES.GLOBAL_IMAGES,
					Key: imageName,
					data: Buffer.from(images.thumbnailEdit.data),
				});
				thumbnailImage = imageName;
			}
			if (images.restaurantImageOneEdit) {
				const imageName = `${NODE_ENV}-${Date.now() * RandomCodeUtility(3)}`;
				S3Services.uploadPublicObject({
					Bucket: S3_IMAGES.GLOBAL_IMAGES,
					Key: imageName,
					data: Buffer.from(images.restaurantImageOneEdit.data),
				});
				newImages.push(imageName);
			} else if (imagesExistinglength) {
				newImages.push(imagesExisting[0]);
			}
			if (images.restaurantImageTwoEdit) {
				const imageName = `${NODE_ENV}-${Date.now() * RandomCodeUtility(3)}`;
				S3Services.uploadPublicObject({
					Bucket: S3_IMAGES.GLOBAL_IMAGES,
					Key: imageName,
					data: Buffer.from(images.restaurantImageTwoEdit.data),
				});
				newImages.push(imageName);
			} else if (imagesExistinglength > 1) {
				newImages.push(imagesExisting[1]);
			}
			if (images.restaurantImageThreeEdit) {
				const imageName = `${NODE_ENV}-${Date.now() * RandomCodeUtility(3)}`;
				S3Services.uploadPublicObject({
					Bucket: S3_IMAGES.GLOBAL_IMAGES,
					Key: imageName,
					data: Buffer.from(images.restaurantImageThreeEdit.data),
				});
				newImages.push(imageName);
			} else if (imagesExistinglength > 2) {
				newImages.push(imagesExisting[2]);
			}
			if (images.restaurantImageFourEdit) {
				const imageName = `${NODE_ENV}-${Date.now() * RandomCodeUtility(3)}`;
				S3Services.uploadPublicObject({
					Bucket: S3_IMAGES.GLOBAL_IMAGES,
					Key: imageName,
					data: Buffer.from(images.restaurantImageFourEdit.data),
				});
				newImages.push(imageName);
			} else if (imagesExistinglength > 3) {
				newImages.push(imagesExisting[3]);
			}
			if (images.restaurantImageFiveEdit) {
				const imageName = `${NODE_ENV}-${Date.now() * RandomCodeUtility(3)}`;
				S3Services.uploadPublicObject({
					Bucket: S3_IMAGES.GLOBAL_IMAGES,
					Key: imageName,
					data: Buffer.from(images.restaurantImageFiveEdit.data),
				});
				newImages.push(imageName);
			} else if (imagesExistinglength > 4) {
				newImages.push(imagesExisting[4]);
			}
			if (images.restaurantImageSixEdit) {
				const imageName = `${NODE_ENV}-${Date.now() * RandomCodeUtility(3)}`;
				S3Services.uploadPublicObject({
					Bucket: S3_IMAGES.GLOBAL_IMAGES,
					Key: imageName,
					data: Buffer.from(images.restaurantImageSixEdit.data),
				});
				newImages.push(imageName);
			} else if (imagesExistinglength > 5) {
				newImages.push(imagesExisting[5]);
			}
			if (images.restaurantImageSevenEdit) {
				const imageName = `${NODE_ENV}-${Date.now() * RandomCodeUtility(3)}`;
				S3Services.uploadPublicObject({
					Bucket: S3_IMAGES.GLOBAL_IMAGES,
					Key: imageName,
					data: Buffer.from(images.restaurantImageSevenEdit.data),
				});
				newImages.push(imageName);
			} else if (imagesExistinglength > 6) {
				newImages.push(imagesExisting[6]);
			}
			if (images.restaurantImageEightEdit) {
				const imageName = `${NODE_ENV}-${Date.now() * RandomCodeUtility(3)}`;
				S3Services.uploadPublicObject({
					Bucket: S3_IMAGES.GLOBAL_IMAGES,
					Key: imageName,
					data: Buffer.from(images.restaurantImageEightEdit.data),
				});
				newImages.push(imageName);
			} else if (imagesExistinglength > 7) {
				newImages.push(imagesExisting[7]);
			}
		}

		let placePicture;
		if (latitude && longitude) {
			const uri = `https://maps.googleapis.com/maps/api/staticmap?zoom=15&size=600x300&format=png&maptype=roadmap&markers=color:black%7C${latitude},${longitude}&key=${PLACE_API_KEY}`;
			placePicture = `${NODE_ENV}-${Date.now() * RandomCodeUtility(3)}`;
			const filePath = `./tempFiles/${placePicture}.png`;
			await DownloadFileService(
				uri,
				filePath,
			);
			const fileContent = fs.readFileSync(filePath);
			S3Services.uploadPublicObject({
				Bucket: S3_IMAGES.GLOBAL_IMAGES,
				Key: placePicture,
				data: Buffer.from(fileContent),
			});
			fs.unlinkSync(filePath);
		}

		const updateQuery = await SchemaMapperUtility({
			name,
			website,
			about,
			phoneCode,
			phoneNumber,
			location: (address && longitude && latitude)
				? {
					type: 'Point',
					address,
					coordinates: [longitude, latitude],
				} : undefined,
			portCode,
			typeOfFood,
			price,
			categories,
			placePicture,
			thumbnail: thumbnailImage,
			images: newImages,
			showPhoneNumber,
			updatedOn: dateNow,
		});

		const restaurantUpdated = await RestaurantModel
			.findOneAndUpdate({ _id: restaurantId }, updateQuery, { new: true });
		restaurantUpdated._doc.location.coordinates = (restaurantUpdated._doc.location && restaurantUpdated._doc.location.coordinates) ? restaurantUpdated._doc.location.coordinates.reverse() : undefined;
		return resolve(ResponseUtility.SUCCESS({ message: 'Restaurant Edited successfully.', data: restaurantUpdated }));
	} catch (err) {
		return reject(ResponseUtility.GENERIC_ERR({ message: err.message, error: err }));
	}
});
