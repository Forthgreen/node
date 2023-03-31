/**
 * @description
 * This is the route handler for the tags
 * @author Nikhil Negi
 * @since 22-10-2021
*/

import {
	TagControllers,
	AuthenticationControllers,
} from '../controllers';

const prefix = '/api/tag/';

export default (app) => {
	app.post(`${prefix}list`, AuthenticationControllers.authenticateUser, TagControllers.list);
};
