'use strict';

/*
 * Dependencies.
 */

var fs = require('fs');
var path = require('path');

/*
 * Methods.
 */

var read = fs.readFileSync;
var stat = fs.statSync;
var join = path.join;

/*
 * Options.
 */

var optionsMap;

optionsMap = {
    'gfm': 'gfm',
    'yaml': 'yaml',
    'tables': 'tables',
    'footnotes': 'footnotes',
    'breaks': 'breaks',
    'pedantic': 'pedantic',
    'setext': 'setext',
    'output': 'output',
    'bullet': 'bullet',
    'rule': 'rule',
    'rule-spaces': 'ruleSpaces',
    'rule-repetition': 'ruleRepetition',
    'emphasis': 'emphasis',
    'strong': 'strong',
    'reference-links': 'referenceLinks',
    'reference-footnotes': 'referenceFootnotes',
    'fences': 'fences',
    'fence': 'fence',
    'close-atx': 'closeAtx',
    'loose-table': 'looseTable',
    'spaced-table': 'spacedTable'
};

/*
 * Gather fixtures.
 */

var fixtures;

fixtures = fs.readdirSync(join(__dirname, 'input'))
    .filter(function (filepath) {
        return filepath.indexOf('.') !== 0;
    }).map(function (filepath) {
        var options = {};
        var filename = filepath.split('.').slice(0, -1);
        var name = filename.join('.');
        var input = read(join(__dirname, 'input', filepath), 'utf-8');
        var tree = read(join(__dirname, 'tree', name + '.json'), 'utf-8');
        var size = stat(join(__dirname, 'input', filepath)).size;
        var index = 0;
        var flag;
        var option;
        var value;

        if (filename.length > 1) {
            while (filename[++index]) {
                flag = filename[index];

                if (flag.indexOf('=') !== -1) {
                    option = flag.slice(0, flag.indexOf('='));
                    value = flag.slice(flag.indexOf('=') + 1);
                } else if (optionsMap[flag]) {
                    option = flag;
                    value = true;
                } else if (flag.slice(0, 2) === 'no') {
                    option = flag.slice(2);
                    value = false;
                }

                option = optionsMap[option];

                if (option === 'ruleRepetition') {
                    value = Number(value);
                }

                options[option] = value;
            }
        }

        return {
            'input': input,
            'tree': tree,
            'output': Boolean(options && options.output),
            'options': options,
            'size': size,
            'name': name
        };
    }
);

/*
 * Expose fixtures.
 */

module.exports = fixtures;
