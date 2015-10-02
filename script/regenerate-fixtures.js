'use strict';

/* eslint-env node */

var fs = require('fs');
var mdast = require('..');
var fixtures = require('../test/fixtures.js');

fixtures.forEach(function (fixture) {
    var input = fixture.input;
    var name = fixture.name;
    var mapping = fixture.mapping;

    Object.keys(mapping).forEach(function (key) {
        var filename = name + (key ? '.' + key : key) + '.json';
        var result = mdast.parse(input, fixture.possibilities[key]);

        result = JSON.stringify(result, null, 2) + '\n';

        fs.writeFileSync('test/tree/' + filename, result);
    });
});
