/* eslint-disable guard-for-in */
import {
	ResponseUtility,
	RandomCodeUtility,
	SchemaMapperUtility,
} from 'appknit-backend-bundle';
import {
	BrandModel,
	ProductModel,
} from '../../schemas';
import { NODE_ENV } from '../../constants';
import { ImagesUploadUtility } from '../../utility';

/**
* @description A service model function to handle the
* edit of a product
* @param {String} name the name of a product.
* @param {String} info the information of a product.
* @param {Number} category  the category of a product.
* @param {String} price the price of a product.
* @param {String} link the link of a product's website.
* @param {Array} images array of images.
* @authoe Santgurlal Singh
* @date 17 June, 2020
*/
export default ({
	id,
	productId,
	name,
	info,
	category,
	subCategory,
	currency,
	price,
	link,
	images,
	keywords,
	gender,
	removeFiles = [],
	// AMQPChannel,
}) => new Promise(async (resolve, reject) => {
	try {
		const dateNow = new Date();
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

		const productInfo = await ProductModel.findOne({
			_id: productId,
			brandRef: id,
			deleted: false,
		});
		if (!productInfo) {
			return reject(ResponseUtility.GENERIC_ERR({ message: 'No product found.' }));
		}

		const imagesExisting = productInfo.images;
		const imagesExistingFiltered = imagesExisting.filter(item => !removeFiles.includes(item));

		const imagesExistinglength = imagesExistingFiltered.length;
		let newImages = imagesExistingFiltered;
		if (images) {
			newImages = [];
			if (images.productImageOneEdit) {
				const imageName = `${NODE_ENV}-${Date.now() * RandomCodeUtility(3)}`;
				await ImagesUploadUtility(imageName, images.productImageOneEdit);

				newImages.push(imageName);
			} else if (imagesExistinglength) {
				newImages.push(imagesExisting[0]);
			}
			if (images.productImageTwoEdit) {
				const imageName = `${NODE_ENV}-${Date.now() * RandomCodeUtility(3)}`;
				await ImagesUploadUtility(imageName, images.productImageTwoEdit);
				newImages.push(imageName);
			} else if (imagesExistinglength > 1) {
				newImages.push(imagesExisting[1]);
			}
			if (images.productImageThreeEdit) {
				const imageName = `${NODE_ENV}-${Date.now() * RandomCodeUtility(3)}`;
				await ImagesUploadUtility(imageName, images.productImageThreeEdit);

				newImages.push(imageName);
			} else if (imagesExistinglength > 2) {
				newImages.push(imagesExisting[2]);
			}
			if (images.productImageFourEdit) {
				const imageName = `${NODE_ENV}-${Date.now() * RandomCodeUtility(3)}`;
				await ImagesUploadUtility(imageName, images.productImageFourEdit);

				newImages.push(imageName);
			} else if (imagesExistinglength > 3) {
				newImages.push(imagesExisting[3]);
			}
		}

		if (keywords && keywords.length > 10) {
			return reject(ResponseUtility.GENERIC_ERR({ message: 'Cannot add more than 10 keywords' }));
		}

		const updateQuery = await SchemaMapperUtility({
			name,
			info,
			category,
			subCategory,
			price: price.trim(),
			currency,
			link,
			keywords,
			images: newImages,
			gender,
			updatedOn: dateNow,
		});

		await ProductModel.findOneAndUpdate({ _id: productId }, updateQuery);
		return resolve(ResponseUtility.SUCCESS({ message: 'Product Edited successfully.' }));
	} catch (err) {
		return reject(ResponseUtility.GENERIC_ERR({ message: err.message, error: err }));
	}
});
