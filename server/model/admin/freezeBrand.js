import {
	ResponseUtility,
} from 'appknit-backend-bundle';
import {
	BrandModel,
	ProductModel,
	FollowBrandModel,
} from '../../schemas';
/**
* @description service model function to freeze
* account of a specific brand entitled to admin
* @author Abhinav Sharma
* @since 30 May, 2020
*/

export default ({
	brandId,
}) => new Promise(async (resolve, reject) => {
	try {
		const brand = await BrandModel.findOne({ _id: brandId, deleted: false });
		if (!brand) {
			return reject(ResponseUtility.NO_USER({ message: 'Requested brand not found' }));
		}
		const date = new Date();
		const secondaryParameters = {
			$set: { blocked: !brand.blocked, updatedOn: date },
		};

		await BrandModel.findOneAndUpdate({ _id: brandId }, secondaryParameters, { new: true });
		
		return resolve(ResponseUtility.SUCCESS({}));
	} catch (err) {
		return reject(ResponseUtility.GENERIC_ERR({ message: err.message, error: err }));
	}
});
