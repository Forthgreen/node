/**
* This schema represents the user following another user.
* @author Hitendra Pratap Singh
* @since 10-04-2023
*/

import { Schema } from 'mongoose';
import database from '../db';

const BlockUser = new Schema({
	userRef: { type: Schema.Types.ObjectId, required: true },
	blockingRef: { type: Schema.Types.ObjectId, required: true },
	createdOn: Date,
	updatedOn: Date,
});

export default database.model('BlockUser', BlockUser);
