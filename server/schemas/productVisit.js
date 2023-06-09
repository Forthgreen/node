/**
* This schema represents the visits for a product.
* @author Santgurlal Singh
* @since 18 June, 2020
*/
import { Schema } from 'mongoose';
import database from '../db';

const ProductVisit = new Schema({
	productRef: { type: Schema.Types.ObjectId, required: true },
	userRef: { type: Schema.Types.ObjectId, required: true },
	createdOn: Date,
	updatedOn: Date,
});

export default database.model('ProductVisit', ProductVisit);
