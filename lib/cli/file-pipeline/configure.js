/**
 * @author Titus Wormer
 * @copyright 2015 Titus Wormer
 * @license MIT
 * @module mdast:cli:file-pipeline:configure
 * @version 2.3.2
 * @fileoverview Configure a file.
 */

'use strict';

/* eslint-env node */

/*
 * Dependencies.
 */

var fs = require('fs');
var path = require('path');
var debug = require('debug')('mdast:cli:file-pipeline:configure');
var npmPrefix = require('npm-prefix')();
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
var MODULES = 'node_modules';
var isWindows = process.platform === 'win32';
var isGlobal = process.argv[1].indexOf(npmPrefix) === 0;
var globals = resolve(npmPrefix, isWindows ? '' : 'lib', MODULES);

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
 * When using a globally installed executable, the
 * following are also included:
 *
 * -  `$modules/$pathlike`;
 * -  `$modules/mdast-$pathlike`.
 *
 * Where `$modules` is the directory of globally installed
 * npm packages.
 *
 * @see https://docs.npmjs.com/files/folders#node-modules
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
    var pluginlike = 'mdast-' + pathlike;
    var index = -1;
    var plugin = pathlike;
    var length;
    var paths = [
        resolve(root, pathlike),
        resolve(root, pathlike + '.js'),
        resolve(root, MODULES, pluginlike),
        resolve(root, MODULES, pathlike),
        resolve(cwd, MODULES, pluginlike),
        resolve(cwd, MODULES, pathlike)
    ];

    if (isGlobal) {
        paths.push(
            resolve(globals, pathlike),
            resolve(globals, pluginlike)
        );
    }

    length = paths.length;

    while (++index < length) {
        if (exists(paths[index])) {
            plugin = paths[index];
            break;
        }
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
 * @param {Object} context - Context object.
 * @param {function(Error?)} next - Callback invoked when
 *   done.
 */
function configure(context, next) {
    var file = context.file;
    var cli = context.fileSet.cli;
    var config = cli.configuration;
    var processor = mdast();
    var plugins;

    if (file.hasFailed()) {
        next();
        return;
    }

    config.getConfiguration(file.filePath(), function (err, options) {
        debug('Setting output `%s`', options.output);

        debug('Using settings `%j`', options.settings);

        plugins = Object.keys(options.plugins);

        debug('Using plug-ins `%j`', plugins);

        /*
         * Use, with options.
         */

        plugins.forEach(function (name) {
            var option = options.plugins[name];
            var plugin;

            if (option === false) {
                debug('Ignoring plug-in `%s`', name);
                return;
            }

            try {
                plugin = findPlugin(name, cli.cwd);

                debug('Applying options `%j` to `%s`', option, name);

                processor.use(plugin, option, context.fileSet);
            } catch (err) {
                next(err);
                return false;
            }
        });

        context.output = options.output;
        context.settings = options.settings;
        context.processor = processor;

        next();
    });
}

/*
 * Expose.
 */

module.exports = configure;
