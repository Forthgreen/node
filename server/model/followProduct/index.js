/**
 * This is the indexer for user to follow product requests
 * @author Santgurlal Singh
 * @since 15 Jan, 2021
 */

import fs from 'fs';

const skip = ['index.js'];
const files = fs.readdirSync(__dirname);

files.map((file) => {
	const found = skip.find(skipThisFile => skipThisFile === file);
	if (!found) {
		const fileName = `${file.charAt(0).toUpperCase()}${file.split('.')[0].substring(1, file.length)}`;
		if (!fileName.startsWith('.')) {
			module.exports[`${fileName}`] = require(`./${file}`).default;
		}
	}
});
