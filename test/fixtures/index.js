import fs from 'fs'
import path from 'path'
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
  rule: '*',
  ruleSpaces: true,
  ruleRepetition: 3,
  setext: false,
  strong: '*',
  tightDefinitions: false
}

export const fixtures = fs
  .readdirSync(path.join('test', 'fixtures', 'input'))
  .filter((filepath) => {
    return filepath.indexOf('.') !== 0
  })
  .map((basename) => {
    const stem = path.basename(basename, path.extname(basename))
    const settings = parseOptions(stem.replace(/-asterisk-/g, '*'))
    const input = String(
      fs.readFileSync(path.join('test', 'fixtures', 'input', basename))
    )
    const treePath = path.join('test', 'fixtures', 'tree', stem + '.json')
    let tree

    if (fs.existsSync(treePath)) {
      tree = JSON.parse(fs.readFileSync(treePath))
    }

    return {
      name: basename,
      input,
      tree,
      stringify: settings.stringify,
      output: settings.output
    }
  })

// Parse options from a filename.
function parseOptions(name) {
  const parts = name.split('.')
  const length = parts.length
  const options = {stringify: Object.assign({}, defaults)}
  let index = -1

  while (++index < length) {
    const part = parts[index].split('=')
    const augmented = augment(part[0], part.slice(1).join('='))
    const key = augmented.key
    const value = augmented.value

    if (key === 'output') {
      options[key] = value
    } else if (key in defaults && value !== options.stringify[key]) {
      options.stringify[key] = value
    }
  }

  return options
}

// Parse a `string` `value` into a javascript value.
function augment(key, value) {
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
