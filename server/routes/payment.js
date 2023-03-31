import {
	AuthenticationControllers,
	PaymentControllers,
} from '../controllers';

const prefix = '/api/payment/';
/**
* @description
* This is the route handler for the payment
* @author Santgurlal Singh
* @since 12 June, 2020
*/
export default (app) => {
	app.post(`${prefix}upgradePlan`, AuthenticationControllers.authenticateBrandOwner, PaymentControllers.upgradePlan);
	app.post(`${prefix}sendInvoice`, AuthenticationControllers.authenticateBrandOwner, PaymentControllers.sendInvoice);
	app.post(`${prefix}cancelPlan`, AuthenticationControllers.authenticateBrandOwner, PaymentControllers.cancelPlan);
	app.post(`${prefix}getCard`, AuthenticationControllers.authenticateBrandOwner, PaymentControllers.getCard);
	app.post(`${prefix}transactionList`, AuthenticationControllers.authenticateBrandOwner, PaymentControllers.transactionList);
	app.post(`${prefix}changeCard`, AuthenticationControllers.authenticateBrandOwner, PaymentControllers.changeCard);
	app.post(`${prefix}couponDetails`, AuthenticationControllers.authenticateBrandOwner, PaymentControllers.couponDetails);
};
