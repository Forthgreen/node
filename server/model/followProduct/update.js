import {
	ResponseUtility,
} from 'appknit-backend-bundle';
import {
	ProductModel,
	FollowProductModel,
	UserModel,
} from '../../schemas';

/**
 * @description A service model function to handle the following of products
 * @param {String} productRef the uique id of a product.
 * @param {Boolean} status the status to update.
 * @author Santgurlal Singh
 * @since 15 Jan, 2020
 */

export default ({
	id,
	productRef,
	status,
}) => new Promise(async (resolve, reject) => {
	try {
		const user = await UserModel.findOne({ _id: id });

		if (!user || user.deleted) {
			return reject(ResponseUtility.GENERIC_ERR({ code: 401, message: 'Requested user not found.' }));
		}

		if (user.blocked) {
			return reject(ResponseUtility.GENERIC_ERR({ code: 401, message: 'Your account has been blocked by admin.' }));
		}

		if (!productRef || typeof status !== 'boolean') {
			return reject(ResponseUtility.MISSING_PROPS({ message: `Missing property ${productRef ? 'status' : 'productRef'}.` }));
		}

		const productDetails = await ProductModel.findOne({
			_id: productRef,
			deleted: false,
		});

		if (!productDetails) {
			return reject(ResponseUtility.GENERIC_ERR({ message: 'Invalid product.' }));
		}

		const productFollow = await FollowProductModel.findOne({
			userRef: id,
			productRef,
		});

		const dateNow = new Date();

		if (status) {
			if (productFollow) {
				return reject(ResponseUtility.GENERIC_ERR({ message: 'You are already following this product.' }));
			}
			const followproductObject = new FollowProductModel({
				productRef,
				userRef: id,
				createdOn: dateNow,
				updatedOn: dateNow,
			});
			await followproductObject.save();
		} else {
			if (!productFollow) {
				return reject(ResponseUtility.GENERIC_ERR({ message: 'You are not following this product.' }));
			}
			// eslint-disable-next-line no-underscore-dangle
			await FollowProductModel.findOneAndRemove({ _id: productFollow._id });
		}

		return resolve(ResponseUtility.SUCCESS({ message: 'Follow status updated.' }));
	} catch (err) {
		return reject(ResponseUtility.GENERIC_ERR({ message: err.message, error: err }));
	}
});
