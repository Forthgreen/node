/* eslint-disable max-len */
/**
* @description
* This is the constroller for the rate and review given by user for restaurant.
* @author Santgurlal Singh
* @since 6 Oct, 2020
*/
import { RateRestaurantModel } from '../model';
import { ModelResolver } from './resolvers';

export default {
	add: (req, res) => ModelResolver(req, res, RateRestaurantModel.Add),
	list: (req, res) => ModelResolver(req, res, RateRestaurantModel.List),
};
