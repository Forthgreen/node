import {
	ResponseUtility,
} from 'appknit-backend-bundle';
import {
	ProductModel,
	BrandModel,
} from '../../schemas';
import {
	AMQP_QUEUES,
} from '../../constants';

/**
* @description This service model function handles the
* delete a product in a brand
* @author Santgurlal Singh
* @since 8 may 2020
* @param {String} id the unique id of brand.
* @param {String} productRef the unique id of product.
*/

export default ({
	id,
	productRef,
	AMQPChannel,
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

		const product = await ProductModel.findOneAndUpdate({
			_id: productRef,
			brandRef: id,
			deleted: false,
		},
		{
			deleted: true,
		});
		if (!product) {
			return reject(ResponseUtility.GENERIC_ERR({ message: 'No product found.' }));
		}
		product.images.forEach((element) => {
			AMQPChannel.sendToQueue(
				AMQP_QUEUES.PICTURE_DELETE,
				Buffer.from(JSON.stringify({
					name: element,
				})),
			);
		});
		return resolve(ResponseUtility.SUCCESS({ message: 'Product Removed Successfully.' }));
	} catch (err) {
		return reject(ResponseUtility.GENERIC_ERR({ message: err.message, error: err }));
	}
});
