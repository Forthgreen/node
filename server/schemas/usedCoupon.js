/**
* This schema represents the coupons used by users
* @author Santgurlal Singh
* @since 24 July, 2020
*/
import { Schema } from 'mongoose';
import database from '../db';

const UsedCoupon = new Schema({
	coupon: { type: String, required: true },
	userRef: { type: Schema.Types.ObjectId, required: true },
	createdOn: Date,
	updatedOn: Date,
});

export default database.model('UsedCoupon', UsedCoupon);
