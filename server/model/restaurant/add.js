/* eslint-disable guard-for-in */
import {
	ResponseUtility,
	RandomCodeUtility,
	S3Services,
} from 'appknit-backend-bundle';
import fs from 'fs';
import {
	RestaurantModel,
} from '../../schemas';
import { DownloadFileService } from '../../services';
import {
	MAX_IMAGES_FOR_RESTAURANT,
	S3_IMAGES,
	NODE_ENV,
	PLACE_API_KEY,
} from '../../constants';
/**
* @description A service model function to handle the
* addtion of new restaurant.
* @author Santgurlal Singh
* @since 5 Oct, 2020
*/
export default ({
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
}) => new Promise(async (resolve, reject) => {
	try {
		let thumbnailImage;
		const imageNames = [];
		if (images) {
			if (Object.keys(images).length > MAX_IMAGES_FOR_RESTAURANT + 1) {
				return reject(ResponseUtility.GENERIC_ERR({ message: `Cannot upload more than ${MAX_IMAGES_FOR_RESTAURANT} images` }));
			}
			// eslint-disable-next-line no-restricted-syntax
			for (const key in images) {
				if (key === 'thumbnail') {
					thumbnailImage = `${NODE_ENV}-${Date.now() * RandomCodeUtility(3)}`;
					S3Services.uploadPublicObject({
						Bucket: S3_IMAGES.GLOBAL_IMAGES,
						Key: thumbnailImage,
						data: Buffer.from(images[key].data),
					});
				} else {
					const imageName = `${NODE_ENV}-${Date.now() * RandomCodeUtility(3)}`;
					S3Services.uploadPublicObject({
						Bucket: S3_IMAGES.GLOBAL_IMAGES,
						Key: imageName,
						data: Buffer.from(images[key].data),
					});
					imageNames.push(imageName);
				}
			}
		}

		const dateNow = new Date();

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

		const restaurantObject = new RestaurantModel({
			name,
			website,
			about,
			phoneCode,
			phoneNumber,
			location: {
				address, coordinates: [longitude, latitude],
			},
			portCode,
			typeOfFood,
			price,
			categories,
			thumbnail: thumbnailImage,
			placePicture,
			images: imageNames,
			showPhoneNumber,
			createdOn: dateNow,
			updatedOn: dateNow,
		});
		await restaurantObject.save();
		restaurantObject._doc.location.coordinates = (restaurantObject._doc.location && restaurantObject._doc.location.coordinates) ? restaurantObject._doc.location.coordinates.reverse() : undefined;
		return resolve(ResponseUtility.SUCCESS({ data: restaurantObject }));
	} catch (err) {
		return reject(ResponseUtility.GENERIC_ERR({ message: err.message, error: err }));
	}
});
