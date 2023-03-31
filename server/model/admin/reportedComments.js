import { ResponseUtility } from 'appknit-backend-bundle';
import { ReportModel } from '../../schemas';
import { REPORT_TYPE, PAGINATION_LIMIT } from '../../constants';

/**
 * @description service model function to view
 * reported comments
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
		} else if (sortBy.field === 'postText') {
			sortQuery.$sort = { postTextLowercase: sortBy.order };
		} else if (sortBy.field === 'reportedBy') {
			sortQuery.$sort = { reportedBy: sortBy.order };
		} else if (sortBy.field === 'feedback') {
			sortQuery.$sort = { feedback: sortBy.order };
		} else if (sortBy.field === 'commentReportType') {
			sortQuery.$sort = { refReportType: sortBy.order };
		} else if (sortBy.field === 'report') {
			sortQuery.$sort = { report: sortBy.order };
		}
		const query = [
			{
				$match: { reportType: REPORT_TYPE.COMMENT },
			},
			{
				$lookup: {
					from: 'comments',
					let: { id: '$ref' },
					pipeline: [
						{
							$match:
							{
								$expr:
								{
									$and: [
										{ $eq: ['$_id', '$$id'] },
										{ $eq: ['$status', true] },
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
						{
							$lookup: {
								from: 'posts',
								let: { postRef: '$postRef' },
								pipeline: [
									{
										$match:
										{
											$expr:
											{
												$and: [
													{ $eq: ['$_id', '$$postRef'] },
													{ $eq: ['$status', true] },
												],
											},
										},
									},
								],
								as: 'post',
							},
						},
						{ $unwind: '$post' },
					],
					as: 'comment',
				},
			},
			{ $unwind: '$comment' },
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
					postText: '$comment.post.text',
					commentText: '$comment.comment',
					commentId: '$comment._id',
					postTextLowercase: { $toLower: '$comment.post.text' },
					reportedBy: '$reportedBy.email',
					feedback: '$feedback',
					postReportType: '$refReportType',
					report: '$comment.user.email',
				},
			},
			sortQuery,
			{ $skip: (page - 1) * limit },
			{ $limit: limit },
		];
		const data = await ReportModel.aggregate(query);
		const total = await ReportModel.aggregate([
			{
				$match: { reportType: REPORT_TYPE.COMMENT },
			},
			{
				$lookup: {
					from: 'comments',
					let: { id: '$ref' },
					pipeline: [
						{
							$match:
							{
								$expr:
								{
									$and: [
										{ $eq: ['$_id', '$$id'] },
										{ $eq: ['$status', true] },
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
						{
							$lookup: {
								from: 'posts',
								let: { postRef: '$postRef' },
								pipeline: [
									{
										$match:
										{
											$expr:
											{
												$and: [
													{ $eq: ['$_id', '$$postRef'] },
													{ $eq: ['$status', true] },
												],
											},
										},
									},
								],
								as: 'post',
							},
						},
						{ $unwind: '$post' },
					],
					as: 'comment',
				},
			},
			{ $unwind: '$comment' },
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
