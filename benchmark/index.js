'use strict';

/* eslint-disable no-cond-assign */

var mdast, fixtures, fixtureSize;

mdast = require('..');
fixtures = require('../spec/fixtures.js');

fixtureSize = 0;

fixtures.forEach(function (fixture) {
    fixtureSize += fixture.size;
});

console.log(fixtureSize);

fixtureSize = Math.round(fixtureSize / 1024);

suite(
    'benchmarks * ' + fixtures.length + ' fixtures (total: ' + fixtureSize +
    'Kb markdown)', function () {
        bench('mdast -- this module', function () {
            fixtures.forEach(function (fixture) {
                mdast(fixture.input, fixture.options);
            });
        });
    }
);
