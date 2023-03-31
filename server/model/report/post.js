import {
	ResponseUtility,
	EmailServices,
} from 'appknit-backend-bundle';

import {
	ReportModel,
	UserModel,
	PostModel,
} from '../../schemas';

import {
	REPORT_TYPE,
} from '../../constants';

const { REPORT_MAIL } = process.env;

/**
 * @description A service model function to report the post.
 * @param {String} id the unique id of a user.
 * @param {String} feedback the other feedback user want to give.
 * @param {Number} postRef  the uique id of a post.
 * @author Nikhil Negi
 * @since 17-04-2021
 */


export default ({
	id,
	postRef,
	reportType = REPORT_TYPE.POST,
}) => new Promise(async (resolve, reject) => {
	try {
		if (!postRef) {
			return reject(ResponseUtility.GENERIC_ERR({ message: 'Missing Property PostRef' }));
		}

		const user = await UserModel.findOne({ _id: id });
		if (!user || user.deleted) {
			return reject(ResponseUtility.GENERIC_ERR({ code: 401, message: 'Requested user not found.' }));
		}

		if (user.blocked) {
			return reject(ResponseUtility.GENERIC_ERR({ code: 401, message: 'Your account has been blocked by admin.' }));
		}

		const checkPost = await PostModel.findOne({
			_id: postRef,
			status: true,
			userRef: { $ne: id },
		});
		if (!checkPost) {
			return reject(ResponseUtility.GENERIC_ERR({ message: 'Invalid postRef.' }));
		}

		const dateNow = new Date().getTime();
		const userReportInfo = await ReportModel.findOne({
			userRef: id,
			ref: postRef,
			reportType: REPORT_TYPE.POST,
		});

		if (userReportInfo) {
			return reject(ResponseUtility.GENERIC_ERR({ message: 'You already reported this post.' }));
		}

		const reportReviewObject = new ReportModel({
			userRef: id,
			ref: postRef,
			reportType,
			createdOn: dateNow,
			upsatedOn: dateNow,
		});
		await reportReviewObject.save();
		EmailServices({
			to: REPORT_MAIL,
			text: `${user.firstName} reported post.`,
			subject: 'New Report',
		});
		return resolve(ResponseUtility.SUCCESS({ message: 'Reported successfully' }));
	} catch (err) {
		return reject(ResponseUtility.GENERIC_ERR({ message: err.message, error: err }));
	}
});
