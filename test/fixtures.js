'use strict';

/* eslint-env node */

/*
 * Dependencies.
 */

var fs = require('fs');
var path = require('path');
var camelcase = require('camelcase');
var clone = require('clone');
var defaults = require('../lib/defaults.js');

/*
 * Methods.
 */

var read = fs.readFileSync;
var exists = fs.existsSync;
var stat = fs.statSync;
var join = path.join;

var typeMap = {
    'true': 'all',
    'false': 'physical'
};

var TYPE = typeMap[Boolean(process.env.TEST_EXTENDED)];

/*
 * Defaults.
 */

var keys = Object.keys(defaults.parse);

/*
 * Create a single source with all parse options turned
 * to their default values.
 */

var sources = [keys.join('.')];

/*
 * Create all possible `parse` values.
 */

keys.forEach(function (key) {
    sources = [].concat.apply(sources, sources.map(function (source) {
        return source.split('.').map(function (subkey) {
            return subkey === key ? 'no' + key : subkey;
        }).join('.');
    }));
});

/**
 * Parse a `string` `value` into a javascript value.
 *
 * @param {string} key
 * @param {string} value
 * @return {Object}
 */
function augment(key, value) {
    if (!value) {
        value = key.slice(0, 2) !== 'no';

        if (!value) {
            key = key.slice(2);
        }
    }

    key = camelcase(key);

    if (augment.hasOwnProperty(key)) {
        value = augment[key](value);
    }

    return {
        'key': key,
        'value': value
    };
}

augment.ruleRepetition = Number;

/**
 * Parse options from a filename.
 *
 * @param {string} name
 * @return {Object}
 */
function parseOptions(name) {
    var index = -1;
    var parts = name.split('.');
    var results = [];
    var length = parts.length;
    var options = clone(defaults);
    var part;
    var augmented;
    var key;
    var value;

    while (++index < length) {
        part = parts[index].split('=');
        augmented = augment(part[0], part.slice(1).join('='));
        key = augmented.key;
        value = augmented.value;

        if (key === 'output') {
            options[key] = value;
        } else {
            if (key in defaults.parse && value !== options.parse[key]) {
                options.parse[key] = value;

                results.push(parts[index]);
            }

            if (
                key in defaults.stringify &&
                value !== options.stringify[key]
            ) {
                options.stringify[key] = value;

                // Protect common options from `parse` and `stringify` from
                // appearing twice.
                if (results.indexOf(parts[index]) < 0) {
                    results.push(parts[index]);
                }
            }
        }
    }

    options.source = results.join('.');

    return options;
}

/*
 * Cache all possible options.
 *
 * Virtual options are generated when no fixtures exist,
 * whereas physical options are only used whn a file
 * exists.
 */

var virtual = {};
var physical = {};
var all = {};

sources.forEach(function (source) {
    var options = parseOptions(source);

    source = options.source;

    /*
     * Breaks are such a tiny feature, but almost
     * certainly result in duplicate fixtures,
     * that I've ignored it for the virtual
     * options.
     */

    if (options.parse.breaks !== defaults.parse.breaks) {
        physical[source] = options.parse;
    } else {
        virtual[source] = options.parse;
    }

    all[source] = options.parse;
});

/**
 * Get the difference between two objects.  Greatly
 * simplified because `options` and `compate` consist
 * solely of booleans, and all properties exist in
 * both.
 *
 * @param {Object} options
 * @param {Object} compare
 * @return {number}
 */
function difference(options, compare) {
    var count = 0;

    Object.keys(options).forEach(function (key) {
        if (options[key] !== compare[key]) {
            count++;
        }
    });

    return count;
}

/**
 * Find the closest fixture for a `source` in all
 * `fixtures`.  Returns a key of a fixture.
 *
 * @param {string} source
 * @param {Object} fixtures
 * @param {Object} options
 * @return {string}
 */
function resolveFixture(source, fixtures, options) {
    var minimum = Infinity;
    var resolved;
    var offset;

    Object.keys(fixtures).forEach(function (key) {
        offset = difference(options[source], options[key]);

        if (offset < minimum) {
            minimum = offset;
            resolved = key;
        }
    });

    return resolved;
}

/**
 * Find the closest fixture for all `options`.  Returns
 * an object mapping options sources to fixture names.
 *
 * @param {Object} fixtures
 * @param {Object} options
 * @return {Object}
 */
function resolveFixtures(fixtures, options) {
    var resolved = {};

    Object.keys(options).forEach(function (source) {
        resolved[source] = resolveFixture(source, fixtures, options);
    });

    return resolved;
}

/*
 * Gather fixtures.
 */

var tests = fs.readdirSync(join(__dirname, 'input'))
    .filter(function (filepath) {
        return filepath.indexOf('.') !== 0;
    }).map(function (filepath) {
        var filename = filepath.split('.').slice(0, -1);
        var name = filename.join('.');
        var settings = parseOptions(name);
        var input = read(join(__dirname, 'input', filepath), 'utf-8');
        var fixtures = {};
        var possibilities = {};
        var resolved;

        Object.keys(all).forEach(function (source) {
            var treename;
            var tree;

            treename = [
                filename.join('.'),
                source ? '.' + source : '',
                '.json'
            ].join('');

            tree = join(__dirname, 'tree', treename);

            if (exists(tree)) {
                fixtures[source] = JSON.parse(read(tree, 'utf-8'));

                possibilities[source] = all[source];
            } else if (
                TYPE === typeMap.true &&
                source in virtual &&
                !settings.output
            ) {
                possibilities[source] = all[source];
            }
        });

        if (!Object.keys(fixtures).length) {
            throw new Error('Missing fixture for `' + name + '`');
        }

        resolved = resolveFixtures(fixtures, possibilities);

        if (settings.output) {
            if (Object.keys(fixtures).length > 1) {
                throw new Error(
                    'Multiple fixtures for output `' + name + '`'
                );
            }
        }

        return {
            'input': input,
            'possibilities': possibilities,
            'mapping': resolved,
            'trees': fixtures,
            'stringify': settings.stringify,
            'output': settings.output,
            'size': stat(join(__dirname, 'input', filepath)).size,
            'name': name
        };
    }
);

/*
 * Expose tests.
 */

module.exports = tests;
