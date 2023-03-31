/**
 * This schema represents the posts of the user.
 * @author Nikhil Negi
 * @since 01-04-2021
 */
import { Schema } from 'mongoose';
import database from '../db';

const Post = new Schema({
	userRef: { type: Schema.Types.ObjectId, required: true },
	text: { type: String, default: '' },
	type: { type: Number },
	image: [{ type: String }],
	video: { type: String },
	tags: { type: Object, default: [] },
	status: { type: Boolean, default: true },
	deletedBy: { type: Number },
	deletedOn: { type: Date },
	createdOn: Date,
	updatedOn: Date,
	thumbnail: { type: String },
	videoWidth: { type: Number },
	videoHeight: { type: Number },
});

export default database.model('Post', Post);
