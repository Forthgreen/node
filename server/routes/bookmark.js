/**
 * @description
 * This is the route handler for the bookmark
 * @author Nikhil Negi
 * @since 21-10-2021
*/

import {
	BookmarkControllers,
	AuthenticationControllers,
} from '../controllers';

const prefix = '/api/bookmark/';

export default (app) => {
	app.post(`${prefix}add`, AuthenticationControllers.authenticateUser, BookmarkControllers.add);
	app.post(`${prefix}list`, AuthenticationControllers.authenticateUser, BookmarkControllers.list);
};
