import { Schema } from 'mongoose';
import database from '../db';
/**
* schema definition for users credit card
* @author Santgurlal Singh
* @since 12 June, 2020
*/

const CreditCard = new Schema({
	userRef: { type: Schema.Types.ObjectId, required: true },
	stripeToken: String,
	lastDigitsOfCard: { type: Number, required: true },
	cardType: { type: String, required: true },
	stripeId: { type: String, required: true },
	country: { type: String, required: true },
	expiryMonth: { type: Number, required: true },
	expiryYear: { type: Number, required: true },
	deleted: { type: Boolean, default: false },
	createdOn: Number,
	updatedOn: Number,
});

export default database.model('CreditCard', CreditCard);
