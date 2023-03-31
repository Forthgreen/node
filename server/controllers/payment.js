/**
* @description
* This is the constroller for the payments
* @author Santgurlal Singh
* @since 12 June, 2020
*/
import { PaymentModel } from '../model';
import { ModelResolver } from './resolvers';

export default {
	upgradePlan: (req, res) => ModelResolver(req, res, PaymentModel.PaymentUpgradePlanService),
	sendInvoice: (req, res) => ModelResolver(req, res, PaymentModel.PaymentSendInvoiceService),
	cancelPlan: (req, res) => ModelResolver(req, res, PaymentModel.PaymentCancelPlanService),
	getCard: (req, res) => ModelResolver(req, res, PaymentModel.PaymentGetCardService),
	transactionList:
		(req, res) => ModelResolver(req, res, PaymentModel.PaymentTransactionListService),
	changeCard: (req, res) => ModelResolver(req, res, PaymentModel.PaymentChangeCardService),
	couponDetails: (req, res) => ModelResolver(req, res, PaymentModel.PaymentCouponDetailsService),
};
