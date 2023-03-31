import { ResponseUtility } from 'appknit-backend-bundle';
import { UserModel } from '../../schemas';
import { PAGINATION_LIMIT, REPORT_TYPE } from '../../constants';
/**
 * @description service model function to view the
 * users entitled to admin
 * @author Abhinav Sharma
 * @since 27 May, 2020
* @updatedBy Santgurlal Singh
* @since 30 June, 2020
*/

export default ({
	page = 1,
	text = '',
	limit = PAGINATION_LIMIT,
	sortBy = {
		field: 'Creation',
		order: 1,
	},
}) => new Promise(async (resolve, reject) => {
	try {
		const sortQuery = { $sort: { createdOn: sortBy.order } };
		if (sortBy.field === 'Creation') {
			sortQuery.$sort = { createdOn: sortBy.order };
		} else if (sortBy.field === 'Name') {
			sortQuery.$sort = { nameLowercase: sortBy.order };
		} else if (sortBy.field === 'Gender') {
			sortQuery.$sort = { gender: sortBy.order };
		} else if (sortBy.field === 'Email') {
			sortQuery.$sort = { emailLowercase: sortBy.order };
		} else if (sortBy.field === 'Reported') {
			sortQuery.$sort = { reported: sortBy.order };
		} else if (sortBy.field === 'Posts') {
			sortQuery.$sort = { posts: sortBy.order };
		}
		const query = [
			{
				$match: {
					$and: [
						{
							$or: [
								{ firstName: { $regex: new RegExp(text, 'i') } },
								{ lastName: { $regex: new RegExp(text, 'i') } },
							],
						},
						{ deleted: false },
					],
				},
			},
			{
				$lookup: {
					from: 'reports',
					let: { id: '$_id', type: REPORT_TYPE.BRAND },
					pipeline: [
						{
							$match: {
								$expr: {
									$and: [
										{ $eq: ['$userRef', '$$id'] },
										{ $eq: ['$reportType', '$$type'] },
									],
								},
							},
						},
					],
					as: 'reports',
				},
			},
			{
				$lookup: {
					from: 'posts',
					let: { id: '$_id' },
					pipeline: [
						{
							$match: {
								$expr: {
									$and: [
										{ $eq: ['$userRef', '$$id'] },
										{ $eq: ['$status', true] },
									],
								},
							},
						},
					],
					as: 'posts',
				},
			},
			{
				$lookup: {
					from: 'reports',
					let: { id: '$_id', type: REPORT_TYPE.REVIEW },
					pipeline: [
						{
							$match: {
								$expr: {
									$and: [
										{ $eq: ['$userRef', '$$id'] },
										{ $eq: ['$reportType', '$$type'] },
									],
								},
							},
						},
					],
					as: 'reviews',
				},
			},
			{
				$lookup: {
					from: 'followbrands',
					let: { id: '$_id' },
					pipeline: [
						{
							$match: {
								$expr: {
									$and: [
										{ $eq: ['$userRef', '$$id'] },
									],
								},
							},
						},
					],
					as: 'following',
				},
			},
			{
				$project: {
					name: { $concat: ['$firstName', ' ', '$lastName'] },
					nameLowercase: { $toLower: '$firstName' },
					gender: '$gender',
					email: '$email',
					emailLowercase: { $toLower: '$email' },
					creation: '$createdOn',
					firstName: '$firstName',
					lastName: '$lastName',
					dateOfBirth: '$dateOfBirth',
					blocked: '$blocked',
					createdOn: '$createdOn',
					reported: { $size: '$reports' },
					reviews: { $size: '$reviews' },
					following: { $size: '$following' },
					posts: { $size: '$posts' },
				},
			},
			sortQuery,
			{ $skip: (page - 1) * limit },
			{ $limit: limit },
		];
		const data = await UserModel.aggregate(query);
		const totalItems = await UserModel.countDocuments({
			$and: [
				{
					$or: [
						{ firstName: { $regex: new RegExp(text, 'i') } },
						{ lastName: { $regex: new RegExp(text, 'i') } },
					],
				},
				{ deleted: false },
			],
		});
		return resolve(ResponseUtility.SUCCESS_PAGINATION(
			{ data: { list: data, totalItems }, page, limit },
		));
	} catch (err) {
		return reject(ResponseUtility.GENERIC_ERR({ message: err.message, error: err }));
	}
});
