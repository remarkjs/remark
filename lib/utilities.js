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
    WHITE_SPACE_INITIAL,
    EXPRESSION_TAB,
    EXPRESSION_NO_BREAK_SPACE,
    EXPRESSION_SYMBOL_FOR_NEW_LINE,
    EXPRESSION_LINE_BREAKS;

WHITE_SPACE_FINAL = /\s+$/;
WHITE_SPACE_INITIAL = /^\s+/;
EXPRESSION_LINE_BREAKS = /\r\n|\r/g;
EXPRESSION_TAB = /\t/g;
EXPRESSION_SYMBOL_FOR_NEW_LINE = /\u2424/g;
EXPRESSION_NO_BREAK_SPACE = /\u00a0/g;

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

/**
 * Clean a string in preperation of parsing.
 *
 * @param {string} value
 * @return {string}
 */
function clean(value) {
    return String(value)
        .replace(EXPRESSION_LINE_BREAKS, '\n')
        .replace(EXPRESSION_TAB, '        ')
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
 * Expose `trim` methods.
 */

exports.trimLeft = trimLeft;
exports.trimRight = trimRight;

/*
 * Expose `clean`.
 */

exports.clean = clean;
