'use strict';

/**
 * Construct a new file.
 *
 * @constructor
 * @class {File}
 * @param {Object|File|string} [options]
 */
function File(options) {
    if (!(this instanceof File)) {
        return new File(options);
    }

    if (options instanceof File) {
        return options;
    }

    if (!options) {
        options = {};
    } else if (typeof options === 'string') {
        options = {
            'contents': options
        };
    }

    this.directory = options.directory || '';
    this.filename = options.filename || null;
    this.contents = options.contents || '';

    this.extension = options.extension === undefined ?
        'md' : options.extension;
}

/**
 * Stringify a position.
 *
 * @param {Object?} [position]
 * @return {string}
 */
function stringify(position) {
    if (!position) {
        position = {};
    }

    return (position.line || 1) + ':' + (position.column || 1);
}

/**
 * Create an exception with `reason` at `position`.
 *
 * @this {File}
 * @param {string} reason
 * @param {Node|Location|Position} [position]
 * @return {Error}
 */
function exception(reason, position) {
    var file = this.getFile();
    var location;
    var err;

    /*
     * Node / location / position.
     */

    if (position && position.position) {
        position = position.position;
    }

    if (position && position.start) {
        location = stringify(position.start) + '-' + stringify(position.end);
        position = position.start;
    } else {
        location = stringify(position)
    }

    err = new Error((file ? file + ':' : '') + location + ': ' + reason);

    err.file = file;
    err.reason = reason;
    err.line = position ? position.line : null;
    err.column = position ? position.column : null;

    return err;
}

/**
 * Create the location of `file`.
 *
 * @this {File}
 * @return {string?}
 */
function getFile() {
    if (this.filename) {
        return this.filename + (this.extension ? '.' + this.extension : '');
    }

    return null;
}

/**
 * Create a string representation of `file`.
 *
 * @this {File}
 * @return {string}
 */
function toString() {
    return this.contents;
}

/*
 * Methods.
 */

File.prototype.exception = exception;
File.prototype.toString = toString;
File.prototype.getFile = getFile;

/*
 * Expose.
 */

module.exports = File;
