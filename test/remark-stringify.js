/**
 * @author Titus Wormer
 * @copyright 2015 Titus Wormer
 * @license MIT
 * @module remark
 * @fileoverview Test suite for `remark.stringify()`.
 */

/* Dependencies. */
import test from 'tape';
import remark from '../packages/remark';
import stringify from '../packages/remark-stringify';

const Compiler = stringify.Compiler;

/* Construct an empty node. */
function empty() {
  return {type: 'root', children: []};
}

/* Test `remark-stringify`. */
test('remark().stringify(ast, file)', t => {
  t.throws(
    () => {
      remark().stringify(false);
    },
    /false/,
    'should throw when `ast` is not an object'
  );

  t.doesNotThrow(
    () => {
      const compiler = new Compiler();
      compiler.setOptions();
    },
    'should not throw when setting nothing'
  );

  t.throws(
    () => {
      const compiler = new Compiler();
      compiler.setOptions(true);
    },
    /^Error: Invalid value `true` for setting `options`$/,
    'should throw when setting invalid values'
  );

  t.test('should ignore nully numbers', st => {
    const compiler = new Compiler();
    compiler.setOptions({ruleRepetition: null});
    st.equal(compiler.options.ruleRepetition, 3);
    st.end();
  });

  t.test('should ignore nully strings', st => {
    const compiler = new Compiler();
    compiler.setOptions({listItemIndent: null});
    st.equal(compiler.options.listItemIndent, 'tab');
    st.end();
  });

  t.throws(
    () => {
      remark().stringify({type: 'unicorn'});
    },
    /unicorn/,
    'should throw when `ast` is not a valid node'
  );

  t.throws(
    () => {
      remark().data('settings', {bullet: true}).stringify(empty());
    },
    /options\.bullet/,
    'should throw when `options.bullet` is not a valid list bullet'
  );

  t.throws(
    () => {
      remark().data('settings', {listItemIndent: 'foo'}).stringify(empty());
    },
    /options\.listItemIndent/,
    'should throw when `options.listItemIndent` is not a valid ' +
    'constant'
  );

  t.throws(
    () => {
      remark().data('settings', {rule: true}).stringify(empty());
    },
    /options\.rule/,
    'should throw when `options.rule` is not a valid ' +
    'horizontal rule bullet'
  );

  t.throws(
    () => {
      remark().data('settings', {ruleSpaces: 1}).stringify(empty());
    },
    /options\.ruleSpaces/,
    'should throw when `options.ruleSpaces` is not a boolean'
  );

  t.throws(
    () => {
      remark().data('settings', {ruleRepetition: 1}).stringify(empty());
    },
    /options\.ruleRepetition/,
    'should throw when `options.ruleRepetition` is too low'
  );

  t.throws(
    () => {
      remark().data('settings', {ruleRepetition: NaN}).stringify(empty());
    },
    /options\.ruleRepetition/,
    'should throw when `options.ruleRepetition` is `NaN`'
  );

  t.throws(
    () => {
      remark().data('settings', {ruleRepetition: true}).stringify(empty());
    },
    /options\.ruleRepetition/,
    'should throw when `options.ruleRepetition` is not a number'
  );

  t.throws(
    () => {
      remark().data('settings', {emphasis: '-'}).stringify(empty());
    },
    /options\.emphasis/,
    'should throw when `options.emphasis` is not a ' +
    'valid emphasis marker'
  );

  t.throws(
    () => {
      remark().data('settings', {strong: '-'}).stringify(empty());
    },
    /options\.strong/,
    'should throw when `options.strong` is not a ' +
    'valid emphasis marker'
  );

  t.throws(
    () => {
      remark().data('settings', {setext: 0}).stringify(empty());
    },
    /options\.setext/,
    'should throw when `options.setext` is not a boolean'
  );

  t.throws(
    () => {
      remark().data('settings', {incrementListMarker: -1}).stringify(empty());
    },
    /options\.incrementListMarker/,
    'should throw when `options.incrementListMarker` is not a ' +
    'boolean'
  );

  t.throws(
    () => {
      remark().data('settings', {fences: NaN}).stringify(empty());
    },
    /options\.fences/,
    'should throw when `options.fences` is not a boolean'
  );

  t.throws(
    () => {
      remark().data('settings', {fence: '-'}).stringify(empty());
    },
    /options\.fence/,
    'should throw when `options.fence` is not a ' +
    'valid fence marker'
  );

  t.throws(
    () => {
      remark().data('settings', {closeAtx: NaN}).stringify(empty());
    },
    /options\.closeAtx/,
    'should throw when `options.closeAtx` is not a boolean'
  );

  t.throws(
    () => {
      remark().data('settings', {looseTable: '!'}).stringify(empty());
    },
    /options\.looseTable/,
    'should throw when `options.looseTable` is not a boolean'
  );

  t.throws(
    () => {
      remark().data('settings', {spacedTable: '?'}).stringify(empty());
    },
    /options\.spacedTable/,
    'should throw when `options.spacedTable` is not a boolean'
  );

  t.throws(
    () => {
      remark().data('settings', {paddedTable: '.'}).stringify(empty());
    },
    /options\.paddedTable/,
    'should throw when `options.paddedTable` is not a boolean'
  );

  t.test('should support valid strings', st => {
    const compiler = new Compiler();
    st.equal(compiler.options.listItemIndent, 'tab');
    compiler.setOptions({listItemIndent: 'mixed'});
    st.equal(compiler.options.listItemIndent, 'mixed');
    st.end();
  });

  t.test('should support valid numbers', st => {
    const compiler = new Compiler();
    st.equal(compiler.options.ruleRepetition, 3);
    compiler.setOptions({ruleRepetition: 5});
    st.equal(compiler.options.ruleRepetition, 5);
    st.end();
  });

  t.test('should support valid booleans', st => {
    const compiler = new Compiler();
    st.equal(compiler.options.looseTable, false);
    compiler.setOptions({looseTable: true});
    st.equal(compiler.options.looseTable, true);
    st.end();
  });

  t.test('should support valid enums', st => {
    const compiler = new Compiler();
    st.equal(compiler.options.strong, '*');
    compiler.setOptions({strong: '_'});
    st.equal(compiler.options.strong, '_');
    st.end();
  });

  t.test('should be able to set options', st => {
    const processor = remark().use(plugin);
    const tree = processor.parse([
      '<!-- setext -->',
      '',
      '# Hello World',
      ''
    ].join('\n'));

    st.equal(
      processor.stringify(tree),
      [
        '<!-- setext -->',
        '',
        'Hello World',
        '===========',
        ''
      ].join('\n')
    );

    function plugin() {
      const html = processor.Compiler.prototype.visitors.html;

      processor.Compiler.prototype.visitors.html = replacement;

      /* Set option when an HMTL comment occurs */
      function replacement(node) {
        const value = node.value;
        const result = /<!--\s*(.*?)\s*-->/g.exec(value);
        const options = {};

        if (result) {
          options[result[1]] = true;

          this.setOptions(options);
        }

        return html.apply(this, arguments);
      }
    }

    st.end();
  });

  t.end();
});
