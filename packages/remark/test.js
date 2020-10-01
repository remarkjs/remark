'use strict'

var test = require('tape')
var remark = require('.')

test('remark().processSync(value)', function (t) {
  t.equal(
    remark().processSync('*foo*').toString(),
    '*foo*\n',
    'should parse and stringify a file'
  )

  t.equal(
    remark().data('settings', {closeAtx: true}).processSync('# foo').toString(),
    '# foo #\n',
    'should accept stringify options'
  )

  t.end()
})
