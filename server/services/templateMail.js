/**
* This service module deals with the sending of template emails
* @author Santgurlal Singh
* @since Monday, June 17, 2020
*/
import fs from 'fs';
import path from 'path';
import handlebars from 'handlebars';
import nodemailer from 'nodemailer';
import { ResponseUtility } from 'appknit-backend-bundle';

const { BUSINESS_EMAIL, BUSINESS_EMAIL_PASSWORD, HOST } = process.env;

const transporter = nodemailer.createTransport({
	service: 'Gmail',
	auth: {
		user: BUSINESS_EMAIL,
		pass: BUSINESS_EMAIL_PASSWORD,
	},
});

/**
* function to send mail
* @param {String} to		-> send email to
* @param {String} text		-> email content
* @param {String} subject	-> subject of email
*/
const sendMail = ({ to, subject = 'Mail from ShiftBookd app', html }) => new Promise((resolve, reject) => {
	transporter.sendMail({
		from: BUSINESS_EMAIL,
		to,
		html,
		subject,
	}, (err) => {
		if (err) {
			return reject(ResponseUtility.GENERIC_ERR({ message: 'Error sending email.', error: err }));
		}
		return resolve(ResponseUtility.SUCCESS());
	});
});


/**
* To send billing invoice
* @param {String} transactionId
* @param {String} cardLast4
* @param {String} cardType
* @param {Number} amount
* @param {Number} date
*/
const SendInvoice = ({
	to, subject = 'Forthgreen Billing Invoice', transactionId, cardLast4, cardType, amount, date,
}) => new Promise((resolve, reject) => {
	const html = fs.readFileSync(path.resolve(__dirname, 'templates', 'billing_invoice_template.html'), { encoding: 'utf-8' });
	const template = handlebars.compile(html);
	const props = {
		to, transactionId, cardLast4, cardType, amount, date,
	};
	const compiled = template(props);
	sendMail({ to, subject, html: compiled })
		.then(success => resolve(success))
		.catch(err => reject(err));
});

/**
 * send this email template for now account registering
 * @param {String} to, email of the user to send email
 * @param {Number} link to send the verification link
 */
const VerificationMail = ({
	to, link,
}) => new Promise((resolve, reject) => {
	const html = fs.readFileSync(path.resolve(__dirname, 'templates', 'new_account_template.html'), { encoding: 'utf-8' });
	const template = handlebars.compile(html);
	const props = {
		link,
	};
	const compiled = template(props);
	sendMail({ to, subject: 'Please verify your email', html: compiled })
		.then(success => resolve(success))
		.catch(err => reject(err));
});

/**
 * alert user that their account is verified
 * @param {String} to, email of the user to send email
 */
const UserVerified = ({
	to,
}) => new Promise((resolve, reject) => {
	const html = fs.readFileSync(path.resolve(__dirname, 'templates', 'verify_account_template.html'), { encoding: 'utf-8' });
	const template = handlebars.compile(html);
	const props = {};
	const compiled = template(props);
	sendMail({ to, subject: 'Welcome to Forthgreen', html: compiled })
		.then(success => resolve(success))
		.catch(err => reject(err));
});

export default {
	SendInvoice,
	VerificationMail,
	UserVerified,
};
