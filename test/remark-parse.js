/**
 * @author Titus Wormer
 * @copyright 2015 Titus Wormer
 * @license MIT
 * @module remark
 * @fileoverview Test suite for `remark.parse()`.
 */

'use strict';

/* Dependencies. */
var path = require('path');
var fs = require('fs');
var test = require('tape');
var vfile = require('vfile');
var remark = require('../packages/remark');

/* Test `remark-parse`. */
test('remark().parse(file, options?)', function (t) {
  t.equal(
    remark().parse('Alfred').children.length,
    1,
    'should accept a `string`'
  );

  t.throws(
    function () {
      remark().parse('', true);
    },
    /options/,
    'should throw when `options` is not an object'
  );

  t.throws(
    function () {
      remark().parse('', {position: 0});
    },
    /options.position/,
    'should throw when `options.position` is not a boolean'
  );

  t.throws(
    function () {
      remark().parse('', {gfm: Infinity});
    },
    /options.gfm/,
    'should throw when `options.gfm` is not a boolean'
  );

  t.throws(
    function () {
      remark().parse('', {footnotes: 1});
    },
    /options.footnotes/,
    'should throw when `options.footnotes` is not a boolean'
  );

  t.throws(
    function () {
      remark().parse('', {breaks: 'unicorn'});
    },
    /options.breaks/,
    'should throw when `options.breaks` is not a boolean'
  );

  t.throws(
    function () {
      remark().parse('', {pedantic: {}});
    },
    /options.pedantic/,
    'should throw when `options.pedantic` is not a boolean'
  );

  t.throws(
    function () {
      remark().parse('', {yaml: [true]});
    },
    /options.yaml/,
    'should throw when `options.yaml` is not a boolean'
  );

  t.deepEqual(
    remark().parse('<foo></foo>', {position: false}),
    {
      type: 'root',
      children: [{
        type: 'paragraph',
        children: [
          {type: 'html', value: '<foo>'},
          {type: 'html', value: '</foo>'}
        ]
      }]
    },
    'should work without `blocks`'
  );

  t.deepEqual(
    remark().parse('<foo></foo>', {blocks: ['foo'], position: false}),
    {
      type: 'root',
      children: [{type: 'html', value: '<foo></foo>'}]
    },
    'should support given `blocks`'
  );

  t.test('should throw parse errors', function (st) {
    var processor = remark();
    var message = 'Found it!';

    st.plan(5);

    /* Tokenizer. */
    function emphasis(eat, value) {
      if (value.charAt(0) === '*') {
        eat.file.fail(message, eat.now());
      }
    }

    /* Locator. */
    function locator(value, fromIndex) {
      return value.indexOf('*', fromIndex);
    }

    emphasis.locator = locator;
    processor.Parser.prototype.inlineTokenizers.emphasis = emphasis;

    try {
      processor.parse('Hello *World*!');
    } catch (err) {
      st.equal(err.file, '', 'should pass a filename');
      st.equal(err.line, 1, 'should set `line`');
      st.equal(err.column, 7, 'should set `column`');
      st.equal(err.reason, message, 'should set `reason`');
      st.equal(err.toString(), '1:7: ' + message, 'should set `message`');
    }
  });

  t.test('should warn when missing locators', function (st) {
    var processor = remark();
    var proto = processor.Parser.prototype;
    var methods = proto.inlineMethods;
    var file = vfile('Hello *World*!');

    /* Tokenizer. */
    function noop() {}

    proto.inlineTokenizers.foo = noop;
    methods.splice(methods.indexOf('inlineText'), 0, 'foo');

    st.throws(
      function () {
        processor.parse(file);
      },
      /1:1: Missing locator: `foo`/
    );

    st.end();
  });

  t.test('should warn about entities', function (st) {
    var filePath = path.join('test', 'fixtures', 'input', 'entities-advanced.text');
    var file = vfile(fs.readFileSync(filePath));
    var notTerminated = 'Named character references must be ' +
      'terminated by a semicolon';

    remark().process(file);

    st.deepEqual(
      file.messages.map(String),
      [
        '1:13: Named character references must be known',
        '5:15: ' + notTerminated,
        '10:14: ' + notTerminated,
        '12:38: ' + notTerminated,
        '15:16: ' + notTerminated,
        '15:37: ' + notTerminated,
        '14:16: ' + notTerminated,
        '18:17: ' + notTerminated,
        '19:21: ' + notTerminated,
        '17:16: ' + notTerminated,
        '24:16: ' + notTerminated,
        '24:37: ' + notTerminated,
        '22:11: ' + notTerminated,
        '29:17: ' + notTerminated,
        '30:21: ' + notTerminated,
        '28:17: ' + notTerminated,
        '33:11: ' + notTerminated,
        '36:27: ' + notTerminated,
        '37:10: ' + notTerminated,
        '41:25: ' + notTerminated,
        '42:10: ' + notTerminated
      ]
    );

    st.end();
  });

  t.test('should be able to set options', function (st) {
    var processor = remark();
    var html = processor.Parser.prototype.blockTokenizers.html;
    var result;

    /* Set option when an HMTL comment occurs. */
    function replacement(eat, value) {
      var node = /<!--\s*(.*?)\s*-->/g.exec(value);
      var options = {};

      if (node) {
        options[node[1]] = true;

        this.setOptions(options);
      }

      return html.apply(this, arguments);
    }

    processor.Parser.prototype.blockTokenizers.html = replacement;

    result = processor.parse([
      '<!-- commonmark -->',
      '',
      '1)   Hello World',
      ''
    ].join('\n'));

    st.equal(result.children[1].type, 'list');

    st.end();
  });

  t.end();
});
