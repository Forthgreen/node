/**
* This schema represents the visits for a Restaurant.
* @author Santgurlal Singh
* @since 18 June, 2020
*/
import { Schema } from 'mongoose';
import database from '../db';

const RestaurantVisit = new Schema({
	restaurantRef: { type: Schema.Types.ObjectId, required: true },
	userRef: { type: Schema.Types.ObjectId, required: true },
	createdOn: Date,
	updatedOn: Date,
});

export default database.model('RestaurantVisit', RestaurantVisit);
