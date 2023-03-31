import {
	ResponseUtility,
	PropsValidationUtility,
} from 'appknit-backend-bundle';
import { Types } from 'mongoose';
import {
	RateAndReviewModel,
	ProductModel,
	UserModel,
} from '../../schemas';
import { REVIEW_TYPE } from '../../constants';

/**
 * @description A service model function to handle the
 *  addition and updation of rating and review of product.
 * @param {String} id the unique id of a user.
 * @param {String} productRef the uique id of a product.
 * @param {Number} rate  the rating to a product. 1 to 5
 * @param {String} title  the title of a review.
 * @param {String} review review given by user.
 * @author Jagmohan Singh
 * @since 7 May 2020
 */


export default ({
	id,
	productRef,
	rating,
	title,
	review,
}) => new Promise(async (resolve, reject) => {
	try {
		const user = await UserModel.findOne({ _id: id });

		if (!user || user.deleted) {
			return reject(ResponseUtility.GENERIC_ERR({ code: 401, message: 'Requested user not found.' }));
		}

		if (user.blocked) {
			return reject(ResponseUtility.GENERIC_ERR({ code: 401, message: 'Your account has been blocked by admin.' }));
		}

		const { code, message } = await PropsValidationUtility({
			validProps: ['productRef', 'rating', 'title', 'review'],
			sourceDocument: {
				productRef, rating, title, review,
			},
		});

		if (code !== 100) {
			return reject(ResponseUtility.MISSING_PROPS({ message }));
		}
		const productInfo = await ProductModel.findOne({
			_id: productRef, deleted: false,
		});

		if (!productInfo) {
			return reject(ResponseUtility.GENERIC_ERR({ message: 'Invalid product.' }));
		}

		const userReviewInfo = await RateAndReviewModel.findOne({
			userRef: Types.ObjectId.createFromHexString(id),
			productRef: Types.ObjectId.createFromHexString(productRef),
		});

		const dateNow = new Date().getTime();

		if (userReviewInfo) {
			return reject(ResponseUtility.GENERIC_ERR({ message: 'You already give review on this product.' }));
		}

		const rateAndReviewObject = new RateAndReviewModel({
			userRef: id,
			productRef,
			rating,
			title,
			review,
			type: REVIEW_TYPE.PRODUCT,
			createdOn: dateNow,
			updatedOn: dateNow,
		});
		await rateAndReviewObject.save();
		return resolve(ResponseUtility.SUCCESS({ data: rateAndReviewObject }));
	} catch (err) {
		return reject(ResponseUtility.GENERIC_ERR({ message: err.message, error: err }));
	}
});
