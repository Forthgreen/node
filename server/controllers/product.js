/**
* @description
* This is the constroller for the products
* @author Jagmohan Singh
* @since 2 May, 2020
*/
import { ProductModel } from '../model';
import { ModelResolver } from './resolvers';

export default {
	add: (req, res) => ModelResolver(req, res, ProductModel.ProductAddService),
	list: (req, res) => ModelResolver(req, res, ProductModel.ProductListService),
	delete: (req, res) => ModelResolver(req, res, ProductModel.ProductDeleteService),
	edit: (req, res) => ModelResolver(req, res, ProductModel.ProductEditService),
	uploadCsv: (req, res) => ModelResolver(req, res, ProductModel.ProductUploadCsvService),
	details: (req, res) => ModelResolver(req, res, ProductModel.ProductDetailsService),
	detailsGuest: (req, res) => ModelResolver(req, res, ProductModel.ProductDetailsGuestService),
	listAll: (req, res) => ModelResolver(req, res, ProductModel.ProductListAllService),
	home: (req, res) => ModelResolver(req, res, ProductModel.ProductHomeService),
	shopfeed: (req, res) => ModelResolver(req, res, ProductModel.ProductShopfeedService),
	productcache: (req, res) => ModelResolver(req, res, ProductModel.ProductCacheService),
	status: (req, res) => ModelResolver(req, res, ProductModel.ProductStatusService),
	addToTop: (req, res) => ModelResolver(req, res, ProductModel.ProductAddToTopService),

};
