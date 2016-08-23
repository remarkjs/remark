/**
 * @author Titus Wormer
 * @copyright 2015 Titus Wormer
 * @license MIT
 * @module remark:script
 * @fileoverview Bundle and mangle `remark`.
 */

'use strict';

/* Dependencies. */
var fs = require('fs');
var path = require('path');
var chalk = require('chalk');
var bail = require('bail');
var browserify = require('browserify');
var esprima = require('esprima');
var esmangle = require('esmangle');
var escodegen = require('escodegen');
var pack = require('../packages/remark/package.json');

/* Methods. */
var write = fs.writeFileSync;

var comment = [
  '/*!',
  ' * @copyright 2015 Titus Wormer',
  ' * @license ' + pack.license,
  ' * @module ' + pack.name,
  ' * @version ' + pack.version,
  ' */',
  ''
].join('\n');

var input = path.join.bind(null, __dirname, '..', 'packages', 'remark');
var output = path.join.bind(null, __dirname, '..');

var opts = {standalone: pack.name};

browserify(input('index.js'), opts).bundle(function (err, buf) {
  bail(err);

  write(output('remark.js'), comment + buf);

  console.log(chalk.green('✓') + ' wrote `remark.js`');
});

browserify(input('index.js'), opts)
  .plugin('bundle-collapser/plugin')
  .transform('uglifyify', {
    global: true,
    sourcemap: false
  })
  .bundle(function (err, buf) {
    var ast;

    bail(err);

    ast = esmangle.mangle(esmangle.optimize(esprima.parse(buf, {
      loc: true,
      range: true,
      raw: true,
      comment: true,
      tolerant: true
    }), {
      destructive: true,
      directive: true,
      preserveCompletionValue: false,
      legacy: false,
      topLevelContext: null,
      inStrictCode: true
    }));

    write(output('remark.min.js'), comment + escodegen.generate(ast, {
      format: {
        renumber: true,
        hexadecimal: true,
        escapeless: true,
        compact: true,
        semicolons: false,
        parentheses: false
      }
    }));

    console.log(chalk.green('✓') + ' wrote `remark.min.js`');
  });
