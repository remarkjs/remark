import test from 'tape'
import {unified} from 'unified'
import {gfm} from 'micromark-extension-gfm'
import {gfmFromMarkdown} from 'mdast-util-gfm'
import {removePosition} from 'unist-util-remove-position'
import remarkParse from './index.js'

test('remarkParse', (t) => {
  t.equal(
    unified().use(remarkParse).parse('Alfred').children.length,
    1,
    'should accept a `string`'
  )

  t.test('extensions', (t) => {
    const tree = unified()
      .data('micromarkExtensions', [gfm()])
      .data('fromMarkdownExtensions', [gfmFromMarkdown])
      .use(remarkParse)
      .parse('* [x] contact@example.com ~~strikethrough~~')

    removePosition(tree, true)

    t.deepEqual(
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

    t.end()
  })

  t.end()
})
