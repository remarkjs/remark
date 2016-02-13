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
var profanities = require('retext-profanities');
var equality = require('retext-equality');
var simplify = require('retext-simplify');

/*
 * Processor.
 */

var naturalLanguage = retext()
    .use(equality)
    .use(profanities)
    .use(readability, {
        'age': 20
    })
    .use(simplify, {
        'ignore': [
            'option',
            'plugin',
            'interface',
            'parameters',
            'function',
            'modify',
            'component',
            'render',
            'validate'
        ]
    });

/**
 * Attacher.
 *
 * @param {Remark} remark - Processor.
 */
function attacher(remark) {
    remark.use(remark2retext, naturalLanguage);
}

module.exports = attacher;
