import {
	FollowProductControllers,
	AuthenticationControllers,
} from '../controllers';

const prefix = '/api/followProduct/';

/**
 * @description
 * This is the route handler for the user following products
 * @author Santgurlal Singh
 * @since 15 Jan, 2021
 */

export default (app) => {
	app.post(`${prefix}update`, AuthenticationControllers.authenticateUser, FollowProductControllers.update);
	app.post(`${prefix}list`, AuthenticationControllers.authenticateUser, FollowProductControllers.list);
};
