'use strict';

/* eslint-disable no-cond-assign */

var mdast, fixtures, fixtureSize;

mdast = require('..');
fixtures = require('../spec/fixtures.js');

fixtureSize = 0;

fixtures.forEach(function (fixture) {
    fixtureSize += fixture.size;
});

fixtureSize = Math.round(fixtureSize / 1024);

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
