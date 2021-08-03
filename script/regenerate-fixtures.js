import fs from 'fs'
import path from 'path'
import remark from '../packages/remark/index.js'
import fixtures from '../test/fixtures/index.js'

var base = path.join('test', 'fixtures', 'tree')
var generated = []

fixtures.forEach(function (fixture) {
  var stem = path.basename(fixture.name, path.extname(fixture.name))
  var input = fixture.input
  var result

  try {
    result = remark().parse(input)
  } catch (error) {
    console.log('Cannot regenerate `' + stem + '`')
    throw error
  }

  fs.writeFileSync(
    path.join(base, stem + '.json'),
    JSON.stringify(result, null, 2) + '\n'
  )

  generated.push(stem + '.json')
})

fs.readdirSync(base).forEach(function (basename) {
  if (basename.charAt(0) !== '.' && !generated.includes(basename)) {
    console.warn('Unused fixture: `%s`', basename)
  }
})
