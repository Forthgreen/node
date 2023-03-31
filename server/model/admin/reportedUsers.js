import { ResponseUtility } from 'appknit-backend-bundle';
import { ReportModel } from '../../schemas';
import { REPORT_TYPE, PAGINATION_LIMIT } from '../../constants';

/**
 * @description service model function to view
 * reported users
 * @author Nikhil Negi
 * @since 23-04-2021
 */

export default ({
	page = 1,
	limit = PAGINATION_LIMIT,
	sortBy = {
		field: 'dateOfReport',
		order: 1,
	},
}) => new Promise(async (resolve, reject) => {
	try {
		const sortQuery = { $sort: { createdOn: sortBy.order } };
		if (sortBy.field === 'dateOfReport') {
			sortQuery.$sort = { dateOfReport: sortBy.order };
		} else if (sortBy.field === 'reportedBy') {
			sortQuery.$sort = { reportedBy: sortBy.order };
		} else if (sortBy.field === 'feedback') {
			sortQuery.$sort = { feedback: sortBy.order };
		} else if (sortBy.field === 'userReportType') {
			sortQuery.$sort = { refReportType: sortBy.order };
		} else if (sortBy.field === 'report') {
			sortQuery.$sort = { report: sortBy.order };
		}
		const query = [
			{
				$match: { reportType: REPORT_TYPE.USER },
			},
			{
				$lookup: {
					from: 'users',
					let: { id: '$ref' },
					pipeline: [
						{ $match: { $expr: { $and: [{ $eq: ['$_id', '$$id'] }] } } },
					],
					as: 'reportedTo',
				},
			},
			{ $unwind: '$reportedTo' },
			{
				$lookup: {
					from: 'users',
					let: { id: '$userRef' },
					pipeline: [
						{ $match: { $expr: { $and: [{ $eq: ['$_id', '$$id'] }] } } },
					],
					as: 'reportedBy',
				},
			},
			{ $unwind: '$reportedBy' },
			{
				$project: {
					dateOfReport: '$createdOn',
					report: '$reportedTo.email',
					reportedBy: '$reportedBy.email',
					feedback: '$feedback',
					userReportType: '$refReportType',
				},
			},
			sortQuery,
			{ $skip: (page - 1) * limit },
			{ $limit: limit },
		];
		const data = await ReportModel.aggregate(query);
		const total = await ReportModel.countDocuments({
			reportType: REPORT_TYPE.USER,
		});
		return resolve(ResponseUtility.SUCCESS_PAGINATION(
			{ data: { list: data, total }, page, limit },
		));
	} catch (err) {
		return reject(
			ResponseUtility.GENERIC_ERR({ message: err.message, error: err }),
		);
	}
});
