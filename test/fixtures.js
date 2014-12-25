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
    'gfm': 'gfm',
    'tables': 'tables',
    'footnotes': 'footnotes',
    'breaks': 'breaks',
    'pedantic': 'pedantic',
    'setex': 'preferSetextHeadings',
    'output': 'output',
    'bullet': 'bullet'
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
            option,
            value,
            index,
            size;

        filename = filepath.split('.');
        filename.pop();

        if (filename.length > 1) {
            index = 0;
            options = {};

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

                options[option] = value;
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
