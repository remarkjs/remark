import fs from 'fs'
import path from 'path'
import {remark} from '../packages/remark/index.js'
import {fixtures} from '../test/fixtures/index.js'

const base = path.join('test', 'fixtures', 'tree')
const generated = []
let index = -1

while (++index < fixtures.length) {
  const fixture = fixtures[index]
  const stem = path.basename(fixture.name, path.extname(fixture.name))
  const input = fixture.input
  let result

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
}

const files = fs.readdirSync(base)
index = -1

while (++index < files.length) {
  const basename = files[index]
  if (basename.charAt(0) !== '.' && !generated.includes(basename)) {
    console.warn('Unused fixture: `%s`', basename)
  }
}
