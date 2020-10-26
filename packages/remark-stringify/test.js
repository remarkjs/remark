'use strict'

var test = require('tape')
var unified = require('unified')
var parse = require('../remark-parse')
var gfm = require('mdast-util-gfm/to-markdown')

var stringify = require('.')

test('remark().stringify(ast, file)', function (t) {
  t.equal(
    unified()
      .use(stringify)
      .stringify({
        type: 'root',
        children: [{type: 'html', value: '<!-- last line\n'}]
      })
      .toString(),
    '<!-- last line\n',
    'should not add more than one line feeds at the end'
  )

  t.throws(
    function () {
      unified().use(stringify).stringify(false)
    },
    /false/,
    'should throw when `ast` is not an object'
  )

  t.throws(
    function () {
      unified().use(stringify).stringify({type: 'unicorn'})
    },
    /unicorn/,
    'should throw when `ast` is not a valid node'
  )

  t.throws(
    function () {
      unified()
        .use(stringify)
        .data('settings', {bullet: true})
        .stringify({type: 'listItem'})
    },
    /options\.bullet/,
    'should throw when `options.bullet` is not a valid list bullet'
  )

  t.throws(
    function () {
      unified()
        .use(stringify)
        .data('settings', {listItemIndent: 'foo'})
        .stringify({type: 'listItem'})
    },
    /options\.listItemIndent/,
    'should throw when `options.listItemIndent` is not a valid constant'
  )

  t.throws(
    function () {
      unified()
        .use(stringify)
        .data('settings', {rule: true})
        .stringify({type: 'thematicBreak'})
    },
    /options\.rule/,
    'should throw when `options.rule` is not a valid horizontal rule bullet'
  )

  t.throws(
    function () {
      unified()
        .use(stringify)
        .data('settings', {ruleRepetition: 1})
        .stringify({type: 'thematicBreak'})
    },
    /options\.ruleRepetition/,
    'should throw when `options.ruleRepetition` is too low'
  )

  t.throws(
    function () {
      unified()
        .use(stringify)
        .data('settings', {ruleRepetition: true})
        .stringify({type: 'thematicBreak'})
    },
    /options\.ruleRepetition/,
    'should throw when `options.ruleRepetition` is not a number'
  )

  t.throws(
    function () {
      unified()
        .use(stringify)
        .data('settings', {emphasis: '-'})
        .stringify({type: 'emphasis'})
    },
    /options\.emphasis/,
    'should throw when `options.emphasis` is not a valid emphasis marker'
  )

  t.throws(
    function () {
      unified()
        .use(stringify)
        .data('settings', {strong: '-'})
        .stringify({type: 'strong'})
    },
    /options\.strong/,
    'should throw when `options.strong` is not a valid emphasis marker'
  )

  t.throws(
    function () {
      unified()
        .use(stringify)
        .data('settings', {fence: '-'})
        .stringify({type: 'code'})
    },
    /options\.fence/,
    'should throw when `options.fence` is not a valid fence marker'
  )

  t.test('should support optional list fields', function (st) {
    st.equal(
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

    st.equal(
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

    st.equal(
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

    st.equal(
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

    st.equal(
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

    st.equal(
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

    st.end()

    function toString(value) {
      return String(unified().use(stringify).stringify(value))
    }
  })

  t.test('should support optional list item fields', function (st) {
    var children = [
      {type: 'paragraph', children: [{type: 'text', value: 'alpha'}]},
      {
        type: 'blockquote',
        children: [
          {type: 'paragraph', children: [{type: 'text', value: 'bravo'}]}
        ]
      }
    ]

    st.equal(
      toString({type: 'listItem', children: children}),
      '*   alpha\n\n    > bravo\n',
      'no spread'
    )

    st.equal(
      toString({type: 'listItem', spread: true, children: children}),
      '*   alpha\n\n    > bravo\n',
      'spread: true'
    )

    st.equal(
      toString({type: 'listItem', spread: false, children: children}),
      '*   alpha\n    > bravo\n',
      'spread: false'
    )

    st.end()

    function toString(value) {
      return String(unified().use(stringify).stringify(value))
    }
  })

  t.test('should support empty list items', function (st) {
    st.equal(toString({type: 'listItem', children: []}), '*\n')

    st.end()

    function toString(value) {
      return String(unified().use(stringify).stringify(value))
    }
  })

  t.test('should process references with casing properly', function (st) {
    // Data-driven tests in the format: [name, value]
    var tests = [
      ['capitalized link references - full', '[alpha][Bravo]'],
      ['capitalized link references - collapsed', '[Bravo][]'],
      ['capitalized link references - shortcut', '[Bravo]'],
      ['capitalized image references - full', '![alpha][Bravo]'],
      ['capitalized image references - collapsed', '![Bravo][]'],
      ['capitalized image references - shortcut', '![Bravo]']
    ]

    tests.forEach(function (test) {
      st.equal(
        unified()
          .use(parse)
          .use(stringify)
          .processSync(test[1] + '\n\n[bravo]: #\n')
          .toString(),
        test[1] + '\n\n[bravo]: #\n',
        test[0]
      )
    })

    st.end()
  })

  t.test('should process associations without label', function (st) {
    st.equal(
      toString({type: 'definition', identifier: 'a', url: 'example.com'}),
      '[a]: example.com\n',
      'definition'
    )

    st.equal(
      toString({
        type: 'linkReference',
        identifier: 'a',
        children: [{type: 'text', value: 'b'}]
      }),
      '[b][a]\n',
      'link reference'
    )

    st.equal(
      toString({type: 'imageReference', identifier: 'a', alt: 'b'}),
      '![b][a]\n',
      'image reference'
    )

    st.end()

    function toString(value) {
      return String(unified().use(stringify).stringify(value))
    }
  })

  t.test('should stringify mailto links properly', function (st) {
    st.plan(3)

    var example = '[example@foo.com](mailto:example@foo.com)'
    st.equal(
      unified().use(parse).use(stringify).processSync(example).toString(),
      '<example@foo.com>\n',
      'url is `mailto:` plus link text'
    )

    example = '[mailto:example@foo.com](mailto:example@foo.com)'
    st.equal(
      unified().use(parse).use(stringify).processSync(example).toString(),
      '<mailto:example@foo.com>\n',
      'url is link text'
    )

    example = '[example](mailto:example@foo.com)\n'
    st.equal(
      unified().use(parse).use(stringify).processSync(example).toString(),
      example,
      'url is not link text'
    )
  })

  t.end()
})

test('stringify escapes', function (t) {
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
    toString({type: 'link', children: [{type: 'text', value: 'a]b'}]}),
    '[a\\]b]()\n',
    '`]` (in links)'
  )
  t.equal(
    toString({type: 'image', alt: 'a]b'}),
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
        {type: 'link', children: [{type: 'text', value: 'a'}]}
      ]
    }),
    '\\![a]()\n',
    '! immediately followed by a link'
  )

  t.end()
})

test('extensions', function (t) {
  var doc = unified()
    .data('toMarkdownExtensions', [gfm()])
    .use(stringify)
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
          start: null,
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

function toString(value, options) {
  var tree =
    typeof value === 'string'
      ? {type: 'paragraph', children: [{type: 'text', value: value}]}
      : value

  return unified().use(stringify, options).stringify(tree)
}
