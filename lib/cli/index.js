'use strict';

/*
 * Dependencies.
 */

var path = require('path');
var fs = require('fs');
var debug = require('debug')('mdast');
var concat = require('concat-stream');
var mdast = require('../..');
var Configuration = require('./configuration');
var program = require('./program');

/*
 * Shortcuts.
 */

var exists = fs.existsSync || path.existsSync;
var resolve = path.resolve;
var join = path.join;
var read = fs.readFile;
var write = fs.writeFile;
var stdout = process.stdout;
var stdin = process.stdin;

/*
 * Constants.
 */

var ENCODING = 'utf-8';

var cwd = process.cwd();
var expextPipeIn = !stdin.isTTY;
var seperator = path.sep;

/**
 * Find root of node modules.
 *
 * @return {string}
 */
function findRoot(base) {
    var location = base;
    var parts = base.split(seperator);

    while (!exists(join(location, 'package.json')) && parts.length > 1) {
        parts.pop();

        location = parts.join(seperator);
    }

    return parts.length ? location : base;
}

/*
 * Root.
 */

var root = findRoot(cwd);

debug('Using root: `%s`', root);

/**
 * Find a plugin.
 *
 * @param {string} pathlike
 * @return {Object}
 */
function findPlugin(pathlike) {
    var local = resolve(root, pathlike);
    var npm = resolve(root, 'node_modules', pathlike);
    var current = resolve(cwd, 'node_modules', pathlike);
    var plugin;

    if (exists(local) || exists(local + '.js')) {
        plugin = local;
    } else if (exists(npm)) {
        plugin = npm;
    } else if (exists(current)) {
        plugin = current;
    } else {
        plugin = pathlike;
    }

    debug('Using plugin `%s` at `%s`', pathlike, plugin);

    return require(plugin);
}

/**
 * Process `value`.
 *
 * @param {string} value
 * @param {Configuration} configuration
 * @param {boolean} stringify
 * @param {string?} filename
 */
function run(value, configuration, stringify, filename) {
    var parser = mdast;
    var options = configuration.getConfiguration(filename);
    var plugins;
    var doc;

    debug('Using settings `%j`', options.settings);

    plugins = options.plugins.map(findPlugin);

    debug('Using plug-ins `%j`', options.plugins);

    parser = parser.use(plugins);

    debug('Parsing document');

    doc = parser.parse(value, options.settings);

    if (stringify) {
        doc = parser.stringify(doc, options.settings);
    } else {
        doc = JSON.stringify(doc, null, 2);
    }

    return doc;
}

/**
 * CLI engine.
 *
 * @param {Array.<*>} argv
 * @param {function(Error?)} done
 */
function engine(argv, done) {
    var cli = program.parse(argv);
    var files = cli.args;
    var configuration;

    try {
        configuration = new Configuration({
            'useRC': program.rc,
            'file': cli.config,
            'settings': cli.setting,
            'plugins': cli.use
        });
    } catch (failure) {
        return done(failure);
    }

    if (cli.settings) {
        cli.emit('--settings');

        return done();
    }

    if (!expextPipeIn && !files.length) {
        if (cli.output) {
            debug('Using output `%s` as input', cli.output);

            files.push(cli.output);
        } else {
            cli.outputHelp();

            return done(1);
        }
    }

    if (
        (expextPipeIn && files.length) ||
        (!expextPipeIn && files.length !== 1)
    ) {
        return done(new Error('mdast expects one file'));
    }

    files = files.map(function (filename) {
        return resolve(filename);
    });

    /**
     * Output result.
     *
     * @param {string} doc
     */
    function output(doc) {
        if (cli.output) {
            debug('Writing document to `%s`', cli.output);

            write(cli.output, doc, function (exception) {
                if (exception) {
                    done(exception);
                }
            });
        } else {
            debug('Writing document to standard out');

            stdout.write(doc);
        }
    }

    /**
     * Safely process a document.
     *
     * @param {Error?} exception
     * @param {string?} doc
     */
    function check(exception, doc) {
        if (exception) {
            return done(exception);
        }

        try {
            doc = run(doc, configuration, !cli.ast, files[0]);
        } catch (failure) {
            return done(failure);
        }

        output(doc);
    }

    if (files[0]) {
        debug('Reading from `%s` using encoding `%s`', files[0], ENCODING);

        read(files[0], ENCODING, check);
    } else {
        debug('Reading from stdin', files[0], ENCODING);

        process.stdin.pipe(concat({
            'encoding': 'string'
        }, function (value) {
            check(null, value);
        }));
    }
}

module.exports = engine;
