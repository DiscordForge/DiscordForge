#!/usr/bin/env node

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

process.title = 'DiscordForge Installer';
const {spawn} = require('child_process');
const fs = require('fs');
const os = require('os');
const path = require('path');
const dforgeDir = path.join(os.homedir(), '.discordforge');
const rmdir = function(dir) {
	var list = fs.readdirSync(dir);
	for(var i = 0; i < list.length; i++) {
		var filename = path.join(dir, list[i]);
		var stat = fs.statSync(filename);
		
		if(filename == "." || filename == "..") {
			// pass these files
		} else if(stat.isDirectory()) {
			// rmdir recursively
			rmdir(filename);
		} else {
			// rm fiilename
			fs.unlinkSync(filename);
		}
	}
	fs.rmdirSync(dir);
};
if (process.argv[2] === "-u") {
	console.log('Uninstalling...');
	let uninst = spawn('npm', ['rm', '-g', 'discordforge'], { shell: true });
	uninst.stdout.on('data', (data) => {
		process.stdout.write(data.toString());
	});
	uninst.on('exit', () => {
		rmdir(dforgeDir);
		console.log('Uninstalled DiscordForge.');
	});
} else {
	console.log('Installing...');
	let inst = spawn('npm', ['install', '--only=prod'], { shell: true });
	inst.stdout.on('data', (data) => {
		process.stdout.write(data.toString());
	});
	inst.on('exit', () => {
		let bind = spawn('npm', ['link'], { shell: true });
		bind.stdout.on('data', (data) => {
			process.stdout.write(data.toString());
		});
		bind.on('exit', () => {
			fs.mkdirSync(dforgeDir);
			fs.mkdirSync(path.join(dforgeDir, 'plugins'));
			fs.mkdirSync(path.join(dforgeDir, 'modloader'));
			fs.writeFileSync(path.join(dforgeDir, 'modloader', 'modloader.js'), fs.readFileSync('modloader.js'));
			console.log('Installed DiscordForge.');
		});
	});
}