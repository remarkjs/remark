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
const proc = JSON.parse(
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
  ignoreName: '.' + proc.name + 'ignore',
  name: proc.name,
  packageField: proc.name + 'Config',
  pluginPrefix: proc.name,
  processor: remark,
  rcName: '.' + proc.name + 'rc',
  version: [
    proc.name + ': ' + proc.version,
    cli.name + ': ' + cli.version
  ].join(', ')
})
