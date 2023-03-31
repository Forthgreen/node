/**
 * This schema represents the comments of the posts.
 * @author Nikhil Negi
 * @since 03-04-2021
 */
import { Schema } from 'mongoose';
import database from '../db';

const Comment = new Schema({
	userRef: { type: Schema.Types.ObjectId, required: true },
	postRef: { type: Schema.Types.ObjectId, required: true },
	commentRef: { type: Schema.Types.ObjectId, default: null },
	comment: { type: String },
	tags: { type: Object, default: [] },
	status: { type: Boolean, default: true },
	deletedBy: { type: Number },
	deletedOn: { type: Date, default: null },
	createdOn: Date,
	updatedOn: Date,
});

export default database.model('Comment', Comment);
