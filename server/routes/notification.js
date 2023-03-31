import {
	NotificationControllers,
	AuthenticationControllers,
} from '../controllers';

const prefix = '/api/notification/';
/**
* @description
* This is the route handler for the user related notification
* @author Nikhil Negi
* @since 19-04-2021
*/

export default (app) => {
	app.post(`${prefix}seen`, AuthenticationControllers.authenticateUser, NotificationControllers.seen);
	app.post(`${prefix}list`, AuthenticationControllers.authenticateUser, NotificationControllers.list);
	app.post(`${prefix}details`, AuthenticationControllers.authenticateUser, NotificationControllers.details);
};
