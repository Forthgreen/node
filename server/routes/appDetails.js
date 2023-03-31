import {
	AppDetailsControllers,
} from '../controllers';

const prefix = '/api/appDetails/';
/**
 * @description
 * This is the route handler for app details.
 * @author Jagmohan Singh
 * @since May 2, 2020
 */
export default (app) => {
	app.post(`${prefix}create`, AppDetailsControllers.create);
	app.post(`${prefix}list`, AppDetailsControllers.list);
	app.post(`${prefix}update`, AppDetailsControllers.update);
};
