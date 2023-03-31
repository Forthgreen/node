import {
	ResponseUtility,
	HashUtility,
} from 'appknit-backend-bundle';

import { UserModel } from '../../schemas';
/**
 * @description
 * A Service model function to handle change password of a user.
 * @author Abhinav Sharma
 * @since 10 March, 2021
 */

export default ({
	id,
	currentPassword,
	password,
}) => new Promise(async (resolve, reject) => {
	try {
		if (!(id && currentPassword && password)) {
			return reject(ResponseUtility.GENERIC_ERR({ message: 'Some required property missing!' }));
		}
		const user = await UserModel.findOne({ _id: id, });
        if (await HashUtility.compare({text:user.password, hash:currentPassword}))
        {
            // console.log("password")
		const updateQuery = {
			$set: {
				password: await HashUtility.generate({ text: password }),
			},
		};
		await UserModel.updateOne({ _id: id }, updateQuery);

		return resolve(ResponseUtility.SUCCESS({
			message: 'Password updated!',
		}));
	}
		else{
		return reject(ResponseUtility.GENERIC_ERR({ message: 'Wrong Current Password!' }));
	}} catch (err) {
		return reject(ResponseUtility.GENERIC_ERR({ message: err.message, error: err }));
	}
});