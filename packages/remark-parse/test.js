'use strict'

var path = require('path')
var fs = require('fs')
var test = require('tape')
var vfile = require('vfile')
var unified = require('unified')
var parse = require('.')

var Parser = parse.Parser

test('remark().parse(file)', function(t) {
  t.equal(
    unified()
      .use(parse)
      .parse('Alfred').children.length,
    1,
    'should accept a `string`'
  )

  t.throws(
    function() {
      unified()
        .use(parse)
        .data('settings', {position: 0})
        .parse('')
    },
    /options.position/,
    'should throw when `options.position` is not a boolean'
  )

  t.doesNotThrow(function() {
    var parser = new Parser()
    parser.setOptions()
  }, 'should not throw when setting nothing')

  t.throws(
    function() {
      var parser = new Parser()
      parser.setOptions(true)
    },
    /^Error: Invalid value `true` for setting `options`$/,
    'should throw when setting invalid values'
  )

  t.throws(
    function() {
      unified()
        .use(parse)
        .data('settings', {gfm: Infinity})
        .parse('')
    },
    /options.gfm/,
    'should throw when `options.gfm` is not a boolean'
  )

  t.throws(
    function() {
      unified()
        .use(parse)
        .data('settings', {footnotes: 1})
        .parse('')
    },
    /options.footnotes/,
    'should throw when `options.footnotes` is not a boolean'
  )

  t.throws(
    function() {
      unified()
        .use(parse)
        .data('settings', {pedantic: {}})
        .parse('')
    },
    /options.pedantic/,
    'should throw when `options.pedantic` is not a boolean'
  )

  t.deepEqual(
    unified()
      .use(parse)
      .data('settings', {position: false})
      .parse('<foo></foo>'),
    {
      type: 'root',
      children: [
        {
          type: 'paragraph',
          children: [
            {type: 'html', value: '<foo>'},
            {type: 'html', value: '</foo>'}
          ]
        }
      ]
    },
    'should work without `blocks`'
  )

  t.deepEqual(
    unified()
      .use(parse)
      .data('settings', {position: false, blocks: ['foo']})
      .parse('<foo></foo>'),
    {
      type: 'root',
      children: [{type: 'html', value: '<foo></foo>'}]
    },
    'should support given `blocks`'
  )

  t.test('should throw parse errors', function(st) {
    var processor = unified()
      .use(parse)
      .use(plugin)

    st.plan(5)

    try {
      processor.parse('Hello *World*!')
    } catch (error) {
      st.equal(error.file, '', 'should pass a filename')
      st.equal(error.line, 1, 'should set `line`')
      st.equal(error.column, 7, 'should set `column`')
      st.equal(error.reason, 'Found it!', 'should set `reason`')
      st.equal(error.toString(), '1:7: Found it!', 'should set `message`')
    }

    function plugin() {
      emphasis.locator = locator
      this.Parser.prototype.inlineTokenizers.emphasis = emphasis

      function emphasis(eat, value) {
        if (value.charAt(0) === '*') {
          eat.file.fail('Found it!', eat.now())
        }
      }

      function locator(value, fromIndex) {
        return value.indexOf('*', fromIndex)
      }
    }
  })

  t.test('should warn when missing locators', function(st) {
    var processor = unified()
      .use(parse)
      .use(plugin)

    st.throws(function() {
      processor.parse(vfile('Hello *World*!'))
    }, /1:1: Missing locator: `foo`/)

    st.end()

    function plugin() {
      var proto = this.Parser.prototype
      var methods = proto.inlineMethods

      // Tokenizer.
      function noop() {}

      proto.inlineTokenizers.foo = noop
      methods.splice(methods.indexOf('inlineText'), 0, 'foo')
    }
  })

  t.test('should handle leading tabs', function(st) {
    var tabbedInput = `- 123\n\t- 456`
    var spaceInput = `- 123\n  - 456`
    st.deepEqual(unified().use(parse).parse(tabbedInput), unified().use(parse).parse(spaceInput))

    st.end()
  })

  t.test('should warn about entities', function(st) {
    var filePath = path.join(
      'test',
      'fixtures',
      'input',
      'entities-advanced.text'
    )
    var file = vfile(fs.readFileSync(filePath))
    var notTerminated =
      'Named character references must be terminated by a semicolon'

    unified()
      .use(parse)
      .parse(file)

    st.deepEqual(file.messages.map(String), [
      '1:13: Named character references must be known',
      '5:15: ' + notTerminated,
      '9:44: ' + notTerminated,
      '11:38: ' + notTerminated,
      '14:37: ' + notTerminated,
      '13:16: ' + notTerminated,
      '18:21: ' + notTerminated,
      '16:16: ' + notTerminated,
      '23:37: ' + notTerminated,
      '21:11: ' + notTerminated,
      '29:21: ' + notTerminated,
      '27:17: ' + notTerminated,
      '32:11: ' + notTerminated,
      '35:27: ' + notTerminated,
      '36:10: ' + notTerminated,
      '40:25: ' + notTerminated,
      '41:10: ' + notTerminated
    ])

    st.end()
  })

  t.test('should be able to set options', function(st) {
    var tree = unified()
      .use(parse)
      .use(plugin)
      .parse(['<!-- commonmark -->', '', '1)   Hello World', ''].join('\n'))

    st.equal(tree.children[1].type, 'list')

    st.end()

    function plugin() {
      var html = this.Parser.prototype.blockTokenizers.html

      this.Parser.prototype.blockTokenizers.html = replacement

      // Set option when an HMTL comment occurs.
      function replacement(eat, value) {
        var node = /<!--\s*(.*?)\s*-->/g.exec(value)
        var options = {}

        if (node) {
          options[node[1]] = true

          this.setOptions(options)
        }

        return html.apply(this, arguments)
      }
    }
  })

  t.end()
})
