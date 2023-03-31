import {
    ResponseUtility,
} from 'appknit-backend-bundle';
import { Types } from 'mongoose';
import {
    ProductModel,
} from '../../schemas';
import { BOOKMARK_TYPE } from '../../constants';

export default ({
    id,
}) => new Promise(async (resolve, reject) => {
    try {
        const data = await ProductModel.aggregate([
            {
                $match: {
                    deleted: false,
                    blocked: false,
                    isHidden: { $ne: true } 
                },
            },
            {
                $lookup: {
                    from: 'brands',
                    let: {
                        brandRef: '$brandRef',
                    },
                    pipeline: [
                        {
                            $match: {
                                $expr: {
                                    $and: [{
                                        $eq: [
                                            '$_id',
                                            '$$brandRef',
                                        ],
                                    }, {
                                        $eq: [
                                            '$deleted',
                                            false,
                                        ],
                                    }, {
                                        $eq: [
                                            '$isVerifiedByAdmin',
                                            true,
                                        ],
                                    }, {
                                        $eq: [
                                            '$blocked',
                                            false,
                                        ],
                                    }],
                                },
                            },
                        },
                    ],
                    as: 'brands',
                },
            }, {
                $unwind: {
                    path: '$brands',
                },
            },
            {
                $lookup: {
                    from: 'bookmarks',
                    let: { ref: '$_id' },
                    pipeline: [
                        {
                            $match: {
                                $expr: {
                                    $and: [
                                        { $eq: ['$ref', '$$ref'] },
                                        { $eq: ['$status', true] },
                                        { $eq: ['$userRef', Types.ObjectId(id)] },
                                        { $eq: ['$refType', BOOKMARK_TYPE.PRODUCT] },
                                    ],
                                },
                            },
                        },
                    ],
                    as: 'bookmarks',
                },
            },
            {
                $unwind: {
                    path: '$bookmarks',
                    preserveNullAndEmptyArrays: true,
                },
            },
            {
                $project: {
                    name: '$name',
                    brandName: '$brands.companyName',
                    images: '$images',
                    priceDecimal: { $convert: { input: '$price', to: 'double', onError: 'Error', onNull: 'Error' } },
                    currency: '$currency',
                    price: '$price',
                    gender: '$gender',
                    category: '$category',
                    subCategory: { $ifNull: ['$subCategory', '$$REMOVE'] },
                    createdOn: '$createdOn',
                    isBookmark: { $cond: ['$bookmarks._id', true, false] },
                    topDate: '$topDate',
                    sortingDate: { $cond:[{ $gt: ['$topDate', '$createdOn'] }, '$topDate', '$createdOn' ]}
                }
            },
            {
                $sort: {
                    'sortingDate': -1,
                },
            },
            {
                $group: {
                    _id: '$category',
                    products: {
                        $push: '$$ROOT',
                    },
                },
            },
            {
                $project: {
                    products: {
                        $slice: [
                            '$products',
                            20
                        ],
                    },
                },
            },
        ]);
        return resolve(ResponseUtility.SUCCESS({ data }));
    } catch (err) {
        return reject(ResponseUtility.GENERIC_ERR({ message: err.message, error: err }));
    }
});