import {
	ResponseUtility,
} from 'appknit-backend-bundle';
import {
	BrandModel,
} from '../../schemas';
import {
	PAGINATION_LIMIT,
} from '../../constants';
/**
* @description service model function to view the
* brands entitled to admin
* @author Abhinav Sharma
* @since 28 May, 2020
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
		const dateNow = new Date();
		const sortQuery = { $sort: { createdOn: sortBy.order } };
		if (sortBy.field === 'Creation') {
			sortQuery.$sort = { createdOn: sortBy.order };
		} else if (sortBy.field === 'Name') {
			sortQuery.$sort = { nameLowercase: sortBy.order };
		} else if (sortBy.field === 'Products') {
			sortQuery.$sort = { products: sortBy.order };
		} else if (sortBy.field === 'Followers') {
			sortQuery.$sort = { followers: sortBy.order };
		} else if (sortBy.field === 'Account') {
			sortQuery.$sort = { isPremium: sortBy.order };
		}
		const query = [
			{
				$match:
					{
						$and: [
							{ deleted: { $eq: false } },
							{ companyName: { $regex: new RegExp(text, 'i') } },
						],
					},
			},
			{
				$lookup:
					{
						from: 'products',
						let: { id: '$_id' },
						pipeline: [
							{
								$match:
								{
									$expr:
									{
										$and:
										[
											{ $eq: ['$brandRef', '$$id'] },
											{ $eq: ['$deleted', false] },
										],
									},
								},
							},
						],
						as: 'products',
					},
			},
			{
				$lookup:
						{
							from: 'followbrands',
							let: { id: '$_id', status: true },
							pipeline: [
								{
									$match:
									{
										$expr:
										{
											$and:
											[
												{ $eq: ['$brandRef', '$$id'] },
												{ $eq: ['$status', '$$status'] },
											],
										},
									},
								},
							],
							as: 'followers',
						},
			},
			{
				$lookup:
				{
					from: 'subscriptions',
					let: { id: '$_id', status: true },
					pipeline: [
						{
							$match:
							{
								$expr:
								{
									$and:
									[
										{ $eq: ['$userRef', '$$id'] },
										{ $eq: ['$isActive', true] },
									],
								},
							},
						},
						{
							$project: {
								createdOn: '$createdOn',
								isPremuim: {
									$cond: [
										{ $eq: ['$cancellationRequested', true] },
										{
											$cond: [
												{ $gte: ['$endsOn', dateNow] },
												false,
												true,
											],
										},
										true,
									],
								},
							},
						},
					],
					as: 'subscription',
				},
			},
			{
				$unwind: {
					path: '$subscription',
					preserveNullAndEmptyArrays: true,
				},
			},
			{
				$lookup:
				{
					from: 'subscriptions',
					let: { id: '$_id' },
					pipeline: [
						{
							$match:
							{
								$expr:
								{
									$and:
									[
										{ $eq: ['$userRef', '$$id'] },
									],
								},
							},
						},
						{
							$sort: {
								createdOn: -1,
							},
						},
						{
							$limit: 1,
						},
						{
							$project: {
								createdOn: '$createdOn',
								endsOn: '$endsOn',
							},
						},
					],
					as: 'subscriptionLatest',
				},
			},
			{
				$unwind: {
					path: '$subscriptionLatest',
					preserveNullAndEmptyArrays: true,
				},
			},
			{
				$project:
					{
						companyName: '$companyName',
						nameLowercase: { $toLower: '$companyName' },
						isPremium: {
							$cond: [
								{ $eq: ['$subscription.isPremuim', true] },
								true,
								false,
							],
						},
						isVerifiedByAdmin: '$isVerifiedByAdmin',
						premiumStartData: '$subscription.createdOn',
						premiumEndData: '$subscriptionLatest.endsOn',
						creation: '$createdOn',
						focus: 1,
						products: { $size: '$products' },
						followers: { $size: '$followers' },
						blocked: '$blocked',
						name: '$name',
						mobileCode: '$mobileCode',
						mobileNumber: '$mobileNumber',
						email: '$email',
						logo: '$logo',
						about: '$about',
						website: '$website',
						createdOn: '$createdOn',
					},
			},
			sortQuery,
			{ $skip: (page - 1) * limit },
			{ $limit: limit },
		];

		const data = await BrandModel.aggregate(query);
		const totalItems = await BrandModel.countDocuments({
			$and: [
				{ companyName: { $regex: new RegExp(text, 'i') } },
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
