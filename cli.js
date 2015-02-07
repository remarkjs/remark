#!/usr/bin/env node
'use strict';

/*
 * Dependencies.
 */

var mdast,
    fs,
    path,
    pack;

mdast = require('./');
fs = require('fs');
path = require('path');
pack = require('./package.json');

/*
 * Cached methods.
 */

var resolve,
    exists;

resolve = path.resolve;
exists = fs.existsSync;

/*
 * Current working directory.
 */

var cwd;

cwd = process.cwd();

/*
 * Detect if a value is expected to be piped in.
 */

var expextPipeIn;

expextPipeIn = !process.stdin.isTTY;

/*
 * Arguments.
 */

var argv;

argv = process.argv.slice(2);

/*
 * Command.
 */

var command;

command = Object.keys(pack.bin)[0];

/**
 * Help.
 *
 * @return {string}
 */
function help() {
    return [
        '',
        'Usage: ' + command + ' [options] file',
        '',
        pack.description,
        '',
        'Options:',
        '',
        '  -h, --help            output usage information',
        '  -v, --version         output version number',
        '  -a, --ast             output AST information',
        '      --options         output available settings',
        '  -o, --output <path>   specify output location',
        '  -O, --option <option> specify settings',
        '  -u, --use    <plugin> specify plugins',
        '',
        'Usage:',
        '',
        '# Note that bash does not allow reading and writing to the',
        '# same file through pipes',
        '',
        '# Pass `Readme.md` through mdast',
        '$ ' + command + ' Readme.md -o Readme.md',
        '',
        '# Pass stdin through mdast, with options, to stdout',
        '$ cat Readme.md | ' + command + ' --option ' +
            '"setext, bullet: *" > Readme-new.md',
        '',
        '# Use an npm module',
        '$ npm install some-plugin',
        '$ ' + command + ' --use some-plugin History.md > History-new.md'
    ].join('\n  ') + '\n';
}

/**
 * Fail w/ `exception`.
 *
 * @param {null|string|Error} exception
 */
function fail(exception) {
    if (!exception) {
        exception = help();
    }

    process.stderr.write((exception.stack || exception) + '\n');

    process.exit(1);
}

/**
 * Log available options.
 *
 * @return {string}
 */
function getOptions() {
    return [
        '',
        '# Options',
        '',
        'Both camel- and dash-cased options are allowed.',
        '',
        '## [Parse](https://github.com/wooorm/mdast#mdastparsevalue-options)',
        '',
        '-  `gfm` (boolean, default: true)',
        '-  `tables` (boolean, default: true)',
        '-  `pedantic` (boolean, default: false)',
        '-  `breaks` (boolean, default: false)',
        '-  `footnotes` (boolean, default: false)',
        '',
        '## [Stringify](https://github.com/wooorm/mdast#' +
            'mdaststringifyast-options)',
        '',
        '-  `setext` (boolean, default: false)',
        '-  `close-atx` (boolean, default: false)',
        '-  `loose-table` (boolean, default: false)',
        '-  `spaced-table` (boolean, default: true)',
        '-  `reference-links` (boolean, default: false)',
        '-  `reference-footnotes` (boolean, default: true)',
        '-  `fences` (boolean, default: false)',
        '-  `bullet` ("-", "*", or "+", default: "-")',
        '-  `rule` ("-", "*", or "_", default: "*")',
        '-  `rule-repetition` (number, default: 3)',
        '-  `rule-spaces` (boolean, default: false)',
        '-  `strong` ("_", or "*", default: "*")',
        '-  `emphasis` ("_", or "*", default: "_")',
        '',
        'Settings are specified as follows:',
        '',
        '```',
        '$ ' + command + ' --option "some-option:some-value"',
        '# Multiple options:',
        '$ ' + command + ' --option "emphasis:*,strong:_"',
        '```'
    ].join('\n  ') + '\n';
}

/**
 * Transform a dash-cased string to camel-cased.
 *
 * @param {string} value
 * @return {string}
 */
function camelCase(value) {
    return value.toLowerCase().replace(/-([a-z])/gi, function ($0, $1) {
        return $1.toUpperCase();
    });
}

/*
 * Program.
 */

var index,
    expectOption,
    expectPlugin,
    expectOutput,
    expectAST,
    plugins,
    options,
    output,
    files;

plugins = [];

/**
 * Run the program.
 *
 * @param {string} value
 */
function program(value) {
    var doc,
        parser,
        local,
    fn;

    if (!value.length) {
        fail();
    } else {
        parser = mdast;

        plugins.forEach(function (plugin) {
            local = resolve(cwd, plugin);

            if (exists(local) || exists(local + '.js')) {
                fn = require(local);
            } else {
                try {
                    fn = require(resolve(cwd, 'node_modules', plugin));
                } catch (exception) {
                    fail(exception);
                }
            }

            parser = parser.use(fn);
        });

        doc = parser.parse(value, options);

        if (expectAST) {
            doc = JSON.stringify(doc, null, 2);
        } else {
            doc = mdast.stringify(doc, options);
        }

        if (output) {
            fs.writeFile(output, doc, function (exception) {
                if (exception) {
                    fail(exception);
                }
            });
        } else {
            process.stdout.write(doc);
        }
    }
}

if (
    argv.indexOf('--help') !== -1 ||
    argv.indexOf('-h') !== -1
) {
    console.log(help());
} else if (
    argv.indexOf('--version') !== -1 ||
    argv.indexOf('-v') !== -1
) {
    console.log(pack.version);
} else if (
    argv.indexOf('--options') !== -1
) {
    console.log(getOptions());
} else {
    index = argv.indexOf('--ast');

    if (index === -1) {
        index = argv.indexOf('-a');
    }

    if (index !== -1) {
        expectAST = true;
        argv.splice(index, 1);
    }

    files = [];
    options = {};

    argv.forEach(function (argument) {
        if (argument === '--option' || argument === '-O') {
            expectOption = true;
        } else if (argument === '--use' || argument === '-u') {
            expectPlugin = true;
        } else if (argument === '--output' || argument === '-o') {
            expectOutput = true;
        } else if (expectPlugin) {
            argument.split(',').forEach(function (plugin) {
                plugins.push(plugin);
            });

            expectPlugin = false;
        } else if (expectOutput) {
            output = argument;

            expectOutput = false;
        } else if (expectOption) {
            argument
                .split(',')
                .map(function (value) {
                    var values;

                    values = value.split(':');

                    return [
                        camelCase(values.shift().trim()),
                        values.join(':').trim()
                    ];
                })
                .map(function (values) {
                    var value;

                    value = values[1];

                    if (value === 'true') {
                        value = true;
                    } else if (value === 'false') {
                        value = false;
                    } else if (value === '') {
                        value = true;
                    } else if (Number(value) === Number(value)) {
                        value = Number(value);
                    }

                    values[1] = value;

                    return values;
                })
                .forEach(function (values) {
                    options[values[0]] = values[1];
                });

            expectOption = false;
        } else {
            files.push(argument);
        }
    });

    if (expectOption || expectPlugin || expectOutput) {
        fail();
    } else if (!expextPipeIn && !files.length) {
        if (output) {
            files.push(output);
        } else {
            fail();
        }
    } else if (
        (expextPipeIn && files.length) ||
        (!expextPipeIn && files.length !== 1)
    ) {
        fail('mdast currently expects one file.');
    }

    if (files[0]) {
        fs.readFile(files[0], function (exception, content) {
            if (exception) {
                fail(exception);
            }

            program(content.toString());
        });
    } else {
        process.stdin.resume();

        process.stdin.setEncoding('utf8');

        process.stdin.on('data', program);
    }
}
