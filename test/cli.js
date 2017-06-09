/**
 * @author Titus Wormer
 * @copyright 2015 Titus Wormer
 * @license MIT
 * @module remark
 * @fileoverview Test suite for remark-cli.
 */

/* Dependencies. */
import path from 'path';
import execa from 'execa';
import test from 'tape';

/* Methods. */
const join = path.join;

/* Tests. */
test('remark-cli', t => {
  t.plan(2);

  t.test('should show help on `--help`', st => {
    const bin = join('packages', 'remark-cli', 'cli.js');

    st.plan(1);

    execa.stderr(bin, ['--help']).then(result => {
      st.equal(
        result,
        [
          'Usage: remark [options] [path | glob ...]',
          '',
          '  CLI to process markdown with remark using plugins',
          '',
          'Options:',
          '',
          '  -h  --help                output usage information',
          '  -v  --version             output version number',
          '  -o  --output [path]       specify output location',
          '  -r  --rc-path <path>      specify configuration file',
          '  -i  --ignore-path <path>  specify ignore file',
          '  -s  --setting <settings>  specify settings',
          '  -e  --ext <extensions>    specify extensions',
          '  -u  --use <plugins>       use plugins',
          '  -w  --watch               watch for changes and reprocess',
          '  -q  --quiet               output only warnings and errors',
          '  -S  --silent              output only errors',
          '  -f  --frail               exit with 1 on warnings',
          '  -t  --tree                specify input and output as syntax tree',
          '      --file-path <path>    specify path to process as',
          '      --tree-in             specify input as syntax tree',
          '      --tree-out            output syntax tree',
          '      --[no-]stdout         specify writing to stdout (on by default)',
          '      --[no-]color          specify color in report (on by default)',
          '      --[no-]config         search for configuration files (on by default)',
          '      --[no-]ignore         search for ignore files (on by default)',
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
      );
    });
  });

  t.test('should show version on `--version`', st => {
    const bin = join('packages', 'remark-cli', 'cli.js');

    st.plan(2);

    execa.stderr(bin, ['--version']).then(result => {
      st.ok(
        /remark: \d+\.\d+\.\d+/.test(result),
        'should include remark version'
      );

      st.ok(
        /remark-cli: \d+\.\d+\.\d+/.test(result),
        'should include remark-cli version'
      );
    });
  });
});
