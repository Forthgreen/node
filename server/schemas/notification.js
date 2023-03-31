/**
 * This schema represents the notification schema
 * @author Nikhil Negi
 * @since 19-04-21
 */
import { Schema } from 'mongoose';
import database from '../db';

const Notification = new Schema({
	notifyTo: { type: Schema.Types.ObjectId, required: true },
	userRef: { type: Schema.Types.ObjectId, required: true },
	ref: { type: Schema.Types.ObjectId, required: true },
	refType: { type: Number, required: true },
	message: { type: String, required: true },
	seen: { type: Boolean, default: false },
	deleted: { type: Boolean, default: false },
	deletedOn: Date,
	createdOn: Date,
	updatedOn: Date,
});

export default database.model('Notification', Notification);
