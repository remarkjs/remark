'use strict'

var path = require('path')
var execa = require('execa')
var test = require('tape')

var join = path.join

test('remark-cli', function (t) {
  t.plan(2)

  t.test('should show help on `--help`', function (st) {
    var bin = join('packages', 'remark-cli', 'cli.js')

    st.plan(1)

    execa(bin, ['--help']).then(function (result) {
      st.equal(
        result.stdout,
        [
          'Usage: remark [options] [path | glob ...]',
          '',
          '  CLI to process Markdown with remark',
          '',
          'Options:',
          '',
          '  -h  --help                              output usage information',
          '  -v  --version                           output version number',
          '  -o  --output [path]                     specify output location',
          '  -r  --rc-path <path>                    specify configuration file',
          '  -i  --ignore-path <path>                specify ignore file',
          '  -s  --setting <settings>                specify settings',
          '  -e  --ext <extensions>                  specify extensions',
          '  -u  --use <plugins>                     use plugins',
          '  -w  --watch                             watch for changes and reprocess',
          '  -q  --quiet                             output only warnings and errors',
          '  -S  --silent                            output only errors',
          '  -f  --frail                             exit with 1 on warnings',
          '  -t  --tree                              specify input and output as syntax tree',
          '      --report <reporter>                 specify reporter',
          '      --file-path <path>                  specify path to process as',
          '      --ignore-path-resolve-from dir|cwd  resolve patterns in `ignore-path` from its directory or cwd',
          '      --ignore-pattern <globs>            specify ignore patterns',
          '      --silently-ignore                   do not fail when given ignored files',
          '      --tree-in                           specify input as syntax tree',
          '      --tree-out                          output syntax tree',
          '      --inspect                           output formatted syntax tree',
          '      --[no-]stdout                       specify writing to stdout (on by default)',
          '      --[no-]color                        specify color in report (on by default)',
          '      --[no-]config                       search for configuration files (on by default)',
          '      --[no-]ignore                       search for ignore files (on by default)',
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
          '  $ remark . -o'
        ].join('\n'),
        'should show help'
      )
    })
  })

  t.test('should show version on `--version`', function (st) {
    var bin = join('packages', 'remark-cli', 'cli.js')

    st.plan(2)

    execa(bin, ['--version']).then(function (result) {
      st.ok(
        /remark: \d+\.\d+\.\d+/.test(result.stdout),
        'should include remark version'
      )

      st.ok(
        /remark-cli: \d+\.\d+\.\d+/.test(result.stdout),
        'should include remark-cli version'
      )
    })
  })
})
