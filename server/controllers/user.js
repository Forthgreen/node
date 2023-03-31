/**
* @description
* This is the constroller for the users
* @author Jagmohan Singh
* @since 1 May, 2020
*/
import { UserModel } from '../model';
import { ModelResolver } from './resolvers';

export default {
	signup: (req, res) => ModelResolver(req, res, UserModel.UsersSignupService),
	verify: (req, res) => {
		const { query: { id, emailToken } } = req;
		UserModel.UsersVerifyService({ id, emailToken })
			.then(sucess => res.send(sucess))
			.catch(err => res.send(err));
	},
	login: (req, res) => ModelResolver(req, res, UserModel.UsersLoginService),
	resendVerification: (req, res) => ModelResolver(
		req, res, UserModel.UsersResendVerificationService,
	),
	password: (req, res) => {
		const { query: { id, tok } } = req;
		UserModel.UsersPasswordService({ id, tok })
			.then((sucess) => {
				res.set('Content-Type', 'text/html');
				res.send(sucess.data);
			})
			.catch(err => res.send(err));
	},
	forgotPassword: (req, res) => ModelResolver(req, res, UserModel.UsersForgotPasswordService),
	update: (req, res) => ModelResolver(req, res, UserModel.UsersUpdateService),
	deleteaccount:(req, res) => ModelResolver(req, res, UserModel.UsersDeleteService),
	socialLogin: (req, res) => ModelResolver(req, res, UserModel.UsersSocialLoginService),
	verifyNewEmail: (req, res) => {
		const { query: { id, tok } } = req;
		UserModel.UsersVerifyNewEmailService({ id, tok })
			.then(sucess => res.send(sucess))
			.catch(err => res.send(err));
	},
	myBrands: (req, res) => ModelResolver(req, res, UserModel.UsersMyBrandsService),
	details: (req, res) => ModelResolver(req, res, UserModel.UsersDetailsService),
	profile: (req, res) => ModelResolver(req, res, UserModel.UsersProfileService),
	search: (req, res) => ModelResolver(req, res, UserModel.UsersSearchService),
	logout: (req, res) => ModelResolver(req, res, UserModel.UsersLogoutService),
	changePassword: (req, res) => ModelResolver(req, res, UserModel.UsersChangePasswordService),
};
