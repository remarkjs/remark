'use strict'

var test = require('tape')
var remark = require('../packages/remark')

test('remark().processSync(value)', function(t) {
  t.equal(
    remark()
      .processSync('*foo*')
      .toString(),
    '_foo_\n',
    'should parse and stringify a file'
  )

  t.equal(
    remark()
      .data('settings', {commonmark: true})
      .processSync('1)  foo')
      .toString(),
    '1.  foo\n',
    'should accept parse options'
  )

  t.equal(
    remark()
      .data('settings', {closeAtx: true})
      .processSync('# foo')
      .toString(),
    '# foo #\n',
    'should accept stringify options'
  )

  t.throws(
    function() {
      remark()
        .data('settings', {pedantic: true, listItemIndent: '1'})
        .processSync(['* List', '', '        code()'].join('\n'))
    },
    /Cannot indent code properly. See https:\/\/git.io\/fxKR8/,
    'should throw when `pedantic` is `true`, `listItemIndent` is not `tab`, and compiling code in a list-item'
  )

  t.end()
})
