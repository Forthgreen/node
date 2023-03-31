/**
 * This schema represents the users profile schema
 * @author Jagmohan Singh
 * @since ! May 2020
 */
import { Schema } from 'mongoose';
import database from '../db';
import { GENDER } from '../constants';

const User = new Schema({
	firstName: { type: String },
	lastName: { type: String, default: '' },
	email: { type: String, required: true },
	username: { type: String },
	password: { type: String },
	image: { type: String, default: '' },
	bio: { type: String, default: '' },
	isVerified: { type: Boolean, default: false },
	gender: { type: Number, default: GENDER.MALE },
	dateOfBirth: { type: Date },
	stripeCustomerId: { type: String },
	blocked: { type: Boolean, default: false },
	deleted: { type: Boolean, default: false },
	fcmToken: String,
	device: String,
	emailToken: Number,
	emailTokenDate: Date,
	socialId: String,
	socialToken: String,
	socialIdentifier: Number,
	createdOn: Date,
	updatedOn: Date,
	changePassToken: String,
	changePassTokenDate: Date,
	secondaryEmail: { type: String },
	changeEmailToken: String,
	changeEmailTokenDate: Date,
	dummyUser: { type: Boolean },
});

export default database.model('User', User);
