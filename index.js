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

// DiscordForge details
const VERSION = require('./package.json').version || "unknown";
process.title = `DiscordForge ${VERSION}`;

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
const readline = require('readline');
const usage = require('command-line-usage');
const ps = require('ps-node');
const asar = require('asar');
const path = require('path');
const fs = require('fs');
const os = require('os');
const {spawn} = require('child_process');
const https = require('https');
const ora = require('ora');

// constant variables
const dforgeDir = path.join(os.homedir(), '.discordforge');
const temp = path.join(dforgeDir, '_temp');
const toSplice1 = 'mainWindow.webContents.on(\'dom-ready\', function () {});';
const splice1 = 'mainWindow.webContents.on(\'dom-ready\', function () {mainWindow.webContents.executeJavaScript(\'require(require(\\\'path\\\').join(\\\'../../app.asar\\\', \\\'discordforge\\\'))();\');});'; 
const configPath = path.join(__dirname, 'config.json');
const gSpin = ora({
	color: 'cyan',
	stream: process.stdout,
	spinner: {
		"interval": 80,
		"frames": [
			"[    ]",
			"[   =]",
			"[  ==]",
			"[ ===]",
			"[====]",
			"[=== ]",
			"[==  ]",
			"[=   ]"
		]
	}
});
const boilerplate = {
	metadata: {
		"name": "ExamplePlugin",
		"version": "1.0.0",
		"description": "An example plugin boilerplate to help the developer get started with making their own plugin."
	},
	script: 
	"let plugin = {\n" +
    "	init: function() {\n" +
	"		console.log('Example plugin loaded!');\n" +
    "	}\n" +
	"}\n" +
	"module.exports = plugin;"
}

// recursive deletion for directory.
const rmdir = function(dir, cb) {
	var list = fs.readdirSync(dir);
	for(var i = 0; i < list.length; i++) {
		var filename = path.join(dir, list[i]);
		var stat = fs.statSync(filename);
		
		if(filename == "." || filename == "..") {
			// pass these files
		} else if(stat.isDirectory()) {
			// rmdir recursively
			rmdir(filename, () => {});
		} else {
			// rm fiilename
			fs.unlinkSync(filename);
		}
	}
	fs.rmdirSync(dir);
	cb();
};

// help page
const help = [
    {
        header: `DiscordForge ${VERSION}`,
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
var defaultConfig = {
		repositories: [
			"DiscordForge/Plugins"
		]
};
var config = {};
var _ = options._;

// config
if (!fs.existsSync(configPath)) {
	fs.writeFileSync(configPath, JSON.stringify(defaultConfig, null, 2), 'utf8');
	config = defaultConfig;
} else {
	config = JSON.parse(fs.readFileSync(configPath, 'utf8'));
}


// no args specified or command "help"
if (command == null || command == 'help') {
    console.log(usage(help));
} else if (command == 'inject') {
    // find discord application path
    var discordPath = null;
	var discordBin = null;
	var discordPids;
    ps.lookup({}, (err, res) => {
        if (err) throw err;
        else {
            var raw = res.filter(proc => proc.command.includes('Discord'));
            var procs = {};
            raw.forEach(proc => {
                if (!procs[proc.command])
                    procs[proc.command] = {command: proc.command, pid: []};

                procs[proc.command].pid.push(proc.pid);
            });

            if (Object.keys(procs).length == 0) {
                console.log('No processes were found.');
                return;
            } else if (Object.keys(procs).length == 1) {
				let proc = procs[Object.keys(procs)[0]];
                discordPath = proc.command.substr(0, proc.command.lastIndexOf('\\'));
				discordBin = proc.command;
				discordPids = proc.pid;
            } else {
                let k = Object.keys(procs);
                for (let i = 0; i < k.length; i++) {
                    console.log(`${i}: ${k[i]} [${procs[k[i]].pid.join(', ')}]`);
                }
                console.log('Please select your process from above.');
				var rl = readline.createInterface({
					input: process.stdin,
					output: process.stdout
				});
				rl.question('> ', answer => {
					if (typeof parseInt(answer) === 'number') {
						let proc = procs[Object.keys(procs)[answer]];
						discordPath = proc.command.substr(0, proc.command.lastIndexOf('\\'));
						discordBin = proc.command;
						discordPids = proc.pid;
					} else {
						console.log('You didn\'t input a number. Re-run the command and try again.');
					}
					rl.close();
				});
            }
        }
		var spinner = gSpin;
		console.log(`Process found. Using path '${discordPath}'`);
		spinner.start('Extracting...');
		fs.mkdirSync(temp);
		asar.extractAll(path.join(discordPath, 'resources', 'app.asar'), temp);
		if (fs.existsSync(path.join(temp, 'index.js.bak')) != false) {
			spinner.fail('DiscordForge is already injected.');
			rmdir(temp, () => {});
		} else {
			spinner.text = "Splicing...";
			fs.readFile(path.join(temp, 'index.js'), 'utf8', (e, d) => {
				if (e) throw e;
				var inject = d.replace(toSplice1, splice1);
				fs.writeFileSync(path.join(temp, 'index.js.bak'), fs.readFileSync(path.join(temp, 'index.js')));
				fs.writeFile(path.join(temp, 'index.js'), inject, (e1) => {
					if (e1) throw e1;
					fs.writeFileSync(path.join(temp, 'discordforge.js'), fs.readFileSync(path.join(__dirname, 'lib', 'bootstrap.js')));
					spinner.text = 'Archiving...';
					discordPids.forEach(o => {
						try {
							process.kill(o);
						} catch (e) {
								// ESRCH => killed the main process first, meaning the other processes died. doesn't matter.
						}
					});
					asar.createPackage(temp, path.join(discordPath, 'resources', 'app.asar'), () => {
						spinner.text = 'Cleaning up...';
						rmdir(temp, () => {
							spinner.text = 'Starting Discord...';
							spawn(discordBin, {
								detached: true
							}).unref();
							spinner.succeed('Injected.');
							process.exit(0);
						});
					});
				});
			});
		}
    });
} else if (command == 'uninject') {
    // find discord application path
    var discordPath = null;
	var discordBin = null;
	var discordPids;
    ps.lookup({}, (err, res) => {
        if (err) throw err;
        else {
            var raw = res.filter(proc => proc.command.includes('Discord'));
            var procs = {};
            raw.forEach(proc => {
                if (!procs[proc.command])
                    procs[proc.command] = {command: proc.command, pid: []};

                procs[proc.command].pid.push(proc.pid);
            });

            if (Object.keys(procs).length == 0) {
                console.log('No processes were found.');
                return;
            } else if (Object.keys(procs).length == 1) {
				let proc = procs[Object.keys(procs)[0]];
                discordPath = proc.command.substr(0, proc.command.lastIndexOf('\\'));
				discordBin = proc.command;
				discordPids = proc.pid;
            } else {
                let k = Object.keys(procs);
                for (let i = 0; i < k.length; i++) {
                    console.log(`${i}: ${k[i]} [${procs[k[i]].pid.join(', ')}]`);
                }
                console.log('Please select your process from above.');
				var rl = readline.createInterface({
					input: process.stdin,
					output: process.stdout
				});
				rl.question('> ', answer => {
					if (typeof parseInt(answer) === 'number') {
						let proc = procs[Object.keys(procs)[answer]];
						discordPath = proc.command.substr(0, proc.command.lastIndexOf('\\'));
						discordBin = proc.command;
						discordPids = proc.pid;
					} else {
						console.log('You didn\'t input a number. Re-run the command and try again.');
					}
					rl.close();
				});
            }
        }
		var spinner = gSpin;
		console.log(`Process found. Using path '${discordPath}'`);
		spinner.start('Extracting...');
		fs.mkdirSync(temp);
		asar.extractAll(path.join(discordPath, 'resources', 'app.asar'), temp);
		if (fs.existsSync(path.join(temp, 'index.js.bak')) == false) {
			spinner.fail('Not injected or corrupt. If you injected DiscordForge and you are getting this message, reinstall Discord.');
			rmdir(temp, () => {});
		} else {
			spinner.text = 'Removing modification...';
			fs.writeFile(path.join(temp, 'index.js'), fs.readFileSync(path.join(temp, 'index.js.bak')), (e) => {
				if (e) throw e;
				fs.unlinkSync(path.join(temp, 'index.js.bak'));
				fs.unlinkSync(path.join(temp, 'discordforge.js'));
				spinner.text = 'Archiving...';
				discordPids.forEach(o => {
					try {
						process.kill(o);
					} catch (e) {
							// ESRCH => killed the main process first, meaning the other processes died. doesn't matter.
					}
				});
				asar.createPackage(temp, path.join(discordPath, 'resources', 'app.asar'), () => {
					spinner.text = 'Cleaning up...';
					rmdir(temp, () => {
						spinner.text = 'Starting Discord...';
						spawn(discordBin, {
							detached: true
						}).unref();
						spinner.succeed('Uninjected.');
						process.exit(0);
					});
				});
			});
		}
	});
} else if (command == 'repo') {
	let subcommand = _[0];
	let repoName = _[1];
	if (subcommand == 'list') {
		console.log('Repositories:');
		config.repositories.forEach(r => {
			console.log(r);
		});
	} else if (subcommand == 'add') {
		if (repoName != null) {
			let found = false;
			config.repositories.forEach(r => {
				if (repoName.toLowerCase() == r.toLowerCase()) {
					console.log('This repository has already been added.');
					found = true;
					return;
				}
			});
			if (!found) {
				https.get(`https://raw.githubusercontent.com/${repoName}/master/repository.json`, res => {
					let status = res.statusCode;
					if (status == 404) {
						console.log('Repository either does not exist or doesn\'t have a `repository.json` on the master branch.');
						return;
					} else {
						var repoJson = '';
						res.setEncoding('utf8');
						res.on('data', d => {
							repoJson = JSON.parse(d);
						});
						res.on('end', () => {
							if (repoJson.description == undefined || repoJson.plugins == undefined) {
								console.log('Invalid repository metadata.');
								return;
							}
							console.log(`Adding repository '${repoName}'`);
							console.log(`Description: ${repoJson.description}`);
							config.repositories.push(repoName);
							console.log('Added.');
							fs.writeFileSync(configPath, JSON.stringify(config, null, 2), 'utf8');
						});
					}
				});
			}
		} else {
			console.log('No repository passed.');
		}
	} else if (subcommand == 'remove') {
		if (repoName != null) {
			let found = false;
			config.repositories.forEach(r => {
				if (repoName.toLowerCase() == r.toLowerCase()) {
					found = true;
					return;
				}
			});
			if (found) {
				console.log(`Removing repository '${repoName}'`);
				config.repositories.splice(config.repositories.indexOf(repoName), 1);
				console.log('Removed.');
				fs.writeFileSync(configPath, JSON.stringify(config, null, 2), 'utf8');
			} else {
				console.log('Repository was not added.');
			}
		} else {
			console.log('No repository passed.');
		}
	} else {
		console.log('error: no subcommand - try \'discordforge help\'');
	}
} else if (command == 'plugin') {
	let subcommand = _[0];
	let plugin = _[1];
	if (subcommand == 'init') {
		
		console.log('Creating a base plugin...');
		fs.writeFileSync(path.join(process.cwd(), 'plugin.json'), JSON.stringify(boilerplate.metadata, null, 2));
		fs.writeFileSync(path.join(process.cwd(), 'plugin.js'), boilerplate.script);
		console.log('Done.');
	} else {
		console.log('error: no subcommand - try \'discordforge help\'');
	}
}
