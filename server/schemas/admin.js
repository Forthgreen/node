/**
 * This schema represents the admin profile schema
 * @author Abhinav Sharma
 * @since 29 May 2020
 */
import { Schema } from 'mongoose';
import database from '../db';
import { GENDER } from '../constants';

const Admin = new Schema({
	email: { type: String, required: true },
	password: { type: String },
	createdOn: Date,
	updatedOn: Date,
});

export default database.model('Admin', Admin);
