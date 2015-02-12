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

var fixtureSize = fixtures.reduce(sum, 0) / 1024;

/*
 * Benchmarks.
 */

suite(
    'benchmarks * ' + fixtures.length + ' fixtures (total: ' + fixtureSize +
    'Kb markdown)', function () {
        bench('mdast.parse', function () {
            fixtures.forEach(function (fixture) {
                fixture.output = mdast.parse(fixture.input, fixture.options);
            });
        });

        bench('mdast.stringify', function () {
            fixtures.forEach(function (fixture) {
                mdast.stringify(fixture.output);
            });
        });
    }
);
