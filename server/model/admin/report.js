import { ResponseUtility } from 'appknit-backend-bundle';
import { ReportModel } from '../../schemas';
import { REPORT_TYPE, PAGINATION_LIMIT } from '../../constants';
/**
 * @description service model function to view
 * reports against brands
 * @author Abhinav Sharma
 * @since 28 May, 2020
 */

export default ({
	page = 1,
	limit = PAGINATION_LIMIT,
	sortBy = {
		field: 'date',
		order: 1,
	},
}) => new Promise(async (resolve, reject) => {
	try {
		const sortQuery = { $sort: { createdOn: sortBy.order } };
		if (sortBy.field === 'date') {
			sortQuery.$sort = { dateOfReport: sortBy.order };
		} else if (sortBy.field === 'brandName') {
			sortQuery.$sort = { brandNameLowercase: sortBy.order };
		} else if (sortBy.field === 'typeOfReport') {
			sortQuery.$sort = { typeOfReport: sortBy.order };
		} else if (sortBy.field === 'reportedBy') {
			sortQuery.$sort = { reportedByLowercase: sortBy.order };
		}
		const query = [
			{
				$match: { reportType: REPORT_TYPE.BRAND },
			},
			{
				$lookup: {
					from: 'brands',
					let: { id: '$brandRef' },
					pipeline: [
						{ $match: { $expr: { $and: [{ $eq: ['$_id', '$$id'] }] } } },
					],
					as: 'brands',
				},
			},
			{ $unwind: '$brands' },
			{
				$lookup: {
					from: 'users',
					let: { id: '$userRef' },
					pipeline: [
						{ $match: { $expr: { $and: [{ $eq: ['$_id', '$$id'] }] } } },
					],
					as: 'users',
				},
			},
			{ $unwind: '$users' },
			{
				$project: {
					dateOfReport: '$createdOn',
					focus: 1,
					brandName: '$brands.companyName',
					brandNameLowercase: { $toLower: '$brands.companyName' },
					reportedBy: '$users.email',
					reportedByLowercase: { $toLower: '$users.email' },
					feedback: '$feedback',
					typeOfReport: '$brandReportType',
				},
			},
			sortQuery,
			{ $skip: (page - 1) * limit },
			{ $limit: limit },
		];
		const data = await ReportModel.aggregate(query);
		const total = await ReportModel.countDocuments({
			reportType: REPORT_TYPE.BRAND,
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
