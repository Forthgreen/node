import {
    ResponseUtility,
} from 'appknit-backend-bundle';
import {
    ProductModel,
} from '../../schemas';
export default ({
    id,
    isHidden,
    productRef
}) => new Promise(async (resolve, reject) => {
    try {
        const productInfo = await ProductModel.findOne({
            _id: productRef,
            deleted: false,
        });
        if (!productInfo) {
            return reject(ResponseUtility.GENERIC_ERR({ message: 'No product found.' }));
        }

        if (isHidden == true) {
            const hiddenProduct = await ProductModel.findOneAndUpdate({
                userRef: id,
                _id: productRef,
            },
                {
                    isHidden: true,
                }, { new: true }

            )

            return resolve(ResponseUtility.SUCCESS({ message: 'Product Hidden Successfully!', data: hiddenProduct }));
        }
        else if (isHidden !== true) {
            const unHiddenProduct = await ProductModel.findOneAndUpdate({
                userRef: id,
                _id: productRef,
            },
                {
                    isHidden: false,
                }, { new: true }

            )

            return resolve(ResponseUtility.SUCCESS({ message: 'Product Unhidden Successfully!', data: unHiddenProduct }));
        }
    } catch (err) {
        return reject(ResponseUtility.GENERIC_ERR({ message: err.message, error: err }));
    }
});