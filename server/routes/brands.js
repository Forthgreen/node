import {
	BrandControllers,
	AuthenticationControllers,
} from '../controllers';

import { MultipartService } from '../services';


const prefix = '/api/brand/';
/**
 * @description
 * This is the route handler to get list of brands.
 * @author Jagmohan Singh
 * @since May 2, 2020
 */
export default (app) => {
	app.post(`${prefix}signup`, BrandControllers.signup);
	app.get(`${prefix}verify`, BrandControllers.verify);
	app.post(`${prefix}login`, BrandControllers.login);
	app.post(`${prefix}resendVerification`, BrandControllers.resendVerification);
	app.get(`${prefix}password`, BrandControllers.password);
	app.post(`${prefix}forgotPassword`, BrandControllers.forgotPassword);
	app.post(`${prefix}update`, MultipartService, AuthenticationControllers.authenticateBrandOwner, BrandControllers.update);
	app.post(`${prefix}list`, BrandControllers.list);
	app.post(`${prefix}listForUser`, AuthenticationControllers.authenticateUser, BrandControllers.list);
	app.post(`${prefix}search`, BrandControllers.search);
	app.post(`${prefix}detailsForUser`, AuthenticationControllers.authenticateUser, BrandControllers.details);
	app.post(`${prefix}details`, AuthenticationControllers.authenticateBrandOwner, BrandControllers.selfDetails);
	app.get(`${prefix}verifyNewEmail`, BrandControllers.verifyNewEmail);
	app.post(`${prefix}detailsForGuest`, BrandControllers.details);
	app.post(`${prefix}changePassword`, AuthenticationControllers.authenticateBrandOwner, BrandControllers.changePassword);
};
