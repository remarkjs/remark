'use strict';

/*
 * Dependencies.
 */

var fs = require('fs');
var path = require('path');
var debug = require('debug');
var home = require('user-home');
var defaults = require('../defaults');
var utilities = require('../utilities');
var Finder = require('./finder');

/*
 * Constants.
 */

var RC_NAME = '.mdastrc';
var PLUGIN_KEY = 'plugins';
var PACKAGE_NAME = 'package.json';
var PACKAGE_FIELD = 'mdastConfig';
var PERSONAL_CONFIGURATION = home ? path.join(home, RC_NAME) : null;
var cwd = process.cwd();

/*
 * Methods.
 */

var read = fs.readFileSync;
var exists = fs.existsSync;
var has = Object.prototype.hasOwnProperty;

/*
 * Set-up.
 */

debug = debug('mdast:configuration');

var base = {
    'settings': {}
};

utilities.copy(base.settings, defaults.parse);
utilities.copy(base.settings, defaults.stringify);

/**
 * Merge two configurations, `configuration` into
 * `target`.
 *
 * @param {Object} target
 * @param {Object} configuration
 * @return {Object} - `target`.
 */
function merge(target, configuration) {
    var key;
    var value;
    var index;
    var length;
    var result;

    for (key in configuration) {
        if (has.call(configuration, key)) {
            value = configuration[key];
            result = target[key];

            if (key === PLUGIN_KEY) {
                if (!result) {
                    result = [];

                    target[key] = result;
                }

                index = -1;
                length = value.length;

                while (++index < length) {
                    if (result.indexOf(value[index]) === -1) {
                        result.push(value[index]);
                    }
                }
            } else if (typeof value === 'object' && value !== null) {
                target[key] = merge(result || {}, value);
            } else {
                target[key] = value;
            }
        }
    }

    return target;
}

/**
 * Parse a JSON configuration from a file.
 *
 * @param {string} filepath
 * @return {Object}
 */
function load(filepath) {
    var configuration = {};

    if (filepath) {
        try {
            configuration = JSON.parse(read(filepath, 'utf8')) || {};
        } catch (exception) {
            exception.message = 'Cannot read configuration file: ' +
                filepath + '\n' + 'Error: ' + exception.message;

            throw exception;
        }
    }

    return configuration;
}

/**
 * Get personal configuration object from `~`.
 *
 * @return {Object}
 */
function getUserConfiguration() {
    var configuration = {};

    if (PERSONAL_CONFIGURATION && exists(PERSONAL_CONFIGURATION)) {
        configuration = load(PERSONAL_CONFIGURATION);
    }

    return configuration;
}

/**
 * Get a local configuration object.
 *
 * @param {Configuration} context
 * @param {string} directory
 * @return {Object}
 */
function getLocalConfiguration(context, directory) {
    var files = context.finder.find(directory);
    var configuration = {};
    var length = files.length;
    var index = -1;
    var file;
    var local;
    var found;

    while (++index < length) {
        file = files[index];

        local = load(file);

        if (path.basename(file) === PACKAGE_NAME) {
            local = local[PACKAGE_FIELD] || {};
        }

        found = true;

        debug('Using ' + file);

        merge(configuration, local);
    }

    if (!found) {
        debug('Using personal configuration');

        merge(configuration, getUserConfiguration());
    }

    return configuration;
}

/**
 * Configuration.
 *
 * @constructor
 * @class Configuration
 * @param {Object} options - Options to be passed in.
 */
function Configuration(options) {
    var self = this;
    var settings = options || {};
    var file = settings.file;
    var cliConfiguration = {};

    self.cache = {};

    self.settings = settings.settings || {};
    self.plugins = settings.plugins || {};
    self.useRC = settings.useRC;

    if (file) {
        debug('Using command line configuration `' + file + '`');

        cliConfiguration = load(path.resolve(cwd, file));
    }

    self.cliConfiguration = cliConfiguration;

    self.finder = new Finder([RC_NAME, PACKAGE_NAME]);
}

/*
 * Defaults.
 */

Configuration.prototype.base = base;

/**
 * Build a configuration object.
 *
 * @param {string} filepath
 * @return {Object}
 */
Configuration.prototype.getConfiguration = function (filepath) {
    var self = this;
    var directory = filepath ? path.dirname(filepath) : cwd;
    var configuration = self.cache[directory];

    debug('Constructing configuration for `' + (filepath || cwd) + '`');

    if (!configuration) {
        configuration = {};

        merge(configuration, self.base);

        if (!self.useRC) {
            debug('Ignoring .rc files');
        } else {
            merge(configuration, getLocalConfiguration(self, directory));
        }

        merge(configuration, self.cliConfiguration);

        merge(configuration, {
            'settings': self.settings,
            'plugins': self.plugins
        });

        self.cache[directory] = configuration;
    } else {
        debug('Using configuration from cache');
    }

    return configuration;
};

module.exports = Configuration;
