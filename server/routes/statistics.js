import {
	StatisticsControllers,
	AuthenticationControllers,
} from '../controllers';

const prefix = '/api/statistics/';
/**
* @description
* This is the route handler for the statistics.
* @author Santgurlal Singh
* @since June 18, 2020
*/

export default (app) => {
	app.post(`${prefix}productVisit`, AuthenticationControllers.authenticateUser, StatisticsControllers.productVisit);
	app.post(`${prefix}websiteClick`, AuthenticationControllers.authenticateUser, StatisticsControllers.websiteClick);
	app.post(`${prefix}list`, AuthenticationControllers.authenticateBrandOwner, StatisticsControllers.list);
};
