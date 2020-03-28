'use strict'

var test = require('tape')
var wcwidth = require('wcwidth')
var u = require('unist-builder')
var visit = require('unist-util-visit')
var unified = require('unified')
var parse = require('../remark-parse')

var stringify = require('.')

var Compiler = stringify.Compiler

var commonmark = {commonmark: true}
var pedantic = {pedantic: true}
var uncollapsable = {start: {line: 1, column: NaN}, end: {line: 1, column: NaN}}

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

  t.doesNotThrow(function () {
    var compiler = new Compiler()
    compiler.setOptions()
  }, 'should not throw when setting nothing')

  t.throws(
    function () {
      var compiler = new Compiler()
      compiler.setOptions(true)
    },
    /^Error: Invalid value `true` for setting `options`$/,
    'should throw when setting invalid values'
  )

  t.test('should ignore nully numbers', function (st) {
    var compiler = new Compiler()
    compiler.setOptions({ruleRepetition: null})
    st.equal(compiler.options.ruleRepetition, 3)
    st.end()
  })

  t.test('should ignore nully strings', function (st) {
    var compiler = new Compiler()
    compiler.setOptions({listItemIndent: null})
    st.equal(compiler.options.listItemIndent, 'tab')
    st.end()
  })

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
        .stringify(empty())
    },
    /options\.bullet/,
    'should throw when `options.bullet` is not a valid list bullet'
  )

  t.throws(
    function () {
      unified()
        .use(stringify)
        .data('settings', {listItemIndent: 'foo'})
        .stringify(empty())
    },
    /options\.listItemIndent/,
    'should throw when `options.listItemIndent` is not a valid constant'
  )

  t.throws(
    function () {
      unified().use(stringify).data('settings', {rule: true}).stringify(empty())
    },
    /options\.rule/,
    'should throw when `options.rule` is not a valid horizontal rule bullet'
  )

  t.throws(
    function () {
      unified()
        .use(stringify)
        .data('settings', {ruleSpaces: 1})
        .stringify(empty())
    },
    /options\.ruleSpaces/,
    'should throw when `options.ruleSpaces` is not a boolean'
  )

  t.throws(
    function () {
      unified()
        .use(stringify)
        .data('settings', {ruleRepetition: 1})
        .stringify(empty())
    },
    /options\.ruleRepetition/,
    'should throw when `options.ruleRepetition` is too low'
  )

  t.throws(
    function () {
      unified()
        .use(stringify)
        .data('settings', {ruleRepetition: NaN})
        .stringify(empty())
    },
    /options\.ruleRepetition/,
    'should throw when `options.ruleRepetition` is `NaN`'
  )

  t.throws(
    function () {
      unified()
        .use(stringify)
        .data('settings', {ruleRepetition: true})
        .stringify(empty())
    },
    /options\.ruleRepetition/,
    'should throw when `options.ruleRepetition` is not a number'
  )

  t.throws(
    function () {
      unified()
        .use(stringify)
        .data('settings', {emphasis: '-'})
        .stringify(empty())
    },
    /options\.emphasis/,
    'should throw when `options.emphasis` is not a valid emphasis marker'
  )

  t.throws(
    function () {
      unified()
        .use(stringify)
        .data('settings', {strong: '-'})
        .stringify(empty())
    },
    /options\.strong/,
    'should throw when `options.strong` is not a valid emphasis marker'
  )

  t.throws(
    function () {
      unified().use(stringify).data('settings', {setext: 0}).stringify(empty())
    },
    /options\.setext/,
    'should throw when `options.setext` is not a boolean'
  )

  t.throws(
    function () {
      unified()
        .use(stringify)
        .data('settings', {incrementListMarker: -1})
        .stringify(empty())
    },
    /options\.incrementListMarker/,
    'should throw when `options.incrementListMarker` is not a boolean'
  )

  t.throws(
    function () {
      unified()
        .use(stringify)
        .data('settings', {fences: NaN})
        .stringify(empty())
    },
    /options\.fences/,
    'should throw when `options.fences` is not a boolean'
  )

  t.throws(
    function () {
      unified().use(stringify).data('settings', {fence: '-'}).stringify(empty())
    },
    /options\.fence/,
    'should throw when `options.fence` is not a valid fence marker'
  )

  t.throws(
    function () {
      unified()
        .use(stringify)
        .data('settings', {closeAtx: NaN})
        .stringify(empty())
    },
    /options\.closeAtx/,
    'should throw when `options.closeAtx` is not a boolean'
  )

  t.throws(
    function () {
      unified()
        .use(stringify)
        .data('settings', {tableCellPadding: '?'})
        .stringify(empty())
    },
    /options\.tableCellPadding/,
    'should throw when `options.tableCellPadding` is not a boolean'
  )

  t.throws(
    function () {
      unified()
        .use(stringify)
        .data('settings', {tablePipeAlign: '.'})
        .stringify(empty())
    },
    /options\.tablePipeAlign/,
    'should throw when `options.tablePipeAlign` is not a boolean'
  )

  t.throws(
    function () {
      unified()
        .use(stringify)
        .data('settings', {stringLength: 1})
        .stringify(empty())
    },
    /options\.stringLength/,
    'should throw when `options.stringLength` is not a function'
  )

  t.test('should handle underscores in emphasis in pedantic mode', function (
    st
  ) {
    st.plan(2)

    var example = '*alpha_bravo*\n'

    // Without pedantic mode, emphasis always defaults to underscores.
    st.equal(
      unified().use(parse).use(stringify).processSync(example).toString(),
      '_alpha_bravo_\n',
      'baseline'
    )

    // With pedantic mode, emphasis will default to asterisks if the text to be
    // emphasized contains underscores.
    st.equal(
      unified()
        .use(parse)
        .use(stringify)
        .use({settings: {pedantic: true}})
        .processSync(example)
        .toString(),
      '*alpha\\_bravo*\n',
      'pedantic'
    )
  })

  t.test('should support optional list fields', function (st) {
    st.equal(
      toString({
        type: 'list',
        children: [
          {
            type: 'listItem',
            children: [
              {
                type: 'paragraph',
                children: [{type: 'text', value: 'alpha'}]
              }
            ]
          }
        ]
      }),
      '-   alpha',
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
              {
                type: 'paragraph',
                children: [{type: 'text', value: 'bravo'}]
              }
            ]
          }
        ]
      }),
      '-   bravo',
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
              {
                type: 'paragraph',
                children: [{type: 'text', value: 'charlie'}]
              }
            ]
          },
          {
            type: 'listItem',
            children: [
              {
                type: 'paragraph',
                children: [{type: 'text', value: 'delta'}]
              }
            ]
          }
        ]
      }),
      '-   charlie\n\n-   delta',
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
      '1.  echo',
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
              {
                type: 'paragraph',
                children: [{type: 'text', value: 'foxtrot'}]
              }
            ]
          },
          {
            type: 'listItem',
            children: [
              {
                type: 'paragraph',
                children: [{type: 'text', value: 'golf'}]
              }
            ]
          }
        ]
      }),
      '1.  foxtrot\n\n2.  golf',
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
              {
                type: 'paragraph',
                children: [{type: 'text', value: 'hotel'}]
              }
            ]
          },
          {
            type: 'listItem',
            children: [
              {
                type: 'paragraph',
                children: [{type: 'text', value: 'india'}]
              }
            ]
          }
        ]
      }),
      '3.  hotel\n\n4.  india',
      'ordered, spread, and start'
    )

    st.end()

    function toString(value) {
      return String(unified().use(stringify).stringify(value))
    }
  })

  t.test('should support optional list item fields', function (st) {
    var children = [
      {
        type: 'paragraph',
        children: [{type: 'text', value: 'alpha'}]
      },
      {
        type: 'blockquote',
        children: [
          {
            type: 'paragraph',
            children: [{type: 'text', value: 'bravo'}]
          }
        ]
      }
    ]

    st.equal(
      toString({type: 'listItem', children: children}),
      '-   alpha\n\n    > bravo',
      'no checked or spread'
    )

    st.equal(
      toString({type: 'listItem', checked: true, children: children}),
      '-   [x] alpha\n\n    > bravo',
      'checked; no spread'
    )

    st.equal(
      toString({type: 'listItem', spread: true, children: children}),
      '-   alpha\n\n    > bravo',
      'spread: true; no checked'
    )

    st.equal(
      toString({type: 'listItem', spread: false, children: children}),
      '-   alpha\n    > bravo',
      'spread: false; no checked'
    )

    st.equal(
      toString({
        type: 'listItem',
        checked: false,
        spread: false,
        children: children
      }),
      '-   [ ] alpha\n    > bravo',
      'spread and checked'
    )

    st.end()

    function toString(value) {
      return String(unified().use(stringify).stringify(value))
    }
  })

  t.test('should support empty list items', function (st) {
    st.equal(toString({type: 'listItem', children: []}), '-', 'no checked')

    st.equal(
      toString({type: 'listItem', checked: true, children: []}),
      '-   [x] ',
      'checked'
    )

    st.end()

    function toString(value) {
      return String(unified().use(stringify).stringify(value))
    }
  })

  t.test(
    'emphasis in pedantic mode should support a variety of contained inline content',
    function (st) {
      // Data-driven tests in the format: [name, input, expected]
      var tests = [
        ['words with asterisks', '*inner content*', '_inner content_\n'],
        ['words with underscores', '_inner content_', '_inner content_\n'],
        ['links', '*[](http://some_url.com)*', '*[](http://some_url.com)*\n'],
        [
          'underscores inside asterisks',
          '*inner content _with_ emphasis*',
          '*inner content _with_ emphasis*\n'
        ],
        [
          'asterisks inside underscores',
          '_inner content *with* emphasis_',
          '*inner content _with_ emphasis*\n'
        ],
        [
          'images',
          '*![](http://some_url.com/img.jpg)*',
          '*![](http://some_url.com/img.jpg)*\n'
        ],
        [
          'inline code with asterisks',
          '*content `with` code*',
          '_content `with` code_\n'
        ],
        [
          'inline code with underscores',
          '_content `with` code_',
          '_content `with` code_\n'
        ]
      ]

      st.plan(tests.length)
      tests.forEach(function (test) {
        st.equal(
          unified()
            .use(parse)
            .use(stringify)
            .use({settings: {pedantic: true}})
            .processSync(test[1])
            .toString(),
          test[2],
          test[0]
        )
      })
    }
  )

  t.test('should process references with casing properly', function (st) {
    // Data-driven tests in the format: [name, value]
    var tests = [
      ['capitalized link references - full', '[alpha][Bravo]'],
      ['capitalized link references - collapsed', '[Bravo][]'],
      ['capitalized link references - shortcut', '[Bravo]'],
      ['capitalized image references - full', '![alpha][Bravo]'],
      ['capitalized image references - collapsed', '![Bravo][]'],
      ['capitalized image references - shortcut', '![Bravo]'],
      ['capitalized footnote references', '[^Alpha]']
    ]

    tests.forEach(each)

    st.end()

    function each(test) {
      st.equal(
        unified().use(parse).use(stringify).processSync(test[1]).toString(),
        test[1] + '\n',
        test[0]
      )
    }
  })

  t.test('should process associations without label', function (st) {
    st.equal(
      toString({
        type: 'definition',
        identifier: 'a',
        url: 'example.com'
      }),
      '[a]: example.com',
      'definition'
    )

    st.equal(
      toString({
        type: 'footnoteDefinition',
        identifier: 'a',
        children: [
          {
            type: 'paragraph',
            children: [{type: 'text', value: 'b'}]
          }
        ]
      }),
      '[^a]: b',
      'footnote definition'
    )

    st.equal(
      toString({
        type: 'linkReference',
        identifier: 'a',
        children: [{type: 'text', value: 'b'}]
      }),
      '[b][a]',
      'link reference'
    )

    st.equal(
      toString({
        type: 'imageReference',
        identifier: 'a',
        alt: 'b'
      }),
      '![b][a]',
      'image reference'
    )

    st.equal(
      toString({
        type: 'footnoteReference',
        identifier: 'a'
      }),
      '[^a]',
      'footnote reference'
    )

    st.end()

    function toString(value) {
      return String(unified().use(stringify).stringify(value))
    }
  })

  t.test('should support `stringLength`', function (st) {
    st.plan(2)

    var example = [
      '| alpha | bravo   |',
      '| ----- | ------- |',
      '| 中文  | charlie |',
      ''
    ].join('\n')

    st.equal(
      unified().use(parse).use(stringify).processSync(example).toString(),
      [
        '| alpha | bravo   |',
        '| ----- | ------- |',
        '| 中文    | charlie |',
        ''
      ].join('\n'),
      'baseline'
    )

    st.equal(
      unified()
        .use(parse)
        .use(stringify)
        .use({settings: {stringLength: wcwidth}})
        .processSync(example)
        .toString(),
      [
        '| alpha | bravo   |',
        '| ----- | ------- |',
        '| 中文  | charlie |',
        ''
      ].join('\n'),
      'custom `stringLength`'
    )
  })

  t.test('should support valid strings', function (st) {
    var compiler = new Compiler()
    st.equal(compiler.options.listItemIndent, 'tab')
    compiler.setOptions({listItemIndent: 'mixed'})
    st.equal(compiler.options.listItemIndent, 'mixed')
    st.end()
  })

  t.test('should support valid numbers', function (st) {
    var compiler = new Compiler()
    st.equal(compiler.options.ruleRepetition, 3)
    compiler.setOptions({ruleRepetition: 5})
    st.equal(compiler.options.ruleRepetition, 5)
    st.end()
  })

  t.test('should support valid booleans', function (st) {
    var compiler = new Compiler()
    st.equal(compiler.options.setext, false)
    compiler.setOptions({setext: true})
    st.equal(compiler.options.setext, true)
    st.end()
  })

  t.test('should support valid enums', function (st) {
    var compiler = new Compiler()
    st.equal(compiler.options.strong, '*')
    compiler.setOptions({strong: '_'})
    st.equal(compiler.options.strong, '_')
    st.end()
  })

  t.test('should support valid functions', function (st) {
    // Coverage:
    stringLength()

    var compiler = new Compiler()
    compiler.setOptions({stringLength: stringLength})
    st.equal(compiler.options.stringLength, stringLength)
    st.end()

    function stringLength() {}
  })

  t.test('should be able to set options', function (st) {
    var processor = unified().use(parse).use(stringify).use(plugin)

    var tree = processor.parse(
      ['<!-- setext -->', '', '# Hello World', ''].join('\n')
    )

    st.equal(
      processor.stringify(tree),
      ['<!-- setext -->', '', 'Hello World', '===========', ''].join('\n')
    )

    function plugin() {
      var html = processor.Compiler.prototype.visitors.html

      processor.Compiler.prototype.visitors.html = replacement

      // Set option when an HTML comment occurs.
      function replacement(node) {
        var value = node.value
        var result = /<!--\s*(.*?)\s*-->/g.exec(value)
        var options = {}

        options[result[1]] = true

        this.setOptions(options)

        return html.apply(this, arguments)
      }
    }

    st.end()
  })

  t.test('should stringify mailto links properly', function (st) {
    st.plan(3)

    var example = '[example@foo.com](mailto:example@foo.com)'
    st.equal(
      unified().use(parse).use(stringify).processSync(example).toString(),
      example + '\n',
      'url is `mailto:` plus link text'
    )

    example = '[mailto:example@foo.com](mailto:example@foo.com)'
    st.equal(
      unified().use(parse).use(stringify).processSync(example).toString(),
      '<mailto:example@foo.com>\n',
      'url is link text'
    )

    example = '[example](mailto:example@foo.com)'
    st.equal(
      unified().use(parse).use(stringify).processSync(example).toString(),
      example + '\n',
      'url is not link text'
    )
  })

  t.equal(
    unified()
      .use(stringify)
      .stringify(
        u('root', [
          u('table', [
            u('tableRow', [
              u('tableCell', [u('text', 'Alpha')]),
              u('tableCell', [u('text', 'Bravo\ncharlie')])
            ]),
            u('tableRow', [
              u('tableCell', [u('text', 'Delta')]),
              u('tableCell', [u('text', 'Echo \n foxtrott')])
            ])
          ])
        ])
      )
      .toString(),
    [
      '| Alpha | Bravo charlie   |',
      '| ----- | --------------- |',
      '| Delta | Echo   foxtrott |',
      ''
    ].join('\n'),
    'should not stringify line feeds in tables'
  )

  t.end()
})

test('stringify escapes', function (t) {
  t.equal(toString('a\\b'), 'a\\\\b', '`\\`')
  t.equal(toString('a`b'), 'a\\`b', '`` ` ``')
  t.equal(toString('a*b'), 'a\\*b', '`*`')
  t.equal(toString('a[b'), 'a\\[b', '`[`')
  t.equal(toString('a<b'), 'a&lt;b', '`<`')
  t.equal(toString('a<b', commonmark), 'a\\<b', '`<` (commonmark)')

  t.equal(toString('a&b'), 'a&b', '`&`')
  t.equal(toString('a&amp;b'), 'a&amp;amp;b', 'entities')
  t.equal(toString('a&amp;b', commonmark), 'a\\&amp;b', 'entities (commonmark)')

  t.equal(toString('a]b'), 'a]b', '`]`')

  t.equal(
    toString(u('link', [u('text', 'a]b')])),
    '[a\\]b](<>)',
    '`]` (in links)'
  )

  t.equal(toString(u('image', {alt: 'a]b'})), '![a\\]b](<>)', '`]` (in images)')

  t.equal(toString('![a'), '!\\[a', '`!` before `[`')

  t.equal(toString('a~b'), 'a~b', '`~`')
  t.equal(toString('a~~b'), 'a\\~~b', '`~~`')

  t.equal(toString('a|b'), 'a|b', '`|`')
  t.equal(toString('| -- |'), '\\| -- \\|', '`|` (table-like)')

  t.equal(
    toString(u('table', [u('tableRow', [u('tableCell', [u('text', 'a|b')])])])),
    '| a\\|b |\n| ---- |',
    '`|` (in cells)'
  )

  t.equal(toString('a_b'), 'a_b', '`_` (in words)')
  t.equal(toString('a_b', pedantic), 'a\\_b', '`_` (in words, pedantic)')
  t.equal(toString(' _b'), ' \\_b', '`_` after `\\b`')
  t.equal(toString('a_ '), 'a\\_ ', '`_` before `\\b`')

  t.equal(toString('a:b'), 'a:b', '`:`')
  t.equal(toString('http:b'), 'http&#x3A;b', '`:` (in `http:`)')
  t.equal(
    toString('http:b', commonmark),
    'http\\:b',
    '`:` (in `http:`, commonmark)'
  )
  t.equal(toString('https:b'), 'https&#x3A;b', '`:` (in `https:`)')
  t.equal(
    toString('https:b', commonmark),
    'https\\:b',
    '`:` (in `https:`, commonmark)'
  )
  t.equal(toString('mailto:b'), 'mailto&#x3A;b', '`:` (in `mailto:`)')
  t.equal(
    toString('mailto:b', commonmark),
    'mailto\\:b',
    '`:` (in `mailto:`, commonmark)'
  )

  t.equal(toString('>a'), '\\>a', '`>` (without parent)')
  t.equal(
    toString(u('paragraph', [u('text', '>a')])),
    '\\>a',
    '`>` (in paragraph)'
  )
  t.equal(
    toString(u('strong', [u('text', '>a')])),
    '**>a**',
    '`>` (in non-paragraph)'
  )
  t.equal(
    toString(u('strong', [u('text', 'a'), u('text', '>b')])),
    '**a>b**',
    '`>` (after sibling)'
  )
  t.equal(
    toString(u('strong', [u('text', '\n'), u('text', '>b')])),
    '**\n\\>b**',
    '`>` (after newline)'
  )

  t.equal(toString('#a'), '\\#a', '`#` (without parent)')
  t.equal(
    toString(u('paragraph', [u('text', '#a')])),
    '\\#a',
    '`#` (in paragraph)'
  )
  t.equal(
    toString(u('strong', [u('text', '#a')])),
    '**#a**',
    '`#` (in non-paragraph)'
  )
  t.equal(
    toString(u('strong', [u('text', 'a'), u('text', '#b')])),
    '**a#b**',
    '`#` (after sibling)'
  )
  t.equal(
    toString(u('strong', [u('text', '\n'), u('text', '#b')])),
    '**\n\\#b**',
    '`#` (after newline)'
  )

  // Both bullet and emphasis marker.
  t.equal(toString('*a'), '\\*a', '`*` (without parent)')
  t.equal(
    toString(u('paragraph', [u('text', '*a')])),
    '\\*a',
    '`*` (in paragraph)'
  )
  t.equal(
    toString(u('strong', [u('text', '*a')])),
    '**\\*a**',
    '`*` (in non-paragraph)'
  )
  t.equal(
    toString(u('strong', [u('text', 'a'), u('text', '*b')])),
    '**a\\*b**',
    '`*` (after sibling)'
  )
  t.equal(
    toString(u('strong', [u('text', '\n'), u('text', '*b')])),
    '**\n\\*b**',
    '`*` (after newline)'
  )

  t.equal(toString('-a'), '\\-a', '`-` (without parent)')
  t.equal(
    toString(u('paragraph', [u('text', '-a')])),
    '\\-a',
    '`-` (in paragraph)'
  )
  t.equal(
    toString(u('strong', [u('text', '-a')])),
    '**-a**',
    '`-` (in non-paragraph)'
  )
  t.equal(
    toString(u('strong', [u('text', 'a'), u('text', '-b')])),
    '**a-b**',
    '`-` (after sibling)'
  )
  t.equal(
    toString(u('strong', [u('text', '\n'), u('text', '-b')])),
    '**\n\\-b**',
    '`-` (after newline)'
  )

  t.equal(toString('+a'), '\\+a', '`+` (without parent)')
  t.equal(
    toString(u('paragraph', [u('text', '+a')])),
    '\\+a',
    '`+` (in paragraph)'
  )
  t.equal(
    toString(u('strong', [u('text', '+a')])),
    '**+a**',
    '`+` (in non-paragraph)'
  )
  t.equal(
    toString(u('strong', [u('text', 'a'), u('text', '+b')])),
    '**a+b**',
    '`+` (after sibling)'
  )
  t.equal(
    toString(u('strong', [u('text', '\n'), u('text', '+b')])),
    '**\n\\+b**',
    '`+` (after newline)'
  )

  t.equal(toString('.a'), '.a', '`.`')
  t.equal(toString('1.a'), '1.a', '`.` (without parent, without space)')
  t.equal(toString('1. '), '1\\. ', '`.` (without parent, with space)')
  t.equal(toString('1.\t'), '1\\.\t', '`.` (without parent, with tab)')
  t.equal(toString('1.\n'), '1\\.\n', '`.` (without parent, with newline)')
  t.equal(toString('1.'), '1\\.', '`.` (without parent, with EOF)')
  t.equal(
    toString(u('paragraph', [u('text', '1.a')])),
    '1.a',
    '`1.` (in paragraph, without space)'
  )
  t.equal(
    toString(u('paragraph', [u('text', '1. ')])),
    '1\\. ',
    '`1.` (in paragraph, with space)'
  )
  t.equal(
    toString(u('paragraph', [u('text', '1.\t')])),
    '1\\.\t',
    '`1.` (in paragraph, with tab)'
  )
  t.equal(
    toString(u('paragraph', [u('text', '1.\n')])),
    '1\\.\n',
    '`1.` (in paragraph, with newline)'
  )
  t.equal(
    toString(u('paragraph', [u('text', '1.')])),
    '1\\.',
    '`1.` (in paragraph, with EOF)'
  )
  t.equal(
    toString(u('strong', [u('text', '1.a')])),
    '**1.a**',
    '`1.` (in non-paragraph)'
  )
  t.equal(
    toString(u('strong', [u('text', 'a'), u('text', '1.b')])),
    '**a1.b**',
    '`1.` (after sibling)'
  )
  t.equal(
    toString(u('strong', [u('text', '\n'), u('text', '1.b')])),
    '**\n1.b**',
    '`1.` (after newline)'
  )
  t.equal(
    toString(u('strong', [u('text', '\n'), u('text', '1. ')])),
    '**\n1\\. **',
    '`1.` (after newline, with space)'
  )
  t.equal(
    toString(u('strong', [u('text', '\n'), u('text', '1.\t')])),
    '**\n1\\.\t**',
    '`1.` (after newline, with tab)'
  )
  t.equal(
    toString(u('strong', [u('text', '\n'), u('text', '1.\n')])),
    '**\n1\\.\n**',
    '`1.` (after newline, with newline)'
  )
  t.equal(
    toString(u('strong', [u('text', '\n'), u('text', '1.')])),
    '**\n1\\.**',
    '`1.` (after newline, with EOL)'
  )

  t.equal(toString(')a'), ')a', '`)`')
  t.equal(toString('1)a'), '1)a', '`)` (default)')
  t.equal(
    toString('1)a', commonmark),
    '1)a',
    '`)` (commonmark, without parent)'
  )
  t.equal(
    toString('1) ', commonmark),
    '1\\) ',
    '`)` (commonmark, without parent, with space)'
  )
  t.equal(
    toString('1)\t', commonmark),
    '1\\)\t',
    '`)` (commonmark, without parent, with tab)'
  )
  t.equal(
    toString('1)\n', commonmark),
    '1\\)\n',
    '`)` (commonmark, without parent, with newline)'
  )
  t.equal(
    toString('1)', commonmark),
    '1\\)',
    '`)` (commonmark, without parent, with EOL)'
  )
  t.equal(
    toString(u('paragraph', [u('text', '1)a')]), commonmark),
    '1)a',
    '`1)` (in paragraph)'
  )
  t.equal(
    toString(u('paragraph', [u('text', '1) ')]), commonmark),
    '1\\) ',
    '`1)` (in paragraph, with space)'
  )
  t.equal(
    toString(u('paragraph', [u('text', '1)\t')]), commonmark),
    '1\\)\t',
    '`1)` (in paragraph, with tab)'
  )
  t.equal(
    toString(u('paragraph', [u('text', '1)\n')]), commonmark),
    '1\\)\n',
    '`1)` (in paragraph, with newline)'
  )
  t.equal(
    toString(u('paragraph', [u('text', '1)')]), commonmark),
    '1\\)',
    '`1)` (in paragraph, with EOL)'
  )
  t.equal(
    toString(u('strong', [u('text', '1)a')]), commonmark),
    '**1)a**',
    '`1)` (in non-paragraph)'
  )
  t.equal(
    toString(u('strong', [u('text', 'a'), u('text', '1)b')]), commonmark),
    '**a1)b**',
    '`1)` (after sibling)'
  )
  t.equal(
    toString(u('strong', [u('text', '\n'), u('text', '1)b')]), commonmark),
    '**\n1)b**',
    '`1)` (after newline)'
  )
  t.equal(
    toString(u('strong', [u('text', '\n'), u('text', '1) ')]), commonmark),
    '**\n1\\) **',
    '`1)` (after newline, with space)'
  )
  t.equal(
    toString(u('strong', [u('text', '\n'), u('text', '1)\t')]), commonmark),
    '**\n1\\)\t**',
    '`1)` (after newline, with tab)'
  )
  t.equal(
    toString(u('strong', [u('text', '\n'), u('text', '1)\n')]), commonmark),
    '**\n1\\)\n**',
    '`1)` (after newline, with newline)'
  )
  t.equal(
    toString(u('strong', [u('text', '\n'), u('text', '1)')]), commonmark),
    '**\n1\\)**',
    '`1)` (after newline, with EOL)'
  )

  t.equal(
    toString(
      u('paragraph', [
        u(
          'linkReference',
          {
            identifier: 'foo',
            referenceType: 'shortcut'
          },
          [u('text', 'a')]
        ),
        u('text', '(b')
      ])
    ),
    '[a]\\(b',
    '`(` after shortcut link-reference'
  )

  t.equal(
    toString(
      u('paragraph', [
        u(
          'linkReference',
          {
            identifier: 'foo',
            referenceType: 'shortcut'
          },
          [u('text', 'a')]
        ),
        u('text', ' \t(b')
      ])
    ),
    '[a] \t\\(b',
    '`(` after spaced shortcut link-reference'
  )

  t.equal(
    toString(
      u('paragraph', [
        u(
          'linkReference',
          {
            identifier: 'foo',
            referenceType: 'shortcut'
          },
          [u('text', 'a')]
        ),
        u('text', ':b')
      ])
    ),
    '[a]&#x3A;b',
    '`:` after shortcut link-reference'
  )

  t.equal(
    toString(
      u('paragraph', [
        u(
          'linkReference',
          {
            identifier: 'foo',
            referenceType: 'shortcut'
          },
          [u('text', 'a')]
        ),
        u('text', ' \t:b')
      ])
    ),
    '[a] \t&#x3A;b',
    '`:` after spaced shortcut link-reference'
  )

  t.equal(
    toString(u('paragraph', [u('text', 'http'), u('text', ':')])),
    'http&#x3A;',
    '`:` with protocol in previous node'
  )

  t.equal(
    toString(u('paragraph', [u('text', '&'), u('text', 'amp;')])),
    '&amp;amp;',
    '`&` with entity in next node'
  )

  t.equal(
    toString(u('paragraph', [u('text', 'a~'), u('text', '~b')])),
    'a\\~~b',
    '`~~` split over two nodes'
  )

  t.equal(
    toString(u('paragraph', [u('text', 'a'), u('text', '_'), u('text', 'b')])),
    'a_b',
    '`_` split over nodes'
  )

  t.equal(
    toString(
      u('paragraph', [u('text', 'a'), u('text', '_'), u('text', 'b')]),
      pedantic
    ),
    'a\\_b',
    '`_` split over nodes (pedantic)'
  )

  t.equal(
    toString(u('paragraph', [u('text', ' '), u('text', '_'), u('text', 'b')])),
    ' \\_b',
    '`_` split over nodes (no word character before)'
  )

  t.equal(
    toString(u('paragraph', [u('text', ' _'), u('text', 'b')])),
    ' \\_b',
    '`_` split over nodes (no word character before, #2)'
  )

  t.equal(
    toString(u('paragraph', [u('text', 'a'), u('text', '_'), u('text', ' ')])),
    'a\\_ ',
    '`_` split over nodes (no word character after)'
  )

  t.equal(
    toString(u('paragraph', [u('text', 'a'), u('text', '_ ')])),
    'a\\_ ',
    '`_` split over nodes (no word character after, #2)'
  )

  t.equal(
    toString(u('paragraph', [u('text', '!'), u('link', [u('text', 'a')])])),
    '\\![a](<>)',
    '! immediately followed by a link'
  )

  t.end()
})

function toString(value, options) {
  var tree = typeof value === 'string' ? u('text', value) : value

  visit(tree, function (node) {
    node.position = uncollapsable
  })

  return unified()
    .use(stringify)
    .data('settings', options || {})
    .stringify(tree)
}

function empty() {
  return {type: 'root', children: []}
}
