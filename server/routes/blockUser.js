import {
	BlockUserControllers,
	AuthenticationControllers,
} from '../controllers';

const prefix = '/api/block/';
/**
* @description
* This is the route handler for the user blocking other user
* @author Hitendra Pratap Singh
* @since 06-04-2023
*/

export default (app) => {
	app.post(`${prefix}user`, AuthenticationControllers.authenticateUser, BlockUserControllers.user);
	app.post(`${prefix}list`, AuthenticationControllers.authenticateUser, BlockUserControllers.list);
};
