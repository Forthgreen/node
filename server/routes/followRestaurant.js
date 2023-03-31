import {
	FollowRestaurantControllers,
	AuthenticationControllers,
} from '../controllers';

const prefix = '/api/followRestaurant/';
/**
* @description
* This is the route handler for the user following restaurants
* @author Santgurlal Singh
* @since Oct 7, 2020
*/

export default (app) => {
	app.post(`${prefix}update`, AuthenticationControllers.authenticateUser, FollowRestaurantControllers.update);
	app.post(`${prefix}list`, AuthenticationControllers.authenticateUser, FollowRestaurantControllers.list);
};
