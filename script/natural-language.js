/**
 * @author Titus Wormer
 * @copyright 2016 Titus Wormer
 * @license MIT
 * @module remark:script
 * @fileoverview Validate the natural language used in
 *   the docs.
 *
 *   This works as a remark plug-in, running retext
 *   with retext-equality (the gist of alex) and running
 *   retext-readability.
 */

'use strict';

/* eslint-env node */

/*
 * Dependencies.
 */

var retext = require('retext');
var remark2retext = require('remark-retext');
var readability = require('retext-readability');
var equality = require('retext-equality');

/**
 * Attacher.
 *
 * @param {Remark} remark - Processor.
 */
function attacher(remark) {
    remark.use(remark2retext, retext().use(readability, {
        'age': 20
    }).use(equality));
}

module.exports = attacher;
