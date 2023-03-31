import { ResponseUtility } from 'appknit-backend-bundle';
import { BrandModel } from '../../schemas';
import { PAGINATION_LIMIT } from '../../constants';
/**
 * @description service model function to search the
 * brands entitled to admin
 * @author Abhinav Sharma
 * @since 01 June, 2020
 */
export default ({ text = '', page = 1, limit = PAGINATION_LIMIT }) => new Promise(async (resolve, reject) => {
	try {
		const query = [
			{
				$match: {
					$and: [
						{
							$or: [
								{ companyName: { $regex: text, $options: 'i' } },
								{ email: { $regex: text, $options: 'i' } },
							],
						},
						{ deleted: { $eq: false } },
						{ isVerifiedByAdmin: { $eq: true } },
					],
				},
			},
			{
				$lookup: {
					from: 'products',
					let: { id: '$_id' },
					pipeline: [
						{
							$match: {
								$expr: {
									$and: [
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
				$lookup: {
					from: 'followbrands',
					let: { id: '$_id', status: true },
					pipeline: [
						{
							$match: {
								$expr: {
									$and: [
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
			{ $skip: (page - 1) * limit },
			{ $limit: limit },
			{
				$project: {
					companyName: '$companyName',
					isPremium: '$isPremium',
					creation: '$createdOn',
					focus: 1,
					products: { $size: '$products' },
					followers: { $size: '$followers' },
				},
			},
		];

		const data = await BrandModel.aggregate(query);
		// eslint-disable-next-line no-underscore-dangle
		return resolve(ResponseUtility.SUCCESS({ data }));
	} catch (err) {
		return reject(
			ResponseUtility.GENERIC_ERR({ message: err.message, error: err }),
		);
	}
});
