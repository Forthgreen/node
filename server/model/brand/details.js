import {
	ResponseUtility,
} from 'appknit-backend-bundle';
import { Types } from 'mongoose';
import {
	BrandModel,
	FollowBrandModel,
} from '../../schemas';
import { BOOKMARK_TYPE } from '../../constants';

/**
* @description This service model function handles the
* details of brands for user and guest user.
* @author Jagmohan Singh
* @since 8 may 2020
* @param {String} id the unique id of user.
* @param {String} brandRef the unique id of brand.
*/

export default ({
	id,
	brandRef,
	page = 1,
	limit = 30,
}) => new Promise(async (resolve, reject) => {
	try {
		if (!brandRef) {
			return reject(ResponseUtility.MISSING_PROPS({ message: 'Missing property brandRef.' }));
		}
		const query = [{
			$match: {
				_id: Types.ObjectId.createFromHexString(brandRef),
				deleted: false,
				blocked: false,
			},
		}, {
			$lookup: {
				from: 'products',
				let: {
					brandRef: '$_id',
				},
				pipeline: [
					{
						$match: {
							$expr: {
								$and: [{
									$eq: [
										'$brandRef',
										'$$brandRef',
									],
								}, {
									$eq: [
										'$deleted',
										false,
									],
								},{
									$ne: [
										'$isHidden',
										true,
									],
								},
								],
							},
						},
					},
					{
						$lookup: {
							from: 'bookmarks',
							let: { ref: '$_id' },
							pipeline: [
								{
									$match: {
										$expr: {
											$and: [
												{ $eq: ['$ref', '$$ref'] },
												{ $eq: ['$status', true] },
												{ $eq: ['$userRef', Types.ObjectId(id)] },
												{ $eq: ['$refType', BOOKMARK_TYPE.PRODUCT] },
											],
										},
									},
								},
							],
							as: 'bookmarks',
						},
					},
					{
						$unwind: {
							path: '$bookmarks',
							preserveNullAndEmptyArrays: true,
						},
					},
					{
						$addFields: {
							isBookmark: { $cond: ['$bookmarks._id', true, false] },
						},
					},
					{ $unset: ['bookmarks'] },
					{ $sort: { createdOn: -1 } },
					{ $skip: limit * (page - 1) },
					{ $limit: limit },
				],
				as: 'products',
			},
		}, {
			$lookup: {
				from: 'bookmarks',
				let: { ref: '$_id' },
				pipeline: [
					{
						$match: {
							$expr: {
								$and: [
									{ $eq: ['$ref', '$$ref'] },
									{ $eq: ['$status', true] },
									{ $eq: ['$userRef', Types.ObjectId(id)] },
									{ $eq: ['$refType', BOOKMARK_TYPE.BRAND] },
								],
							},
						},
					},
				],
				as: 'bookmarks',
			},
		},
		{
			$unwind: {
				path: '$bookmarks',
				preserveNullAndEmptyArrays: true,
			},
		}, {
			$project: {
				brandName: '$companyName',
				coverImage: '$coverImage',
				logo: '$logo',
				about: '$about',
				website: '$website',
				products: '$products',
				isBookmark: { $cond: ['$bookmarks._id', true, false] },
				page,
				limit,
			},
		}];

		const [data] = await BrandModel.aggregate(query);

		let isFollowing = false;
		let followers = 0;
		if (page === 1) {
			followers = await FollowBrandModel.countDocuments({
				brandRef, status: true,
			});
			const dateNow = new Date().getTime();

			if (id) {
				const userFollowInfo = await FollowBrandModel.findOneAndUpdate({
					userRef: Types.ObjectId.createFromHexString(id),
					brandRef: Types.ObjectId.createFromHexString(brandRef),
				}, { lastProductDate: dateNow });

				if (userFollowInfo) {
					isFollowing = userFollowInfo.status;
				}
			}
		}

		const response = Object.assign(
			data || {},
			{
				isFollowing,
				followers,
				page,
				limit,
				length: data ? data.products.length : 0,
			},
		);

		return resolve(ResponseUtility.SUCCESS({ data: response }));
	} catch (err) {
		return reject(ResponseUtility.GENERIC_ERR({ message: err.message, error: err }));
	}
});
