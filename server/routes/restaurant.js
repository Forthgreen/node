import {
	RestaurantControllers,
	AuthenticationControllers,
} from '../controllers';

import { MultipartService } from '../services';

const prefix = '/api/restaurant/';
/**
 * @description
 * This is the route handler for the restaurants
 * @author Santgurlal Singh
 * @since 5 Oct, 2020
 */
export default (app) => {
	app.post(`${prefix}add`, MultipartService, AuthenticationControllers.authenticateAdmin, RestaurantControllers.add);
	app.post(`${prefix}list`, RestaurantControllers.list);
	app.post(`${prefix}listForUser`, AuthenticationControllers.authenticateUser, RestaurantControllers.list);
	app.post(`${prefix}map`, RestaurantControllers.map);
	app.post(`${prefix}listAll`, AuthenticationControllers.authenticateAdmin, RestaurantControllers.listAll);
	app.post(`${prefix}delete`, AuthenticationControllers.authenticateAdmin, RestaurantControllers.delete);
	app.post(`${prefix}edit`, MultipartService, AuthenticationControllers.authenticateAdmin, RestaurantControllers.edit);
	app.post(`${prefix}details`, AuthenticationControllers.authenticateUser, RestaurantControllers.details);
	app.post(`${prefix}detailsGuest`, RestaurantControllers.detailsGuest);
};
