/* eslint-disable no-restricted-syntax */
/* eslint-disable indent */
import {
	ResponseUtility,
} from 'appknit-backend-bundle';
import { Types } from 'mongoose';
import {
	ProductModel,
} from '../../schemas';
import {
	SORT_PRODUCT,
	GENDER_FOR_PRODUCT,
	PRODUCT_CATEGORIES,
	CLOTHING_GENDER_BOTH,
	BOOKMARK_TYPE,
} from '../../constants';

/**
 * @description A service model function to handle the
 *  list of products.
 * @author Jagmohan Singh
 * @param {Array} category categories of products.
 * @since 13 May 2020
 */


export default ({
	id,
	limit = 7,
	page = 1,
	text = '',
	category,
	sort = SORT_PRODUCT.NEW_TO_OLD,
	gender,
	filter = [],
}) => new Promise(async (resolve, reject) => {
	try {
		let sortBy = {};
		if (sort === SORT_PRODUCT.PRICE_LOW_TO_HIGH) {
			sortBy = { position: 1 };
		} else if (sort === SORT_PRODUCT.PRICE_HIGH_TO_LOW) {
			sortBy = { position: -1 };
		} else {
			sortBy = { position: -1 };
		}

		const findConditions = {
			deleted: false,
			uploadedToProfile: true,
			isHidden: { $ne: true } 
		};

		if (gender && gender !== GENDER_FOR_PRODUCT.BOTH) {
			findConditions.gender = {
				$in: [
					GENDER_FOR_PRODUCT.BOTH,
					gender,
				],
			};
		}

		const textRegex = new RegExp(text, 'i');
		if (category && category.length) {
			findConditions.category = { $in: category };
		}

		if (filter && filter.length) {
			findConditions.subCategory = { $in: filter };
		}

		if (filter && filter.length) {
            const queryFilter = [];
            if (category.includes(PRODUCT_CATEGORIES.CLOTHING)) {
                for (const data of filter) {
                    queryFilter.push(CLOTHING_GENDER_BOTH[data][0]);
					queryFilter.push(CLOTHING_GENDER_BOTH[data][1]);
                }
            }
            findConditions.subCategory = { $in: queryFilter.length ? queryFilter : filter };
        }

		if (text.trim()) {
			findConditions.name = { $regex: textRegex };
		}

		const query = [{
			$match: findConditions,
		},
    {
      $lookup:{
          from: "productcaches",       // other table name
          localField: "_id",   // name of users table field
          foreignField: "productRef", // name of userinfo table field
          as: "pcaches_data"         // alias for userinfo table
      }
  },
  {   $unwind:"$pcaches_data" },     // $unwind used for getting data in object or for one record only

		{
			$lookup: {
				from: 'brands',
				let: {
					brandRef: '$brandRef',
				},
				pipeline: [
					{
						$match: {
							$expr: {
								$and: [{
									$eq: [
										'$_id',
										'$$brandRef',
									],
								}, {
									$eq: [
										'$deleted',
										false,
									],
								}, {
									$eq: [
										'$isVerifiedByAdmin',
										true,
									],
								},
								 {
									$eq: [
										'$blocked',
										false,
									],
								}],
							},
						},
					},
				],
				as: 'brands',
			},
		}, {
			$unwind: {
				path: '$brands',
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
			$project: {
				name: '$name',
				brandRef: '$brands._id',
				brandName: '$brands.companyName',
				coverImage: '$brands.coverImage',
				logo: '$brands.logo',
				images: '$images',
				priceDecimal: { $convert: { input: '$price', to: 'double', onError: 'Error', onNull: 'Error' } },
				currency: '$currency',
				price: '$price',
				gender: '$gender',
				category: '$category',
				subCategory: { $ifNull: ['$subCategory', '$$REMOVE'] },
				createdOn: '$createdOn',
				isBookmark: { $cond: ['$bookmarks._id', true, false] },
				topDate: '$topDate',
				sortingDate: { $cond:[{ $gt: ['$topDate', '$createdOn'] }, '$topDate', '$createdOn' ]},
        position: '$pcaches_data.position',
			},
		},
		{ $sort: sortBy },
		{ $skip: limit * (page - 1) },
		{ $limit: limit },
		];

		const data = await ProductModel.aggregate(query);

		return resolve(ResponseUtility.SUCCESS_PAGINATION({ data, limit, page }));
	} catch (err) {
		return reject(ResponseUtility.GENERIC_ERR({ message: err.message, error: err }));
	}
});
