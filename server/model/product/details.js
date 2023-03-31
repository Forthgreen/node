import {
	ResponseUtility,
} from 'appknit-backend-bundle';
import { Types } from 'mongoose';
import {
	ProductModel,
} from '../../schemas';
import {
	SIMILAR_LIST_SIZE,
	BOOKMARK_TYPE,
} from '../../constants';

/**
* @description This service model function handles the
* details of products.
* @author Jagmohan Singh
* @since 12 may 2020
* @param {String} productRef the unique id of product.
*/

export default ({
	id,
	productRef,
	page = 1,
	limit = 30,
}) => new Promise(async (resolve, reject) => {
	try {
		if (!productRef) {
			return reject(ResponseUtility.MISSING_PROPS({ message: 'Missing property productRef.' }));
		}
		const query = [{
			$match: {
				_id: Types.ObjectId.createFromHexString(productRef),
				deleted: false,
			},
		}, {
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
								},
								{
									$eq: [
										'$deleted',
										false,
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
		}, {
			$lookup: {
				from: 'rateandreviews',
				let: {
					productRef: '$_id',
				},
				pipeline: [
					{
						$match: {
							$expr: {
								$and: [{
									$eq: [
										'$productRef',
										'$$productRef',
									],
								},
								{
									$eq: [
										'$blocked',
										false,
									],
								},
								{
									$eq: [
										'$freeze',
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
					{ $sort: { createdOn: -1 } },
					{ $skip: limit * (page - 1) },
					{ $limit: limit },
					{
						$lookup: {
							from: 'users',
							localField: 'userRef',
							foreignField: '_id',
							as: 'users',
						},
					},
					{
						$unwind: {
							path: '$users',
							preserveNullAndEmptyArrays: true,
						},
					},
					{
						$project: {
							_id: '$_id',
							userRef: '$users._id',
							image: '$users.image',
							rating: '$rating',
							title: '$title',
							review: '$review',
							fullName: { $concat: ['$users.firstName', ' ', '$users.lastName'] },
						},
					},
				],
				as: 'rateandreviews',
			},
		}, {
			$unwind: {
				path: '$rateandreviews',
				preserveNullAndEmptyArrays: true,
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
		}, {
			$group: {
				_id: '$_id',
				name: { $first: '$name' },
				keywords: { $first: '$keywords' },
				brandName: { $first: '$brands.companyName' },
				brandRef: { $first: '$brands._id' },
				coverImage: { $first: '$brands.coverImage' },
				logo: { $first: '$brands.logo' },
				price: { $first: '$price' },
				currency: { $first: '$currency' },
				images: { $first: '$images' },
				category: { $first: '$category' },
				subCategory: { $first: '$subCategory' },
				gender: { $first: '$gender' },
				link: { $first: '$link' },
				info: { $first: '$info' },
				averageRating: { $avg: '$rateandreviews.rating' },
				totalReviews: { $sum: { $cond: { if: '$rateandreviews._id', then: 1, else: 0 } } },
				ratingAndReview: {
					$push: '$rateandreviews',
				},
				isBookmark: { $first: { $cond: ['$bookmarks._id', true, false] } },
				isHidden: { $first: '$isHidden' },

			},
		},
		{
			$lookup: {
				from: 'followproducts',
				let: {
					productRef: '$_id',
					userRef: Types.ObjectId.createFromHexString(id),
				},
				pipeline: [
					{
						$match: {
							$expr: {
								$and: [
									{
										$eq: [
											'$userRef',
											'$$userRef',
										],
									},
									{
										$eq: [
											'$productRef',
											'$$productRef',
										],
									},								{
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
				as: 'following',
			},
		},
		{
			$project: {
				_id: '$_id',
				name: '$name',
				brandName: '$brandName',
				brandRef: '$brandRef',
				coverImage: '$coverImage',
				logo: '$logo',
				currency: { $ifNull: ['$currency', ''] },
				price: '$price',
				images: '$images',
				link: '$link',
				info: '$info',
				category: '$category',
				subCategory: { $ifNull: ['$subCategory', '$$REMOVE'] },
				gender: { $ifNull: ['$gender', '$$REMOVE'] },
				averageRating: { $ifNull: [{ $round: ['$averageRating', 1] }, 0] },
				totalReviews: '$totalReviews',
				ratingAndReview: '$ratingAndReview',
				isFollowed: { $cond: [{ $size: '$following' }, true, false] },
				isBookmark: '$isBookmark',
				isHidden: '$isHidden' ,

			},
		},
		{
			$lookup: {
				from: 'products',
				let: {
					productRef: '$_id',
					category: '$category',
				},
				pipeline: [
					{
						$match: {
							$expr: {
								$and: [{
									$ne: [
										'$_id',
										'$$productRef',
									],
								},
								{
									$eq: [
										'$category',
										'$$category',
									],
								},
								{
									$eq: [
										'$deleted',
										false,
									],
								},
								{
									$eq: [
										'$blocked',
										false,
									],
								},
								],
							},
						},
					},
					{
						$sample: {
							size: SIMILAR_LIST_SIZE,
						},
					},
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
											},
											{
												$eq: [
													'$deleted',
													false,
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
							as: 'brand',
						},
					}, {
						$unwind: {
							path: '$brand',
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
							_id: '$_id',
							name: '$name',
							brandName: '$brand.companyName',
							brandRef: '$brand._id',
							coverImage: '$coverImage',
							logo: '$logo',
							price: '$price',
							currency: '$currency',
							images: '$images',
							link: '$link',
							info: '$info',
							isBookmark: { $cond: ['$bookmarks._id', true, false] },
						},
					},
				],
				as: 'similarProducts',
			},
		},
		];

		const [productDetails] = await ProductModel.aggregate(query);
		const data = Object.assign(
			productDetails || {},
			{
				page,
				limit,
				length: productDetails ? productDetails.ratingAndReview.length : 0,
			},
		);


		return resolve(ResponseUtility.SUCCESS({ data }));
	} catch (err) {
		return reject(ResponseUtility.GENERIC_ERR({ message: err.message, error: err }));
	}
});
