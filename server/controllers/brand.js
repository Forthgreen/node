/**
* @description
* This is the constroller for the brands
* @author Jagmohan Singh
* @since 2 May, 2020
*/
import { BrandModel } from '../model';
import { ModelResolver } from './resolvers';

export default {
	signup: (req, res) => ModelResolver(req, res, BrandModel.BrandsSignupService),
	verify: (req, res) => {
		const { query: { id, emailToken } } = req;
		BrandModel.BrandsVerifyService({ id, emailToken })
			.then(sucess => res.send(sucess))
			.catch(err => res.send(err));
	},
	login: (req, res) => ModelResolver(req, res, BrandModel.BrandsLoginService),
	resendVerification: (req, res) => ModelResolver(
		req, res, BrandModel.BrandsResendVerificationService,
	),
	password: (req, res) => {
		const { query: { id, tok } } = req;
		BrandModel.BrandsPasswordService({ id, tok })
			.then((sucess) => {
				res.set('Content-Type', 'text/html');
				res.send(sucess.data);
			})
			.catch(err => res.send(err));
	},
	forgotPassword: (req, res) => ModelResolver(req, res, BrandModel.BrandsForgotPasswordService),
	update: (req, res) => ModelResolver(req, res, BrandModel.BrandsUpdateService),
	list: (req, res) => ModelResolver(req, res, BrandModel.BrandsListService),
	search: (req, res) => ModelResolver(req, res, BrandModel.BrandsSearchService),
	details: (req, res) => ModelResolver(req, res, BrandModel.BrandsDetailsService),
	selfDetails: (req, res) => ModelResolver(req, res, BrandModel.BrandsSelfDetailsService),
	changePassword: (req, res) => ModelResolver(req, res, BrandModel.BrandsChangePasswordService),
	verifyNewEmail: (req, res) => {
		const { query: { id, tok } } = req;
		BrandModel.BrandsVerifyNewEmailService({ id, tok })
			.then(sucess => res.send(sucess))
			.catch(err => res.send(err));
	},
};
