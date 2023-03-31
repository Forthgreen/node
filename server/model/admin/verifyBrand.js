import {
	ResponseUtility,
} from 'appknit-backend-bundle';
import {
	BrandModel,
} from '../../schemas';
import {
	TemplateMailService,
} from '../../services';

/**
* @description service model function to verify
* a specific brand.
* @author Santgurlal Singh
* @param {String} brandId the uique id of a brand.
* @since 6 July, 2020
*/

export default ({
	brandId,
}) => new Promise(async (resolve, reject) => {
	try {
		const brand = await BrandModel.findOne({ _id: brandId, deleted: false });
		if (!brand) {
			return reject(ResponseUtility.NO_USER({ message: 'Requested brand not found' }));
		}
		if (brand.isVerifiedByAdmin) {
			return reject(ResponseUtility.NO_USER({ message: 'You already verified this brand.' }));
		}

		await BrandModel.findOneAndUpdate({ _id: brandId }, { isVerifiedByAdmin: true });

		await TemplateMailService.UserVerified({
			to: brand.email,
		});

		return resolve(ResponseUtility.SUCCESS());
	} catch (err) {
		return reject(ResponseUtility.GENERIC_ERR({ message: err, error: err }));
	}
});
