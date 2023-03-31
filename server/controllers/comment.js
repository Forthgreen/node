/**
* @description
* This is the controller for the comments by the user
* @author Nikhil Negi
* @since 05-04-2021
*/
import { CommentModel } from '../model';
import { ModelResolver } from './resolvers';

export default {
	add: (req, res) => ModelResolver(req, res, CommentModel.CommentAddService),
	delete: (req, res) => ModelResolver(req, res, CommentModel.CommentDeleteService),
	like: (req, res) => ModelResolver(req, res, CommentModel.CommentLikeService),
	list: (req, res) => ModelResolver(req, res, CommentModel.CommentListService),
};
