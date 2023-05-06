/**
 * @description
 * This is the constroller for the users to block users
 * @author Hitendra Pratap Singh
 * @since 06-04-2023
 */

import { BlockUserModel } from '../model';
import { ModelResolver } from './resolvers';

export default {
	user: (req, res) => ModelResolver(req, res, BlockUserModel.User),
	list: (req, res) => ModelResolver(req, res, BlockUserModel.List),
};
