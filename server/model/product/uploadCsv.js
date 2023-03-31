/* eslint-disable guard-for-in */
import {
	ResponseUtility,
	RandomCodeUtility,
	SchemaMapperUtility,
	S3Services,
} from 'appknit-backend-bundle';
import fs from 'fs';
import { csv } from 'csvtojson';
import { DownloadFileService } from '../../services';
import {
	BrandModel,
	ProductModel,
} from '../../schemas';

import {
	MAX_PRODUCTS_FOR_FREE_USER,
	NODE_ENV,
	S3_IMAGES,
} from '../../constants';

/**
* @description A service model function to handle the
* upload of prodcuts via csv file
* @param {Object} images object of files.
* @author Santgurlal Singh
* @date 8 may 2020
*/
export default ({
	id,
	images,
	owerwrite = false,
}) => new Promise(async (resolve, reject) => {
	try {
		const dateNow = new Date().getTime();
		if (!images || !images.file) {
			return reject(ResponseUtility.GENERIC_ERR({ message: 'No Csv file found.' }));
		}

		const brand = await BrandModel.findOne({
			_id: id,
			deleted: false,
		});

		if (!brand || brand.deleted) {
			return reject(ResponseUtility.GENERIC_ERR({ code: 401, message: 'Requested brand not found.' }));
		}

		if (brand.blocked) {
			return reject(ResponseUtility.GENERIC_ERR({ code: 401, message: 'Your account has been blocked by admin.' }));
		}

		const products = await csv().fromString(images.file.data.toString());

		if (!brand.isPremium) {
			const productCount = await ProductModel.countDocuments({
				brandRef: id, deleted: false,
			});
			if (productCount >= MAX_PRODUCTS_FOR_FREE_USER
				|| ((productCount + products.length) > MAX_PRODUCTS_FOR_FREE_USER)) {
				return reject(ResponseUtility.GENERIC_ERR({ code: 121, message: 'You have reached the limit of products for the Starter users.' }));
			}
		}

		const productAddPromises = [];
		const imageSavePromises = [];
		products.forEach((element) => {
			productAddPromises.push(
				new Promise(async (resolve_, reject_) => {
					try {
						const imageNamesArray = [];
						const imagesArray = element.images.split(',');
						imagesArray.forEach((element_) => {
							const imageName = `${NODE_ENV}-${Date.now() * RandomCodeUtility(3)}`;
							imageNamesArray.push(imageName);
							imageSavePromises.push(
								new Promise(async (resolve__, reject__) => {
									try {
										const filePath = `./tempFiles/${imageName}.png`;
										try {
											await DownloadFileService(
												element_,
												filePath,
											);
										} catch (error) {
											reject_(error);
										}
										const fileContent = fs.readFileSync(filePath);
										fs.unlinkSync(filePath);
										S3Services.uploadPublicObject({
											Bucket: S3_IMAGES.GLOBAL_IMAGES,
											Key: imageName,
											data: Buffer.from(fileContent),
										});
										resolve__();
									} catch (error) {
										reject__(error);
									}
								}),
							);
						});
						const {
							name,
							info,
							category,
							price,
							link,
						} = element;
						let productExists;
						if (owerwrite) {
							productExists = await ProductModel.findOne({ name });
						}
						if (owerwrite && productExists) {
							const updateQuery = await SchemaMapperUtility({
								name,
								info,
								category,
								price,
								link,
								images: imageNamesArray,
								updatedOn: dateNow,
							});
							await ProductModel.findOneAndUpdate({ _id: productExists._id }, updateQuery);
						} else {
							const productObject = new ProductModel({
								brandRef: id,
								name,
								info,
								category,
								price,
								link,
								images: imageNamesArray,
								createdOn: dateNow,
								updatedOn: dateNow,
							});
							await productObject.save();
						}
						resolve_();
					} catch (error) {
						reject_(error);
					}
				}),
			);
		});

		await Promise.all(imageSavePromises);
		await Promise.all(productAddPromises);

		return resolve(ResponseUtility.SUCCESS({ message: 'Products Uploaded Successfully.' }));
	} catch (err) {
		return reject(ResponseUtility.GENERIC_ERR({ message: err.message, error: err }));
	}
});
