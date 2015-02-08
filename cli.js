#!/usr/bin/env node
'use strict';

/*
 * Dependencies.
 */

var path = require('path');
var fs = require('fs');
var commander = require('commander');
var debug = require('debug')('mdast');
var mdast = require('./');
var pack = require('./package.json');

/*
 * Shortcuts.
 */

var Command = commander.Command;
var exists = fs.existsSync || path.existsSync;
var resolve = path.resolve;
var join = path.join;
var read = fs.readFileSync;
var write = fs.writeFileSync;
var stdout = process.stdout;
var stdin = process.stdin;

/*
 * Constants.
 */

var SPLITTER = / *[,;] */g;
var DELIMITER = / *: */g;

var ENCODING = 'utf-8';

var cwd = process.cwd();
var expextPipeIn = !stdin.isTTY;
var seperator = path.sep;

var command = Object.keys(pack.bin)[0];

/**
 * Find root of node modules.
 *
 * @return {string}
 */
function findRoot() {
    var parts = cwd.split(seperator);
    var location = cwd;

    while (!exists(join(location, 'package.json')) && parts.length > 1) {
        parts.pop();
        location = parts.join(seperator);
    }

    return parts.length ? location : cwd;
}

/*
 * Root.
 */

var root = findRoot();

/**
 * Find a plugin.
 *
 * @param {string} pathlike
 * @return {Object}
 */
function find(pathlike) {
    var local = resolve(root, pathlike);
    var npm = resolve(root, 'node_modules', pathlike);
    var current = resolve(cwd, 'node_modules', pathlike);
    var plugin;

    if (exists(local) || exists(local + '.js')) {
        plugin = local;
    } else if (exists(npm)) {
        plugin = npm;
    } else if (exists(current)) {
        plugin = current;
    }

    debug('Using plugin `%s` at `%s`', pathlike, plugin);

    return require(plugin);
}

/**
 * Transform a dash-cased string to camel-cased.
 *
 * @param {string} value
 * @return {string}
 */
function camelCase(value) {
    return value.toLowerCase().replace(/-([a-z])/gi, function ($0, $1) {
        return $1.toUpperCase();
    });
}

/**
 * Parse settings into an object.
 *
 * @param {string} flags
 * @param {Object} cache
 * @return {Object}
 */
function settings(flags, cache) {
    flags.split(SPLITTER).forEach(function (flag) {
        var value;

        flag = flag.split(DELIMITER);

        value = flag[1];

        if (value === 'true' || value === undefined) {
            value = true;
        } else if (value === 'false') {
            value = false;
        } else if (Number(value) === Number(value)) {
            value = Number(value);
        }

        cache[camelCase(flag[0])] = value;
    });

    return cache;
}

/**
 * Parse plugins into a list.
 *
 * @param {string} ware
 * @param {Array.<string>} cache
 * @return {Array.<string>}
 */
function plugins(ware, cache) {
    return cache.concat(ware.split(SPLITTER));
}

/**
 * Command.
 */

var program = new Command(pack.name)
    .version(pack.version)
    .description(pack.description)
    .usage('[options] file')
    .option('-o, --output <path>', 'specify output location', null)
    .option('-s, --setting <settings>', 'specify settings', settings, {})
    .option('-u, --use <plugins>', 'use transform plugin(s)', plugins, [])
    .option('-a, --ast', 'output AST information', false)
    .option('--settings', 'output available settings', false);

/**
 * Help.
 */

program.on('--help', function () {
    console.log('  # Note that bash does not allow reading and writing');
    console.log('  # to the same file through pipes');
    console.log();
    console.log('  Usage:');
    console.log();
    console.log('  # Pass `Readme.md` through mdast');
    console.log('  $ ' + command + ' Readme.md -o Readme.md');
    console.log();
    console.log('  # Pass stdin through mdast, with settings, to stdout');
    console.log('  $ cat Readme.md | ' + command + ' --setting ' +
        '"setext, bullet: *" > Readme-new.md');
    console.log();
    console.log('  # use a plugin');
    console.log('  $ npm install mdast-toc');
    console.log('  $ ' + command + ' --use mdast-toc -o Readme.md');
    console.log();
});

program.on('--settings', function () {
    console.log();
    console.log('  # Settings');
    console.log();
    console.log('  Both camel- and dash-cased settings are allowed.');
    console.log();
    console.log('  ## [Parse](https://github.com/wooorm/mdast#' +
        'mdastparsevalue-options)');
    console.log();
    console.log('  -  `gfm` (boolean, default: true)');
    console.log('  -  `tables` (boolean, default: true)');
    console.log('  -  `yaml` (boolean, default: true)');
    console.log('  -  `pedantic` (boolean, default: false)');
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
    console.log('  -  `reference-footnotes` (boolean, default: true)');
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
    console.log('    $ ' + command + ' --setting "name:value"');
    console.log();
    console.log('  Multiple settings:');
    console.log();
    console.log('    $ ' + command + ' --setting "emphasis:*,strong:_"');
    console.log();
});

program.parse(process.argv);

/*
 * Program.
 */

debug('Using root: `%s`', root);

var parser = mdast;

program.use.forEach(function (pathlike) {
    parser = parser.use(find(pathlike));
});

/**
 * Parse `value` with `parser`. When `ast` is set,
 * pretty prints JSON, otherwise stringifies with
 * `parser`. Either write to `output` or to stdout.
 *
 * @param {string} value
 */
function run(value) {
    debug('Using options `%j`', program.setting);

    var doc = parser.parse(value, program.setting);

    if (program.ast) {
        doc = JSON.stringify(doc, null, 2);
    } else {
        doc = parser.stringify(doc, program.setting);
    }

    if (program.output) {
        debug('Writing document to `%s`', program.output);

        write(program.output, doc);
    } else {
        debug('Writing document to standard out');

        stdout.write(doc);
    }
}

var files = program.args;

if (program.settings) {
    program.emit('--settings');
} else {
    if (!expextPipeIn && !files.length) {
        if (program.output) {
            debug('Using output `%s` as input', program.output);

            files.push(program.output);
        } else {
            program.outputHelp();
            process.exit(1);
        }
    } else if (
        (expextPipeIn && files.length) ||
        (!expextPipeIn && files.length !== 1)
    ) {
        throw new Error('mdast currently expects one file.');
    }

    if (files[0]) {
        debug('Reading from `%s` using encoding `%s`', files[0], ENCODING);

        run(read(files[0], ENCODING));
    } else {
        stdin.resume();
        stdin.setEncoding(ENCODING);
        stdin.on('data', run);
    }
}
