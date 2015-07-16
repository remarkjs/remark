/**
 * @author Titus Wormer
 * @copyright 2015 Titus Wormer. All rights reserved.
 * @module file-pipeline
 * @fileoverview Process a file.
 */

'use strict';

/*
 * Dependencies.
 */

var ware = require('ware');
var read = require('./read');
var configure = require('./configure');
var parse = require('./parse');
var transform = require('./transform');
var queue = require('./queue');
var stringify = require('./stringify');
var stdout = require('./stdout');
var fileSystem = require('./file-system');

/*
 * Middleware.
 */

var filePipeline = ware()
    .use(read)
    .use(configure)
    .use(parse)
    .use(transform)
    .use(queue)
    .use(stringify)
    .use(stdout)
    .use(fileSystem);

/*
 * Expose.
 */

module.exports = filePipeline;
