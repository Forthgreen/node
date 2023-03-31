/**
 * This schema represents the user following brands.
 * @author Jagmohan Singh
 * @since 2 May 2020
 */
import { Schema } from 'mongoose';
import database from '../db';

const FollowBrand = new Schema({
	brandRef: { type: Schema.Types.ObjectId, required: true },
	userRef: { type: Schema.Types.ObjectId, required: true },
	lastProductDate: { type: Date, required: true },
	status: { type: Boolean, required: true },
	createdOn: Date,
	updatedOn: Date,
});

export default database.model('FollowBrand', FollowBrand);
