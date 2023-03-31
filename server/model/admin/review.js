import { ResponseUtility } from 'appknit-backend-bundle';
import { ReportModel } from '../../schemas';
import { REPORT_TYPE, PAGINATION_LIMIT } from '../../constants';
/**
 * @description service model function to view
 * reviews of brands
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
			sortQuery.$sort = { dateOfReview: sortBy.order };
		} else if (sortBy.field === 'reportedBy') {
			sortQuery.$sort = { reportedByLowercase: sortBy.order };
		} else if (sortBy.field === 'report') {
			sortQuery.$sort = { reportLowercase: sortBy.order };
		} else if (sortBy.field === 'review') {
			sortQuery.$sort = { review: sortBy.order };
		} else if (sortBy.field === 'freeze') {
			sortQuery.$sort = { freeze: sortBy.order };
		}
		const query = [
			{
				$match: { reportType: REPORT_TYPE.REVIEW },
			},
			{
				$lookup: {
					from: 'rateandreviews',
					let: { id: '$reviewRef' },
					pipeline: [
						{
							$match:
							{
								$expr:
								{
									$and: [
										{ $eq: ['$_id', '$$id'] },
										{ $eq: ['$freeze', false] },
									],
								},
							},
						},
						{
							$lookup: {
								from: 'users',
								let: { userRef: '$userRef' },
								pipeline: [
									{ $match: { $expr: { $and: [{ $eq: ['$_id', '$$userRef'] }] } } },
								],
								as: 'user',
							},
						},
						{ $unwind: '$user' },
					],
					as: 'reviews',
				},
			},
			{ $unwind: '$reviews' },
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
					dateOfReview: '$createdOn',
					focus: 1,
					reviewRef: '$reviews._id',
					isFreeze: '$reviews.freeze',
					brandName: '$brands.name',
					reportedBy: '$users.email',
					reportedByLowercase: { $toLower: '$users.email' },
					review: '$reviews.review',
					report: '$reviews.user.email',
					reportLowercase: { $toLower: '$reviews.user.email' },
					reportId: '$reviews.user._id',
					freeze: '$reviews.user.blocked',
					typeOfReport: '$brandReportType',
				},
			},
			sortQuery,
			{ $skip: (page - 1) * limit },
			{ $limit: limit },
		];
		const data = await ReportModel.aggregate(query);
		const total = await ReportModel.aggregate([
			{
				$match: { reportType: REPORT_TYPE.REVIEW },
			},
			{
				$lookup: {
					from: 'rateandreviews',
					let: { id: '$reviewRef' },
					pipeline: [
						{
							$match:
							{
								$expr:
								{
									$and: [
										{ $eq: ['$_id', '$$id'] },
										{ $eq: ['$freeze', false] },
									],
								},
							},
						},
						{
							$lookup: {
								from: 'users',
								let: { userRef: '$userRef' },
								pipeline: [
									{ $match: { $expr: { $and: [{ $eq: ['$_id', '$$userRef'] }] } } },
								],
								as: 'user',
							},
						},
						{ $unwind: '$user' },
					],
					as: 'reviews',
				},
			},
			{ $unwind: '$reviews' },
		]);
		return resolve(ResponseUtility.SUCCESS_PAGINATION(
			{ data: { list: data, total: total.length }, page, limit },
		));
	} catch (err) {
		return reject(
			ResponseUtility.GENERIC_ERR({ message: err.message, error: err }),
		);
	}
});
