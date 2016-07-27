/**
 * @author Titus Wormer
 * @copyright 2015 Titus Wormer
 * @license MIT
 * @module remark
 * @fileoverview Test suite for remark, remark-parse,
 *   and remark-stringify.
 */

'use strict';

/* Dependencies. */
var test = require('tape');
var extend = require('extend');
var remove = require('unist-util-remove-position');
var compact = require('mdast-util-compact');
var mdast = require('mdast-util-assert');
var remark = require('../packages/remark');
var fixtures = require('./fixtures');

/* Methods. */
/* Test all fixtures. */
test('fixtures', function (t) {
  var index = -1;

  /* Check the next fixture. */
  function next() {
    var fixture = fixtures[++index];

    if (!fixture) {
      t.end();
      return;
    }

    setImmediate(next); // queue next.

    t.test(fixture.name, function (st) {
      var input = fixture.input;
      var possibilities = fixture.possibilities;
      var mapping = fixture.mapping;
      var trees = fixture.trees;
      var output = fixture.output;

      Object.keys(possibilities).forEach(function (key) {
        var name = key || 'default';
        var parse = possibilities[key];
        var stringify;
        var node;
        var markdown;
        var recompiled;

        stringify = extend({}, fixture.stringify, {
          gfm: parse.gfm,
          commonmark: parse.commonmark,
          pedantic: parse.pedantic
        });

        node = remark().parse(input, parse);

        mdast(node);

        st.deepEqual(
          compact(node),
          compact(trees[mapping[key]]),
          'should parse `' + name + '` correctly'
        );

        markdown = remark().stringify(node, stringify);

        if (output !== false) {
          recompiled = remark().parse(markdown, parse);
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
