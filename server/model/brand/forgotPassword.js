import { ResponseUtility, HashUtility } from 'appknit-backend-bundle';
import { BrandModel } from '../../schemas';
/**
* @description A service model function to handle the view part
* of the password screen.This will contain a token field and a
* new password screen and then allow to send request to change the
* password along with the password token and new password.
* @author Jagmohan Singh
* @since 15 April, 2020
* @param {String} id unique id of user
* @param {String} passToken the password change token sent to user via email
* @param {String} password the new password
*/
export default ({
	id,
	passToken,
	password,
}) => new Promise(async (resolve, reject) => {
	try {
		if (!(id && passToken && password)) {
			return resolve(ResponseUtility.GENERIC_ERR({ message: 'Some required property missing.' }));
		}
		const dateNow = new Date().getTime();
		const user = await BrandModel.findOne({ _id: id, changePassToken: passToken });
		if (!user || user.changePassTokenDate < dateNow) {
			return resolve(ResponseUtility.GENERIC_ERR({ message: 'Invalid Access Token.' }));
		}
		const updateQuery = {
			$set: {
				password: await HashUtility.generate({ text: password }),
			},
			$unset:
			{
				changePassToken: 1,
				changePassTokenDate: 1,
			},
		};
		await BrandModel.updateOne({ _id: id }, updateQuery);
		return resolve(ResponseUtility.SUCCESS({ message: 'Your Forthgreen Account password has been updated successfully.' }));
	} catch (err) {
		return reject(ResponseUtility.GENERIC_ERR({ message: err.message, error: err }));
	}
});
