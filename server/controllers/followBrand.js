/**
* @description
* This is the constroller for the users to brands status
* @author Jagmohan Singh
* @since 1 May, 2020
*/
import { FollowBrandModel } from '../model';
import { ModelResolver } from './resolvers';

export default {
	update: (req, res) => ModelResolver(req, res, FollowBrandModel.FollowBrandsUpdateService),
};
