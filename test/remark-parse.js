/**
 * @author Titus Wormer
 * @copyright 2015 Titus Wormer
 * @license MIT
 * @module remark
 * @fileoverview Test suite for `remark.parse()`.
 */

/* Dependencies. */
import path from 'path';
import fs from 'fs';
import test from 'tape';
import vfile from 'vfile';
import remark from '../packages/remark';
import parse from '../packages/remark-parse';

const Parser = parse.Parser;

/* Test `remark-parse`. */
test('remark().parse(file)', t => {
  t.equal(
    remark().parse('Alfred').children.length,
    1,
    'should accept a `string`'
  );

  t.throws(
    () => {
      remark().data('settings', {position: 0}).parse('');
    },
    /options.position/,
    'should throw when `options.position` is not a boolean'
  );

  t.doesNotThrow(
    () => {
      const parser = new Parser();
      parser.setOptions();
    },
    'should not throw when setting nothing'
  );

  t.throws(
    () => {
      const parser = new Parser();
      parser.setOptions(true);
    },
    /^Error: Invalid value `true` for setting `options`$/,
    'should throw when setting invalid values'
  );

  t.throws(
    () => {
      remark().data('settings', {gfm: Infinity}).parse('');
    },
    /options.gfm/,
    'should throw when `options.gfm` is not a boolean'
  );

  t.throws(
    () => {
      remark().data('settings', {footnotes: 1}).parse('');
    },
    /options.footnotes/,
    'should throw when `options.footnotes` is not a boolean'
  );

  t.throws(
    () => {
      remark().data('settings', {breaks: 'unicorn'}).parse('');
    },
    /options.breaks/,
    'should throw when `options.breaks` is not a boolean'
  );

  t.throws(
    () => {
      remark().data('settings', {pedantic: {}}).parse('');
    },
    /options.pedantic/,
    'should throw when `options.pedantic` is not a boolean'
  );

  t.throws(
    () => {
      remark().data('settings', {yaml: [true]}).parse('');
    },
    /options.yaml/,
    'should throw when `options.yaml` is not a boolean'
  );

  t.deepEqual(
    remark().data('settings', {position: false}).parse('<foo></foo>'),
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
    remark().data('settings', {position: false, blocks: ['foo']}).parse('<foo></foo>'),
    {
      type: 'root',
      children: [{type: 'html', value: '<foo></foo>'}]
    },
    'should support given `blocks`'
  );

  t.test('should throw parse errors', st => {
    const processor = remark().use(plugin);

    st.plan(5);

    try {
      processor.parse('Hello *World*!');
    } catch (err) {
      st.equal(err.file, '', 'should pass a filename');
      st.equal(err.line, 1, 'should set `line`');
      st.equal(err.column, 7, 'should set `column`');
      st.equal(err.reason, 'Found it!', 'should set `reason`');
      st.equal(err.toString(), '1:7: Found it!', 'should set `message`');
    }

    function plugin() {
      emphasis.locator = locator;
      this.Parser.prototype.inlineTokenizers.emphasis = emphasis;

      function emphasis(eat, value) {
        if (value.charAt(0) === '*') {
          eat.file.fail('Found it!', eat.now());
        }
      }

      function locator(value, fromIndex) {
        return value.indexOf('*', fromIndex);
      }
    }
  });

  t.test('should warn when missing locators', st => {
    const processor = remark().use(plugin);

    st.throws(
      () => {
        processor.parse(vfile('Hello *World*!'));
      },
      /1:1: Missing locator: `foo`/
    );

    st.end();

    function plugin() {
      const proto = this.Parser.prototype;
      const methods = proto.inlineMethods;

      /* Tokenizer. */
      function noop() {}

      proto.inlineTokenizers.foo = noop;
      methods.splice(methods.indexOf('inlineText'), 0, 'foo');
    }
  });

  t.test('should warn about entities', st => {
    const filePath = path.join('test', 'fixtures', 'input', 'entities-advanced.text');
    const file = vfile(fs.readFileSync(filePath));
    const notTerminated = 'Named character references must be ' +
      'terminated by a semicolon';

    remark().parse(file);

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

  t.test('should be able to set options', st => {
    const tree = remark().use(plugin).parse([
      '<!-- commonmark -->',
      '',
      '1)   Hello World',
      ''
    ].join('\n'));

    st.equal(tree.children[1].type, 'list');

    st.end();

    function plugin() {
      const html = this.Parser.prototype.blockTokenizers.html;

      this.Parser.prototype.blockTokenizers.html = replacement;

      /* Set option when an HMTL comment occurs. */
      function replacement(eat, value) {
        const node = /<!--\s*(.*?)\s*-->/g.exec(value);
        const options = {};

        if (node) {
          options[node[1]] = true;

          this.setOptions(options);
        }

        return html.apply(this, arguments);
      }
    }
  });

  t.end();
});
