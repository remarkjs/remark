'use strict'

var test = require('tape')
var unified = require('unified')
var gfmSyntax = require('micromark-extension-gfm')
var gfm = require('mdast-util-gfm/from-markdown')
var remove = require('unist-util-remove-position')

var parse = require('.')

test('remark().parse(file)', function (t) {
  t.equal(
    unified().use(parse).parse('Alfred').children.length,
    1,
    'should accept a `string`'
  )

  t.test('extensions', function (st) {
    var tree = unified()
      .data('micromarkExtensions', [gfmSyntax()])
      .data('fromMarkdownExtensions', [gfm])
      .use(parse)
      .parse('* [x] contact@example.com ~~strikethrough~~')

    remove(tree, true)

    st.deepEqual(
      tree,
      {
        type: 'root',
        children: [
          {
            type: 'list',
            ordered: false,
            start: null,
            spread: false,
            children: [
              {
                type: 'listItem',
                spread: false,
                checked: true,
                children: [
                  {
                    type: 'paragraph',
                    children: [
                      {
                        type: 'link',
                        title: null,
                        url: 'mailto:contact@example.com',
                        children: [{type: 'text', value: 'contact@example.com'}]
                      },
                      {type: 'text', value: ' '},
                      {
                        type: 'delete',
                        children: [{type: 'text', value: 'strikethrough'}]
                      }
                    ]
                  }
                ]
              }
            ]
          }
        ]
      },
      'should work'
    )

    st.end()
  })

  t.end()
})
