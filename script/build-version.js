/**
 * @author Titus Wormer
 * @copyright 2015 Titus Wormer
 * @license MIT
 * @module mdast:script
 * @fileoverview Persist `package.json`s version to other places.
 */

'use strict';

/* eslint-env node */

/*
 * Dependencies.
 */

var fs = require('fs');
var toVFile = require('to-vfile');
var Traverser = require('../lib/cli/traverser');
var pack = require('../package.json');

/*
 * Methods.
 */

var read = fs.readFileSync;
var write = fs.writeFileSync;

/*
 * Constants.
 */

var VERSION = pack.version;

/*
 * Update library files.
 */

var files = new Traverser({
    'extensions': ['js'],
    'detectIgnore': false
}).traverse(['lib']);

files.push(toVFile('index.js'));

files.forEach(function (file) {
    write(file.filePath(), read(file.filePath(), 'utf8')
        .replace(/^( \* @version ).+$/m, '$1' + VERSION)
    );
});

/*
 * Update manifests.
 */

[
    toVFile('.mdastrc-man'),
    toVFile('component.json')
].forEach(function (file) {
    write(file.filePath(), read(file.filePath(), 'utf8')
        .replace(/("version": ")[^"]+(")/m, '$1' + VERSION + '$2')
    );
});
