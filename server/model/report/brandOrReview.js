import {
	ResponseUtility,
	EmailServices,
} from 'appknit-backend-bundle';

import {
	RateAndReviewModel,
	ReportModel,
	BrandModel,
	UserModel,
} from '../../schemas';

import {
	REPORT_TYPE, BRAND_REPORT_TYPE,
} from '../../constants';

const { REPORT_MAIL } = process.env;

/**
 * @description A service model function to report review of product or brand.
 * @param {String} id the unique id of a user.
 * @param {String} reviewRef the uique id of a review.
 * @param {Number} brandRef  the uique id of a brand.
 * @author Jagmohan Singh
 * @since 7 May 2020
 */


export default ({
	id,
	reportType,
	reviewRef,
	feedback,
	brandReportType,
	brandRef,
}) => new Promise(async (resolve, reject) => {
	try {
		const user = await UserModel.findOne({ _id: id });

		if (!user || user.deleted) {
			return reject(ResponseUtility.GENERIC_ERR({ code: 401, message: 'Requested user not found.' }));
		}

		if (user.blocked) {
			return reject(ResponseUtility.GENERIC_ERR({ code: 401, message: 'Your account has been blocked by admin.' }));
		}

		if (!Object.values(REPORT_TYPE).includes(reportType)) {
			return reject(ResponseUtility.GENERIC_ERR({ message: 'Report type must be brand or review' }));
		}

		if ((reportType === REPORT_TYPE.BRAND && !(brandRef && brandReportType))
		|| ((reportType === REPORT_TYPE.REVIEW || reportType === REPORT_TYPE.RESTAURANT_REVIEW )&& !reviewRef)) {
			return reject(ResponseUtility.GENERIC_ERR({
				message: `${reportType === REPORT_TYPE.BRAND ? 'brandRef or brandReport type' : 'reviewRef'} is missing.`,
			}));
		}

		const getReportCreds = {
			userRef: id,
			reportType,
		};
		const dateNow = new Date().getTime();

		const saveReport = {
			userRef: id,
			reportType,
			createdOn: dateNow,
			updatedOn: dateNow,
		};

		if (reportType === REPORT_TYPE.REVIEW) {
			const reviewInfo = await RateAndReviewModel.findOne({ _id: reviewRef });

			if (!reviewInfo) {
				return reject(ResponseUtility.GENERIC_ERR({ message: 'Invalid review' }));
			}
			getReportCreds.reviewRef = reviewRef;
			saveReport.reviewRef = reviewRef;
		} else if (reportType === REPORT_TYPE.RESTAURANT_REVIEW) {
			const reviewInfo = await RateAndReviewModel.findOne({ _id: reviewRef });

			if (!reviewInfo) {
				return reject(ResponseUtility.GENERIC_ERR({ message: 'Invalid review' }));
			}
			getReportCreds.reviewRef = reviewRef;
			saveReport.reviewRef = reviewRef;
		} else {
			const brandInfo = await BrandModel.findOne({ _id: brandRef, deleted: false, blocked: false });

			if (!brandInfo) {
				return reject(ResponseUtility.GENERIC_ERR({ message: 'Invalid brand' }));
			}

			if (feedback && brandReportType !== BRAND_REPORT_TYPE.OTHERS) {
				return reject(ResponseUtility.GENERIC_ERR({ message: 'You cannot give feedback on this report type.' }));
			}
			getReportCreds.brandRef = brandRef;
			saveReport.brandRef = brandRef;
			saveReport.brandReportType = brandReportType;
			saveReport.feedback = feedback;
		}


		const userReportInfo = await ReportModel.findOne(getReportCreds);

		if (userReportInfo) {
			return reject(ResponseUtility.GENERIC_ERR({ message: 'You already reported.' }));
		}

		const reportReviewObject = new ReportModel(saveReport);
		await reportReviewObject.save();
		EmailServices({
			to: REPORT_MAIL,
			text: `${user.firstName} reported ${reviewRef ? 'brand' : 'review'}.`,
			subject: 'New Report',
		});
		return resolve(ResponseUtility.SUCCESS({ message: 'Reported successfully' }));
	} catch (err) {
		return reject(ResponseUtility.GENERIC_ERR({ message: err.message, error: err }));
	}
});
