/**
* This schema represents the products in a restaurants.
* @author Santgurlal Singh
* @since 5 Oct, 2020
*/
import { Schema } from 'mongoose';
import database from '../db';

const Restaurant = new Schema({
	name: { type: String, required: true },
	website: { type: String, required: true },
	about: { type: String, required: true },
	phoneCode: { type: String, default: '' },
	phoneNumber: { type: String, default: '' },
	location: {
		address: { type: String, default: '' },
		type: { type: String, default: 'Point' },
		coordinates: [Number, Number],
	},
	portCode: { type: String, required: true },
	typeOfFood: { type: String, required: true },
	price: { type: String, required: true },
	categories: { type: Object, default: [] },
	showPhoneNumber: { type: Boolean, default: false },
	thumbnail: { type: String, required: true },
	placePicture: { type: String },
	images: [String],
	deleted: { type: Boolean, default: false },
	blocked: { type: Boolean, default: false },
	deletedOn: Date,
	createdOn: Date,
	updatedOn: Date,
});

Restaurant.index({ location: '2dsphere' });
export default database.model('Restaurant', Restaurant);
