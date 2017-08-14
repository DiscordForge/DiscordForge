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

const assert = require('assert');
const fs = require('fs');
const {fork} = require('child_process');
const os = require('os');
const path = require('path');
const dforgeDir = path.join(os.homedir(), '.discordforge');
const checksum = require('checksum');
describe('Files', () => {
	it('should have bootstrap.js', () => {
		if (fs.existsSync(path.join('./lib', 'bootstrap.js')) === false)
			throw new Error('File missing.');
	});
	it('should have index.js', () => {
		if (fs.existsSync('index.js') === false)
			throw new Error('File missing.');
	});
	it('should have modloader.js', () => {
		if (fs.existsSync(path.join('./lib', 'modloader.js')) === false)
			throw new Error('File missing.');
	});
	it('should have setup.js', () => {
		if (fs.existsSync('setup.js') === false)
			throw new Error('File missing.');
	});
	it('should have LICENSE', () => {
		if (fs.existsSync('LICENSE') === false) // check for license in root directory, not src.
			throw new Error('File missing.');
	});
});
describe('Setup', () => {
	let sumCurrent, sumCopy;
	before(function(done) { // needs to be function() to use this.timeout
		this.timeout(60000);
		console.log('\n    This test requires the setup script to be executed first, and file hashes to be computed. We will now install DiscordForge as if the end user is installing it.');
		console.log('\n    [Timeout Interval: 1 minute]');
		console.log('\n');
		let setup = fork('setup.js', [], { silent: true });
		setup.stdout.on('data', (data) => {
			process.stdout.write('    ' + data.toString());
		});
		setup.on('exit', (code) => {
			if (code !== 0)
				throw new Error(`Setup exited with code ${code}`);
			console.log('\n    Done installing. Now creating hashes.');
			checksum.file(path.join(dforgeDir, 'modloader', 'modloader.js'), (err, sum) => {
				sumCopy = sum;
			});
			checksum.file(path.join('./lib', 'modloader.js'), (err, sum) => {
				sumCurrent = sum;
			});
			console.log('\n    Created hashes. Testing may now continue.');
			console.log('\n');
			done();
		});
	});
	it('should have made a directory in the home directory', () => {
		if (fs.existsSync(dforgeDir) === false)
			throw new Error('Directory missing.');
	});
	it('should have made a plugins directory', () => {
		if (fs.existsSync(path.join(dforgeDir, 'plugins')) === false)
			throw new Error('Directory missing.');
	});
	it('should have made a modloader directory', () => {
		if (fs.existsSync(path.join(dforgeDir, 'modloader')) === false)
			throw new Error('Directory missing.');
	});
	it('should have made a modloader.js', () => {
		if (fs.existsSync(path.join(dforgeDir, 'modloader', 'modloader.js')) === false)
			throw new Error('File missing.');
	});
	it('should have made an exact copy of the modloader', () => {
		assert.equal(sumCurrent, sumCopy);
	});
});
