/**
 * @author Titus Wormer
 * @copyright 2015 Titus Wormer
 * @license MIT
 * @module remark
 * @fileoverview Test suite for escaping in `remark-stringify`.
 */

'use strict';

/* Dependencies. */
var test = require('tape');
var u = require('unist-builder');
var visit = require('unist-util-visit');
var remark = require('../packages/remark');

/* Constants. */
var commonmark = {commonmark: true};
var pedantic = {pedantic: true};
var uncollapsable = {start: {line: 1, column: NaN}, end: {line: 1, column: NaN}};

/* Test `remark-stringify`. */
test('stringify escapes', function (t) {
  t.equal(stringify('a\\b'), 'a\\\\b', '`\\`');
  t.equal(stringify('a`b'), 'a\\`b', '`` ` ``');
  t.equal(stringify('a*b'), 'a\\*b', '`*`');
  t.equal(stringify('a[b'), 'a\\[b', '`[`');
  t.equal(stringify('a<b'), 'a&lt;b', '`<`');
  t.equal(stringify('a<b', commonmark), 'a\\<b', '`<` (commonmark)');

  t.equal(stringify('a&b'), 'a&b', '`&`');
  t.equal(stringify('a&amp;b'), 'a&amp;amp;b', 'entities');
  t.equal(stringify('a&amp;b', commonmark), 'a\\&amp;b', 'entities (commonmark)');

  t.equal(stringify('a]b'), 'a]b', '`]`');

  t.equal(
    stringify(u('link', [u('text', 'a]b')])),
    '[a\\]b](<>)',
    '`]` (in links)'
  );

  t.equal(
    stringify(u('image', {alt: 'a]b'})),
    '![a\\]b](<>)',
    '`]` (in images)'
  );

  t.equal(stringify('a~b'), 'a~b', '`~`');
  t.equal(stringify('a~~b'), 'a\\~~b', '`~~`');

  t.equal(stringify('a|b'), 'a|b', '`|`');
  t.equal(stringify('| -- |'), '\\| -- \\|', '`|` (table-like)');

  t.equal(
    stringify(u('table', [
      u('tableRow', [u('tableCell', [u('text', 'a|b')])])
    ])),
    '| a\\|b |\n| ---- |',
    '`|` (in cells)'
  );

  t.equal(stringify('a_b'), 'a_b', '`_` (in words)');
  t.equal(stringify('a_b', pedantic), 'a\\_b', '`_` (in words, pedantic)');
  t.equal(stringify(' _b'), ' \\_b', '`_` after `\\b`');
  t.equal(stringify('a_ '), 'a\\_ ', '`_` before `\\b`');

  t.equal(stringify('a:b'), 'a:b', '`:`');
  t.equal(stringify('http:b'), 'http&#x3A;b', '`:` (in `http:`)');
  t.equal(stringify('http:b', commonmark), 'http\\:b', '`:` (in `http:`, commonmark)');
  t.equal(stringify('https:b'), 'https&#x3A;b', '`:` (in `https:`)');
  t.equal(stringify('https:b', commonmark), 'https\\:b', '`:` (in `https:`, commonmark)');
  t.equal(stringify('mailto:b'), 'mailto&#x3A;b', '`:` (in `mailto:`)');
  t.equal(stringify('mailto:b', commonmark), 'mailto\\:b', '`:` (in `mailto:`, commonmark)');

  t.equal(stringify('>a'), '\\>a', '`>` (without parent)');
  t.equal(stringify(u('paragraph', [u('text', '>a')])), '\\>a', '`>` (in paragraph)');
  t.equal(stringify(u('strong', [u('text', '>a')])), '**>a**', '`>` (in non-paragraph)');
  t.equal(stringify(u('strong', [u('text', 'a'), u('text', '>b')])), '**a>b**', '`>` (after sibling)');
  t.equal(stringify(u('strong', [u('text', '\n'), u('text', '>b')])), '**\n\\>b**', '`>` (after newline)');

  t.equal(stringify('#a'), '\\#a', '`#` (without parent)');
  t.equal(stringify(u('paragraph', [u('text', '#a')])), '\\#a', '`#` (in paragraph)');
  t.equal(stringify(u('strong', [u('text', '#a')])), '**#a**', '`#` (in non-paragraph)');
  t.equal(stringify(u('strong', [u('text', 'a'), u('text', '#b')])), '**a#b**', '`#` (after sibling)');
  t.equal(stringify(u('strong', [u('text', '\n'), u('text', '#b')])), '**\n\\#b**', '`#` (after newline)');

  /* Both bullet and emphasis marker. */
  t.equal(stringify('*a'), '\\*a', '`*` (without parent)');
  t.equal(stringify(u('paragraph', [u('text', '*a')])), '\\*a', '`*` (in paragraph)');
  t.equal(stringify(u('strong', [u('text', '*a')])), '**\\*a**', '`*` (in non-paragraph)');
  t.equal(stringify(u('strong', [u('text', 'a'), u('text', '*b')])), '**a\\*b**', '`*` (after sibling)');
  t.equal(stringify(u('strong', [u('text', '\n'), u('text', '*b')])), '**\n\\*b**', '`*` (after newline)');

  t.equal(stringify('-a'), '\\-a', '`-` (without parent)');
  t.equal(stringify(u('paragraph', [u('text', '-a')])), '\\-a', '`-` (in paragraph)');
  t.equal(stringify(u('strong', [u('text', '-a')])), '**-a**', '`-` (in non-paragraph)');
  t.equal(stringify(u('strong', [u('text', 'a'), u('text', '-b')])), '**a-b**', '`-` (after sibling)');
  t.equal(stringify(u('strong', [u('text', '\n'), u('text', '-b')])), '**\n\\-b**', '`-` (after newline)');

  t.equal(stringify('+a'), '\\+a', '`+` (without parent)');
  t.equal(stringify(u('paragraph', [u('text', '+a')])), '\\+a', '`+` (in paragraph)');
  t.equal(stringify(u('strong', [u('text', '+a')])), '**+a**', '`+` (in non-paragraph)');
  t.equal(stringify(u('strong', [u('text', 'a'), u('text', '+b')])), '**a+b**', '`+` (after sibling)');
  t.equal(stringify(u('strong', [u('text', '\n'), u('text', '+b')])), '**\n\\+b**', '`+` (after newline)');

  t.equal(stringify('.a'), '.a', '`.`');
  t.equal(stringify('1.a'), '1\\.a', '`.` (without parent)');
  t.equal(stringify(u('paragraph', [u('text', '1.a')])), '1\\.a', '`1.` (in paragraph)');
  t.equal(stringify(u('strong', [u('text', '1.a')])), '**1.a**', '`1.` (in non-paragraph)');
  t.equal(stringify(u('strong', [u('text', 'a'), u('text', '1.b')])), '**a1.b**', '`1.` (after sibling)');
  t.equal(stringify(u('strong', [u('text', '\n'), u('text', '1.b')])), '**\n1\\.b**', '`1.` (after newline)');

  t.equal(stringify(')a'), ')a', '`)`');
  t.equal(stringify('1)a'), '1)a', '`)` (default)');
  t.equal(stringify('1)a', commonmark), '1\\)a', '`)` (commonmark, without parent)');
  t.equal(stringify(u('paragraph', [u('text', '1)a')]), commonmark), '1\\)a', '`1)` (in paragraph)');
  t.equal(stringify(u('strong', [u('text', '1)a')]), commonmark), '**1)a**', '`1)` (in non-paragraph)');
  t.equal(stringify(u('strong', [u('text', 'a'), u('text', '1)b')]), commonmark), '**a1)b**', '`1)` (after sibling)');
  t.equal(stringify(u('strong', [u('text', '\n'), u('text', '1)b')]), commonmark), '**\n1\\)b**', '`1)` (after newline)');

  t.equal(
    stringify(u('paragraph', [
      u('linkReference', {
        identifier: 'foo',
        referenceType: 'shortcut'
      }, [u('text', 'a')]),
      u('text', '(b')
    ])),
    '[a]\\(b',
    '`(` after shortcut link-reference'
  );

  t.equal(
    stringify(u('paragraph', [
      u('linkReference', {
        identifier: 'foo',
        referenceType: 'shortcut'
      }, [u('text', 'a')]),
      u('text', ' \t(b')
    ])),
    '[a] \t\\(b',
    '`(` after spaced shortcut link-reference'
  );

  t.equal(
    stringify(u('paragraph', [
      u('linkReference', {
        identifier: 'foo',
        referenceType: 'shortcut'
      }, [u('text', 'a')]),
      u('text', ':b')
    ])),
    '[a]&#x3A;b',
    '`:` after shortcut link-reference'
  );

  t.equal(
    stringify(u('paragraph', [
      u('linkReference', {
        identifier: 'foo',
        referenceType: 'shortcut'
      }, [u('text', 'a')]),
      u('text', ' \t:b')
    ])),
    '[a] \t&#x3A;b',
    '`:` after spaced shortcut link-reference'
  );

  t.equal(
    stringify(u('paragraph', [u('text', 'http'), u('text', ':')])),
    'http&#x3A;',
    '`:` with protocol in previous node'
  );

  t.equal(
    stringify(u('paragraph', [u('text', '&'), u('text', 'amp;')])),
    '&amp;amp;',
    '`&` with entity in next node'
  );

  t.equal(
    stringify(u('paragraph', [u('text', 'a~'), u('text', '~b')])),
    'a\\~~b',
    '`~~` split over two nodes'
  );

  t.equal(
    stringify(u('paragraph', [u('text', 'a'), u('text', '_'), u('text', 'b')])),
    'a_b',
    '`_` split over nodes'
  );

  t.equal(
    stringify(
      u('paragraph', [u('text', 'a'), u('text', '_'), u('text', 'b')]),
      pedantic
    ),
    'a\\_b',
    '`_` split over nodes (pedantic)'
  );

  t.equal(
    stringify(u('paragraph', [u('text', ' '), u('text', '_'), u('text', 'b')])),
    ' \\_b',
    '`_` split over nodes (no word character before)'
  );

  t.equal(
    stringify(u('paragraph', [u('text', ' _'), u('text', 'b')])),
    ' \\_b',
    '`_` split over nodes (no word character before, #2)'
  );

  t.equal(
    stringify(u('paragraph', [u('text', 'a'), u('text', '_'), u('text', ' ')])),
    'a\\_ ',
    '`_` split over nodes (no word character after)'
  );

  t.equal(
    stringify(u('paragraph', [u('text', 'a'), u('text', '_ ')])),
    'a\\_ ',
    '`_` split over nodes (no word character after, #2)'
  );

  t.end();
});

function stringify(value, options) {
  var tree = typeof value === 'string' ? u('text', value) : value;

  visit(tree, function (node) {
    node.position = uncollapsable;
  });

  return remark().stringify(tree, options);
}
