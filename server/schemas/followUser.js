/**
* This schema represents the user following another user.
* @author Nikhil Negi
* @since 13-04-2021
*/

import { Schema } from 'mongoose';
import database from '../db';

const FollowUser = new Schema({
	userRef: { type: Schema.Types.ObjectId, required: true },
	followingRef: { type: Schema.Types.ObjectId, required: true },
	createdOn: Date,
	updatedOn: Date,
});

export default database.model('FollowUser', FollowUser);
