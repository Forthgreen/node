/**
 * This schema represents the user following rate and review given by user.
 * @author Jagmohan Singh
 * @since 7 May 2020
 */
import { Schema } from 'mongoose';
import database from '../db';

const RateAndReview = new Schema({
	productRef: { type: Schema.Types.ObjectId },
	restaurantRef: { type: Schema.Types.ObjectId },
	userRef: { type: Schema.Types.ObjectId, required: true },
	rating: { type: Number, max: 5 },
	title: { type: String },
	review: { type: String },
	type: { type: Number, required: true },
	freeze: { type: Boolean, default: false },
	blocked: { type: Boolean, default: false },
	createdOn: Date,
	updatedOn: Date,
});

export default database.model('RateAndReview', RateAndReview);
