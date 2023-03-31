/**
 * @description
 * This is the controller for the Admin
 * @author Abhinav Sharma
 * @since 27 May, 2020
 */

import { AdminModel, BrandModel, UserModel } from '../model';

import { ModelResolver } from './resolvers';

export default {
	signup: (req, res) => {
		ModelResolver(req, res, AdminModel.AdminSignupService);
	},
	login: (req, res) => {
		ModelResolver(req, res, AdminModel.AdminLoginService);
	},
	dashboard: (req, res) => {
		AdminModel.AdminDashboardService({})
			.then(success => res.send(success))
			.catch(err => res.send(err));
	},
	brands: (req, res) => {
		ModelResolver(req, res, AdminModel.AdminBrandsService);
	},
	searchBrand: (req, res) => {
		const {
			query: { text, page, limit },
		} = req;
		BrandModel.BrandsSearchBrandService({ text, page, limit })
			.then(success => res.send(success))
			.catch(err => res.send(err));
	},
	reviews: (req, res) => {
		ModelResolver(req, res, AdminModel.AdminReviewService);
	},
	reports: (req, res) => {
		ModelResolver(req, res, AdminModel.AdminReportService);
	},
	users: (req, res) => {
		ModelResolver(req, res, AdminModel.AdminUsersService);
	},
	searchUser: (req, res) => {
		const { query: { text, page } } = req;
		UserModel.UsersSearchUserService({ text, page })
			.then(success => res.send(success))
			.catch(err => res.send(err));
	},
	freezeUser: (req, res) => ModelResolver(req, res, AdminModel.AdminFreezeUserService),
	deleteUser: (req, res) => ModelResolver(req, res, AdminModel.AdminDeleteUserService),
	freezeBrand: (req, res) => ModelResolver(req, res, AdminModel.AdminFreezeBrandService),
	deleteBrand: (req, res) => ModelResolver(req, res, AdminModel.AdminDeleteBrandService),
	verifyBrand: (req, res) => ModelResolver(req, res, AdminModel.AdminVerifyBrandService),
	googlePlaceDetails: (req, res) => ModelResolver(
		req, res, AdminModel.AdminGooglePlaceDetailsService,
	),
	freezeReview: (req, res) => ModelResolver(req, res, AdminModel.AdminFreezeReviewService),
	reportedUsers: (req, res) => ModelResolver(req, res, AdminModel.AdminReportedUsersService),
	reportedPosts: (req, res) => ModelResolver(req, res, AdminModel.AdminReportedPostsService),
	reportedComments: (req, res) => ModelResolver(req, res, AdminModel.AdminReportedCommentsService),
	deletePost: (req, res) => ModelResolver(req, res, AdminModel.AdminDeletePostService),
	deleteComment: (req, res) => ModelResolver(req, res, AdminModel.AdminDeleteCommentService),
};
