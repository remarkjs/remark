/**
 * @author Titus Wormer
 * @copyright 2015 Titus Wormer
 * @license MIT
 * @module mdast:cli:traverser
 * @version 2.3.2
 * @fileoverview Get applicable input files from
 *   the file system to be processed by mdast, respecting
 *   ignored paths and applicable extensions.
 */

'use strict';

/* eslint-env node */

/*
 * Dependencies.
 */

var fs = require('fs');
var globby = require('globby');
var hasMagic = require('glob').hasMagic;
var minimatch = require('minimatch');
var toVFile = require('to-vfile');
var findDown = require('vfile-find-down');

/*
 * Methods.
 */

var stat = fs.statSync;

/*
 * Constants.
 */

var BACKSLASH = '\\';
var SLASH = '/';
var CD = './';
var EMPTY = '';

/**
 * Check if `file` matches `pattern`.
 *
 * @example
 *   match('baz.md', '*.md'); // true
 *
 * @param {string} filePath - File location.
 * @param {string} pattern - Glob pattern.
 * @return {boolean} - Whether `file` matches `pattern`.
 */
function match(filePath, pattern) {
    return minimatch(filePath, pattern) ||
        minimatch(filePath, pattern + '/**');
}

/**
 * Check whether `filePath` should be ignored based on
 * the given `patterns`.
 *
 * @example
 *   shouldIgnore([
 *     'components/',
 *     'node_modules/'
 *   ], 'readme.md'); // false
 *
 * @param {Array.<string>} patterns - List of globs.
 * @param {string} filePath - File-path to check.
 * @return {boolean} - whether `filePath` should be ignored
 *   based on the given `patterns`.
 */
function shouldIgnore(patterns, filePath) {
    var normalized = filePath.replace(BACKSLASH, SLASH).replace(CD, EMPTY);

    return patterns.reduce(function (isIgnored, pattern) {
        var isNegated = pattern.charAt(0) === '!';

        if (isNegated) {
            pattern = pattern.slice(1);
        }

        if (pattern.indexOf(CD) === 0) {
            pattern = pattern.slice(CD.length);
        }

        return match(normalized, pattern) ? !isNegated : isIgnored;
    }, false);
}

/**
 * Construct a new finder.
 *
 * @example
 *   var finder = new Finder({
 *     'extensions': ['text', 'txt']
 *   });
 *
 * @constructor
 * @class {Finder}
 * @param {Object} [options={}] - Settings.
 * @param {Array.<string>} [options.ignore=[]]
 *   - File-paths to ignore.
 * @param {Array.<string>} [options.extensions=[]]
 *   - Extensions to search.
 */
function Finder(options) {
    var self = this;
    var settings = options || {};

    self.ignore = settings.ignore || [];
    self.extensions = settings.extensions || [];
}

/**
 * Find files matching `globs` and the bound settings.
 *
 * @example
 *   var finder = new Finder();
 *   finder.find(['readme.md'], console.log);
 *
 * @this {Finder}
 * @param {Array.<string>} globs - Globs to search for.
 * @param {Function} callback - Callback to invoke when
 *   done.
 */
function find(globs, callback) {
    var self = this;
    var ignore = self.ignore;
    var extensions = self.extensions;
    var given = [];
    var failed = [];

    globs.forEach(function (glob) {
        var file;

        if (hasMagic(glob)) {
            return;
        }

        given.push(glob);

        try {
            stat(glob);
        } catch (err) {
            file = toVFile(glob);
            file.quiet = true;

            file.fail('No such file or directory');

            failed.push(file);
        }
    });

    globby(globs).then(function (filePaths) {
        findDown.all(function (file) {
            var filePath = file.filePath();
            var extension = file.extension;
            var mask;

            if (shouldIgnore(ignore, filePath)) {
                mask = findDown.SKIP;

                if (given.indexOf(filePath) !== -1) {
                    mask = mask | findDown.INCLUDE;

                    file.fail(
                        'Ignoring file specified on CLI as it is ' +
                        'ignored by `.mdastignore`'
                    );
                }

                return mask;
            }

            if (extension && extensions.indexOf(extension) !== -1) {
                return true;
            }

            return false;
        }, filePaths, function (err, files) {
            callback(err, failed.concat(files).map(function (file) {
                file.namespace('mdast:cli').given = true;
                return file;
            }));
        });
    }, callback);
}

Finder.prototype.find = find;

/*
 * Expose.
 */

module.exports = Finder;
