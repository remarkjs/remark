#!/usr/bin/env node
/**
 * @author Titus Wormer
 * @copyright 2015-2016 Titus Wormer
 * @license MIT
 * @module remark:cli
 * @fileoverview CLI to process markdown.
 */

'use strict';

/* eslint-env node */

var start = require('unified-args');
var extensions = require('markdown-extensions');
var processor = require('remark');
var proc = require('remark/package.json');
var cli = require('./package.json');

start({
    'processor': processor,
    'name': proc.name,
    'description': cli.description,
    'version': [
        proc.name + ': ' + proc.version,
        cli.name + ': ' + cli.version
    ].join(', '),
    'pluginPrefix': proc.name,
    'packageField': proc.name + 'Config',
    'rcName': '.' + proc.name + 'rc',
    'ignoreName': '.' + proc.name + 'ignore',
    'extensions': extensions
});
