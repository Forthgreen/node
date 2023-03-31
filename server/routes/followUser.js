import {
	FollowUserControllers,
	AuthenticationControllers,
} from '../controllers';

const prefix = '/api/follow/';
/**
* @description
* This is the route handler for the user following other user
* @author Nikhil Negi
* @since 15-04-2021
*/

export default (app) => {
	app.post(`${prefix}user`, AuthenticationControllers.authenticateUser, FollowUserControllers.user);
	app.post(`${prefix}list`, AuthenticationControllers.authenticateUser, FollowUserControllers.list);
};
