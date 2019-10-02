'use strict'

/* eslint-disable import/no-extraneous-dependencies */
var test = require('tape')
/* eslint-enable import/no-extraneous-dependencies */

var remark = require('.')

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

  t.equal(
    remark()
      .processSync('<!-- last line\n')
      .toString(),
    '<!-- last line\n',
    'should not add more than one linefeed at the end'
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
