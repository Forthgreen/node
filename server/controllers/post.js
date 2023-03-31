/**
* @description
* This is the constroller for the posts
* @author Nikhil Negi
* @since 01-04-2021
*/
import { PostModel } from '../model';
import { ModelResolver } from './resolvers';

export default {
	add: (req, res) => ModelResolver(req, res, PostModel.PostAddService),
	feed: (req, res) => ModelResolver(req, res, PostModel.PostFeedService),
	feedfollowing: (req, res) => ModelResolver(req, res, PostModel.PostFeedfollowingService),
	delete: (req, res) => ModelResolver(req, res, PostModel.PostDeleteService),
	like: (req, res) => ModelResolver(req, res, PostModel.PostLikeService),
	likeList: (req, res) => ModelResolver(req, res, PostModel.PostLikeListService),
};
