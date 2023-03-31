import {
	ResponseUtility,
	HashUtility,
	PropsValidationUtility,
} from 'appknit-backend-bundle';
import {
	AdminModel,
} from '../../schemas';
import {
        SECRET_KEY,
} from '../../constants';
/**
* @description service model function to handle the
* signup of the admin
* @author Abhinav Sharma
* @since 1 June, 2020
* @param {String} email the email of the user.
* @param {String} password the password of the user.

*/
export default ({
	email,
    password,
    secretKey
}) => new Promise(async (resolve, reject) => {
	try {

        if(secretKey==SECRET_KEY)
        {
            // eslint-disable-next-line no-param-reassign
            const { code, message } = await PropsValidationUtility({
                validProps: [
                                    'email', 'password'
                ],
                sourceDocument: {
                                    email, password
                },
            });
            if (code !== 100) {
                return reject(ResponseUtility.MISSING_PROPS({ message }));
            }
            email = email.toLowerCase();
            const dateNow = new Date().getTime();
            const userExists = await AdminModel.findOne({ email });
            if (userExists) {
                return reject(ResponseUtility.GENERIC_ERR({ message: 'Admin is already registered.' }));
            }

            const adminObject = new AdminModel({
                email,
                password: await HashUtility.generate({ text: password }),
                createdOn: dateNow,
                updatedOn: dateNow,
            });
            await adminObject.save();

            // eslint-disable-next-line no-underscore-dangle
            return resolve(ResponseUtility.SUCCESS({ message: 'Admin Registered' }));
        }
		
	} catch (err) {
		return reject(ResponseUtility.GENERIC_ERR({ message: err.message, error: err }));
	}
});
