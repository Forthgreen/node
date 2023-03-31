import {
	ResponseUtility,
} from 'appknit-backend-bundle';

import { BrandModel } from '../../schemas';

/**
 * @description handle the otp verificiation process
 * @author Jagmohan Singh
 * @since 5 May 2020
 */


export default ({
	id,
	emailToken,
}) => new Promise(async (resolve, reject) => {
	try {
		if (!(id && emailToken)) {
			return reject(ResponseUtility.GENERIC_ERR({ message: 'Missing either of the required properties.' }));
		}
		const user = await BrandModel.findOne({ _id: id, emailToken });
		if (!user) {
			return reject(ResponseUtility.GENERIC_ERR({ message: 'Invalid Access Token.' }));
		}
		if (user.isVerified) {
			return resolve('<div style="font-family: Montserrat, Arial; margin: 60px; text-align: center"><img src="https://forthgreen.s3.us-east-2.amazonaws.com/assets/logo.png" style="height: 39px; width: 228px"><div style="height: 54px; font-size: 16px; font-weight: normal; font-stretch: normal; font-style: normal; line-height: 1.13; letter-spacing: 0.11px; color: #1e2526; margin-top: 40px">Your email is already verified!</div><div style="height: 54px; font-size: 16px; font-weight: normal; font-stretch: normal; font-style: normal; line-height: 1.13; letter-spacing: 0.11px; color: #1e2526;">You can now continue creating your profile in Forthgreen.</div><a href="https://profile.forthgreen.com/login"><button style="width: 180px; height: 56px; border-radius: 4px; background-color: #2bd695; border-color: #2bd695;">CONTINUE</button></a></div>');
		}
		const updateQuery = {
			$set: {
				isVerified: true,
			},
			$unset:
			{
				emailToken: 1,
				emailTokenDate: 1,
			},
		};
		await BrandModel.updateOne({ _id: id }, updateQuery);
		return resolve('<div style="font-family: Montserrat, Arial; margin: 60px; text-align: center"><img src="https://forthgreen.s3.us-east-2.amazonaws.com/assets/logo.png" style="height: 39px; width: 228px"><div style="height: 54px; font-size: 16px; font-weight: normal; font-stretch: normal; font-style: normal; line-height: 1.13; letter-spacing: 0.11px; color: #1e2526; margin-top: 40px">Your email has been verified!</div><div style="height: 54px; font-size: 16px; font-weight: normal; font-stretch: normal; font-style: normal; line-height: 1.13; letter-spacing: 0.11px; color: #1e2526;">You can now continue creating your profile in Forthgreen.</div><a href="https://profile.forthgreen.com/login"><button style="width: 180px; height: 56px; border-radius: 4px; background-color: #2bd695; border-color: #2bd695;">CONTINUE</button></a></div>');
	} catch (err) {
		return reject(ResponseUtility.GENERIC_ERR({ message: err.message, error: err }));
	}
});
