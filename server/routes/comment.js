import {
	AuthenticationControllers,
	CommentControllers,
} from '../controllers';

const prefix = '/api/comment/';
/**
 * @description
 * This is the route handler for the user's comments
 * @author Nikhil Negi
 * @since 05-04-2021
*/
export default (app) => {
	app.post(`${prefix}add`, AuthenticationControllers.authenticateUser, CommentControllers.add);
	app.post(`${prefix}delete`, AuthenticationControllers.authenticateUser, CommentControllers.delete);
	app.post(`${prefix}like`, AuthenticationControllers.authenticateUser, CommentControllers.like);
	app.post(`${prefix}list`, AuthenticationControllers.authenticateUser, CommentControllers.list);
};
