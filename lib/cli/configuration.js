/**
 * @author Titus Wormer
 * @copyright 2015 Titus Wormer
 * @license MIT
 * @module mdast:cli:configuration
 * @fileoverview Find mdast rc files.
 */

'use strict';

/*
 * Dependencies.
 */

var fs = require('fs');
var path = require('path');
var debug = require('debug')('mdast:cli:configuration');
var home = require('user-home');
var extend = require('extend.js');
var defaults = require('../defaults');
var Finder = require('./finder');

/*
 * Constants.
 */

var RC_NAME = '.mdastrc';
var PLUGIN_KEY = 'plugins';
var PACKAGE_NAME = 'package.json';
var PACKAGE_FIELD = 'mdastConfig';
var PERSONAL_CONFIGURATION = home ? path.join(home, RC_NAME) : null;

/*
 * Methods.
 */

var read = fs.readFileSync;
var exists = fs.existsSync;
var has = Object.prototype.hasOwnProperty;
var concat = Array.prototype.concat;

/*
 * Set-up.
 */

var base = {
    'settings': {}
};

extend(base.settings, defaults.parse);
extend(base.settings, defaults.stringify);

/**
 * Merge two configurations, `configuration` into
 * `target`.
 *
 * @example
 *   var target = {};
 *   merge(target, current);
 *
 * @param {Object} target - Configuration to merge into.
 * @param {Object} configuration - Configuration to merge from.
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
                    result = {};

                    target[key] = result;
                }

                if ('length' in value) {
                    index = -1;
                    length = value.length;

                    while (++index < length) {
                        if (!(value[index] in result)) {
                            result[value[index]] = null;
                        }
                    }
                } else {
                    target[key] = merge(result || {}, value);
                }
            } else if (typeof value === 'object' && value !== null) {
                if ('length' in value) {
                    target[key] = concat.apply(value);
                } else {
                    target[key] = merge(result || {}, value);
                }
            } else if (value !== undefined) {
                target[key] = value;
            }
        }
    }

    return target;
}

/**
 * Parse a JSON configuration object from a file.
 *
 * @example
 *   var rawConfig = load('package.json');
 *
 * @throws {Error} - Throws when `filePath` is not found.
 * @param {string} filePath - File location.
 * @return {Object} - Parsed JSON.
 */
function load(filePath) {
    var configuration = {};

    if (filePath) {
        try {
            configuration = JSON.parse(read(filePath, 'utf8')) || {};
        } catch (exception) {
            exception.message = 'Cannot read configuration file: ' +
                filePath + '\n' + exception.message;

            throw exception;
        }
    }

    return configuration;
}

/**
 * Get personal configuration object from `~`.
 *
 * @example
 *   var config = getUserConfiguration();
 *
 * @return {Object} - Parsed JSON.
 */
function getUserConfiguration() {
    var configuration = {};

    if (PERSONAL_CONFIGURATION && exists(PERSONAL_CONFIGURATION)) {
        configuration = load(PERSONAL_CONFIGURATION);
    }

    return configuration;
}

/**
 * Get a local configuration object, by walking from
 * `directory` upwards and mergin all configurations.
 * If no configuration was found by walking upwards, the
 * current user's config (at `~`) is used.
 *
 * @example
 *   var configuration = new Configuration();
 *   var config = getLocalConfiguration(configuration, '~/bar');
 *
 * @param {Configuration} context - Configuration object to use.
 * @param {string} directory - Location to search.
 * @return {Object} - Settings object.
 */
function getLocalConfiguration(context, directory) {
    var files = context.finder.find(directory);
    var configuration = {};
    var index = files.length;
    var file;
    var local;
    var found;

    while (index--) {
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
 * @example
 *   var configuration = new Configuration();
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

    self.cwd = settings.cwd || process.cwd();

    self.settings = settings.settings || {};
    self.plugins = settings.plugins || {};
    self.output = settings.output;
    self.detectRC = settings.detectRC;

    if (file) {
        debug('Using command line configuration `' + file + '`');

        cliConfiguration = load(path.resolve(self.cwd, file));
    }

    self.cliConfiguration = cliConfiguration;

    self.finder = new Finder([RC_NAME, PACKAGE_NAME], self.cwd);
}

/**
 * Defaults.
 *
 * @type {Object} - Default settings.
 */
Configuration.prototype.base = base;

/**
 * Build a configuration object.
 *
 * @example
 *   var config = new Configuration().getConfiguration('~/foo');
 *
 * @param {string} filePath - File location.
 * @return {Object} - Settings object.
 */
Configuration.prototype.getConfiguration = function (filePath) {
    var self = this;
    var directory = filePath ? path.dirname(filePath) : self.cwd;
    var configuration = self.cache[directory];

    debug('Constructing configuration for `' + (filePath || self.cwd) + '`');

    if (!configuration) {
        configuration = {};

        merge(configuration, self.base);

        if (!self.detectRC) {
            debug('Ignoring .rc files');
        } else {
            merge(configuration, getLocalConfiguration(self, directory));
        }

        merge(configuration, self.cliConfiguration);

        merge(configuration, {
            'settings': self.settings,
            'plugins': self.plugins,
            'output': self.output
        });

        self.cache[directory] = configuration;
    } else {
        debug('Using configuration from cache');
    }

    return configuration;
};

/*
 * Expose.
 */

module.exports = Configuration;
