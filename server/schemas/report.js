/**
 * This schema represents the user following rate and review given by user.
 * @author Jagmohan Singh
 * @since 7 May 2020
 */
import { Schema } from 'mongoose';
import database from '../db';

const Report = new Schema({
	userRef: { type: Schema.Types.ObjectId, required: true },
	reviewRef: { type: Schema.Types.ObjectId },
	brandRef: { type: Schema.Types.ObjectId },
	ref: { type: Schema.Types.ObjectId },
	brandReportType: { type: Number },
	refReportType: { type: Number },
	feedback: { type: String, default: '' },
	reportType: { type: Number, required: true },
	createdOn: Date,
	updatedOn: Date,
});

export default database.model('Report', Report);
