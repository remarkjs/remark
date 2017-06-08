/**
 * @author Titus Wormer
 * @copyright 2015 Titus Wormer
 * @license MIT
 * @module remark
 * @fileoverview Test suite for remark, remark-parse,
 *   and remark-stringify.
 */

/* Dependencies. */
import test from 'tape';
import extend from 'extend';
import remove from 'unist-util-remove-position';
import compact from 'mdast-util-compact';
import mdast from 'mdast-util-assert';
import remark from '../packages/remark';
import fixtures from './fixtures';

/* Methods. */
/* Test all fixtures. */
test('fixtures', t => {
  let index = -1;

  /* Check the next fixture. */
  function next() {
    const fixture = fixtures[++index];

    if (!fixture) {
      t.end();
      return;
    }

    setImmediate(next); // Queue next.

    t.test(fixture.name, st => {
      const input = fixture.input;
      const possibilities = fixture.possibilities;
      const mapping = fixture.mapping;
      const trees = fixture.trees;
      const output = fixture.output;

      Object.keys(possibilities).forEach(key => {
        const name = key || 'default';
        const parse = possibilities[key];
        let node;
        let markdown;
        let recompiled;

        node = remark()
          .data('settings', parse)
          .parse(input);

        mdast(node);

        st.deepEqual(
          compact(node),
          compact(trees[mapping[key]]),
          'should parse `' + name + '` correctly'
        );

        markdown = remark()
          .data('settings', extend({}, fixture.stringify, parse))
          .stringify(node);

        if (output !== false) {
          recompiled = remark()
            .data('settings', parse)
            .parse(markdown);

          mdast(recompiled);

          st.deepEqual(
            compact(remove(node, true)),
            compact(remove(recompiled, true)),
            'should stringify `' + name + '`'
          );
        }

        if (output === true) {
          st.equal(
            fixture.input,
            markdown,
            'should stringify `' + name + '` exact'
          );
        }
      });

      st.end();
    });
  }

  next();
});
