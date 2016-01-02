/**
 * @author Titus Wormer
 * @copyright 2015-2016 Titus Wormer
 * @license MIT
 * @module remark:script
 * @fileoverview Persist `package.json`s version to other places.
 */

'use strict';

/* eslint-env node */

/*
 * Dependencies.
 */

var fs = require('fs');
var bail = require('bail');
var toVFile = require('to-vfile');
var findDown = require('vfile-find-down');
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

findDown.all('.js', 'lib', function (err, files) {
    bail(err);

    files.push(toVFile('index.js'));

    files.forEach(function (file) {
        write(
            file.filePath(),
            read(file.filePath(), 'utf8')
                .replace(/^( \* @version ).+$/m, '$1' + VERSION)
        );
    });
});

/*
 * Update manifests.
 */

[
    toVFile('.remarkrc-man'),
    toVFile('component.json')
].forEach(function (file) {
    write(file.filePath(), read(file.filePath(), 'utf8')
        .replace(/("version": ")[^"]+(")/m, '$1' + VERSION + '$2')
    );
});
