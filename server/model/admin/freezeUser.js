import {
	ResponseUtility,
} from 'appknit-backend-bundle';
import {
	UserModel,
	FollowBrandModel,
	RateAndReviewModel,
} from '../../schemas';
/**
* @description service model function to freeze
* account of a specific user entitled to admin
* @author Abhinav Sharma
* @since 30 May, 2020
*/

export default ({
	userId,
}) => new Promise(async (resolve, reject) => {
	try {
		const user = await UserModel.findOne({ _id: userId, deleted: false });
		if (!user) {
			return reject(ResponseUtility.NO_USER({ message: 'Requested user not found' }));
		}
		const date = new Date();

		await UserModel.findOneAndUpdate(
			{ _id: userId }, { $set: { blocked: !user.blocked, updatedOn: date } }, { new: true },
		);
		await FollowBrandModel.updateMany(
			{ userRef: userId }, { $set: { staus: !user.blocked, updatedOn: date } }, { new: true },
		);
		await RateAndReviewModel.updateMany(
			{ userRef: userId }, { $set: { staus: !user.blocked, updatedOn: date } }, { new: true },
		);
		return resolve(ResponseUtility.SUCCESS({}));
	} catch (err) {
		return reject(ResponseUtility.GENERIC_ERR({ message: err.message, error: err }));
	}
});
