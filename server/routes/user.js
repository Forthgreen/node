import {
	UserControllers,
	AuthenticationControllers,
} from '../controllers';

import { MultipartService } from '../services';

const prefix = '/api/user/';
/**
 * @description
 * This is the route handler for the user
 * @author Jagmohan Singh
 * @since May 1, 2020
 */
export default (app) => {
	app.post(`${prefix}signup`, UserControllers.signup);
	app.get(`${prefix}verify`, UserControllers.verify);
	app.post(`${prefix}login`, UserControllers.login);
	app.post(`${prefix}resendVerification`, UserControllers.resendVerification);
	app.get(`${prefix}password`, UserControllers.password);
	app.post(`${prefix}forgotPassword`, UserControllers.forgotPassword);
	app.post(`${prefix}update`, MultipartService, AuthenticationControllers.authenticateUser, UserControllers.update);
	app.post(`${prefix}socialLogin`, MultipartService, UserControllers.socialLogin);
	app.get(`${prefix}verifyNewEmail`, UserControllers.verifyNewEmail);
	app.post(`${prefix}myBrands`, AuthenticationControllers.authenticateUser, UserControllers.myBrands);
	app.post(`${prefix}details`, AuthenticationControllers.authenticateUser, UserControllers.details);
	app.post(`${prefix}profile`, AuthenticationControllers.authenticateUser, UserControllers.profile);
	app.post(`${prefix}search`, AuthenticationControllers.authenticateUser, UserControllers.search);
	app.post(`${prefix}logout`, AuthenticationControllers.authenticateUser, UserControllers.logout);
	app.post(`${prefix}changePassword`, AuthenticationControllers.authenticateUser, UserControllers.changePassword);
	app.post(`${prefix}deleteaccount`, MultipartService, AuthenticationControllers.authenticateUser, UserControllers.deleteaccount);

};
