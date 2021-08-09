#!/usr/bin/env node
import {createRequire} from 'node:module'
import {args} from 'unified-args'
import {remark} from 'remark'

const require = createRequire(import.meta.url)

const proc = require('remark/package.json')
const cli = require('./package.json')

// To do: enable `markdown-extensions` once it supports ESM.
const extensions = [
  'md',
  'markdown',
  'mdown',
  'mkdn',
  'mkd',
  'mdwn',
  'mkdown',
  'ron'
]

args({
  processor: remark,
  name: proc.name,
  description: cli.description,
  version: [
    proc.name + ': ' + proc.version,
    cli.name + ': ' + cli.version
  ].join(', '),
  pluginPrefix: proc.name,
  packageField: proc.name + 'Config',
  rcName: '.' + proc.name + 'rc',
  ignoreName: '.' + proc.name + 'ignore',
  extensions
})
