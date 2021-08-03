import test from 'tape'
import unified from 'unified'
import gfmSyntax from 'micromark-extension-gfm'
import gfm from 'mdast-util-gfm/from-markdown.js'
import remove from 'unist-util-remove-position'
import remarkParse from './index.js'

test('remarkParse', function (t) {
  t.equal(
    unified().use(remarkParse).parse('Alfred').children.length,
    1,
    'should accept a `string`'
  )

  t.test('extensions', function (st) {
    var tree = unified()
      .data('micromarkExtensions', [gfmSyntax()])
      .data('fromMarkdownExtensions', [gfm])
      .use(remarkParse)
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
