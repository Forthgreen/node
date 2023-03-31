import {
	ResponseUtility,
	TokenUtility,
} from 'appknit-backend-bundle';

import {
	BrandModel,
	ProductModel,
} from '../../schemas';

/**
* @description A service model function to handle the
* search of brand and products
* @author Santgurlal Singh
* @since 9 May, 2020
*/


export default ({
	page = 1,
	limit = 30,
	text,
	paginationToken,
}) => new Promise(async (resolve, reject) => {
	try {
		let skipingBrands = 0;
		let skipingProducts = 0;

		const decodedPaginationToken = TokenUtility.decodeToken(paginationToken);
		if (decodedPaginationToken) {
			skipingBrands = decodedPaginationToken.data.skipBrands;
			skipingProducts = decodedPaginationToken.data.skipProducts;
		}

		const brands = await BrandModel.aggregate([
			{
				$match: {
					companyName: { $regex: new RegExp(text, 'i') },
					deleted: false,
					blocked: false,
					isVerifiedByAdmin: true,
				},
			},
			{
				$skip: skipingBrands,
			},
			{
				$limit: limit,
			},
			{
				$project: {
					_id: '$_id',
					ownerName: '$name',
					name: '$companyName',
					isProduct: { $cond: ['$brand', true, false] },
					coverImage: '$coverImage',
					logo: '$logo',
					about: '$about',
					website: '$website',
				},
			},
		]);

		const matchQuery = {
			$or: [
				{ name: { $regex: new RegExp(text, 'i') } },
			],
			deleted: false,
			isHidden: { $ne: true }
		};

		if (text) {
			const keywords = text.split(' ');
			for (let index = 0; index < keywords.length; index += 1) {
				keywords[index] = keywords[index].toLowerCase();
			}
			matchQuery.$or.push({ keywords: { $in: keywords } });
		}

		const products = await ProductModel.aggregate([
			{
				$match: matchQuery,
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
					as: 'brand',
				},
			},
			{
				$unwind: {
					path: '$brand',
				},
			},
			{
				$project: {
					_id: '$_id',
					name: '$name',
					info: '$info',
					keywords: '$keywords',
					category: '$category',
					price: '$price',
					link: '$link',
					isProduct: { $cond: ['$brand', true, false] },
					images: '$images',
					brand: {
						_id: '$brand._id',
						ownerName: '$brand.name',
						name: '$brand.companyName',
						coverImage: '$brand.coverImage',
						logo: '$brand.logo',
						about: '$brand.about',
						website: '$brand.website',
					},
				},
			},
			{
				$skip: skipingProducts,
			},
			{
				$limit: limit,
			},
		]);
		const combined = [...brands, ...products];
		const combinedSorted = combined.sort(
			(a, b) => {
				let comparison = 0;
				if (a.name.toUpperCase() > b.name.toUpperCase()) {
					comparison = 1;
				} else if (a.name.toUpperCase() < b.name.toUpperCase()) {
					comparison = -1;
				}
				return comparison;
			},
		);
		let brandsInList = 0;
		let productsInList = 0;
		const combinedSortedLimited = [];
		const loopTermination = (combinedSorted.length >= limit) ? limit : combinedSorted.length;
		for (let index = 0; index < loopTermination; index += 1) {
			if (combinedSorted[index].brand) {
				productsInList += 1;
			} else {
				brandsInList += 1;
			}
			combinedSortedLimited.push(combinedSorted[index]);
		}
		const nextPageToken = await TokenUtility.generateToken({
			skipBrands: brandsInList + skipingBrands,
			skipProducts: productsInList + skipingProducts,
		});
		return resolve(ResponseUtility.SUCCESS_PAGINATION({
			data: {
				list: combinedSortedLimited,
				nextPageToken,
			},
			page,
			limit,
		}));
	} catch (err) {
		return reject(ResponseUtility.GENERIC_ERR({ message: err.message, error: err }));
	}
});
