'use strict';

/*
 * Dependencies.
 */

var fs = require('fs');
var path = require('path');
var debug = require('debug');
var minimatch = require('minimatch');

/*
 * Set-up.
 */

debug = debug('mdast:traverse');

/*
 * Methods.
 */

var readdir = fs.readdirSync;
var stat = fs.statSync;
var resolve = path.resolve;
var join = path.join;
var basename = path.basename;
var extname = path.extname;
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
 * @param {string} file
 * @param {string} pattern
 * @return {boolean}
 */
function match(file, pattern) {
    return minimatch(file, pattern) || minimatch(file, pattern + '/**');
}

/**
 * Traverser.
 *
 * @constructor
 * @class {Traverse}
 * @param {Array.<string>} extensions
 * @param {Array.<string>} patterns
 */
function Traverse(extensions, patterns) {
    this.extensions = extensions;
    this.ignore = patterns;
}

/**
 * Check for files in `path`.  Returns one path if the
 * given path itself is applicable, otherwise, a list of
 * applicable files.
 *
 * @this {Traverse}
 * @param {string} filepath
 * @return {string|Array.<string>}
 */
function visit(filepath) {
    var isFile = stat(resolve(filepath)).isFile();

    if (this.isApplicable(filepath, isFile)) {
        debug('Checking `%s`', filepath);

        return isFile ? filepath : this.all(readdir(filepath), filepath);
    }

    return [];
}

/**
 * Check for files in `paths`.  Returns a list of
 * applicable files.
 *
 * @this {Traverse}
 * @param {Array.<string>} paths
 * @param {string?} directory
 * @return {Array.<string>}
 */
function all(paths, directory) {
    var result;

    paths = paths.map(function ($0) {
        return join(directory || EMPTY, $0);
    });

    this.depth++;

    result = concat.apply([], paths.map(visit, this));

    this.depth--;

    return result;
}

/**
 * Check if `filepath` is applicable.
 *
 * @this {Traverse}
 * @param {string} filepath
 * @param {boolean} isFile
 * @return {boolean}
 */
function isApplicable(filepath, isFile) {
    var name = basename(filepath);
    var extension = extname(filepath);
    var isIgnored = this.shouldIgnored(filepath);

    if (this.depth === 0) {
        if (isIgnored) {
            throw new Error(
                'Ignoring file specified on CLI as it is ' +
                'ignored by `.mdastignore`'
            );
        }

        return true;
    }

    if (isIgnored) {
        return false;
    }

    if (!isFile) {
        return !(name.charAt(0) === '.' && name.length !== 1);
    }

    return this.extensions.indexOf(extension.slice(1)) !== -1;
}

/**
 * Check if `filepath` should be ignored basedon the
 * context object's `patterns`.  Uses minimatch, and
 * supports negation.
 *
 * @this {Traverse}
 * @param {string} filepath
 * @return {boolean}
 */
function shouldIgnored(filepath) {
    var normalized = filepath.replace(BACKSLASH, SLASH).replace(CD, EMPTY);

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
 * @this {Traverse}
 * @param {Array.<string>} paths
 * @return {Array.<string>}
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
Traverse.prototype.shouldIgnored = shouldIgnored;
Traverse.prototype.traverse = traverse;

/*
 * Expose.
 */

module.exports = Traverse;
