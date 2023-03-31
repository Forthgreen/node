/**
* @description
* This is the constroller for the statistics.
* @author Santgurlal Singh
* @since 18 June, 2020
*/
import { StatisticsModel } from '../model';
import { ModelResolver } from './resolvers';

export default {
	productVisit: (req, res) => ModelResolver(req, res, StatisticsModel.ProductVisit),
	websiteClick: (req, res) => ModelResolver(req, res, StatisticsModel.WebsiteClick),
	list: (req, res) => ModelResolver(req, res, StatisticsModel.List),
};
