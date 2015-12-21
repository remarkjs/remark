/**
 * @author Titus Wormer
 * @copyright 2015 Titus Wormer
 * @license MIT
 * @module mdast:cli:file-set-pipeline
 * @version 2.3.2
 * @fileoverview Process a collection of files.
 */

'use strict';

/* eslint-env node */

/*
 * Dependencies.
 */

var ware = require('ware');
var configure = require('./configure');
var fileSystem = require('./file-system');
var stdin = require('./stdin');
var transform = require('./transform');
var log = require('./log');

/*
 * Middleware.
 */

var fileSetPipeline = ware()
    .use(configure)
    .use(fileSystem)
    .use(stdin)
    .use(transform)
    .use(log);

/*
 * Expose.
 */

module.exports = fileSetPipeline;
