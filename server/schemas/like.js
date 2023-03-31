/**
 * This schema represents the post's likes.
 * @author Nikhil Negi
 * @since 03-04-2021
 */
import { Schema } from 'mongoose';
import database from '../db';

const Like = new Schema({
	userRef: { type: Schema.Types.ObjectId, required: true },
	ref: { type: Schema.Types.ObjectId, required: true },
	status: { type: Boolean, default: true },
	type: { type: Number, required: true },
	createdOn: { type: Date, default: Date.now() },
	updatedOn: Date,
});

export default database.model('Like', Like);
