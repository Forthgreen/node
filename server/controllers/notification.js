/**
 * @description
 * This is the constroller for the users notification
 * @author Nikhil Negi
 * @since 19-04-21
 */

import { NotificationModel } from '../model';
import { ModelResolver } from './resolvers';

export default {
	seen: (req, res) => ModelResolver(req, res, NotificationModel.Seen),
	list: (req, res) => ModelResolver(req, res, NotificationModel.List),
	details: (req, res) => ModelResolver(req, res, NotificationModel.Details),
};
