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
* review
* @author Abhinav Sharma
* @since 30 May, 2020
*/

export default ({
	reviewRef,
	status,
}) => new Promise(async (resolve, reject) => {
	try {
		if (!reviewRef) {
			return reject(ResponseUtility.GENERIC_ERR({ message: 'reviewRef is required' }));
		}

		const updateReview = await RateAndReviewModel.findOneAndUpdate(
			{ _id: reviewRef, freeze: !status },
			{ $set: { freeze: status, updatedOn: new Date() } }, { new: true },
		);

		if (!updateReview) {
			return reject(ResponseUtility.GENERIC_ERR({ message: 'Invalid review' }));
		}
		return resolve(ResponseUtility.SUCCESS({ data: updateReview }));
	} catch (err) {
		return reject(ResponseUtility.GENERIC_ERR({ message: err.message, error: err }));
	}
});
