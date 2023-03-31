/**
* @description
* This is the constroller for the restaurant
* @author Santgurlal Singh
* @since 5 Oct, 2020
*/
import zlib from 'zlib';
import { RestaurantModel } from '../model';
import { ModelResolver } from './resolvers';

export default {
	add: (req, res) => ModelResolver(req, res, RestaurantModel.Add),
	list: (req, res) => ModelResolver(req, res, RestaurantModel.List),
	map: (req, res) => ModelResolver(req, res, RestaurantModel.Map),
	// ModelResolver(req, res, RestaurantModel.Map),
	listAll: (req, res) => ModelResolver(req, res, RestaurantModel.ListAll),
	delete: (req, res) => ModelResolver(req, res, RestaurantModel.Delete),
	edit: (req, res) => ModelResolver(req, res, RestaurantModel.Edit),
	details: (req, res) => ModelResolver(req, res, RestaurantModel.Details),
	detailsGuest: (req, res) => ModelResolver(req, res, RestaurantModel.DetailsGuest),
};
