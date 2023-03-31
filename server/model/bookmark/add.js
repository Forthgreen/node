/**
 * @description A service model function to handle addition and updation of bookmark.
 * @author Nikhil Negi
 * @since 21-10-2021
*/

import {
	ResponseUtility,
} from 'appknit-backend-bundle';
import {
	ProductModel,
	UserModel,
	BrandModel,
	RestaurantModel,
	BookmarkModel,
} from '../../schemas';
import { BOOKMARK_TYPE } from '../../constants';

export default ({
	id,
	ref,
	refType,
	status = true,
}) => new Promise(async (resolve, reject) => {
	try {
		const user = await UserModel.findOne({ _id: id });

		if (!user || user.deleted) {
			return reject(ResponseUtility.GENERIC_ERR({ code: 401, message: 'Requested user not found.' }));
		}

		if (user.blocked) {
			return reject(ResponseUtility.GENERIC_ERR({ code: 401, message: 'Your account has been blocked by admin.' }));
		}

		if (!ref || !refType) {
			return reject(ResponseUtility.GENERIC_ERR({ message: `Missing required property ${ref ? 'refType' : 'ref'}` }));
		}

		let check;
		if (refType === BOOKMARK_TYPE.PRODUCT) {
			check = await ProductModel.findOne({
				_id: ref, deleted: false, blocked: false,
			});
			if (!check) {
				return reject(ResponseUtility.GENERIC_ERR({ message: 'Invalid product.' }));
			}
		} else if (refType === BOOKMARK_TYPE.BRAND) {
			check = await BrandModel.findOne({
				_id: ref, deleted: false, blocked: false,
			});
			if (!check) {
				return reject(ResponseUtility.GENERIC_ERR({ message: 'Invalid brand.' }));
			}
		} else if (refType === BOOKMARK_TYPE.RESTAURANT) {
			check = await RestaurantModel.findOne({
				_id: ref, deleted: false, blocked: false,
			});

			if (!check) {
				return reject(ResponseUtility.GENERIC_ERR({ message: 'Invalid Restaurant.' }));
			}
		} else {
			return reject(ResponseUtility.GENERIC_ERR({ message: 'Invalid refType.' }));
		}

		const bookmarkObject = await BookmarkModel.findOneAndUpdate({
			ref,
			refType,
			userRef: id,
		}, { status, updatedOn: new Date() }, { upsert: true, setDefaultsOnInsert: true, new: true });

		return resolve(ResponseUtility.SUCCESS({ message: `Bookmark ${status ? '' : 'removed'} successfully.`, data: bookmarkObject }));
	} catch (err) {
		return reject(ResponseUtility.GENERIC_ERR({ message: err.message, error: err }));
	}
});
