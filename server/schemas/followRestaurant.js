/**
* This schema represents the user following restaurants.
* @author Santgurlal Singh
* @since 7 Oct, 2020
*/

import { Schema } from 'mongoose';
import database from '../db';

const FollowRestaurant = new Schema({
	restaurantRef: { type: Schema.Types.ObjectId, required: true },
	userRef: { type: Schema.Types.ObjectId, required: true },
	createdOn: Date,
	updatedOn: Date,
});

export default database.model('FollowRestaurant', FollowRestaurant);
