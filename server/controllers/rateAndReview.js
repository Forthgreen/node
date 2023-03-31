/* eslint-disable max-len */
/**
* @description
* This is the constroller for the rate and review given by user.
* @author Jagmohan Singh
* @since 7 May, 2020
*/
import { RateAndReviewModel } from '../model';
import { ModelResolver } from './resolvers';

export default {
	add: (req, res) => ModelResolver(req, res, RateAndReviewModel.RateAndReviewsAddService),
	list: (req, res) => ModelResolver(req, res, RateAndReviewModel.RateAndReviewsListService),
};
