'use strict';

/*
 * Dependencies.
 */

var mdast,
    fixtures;

mdast = require('./');
fixtures = require('./test/fixtures.js');

/*
 * Calculate the fixture size in MB.
 */

var fixtureSize;

fixtureSize = 0;

fixtures.forEach(function (fixture) {
    fixtureSize += fixture.size;
});

fixtureSize = Math.round(fixtureSize / 1024);

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
