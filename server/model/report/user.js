/* eslint-disable no-underscore-dangle */
import {
	ResponseUtility,
	EmailServices,
} from 'appknit-backend-bundle';

import {
	ReportModel,
	UserModel,
} from '../../schemas';

import {
	REPORT_TYPE, USER_REPORT_TYPE,
} from '../../constants';

const { REPORT_MAIL } = process.env;

/**
 * @description A service model function to report the comment.
 * @param {String} id the unique id of a user.
 * @param {String} feedback the other feedback user want to give.
 * @param {Number} commentRef  the uique id of a comment.
 * @author Nikhil Negi
 * @since 22-04-2021
 */


export default ({
	id,
	userRef,
	feedback,
	userReportType,
	reportType = REPORT_TYPE.USER,
}) => new Promise(async (resolve, reject) => {
	try {
		if (!userRef || !userReportType) {
			return reject(ResponseUtility.GENERIC_ERR({ message: `Missing Property ${userRef ? 'userReportType' : 'userRef'}` }));
		}

		const user = await UserModel.findOne({ _id: id });
		if (!user || user.deleted) {
			return reject(ResponseUtility.GENERIC_ERR({ code: 401, message: 'Requested user not found.' }));
		}

		if (user.blocked) {
			return reject(ResponseUtility.GENERIC_ERR({ code: 401, message: 'Your account has been blocked by admin.' }));
		}

		const checkUser = await UserModel.findOne({
			_id: userRef,
			deleted: false,
			blocked: false,
		});
		if (!checkUser || String(checkUser._id) === id) {
			return reject(ResponseUtility.GENERIC_ERR({ message: 'Invalid userRef.' }));
		}

		if (feedback && userReportType !== USER_REPORT_TYPE.OTHERS) {
			return reject(ResponseUtility.GENERIC_ERR({ message: 'You cannot give feedback on this report type.' }));
		}

		const dateNow = new Date().getTime();
		const userReportInfo = await ReportModel.findOne({
			userRef: id,
			ref: userRef,
			reportType: REPORT_TYPE.USER,
		});

		if (userReportInfo) {
			return reject(ResponseUtility.GENERIC_ERR({ message: 'You already reported this user.' }));
		}

		const reportReviewObject = new ReportModel({
			userRef: id,
			ref: userRef,
			refReportType: userReportType,
			feedback: feedback || '',
			reportType,
			createdOn: dateNow,
			upsatedOn: dateNow,
		});
		await reportReviewObject.save();
		EmailServices({
			to: REPORT_MAIL,
			text: `${user.firstName} reported user '${checkUser.firstName}'.`,
			subject: 'New Report',
		});
		return resolve(ResponseUtility.SUCCESS({ message: 'Reported successfully' }));
	} catch (err) {
		return reject(ResponseUtility.GENERIC_ERR({ message: err.message, error: err }));
	}
});
