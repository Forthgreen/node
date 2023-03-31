import {
	ReportControllers,
	AuthenticationControllers,
} from '../controllers';

const prefix = '/api/report/';
/**
 * @description
 * This is the route handler for the report review given by user.
 * @author Jagmohan Singh
 * @since May 8, 2020
 */
export default (app) => {
	app.post(`${prefix}brandOrReview`, AuthenticationControllers.authenticateUser, ReportControllers.brandOrReview);
	app.post(`${prefix}post`, AuthenticationControllers.authenticateUser, ReportControllers.post);
	app.post(`${prefix}comment`, AuthenticationControllers.authenticateUser, ReportControllers.comment);
	app.post(`${prefix}user`, AuthenticationControllers.authenticateUser, ReportControllers.user);
};
