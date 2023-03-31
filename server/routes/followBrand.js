import {
	FollowBrandControllers,
	AuthenticationControllers,
} from '../controllers';

const prefix = '/api/followBrand/';
/**
 * @description
 * This is the route handler for the user following brands
 * @author Jagmohan Singh
 * @since May 1, 2020
 */
export default (app) => {
	app.post(`${prefix}update`, AuthenticationControllers.authenticateUser, FollowBrandControllers.update);
};
