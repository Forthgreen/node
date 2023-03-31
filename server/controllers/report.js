/* eslint-disable max-len */
/**
* @description
* This is the constroller for the rate and review given by user.
* @author Jagmohan Singh
* @since 7 May, 2020
*/
import { ReportModel } from '../model';
import { ModelResolver } from './resolvers';

export default {
	brandOrReview: (req, res) => ModelResolver(req, res, ReportModel.ReportsBrandOrReviewService),
	post: (req, res) => ModelResolver(req, res, ReportModel.ReportsPostService),
	comment: (req, res) => ModelResolver(req, res, ReportModel.ReportsCommentService),
	user: (req, res) => ModelResolver(req, res, ReportModel.ReportsUserService),
};
