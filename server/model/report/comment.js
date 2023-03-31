import {
	ResponseUtility,
	EmailServices,
} from 'appknit-backend-bundle';

import {
	ReportModel,
	UserModel,
	CommentModel,
} from '../../schemas';

import {
	REPORT_TYPE,
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
	commentRef,
	reportType = REPORT_TYPE.COMMENT,
}) => new Promise(async (resolve, reject) => {
	try {
		if (!commentRef) {
			return reject(ResponseUtility.GENERIC_ERR({ message: 'Missing Property commentRef' }));
		}

		const user = await UserModel.findOne({ _id: id });
		if (!user || user.deleted) {
			return reject(ResponseUtility.GENERIC_ERR({ code: 401, message: 'Requested user not found.' }));
		}

		if (user.blocked) {
			return reject(ResponseUtility.GENERIC_ERR({ code: 401, message: 'Your account has been blocked by admin.' }));
		}

		const checkComment = await CommentModel.findOne({
			_id: commentRef,
			status: true,
			userRef: { $ne: id },
		});
		if (!checkComment) {
			return reject(ResponseUtility.GENERIC_ERR({ message: 'Invalid commentRef.' }));
		}

		const dateNow = new Date().getTime();
		const userReportInfo = await ReportModel.findOne({
			userRef: id,
			ref: commentRef,
			reportType: REPORT_TYPE.COMMENT,
		});

		if (userReportInfo) {
			return reject(ResponseUtility.GENERIC_ERR({ message: `You already reported this ${checkComment.commentRef ? 'reply' : 'comment'}.` }));
		}

		const reportReviewObject = new ReportModel({
			userRef: id,
			ref: commentRef,
			reportType,
			createdOn: dateNow,
			upsatedOn: dateNow,
		});
		await reportReviewObject.save();
		EmailServices({
			to: REPORT_MAIL,
			text: `${user.firstName} reported ${checkComment.commentRef ? 'reply' : 'comment'} '${checkComment.comment}'.`,
			subject: 'New Report',
		});
		return resolve(ResponseUtility.SUCCESS({ message: 'Reported successfully' }));
	} catch (err) {
		return reject(ResponseUtility.GENERIC_ERR({ message: err.message, error: err }));
	}
});
