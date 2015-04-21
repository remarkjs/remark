'use strict';

/*
 * Methods.
 */

var has = Object.prototype.hasOwnProperty;

/*
 * Expressions.
 */

var WHITE_SPACE_FINAL = /\s+$/;
var NEW_LINES_FINAL = /\n+$/;
var WHITE_SPACE_INITIAL = /^\s+/;
var EXPRESSION_LINE_BREAKS = /\r\n|\r/g;
var EXPRESSION_SYMBOL_FOR_NEW_LINE = /\u2424/g;
var WHITE_SPACE_COLLAPSABLE = /[ \t\n]+/g;
var EXPRESSION_BOM = /^\ufeff/;

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
        if (has.call(context, key)) {
            target[key] = context[key];
        }
    }

    return target;
}

/**
 * Shallow clone `context`.
 *
 * @return {Object|Array} context
 * @return {Object|Array}
 */
function clone(context) {
    if ('concat' in context) {
        return context.concat();
    }

    return copy({}, context);
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
        'for setting `' + name + '`'
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

    if (typeof value !== 'number' || value !== value) {
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
 * @param {boolean} def
 * @param {Object} map
 */
function validateString(obj, name, def, map) {
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
    return String(value).replace(NEW_LINES_FINAL, '');
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
 * Remove initial and final white space from `value`.
 *
 * @param {string} value
 * @return {string}
 */
function trim(value) {
    return trimLeft(trimRight(value));
}

/**
 * Collapse white space.
 *
 * @param {string} value
 * @return {string}
 */
function collapse(value) {
    return String(value).replace(WHITE_SPACE_COLLAPSABLE, ' ');
}

/**
 * Clean a string in preperation of parsing.
 *
 * @param {string} value
 * @return {string}
 */
function clean(value) {
    return String(value)
        .replace(EXPRESSION_BOM, '')
        .replace(EXPRESSION_LINE_BREAKS, '\n')
        .replace(EXPRESSION_SYMBOL_FOR_NEW_LINE, '\n');
}

/**
 * Normalize an reference identifier.  Collapses
 * multiple white space characters into a single space,
 * and removes casing.
 *
 * @param {string} value
 * @return {string}
 */
function normalizeReference(value) {
    return collapse(value).toLowerCase();
}

/**
 * Count how many characters `character` occur in `value`.
 *
 * @param {string} value
 * @param {string} character
 * @return {number}
 */
function countCharacter(value, character) {
    var index = -1;
    var length = value.length;
    var count = 0;

    while (++index < length) {
        if (value.charAt(index) === character) {
            count++;
        }
    }

    return count;
}

/**
 * Helper to get the keys in an object.
 *
 * @param {Object} object
 * @return {Array.<string>}
 */
function keys(object) {
    var results = [];
    var key;

    for (key in object) {
        /* istanbul ignore else */
        if (has.call(object, key)) {
            results.push(key);
        }
    }

    return results;
}

/**
 * Create an empty object.
 *
 * @return {Object}
 */
function objectObject() {
    return {};
}

/*
 * Break coverage.
 */

objectObject();

/**
 * Create an object without prototype.
 *
 * @return {Object}
 */
function objectNull() {
    return Object.create(null);
}

var PROTO = '__proto__';
var ESCAPED_PROTO = PROTO + '%';

/**
 * Factory to construct an escaper or descaper.
 *
 * @param {string} value
 * @param {string} alt
 * @return {function(string): string}
 */
function scapeFactory(value, alt) {
    var length = value.length;

    return function (key) {
        return key.indexOf(value) === 0 ? alt + key.slice(length) : key;
    };
}

/*
 * Escape a key for use in an map.
 *
 * @see http://www.2ality.com/2012/10/proto.html
 *
 * @param {string}
 * @return {string}
 */
var escapeKey = scapeFactory(PROTO, ESCAPED_PROTO);

/*
 * Unescape a key from use in an map.
 *
 * @see http://www.2ality.com/2012/10/proto.html
 *
 * @param {string}
 * @return {string}
 */
var unescapeKey = scapeFactory(ESCAPED_PROTO, PROTO);

/*
 * Expose `validate`.
 */

exports.validate = {
    'boolean': validateBoolean,
    'string': validateString,
    'number': validateNumber
};

/*
 * Expose.
 */

exports.trim = trim;
exports.trimLeft = trimLeft;
exports.trimRight = trimRight;
exports.trimRightLines = trimRightLines;
exports.collapse = collapse;
exports.normalizeReference = normalizeReference;
exports.clean = clean;
exports.raise = raise;
exports.copy = copy;
exports.clone = clone;
exports.countCharacter = countCharacter;
exports.keys = keys;
exports.escapeKey = escapeKey;
exports.unescapeKey = unescapeKey;

/* istanbul ignore else */
if ('create' in Object) {
    exports.create = objectNull;
} else {
    exports.create = objectObject;
}
