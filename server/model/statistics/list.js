import {
	ResponseUtility,
} from 'appknit-backend-bundle';
import { Types } from 'mongoose';
import {
	BrandModel,
	// ProductModel,
} from '../../schemas';
import {
	AGE_FILTER,
	TIME_FILTER,
	MS_IN_DAY,
	// SUBSRIPTION_STATUS,
} from '../../constants';
/**
* @description A service model function to handle the
* listing of statistics of brand.
* @param {String} id the unique id of a user.
* @author Santgurlal Singh
* @since 18 June, 2020
*/


export default ({
	id,
	timeFilter = TIME_FILTER.TODAY,
	ageFilter,
	genderFilter,
	sortBy = {
		field: 'name',
		order: 1,
	},
	page = 1,
	limit = 10,
}) => new Promise(async (resolve, reject) => {
	try {
		const dateNow = new Date();
		const brand = await BrandModel.findOne({ _id: id });

		if (!brand || brand.deleted) {
			return reject(ResponseUtility.GENERIC_ERR({ code: 401, message: 'Requested brand not found.' }));
		}

		if (brand.blocked) {
			return reject(ResponseUtility.GENERIC_ERR({ code: 401, message: 'Your account has been blocked by admin.' }));
		}

		const userMatchQuery = {
			$match: {
				deleted: false,
			},
		};
		if (ageFilter) {
			if (ageFilter === AGE_FILTER.AGE_16_24) {
				userMatchQuery.$match = {
					age: {
						$gte: 16,
						$lte: 24,
					},
				};
			} else if (ageFilter === AGE_FILTER.AGE_25_34) {
				userMatchQuery.$match = {
					age: {
						$gte: 25,
						$lte: 34,
					},
				};
			} else if (ageFilter === AGE_FILTER.AGE_35_44) {
				userMatchQuery.$match = {
					age: {
						$gte: 35,
						$lte: 44,
					},
				};
			} else if (ageFilter === AGE_FILTER.AGE_45_54) {
				userMatchQuery.$match = {
					age: {
						$gte: 45,
						$lte: 54,
					},
				};
			} else if (ageFilter === AGE_FILTER.AGE_55_65) {
				userMatchQuery.$match = {
					age: {
						$gte: 55,
						$lte: 65,
					},
				};
			} else if (ageFilter === AGE_FILTER.AGE_66_100) {
				userMatchQuery.$match = {
					age: {
						$gte: 66,
					},
				};
			}
		}
		if (genderFilter) {
			userMatchQuery.$match.gender = genderFilter;
		}
		let daysAnchor = 1;
		if (timeFilter === TIME_FILTER.DAYS_7) {
			daysAnchor = 7;
		} else if (timeFilter === TIME_FILTER.DAYS_15) {
			daysAnchor = 15;
		} else if (timeFilter === TIME_FILTER.DAYS_30) {
			daysAnchor = 30;
		} else if (timeFilter === TIME_FILTER.DAYS_60) {
			daysAnchor = 60;
		}
		const periodStart = new Date(dateNow.getTime() - (MS_IN_DAY * daysAnchor));
		const periodEnd = dateNow;
		const timeCheck = {
			$match: {
				createdOn: { $gte: periodStart, $lt: periodEnd },
			},
		};
		const previousPeriodDate = new Date(dateNow.getTime() - (MS_IN_DAY * (daysAnchor * 2)));
		const previousPeriodEnd = new Date(previousPeriodDate.setHours(23, 59, 59, 999));
		const timeCheckTwo = {
			$match: {
				createdOn: { $gte: previousPeriodEnd, $lt: periodStart },
			},
		};
		const userAggregationQueryLookup = {
			$lookup: {
				from: 'users',
				let: {
					userRef: '$userRef',
				},
				pipeline: [
					{
						$match: {
							$expr: {
								$eq: ['$$userRef', '$_id'],
							},
						},
					},
					{
						$project: {
							_id: '$_id',
							lastName: '$lastName',
							image: '$image',
							gender: '$gender',
							firstName: '$firstName',
							email: '$email',
							dateOfBirth: '$dateOfBirth',
							createdOn: '$createdOn',
							deleted: '$deleted',
							age: {
								$divide: [{ $subtract: [new Date(), '$dateOfBirth'] },
									(365 * 24 * 60 * 60 * 1000)],
							},
						},
					},
					userMatchQuery,
				],
				as: 'userDetails',
			},
		};
		const userAggregationQueryUnwind = {
			$unwind: {
				path: '$userDetails',
			},
		};
		const sortQuery = { $sort: { nameLowercase: sortBy.order } };
		if (sortBy.field === 'name') {
			sortQuery.$sort = { nameLowercase: sortBy.order };
		} else if (sortBy.field === 'visits') {
			sortQuery.$sort = { productVisitsCount: sortBy.order };
		} else if (sortBy.field === 'clicksToWebsite') {
			sortQuery.$sort = { websiteClicksCount: sortBy.order };
		} else if (sortBy.field === 'overall') {
			sortQuery.$sort = { overall: sortBy.order };
		}
		const [data] = await BrandModel.aggregate([
			{
				$match: {
					_id: Types.ObjectId.createFromHexString(id),
				},
			},
			{
				$lookup: {
					from: 'followbrands',
					let: {
						brandRef: '$_id',
					},
					pipeline: [
						{
							$match: {
								$expr: {
									$and: [
										{
											$eq: ['$$brandRef', '$brandRef'],
										},
										{
											$eq: ['$status', true],
										},
									],
								},
							},
						},
						timeCheck,
						userAggregationQueryLookup,
						userAggregationQueryUnwind,
					],
					as: 'followers',
				},
			},
			{
				$lookup: {
					from: 'followbrands',
					let: {
						brandRef: '$_id',
					},
					pipeline: [
						{
							$match: {
								$expr: {
									$and: [
										{
											$eq: ['$$brandRef', '$brandRef'],
										},
										{
											$eq: ['$status', true],
										},
									],
								},
							},
						},
						timeCheckTwo,
						userAggregationQueryLookup,
						userAggregationQueryUnwind,
					],
					as: 'followersPrevious',
				},
			},
			{
				$project: {
					_id: '$_id',
					followers: '$followers',
					followersCount: { $size: '$followers' },
					followersPreviousCount: { $size: '$followersPrevious' },
				},
			},
			{
				$project: {
					_id: '$_id',
					followers: '$followers',
					followersCount: '$followersCount',
					followersPreviousCount: '$followersPreviousCount',
					followersDifference: {
						$cond: [
							{ $eq: ['$followersPreviousCount', 0] },
							{ $multiply: [{ $divide: [{ $subtract: [{ $add: [1, '$followersCount'] }, { $add: [1, '$followersPreviousCount'] }] }, { $add: [1, '$followersPreviousCount'] }] }, 100] },
							{ $multiply: [{ $divide: [{ $subtract: ['$followersCount', '$followersPreviousCount'] }, '$followersPreviousCount'] }, 100] },
						],
					},
				},
			},
			{
				$lookup: {
					from: 'products',
					let: {
						brandRef: '$_id',
					},
					pipeline: [
						{
							$match: {
								$expr: {
									$and: [
										{
											$eq: ['$$brandRef', '$brandRef'],
										},
										{
											$eq: ['$deleted', false],
										},
									],
								},
							},
						},
						{
							$lookup: {
								from: 'productvisits',
								let: {
									productRef: '$_id',
								},
								pipeline: [
									{
										$match: {
											$expr: {
												$eq: ['$$productRef', '$productRef'],
											},
										},
									},
									timeCheck,
									userAggregationQueryLookup,
									userAggregationQueryUnwind,
								],
								as: 'productVisits',
							},
						},
						{
							$lookup: {
								from: 'productvisits',
								let: {
									productRef: '$_id',
								},
								pipeline: [
									{
										$match: {
											$expr: {
												$eq: ['$$productRef', '$productRef'],
											},
										},
									},
									timeCheckTwo,
									userAggregationQueryLookup,
									userAggregationQueryUnwind,
								],
								as: 'productVisitsPrevious',
							},
						},
						{
							$lookup: {
								from: 'websiteclicks',
								let: {
									productRef: '$_id',
								},
								pipeline: [
									{
										$match: {
											$expr: {
												$eq: ['$$productRef', '$productRef'],
											},
										},
									},
									timeCheck,
									userAggregationQueryLookup,
									userAggregationQueryUnwind,
								],
								as: 'websiteClicks',
							},
						},
						{
							$lookup: {
								from: 'websiteclicks',
								let: {
									productRef: '$_id',
								},
								pipeline: [
									{
										$match: {
											$expr: {
												$eq: ['$$productRef', '$productRef'],
											},
										},
									},
									timeCheckTwo,
									userAggregationQueryLookup,
									userAggregationQueryUnwind,
								],
								as: 'websiteClicksPrevoius',
							},
						},
						{
							$project: {
								_id: '$_id',
								images: '$images',
								brandRef: '$brandRef',
								name: '$name',
								info: '$info',
								category: '$category',
								price: '$price',
								link: '$link',
								productVisits: '$productVisits',
								websiteClicks: '$websiteClicks',
								productVisitsCount: { $size: '$productVisits' },
								websiteClicksCount: { $size: '$websiteClicks' },
								productVisitsPreviousCount: { $size: '$productVisitsPrevious' },
								websiteClicksPrevoiusCount: { $size: '$websiteClicksPrevoius' },
							},
						},
						{
							$project: {
								_id: '$_id',
								images: '$images',
								brandRef: '$brandRef',
								name: '$name',
								nameLowercase: { $toLower: '$name' },
								info: '$info',
								category: '$category',
								price: '$price',
								link: '$link',
								productVisits: '$productVisits',
								websiteClicks: '$websiteClicks',
								productVisitsCount: '$productVisitsCount',
								productVisitsPreviousCount: '$productVisitsPreviousCount',
								websiteClicksCount: '$websiteClicksCount',
								websiteClicksPrevoiusCount: '$websiteClicksPrevoiusCount',
								productVisitsDifference: {
									$cond: [
										{ $eq: ['$productVisitsPreviousCount', 0] },
										{ $multiply: [{ $divide: [{ $subtract: [{ $add: [1, '$productVisitsCount'] }, { $add: [1, '$productVisitsPreviousCount'] }] }, { $add: [1, '$productVisitsPreviousCount'] }] }, 100] },
										{ $multiply: [{ $divide: [{ $subtract: ['$productVisitsCount', '$productVisitsPreviousCount'] }, '$productVisitsPreviousCount'] }, 100] },
									],
								},
								websiteClicksDifference: {
									$cond: [
										{ $eq: ['$websiteClicksPrevoiusCount', 0] },
										{ $multiply: [{ $divide: [{ $subtract: [{ $add: [1, '$websiteClicksCount'] }, { $add: [1, '$websiteClicksPrevoiusCount'] }] }, { $add: [1, '$websiteClicksPrevoiusCount'] }] }, 100] },
										{ $multiply: [{ $divide: [{ $subtract: ['$websiteClicksCount', '$websiteClicksPrevoiusCount'] }, '$websiteClicksPrevoiusCount'] }, 100] },
									],
								},
							},
						},
						{
							$project: {
								_id: '$_id',
								images: '$images',
								brandRef: '$brandRef',
								name: '$name',
								nameLowercase: '$nameLowercase',
								info: '$info',
								category: '$category',
								price: '$price',
								link: '$link',
								productVisits: '$productVisits',
								websiteClicks: '$websiteClicks',
								productVisitsCount: '$productVisitsCount',
								productVisitsPreviousCount: '$productVisitsPreviousCount',
								websiteClicksCount: '$websiteClicksCount',
								websiteClicksPrevoiusCount: '$websiteClicksPrevoiusCount',
								productVisitsDifference: '$productVisitsDifference',
								websiteClicksDifference: '$websiteClicksDifference',
								overall: { $add: ['$productVisitsDifference', '$websiteClicksDifference'] },
							},
						},
						sortQuery,
					],
					as: 'productData',
				},
			},
			{
				$unwind: {
					path: '$productData',
				},
			},
			{
				$group: {
					_id: '$_id',
					followers: { $first: '$followers' },
					followersCount: { $first: '$followersCount' },
					followersPreviousCount: { $first: '$followersPreviousCount' },
					followersDifference: { $first: '$followersDifference' },
					productData: { $push: '$productData' },
					productVisitsTotal: { $sum: '$productData.productVisitsCount' },
					productVisitsAll: { $push: '$productData.productVisits' },
					productVisitsDifferenceTotal: { $sum: '$productData.productVisitsDifference' },
					websiteClicksTotal: { $sum: '$productData.websiteClicksCount' },
					websiteClicksAll: { $push: '$productData.websiteClicks' },
					websiteClicksDifferenceTotal: { $sum: '$productData.websiteClicksDifference' },
				},
			},
		]);
		const dataForFollowersGraph = data.followers;
		const dataForVisitsGraph = [];
		const dataForClicksGraph = [];
		data.websiteClicksAll.forEach((element) => {
			dataForClicksGraph.push(...element);
		});
		data.productVisitsAll.forEach((element) => {
			dataForVisitsGraph.push(...element);
		});
		const datesForGraph = [];
		const clicksGraph = [];
		const visitsGraph = [];
		const followersGraph = [];
		if (daysAnchor > 1) {
			for (let index = (daysAnchor - 1); index >= 0; index -= 1) {
				const pushDate = new Date(dateNow.getTime() - (MS_IN_DAY * index)).toString().slice(0, 15);
				let numberOfClick = 0;
				let numberOfVisits = 0;
				let numberOfFollowers = 0;
				for (let indexClicks = 0; indexClicks < dataForClicksGraph.length; indexClicks += 1) {
					if (pushDate === dataForClicksGraph[indexClicks].createdOn.toString().slice(0, 15)) {
						numberOfClick += 1;
					}
				}
				for (let indexVisits = 0; indexVisits < dataForVisitsGraph.length; indexVisits += 1) {
					if (pushDate === dataForVisitsGraph[indexVisits].createdOn.toString().slice(0, 15)) {
						numberOfVisits += 1;
					}
				}
				for (let indexFollowers = 0; indexFollowers < dataForFollowersGraph.length; indexFollowers += 1) {
					if (pushDate === dataForFollowersGraph[indexFollowers].createdOn.toString().slice(0, 15)) {
						numberOfFollowers += 1;
					}
				}
				datesForGraph.push(`${pushDate.slice(8, 10)} ${pushDate.slice(4, 7)}`);
				clicksGraph.push(numberOfClick);
				visitsGraph.push(numberOfVisits);
				followersGraph.push(numberOfFollowers);
			}
		}
		const productData = data.productData.slice(limit * (page - 1), page * limit);
		return resolve(ResponseUtility.SUCCESS_PAGINATION({
			data: {
				productData,
				datesForGraph,
				clicksGraph,
				visitsGraph,
				followersGraph,
				followersCount: data.followersCount,
				followersDifference: data.followersDifference,
				productVisitsTotal: data.productVisitsTotal,
				productVisitsDifferenceTotal: data.productVisitsDifferenceTotal,
				websiteClicksTotal: data.websiteClicksTotal,
				websiteClicksDifferenceTotal: data.websiteClicksDifferenceTotal,
				total: data.productData.length,
			},
			page,
			limit,
		}));
	} catch (err) {
		return reject(ResponseUtility.GENERIC_ERR({ message: err.message, error: err }));
	}
});
