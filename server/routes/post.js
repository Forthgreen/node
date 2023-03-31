import {
	PostControllers,
	AuthenticationControllers,
} from '../controllers';

import { MultipartService } from '../services';

const prefix = '/api/post/';
/**
 * @description
 * This is the route handler for the posts
 * @author Nikhil Negi
 * @since 01-04-2021
 */
export default (app) => {
	app.post(`${prefix}add`, MultipartService, AuthenticationControllers.authenticateUser, PostControllers.add);
	app.post(`${prefix}feed`, AuthenticationControllers.authenticateUser, PostControllers.feed);
	app.post(`${prefix}feedfollowing`, AuthenticationControllers.authenticateUser, PostControllers.feedfollowing);
	app.post(`${prefix}delete`, AuthenticationControllers.authenticateUser, PostControllers.delete);
	app.post(`${prefix}like`, AuthenticationControllers.authenticateUser, PostControllers.like);
	app.post(`${prefix}guestFeed`, PostControllers.feed);
	app.post(`${prefix}likeList`, AuthenticationControllers.authenticateUser, PostControllers.likeList);
};
