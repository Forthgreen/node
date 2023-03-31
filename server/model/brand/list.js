import {
	ResponseUtility,
} from 'appknit-backend-bundle';
import { Types } from 'mongoose';
import {
	BrandModel,
} from '../../schemas';
import { BOOKMARK_TYPE } from '../../constants';

/**
 * @description A service model function to handle the
 *  list of new brands
 * @author Jagmohan Singh
 * @param {Array} category categories of products.
 * @since 13 May 2020
 */


export default ({
	id,
	limit = 30,
	page = 1,
	category,
	text = '',
}) => new Promise(async (resolve, reject) => {
	try {
		const query = [
			{
				$match: {
					deleted: false,
					blocked: false,
					profileUploaded: true,
					isVerifiedByAdmin: true,
					$or: [{ name: { $regex: new RegExp(text, 'i') } }, { companyName: { $regex: new RegExp(text, 'i') } }],
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
									$and: [{
										$eq: [
											'$brandRef',
											'$$brandRef',
										],
									}, {
										$eq: [
											'$status',
											true,
										],
									},
									],
								},
							},
						},
					],
					as: 'followbrands',
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
			},
			{
				$project: {
					brandName: '$companyName',
					brandNameLowercase: { $toLower: '$companyName' },
					updatedOn: '$updatedOn',
					coverImage: '$coverImage',
					logo: '$logo',
					followers: { $size: '$followbrands' },
					isBookmark: { $cond: ['$bookmarks._id', true, false] },
				},
			},
		];

		if (category && category.length) {
			query.push({
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
									}, {
										$in: [
											'$category',
											category,
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
					],
					as: 'products',
				},
			}, {
				$unwind: {
					path: '$products',
				},
			}, {
				$group: {
					_id: '$_id',
					brandName: { $first: '$brandName' },
					brandNameLowercase: { $first: '$brandNameLowercase' },
					updatedOn: { $first: '$updatedOn' },
					coverImage: { $first: '$coverImage' },
					logo: { $first: '$logo' },
					followers: { $first: '$followers' },
				},
			});
		}

		query.push({ $sort: { brandNameLowercase: 1 } }, { $skip: limit * (page - 1) },
			{ $limit: limit });

		const data = await BrandModel.aggregate(query);
		return resolve(ResponseUtility.SUCCESS_PAGINATION({ data, limit, page }));
	} catch (err) {
		return reject(ResponseUtility.GENERIC_ERR({ message: err.message, error: err }));
	}
});
