#!/usr/bin/env node

/**
* Copyright 2017 DiscordForge Development
*
* Licensed under the Apache License, Version 2.0 (the "License");
* you may not use this file except in compliance with the License.
* You may obtain a copy of the License at
*
*    http://www.apache.org/licenses/LICENSE-2.0
*
* Unless required by applicable law or agreed to in writing, software
* distributed under the License is distributed on an "AS IS" BASIS,
* WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
* See the License for the specific language governing permissions and
* limitations under the License.
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
			if (fs.existsSync(dforgeDir)) rmdir(dforgeDir);
			fs.mkdir(dforgeDir, e => {
				if (e) throw e;
				fs.mkdir(path.join(dforgeDir, 'plugins'), e1 => {
					if (e1) throw e1;
					fs.mkdir(path.join(dforgeDir, 'modloader'), e2 => {
						if (e2) throw e2;
						fs.writeFileSync(path.join(dforgeDir, 'modloader', 'modloader.js'), fs.readFileSync(path.join('./lib', 'modloader.js')));
					});
				});
			});
			console.log('Installed DiscordForge.');
		});
	});
}
