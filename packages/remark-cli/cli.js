#!/usr/bin/env node
/**
 * @author Titus Wormer
 * @copyright 2015 Titus Wormer
 * @license MIT
 * @module remark:cli
 * @fileoverview CLI to process markdown.
 */

/* Dependencies. */
import start from 'unified-args';
import extensions from 'markdown-extensions';
import processor from 'remark';
import proc from 'remark/package.json';
import cli from './package.json';

/* Start. */
start({
  processor,
  name: proc.name,
  description: cli.description,
  version: [
    proc.name + ': ' + proc.version,
    cli.name + ': ' + cli.version
  ].join(', '),
  pluginPrefix: proc.name,
  presetPrefix: proc.name + '-preset',
  packageField: proc.name + 'Config',
  rcName: '.' + proc.name + 'rc',
  ignoreName: '.' + proc.name + 'ignore',
  extensions
});
