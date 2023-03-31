import {
	ResponseUtility,
	PropsValidationUtility,
} from 'appknit-backend-bundle';
import {
	RateAndReviewModel,
	RestaurantModel,
	UserModel,
} from '../../schemas';
import { REVIEW_TYPE } from '../../constants';

/**
* @description A service model function to handle the
*  addition and updation of rating and review of restaurant.
* @param {String} id the unique id of a user.
* @param {String} restaurantRef the uique id of a restaurant.
* @param {Number} rate  the rating to a restaurant. 1 to 5
* @param {String} title  the title of a review.
* @param {String} review review given by user.
* @author Santgurlal Singh
* @since 6 Oct, 2020
*/


export default ({
	id,
	restaurantRef,
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
			validProps: ['restaurantRef', 'rating', 'title', 'review'],
			sourceDocument: {
				restaurantRef, rating, title, review,
			},
		});

		if (code !== 100) {
			return reject(ResponseUtility.MISSING_PROPS({ message }));
		}
		const restaurantInfo = await RestaurantModel.findOne({
			_id: restaurantRef, deleted: false,
		});

		if (!restaurantInfo) {
			return reject(ResponseUtility.GENERIC_ERR({ message: 'Invalid Restaurant.' }));
		}

		const userReviewInfo = await RateAndReviewModel.findOne({
			userRef: id,
			restaurantRef,
		});

		const dateNow = new Date();

		if (userReviewInfo) {
			return reject(ResponseUtility.GENERIC_ERR({ message: 'You already give review for this restaurant.' }));
		}

		const rateAndReviewObject = new RateAndReviewModel({
			userRef: id,
			restaurantRef,
			type: REVIEW_TYPE.RESTAURANT,
			rating,
			title,
			review,
			createdOn: dateNow,
			updatedOn: dateNow,
		});
		await rateAndReviewObject.save();
		return resolve(ResponseUtility.SUCCESS({ data: rateAndReviewObject }));
	} catch (err) {
		return reject(ResponseUtility.GENERIC_ERR({ message: err.message, error: err }));
	}
});
