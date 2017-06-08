/**
 * @author Titus Wormer
 * @copyright 2015 Titus Wormer
 * @license MIT
 * @module remark
 * @fileoverview Test suite for `remark.process()`.
 */

/* Dependencies. */
import test from 'tape';
import remark from '../packages/remark';

/* Test `remark`. */
test('remark().processSync(value)', t => {
  t.equal(
    remark().processSync('*foo*').toString(),
    '_foo_\n',
    'should parse and stringify a file'
  );

  t.equal(
    remark().data('settings', {commonmark: true}).processSync('1)  foo').toString(),
    '1.  foo\n',
    'should accept parse options'
  );

  t.equal(
    remark().data('settings', {closeAtx: true}).processSync('# foo').toString(),
    '# foo #\n',
    'should accept stringify options'
  );

  t.throws(
    () => {
      remark().data('settings', {pedantic: true, listItemIndent: '1'}).processSync([
        '* List',
        '',
        '        code()'
      ].join('\n'));
    },
    /Cannot indent code properly. See http:\/\/git.io\/vgFvT/,
    'should throw when `pedantic` is `true`, `listItemIndent` ' +
    'is not `tab`, and compiling code in a list-item'
  );

  t.end();
});
