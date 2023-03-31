/**
 * @description
 * This is the constroller for the users to product status
 * @author Santgurlal Singh
 * @since 15 Jan, 2021
 */

import { FollowProductModel } from '../model';
import { ModelResolver } from './resolvers';

export default {
	update: (req, res) => ModelResolver(req, res, FollowProductModel.Update),
	list: (req, res) => ModelResolver(req, res, FollowProductModel.List),
};
