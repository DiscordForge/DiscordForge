var assert = require('assert');
var fs = require('fs');
describe('Files', () => {
	it('should have bootstrap.js', () => {
		if (fs.existsSync('bootstrap.js') == false)
			throw new Error('File missing.');
	});
	it('should have index.js', () => {
		if (fs.existsSync('index.js') == false)
			throw new Error('File missing.');
	});
	it('should have modloader.js', () => {
		if (fs.existsSync('modloader.js') == false)
			throw new Error('File missing.');
	});
	it('should have LICENSE', () => {
		if (fs.existsSync('LICENSE') == false)
			throw new Error('File missing.');
	});
});