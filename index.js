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

// parse commands
var command, argv = null;
try {
    var {command, argv} = require('command-line-commands')([null, 'help', 'inject', 'uninject', 'plugin', 'repo', 'update']);
} catch (err) {
    console.log('error: unknown command - try \'discordforge help\'');
    return;
}
// require deps
const options = require('minimist')(argv);
const usage = require('command-line-usage');
const ps = require('ps-node');
const asar = require('asar');

// help page
const help = [
    {
        header: 'DiscordForge',
        content: 'A toolkit that allows you to create and install your own plugins into the Discord client.'
    },
    {
        header: 'Synopsis',
        content: [
            '$ discordforge [[bold]{command}] [...]'
        ]
    },
    {
        header: 'Commands',
        content: [
            {
                name: 'help',
                summary: 'Display help information about DiscordForge.'
            },
            {
                name: 'inject',
                summary: 'Injects DiscordForge into the running Discord process\'s app.asar.'
            },
            {
                name: 'uninject',
                summary: 'Reverses the operation of inject.'
            },
            {
                name: 'plugin [[bold]{command}] ...',
                summary: 'Plugin management.'
            },
            {
                name: 'repo [[bold]{command}] ...',
                summary: 'Repository management.'
            },
            {
                name: 'update',
                summary: 'Updates DiscordForge.'
            },
        ]
    },
    {
        header: 'Plugin Management',
        content: [
            {
                name: 'These commands allow you to manage plugins.\n'
            },
            {
                name: 'plugin install [[bold]{name}]',
                summary: 'Installs a plugin.'
            },
            {
                name: 'plugin uninstall [[bold]{name}]',
                summary: 'Uninstalls a plugin.'
            },
            {
                name: 'plugin list',
                summary: 'Lists all installed plugins.'
            }
        ]
    },
    {
        header: 'Repository Management',
        content: [
            {
                name: 'These commands allow you to manage repositories.\n'
            },
            {
                name: 'repo add [[bold]{name}]',
                summary: 'Adds a repository to search plugins for.'
            },
            {
                name: 'repo remove [[bold]{name}]',
                summary: 'Removes a repository.'
            },
            {
                name: 'repo list',
                summary: 'Lists all repositories.'
            }
        ]
    }
];
var _ = options._;

// no args specified or command "help"
if (command == null || command == 'help') {
    console.log(usage(help));
} else if (command == 'inject') {
    // find discord application path

    asar.extractAll(/*archive path*/ /*temp path*/);

}