import { ResponseUtility } from 'appknit-backend-bundle';
import fs from 'fs';
// eslint-disable-next-line import/no-extraneous-dependencies
import handlebars from 'handlebars';
import path from 'path';
import { BrandModel } from '../../schemas';
import { HOST } from '../../constants';
/**
* @description A service model function to handle the view part
* of the password screen.This will contain a token field and a
* new password screen and then allow to send request to change the
* password along with the password token and new password.
* @author Jagmohan Singh
* @since 1 May, 2020
* @param {String} id unique id of user
* @param {String} tok the password change token sent to user via email
*/
export default ({
	id,
	tok,
}) => new Promise(async (resolve, reject) => {
	try {
		if (!(id && tok)) {
			return reject(ResponseUtility.GENERIC_ERR({ message: 'Missing either of the required properties.' }));
		}
		const user = await BrandModel.findOne({ _id: id, changePassToken: tok });
		if (!user) {
			return reject(ResponseUtility.GENERIC_ERR({ message: 'Invalid Access Token.' }));
		}
		const html = fs.readFileSync(path.resolve(__dirname, '../../web', 'forgotPassword.hbs'), { encoding: 'utf-8' });
		const template = handlebars.compile(html);
		const props = { id, passToken: tok, url: `${HOST}brand` };
		const compiled = template(props);
		return resolve(ResponseUtility.SUCCESS({
			message: 'template',
			data: compiled,
		}));
	} catch (err) {
		return reject(ResponseUtility.GENERIC_ERR({ message: err.message, error: err }));
	}
});
