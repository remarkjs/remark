'use strict';

/* eslint-disable no-cond-assign */

var fs, fixtures, mdast, fixtureCount, optionsMap, fixtureSize;

mdast = require('..');
fs = require('fs');
fixtures = {};

optionsMap = {
    'gfm' : ['gfm', true],
    'nogfm' : ['gfm', false],
    'tables' : ['tables', true],
    'notables' : ['tables', false],
    'breaks' : ['breaks', true],
    'nobreaks' : ['breaks', false],
    'pedantic' : ['pedantic', true],
    'nopedantic' : ['pedantic', false],
    'smartlists' : ['smartlists', true],
    'nosmartlists' : ['smartlists', false]
};

fixtureSize = 0;

fs.readdirSync('spec/input').forEach(function (filepath) {
    var options, filename, flag, index;

    if (filepath.indexOf('.') === 0) {
        return;
    }

    filename = filepath.split('.');
    filename.pop();

    if (filename.length > 1) {
        index = 0;
        options = {};

        while (filename[++index]) {
            flag = optionsMap[filename[index]];
            options[flag[0]] = flag[1];
        }
    }

    filename = filename.join('.');
    filepath = 'spec/input/' + filepath;
    fixtureSize += fs.statSync(filepath).size;

    fixtures[filename] = {
        'value' : fs.readFileSync(filepath, 'utf-8'),
        'options' : options
    };
});

function forEveryFixture(callback) {
    var filename;

    for (filename in fixtures) {
        callback(fixtures[filename].value, fixtures[filename].options);
    }
}

fixtureCount = 0;

forEveryFixture(function () {
    fixtureCount++;
});

fixtureSize = Math.round((fixtureSize / 1024) * fixtureCount);

suite(
    'benchmarks * ' + fixtureCount + ' fixtures (total: ' + fixtureSize +
    'Kb markdown)', function () {
        bench('mdast -- this module', function () {
            forEveryFixture(function (value, options) {
                mdast(value, options);
            });
        });
    }
);
