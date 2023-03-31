/**
* @description
* This is the constroller for the AppDetails
* @author Jagmohan Singh
* @since 2 May, 2020
*/
import { AppDetailsModel } from '../model';
import { ModelResolver } from './resolvers';

export default {
	create: (req, res) => ModelResolver(req, res, AppDetailsModel.AppDetailsCreateService),
	list: (req, res) => ModelResolver(req, res, AppDetailsModel.AppDetailsListService),
	update: (req, res) => ModelResolver(req, res, AppDetailsModel.AppDetailsUpdateService),
};
