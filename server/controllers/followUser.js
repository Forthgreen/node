/**
 * @description
 * This is the constroller for the users to follow users
 * @author Nikhil Negi
 * @since 15-04-21
 */

import { FollowUserModel } from '../model';
import { ModelResolver } from './resolvers';

export default {
	user: (req, res) => ModelResolver(req, res, FollowUserModel.User),
	list: (req, res) => ModelResolver(req, res, FollowUserModel.List),
};
