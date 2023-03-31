/**
* This multipart service will merge the passed images in the body with the same
* name, add all fileds from req.body.data to req.body and will add AMQPConnection
* & AMQPChannel to req.body
* @author Jagmohan Singh
* @since 2 May, 2020
*/

export default (req, res, next) => {
	const {
		files, body: {
			data, id, AMQPConnection, AMQPChannel,
		},
	} = req;
	req.body = data ? (
		{ ...JSON.parse(data), AMQPConnection, AMQPChannel }) : { AMQPConnection, AMQPChannel };
	if (id) {
		req.body.id = id;
	}

	if (req.body.postType == 5 || req.body.postType == 6) {
		Object.assign(req.body, { ...files });
	}
	else if(req.body.postType == 2){
		Object.assign(req.body, { ...files });
	}
	else {
		req.body.images = files;
	}
	return next();
};
