import {
	ResponseUtility,
} from 'appknit-backend-bundle';
import {
	RestaurantModel,
	FollowRestaurantModel,
	UserModel,
} from '../../schemas';

/**
* @description A service model function to handle the following of restaurants
* @param {String} restaurantRef the uique id of a brand.
* @param {Boolean} status the status to update.
* @author Santgurlal Singh
* @since 7 Oct, 2020
*/

export default ({
	id,
	restaurantRef,
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

		if (!restaurantRef || typeof status !== 'boolean') {
			return reject(ResponseUtility.MISSING_PROPS({ message: `Missing property ${restaurantRef ? 'status' : 'restaurantRef'}.` }));
		}

		const restaurantDetails = await RestaurantModel.findOne({
			_id: restaurantRef,
			deleted: false,
		});

		if (!restaurantDetails) {
			return reject(ResponseUtility.GENERIC_ERR({ message: 'Invalid Restaurant.' }));
		}

		const restaurantFollow = await FollowRestaurantModel.findOne({
			userRef: id,
			restaurantRef,
		});

		const dateNow = new Date();

		if (status) {
			if (restaurantFollow) {
				return reject(ResponseUtility.GENERIC_ERR({ message: 'You are already following this restaurant.' }));
			}
			const followRestaurantObject = new FollowRestaurantModel({
				restaurantRef,
				userRef: id,
				createdOn: dateNow,
				updatedOn: dateNow,
			});
			await followRestaurantObject.save();
		} else {
			if (!restaurantFollow) {
				return reject(ResponseUtility.GENERIC_ERR({ message: 'You are not following this restaurant.' }));
			}
			// eslint-disable-next-line no-underscore-dangle
			await FollowRestaurantModel.findOneAndRemove({ _id: restaurantFollow._id });
		}

		return resolve(ResponseUtility.SUCCESS({ message: 'Follow status updated.' }));
	} catch (err) {
		return reject(ResponseUtility.GENERIC_ERR({ message: err.message, error: err }));
	}
});
