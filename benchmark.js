'use strict';

/*
 * Dependencies.
 */

var mdast = require('./');
var fixtures = require('./test/fixtures.js');

/**
 * Sum fixture objects.
 *
 * @param {number} a
 * @param {Object} b
 * @return {number}
 */
function sum(a, b) {
    return a + b.size;
}

var size = (fixtures.reduce(sum, 0) / 1024).toFixed(2);

var count = fixtures.length;

/**
 * Nicely prints options in flag format.
 *
 * @param {Object} options
 * @return {string}
 */
function stringifyOptions(options) {
    var values;

    values = Object.keys(options).map(function (key) {
        return '`' + key + ': ' + options[key] + '`';
    });

    values[values.length - 1] = 'and ' + values[values.length - 1];

    return values.join(', ');
}

/**
 * Runs a benchmark w/ options.
 *
 * @param {Object} options
 */
function benchWithOptions(options) {
    var flags = stringifyOptions(options);

    bench('mdast.parse w/ ' + flags, function () {
        fixtures.forEach(function (fixture) {
            fixture.output = mdast.parse(fixture.input, fixture.options);
        });
    });

    bench('mdast.stringify w/ ' + flags, function () {
        fixtures.forEach(function (fixture) {
            mdast.stringify(fixture.output);
        });
    });
}

/*
 * Benchmarks.
 */

suite(count + ' fixtures (total: ' + size + 'Kb)', function () {
    benchWithOptions({
        'gfm': true,
        'yaml': true
    });

    benchWithOptions({
        'gfm': false,
        'yaml': false
    });

    benchWithOptions({
        'gfm': true,
        'yaml': true,
        'commonmark': true
    });
});
