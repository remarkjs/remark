import {test} from 'node:test'
import assert from 'node:assert/strict'
import {remark} from './index.js'

test('remark', () => {
  assert.equal(
    remark().processSync('*foo*').toString(),
    '*foo*\n',
    'should parse and stringify a file'
  )

  assert.equal(
    remark().data('settings', {closeAtx: true}).processSync('# foo').toString(),
    '# foo #\n',
    'should accept stringify options'
  )
})
