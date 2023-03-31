/**
 * This schema represents the brand schema
 * @author Jagmohan Singh
 * @since 2 May 2020
 */
import { Schema } from 'mongoose';
import database from '../db';

const Brand = new Schema({
	name: { type: String },
	email: { type: String, required: true },
	password: { type: String },
	mobileCode: { type: String, required: true },
	mobileNumber: { type: String, required: true },
	isVerified: { type: Boolean, default: false },
	isVerifiedByAdmin: { type: Boolean, default: false },
	companyName: { type: String, required: true },
	coverImage: { type: String, default: '' },
	logo: { type: String, default: '' },
	about: { type: String, default: '' },
	stripeCustomerId: String,
	firstLogin: { type: Boolean, default: true },
	blocked: { type: Boolean, default: false },
	deleted: { type: Boolean, default: false },
	isPremium: { type: Boolean, default: false },
	profileUploaded: { type: Boolean, default: false },
	website: { type: String },
	fcmToken: String,
	device: String,
	emailToken: Number,
	emailTokenDate: Date,
	createdOn: Date,
	updatedOn: Date,
	changePassToken: String,
	changePassTokenDate: Date,
	secondaryEmail: { type: String },
	changeEmailToken: String,
	changeEmailTokenDate: Date,
});

export default database.model('Brand', Brand);
