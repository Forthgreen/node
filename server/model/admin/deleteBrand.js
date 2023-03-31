import {
	ResponseUtility,
	SchemaMapperUtility,
} from 'appknit-backend-bundle';
import { PaymentModel as PaymentModelService } from '..';
import { StripeService } from '../../services';
import {
	BrandModel,
	ProductModel,
	FollowBrandModel,
	ReportModel,
} from '../../schemas';
import {
	AMQP_QUEUES,
	SUBSRIPTION_STATUS,
} from '../../constants';

/**
* @description service model function to delete
* a specific brand and its properties from the application
* @author Abhinav Sharma
* @since 2 June, 2020
*/

export default ({
	brandId,
	AMQPChannel,
}) => new Promise(async (resolve, reject) => {
	try {
		const brand = await BrandModel.findOne({ _id: brandId, deleted: false });
		if (!brand) {
			return reject(ResponseUtility.NO_USER({ message: 'Requested brand not found' }));
		}
		AMQPChannel.sendToQueue(
			AMQP_QUEUES.PICTURE_DELETE,
			Buffer.from(JSON.stringify({
				name: brand.coverImage,
			})),
		);
		const brandUpdate = await SchemaMapperUtility({
			deleted: true,
			updatedOn: new Date(),
		});
		await BrandModel.findOneAndUpdate({ _id: brandId }, brandUpdate, { new: true });

		const productList = await ProductModel.find({ brandRef: brandId });
		productList.forEach((product) => {
			product.images.forEach((element) => {
				AMQPChannel.sendToQueue(
					AMQP_QUEUES.PICTURE_DELETE,
					Buffer.from(JSON.stringify({
						name: element,
					})),
				);
			});
		});
		await ProductModel.findOneAndUpdate({ brandRef: brandId }, brandUpdate, { new: true });

		const followUpdate = await SchemaMapperUtility({
			status: false,
			updatedOn: new Date(),
		});
		await FollowBrandModel.findOneAndUpdate({ brandRef: brandId }, followUpdate, { new: true });
		await ReportModel.deleteMany({ brandRef: brandId });

		// cancel any subscriptions
		const subscriptionDetails = await PaymentModelService
			.PaymentPlanDetailsService({ id: brandId });
		if (subscriptionDetails.data.status !== SUBSRIPTION_STATUS.CANCELLED) {
			await StripeService.TerminateSubscription({
				subscriptionId: subscriptionDetails.data.details.id,
			});
		}

		return resolve(ResponseUtility.SUCCESS({ message: 'Success in deletion of Brand' }));
	} catch (err) {
		return reject(ResponseUtility.GENERIC_ERR({ message: err, error: err }));
	}
});
