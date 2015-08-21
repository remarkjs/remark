/**
 * @author Titus Wormer
 * @copyright 2015 Titus Wormer
 * @license MIT
 * @module mdast:cli:file-set-pipeline
 * @fileoverview Process a collection of files.
 */

'use strict';

/*
 * Dependencies.
 */

var ware = require('ware');
var configure = require('./configure');
var traverse = require('./traverse');
var stdin = require('./stdin');
var transform = require('./transform');
var log = require('./log');

/*
 * Middleware.
 */

var fileSetPipeline = ware()
    .use(configure)
    .use(traverse)
    .use(stdin)
    .use(transform)
    .use(log);

/*
 * Expose.
 */

module.exports = fileSetPipeline;
