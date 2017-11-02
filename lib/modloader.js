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
const YAML = require('yamljs').parse;

const pluginsDir = path.join(os.homedir(), '.discordforge/plugins');

global.df.plugins = [];

const log = function(str) {
    console.log('%c[DiscordForge] ' + '%c' + str, 'color:#4286f4', 'color:auto');
}

const loadPlugins = function() {
	fs.readdirSync(pluginsDir).forEach(pluginFolder => {
		log('Load: ' + pluginFolder);
		let plugin = path.join(pluginsDir, pluginFolder);
		try {
			let manifestFile = false;
			fs.readdirSync(plugin).forEach(file => {
				if (file == 'manifest.yml') manifestFile = true;
			});
			if (manifestFile == false) {
				throw new Error('No manifest file.');
			}
			let manifest = YAML(fs.readFileSync(path.join(plugin, 'manifest.yml'), 'utf8'));
			if (manifest.plugin === undefined || manifest.plugin.name === undefined || manifest.plugin.version === undefined || manifest.plugin.main === undefined) {
				throw new Error('Invalid manifest file.');
			}
			require(path.join(plugin, manifest.plugin.main));
			global.df.plugins.push(manifest.plugin.name + '@' + manifest.plugin.version);
		} catch (e) {
			console.error('%c[DiscordForge] ' + '%c' + pluginFolder + ' is not a valid plugin.', 'color:#4286f4', 'color:auto');
			console.error(e);
		}
	});
}

global.df.reloadPlugins = function() {
	// TODO: Unload and load plugins.
	log('Reloading plugins...');
	loadPlugins();
}

// notify (in devtools) that we've loaded in
log('Loaded in!');

// and now to load plugins
log('Loading plugins...');
loadPlugins();