/**
 * @author Titus Wormer
 * @copyright 2015 Titus Wormer
 * @license MIT
 * @module remark
 * @fileoverview Test suite for `remark.stringify()`.
 */

'use strict';

/* Dependencies. */
var test = require('tape');
var remark = require('../packages/remark');

/* Construct an empty node. */
function empty() {
  return {type: 'root', children: []};
}

/* Test `remark-stringify`. */
test('remark().stringify(ast, file, options?)', function (t) {
  t.throws(
    function () {
      remark().stringify(false);
    },
    /false/,
    'should throw when `ast` is not an object'
  );

  t.throws(
    function () {
      remark().stringify({type: 'unicorn'});
    },
    /unicorn/,
    'should throw when `ast` is not a valid node'
  );

  t.throws(
    function () {
      remark().stringify(empty(), true);
    },
    /options/,
    'should throw when `options` is not an object'
  );

  t.throws(
    function () {
      remark().stringify(empty(), {bullet: true});
    },
    /options\.bullet/,
    'should throw when `options.bullet` is not a valid list bullet'
  );

  t.throws(
    function () {
      remark().stringify(empty(), {listItemIndent: 'foo'
      });
    },
    /options\.listItemIndent/,
    'should throw when `options.listItemIndent` is not a valid ' +
    'constant'
  );

  t.throws(
    function () {
      remark().stringify(empty(), {rule: true});
    },
    /options\.rule/,
    'should throw when `options.rule` is not a valid ' +
    'horizontal rule bullet'
  );

  t.throws(
    function () {
      remark().stringify(empty(), {ruleSpaces: 1});
    },
    /options\.ruleSpaces/,
    'should throw when `options.ruleSpaces` is not a boolean'
  );

  t.throws(
    function () {
      remark().stringify(empty(), {ruleRepetition: 1});
    },
    /options\.ruleRepetition/,
    'should throw when `options.ruleRepetition` is too low'
  );

  t.throws(
    function () {
      remark().stringify(empty(), {ruleRepetition: NaN});
    },
    /options\.ruleRepetition/,
    'should throw when `options.ruleRepetition` is `NaN`'
  );

  t.throws(
    function () {
      remark().stringify(empty(), {ruleRepetition: true});
    },
    /options\.ruleRepetition/,
    'should throw when `options.ruleRepetition` is not a number'
  );

  t.throws(
    function () {
      remark().stringify(empty(), {emphasis: '-'});
    },
    /options\.emphasis/,
    'should throw when `options.emphasis` is not a ' +
    'valid emphasis marker'
  );

  t.throws(
    function () {
      remark().stringify(empty(), {strong: '-'});
    },
    /options\.strong/,
    'should throw when `options.strong` is not a ' +
    'valid emphasis marker'
  );

  t.throws(
    function () {
      remark().stringify(empty(), {setext: 0});
    },
    /options\.setext/,
    'should throw when `options.setext` is not a boolean'
  );

  t.throws(
    function () {
      remark().stringify(empty(), {incrementListMarker: -1});
    },
    /options\.incrementListMarker/,
    'should throw when `options.incrementListMarker` is not a ' +
    'boolean'
  );

  t.throws(
    function () {
      remark().stringify(empty(), {fences: NaN});
    },
    /options\.fences/,
    'should throw when `options.fences` is not a boolean'
  );

  t.throws(
    function () {
      remark().stringify(empty(), {fence: '-'});
    },
    /options\.fence/,
    'should throw when `options.fence` is not a ' +
    'valid fence marker'
  );

  t.throws(
    function () {
      remark().stringify(empty(), {closeAtx: NaN});
    },
    /options\.closeAtx/,
    'should throw when `options.closeAtx` is not a boolean'
  );

  t.throws(
    function () {
      remark().stringify(empty(), {looseTable: 'Hello!'});
    },
    /options\.looseTable/,
    'should throw when `options.looseTable` is not a boolean'
  );

  t.throws(
    function () {
      remark().stringify(empty(), {spacedTable: 'World'});
    },
    /options\.spacedTable/,
    'should throw when `options.spacedTable` is not a boolean'
  );

  t.throws(
    function () {
      remark().stringify(empty(), {paddedTable: 'Not a boolean'});
    },
    /options\.paddedTable/,
    'should throw when `options.paddedTable` is not a boolean'
  );

  t.test('should be able to set options', function (st) {
    var processor = remark();
    var html = processor.Compiler.prototype.visitors.html;
    var ast;

    ast = processor.parse([
      '<!-- setext -->',
      '',
      '# Hello World',
      ''
    ].join('\n'));

    /* Set option when an HMTL comment occurs */
    function replacement(node) {
      var value = node.value;
      var result = /<!--\s*(.*?)\s*-->/g.exec(value);
      var options = {};

      if (result) {
        options[result[1]] = true;

        this.setOptions(options);
      }

      return html.apply(this, arguments);
    }

    processor.Compiler.prototype.visitors.html = replacement;

    st.equal(
      processor.stringify(ast),
      [
        '<!-- setext -->',
        '',
        'Hello World',
        '===========',
        ''
      ].join('\n')
    );

    st.end();
  });

  t.end();
});
