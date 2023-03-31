/* eslint-disable import/no-dynamic-require */
/* eslint-disable global-require */
/* eslint-disable array-callback-return */
/**
* This is the indexer for Bookmark requests
* @author Nikhil Negi
* @since 21-10-2021
*/
import fs from 'fs';

const skip = ['index.js'];
const files = fs.readdirSync(__dirname);

files.map((file) => {
	const found = skip.find(skipThisFile => skipThisFile === file);
	if (!found) {
		const fileName = `${file.charAt(0).toUpperCase()}${file.split('.')[0].substring(1, file.length)}`;
		if (!fileName.startsWith('.')) {
			module.exports[`Bookmark${fileName}Service`] = require(`./${file}`).default;
		}
	}
});
