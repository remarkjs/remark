#!/usr/bin/env node

/**
 * @typedef Pack
 * @property {string} name
 * @property {string} version
 * @property {string} description
 */

import fs from 'node:fs/promises'
import {resolve} from 'import-meta-resolve'
import markdownExtensions from 'markdown-extensions'
import {remark} from 'remark'
import {args} from 'unified-args'

/** @type {Pack} */
const process_ = JSON.parse(
  String(
    await fs.readFile(
      new URL('package.json', resolve('remark', import.meta.url))
    )
  )
)

/** @type {Pack} */
const cli = JSON.parse(
  String(await fs.readFile(new URL('package.json', import.meta.url)))
)

args({
  description: cli.description,
  extensions: markdownExtensions,
  ignoreName: '.' + process_.name + 'ignore',
  name: process_.name,
  packageField: process_.name + 'Config',
  pluginPrefix: process_.name,
  processor: remark,
  rcName: '.' + process_.name + 'rc',
  version: [
    process_.name + ': ' + process_.version,
    cli.name + ': ' + cli.version
  ].join(', ')
})
