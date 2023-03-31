/* eslint-disable guard-for-in */
import {
	ResponseUtility,
} from 'appknit-backend-bundle';
import { Types } from 'mongoose';
import {
	RestaurantModel,
} from '../../schemas';
import {
	DEFAULT_RESTAURANT_MAX_DISTANCE,
} from '../../constants';

/**
* @description A service model function to handle the listing of restaurants in map.
* @author Nikhil Negi
* @since 23-10-2021
*/

export default ({
	longitude,
	latitude,
	text = '',
	distance = DEFAULT_RESTAURANT_MAX_DISTANCE,
	existId = [],
	page = 1,
	limit = 20,
}) => new Promise(async (resolve, reject) => {
	try {
		if (!(latitude && longitude)) {
			return reject(ResponseUtility.GENERIC_ERR({ message: 'Coordinates are required.' }));
		}

		let matchQuery;
		if (text) {
			matchQuery = {
				$match: {
					deleted: false,
					name: { $regex: new RegExp(text, 'i') },
				},
			};
		} else {
			matchQuery = {
				$geoNear: {
					near: { type: 'Point', coordinates: [longitude, latitude] },
					distanceField: 'distance',
					key: 'location',
					query: {
						deleted: false,
						_id: { $nin: existId.map(Types.ObjectId) },
					},
					maxDistance: Number(distance) * 1000,
				},
			};
		}

		console.log(distance)
		const restaurants = await RestaurantModel.aggregate([
			matchQuery,
			{
				$project: {
					_id: '$_id',
					images: '$images',
					name: '$name',
					thumbnail: '$thumbnail',
					location: {
						address: '$location.address',
						type: '$location.type',
						coordinates: { $reverseArray: [{ $ifNull: ['$location.coordinates', []] }] },
					},
					distance: '$distance',
				},
			},
			{
				$sort: { distance: 1 },
			},
			{
				$skip: limit * (page - 1),
			},
			{
				$limit: limit,
			},
			{
				$limit: 50,
			},
		]);

		return resolve(ResponseUtility.SUCCESS_PAGINATION({ data: restaurants, page, limit }));
	} catch (err) {
		return reject(ResponseUtility.GENERIC_ERR({ message: err.message, error: err }));
	}
});
