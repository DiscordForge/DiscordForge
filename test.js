/**
* DiscordForge - a plugin system for Discord.
* Copyright (C) 2017 DiscordForge Development
* 
* This program is free software: you can redistribute it and/or modify
* it under the terms of the GNU General Public License as published by
* the Free Software Foundation, either version 3 of the License, or
* (at your option) any later version.
* 
* This program is distributed in the hope that it will be useful,
* but WITHOUT ANY WARRANTY; without even the implied warranty of
* MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
* GNU General Public License for more details.
* 
* You should have received a copy of the GNU General Public License
* along with this program.  If not, see <http://www.gnu.org/licenses/>.
*/

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