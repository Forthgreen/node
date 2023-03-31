import {
	ResponseUtility,
} from 'appknit-backend-bundle';
import {
	UserModel,
	BrandModel,
	ProductModel,
} from '../../schemas';
/**
* @description service model function to handle the
* dashboard of the admin
* UPDATE - Used Aggregations instead of countDocuments() to bring down the response time by more than half
* @author Abhinav Sharma
* @since 27 May, 2020
*/

export default () => new Promise(async (resolve, reject) => {
	try {
		const dateNow = new Date();
		const deletedQuery = { deleted: true };
		const blockedQuery = { blocked: true };

		const totalUsers = await UserModel.countDocuments({ deleted: false });
		const deletedUsers = await UserModel.countDocuments(deletedQuery);
		const blockedUsers = await UserModel.countDocuments(blockedQuery);

		const query = [
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
				$project:
					{
						premium: {
							$cond: [
								{ $eq: ['$subscription.isPremuim', true] },
								1,
								0,
							],
						},
						premiumDeleted: {
							$cond: [
								{ $and: [{ $eq: ['$subscription.isPremuim', true] }, { $eq: ['$deleted', true] }] },
								1,
								0,
							],
						},
						premiumBlocked: {
							$cond: [
								{ $and: [{ $eq: ['$subscription.isPremuim', true] }, { $eq: ['$blocked', true] }] },
								1,
								0,
							],
						},
						nonPremium: {
							$cond: [
								{ $eq: ['$subscription.isPremuim', true] },
								0,
								1,
							],
						},
						nonPremiumDeleted: {
							$cond: [
								{ $eq: ['$subscription.isPremuim', true] },
								0,
								{
									$cond: [
										{ $eq: ['$deleted', true] },
										1,
										0,
									],
								},
							],
						},
						nonPremiumBlocked: {
							$cond: [
								{ $eq: ['$subscription.isPremuim', true] },
								0,
								{
									$cond: [
										{ $eq: ['$blocked', true] },
										1,
										0,
									],
								},
							],
						},
						isDeleted: {
							$cond: [
								{ $eq: ['$deleted', true] },
								1,
								0,
							],
						},
					},
			},
			{
				$group:
					{
						_id: null,
						deleted: { $sum: '$isDeleted' },
						blocked: { $sum: '$isBlocked' },
						nonPremium: { $sum: '$nonPremium' },
						nonPremiumBlocked: { $sum: '$nonPremiumBlocked' },
						nonPremiumDeleted: { $sum: '$nonPremiumDeleted' },
						premium: { $sum: '$premium' },
						premiumDeleted: { $sum: '$premiumDeleted' },
						premiumBlocked: { $sum: '$premiumBlocked' },
						total: { $sum: 1 },
					},
			},
		];

		const [brandCountData] = await BrandModel.aggregate(query);

		const totalBrandsPremium = brandCountData.premium - brandCountData.premiumDeleted;
		const totalBrandsPremiumDeleted = brandCountData.premiumDeleted;
		const totalBrandsPremiumBlocked = brandCountData.premiumBlocked;

		const totalBrandsNonPremium = brandCountData.nonPremium - brandCountData.nonPremiumDeleted;
		const totalBrandsNonPremiumDeleted = brandCountData.nonPremiumDeleted;
		const totalBrandsNonPremiumBlocked = brandCountData.nonPremiumBlocked;

		const totalProducts = await ProductModel.countDocuments({ deleted: false });

		const data = {
			totalUsers,
			deletedUsers,
			blockedUsers,
			totalBrandsPremium,
			totalBrandsPremiumDeleted,
			totalBrandsPremiumBlocked,
			totalBrandsNonPremium,
			totalBrandsNonPremiumDeleted,
			totalBrandsNonPremiumBlocked,
			totalProducts,
		};

		return resolve(ResponseUtility.SUCCESS({ data }));
	} catch (err) {
		return reject(ResponseUtility.GENERIC_ERR({ message: err.message, error: err }));
	}
});
