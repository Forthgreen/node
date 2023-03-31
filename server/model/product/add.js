/* eslint-disable guard-for-in */
import {
	ResponseUtility,
	RandomCodeUtility,
} from 'appknit-backend-bundle';
import {
	BrandModel,
	ProductModel,
} from '../../schemas';
import {
	MAX_IMAGES_FOR_PRODUCT,
	NODE_ENV,
} from '../../constants';
import { ImagesUploadUtility } from '../../utility';

/**
* @description A service model function to handle the
*  addtion of new product in a brand
* @param {String} name the name of a product.
* @param {String} info the information of a product.
* @param {Number} category  the category of a product.
* @param {String} price the price of a product.
* @param {String} link the link of a product's website.
* @param {Array} images array of images.
* @author Jagmohan Singh
* @since 2 May 2020
* @updatedBy Santgurlal Singh
* @date 8 may 2020
*/
export default ({
	id,
	name,
	info,
	category,
	subCategory,
	price,
	link,
	keywords,
	images,
	gender,
	currency,
}) => new Promise(async (resolve, reject) => {
	try {
		const brandInfo = await BrandModel.findOne({
			_id: id,
			deleted: false,
		});

		if (!brandInfo || brandInfo.deleted) {
			return reject(ResponseUtility.GENERIC_ERR({ code: 401, message: 'Requested brand not found.' }));
		}

		if (brandInfo.blocked) {
			return reject(ResponseUtility.GENERIC_ERR({ code: 401, message: 'Your account has been blocked by admin.' }));
		}

		const imageNames = [];
		if (images) {
			if (Object.keys(images).length > MAX_IMAGES_FOR_PRODUCT) {
				return reject(ResponseUtility.GENERIC_ERR({ message: `Cannot upload more than ${MAX_IMAGES_FOR_PRODUCT} images` }));
			}
			for (const key in images) {
				const imageName = `${NODE_ENV}-${Date.now() * RandomCodeUtility(3)}`;
				await ImagesUploadUtility(imageName, images[key]);
				imageNames.push(imageName);
			}
		}

		if (keywords && keywords.length > 10) {
			return reject(ResponseUtility.GENERIC_ERR({ message: 'Cannot add more than 10 keywords' }));
		}

		const dateNow = new Date().getTime();

		const projectObject = new ProductModel({
			brandRef: id,
			name,
			info,
			category,
			subCategory,
			price,
			link,
			keywords,
			gender,
			currency,
			images: imageNames,
			createdOn: dateNow,
			updatedOn: dateNow,
			topDate: dateNow,
		});
		await projectObject.save();
		await BrandModel.updateOne({ _id: id }, { updatedOn: dateNow });
		return resolve(ResponseUtility.SUCCESS({ data: projectObject }));
	} catch (err) {
		return reject(ResponseUtility.GENERIC_ERR({ message: err.message, error: err }));
	}
});
