/**
* @description
* This is the constroller for the posts
* @author Nikhil Negi
* @since 22-10-2021
*/
import { TagModel } from '../model';
import { ModelResolver } from './resolvers';

export default {
	list: (req, res) => ModelResolver(req, res, TagModel.TagListService),
};
