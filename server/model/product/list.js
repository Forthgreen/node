import {
	ResponseUtility,
} from 'appknit-backend-bundle';
import {
	BrandModel,
	ProductModel,
} from '../../schemas';
import { ObjectId } from 'mongodb';

/**
* @description This service model function handles the
* listing of products in a brand
* @author Santgurlal Singh
* @since 8 may 2020
* @param {String} id the unique id of brand.
*/

export default ({
	id,
	text = '',
	page = 1,
	limit = 30,
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

		const textRegex = new RegExp(text, 'i');
		const list = await ProductModel.find({
			$and: [
				{ brandRef: ObjectId.createFromHexString(id) },
				{ $or: [{ name: { $regex: textRegex } }, { info: { $regex: textRegex } }] },
				{ deleted: false },
				{ blocked: false },
			],
		}).sort({ topDate: -1 }).skip(limit * (page - 1)).limit(limit);
		const totalItems = await ProductModel.countDocuments({
			$and: [
				{ brandRef: ObjectId.createFromHexString(id) },
				{ $or: [{ name: { $regex: textRegex } }, { info: { $regex: textRegex } }] },
				{ deleted: false },
				{ blocked: false },
			],
		});
		const productsNotUploaded = await ProductModel.countDocuments({
			$and: [
				{ brandRef: ObjectId.createFromHexString(id) },
				{ deleted: false },
				{ blocked: false },
				{ uploadedToProfile: false },
			],
		});

		if (text) {
			const textRegex = new RegExp(text, 'i');
			const list = await ProductModel.find({
				$and: [
					{ brandRef: ObjectId.createFromHexString(id) },
					{ $or: [{ name: { $regex: textRegex } }, { info: { $regex: textRegex } }] },
					{ deleted: false },
					{ blocked: false },
					{ isHidden: { $ne: true } }
				],
			}).sort({ topDate: -1 }).skip(limit * (page - 1)).limit(limit);
			const totalItems = await ProductModel.countDocuments({
				$and: [
					{ brandRef: ObjectId.createFromHexString(id) },
					{ $or: [{ name: { $regex: textRegex } }, { info: { $regex: textRegex } }] },
					{ deleted: false },
					{ blocked: false },
				],
			});
			const productsNotUploaded = await ProductModel.countDocuments({
				$and: [
					{ brandRef: ObjectId.createFromHexString(id) },
					{ deleted: false },
					{ blocked: false },
					{ uploadedToProfile: false },
				],
			});
			return resolve(ResponseUtility.SUCCESS_PAGINATION(
				{ data: { list, totalItems, productsNotUploaded }, page, limit },
			));
		}
		return resolve(ResponseUtility.SUCCESS_PAGINATION(
			{ data: { list, totalItems, productsNotUploaded }, page, limit },
		));
	} catch (err) {
		return reject(ResponseUtility.GENERIC_ERR({ message: err.message, error: err }));
	}
});
