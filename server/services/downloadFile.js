import fs from 'fs';
import request from 'request-promise-native';

/**
* This Service is for downloading any file from a
* given url to a local given path on system
* @author Santgurlal Singh
* @since 8 May, 2020
* @param url the url of a downloadable file
* @param path the valid directory path on system
*/

export default (url, path) => new Promise((resolve, reject) => {
	const file = fs.createWriteStream(path);	// path must represent the filename with extension
	const options = { uri: url, gzip: true };
	request.get(options)
		.pipe(file)
		.on('finish', () => resolve())
		.on('error', (err) => {
			console.log('Error while downloding file', err);
			return reject(err);
		});
});
