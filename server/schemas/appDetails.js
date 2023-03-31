/**
 * This schema represents the app details
 * @author Jagmohan Singh
 * @since 14 May 2020
 */
import { Schema } from 'mongoose';
import database from '../db';

const AppDetails = new Schema({
	aboutUs: { type: String, default: 'about us' },
	aboutUsUpdated: { type: Date },
	termsAndCondition: { type: String, default: 'terms' },
	termsAndConditionUpdated: { type: Date },
	privacyPolicy: { type: String, default: 'policy' },
	privacyPolicyUpdated: { type: Date },
});
export default database.model('AppDetails', AppDetails);
