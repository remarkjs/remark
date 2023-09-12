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

test('remark', () => {
  assert.equal(
    remark().processSync('*foo*').toString(),
    '*foo*\n',
    'should parse and stringify a file'
  )

  assert.equal(
    remark()
      // @ts-expect-error: to do: type settings.
      .data('settings', {closeAtx: true})
      .processSync('# foo')
      .toString(),
    '# foo #\n',
    'should accept stringify options'
  )
})

test('remark-cli', async (t) => {
  const bin = fileURLToPath(
    new URL('packages/remark-cli/cli.js', import.meta.url)
  )

  await t.test('should show help on `--help`', async () => {
    const result = await exec(bin + ' --help')

    assert.equal(
      result.stdout,
      [
        'Usage: remark [options] [path | glob ...]',
        '',
        '  Command line interface to inspect and change markdown files with remark',
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

  await t.test('should show version on `--version`', async () => {
    const result = await exec(bin + ' --version')

    assert.match(result.stdout, /remark: \d+\.\d+\.\d+/)
    assert.match(result.stdout, /remark-cli: \d+\.\d+\.\d+/)
  })
})

test('remark-parse', async (t) => {
  assert.equal(
    unified().use(remarkParse).parse('Alfred').children.length,
    1,
    'should accept a `string`'
  )

  await t.test('extensions', () => {
    const tree = unified()
      // @ts-expect-error: to do: type settings.
      .data('micromarkExtensions', [gfm()])
      // @ts-expect-error: to do: type settings.
      .data('fromMarkdownExtensions', [gfmFromMarkdown()])
      .use(remarkParse)
      .parse('* [x] contact@example.com ~~strikethrough~~')

    removePosition(tree, {force: true})

    assert.deepEqual(
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
  })
})

test('remark-stringify', async () => {
  const doc = unified()
    // @ts-expect-error: to do: type settings.
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

  assert.equal(
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
      '* [ ] to do',
      '* [x] done',
      ''
    ].join('\n')
  )
})
