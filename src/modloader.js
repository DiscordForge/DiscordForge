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

// deps
const fs = require('fs');
const path = require('path');
const os = require('os');

const pluginsDir = path.join(os.homedir(), '.discordforge/plugins');

global.df.plugins = [];

const log = function(str) {
    console.log('%c[DiscordForge] ' + '%c' + str, 'color:#4286f4', 'color:auto');
};

// notify (in devtools) that we've loaded in
log('Loaded in!');
// and now to load plugins
log('Loading plugins...');
fs.readdirSync(pluginsDir).forEach(file => {
    if (file.endsWith('.plugin.js')) {
        log('Load: ' + file);
        try {
			let p = require(path.join(pluginsDir, file));
			p.init();
			global.df.plugins.push(file);
		} catch (e) {
			log(file + ' is not a valid plugin. Skipping.');
		}
    }
});