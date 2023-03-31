import { ResponseUtility, HashUtility } from 'appknit-backend-bundle';
import UserModel from '../../schemas/user';
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
			return resolve('<h1 style="text-align: center">Some required property missing.</h1>');
		}
		const user = await UserModel.findOne({ _id: id, changePassToken: passToken });
		const dateNow = new Date().getTime();
		if (!user || user.changePassTokenDate < dateNow) {
			return resolve('<h1 style="text-align: center">Invalid Access Token.</h1>');
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
		await UserModel.updateOne({ _id: id }, updateQuery);
		return resolve('<h1 style="text-align: center">Your Forthgreen Account password has been updated successfully.</h1>');
	} catch (err) {
		return reject(ResponseUtility.GENERIC_ERR({ message: err.message, error: err }));
	}
});
