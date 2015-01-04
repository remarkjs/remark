'use strict';

/*
 * Cached methods.
 */

var has;

has = Object.prototype.hasOwnProperty;

/*
 * Expressions.
 */

var WHITE_SPACE_FINAL,
    WHITE_SPACE_INITIAL;

WHITE_SPACE_FINAL = /\s+$/;
WHITE_SPACE_INITIAL = /^\s+/;

/**
 * Shallow copy `context` into `target`.
 *
 * @param {Object} target
 * @return {Object} context
 * @return {Object} - target.
 */
function copy(target, context) {
    var key;

    for (key in context) {
        /* istanbul ignore else */
        if (has.call(context, key)) {
            target[key] = context[key];
        }
    }

    return target;
}

/**
 * Throw an exception with in its message the value,
 * and its name.
 *
 * @param {*} value
 * @param {string} name
 */
function raise(value, name) {
    throw new Error(
        'Invalid value `' + value + '` ' +
        'for `' + name + '`'
    );
}

/**
 * Get the keys in `object`.
 *
 * @param {Object} object
 * @return {Array.<string>}
 */
function keys(object) {
    var results,
        index,
        key;

    results = [];

    index = -1;

    for (key in object) {
        /* istanbul ignore else */
        if (has.call(object, key)) {
            results[++index] = key;
        }
    }

    return results;
}

/**
 * Remove final white space from `value`.
 *
 * @param {string} value
 * @return {string}
 */
function trimRight(value) {
    return String(value).replace(WHITE_SPACE_FINAL, '');
}

/**
 * Remove initial white space from `value`.
 *
 * @param {string} value
 * @return {string}
 */
function trimLeft(value) {
    return String(value).replace(WHITE_SPACE_INITIAL, '');
}

/*
 * Expose `copy`.
 */

exports.copy = copy;

/*
 * Expose `raise`.
 */

exports.raise = raise;

/*
 * Expose `keys`.
 */

exports.keys = keys;

/*
 * Expose `trim` methods.
 */

exports.trimLeft = trimLeft;
exports.trimRight = trimRight;
