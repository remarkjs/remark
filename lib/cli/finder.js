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

/*
 * Constants.
 */

var cwd = process.cwd();

/**
 * Get the entries for a directory.
 *
 * @param {string} directory
 * @return {Array.<string>}
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
 * @constructor
 * @class {Finder}
 * @param {Array.<string>} files
 */
function Finder(files) {
    this.filenames = files;

    this.cache = {};
}

/**
 * Find files/directories upwards.  Caches results.

 * @param {string} directory
 * @param {boolean?} one - When `true`, returns the
 *   first result
 * @return {Array.<string>}
 */
Finder.prototype.find = function (directory, one) {
    var self = this;
    var cache = self.cache;
    var currentDirectory = directory || cwd;
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

    index = -1;

    while (++index < length) {
        push.apply(cache[directories[index]], cache[currentDirectory]);
    }

    files = cache[directories[0]];

    return one ? files[0] : files;
};

/*
 * Expose.
 */

module.exports = Finder;
