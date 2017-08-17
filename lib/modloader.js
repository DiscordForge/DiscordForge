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
