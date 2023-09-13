import assert from 'node:assert/strict'
import {exec as execCb} from 'node:child_process'
import test from 'node:test'
import {promisify} from 'node:util'
import {fileURLToPath} from 'node:url'
import {gfmFromMarkdown, gfmToMarkdown} from 'mdast-util-gfm'
import {gfm} from 'micromark-extension-gfm'
import {remark} from 'remark'
import remarkParse from 'remark-parse'
import remarkStringify from 'remark-stringify'
import {unified} from 'unified'
import {removePosition} from 'unist-util-remove-position'

const exec = promisify(execCb)

test('remark', async function (t) {
  await t.test('should expose the public api', async function () {
    assert.deepEqual(Object.keys(await import('remark')).sort(), ['remark'])
  })

  await t.test('should process a file', async function () {
    assert.equal(remark().processSync('*foo*').toString(), '*foo*\n')
  })

  await t.test('should accept settings', async function () {
    assert.equal(
      remark()
        .data('settings', {closeAtx: true})
        .processSync('# foo')
        .toString(),
      '# foo #\n'
    )
  })
})

test('remark-cli', async function (t) {
  const bin = fileURLToPath(
    new URL('packages/remark-cli/cli.js', import.meta.url)
  )

  await t.test('should show help on `--help`', async function () {
    const result = await exec(bin + ' --help')

    assert.equal(
      result.stdout,
      [
        'Usage: remark [options] [path | glob ...]',
        '',
        '  CLI to process markdown with remark',
        '',
        'Options:',
        '',
        '      --[no-]color                        specify color in report (on by default)',
        '      --[no-]config                       search for configuration files (on by default)',
        '  -e  --ext <extensions>                  specify extensions',
        '      --file-path <path>                  specify path to process as',
        '  -f  --frail                             exit with 1 on warnings',
        '  -h  --help                              output usage information',
        '      --[no-]ignore                       search for ignore files (on by default)',
        '  -i  --ignore-path <path>                specify ignore file',
        '      --ignore-path-resolve-from cwd|dir  resolve patterns in `ignore-path` from its directory or cwd',
        '      --ignore-pattern <globs>            specify ignore patterns',
        '      --inspect                           output formatted syntax tree',
        '  -o  --output [path]                     specify output location',
        '  -q  --quiet                             output only warnings and errors',
        '  -r  --rc-path <path>                    specify configuration file',
        '      --report <reporter>                 specify reporter',
        '  -s  --setting <settings>                specify settings',
        '  -S  --silent                            output only errors',
        '      --silently-ignore                   do not fail when given ignored files',
        '      --[no-]stdout                       specify writing to stdout (on by default)',
        '  -t  --tree                              specify input and output as syntax tree',
        '      --tree-in                           specify input as syntax tree',
        '      --tree-out                          output syntax tree',
        '  -u  --use <plugins>                     use plugins',
        '      --verbose                           report extra info for messages',
        '  -v  --version                           output version number',
        '  -w  --watch                             watch for changes and reprocess',
        '',
        'Examples:',
        '',
        '  # Process `input.md`',
        '  $ remark input.md -o output.md',
        '',
        '  # Pipe',
        '  $ remark < input.md > output.md',
        '',
        '  # Rewrite all applicable files',
        '  $ remark . -o',
        ''
      ].join('\n')
    )
  })

  await t.test('should show version on `--version`', async function () {
    const result = await exec(bin + ' --version')

    assert.match(result.stdout, /remark: \d+\.\d+\.\d+/)
    assert.match(result.stdout, /remark-cli: \d+\.\d+\.\d+/)
  })
})

test('remark-parse', async function (t) {
  await t.test('should expose the public api', async function () {
    assert.deepEqual(Object.keys(await import('remark-parse')).sort(), [
      'default'
    ])
  })

  await t.test('should parse', async function () {
    assert.deepEqual(unified().use(remarkParse).parse('Alfred'), {
      type: 'root',
      children: [
        {
          type: 'paragraph',
          children: [
            {
              type: 'text',
              value: 'Alfred',
              position: {
                start: {line: 1, column: 1, offset: 0},
                end: {line: 1, column: 7, offset: 6}
              }
            }
          ],
          position: {
            start: {line: 1, column: 1, offset: 0},
            end: {line: 1, column: 7, offset: 6}
          }
        }
      ],
      position: {
        start: {line: 1, column: 1, offset: 0},
        end: {line: 1, column: 7, offset: 6}
      }
    })
  })

  await t.test('should support extensions', function () {
    const tree = unified()
      .data('micromarkExtensions', [gfm()])
      .data('fromMarkdownExtensions', [gfmFromMarkdown()])
      .use(remarkParse)
      .parse('* [x] contact@example.com ~~strikethrough~~')

    removePosition(tree, {force: true})

    assert.deepEqual(tree, {
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
    })
  })
})

test('remark-stringify', async function (t) {
  await t.test('should expose the public api', async function () {
    assert.deepEqual(Object.keys(await import('remark-stringify')).sort(), [
      'default'
    ])
  })

  await t.test('should serialize', async function () {
    assert.equal(
      unified()
        .use(remarkStringify)
        .stringify({
          type: 'root',
          children: [
            {type: 'paragraph', children: [{type: 'text', value: 'Alfred'}]}
          ]
        }),
      'Alfred\n'
    )
  })

  await t.test('should support extensions', async function () {
    const result = unified()
      .data('toMarkdownExtensions', [gfmToMarkdown()])
      .use(remarkStringify)
      .stringify({
        type: 'root',
        children: [
          {
            type: 'heading',
            depth: 1,
            children: [{type: 'text', value: 'GFM'}]
          },
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
          {
            type: 'heading',
            depth: 2,
            children: [{type: 'text', value: 'Table'}]
          },
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
                  {
                    type: 'paragraph',
                    children: [{type: 'text', value: 'to do'}]
                  }
                ]
              },
              {
                type: 'listItem',
                spread: false,
                checked: true,
                children: [
                  {
                    type: 'paragraph',
                    children: [{type: 'text', value: 'done'}]
                  }
                ]
              }
            ]
          }
        ]
      })

    assert.equal(
      result,
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
        '* [ ] to do',
        '* [x] done',
        ''
      ].join('\n')
    )
  })
})
