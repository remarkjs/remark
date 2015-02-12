'use strict';

/*
 * Cached methods.
 */

var has = Object.prototype.hasOwnProperty;

/*
 * Expressions.
 */

var WHITE_SPACE_FINAL = /\s+$/;
var NEW_LINE_FINAL = /\n+$/;
var WHITE_SPACE_INITIAL = /^\s+/;
var EXPRESSION_LINE_BREAKS = /\r\n|\r/g;
var EXPRESSION_TAB = /\t/g;
var EXPRESSION_SYMBOL_FOR_NEW_LINE = /\u2424/g;
var EXPRESSION_NO_BREAK_SPACE = /\u00a0/g;

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
 * Validate a value to be boolean. Defaults to `def`.
 * Raises an exception with `options.$name` when not
 * a boolean.
 *
 * @param {Object} obj
 * @param {string} name
 * @param {boolean} def
 */
function validateBoolean(obj, name, def) {
    var value = obj[name];

    if (value === null || value === undefined) {
        value = def;
    }

    if (typeof value !== 'boolean') {
        raise(value, 'options.' + name);
    }

    obj[name] = value;
}

/**
 * Validate a value to be boolean. Defaults to `def`.
 * Raises an exception with `options.$name` when not
 * a boolean.
 *
 * @param {Object} obj
 * @param {string} name
 * @param {number} def
 */
function validateNumber(obj, name, def) {
    var value = obj[name];

    if (value === null || value === undefined) {
        value = def;
    }

    if (typeof value !== 'number') {
        raise(value, 'options.' + name);
    }

    obj[name] = value;
}

/**
 * Validate a value to be in `map`. Defaults to `def`.
 * Raises an exception with `options.$name` when not
 * not in `map`.
 *
 * @param {Object} obj
 * @param {string} name
 * @param {Object} map
 * @param {boolean} def
 */
function validateMap(obj, name, map, def) {
    var value = obj[name];

    if (value === null || value === undefined) {
        value = def;
    }

    if (!(value in map)) {
        raise(value, 'options.' + name);
    }

    obj[name] = value;
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
 * Remove final new line characters from `value`.
 *
 * @param {string} value
 * @return {string}
 */
function trimRightLines(value) {
    return String(value).replace(NEW_LINE_FINAL, '');
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

/**
 * Clean a string in preperation of parsing.
 *
 * @param {string} value
 * @return {string}
 */
function clean(value) {
    return String(value)
        .replace(EXPRESSION_LINE_BREAKS, '\n')
        .replace(EXPRESSION_TAB, '    ')
        .replace(EXPRESSION_NO_BREAK_SPACE, ' ')
        .replace(EXPRESSION_SYMBOL_FOR_NEW_LINE, '\n');
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
 * Expose `validate`.
 */

exports.validate = {
    'bool': validateBoolean,
    'map': validateMap,
    'num': validateNumber
};

/*
 * Expose `trim` methods.
 */

exports.trimLeft = trimLeft;
exports.trimRight = trimRight;
exports.trimRightLines = trimRightLines;

/*
 * Expose `clean`.
 */

exports.clean = clean;
