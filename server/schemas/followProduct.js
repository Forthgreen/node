/**
 * This schema represents the user following restaurants.
 * @author Santgurlal Singh
 * @since 15 Jan, 2021
 */

import { Schema } from 'mongoose';
import database from '../db';

const FollowProduct = new Schema({
	productRef: { type: Schema.Types.ObjectId, required: true },
	userRef: { type: Schema.Types.ObjectId, required: true },
	createdOn: Date,
	updatedOn: Date,
});

export default database.model('FollowProduct', FollowProduct);
