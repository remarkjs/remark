'use strict';

/*
 * Dependencies.
 */

var fs = require('fs');
var path = require('path');
var debug = require('debug');
var Finder = require('./finder');

/*
 * Constants.
 */

var IGNORE_NAME = '.mdastignore';

var defaults = [
    'node_modules/'
];

/*
 * Methods.
 */

var read = fs.readFileSync;
var resolve = path.resolve;
var has = Object.prototype.hasOwnProperty;

/*
 * Set-up.
 */

var cwd = process.cwd();

debug = debug('mdast:ignore');

/**
 * Check if a pattern-like line is an applicable pattern.
 *
 * @param {string} value
 * @return {boolean}
 */
function isApplicable(value) {
    var line = value && value.trim();

    return line && line.length && line.charAt(0) !== '#';
}

/**
 * Parse an ignore file.
 *
 * @param {string} filepath
 * @return {Object}
 */
function load(filepath) {
    var ignore = {};

    if (filepath) {
        try {
            ignore = read(filepath, 'utf8');

            ignore = ignore.split(/\r?\n/).filter(isApplicable);
        } catch (exception) {
            exception.message = 'Cannot read ignore file: ' +
                filepath + '\n' + 'Error: ' + exception.message;

            throw exception;
        }
    }

    return ignore;
}

/**
 * Find ignore-patterns.
 *
 * @constructor
 * @class {Ignore}
 * @param {Object?} options
 */
function Ignore(options) {
    var self = this;
    var settings = options || {};
    var file = settings.file;

    self.cache = {};
    self.finder = new Finder([IGNORE_NAME]);

    self.useIgnore = settings.useIgnore;

    if (file) {
        debug('Using command line ignore `' + file + '`');

        self.cliIgnore = load(resolve(cwd, file));
    }
}

/**
 * Get patterns belonging to `filepath`.
 *
 * @this {Ignore}
 * @param {string?} filepath
 * @return {Array.<string>}
 */
function getPatterns(filepath) {
    var self = this;
    var directory = filepath ? path.dirname(filepath) : cwd;
    var ignore = self.cache[directory];

    debug('Constructing ignore for `' + (filepath || cwd) + '`');

    if (self.cliIgnore) {
        debug('Using ignore form CLI');

        ignore = self.cliIgnore.concat(self.defaults);
    } else if (!self.useIgnore) {
        ignore = self.defaults;
    } else if (!has.call(self.cache, directory)) {
        ignore = self.finder.find(directory, true);

        ignore = (ignore ? load(ignore) : []).concat(self.defaults);

        self.cache[directory] = ignore;
    } else {
        debug('Using ignore from cache');

        ignore = self.cache[directory];
    }

    return ignore;
}

/*
 * Expose methods.
 */

Ignore.prototype.getPatterns = getPatterns;

/*
 * Expose defaults.
 */

Ignore.prototype.defaults = defaults;

/*
 * Expose.
 */

module.exports = Ignore;
