/**
 * @author Titus Wormer
 * @copyright 2015 Titus Wormer
 * @license MIT
 * @module mdast:script
 * @fileoverview Regenerate all fixtures according to their
 *   configuration (found in each filename), useful when
 *   the parser is modified to output different syntax trees.
 */

'use strict';

/* eslint-env node */

/*
 * Dependencies.
 */

var fs = require('fs');
var path = require('path');
var mdast = require('..');
var fixtures = require('../test/fixtures.js');

/*
 * Regenerate.
 */

fixtures.forEach(function (fixture) {
    var input = fixture.input;
    var name = fixture.name;
    var mapping = fixture.mapping;

    Object.keys(mapping).forEach(function (key) {
        var filename = name + (key ? '.' + key : key) + '.json';
        var result = mdast.parse(input, fixture.possibilities[key]);

        result = JSON.stringify(result, null, 2) + '\n';

        fs.writeFileSync(path.join('test/tree/', filename), result);
    });
});
