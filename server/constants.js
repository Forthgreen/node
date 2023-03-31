/**
* This is the forthgreen-backend constant file
* @author Jagmohan Singh
* @since {{app_date}}
*/

export const {
	NODE_ENV = 'development',
	S3_BUCKET = '',
	// atlas configurations
	ATLAS_USER,
	HOST,
	ATLAS_PASSWORD,
	ATLAS_CLUSTER,
	CLUSTER1,
	CLUSTER2,
	CLUSTER3,
	SHARD,
	SECRET_STRING,
	PAGINATION_LIMIT = 30,
	// RabbitMQ configuration
	RABBITMQ_HOST,
	RABBITMQ_USER,
	RABBITMQ_PASSWORD,
	RABBITMQ_HEARTBEAT,
	SECRET_KEY,
	STRIPE_SECRET_KEY_TEST,
	STRIPE_SECRET_KEY_LIVE,
	STRIPE_PRODUCT_ID_TEST,
	STRIPE_PRODUCT_ID_LIVE,
	NEW_BUSINESS_ALERT_EMAIL,
	DEFAULT_RESTAURANT_MAX_DISTANCE = 81, // in Kilometers
	PLACE_API_KEY,
} = process.env;

const db = process.env.MONGO_DB || 'forthgreen';

export const STRIPE_SECRET_KEY = (NODE_ENV === 'development') ? STRIPE_SECRET_KEY_TEST : STRIPE_SECRET_KEY_LIVE;

export const STRIPE_PRODUCT_ID = (NODE_ENV === 'development') ? STRIPE_PRODUCT_ID_TEST : STRIPE_PRODUCT_ID_LIVE;

/**
 * @description
 * This is the sample constact specifier for queues
 * The queue names follow follow the "camelcase" naming
 * convention wehere the first letter of the queue will
 * be capital case. The queue channels are defined under server/queues/
 * directory and will be autoloded by directory indexer unless explicitly
 * ignored in skip array in index.js. The sampleQueue.js is a sample
 * channel that is meant to be updated/renamed as per the queue requirements.
 * To know more about the channel convention and design principles
 * @contact sharma02gaurav@gmail.com
 */
export const AMQP_QUEUES = {
	IMAGE_UPLOAD: 'ImageUpload',
	PICTURE_DELETE: 'DeletePicture',
};

// export const mongoConnectionString = `mongodb://${host}:${port}/${db}`;
export const mongoConnectionString = `mongodb+srv://${ATLAS_USER}:${ATLAS_PASSWORD}@${ATLAS_CLUSTER}/${db}?retryWrites=true`;

// this string is unique for each project construction
export const secretString = SECRET_STRING;
export const secretKey = SECRET_KEY;

export const SUCCESS_CODE = 100;

export const MB = 1024 * 1024;

export const VERIFICATION_TYPE = {
	EMAIL_VERIFICATION: 1,
	CHANGE_PASSWORD: 2,
};

export const GENDER = {
	MALE: 1,
	FEMALE: 2,
	OTHER: 3,
};

export const MAX_PRODUCTS_FOR_FREE_USER = 20;

export const SOCIAL_IDENTIFIER = {
	FB: 1,
	GOOGLE: 2,
	APPLE: 3,
};

export const S3_IMAGES = {
	GLOBAL_IMAGES: `${S3_BUCKET}/globalImages`,
	VIDEO: `${S3_BUCKET}/${NODE_ENV}/video`,

};

export const S3_IMAGES_URL = {
	SMALL: `${S3_BUCKET}/${NODE_ENV}/images/small`,
	AVERAGE: `${S3_BUCKET}/${NODE_ENV}/images/average`,
	BEST: `${S3_BUCKET}/${NODE_ENV}/images/best`,
};

export const MAX_IMAGES_FOR_PRODUCT = 4;
export const MAX_IMAGES_FOR_RESTAURANT = 8;
export const MAX_IMAGES_FOR_POST = 10;
export const MAX_VIDEOS_FOR_POST = 1;


export const TOKEN_EXPIRATION_TIME = 604800000;

export const PRODUCT_CATEGORIES = {
	CLOTHING: 1,
	BEAUTY: 2,
	HEALTH: 3,
	FOOD: 4,
	DRINKS: 5,
	MISCELLANEOUS: 6,
	ACCESSORIES: 7,
};

export const REPORT_TYPE = {
	BRAND: 1,
	REVIEW: 2,
	RESTAURANT_REVIEW: 3,
	POST: 4,
	COMMENT: 5,
	USER: 6,
};

export const BRAND_REPORT_TYPE = {
	POSTING_NON_VEGAN: 1,
	SOMEONE_ELSE: 2,
	PROHIBITED_CONTENT: 3,
	OTHERS: 4,
};

export const USER_REPORT_TYPE = {
	POSTING_NON_VEGAN: 1,
	SOMEONE_ELSE: 2,
	PROHIBITED_CONTENT: 3,
	OTHERS: 4,
};

export const SUBSRIPTION_STATUS = {
	ACTIVE: 1,
	REQUESTED_TO_CANCEL: 2,
	CANCELLED: 3,
};

export const AGE_FILTER = {
	AGE_16_24: 1,
	AGE_25_34: 2,
	AGE_35_44: 3,
	AGE_45_54: 4,
	AGE_55_65: 5,
	AGE_66_100: 6,
};

export const TIME_FILTER = {
	TODAY: 1,
	DAYS_7: 2,
	DAYS_15: 3,
	DAYS_30: 4,
	DAYS_60: 5,
};

export const MS_IN_DAY = 86400000;

export const MONTH_NAMES = [
	'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec',
];

export const MONTH_NAMES_FULL = [
	'January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December',
];

export const REVIEW_TYPE = {
	PRODUCT: 1,
	RESTAURANT: 2,
};

export const SIMILAR_LIST_SIZE = 8;

export const LIKES_TYPE = {
	POST: 1,
	COMMENT: 2,
};

export const RANDOM_USER_LENGTH = 3;

export const USERS_AFTER_POSTS = 10;

export const POST_TYPES = {
	IMAGE: 1,
	TEXT: 2,
	IMAGE_WITH_TEXT: 3,
	USER: 4,
	VIDEO: 5,
	VIDEO_WITH_TEXT: 6
};

export const USER_BIO_MAX_CHAR = 150;

export const DELETED_BY = {
	SELF: 1,
	ADMIN: 2,
	AUTHOR: 3,
};

export const NOTIFICATION_REF_TYPE = {
	COMMENT: 1,
	REPLY_COMMENT: 2,
	POST_LIKE: 3,
	COMMENT_LIKE: 4,
	FOLLOWING: 5,
	REPLY_LIKE: 6,
	TAG_COMMENT: 7,
	TAG_POST: 8,
};

export const MAX_NOTIFY_MONTH = 2;

export const LIMIT = {
	COMMENTS: 10,
	REPLIES: 5,
	NOTIFICATION: 50,
	POST: 10,
};
export const SORT_PRODUCT = {
	NEW_TO_OLD: 1,
	PRICE_LOW_TO_HIGH: 2,
	PRICE_HIGH_TO_LOW: 3,
};

export const GENDER_FOR_PRODUCT = {
	NOT_SELECT: 0,
	MALE: 1,
	FEMALE: 2,
	BOTH: 3,
};

export const CLOTHING_GENDER_BOTH = {
	1: [1, 6],
	2: [2, 7],
	3: [3, 8],
	4: [4, 9],
	5: [5, 10],
	6: [1, 6],
	7: [2, 7],
	8: [3, 8],
	9: [4, 9],
	10: [5, 10],
};

export const BOOKMARK_TYPE = {
	PRODUCT: 1,
	BRAND: 2,
	RESTAURANT: 3,
};

export const TAG_TYPE = {
	USERS: 1,
	BRAND: 2,
	RESTAURANTS: 3,
};

export const PRODUCT_STATUS = {
	HIDE: 1,
	UNHIDE: 2,
};