import {
	ProductControllers,
	AuthenticationControllers,
} from '../controllers';

import { MultipartService } from '../services';

const prefix = '/api/product/';
/**
 * @description
 * This is the route handler for the products
 * @author Jagmohan Singh
 * @since May 2, 2020
 */
export default (app) => {
	app.post(`${prefix}add`, MultipartService, AuthenticationControllers.authenticateBrandOwner, ProductControllers.add);
	app.post(`${prefix}list`, AuthenticationControllers.authenticateBrandOwner, ProductControllers.list);
	app.post(`${prefix}delete`, AuthenticationControllers.authenticateBrandOwner, ProductControllers.delete);
	app.post(`${prefix}edit`, MultipartService, AuthenticationControllers.authenticateBrandOwner, ProductControllers.edit);
	app.post(`${prefix}uploadCsv`, MultipartService, AuthenticationControllers.authenticateBrandOwner, ProductControllers.uploadCsv);
	app.post(`${prefix}details`, AuthenticationControllers.authenticateUser, ProductControllers.details);
	app.post(`${prefix}detailsGuest`, ProductControllers.detailsGuest);
	app.post(`${prefix}listAll`, ProductControllers.listAll);
	app.post(`${prefix}listAllForUser`, AuthenticationControllers.authenticateUser, ProductControllers.listAll);
	app.post(`${prefix}home`, AuthenticationControllers.authenticateUser, ProductControllers.home);
	app.post(`${prefix}shopfeed`, ProductControllers.shopfeed);
	app.get(`${prefix}productcache`, ProductControllers.productcache);
	app.post(`${prefix}homeForAll`, ProductControllers.home);
	app.post(`${prefix}status`, AuthenticationControllers.authenticateBrandOwner,ProductControllers.status);
	app.post(`${prefix}addToTop`, AuthenticationControllers.authenticateBrandOwner,ProductControllers.addToTop);

};
