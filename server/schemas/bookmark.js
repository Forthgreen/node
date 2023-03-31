/**
 * This schema represents the bookmark the product, brand and restaurants.
 * @author Nikhil Negi
 * @since 21-10-2021
 */
import { Schema } from 'mongoose';
import database from '../db';

const Bookmark = new Schema({
	ref: { type: Schema.Types.ObjectId, required: true },
	userRef: { type: Schema.Types.ObjectId, required: true },
	refType: { type: Number, required: true },
	status: { type: Boolean, default: true },
	createdOn: { type: Date, default: Date.now },
	updatedOn: { type: Date, default: Date.now },
});

export default database.model('Bookmark', Bookmark);
