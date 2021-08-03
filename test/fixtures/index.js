import fs from 'fs'
import path from 'path'
import camelcase from 'camelcase'

// See <https://github.com/syntax-tree/mdast-util-to-markdown#formatting-options>
var defaults = {
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
  .filter(function (filepath) {
    return filepath.indexOf('.') !== 0
  })
  .map(function (basename) {
    var stem = path.basename(basename, path.extname(basename))
    var settings = parseOptions(stem.replace(/-asterisk-/g, '*'))
    var input = String(
      fs.readFileSync(path.join('test', 'fixtures', 'input', basename))
    )
    var treePath = path.join('test', 'fixtures', 'tree', stem + '.json')
    var tree

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
  var index = -1
  var parts = name.split('.')
  var length = parts.length
  var options = {stringify: Object.assign({}, defaults)}
  var part
  var augmented
  var key
  var value

  while (++index < length) {
    part = parts[index].split('=')
    augmented = augment(part[0], part.slice(1).join('='))
    key = augmented.key
    value = augmented.value

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
