import {
    ResponseUtility,
    SchemaMapperUtility,
} from 'appknit-backend-bundle';
import {
    ProductModel,
} from '../../schemas';
export default ({
    id,
    productId,
}) => new Promise(async (resolve, reject) => {
    const dateNow = new Date();
    try {
        if (!productId) {
            return reject(ResponseUtility.GENERIC_ERR({ message: 'Product id is required' }));
        }
            const topProduct = await ProductModel.findOneAndUpdate({
                brandRef: id,
                _id: productId,
            },
                {
                    topDate: dateNow,
                }, { new: true }

            )
            return resolve(ResponseUtility.SUCCESS({ message: 'The product has been moved to the top'}));
    } catch (err) {
        return reject(ResponseUtility.GENERIC_ERR({ message: err.message, error: err }));
    }
});