'use strict';

var fs, path, optionsMap, fixtures;

fs = require('fs');
path = require('path');

optionsMap = {
    'gfm' : ['gfm', true],
    'nogfm' : ['gfm', false],
    'tables' : ['tables', true],
    'notables' : ['tables', false],
    'footnotes' : ['footnotes', true],
    'nofootnotes' : ['footnotes', false],
    'breaks' : ['breaks', true],
    'nobreaks' : ['breaks', false],
    'pedantic' : ['pedantic', true],
    'nopedantic' : ['pedantic', false]
};

fixtures = fs.readdirSync(path.join(__dirname, 'input'))
    .filter(function (filepath) {
        return filepath.indexOf('.') !== 0;
    }).map(function (filepath) {
        var options, filename, input, tree, flag, index, size;

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

        size = fs.statSync(path.join(__dirname, 'input', filepath)).size;

        return {
            'input' : input,
            'tree' : tree,
            'options' : options,
            'size' : size,
            'name' : filename
        };
    }
);

module.exports = fixtures;
