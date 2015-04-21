'use strict';

/*
 * Dependencies.
 */

var fs = require('fs');

/*
 * Set-up.
 */

var head = '/* This file is extracted from eslint by ' +
    '`script/build-formatter.js` */';

/*
 * Read.
 */

var file = fs.readFileSync('./node_modules/eslint/lib/formatters/stylish.js');

/*
 * Generate.
 */

var doc = head + '\n' + file.toString('utf-8');

/*
 * Write.
 */

fs.writeFileSync('./lib/cli/formatter.js', doc);
