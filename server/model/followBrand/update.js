import {
	ResponseUtility,
} from 'appknit-backend-bundle';

import { Types } from 'mongoose';
import {
	BrandModel,
	FollowBrandModel,
	UserModel,
} from '../../schemas';

/**
 * @description A service model function to handle the
 *  status of user corresponding to a brand.
 * 1 - FOLLOW BRAND
 * 2 - UNFOLLOW BRANDS
 * @param {String} brandRef the uique id of a brand.
 * @param {Number} status the status to update.
 * 1 - Follow
 * 2 - Unfollow
 * @author Jagmohan Singh
 * @since 2 May 2020
 */


export default ({
	id,
	brandRef,
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

		if (!brandRef || typeof status !== 'boolean') {
			return reject(ResponseUtility.MISSING_PROPS({ message: `Missing property ${brandRef ? 'status' : 'brandRef'}.` }));
		}

		const brandDetails = await BrandModel.findOne({
			_id: Types.ObjectId.createFromHexString(brandRef),
			deleted: false,
			blocked: false,
		});

		if (!brandDetails) {
			return reject(ResponseUtility.GENERIC_ERR({ message: 'Invalid Brand.' }));
		}

		const brandInfo = await FollowBrandModel.findOne({
			userRef: Types.ObjectId.createFromHexString(id),
			brandRef: Types.ObjectId.createFromHexString(brandRef),
		});

		const dateNow = new Date().getTime();

		if (!brandInfo && status === true) {
			const followBrandObject = new FollowBrandModel({
				brandRef,
				userRef: id,
				status,
				lastProductDate: dateNow,
				createdOn: dateNow,
				updatedOn: dateNow,
			});
			await followBrandObject.save();
		} else {
			if ((!brandInfo && status === false)
			|| (brandInfo.status === true && status === true)
			|| (brandInfo.status === false
				&& status === false)) {
				return reject(ResponseUtility.GENERIC_ERR({ message: 'Invalid Status.' }));
			}
			await FollowBrandModel.updateOne({
				userRef: Types.ObjectId.createFromHexString(id),
				brandRef: Types.ObjectId.createFromHexString(brandRef),
			}, { status, lastProductDate: dateNow, updatedOn: dateNow });
		}


		return resolve(ResponseUtility.SUCCESS({ message: 'status updated' }));
	} catch (err) {
		return reject(ResponseUtility.GENERIC_ERR({ message: err.message, error: err }));
	}
});
