#!/usr/bin/env node
import {createRequire} from 'node:module'
import extensions from 'markdown-extensions'
import {args} from 'unified-args'
// eslint-disable-next-line import/order
import {remark} from 'remark'

const require = createRequire(import.meta.url)

const proc = require('remark/package.json')
const cli = require('./package.json')

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
