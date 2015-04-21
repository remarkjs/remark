'use strict';

/*
 * Dependencies.
 */

var fs = require('fs');
var path = require('path');
var debug = require('debug');
var minimatch = require('minimatch');
var File = require('../file');

/*
 * Set-up.
 */

debug = debug('mdast:traverse');

/*
 * Methods.
 */

var readdir = fs.readdirSync;
var stat = fs.statSync;
var exists = fs.existsSync;
var resolve = path.resolve;
var join = path.join;
var basename = path.basename;
var extname = path.extname;
var dirname = path.dirname;
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
 * Create a `File` from a `filePath`.
 *
 * Does not populate `contents`.
 *
 * @param {string} filePath
 * @return {File}
 */
function toFile(filePath) {
    var extension = extname(filePath);
    var name = basename(filePath, extension);
    var real = exists(filePath);
    var directory = dirname(filePath);

    var file = new File({
        'directory': directory,
        'filename': name,
        'extension': extension.slice(1)
    });

    file.quiet = true;
    file.exists = real;
    file.isFile = real ? stat(resolve(filePath)).isFile() : null;

    return file;
}

/**
 * Check for files in `path`.  Returns one path if the
 * given path itself is applicable, otherwise, a list of
 * applicable files.
 *
 * @this {Traverse}
 * @param {string} filePath
 * @return {string|Array.<string>}
 */
function visit(filePath) {
    var file = toFile(filePath);

    if (this.isApplicable(file)) {
        debug('Checking `%s`', file.filePath);

        if (!file.exists || (!file.isFile && file.hasFailed())) {
            return file;
        }

        return file.isFile ? file : this.all(readdir(filePath), filePath);
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
 * Check if `filePath` is applicable.
 *
 * @this {Traverse}
 * @param {File} file
 * @return {boolean}
 */
function isApplicable(file) {
    var name = file.filename;
    var isIgnored = this.shouldIgnore(file.filePath());

    if (!file.exists) {
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

    if (!file.isFile || file.hasFailed()) {
        return !(name.charAt(0) === '.' && name.length !== 1);
    }

    return this.extensions.indexOf(file.extension) !== -1;
}

/**
 * Check if `filePath` should be ignored based on the
 * context object's `patterns`.  Uses minimatch, and
 * supports negation.
 *
 * @this {Traverse}
 * @param {string} filePath
 * @return {boolean}
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
Traverse.prototype.shouldIgnore = shouldIgnore;
Traverse.prototype.traverse = traverse;

/*
 * Expose.
 */

module.exports = Traverse;
