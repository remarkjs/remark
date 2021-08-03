/** @typedef {import('mdast').Root} Root */

import fs from 'node:fs'
import path from 'node:path'
import camelcase from 'camelcase'

// See <https://github.com/syntax-tree/mdast-util-to-markdown#formatting-options>
const defaults = {
  bullet: '*',
  closeAtx: false,
  emphasis: '*',
  fence: '`',
  fences: false,
  incrementListMarker: true,
  listItemIndent: 'tab',
  quote: '"',
  resourceLink: false,
  rule: '*',
  ruleRepetition: 3,
  ruleSpaces: true,
  setext: false,
  strong: '*',
  tightDefinitions: false
}

export const fixtures = fs
  .readdirSync(path.join('test', 'fixtures', 'input'))
  .filter((filepath) => filepath.indexOf('.') !== 0)
  .map((basename) => {
    const stem = path.basename(basename, path.extname(basename))
    const settings = parseOptions(stem.replace(/-asterisk-/g, '*'))
    const input = String(
      fs.readFileSync(path.join('test', 'fixtures', 'input', basename))
    )
    const treePath = path.join('test', 'fixtures', 'tree', stem + '.json')
    /** @type {Root|undefined} */
    let tree

    if (fs.existsSync(treePath)) {
      tree = JSON.parse(String(fs.readFileSync(treePath)))
    }

    return {
      name: basename,
      input,
      tree,
      stringify: settings.stringify,
      output: settings.output
    }
  })

/**
 * Parse options from a filename.
 *
 * @param {string} name
 */
function parseOptions(name) {
  const parts = name.split('.')
  const options = {
    /** @type {boolean|undefined} */
    output: undefined,
    /** @type {Record<string, string|number|boolean>} */
    stringify: Object.assign({}, defaults)
  }
  let index = -1

  while (++index < parts.length) {
    const part = parts[index].split('=')
    const augmented = augment(part[0], part.slice(1).join('='))
    const key = augmented.key
    const value = augmented.value

    if (key === 'output') {
      options[key] = Boolean(value)
    } else if (key in defaults && value !== options.stringify[key]) {
      options.stringify[key] = value
    }
  }

  return options
}

/**
 * Parse a `string` `value` into a javascript value.
 *
 * @param {string} key
 * @param {string} input
 */
function augment(key, input) {
  /** @type {string|boolean|number} */
  let value = input

  if (!value) {
    value = key.slice(0, 2) !== 'no'

    if (!value) {
      key = key.slice(2)
    }
  }

  key = camelcase(key)

  if (key === 'ruleRepetition') {
    value = Number(value)
  }

  return {key, value}
}
