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
 * Parse plugins into a list.
 *
 * @param {string} plugin
 * @param {Array.<string>} cache
 * @return {Array.<string>}
 */
function plugins(plugin, cache) {
    return cache.concat(plugin.split(SPLITTER));
}

/**
 * Help.
 */
function help() {
    console.log('  # Note that bash does not allow reading and writing');
    console.log('  # to the same file through pipes');
    console.log();
    console.log('  Usage:');
    console.log();
    console.log('  # Pass `Readme.md` through mdast');
    console.log('  $ ' + COMMAND + ' Readme.md -o Readme.md');
    console.log();
    console.log('  # Pass stdin through mdast, with settings, to stdout');
    console.log('  $ cat Readme.md | ' + COMMAND + ' --setting ' +
        '"setext, bullet: *" > Readme-new.md');
    console.log();
    console.log('  # use a plugin');
    console.log('  $ npm install mdast-toc');
    console.log('  $ ' + COMMAND + ' --use mdast-toc -o Readme.md');
    console.log();
}

/**
 * Settings.
 */
function settings() {
    console.log();
    console.log('  # Settings');
    console.log();
    console.log('  Both camel- and dash-cased settings are allowed.');
    console.log();
    console.log('  ## [Parse](https://github.com/wooorm/mdast#' +
        'mdastparsevalue-options)');
    console.log();
    console.log('  -  `gfm` (boolean, default: true)');
    console.log('  -  `yaml` (boolean, default: true)');
    console.log('  -  `pedantic` (boolean, default: false)');
    console.log('  -  `commonmark` (boolean, default: false)');
    console.log('  -  `breaks` (boolean, default: false)');
    console.log('  -  `footnotes` (boolean, default: false)');
    console.log();
    console.log('  ## [Stringify](https://github.com/wooorm/mdast#' +
        'mdaststringifyast-options)');
    console.log();
    console.log('  -  `setext` (boolean, default: false)');
    console.log('  -  `close-atx` (boolean, default: false)');
    console.log('  -  `loose-table` (boolean, default: false)');
    console.log('  -  `spaced-table` (boolean, default: true)');
    console.log('  -  `reference-links` (boolean, default: false)');
    console.log('  -  `fences` (boolean, default: false)');
    console.log('  -  `bullet` ("-", "*", or "+", default: "-")');
    console.log('  -  `rule` ("-", "*", or "_", default: "*")');
    console.log('  -  `rule-repetition` (number, default: 3)');
    console.log('  -  `rule-spaces` (boolean, default: false)');
    console.log('  -  `strong` ("_", or "*", default: "*")');
    console.log('  -  `emphasis` ("_", or "*", default: "_")');
    console.log();
    console.log('  Settings are specified as follows:');
    console.log();
    console.log('    $ ' + COMMAND + ' --setting "name:value"');
    console.log();
    console.log('  Multiple settings:');
    console.log();
    console.log('    $ ' + COMMAND + ' --setting "emphasis:*,strong:_"');
    console.log();
}

/*
 * Module.
 */

var program = new Command(pack.name)
    .version(pack.version)
    .description(pack.description)
    .usage('[options] file')
    .option('-o, --output <path>', 'specify output location', null)
    .option('-c, --config <path>', 'specify configuration location', null)
    .option('-s, --setting <settings>', 'specify settings', options, {})
    .option('-u, --use <plugins>', 'use transform plugin(s)', plugins, [])
    .option('-a, --ast', 'output AST information', false)
    .option('--no-rc', 'Disable configuration from .mdastrc', false)
    .option('--settings', 'output available settings', false);

/*
 * Listen.
 */

program.on('--help', help);
program.on('--settings', settings);

/*
 * Expose.
 */

module.exports = program;
