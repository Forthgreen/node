import { AdminControllers, AuthenticationControllers } from '../controllers';

const prefix = '/api/admin/';
/**
 * @description
 * This is the route handler for the admin.
 * @author Abhinav Sharma
 * @since May 27, 2020
 */
export default (app) => {
	app.post(`${prefix}signup`, AdminControllers.signup);
	app.post(`${prefix}login`, AdminControllers.login);
	app.get(
		`${prefix}dashboard`,
		AuthenticationControllers.authenticateAdmin,
		AdminControllers.dashboard,
	);
	app.post(
		`${prefix}brands`,
		AuthenticationControllers.authenticateAdmin,
		AdminControllers.brands,
	);
	app.get(
		`${prefix}searchBrand`,
		AuthenticationControllers.authenticateAdmin,
		AdminControllers.searchBrand,
	);
	app.post(`${prefix}reviews`, AuthenticationControllers.authenticateAdmin, AdminControllers.reviews);
	app.post(`${prefix}reports`, AuthenticationControllers.authenticateAdmin, AdminControllers.reports);
	app.post(`${prefix}users`, AuthenticationControllers.authenticateAdmin, AdminControllers.users);
	app.get(`${prefix}searchUser`, AuthenticationControllers.authenticateAdmin, AdminControllers.searchUser);
	app.post(`${prefix}freezeUser`, AuthenticationControllers.authenticateAdmin, AdminControllers.freezeUser);
	app.post(`${prefix}deleteUser`, AuthenticationControllers.authenticateAdmin, AdminControllers.deleteUser);
	app.post(`${prefix}freezeBrand`, AuthenticationControllers.authenticateAdmin, AdminControllers.freezeBrand);
	app.post(`${prefix}deleteBrand`, AuthenticationControllers.authenticateAdmin, AdminControllers.deleteBrand);
	app.post(`${prefix}verifyBrand`, AuthenticationControllers.authenticateAdmin, AdminControllers.verifyBrand);
	app.post(`${prefix}googlePlaceDetails`, AuthenticationControllers.authenticateAdmin, AdminControllers.googlePlaceDetails);
	app.post(`${prefix}freezeReview`, AuthenticationControllers.authenticateAdmin, AdminControllers.freezeReview);
	app.post(`${prefix}reportedUsers`, AuthenticationControllers.authenticateAdmin, AdminControllers.reportedUsers);
	app.post(`${prefix}reportedPosts`, AuthenticationControllers.authenticateAdmin, AdminControllers.reportedPosts);
	app.post(`${prefix}reportedComments`, AuthenticationControllers.authenticateAdmin, AdminControllers.reportedComments);
	app.post(`${prefix}deletePost`, AuthenticationControllers.authenticateAdmin, AdminControllers.deletePost);
	app.post(`${prefix}deleteComment`, AuthenticationControllers.authenticateAdmin, AdminControllers.deleteComment);
};
