/* eslint-disable no-restricted-syntax */
/* eslint-disable indent */
import { ResponseUtility } from "appknit-backend-bundle";
import { Types } from "mongoose";
import { ProductCacheModel, ProductModel } from "../../schemas";
import {
  SORT_PRODUCT,
  GENDER_FOR_PRODUCT,
  PRODUCT_CATEGORIES,
  CLOTHING_GENDER_BOTH,
  BOOKMARK_TYPE,
  HOST,
  AMQP_QUEUES,
  S3_IMAGES,
  NODE_ENV,
} from "../../constants";

var mongoose = require("mongoose");
/**
 * @description A service model function to handle the
 *  list of products.
 * @author Jagmohan Singh
 * @param {Array} category categories of products.
 * @since 13 May 2020
 */

export default ({
  id,
  limit = 7,
  page = 1,
  text = "",
  category,
  sort = SORT_PRODUCT.NEW_TO_OLD,
  gender,
  filter = [],
  AMQPChannel,
}) =>
  new Promise(async (resolve, reject) => {
    try {
      const dateNow = new Date().getTime();

      const delete_cachedata = await ProductCacheModel.deleteMany();

      if (delete_cachedata["acknowledged"] == true) {
        const product_query = [
          {
            $match: {
              deleted: false,
              isHidden: { $ne: true },
            },
          },
          {
            $project: {
              _id: "$_id",
            },
          },
        ];

        const product_data = await ProductModel.aggregate(product_query);

        for (let i = 0; i < product_data.length; i++) {
          try {
            const projectcacheObject = new ProductCacheModel({
              productRef: product_data[i]["_id"],
              position: Math.floor(Math.random() * 999),
              createdOn: dateNow,
              updatedOn: dateNow,
            });
            projectcacheObject.save();
          } catch (e) {
            console.log("Error " + product_data[i]["_id"]);
          }
        }
      } else {
        console.log("Errors ");
      }

      const data = [];

      return resolve(ResponseUtility.SUCCESS({ data, limit, page }));
    } catch (err) {
      return reject(
        ResponseUtility.GENERIC_ERR({ message: err.message, error: err })
      );
    }
  });
