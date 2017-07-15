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

//deps
const fs = require('fs');
const path = require('path');

// load the discordforge binary
fs.readFile(path.join((process.platform === 'win32') ? process.env.HOMEPATH : process.env.HOME, '.discordforge/modloader/modloader.js'), 'utf-8', (err, data) => {
    // if there was an error, just print and don't crash the client.
    if (err) {
        console.error('%c[DiscordForge Bootstrap] ' + '%cWill not load due to a bootstrapping error. The stacktrace is shown below.', 'color:#4286f4', 'color:auto');
        console.error(err);
    } else {
        //otherwise, execute the modloader
        console.error('%c[DiscordForge Bootstrap] ' + '%cExecuting DiscordForge...', 'color:#4286f4', 'color:auto');
        eval(data);
    }
});