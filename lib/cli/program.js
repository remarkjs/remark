'use strict';

/*
 * Dependencies.
 */

var commander = require('commander');
var camelcase = require('camelcase');
var debug = require('debug');
var pack = require('../../package.json');

/*
 * Methods.
 */

var Command = commander.Command;

/*
 * Constants.
 */

var SPLITTER = / *[,;] */g;
var DELIMITER = / *: */;

/*
 * Set-up.
 */

var COMMAND = Object.keys(pack.bin)[0];

debug = debug('mdast:cli-program');

/**
 * Parse settings into an object.
 *
 * @param {string} flags
 * @param {Object} cache
 * @return {Object}
 */
function options(flags, cache) {
    flags.split(SPLITTER).forEach(function (setting) {
        var parts = setting.split(DELIMITER);
        var value = parts.slice(1).join(':');

        if (value === 'true' || value === '') {
            value = true;
        } else if (value === 'false') {
            value = false;
        } else if (!isNaN(value)) {
            value = Number(value);
        }

        cache[camelcase(parts[0])] = value;
    });

    return cache;
}

/**
 * Parse a plugin into its name and options.
 *
 * @param {string} plugin
 */
function parsePlugin(plugin) {
    var index = plugin.indexOf('=');
    var name;
    var value;

    if (index === -1) {
        name = plugin;
        value = null;
    } else {
        name = plugin.slice(0, index);
        value = options(plugin.slice(index + 1), {});
    }

    return {
        'name': name,
        'value': value
    };
}

/**
 * Parse plugins into a list.
 *
 * @param {string} plugin
 * @param {Object} cache
 */
function plugins(plugin, cache) {
    plugin = parsePlugin(plugin);

    cache[plugin.name] = plugin.value;

    return cache;
}

/**
 * Parse extensions into a list.
 *
 * @param {string} extension
 * @param {Array.<string>} cache
 * @return {Array.<string>}
 */
function extensions(extension, cache) {
    return cache.concat(extension.split(SPLITTER));
}

/**
 * Help.
 */
function help() {
    console.log('  Usage:');
    console.log();
    console.log('  # Pass `Readme.md` through mdast');
    console.log('  $ ' + COMMAND + ' Readme.md -o Readme-new.md');
    console.log();
    console.log('  # Pass stdin through mdast, with settings, to stdout');
    console.log('  $ cat Readme.md | ' + COMMAND + ' -s "setext, bullet: *"' +
        ' > Readme-new.md');
    console.log();
    console.log('  # Use a plugin (with options)');
    console.log('  $ npm install mdast-toc');
    console.log('  $ ' + COMMAND + ' --use toc=heading:contents Readme.md ' +
        '-o');
    console.log();
    console.log('  # Rewrite markdown in a directory');
    console.log('  $ ' + COMMAND + ' . -o');
    console.log();
    console.log('  See also:');
    console.log();
    console.log('  man 1 mdast, man 3 mdast, man 5 mdastrc, ' +
        'man 5 mdastignore, man 7 mdastconfig');
    console.log();
}

/*
 * Module.
 */

var program = new Command(pack.name)
    .version(pack.version)
    .description(pack.description)
    .usage('[options] file|dir ...')
    .option('-o, --output [path]', 'specify output location')
    .option('-c, --config-path <path>', 'specify configuration location')
    .option('-i, --ignore-path <path>', 'specify ignore location')
    .option('-s, --setting <settings>', 'specify settings', options, {})
    .option('-u, --use <plugins>', 'use transform plugin(s)', plugins, {})
    .option('-e, --ext <extensions>', 'specify extensions', extensions, [])
    .option('-a, --ast', 'output AST information', false)
    .option('-q, --quiet', 'output less messages', false)
    .option('--no-color', 'disable color in output', false)
    .option('--no-rc', 'disable configuration from .mdastrc', false)
    .option('--no-ignore', 'disable ignore from .mdastignore', false);

/*
 * Listen.
 */

program.on('--help', help);

/*
 * Expose.
 */

module.exports = program;
