/**
* @description
* This is the constroller for the users to restaurants status
* @author Santgurlal Singh
* @since 7 Oct, 2020
*/

import { FollowRestaurantModel } from '../model';
import { ModelResolver } from './resolvers';

export default {
	update: (req, res) => ModelResolver(req, res, FollowRestaurantModel.Update),
	list: (req, res) => ModelResolver(req, res, FollowRestaurantModel.List),
};
