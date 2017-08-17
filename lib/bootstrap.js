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

global.df = {};

function strap() {
	global.df.isLoaded = false;

	// load the discordforge binary
	fs.readFile(path.join(os.homedir(), '.discordforge/modloader/modloader.js'), 'utf-8', (err, data) => {
		// if there was an error, just print and don't crash the client.
		if (err) {
			console.error('%c[DiscordForge Bootstrap] ' + '%cWill not load due to a bootstrapping error. The stacktrace is shown below.', 'color:#4286f4', 'color:auto');
			console.error(err);
		} else {
			//otherwise, execute the modloader
			console.log('%c[DiscordForge Bootstrap] ' + '%cExecuting DiscordForge...', 'color:#4286f4', 'color:auto');
			eval(data);
			global.df.isLoaded = true;
		}
	});
}

module.exports = strap;
