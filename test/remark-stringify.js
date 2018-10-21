'use strict'

var test = require('tape')
var wcwidth = require('wcwidth')
var remark = require('../packages/remark')
var Compiler = require('../packages/remark-stringify').Compiler

function empty() {
  return {type: 'root', children: []}
}

test('remark().stringify(ast, file)', function(t) {
  t.throws(
    function() {
      remark().stringify(false)
    },
    /false/,
    'should throw when `ast` is not an object'
  )

  t.doesNotThrow(function() {
    var compiler = new Compiler()
    compiler.setOptions()
  }, 'should not throw when setting nothing')

  t.throws(
    function() {
      var compiler = new Compiler()
      compiler.setOptions(true)
    },
    /^Error: Invalid value `true` for setting `options`$/,
    'should throw when setting invalid values'
  )

  t.test('should ignore nully numbers', function(st) {
    var compiler = new Compiler()
    compiler.setOptions({ruleRepetition: null})
    st.equal(compiler.options.ruleRepetition, 3)
    st.end()
  })

  t.test('should ignore nully strings', function(st) {
    var compiler = new Compiler()
    compiler.setOptions({listItemIndent: null})
    st.equal(compiler.options.listItemIndent, 'tab')
    st.end()
  })

  t.throws(
    function() {
      remark().stringify({type: 'unicorn'})
    },
    /unicorn/,
    'should throw when `ast` is not a valid node'
  )

  t.throws(
    function() {
      remark()
        .data('settings', {bullet: true})
        .stringify(empty())
    },
    /options\.bullet/,
    'should throw when `options.bullet` is not a valid list bullet'
  )

  t.throws(
    function() {
      remark()
        .data('settings', {listItemIndent: 'foo'})
        .stringify(empty())
    },
    /options\.listItemIndent/,
    'should throw when `options.listItemIndent` is not a valid constant'
  )

  t.throws(
    function() {
      remark()
        .data('settings', {rule: true})
        .stringify(empty())
    },
    /options\.rule/,
    'should throw when `options.rule` is not a valid horizontal rule bullet'
  )

  t.throws(
    function() {
      remark()
        .data('settings', {ruleSpaces: 1})
        .stringify(empty())
    },
    /options\.ruleSpaces/,
    'should throw when `options.ruleSpaces` is not a boolean'
  )

  t.throws(
    function() {
      remark()
        .data('settings', {ruleRepetition: 1})
        .stringify(empty())
    },
    /options\.ruleRepetition/,
    'should throw when `options.ruleRepetition` is too low'
  )

  t.throws(
    function() {
      remark()
        .data('settings', {ruleRepetition: NaN})
        .stringify(empty())
    },
    /options\.ruleRepetition/,
    'should throw when `options.ruleRepetition` is `NaN`'
  )

  t.throws(
    function() {
      remark()
        .data('settings', {ruleRepetition: true})
        .stringify(empty())
    },
    /options\.ruleRepetition/,
    'should throw when `options.ruleRepetition` is not a number'
  )

  t.throws(
    function() {
      remark()
        .data('settings', {emphasis: '-'})
        .stringify(empty())
    },
    /options\.emphasis/,
    'should throw when `options.emphasis` is not a valid emphasis marker'
  )

  t.throws(
    function() {
      remark()
        .data('settings', {strong: '-'})
        .stringify(empty())
    },
    /options\.strong/,
    'should throw when `options.strong` is not a valid emphasis marker'
  )

  t.throws(
    function() {
      remark()
        .data('settings', {setext: 0})
        .stringify(empty())
    },
    /options\.setext/,
    'should throw when `options.setext` is not a boolean'
  )

  t.throws(
    function() {
      remark()
        .data('settings', {incrementListMarker: -1})
        .stringify(empty())
    },
    /options\.incrementListMarker/,
    'should throw when `options.incrementListMarker` is not a boolean'
  )

  t.throws(
    function() {
      remark()
        .data('settings', {fences: NaN})
        .stringify(empty())
    },
    /options\.fences/,
    'should throw when `options.fences` is not a boolean'
  )

  t.throws(
    function() {
      remark()
        .data('settings', {fence: '-'})
        .stringify(empty())
    },
    /options\.fence/,
    'should throw when `options.fence` is not a valid fence marker'
  )

  t.throws(
    function() {
      remark()
        .data('settings', {closeAtx: NaN})
        .stringify(empty())
    },
    /options\.closeAtx/,
    'should throw when `options.closeAtx` is not a boolean'
  )

  t.throws(
    function() {
      remark()
        .data('settings', {looseTable: '!'})
        .stringify(empty())
    },
    /options\.looseTable/,
    'should throw when `options.looseTable` is not a boolean'
  )

  t.throws(
    function() {
      remark()
        .data('settings', {spacedTable: '?'})
        .stringify(empty())
    },
    /options\.spacedTable/,
    'should throw when `options.spacedTable` is not a boolean'
  )

  t.throws(
    function() {
      remark()
        .data('settings', {paddedTable: '.'})
        .stringify(empty())
    },
    /options\.paddedTable/,
    'should throw when `options.paddedTable` is not a boolean'
  )

  t.throws(
    function() {
      remark()
        .data('settings', {stringLength: 1})
        .stringify(empty())
    },
    /options\.stringLength/,
    'should throw when `options.stringLength` is not a function'
  )

  t.test('should handle underscores in emphasis in pedantic mode', function(
    st
  ) {
    st.plan(2)

    var example = '*alpha_bravo*\n'

    // Without pedantic mode, emphasis always defaults to underscores.
    st.equal(
      remark()
        .processSync(example)
        .toString(),
      '_alpha_bravo_\n',
      'baseline'
    )

    // With pedantic mode, emphasis will default to asterisks if the text to be
    // emphasized contains underscores.
    st.equal(
      remark()
        .use({settings: {pedantic: true}})
        .processSync(example)
        .toString(),
      '*alpha\\_bravo*\n',
      'pedantic'
    )
  })

  t.test('should support optional list fields', function(st) {
    st.equal(
      stringify({
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
      stringify({
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
      stringify({
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
      stringify({
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
      stringify({
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
      stringify({
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

    function stringify(value) {
      return String(remark().stringify(value))
    }
  })

  t.test('should support optional list item fields', function(st) {
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
      stringify({type: 'listItem', children: children}),
      '-   alpha\n\n    > bravo',
      'no checked or spread'
    )

    st.equal(
      stringify({type: 'listItem', checked: true, children: children}),
      '-   [x] alpha\n\n    > bravo',
      'checked; no spread'
    )

    st.equal(
      stringify({type: 'listItem', spread: true, children: children}),
      '-   alpha\n\n    > bravo',
      'spread: true; no checked'
    )

    st.equal(
      stringify({type: 'listItem', spread: false, children: children}),
      '-   alpha\n    > bravo',
      'spread: false; no checked'
    )

    st.equal(
      stringify({
        type: 'listItem',
        checked: false,
        spread: false,
        children: children
      }),
      '-   [ ] alpha\n    > bravo',
      'spread and checked'
    )

    st.end()

    function stringify(value) {
      return String(remark().stringify(value))
    }
  })

  t.test('should support empty list items', function(st) {
    st.equal(stringify({type: 'listItem', children: []}), '-', 'no checked')

    st.equal(
      stringify({type: 'listItem', checked: true, children: []}),
      '-   [x] ',
      'checked'
    )

    st.end()

    function stringify(value) {
      return String(remark().stringify(value))
    }
  })

  t.test(
    'emphasis in pedantic mode should support a variety of contained inline content',
    function(st) {
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
      tests.forEach(function(test) {
        st.equal(
          remark()
            .use({settings: {pedantic: true}})
            .processSync(test[1])
            .toString(),
          test[2],
          test[0]
        )
      })
    }
  )

  t.test('should process references with casing properly', function(st) {
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
        remark()
          .processSync(test[1])
          .toString(),
        test[1] + '\n',
        test[0]
      )
    }
  })

  t.test('should process associations without label', function(st) {
    st.equal(
      stringify({
        type: 'definition',
        identifier: 'a',
        url: 'example.com'
      }),
      '[a]: example.com',
      'definition'
    )

    st.equal(
      stringify({
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
      stringify({
        type: 'linkReference',
        identifier: 'a',
        children: [{type: 'text', value: 'b'}]
      }),
      '[b][a]',
      'link reference'
    )

    st.equal(
      stringify({
        type: 'imageReference',
        identifier: 'a',
        alt: 'b'
      }),
      '![b][a]',
      'image reference'
    )

    st.equal(
      stringify({
        type: 'footnoteReference',
        identifier: 'a'
      }),
      '[^a]',
      'footnote reference'
    )

    st.end()

    function stringify(value) {
      return String(remark().stringify(value))
    }
  })

  t.test('should support `stringLength`', function(st) {
    st.plan(2)

    var example = [
      '| alpha | bravo   |',
      '| ----- | ------- |',
      '| 中文  | charlie |',
      ''
    ].join('\n')

    st.equal(
      remark()
        .processSync(example)
        .toString(),
      [
        '| alpha | bravo   |',
        '| ----- | ------- |',
        '| 中文    | charlie |',
        ''
      ].join('\n'),
      'baseline'
    )

    st.equal(
      remark()
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

  t.test('should support valid strings', function(st) {
    var compiler = new Compiler()
    st.equal(compiler.options.listItemIndent, 'tab')
    compiler.setOptions({listItemIndent: 'mixed'})
    st.equal(compiler.options.listItemIndent, 'mixed')
    st.end()
  })

  t.test('should support valid numbers', function(st) {
    var compiler = new Compiler()
    st.equal(compiler.options.ruleRepetition, 3)
    compiler.setOptions({ruleRepetition: 5})
    st.equal(compiler.options.ruleRepetition, 5)
    st.end()
  })

  t.test('should support valid booleans', function(st) {
    var compiler = new Compiler()
    st.equal(compiler.options.looseTable, false)
    compiler.setOptions({looseTable: true})
    st.equal(compiler.options.looseTable, true)
    st.end()
  })

  t.test('should support valid enums', function(st) {
    var compiler = new Compiler()
    st.equal(compiler.options.strong, '*')
    compiler.setOptions({strong: '_'})
    st.equal(compiler.options.strong, '_')
    st.end()
  })

  t.test('should support valid functions', function(st) {
    var compiler = new Compiler()
    compiler.setOptions({stringLength: stringLength})
    st.equal(compiler.options.stringLength, stringLength)
    st.end()

    function stringLength() {}
  })

  t.test('should be able to set options', function(st) {
    var processor = remark().use(plugin)
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

        if (result) {
          options[result[1]] = true

          this.setOptions(options)
        }

        return html.apply(this, arguments)
      }
    }

    st.end()
  })

  t.end()
})
