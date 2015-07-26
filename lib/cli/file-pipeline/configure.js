/**
 * @author Titus Wormer
 * @copyright 2015 Titus Wormer
 * @license MIT
 * @module mdast:cli:file-pipeline:configure
 * @fileoverview Configure a file.
 */

'use strict';

/*
 * Dependencies.
 */

var fs = require('fs');
var path = require('path');
var debug = require('debug')('mdast:cli:file-pipeline:configure');
var mdast = require('../../..');

/*
 * Methods.
 */

var exists = fs.existsSync;
var join = path.join;
var resolve = path.resolve;

/*
 * Constants.
 */

var SEPERATOR = path.sep;

/*
 * Utilities.
 */

/**
 * Find root of a node module: parent directory of
 * `package.json`, or, the given directory if no
 * ancestral `package.json` is found.
 *
 * @example
 *   findRoot('mdast/test'); // 'mdast'
 *
 * @todo Externalise.
 * @param {string} base - Path to directory.
 * @return {string} - Path to an ancestral project
 *   directory.
 */
function findRoot(base) {
    var location = base;
    var parts = base.split(SEPERATOR);

    while (!exists(join(location, 'package.json')) && parts.length > 1) {
        parts.pop();

        location = parts.join(SEPERATOR);
    }

    return parts.length ? location : base;
}

/**
 * Require a plugin.  Checks, in this order:
 *
 * -  `$package/$pathlike`;
 * -  `$package/$pathlike.js`;
 * -  `$package/node_modules/$pathlike`;
 * -  `$package/node_modules/mdast-$pathlike`;
 * -  `$cwd/node_modules/$pathlike`;
 * -  `$cwd/node_modules/mdast-$pathlike`;
 * -  `$pathlike`.
 *
 * Where `$package` is an ancestral package directory.
 *
 * @example
 *   var plugin = findPlugin('toc');
 *
 * @todo Externalise.
 * @throws {Error} - Fails when `pathlike` cannot be
 *   resolved.
 * @param {string} pathlike - Reference to plugin.
 * @param {string?} [cwd] - Relative working directory,
 *   defaults to the current working directory.
 * @return {Object} - Result of `require`ing `plugin`.
 */
function findPlugin(pathlike, cwd) {
    var root = findRoot(cwd);
    var local = resolve(root, pathlike);
    var npm = resolve(root, 'node_modules', pathlike);
    var npmPrefixed = resolve(root, 'node_modules', 'mdast-' + pathlike);
    var current = resolve(cwd, 'node_modules', pathlike);
    var currentPrefixed = resolve(cwd, 'node_modules', 'mdast-' + pathlike);
    var plugin;

    if (exists(local) || exists(local + '.js')) {
        plugin = local;
    } else if (exists(npm)) {
        plugin = npm;
    } else if (exists(npmPrefixed)) {
        plugin = npmPrefixed;
    } else if (exists(current)) {
        plugin = current;
    } else if (exists(currentPrefixed)) {
        plugin = currentPrefixed;
    } else {
        plugin = pathlike;
    }

    debug('Using plug-in `%s` at `%s`', pathlike, plugin);

    return require(plugin);
}

/**
 * Collect configuration for a file based on the context.
 *
 * @example
 *   var fileSet = new FileSet(cli);
 *   var file = new File({
 *     'directory': '~',
 *     'filename': 'example',
 *     'extension': 'md'
 *   });
 *
 *   configure({'file': file, 'fileSet': fileSet});
 *
 * @param {Object} context
 */
function configure(context) {
    var file = context.file;
    var cli = context.fileSet.cli;
    var config = cli.configuration;
    var options = config.getConfiguration(file.filePath());
    var processor = mdast();
    var plugins;

    if (file.hasFailed()) {
        return;
    }

    debug('Setting output `%s`', options.output);

    debug('Using settings `%j`', options.settings);

    plugins = Object.keys(options.plugins);

    debug('Using plug-ins `%j`', plugins);

    /*
     * Use, with options.
     */

    plugins.forEach(function (name) {
        var option = options.plugins[name];
        var plugin = findPlugin(name, cli.cwd);

        if (option === false) {
            debug('Ignoring plug-in `%s`', name);
            return;
        }

        debug('Applying options `%j` to `%s`', option, name);

        processor.use(plugin, option, context.fileSet);
    });

    context.output = options.output;
    context.settings = options.settings;
    context.processor = processor;
}

/*
 * Expose.
 */

module.exports = configure;
