/**
 * @author Titus Wormer
 * @copyright 2015 Titus Wormer
 * @license MIT
 * @module mdast:cli:traverser
 * @fileoverview Get applicable input files from
 *   the file system to be processed by mdast, respecting
 *   ignored paths and applicable extensions.
 */

'use strict';

/*
 * Dependencies.
 */

var fs = require('fs');
var path = require('path');
var debug = require('debug')('mdast:cli:traverse');
var minimatch = require('minimatch');
var toVFile = require('to-vfile');
var Ignore = require('./ignore');

/*
 * Methods.
 */

var readdir = fs.readdirSync;
var stat = fs.statSync;
var exists = fs.existsSync;
var resolve = path.resolve;
var join = path.join;
var concat = [].concat;

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
 * @return {boolean}
 */
function match(filePath, pattern) {
    return minimatch(filePath, pattern) ||
        minimatch(filePath, pattern + '/**');
}

/**
 * Traverser.
 *
 * @example
 *   var traverse = new Traverse(['md'], ['node_modules']);
 *
 * @constructor
 * @class {Traverse}
 * @param {Object} options
 */
function Traverse(options) {
    var settings = options || {};

    this.extensions = settings.extensions || [];

    this.ignore = new Ignore({
        'file': settings.ignorePath,
        'detectIgnore': settings.detectIgnore
    }).getPatterns();
}

/**
 * Create a `File` from a `filePath`.
 * Does not populate `contents`, but does add `exists`
 * and `isFile` properties.
 *
 * @example
 *   var file = toFile('~');
 *
 * @param {string} filePath - Path to file or directory.
 * @return {File}
 */
function toFile(filePath) {
    var real = exists(filePath);
    var file = toVFile(filePath);
    var space;

    space = file.namespace('mdast:cli');

    file.quiet = true;

    space.exists = real;
    space.isFile = real ? stat(resolve(filePath)).isFile() : null;
    space.providedByUser = true;

    return file;
}

/**
 * Find files in `filePath`.
 *
 * @example
 *   var traverse = new Traverse(['md'], []);
 *   traverse.visit('~/foo/bar');
 *
 * @this {Traverse}
 * @param {string} filePath - Path to file or directory.
 * @return {File|Array.<File>} - Single file if `filePath`
 *   itself if there is filePath does not exist or if it's
 *   not a directory. Otherwise an array of files is
 *   returned.
 */
function visit(filePath) {
    var file = toFile(filePath);
    var space = file.namespace('mdast:cli');

    if (this.isApplicable(file)) {
        debug('Checking `%s`', file.filePath);

        if (!space.exists || (!space.isFile && file.hasFailed())) {
            return file;
        }

        return space.isFile ? file : this.all(readdir(filePath), filePath);
    }

    return [];
}

/**
 * Find files in `paths`.  Returns a list of
 * applicable files.
 *
 * @example
 *   var traverse = new Traverse(['md'], []);
 *   traverse.all('bar', '~/foo');
 *
 * @this {Traverse}
 * @param {Array.<string>} paths - Path to files and
 *   directories.
 * @param {string?} [directory] - Path to parent directory,
 *   if any.
 * @return {Array.<File>} - All applicable files.
 */
function all(paths, directory) {
    var self = this;
    var result;

    paths = paths.map(function ($0) {
        return join(directory || EMPTY, $0);
    });

    self.depth++;

    result = concat.apply([], paths.map(visit, this));

    self.depth--;

    return result;
}

/**
 * Check if `file` is applicable.
 *
 * @example
 *   var traverse = new Traverse(['md'], []);
 *   var file = new File({'extension': 'md', 'exists': true});
 *   traverse.isApplicable(file); // true
 *
 * @this {Traverse}
 * @param {File} file
 * @return {boolean} - Whether `file` is 'processable',
 *   or if it is directly passed to the CLI.
 */
function isApplicable(file) {
    var name = file.filename;
    var isIgnored = this.shouldIgnore(file.filePath());
    var space = file.namespace('mdast:cli');

    if (!space.exists) {
        file.fail('No such file or directory');

        return true;
    }

    if (this.depth === 0) {
        if (isIgnored) {
            file.fail(
                'Ignoring file specified on CLI as it is ' +
                'ignored by `.mdastignore`'
            );
        }

        return true;
    }

    if (isIgnored) {
        return false;
    }

    if (!space.isFile || file.hasFailed()) {
        return !(name.charAt(0) === '.' && name.length !== 1);
    }

    return this.extensions.indexOf(file.extension) !== -1;
}

/**
 * Check if `filePath` should be ignored based on the
 * context object's `patterns`.  Uses minimatch, and
 * supports negation.
 *
 * @example
 *   var traverse = new Traverse([], ['node_modules']);
 *   traverse.shouldIgnore('~/foo'); // false
 *   traverse.shouldIgnore('~/node_modules/foo'); // true
 *
 * @this {Traverse}
 * @param {string} filePath - Path to file or directory.
 * @return {boolean} - Whether `filePath` is ignored.
 */
function shouldIgnore(filePath) {
    var normalized = filePath.replace(BACKSLASH, SLASH).replace(CD, EMPTY);

    return this.ignore.reduce(function (isIgnored, pattern) {
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
 * Find applicable files in `paths`
 *
 * @example
 *   var traverse = new Traverse(['md'], ['node_modules']);
 *   var files = traverse.traverse('~');
 *
 * @this {Traverse}
 * @param {Array.<string>} paths - Paths to files and
 *   directories.
 * @return {Array.<string>} - 'Processable' files.
 */
function traverse(paths) {
    this.depth = -1;

    return this.all(paths);
}

/*
 * Expose methods.
 */

Traverse.prototype.visit = visit;
Traverse.prototype.all = all;
Traverse.prototype.isApplicable = isApplicable;
Traverse.prototype.shouldIgnore = shouldIgnore;
Traverse.prototype.traverse = traverse;

/*
 * Expose.
 */

module.exports = Traverse;
