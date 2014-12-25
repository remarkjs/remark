'use strict';

/*
 * Dependencies.
 */

var fs,
    path;

fs = require('fs');
path = require('path');

/*
 * Options.
 */

var optionsMap;

optionsMap = {
    'gfm': ['gfm', true],
    'nogfm': ['gfm', false],
    'tables': ['tables', true],
    'notables': ['tables', false],
    'footnotes': ['footnotes', true],
    'nofootnotes': ['footnotes', false],
    'breaks': ['breaks', true],
    'nobreaks': ['breaks', false],
    'pedantic': ['pedantic', true],
    'nopedantic': ['pedantic', false],
    'output': ['output', true],
    'nooutput': ['output', false]
};

/*
 * Gather fixtures.
 */

var fixtures;

fixtures = fs.readdirSync(path.join(__dirname, 'input'))
    .filter(function (filepath) {
        return filepath.indexOf('.') !== 0;
    }).map(function (filepath) {
        var options,
            filename,
            input,
            tree,
            output,
            flag,
            index,
            size;

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

        input = fs.readFileSync(
            path.join(__dirname, 'input', filepath), 'utf-8'
        );

        tree = fs.readFileSync(
            path.join(__dirname, 'tree', filename + '.json'), 'utf-8'
        );

        output = Boolean(options && options.output);

        size = fs.statSync(path.join(__dirname, 'input', filepath)).size;

        return {
            'input': input,
            'tree': tree,
            'output': output,
            'options': options,
            'size': size,
            'name': filename
        };
    }
);

/*
 * Expose fixtures.
 */

module.exports = fixtures;
