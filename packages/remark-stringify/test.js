/**
 * @typedef {import('mdast').Root} Root
 * @typedef {import('mdast').Content} Content
 * @typedef {import('mdast').BlockContent} BlockContent
 * @typedef {import('./index.js').Options} Options
 */

import test from 'tape'
import {unified} from 'unified'
import {gfmToMarkdown} from 'mdast-util-gfm'
import remarkParse from '../remark-parse/index.js'
import remarkStringify from './index.js'

test('remarkStringify', (t) => {
  t.equal(
    unified()
      .use(remarkStringify)
      .stringify({
        type: 'root',
        children: [{type: 'html', value: '<!-- last line\n'}]
      })
      .toString(),
    '<!-- last line\n',
    'should not add more than one line feeds at the end'
  )

  t.throws(
    () => {
      // @ts-expect-error: not a node.
      unified().use(remarkStringify).stringify(false)
    },
    /false/,
    'should throw when `ast` is not an object'
  )

  t.throws(
    () => {
      // @ts-expect-error: not a known node.
      unified().use(remarkStringify).stringify({type: 'unicorn'})
    },
    /unicorn/,
    'should throw when `ast` is not a valid node'
  )

  t.throws(
    () => {
      unified()
        .use(remarkStringify)
        .data('settings', {bullet: true})
        .stringify({
          type: 'root',
          children: [
            {type: 'list', children: [{type: 'listItem', children: []}]}
          ]
        })
    },
    /options\.bullet/,
    'should throw when `options.bullet` is not a valid list bullet'
  )

  t.throws(
    () => {
      unified()
        .use(remarkStringify)
        .data('settings', {listItemIndent: 'foo'})
        .stringify({
          type: 'root',
          children: [
            {type: 'list', children: [{type: 'listItem', children: []}]}
          ]
        })
    },
    /options\.listItemIndent/,
    'should throw when `options.listItemIndent` is not a valid constant'
  )

  t.throws(
    () => {
      unified()
        .use(remarkStringify)
        .data('settings', {rule: true})
        .stringify({type: 'root', children: [{type: 'thematicBreak'}]})
    },
    /options\.rule/,
    'should throw when `options.rule` is not a valid horizontal rule bullet'
  )

  t.throws(
    () => {
      unified()
        .use(remarkStringify)
        .data('settings', {ruleRepetition: 1})
        .stringify({type: 'root', children: [{type: 'thematicBreak'}]})
    },
    /options\.ruleRepetition/,
    'should throw when `options.ruleRepetition` is too low'
  )

  t.throws(
    () => {
      unified()
        .use(remarkStringify)
        .data('settings', {ruleRepetition: true})
        .stringify({type: 'root', children: [{type: 'thematicBreak'}]})
    },
    /options\.ruleRepetition/,
    'should throw when `options.ruleRepetition` is not a number'
  )

  t.throws(
    () => {
      unified()
        .use(remarkStringify)
        .data('settings', {emphasis: '-'})
        .stringify({type: 'root', children: [{type: 'emphasis', children: []}]})
    },
    /options\.emphasis/,
    'should throw when `options.emphasis` is not a valid emphasis marker'
  )

  t.throws(
    () => {
      unified()
        .use(remarkStringify)
        .data('settings', {strong: '-'})
        .stringify({type: 'root', children: [{type: 'strong', children: []}]})
    },
    /options\.strong/,
    'should throw when `options.strong` is not a valid emphasis marker'
  )

  t.throws(
    () => {
      unified()
        .use(remarkStringify)
        .data('settings', {fence: '-'})
        .stringify({type: 'root', children: [{type: 'code', value: ''}]})
    },
    /options\.fence/,
    'should throw when `options.fence` is not a valid fence marker'
  )

  t.test('should support optional list fields', (t) => {
    t.equal(
      toString({
        type: 'list',
        children: [
          {
            type: 'listItem',
            children: [
              {type: 'paragraph', children: [{type: 'text', value: 'alpha'}]}
            ]
          }
        ]
      }),
      '*   alpha\n',
      'no ordered, start, or spread'
    )

    t.equal(
      toString({
        type: 'list',
        start: 2,
        children: [
          {
            type: 'listItem',
            children: [
              {type: 'paragraph', children: [{type: 'text', value: 'bravo'}]}
            ]
          }
        ]
      }),
      '*   bravo\n',
      'start; no ordered or spread'
    )

    t.equal(
      toString({
        type: 'list',
        spread: true,
        children: [
          {
            type: 'listItem',
            children: [
              {type: 'paragraph', children: [{type: 'text', value: 'charlie'}]}
            ]
          },
          {
            type: 'listItem',
            children: [
              {type: 'paragraph', children: [{type: 'text', value: 'delta'}]}
            ]
          }
        ]
      }),
      '*   charlie\n\n*   delta\n',
      'spread; no ordered or start'
    )

    t.equal(
      toString({
        type: 'list',
        ordered: true,
        children: [
          {
            type: 'listItem',
            children: [
              {
                type: 'paragraph',
                children: [{type: 'text', value: 'echo'}]
              }
            ]
          }
        ]
      }),
      '1.  echo\n',
      'ordered; no start or spread'
    )

    t.equal(
      toString({
        type: 'list',
        ordered: true,
        spread: true,
        children: [
          {
            type: 'listItem',
            children: [
              {type: 'paragraph', children: [{type: 'text', value: 'foxtrot'}]}
            ]
          },
          {
            type: 'listItem',
            children: [
              {type: 'paragraph', children: [{type: 'text', value: 'golf'}]}
            ]
          }
        ]
      }),
      '1.  foxtrot\n\n2.  golf\n',
      'ordered and spread; no start'
    )

    t.equal(
      toString({
        type: 'list',
        ordered: true,
        spread: true,
        start: 3,
        children: [
          {
            type: 'listItem',
            children: [
              {type: 'paragraph', children: [{type: 'text', value: 'hotel'}]}
            ]
          },
          {
            type: 'listItem',
            children: [
              {type: 'paragraph', children: [{type: 'text', value: 'india'}]}
            ]
          }
        ]
      }),
      '3.  hotel\n\n4.  india\n',
      'ordered, spread, and start'
    )

    t.end()
  })

  t.test('should support optional list item fields', (t) => {
    /** @type {BlockContent[]} */
    const children = [
      {type: 'paragraph', children: [{type: 'text', value: 'alpha'}]},
      {
        type: 'blockquote',
        children: [
          {type: 'paragraph', children: [{type: 'text', value: 'bravo'}]}
        ]
      }
    ]

    t.equal(
      toString({type: 'listItem', children}),
      '*   alpha\n\n    > bravo\n',
      'no spread'
    )

    t.equal(
      toString({type: 'listItem', spread: true, children}),
      '*   alpha\n\n    > bravo\n',
      'spread: true'
    )

    t.equal(
      toString({type: 'listItem', spread: false, children}),
      '*   alpha\n    > bravo\n',
      'spread: false'
    )

    t.end()
  })

  t.test('should support empty list items', (t) => {
    t.equal(toString({type: 'listItem', children: []}), '*\n')

    t.end()
  })

  t.test('should process references with casing properly', (t) => {
    // Data-driven tests in the format: [name, value]
    const tests = [
      ['capitalized link references - full', '[alpha][Bravo]'],
      ['capitalized link references - collapsed', '[Bravo][]'],
      ['capitalized link references - shortcut', '[Bravo]'],
      ['capitalized image references - full', '![alpha][Bravo]'],
      ['capitalized image references - collapsed', '![Bravo][]'],
      ['capitalized image references - shortcut', '![Bravo]']
    ]
    let index = -1

    while (++index < tests.length) {
      const test = tests[index]

      t.equal(
        unified()
          .use(remarkParse)
          .use(remarkStringify)
          .processSync(test[1] + '\n\n[bravo]: #\n')
          .toString(),
        test[1] + '\n\n[bravo]: #\n',
        test[0]
      )
    }

    t.end()
  })

  t.test('should process associations without label', (t) => {
    t.equal(
      toString({type: 'definition', identifier: 'a', url: 'example.com'}),
      '[a]: example.com\n',
      'definition'
    )

    t.equal(
      toString({
        type: 'linkReference',
        identifier: 'a',
        referenceType: 'full',
        children: [{type: 'text', value: 'b'}]
      }),
      '[b][a]\n',
      'link reference'
    )

    t.equal(
      toString({
        type: 'imageReference',
        referenceType: 'full',
        identifier: 'a',
        alt: 'b'
      }),
      '![b][a]\n',
      'image reference'
    )

    t.end()
  })

  t.test('should stringify mailto links properly', (t) => {
    t.plan(3)

    t.equal(
      unified()
        .use(remarkParse)
        .use(remarkStringify)
        .processSync('[example@foo.com](mailto:example@foo.com)')
        .toString(),
      '<example@foo.com>\n',
      'url is `mailto:` plus link text'
    )

    t.equal(
      unified()
        .use(remarkParse)
        .use(remarkStringify)
        .processSync('[mailto:example@foo.com](mailto:example@foo.com)')
        .toString(),
      '<mailto:example@foo.com>\n',
      'url is link text'
    )

    t.equal(
      unified()
        .use(remarkParse)
        .use(remarkStringify)
        .processSync('[example](mailto:example@foo.com)\n')
        .toString(),
      '[example](mailto:example@foo.com)\n',
      'url is not link text'
    )
  })

  t.end()
})

test('stringify escapes', (t) => {
  t.equal(toString('a\\b'), 'a\\b\n', '`\\`')
  t.equal(toString('a\\-b'), 'a\\\\-b\n', '`\\` followed by punctuation')
  t.equal(toString('a`b'), 'a\\`b\n', '`` ` ``')
  t.equal(toString('a*b'), 'a\\*b\n', '`*`')
  t.equal(toString('a[b'), 'a\\[b\n', '`[`')
  t.equal(toString('a<b'), 'a\\<b\n', '`<`')
  t.equal(toString('a&b'), 'a\\&b\n', '`&`')
  t.equal(toString('a&amp;b'), 'a\\&amp;b\n', 'entities')
  t.equal(toString('a]b'), 'a]b\n', '`]`')
  t.equal(
    toString({type: 'link', url: '', children: [{type: 'text', value: 'a]b'}]}),
    '[a\\]b]()\n',
    '`]` (in links)'
  )
  t.equal(
    toString({type: 'image', url: '', alt: 'a]b'}),
    '![a\\]b]()\n',
    '`]` (in images)'
  )
  t.equal(toString('![a'), '!\\[a\n', 'the `[` in `![`')
  t.equal(toString('a~b'), 'a~b\n', '`~`')
  t.equal(toString('a|b'), 'a|b\n', '`|`')
  t.equal(toString('a_b'), 'a_b\n', '`_` (in words)')
  t.equal(toString('a _b'), 'a \\_b\n', '`_` after `\\b`')
  t.equal(toString('a_ b'), 'a\\_ b\n', '`_` before `\\b`')
  t.equal(toString('a:b'), 'a:b\n', '`:`')
  t.equal(toString('>a'), '\\>a\n', '`>` (at the start of a line)')
  t.equal(toString('a>b'), 'a>b\n', '`>` (in phrasing)')
  t.equal(toString('#a'), '\\#a\n', '`#` (at the start of a line)')
  t.equal(toString('a#b'), 'a#b\n', '`#` (in phrasing)')
  t.equal(toString('*a'), '\\*a\n', '`*` (at the start of a line)')
  t.equal(toString('a*b'), 'a\\*b\n', '`*` (in content)')
  t.equal(toString('-a'), '\\-a\n', '`-` (at the start of a line)')
  t.equal(toString('a-b'), 'a-b\n', '`-` (in phrasing)')
  t.equal(toString('+a'), '\\+a\n', '`+` (at the start of the line)')
  t.equal(toString('+a'), '\\+a\n', '`+` (phrasing)')
  t.equal(toString('.a'), '.a\n', '`.`')
  t.equal(toString('1.a'), '1.a\n', '`.` (after digit before letter)')
  t.equal(toString('1. '), '1\\. \n', '`.` (after digit, with space)')
  t.equal(toString('1.\t'), '1\\.\t\n', '`.` (after digit, with tab)')
  t.equal(toString('1.\n'), '1\\.\n', '`.` (after digit, with newline)')
  t.equal(toString('1.'), '1\\.\n', '`.` (after digit, with EOF)')
  t.equal(toString('1.a'), '1.a\n', '`1.` (after digit, before letter)')
  t.equal(toString('1. '), '1\\. \n', '`1.` (after digit, with space)')
  t.equal(toString('1.\t'), '1\\.\t\n', '`1.` (after digit, with tab)')
  t.equal(toString('1.\n'), '1\\.\n', '`1.` (after digit, with newline)')
  t.equal(toString('1.'), '1\\.\n', '`1.` (after digit, with EOF)')
  t.equal(toString(')a'), ')a\n', '`)`')
  t.equal(toString('1)a'), '1\\)a\n', '`)` (after digit)')
  t.equal(toString('1) '), '1\\) \n', '`)` (after digit, with space)')
  t.equal(toString('1)\t'), '1\\)\t\n', '`)` (after digit, with tab)')
  t.equal(toString('1)\n'), '1\\)\n', '`)` (after digit, with newline)')
  t.equal(toString('1)'), '1\\)\n', '`)` (after digit, with EOL)')
  t.equal(toString('a](b'), 'a]\\(b\n', '`(` after `]`')
  t.equal(
    toString({
      type: 'paragraph',
      children: [
        {type: 'text', value: '!'},
        {type: 'link', url: '', children: [{type: 'text', value: 'a'}]}
      ]
    }),
    '\\![a]()\n',
    '! immediately followed by a link'
  )

  t.end()
})

test('extensions', (t) => {
  const doc = unified()
    .data('toMarkdownExtensions', [gfmToMarkdown()])
    .use(remarkStringify)
    .stringify({
      type: 'root',
      children: [
        {type: 'heading', depth: 1, children: [{type: 'text', value: 'GFM'}]},
        {
          type: 'heading',
          depth: 2,
          children: [{type: 'text', value: 'Autolink literals'}]
        },
        {
          type: 'paragraph',
          children: [
            {
              type: 'link',
              title: null,
              url: 'http://www.example.com',
              children: [{type: 'text', value: 'www.example.com'}]
            },
            {type: 'text', value: ', '},
            {
              type: 'link',
              title: null,
              url: 'https://example.com',
              children: [{type: 'text', value: 'https://example.com'}]
            },
            {type: 'text', value: ', and '},
            {
              type: 'link',
              title: null,
              url: 'mailto:contact@example.com',
              children: [{type: 'text', value: 'contact@example.com'}]
            },
            {type: 'text', value: '.'}
          ]
        },
        {
          type: 'heading',
          depth: 2,
          children: [{type: 'text', value: 'Strikethrough'}]
        },
        {
          type: 'paragraph',
          children: [
            {
              type: 'delete',
              children: [{type: 'text', value: 'one'}]
            },
            {type: 'text', value: ' or '},
            {
              type: 'delete',
              children: [{type: 'text', value: 'two'}]
            },
            {type: 'text', value: ' tildes.'}
          ]
        },
        {type: 'heading', depth: 2, children: [{type: 'text', value: 'Table'}]},
        {
          type: 'table',
          align: [null, 'left', 'right', 'center'],
          children: [
            {
              type: 'tableRow',
              children: [
                {type: 'tableCell', children: [{type: 'text', value: 'a'}]},
                {type: 'tableCell', children: [{type: 'text', value: 'b'}]},
                {type: 'tableCell', children: [{type: 'text', value: 'c'}]},
                {type: 'tableCell', children: [{type: 'text', value: 'd'}]}
              ]
            }
          ]
        },
        {
          type: 'heading',
          depth: 2,
          children: [{type: 'text', value: 'Tasklist'}]
        },
        {
          type: 'list',
          ordered: false,
          start: undefined,
          spread: false,
          children: [
            {
              type: 'listItem',
              spread: false,
              checked: false,
              children: [
                {type: 'paragraph', children: [{type: 'text', value: 'to do'}]}
              ]
            },
            {
              type: 'listItem',
              spread: false,
              checked: true,
              children: [
                {type: 'paragraph', children: [{type: 'text', value: 'done'}]}
              ]
            }
          ]
        }
      ]
    })

  t.equal(
    doc,
    [
      '# GFM',
      '',
      '## Autolink literals',
      '',
      '[www.example.com](http://www.example.com), <https://example.com>, and <contact@example.com>.',
      '',
      '## Strikethrough',
      '',
      '~~one~~ or ~~two~~ tildes.',
      '',
      '## Table',
      '',
      '| a | b  |  c |  d  |',
      '| - | :- | -: | :-: |',
      '',
      '## Tasklist',
      '',
      '*   [ ] to do',
      '*   [x] done',
      ''
    ].join('\n')
  )

  t.end()
})

/**
 * @param {Root|Content|string} value
 * @param {Options} [options]
 * @returns {string}
 */
function toString(value, options) {
  if (typeof value === 'string') {
    value = {type: 'paragraph', children: [{type: 'text', value}]}
  }

  if (value.type !== 'root') {
    value = {type: 'root', children: [value]}
  }

  return unified().use(remarkStringify, options).stringify(value)
}
