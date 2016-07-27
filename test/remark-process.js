/**
 * @author Titus Wormer
 * @copyright 2015 Titus Wormer
 * @license MIT
 * @module remark
 * @fileoverview Test suite for `remark.process()`.
 */

'use strict';

/* Dependencies. */
var test = require('tape');
var remark = require('../packages/remark');

/* Test `remark`. */
test('remark().process(value, options, done)', function (t) {
  t.equal(
    remark().process('*foo*').toString(),
    '_foo_\n',
    'should parse and stringify a file'
  );

  t.equal(
    remark().process('1)  foo', {commonmark: true}).toString(),
    '1.  foo\n',
    'should accept parse options'
  );

  t.equal(
    remark().process('# foo', {closeAtx: true}).toString(),
    '# foo #\n',
    'should accept stringify options'
  );

  t.throws(
    function () {
      remark().process([
        '* List',
        '',
        '        code()'
      ].join('\n'), {
        pedantic: true,
        listItemIndent: '1'
      });
    },
    /Cannot indent code properly. See http:\/\/git.io\/vgFvT/,
    'should throw when `pedantic` is `true`, `listItemIndent` ' +
    'is not `tab`, and compiling code in a list-item'
  );

  t.end();
});
