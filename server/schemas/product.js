/**
 * This schema represents the products in a products.
 * @author Jagmohan Singh
 * @since 2 May 2020
 */
import { Schema } from 'mongoose';
import database from '../db';
import { GENDER_FOR_PRODUCT } from '../constants';

const Product = new Schema({
	brandRef: { type: Schema.Types.ObjectId, required: true },
	name: { type: String, required: true },
	info: { type: String, required: true },
	category: { type: Number, required: true },
	subCategory: { type: Number },
	gender: { type: Number, default: GENDER_FOR_PRODUCT.BOTH },
	currency: { type: String, default: '' },
	price: { type: String, required: true },
	link: { type: String, required: true },
	images: [String],
	keywords: [String],
	uploadedToProfile: { type: Boolean, default: false },
	deleted: { type: Boolean, default: false },
	blocked: { type: Boolean, default: false },
	createdOn: Date,
	updatedOn: Date,
	isHidden: { type: Boolean, default: false },
	topDate: Date,
});

export default database.model('Product', Product);
