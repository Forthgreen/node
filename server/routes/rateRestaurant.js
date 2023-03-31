import {
	RateRestaurantControllers,
	AuthenticationControllers,
} from '../controllers';

const prefix = '/api/rateRestaurant/';
/**
* @description
* This is the route handler for the rate and review given by user to restaurants.
* @author Santgurlal Singh
* @since 6 Oct, 2020
*/

export default (app) => {
	app.post(`${prefix}add`, AuthenticationControllers.authenticateUser, RateRestaurantControllers.add);
	app.post(`${prefix}list`, RateRestaurantControllers.list);
};
