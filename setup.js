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
const deleteFolderRecursive = (path) => {
  if( fs.existsSync(path) ) {
    fs.readdirSync(path).forEach(function(file,index){
      var curPath = path + "/" + file;
      if(fs.lstatSync(curPath).isDirectory()) {
        deleteFolderRecursive(curPath);
      } else {
        fs.unlinkSync(curPath);
      }
    });
    fs.rmdirSync(path);
  }
};
if (process.argv[2] === "-u") {
	let uninst = spawn('npm', ['rm', '-g', 'discordforge']);
	uninst.on('close', () => {
		deleteFolderRecursive(dforgeDir);
		console.log('Uninstalled DiscordForge.');
	});
}
console.log('Installing...');
let inst = spawn('npm', ['install', '--only=prod'], { shell: true });
inst.on('close', () => {
	let bind = spawn('npm', ['link'], { shell: true });
	bind.on('close', () => {
		fs.mkdirSync(dforgeDir);
		fs.mkdirSync(path.join(dforgeDir, 'plugins'));
		fs.mkdirSync(path.join(dforgeDir, 'modloader'));
		fs.writeFileSync(path.join(dforgeDir, 'modloader', 'modloader.js'), fs.readFileSync('modloader.js'));
		console.log('Installed DiscordForge.');
	});
});