import {
	RateAndReviewControllers,
	AuthenticationControllers,
} from '../controllers';

const prefix = '/api/rateAndReview/';
/**
 * @description
 * This is the route handler for the rate and review given by user.
 * @author Jagmohan Singh
 * @since May 7, 2020
 */
export default (app) => {
	app.post(`${prefix}add`, AuthenticationControllers.authenticateUser, RateAndReviewControllers.add);
	app.post(`${prefix}list`, RateAndReviewControllers.list);
	app.post(`${prefix}myList`, AuthenticationControllers.authenticateUser, RateAndReviewControllers.list);
};
