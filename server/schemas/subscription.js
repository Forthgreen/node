/**
* This schema represents the subscription schema
* @author Santgurlal Singh
* @since 16 June, 2020
*/
import { Schema } from 'mongoose';
import database from '../db';

const Subscription = new Schema({
	userRef: { type: Schema.Types.ObjectId, required: true },
	productId: { type: String, required: true },
	stripeResponse: { type: Object },
	cancellationRequested: { type: Boolean, default: false },
	cancellationRequestedOn: Date,
	endsOn: Date,
	createdOn: Date,
	updatedOn: Date,
	isActive: { type: Boolean, default: true },
});

export default database.model('Subscription', Subscription);
