/**
* @description
* This is the constroller for the Bookmark
* @author Nikhil Negi
* @since 21-10-2021
*/
import { BookmarkModel } from '../model';
import { ModelResolver } from './resolvers';

export default {
	add: (req, res) => ModelResolver(req, res, BookmarkModel.BookmarkAddService),
	list: (req, res) => ModelResolver(req, res, BookmarkModel.BookmarkListService),
};
