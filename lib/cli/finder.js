/**
 * @author Titus Wormer
 * @copyright 2015 Titus Wormer
 * @license MIT
 * @module mdast:cli:finder
 * @fileoverview Find one or more files by searching
 *   the file system.
 */

'use strict';

/*
 * Dependencies.
 */

var fs = require('fs');
var path = require('path');

/*
 * Methods.
 */

var readdir = fs.readdirSync;
var resolve = path.resolve;
var dirname = path.dirname;
var push = Array.prototype.push;
var has = Object.prototype.hasOwnProperty;

/**
 * Get the entries for a directory.
 *
 * @example
 *   var entries = getEnties('~');
 *
 * @param {string} directory - Path to directory.
 * @return {Array.<string>} - All files in `directory`.
 */
function getEntries(directory) {
    var entries = [];

    try {
        entries = readdir(directory);
    } catch (exception) {/* empty */}

    return entries;
}

/**
 * Finder.
 *
 * @example
 *   var finder = new Finder(['package.json', '.mdastrc']);
 *
 * @constructor
 * @class {Finder}
 * @param {Array.<string>} files - Files to search for.
 * @param {string?} cwd - Current working directory.
 */
function Finder(files, cwd) {
    this.filenames = files;
    this.cwd = cwd || process.cwd();

    this.cache = {};
}

/**
 * Find files/directories upwards.  Caches results.
 *
 * @example
 *   var finder = new Finder(['package.json', '.mdastrc']);
 *   var files = finder.find('~');
 *
 * @param {string} directory - Path to directory to search.
 * @param {boolean?} [one] - When `true`, returns the
 *   first result (`string`), otherwise, returns an array
 *   of strings.
 * @return {Array.<string>|string}
 */
Finder.prototype.find = function (directory, one) {
    var self = this;
    var cache = self.cache;
    var currentDirectory = directory ? resolve(directory) : self.cwd;
    var child;
    var directories;
    var name;
    var files;
    var filenames;
    var filepath;
    var count;
    var index;
    var position;
    var searched;

    if (has.call(cache, currentDirectory)) {
        return cache[currentDirectory];
    }

    directories = [];
    searched = 0;
    filenames = this.filenames;
    count = filenames.length;

    do {
        directories[searched++] = currentDirectory;

        cache[currentDirectory] = [];

        index = -1;

        while (++index < count) {
            name = filenames[index];

            if (getEntries(currentDirectory).indexOf(name) !== -1) {
                filepath = resolve(currentDirectory, name);

                position = -1;

                while (++position < searched) {
                    cache[directories[position]].push(filepath);
                }

                if (one) {
                    return filepath;
                }
            }
        }

        child = currentDirectory;

        currentDirectory = dirname(currentDirectory);

        if (currentDirectory === child) {
            files = cache[directories[0]];

            return one ? files[0] : files;
        }
    } while (!has.call(cache, currentDirectory));

    /*
     * From cache.
     */

    index = -1;

    while (++index < searched) {
        push.apply(cache[directories[index]], cache[currentDirectory]);
    }

    files = cache[directories[0]];

    return one ? files[0] : files;
};

/*
 * Expose.
 */

module.exports = Finder;
