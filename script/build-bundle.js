/**
 * @author Titus Wormer
 * @copyright 2015 Titus Wormer
 * @license MIT
 * @module remark:script
 * @fileoverview Bundle and mangle `remark`.
 */

/* Dependencies. */
import fs from 'fs';
import path from 'path';
import chalk from 'chalk';
import bail from 'bail';
import browserify from 'browserify';
import esprima from 'esprima';
import esmangle from 'esmangle';
import escodegen from 'escodegen';
import pack from '../packages/remark/package.json';

/* Methods. */
const write = fs.writeFileSync;

const comment = [
  '/*!',
  ' * @copyright 2015 Titus Wormer',
  ' * @license ' + pack.license,
  ' * @module ' + pack.name,
  ' * @version ' + pack.version,
  ' */',
  ''
].join('\n');

const input = path.join.bind(null, __dirname, '..', 'packages', 'remark');
const output = path.join.bind(null, __dirname, '..');

const opts = {standalone: pack.name};

browserify(input('index.js'), opts).bundle((err, buf) => {
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
  .bundle((err, buf) => {
    let ast;

    bail(err);

    ast = esmangle.mangle(esmangle.optimize(esprima.parse(String(buf), {
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
