# remark-cli [![Travis][build-badge]][build-status] [![Coverage][coverage-badge]][coverage-status] [![Downloads][dl-badge]][dl] [![Chat][chat-badge]][chat]

Command-line interface for [**remark**][remark].

*   Loads [`remark-` plugins][plugins]
*   Searches for [markdown extensions][markdown-extensions]
*   Ignores paths found in [`.remarkignore` files][ignore-file]
*   Loads configuration from [`.remarkrc`, `.remarkrc.js` files][config-file]
*   Uses configuration from [`remarkConfig` fields in `package.json`
    files][config-file]

* * *

**Announcing the unified collective!  🎉
[Read more about it on Medium »][announcement]**

## Sponsors

<!--lint ignore no-html maximum-line-length-->

<table>
  <tr valign="top">
    <td width="20%" align="center">
      <a href="https://zeit.co"><img src="https://avatars1.githubusercontent.com/u/14985020?s=400&v=4"></a>
      <br><br>🥇
      <a href="https://zeit.co">ZEIT</a>
    </td>
    <td width="20%" align="center">
      <a href="https://www.gatsbyjs.org"><img src="https://avatars1.githubusercontent.com/u/12551863?s=400&v=4"></a>
      <br><br>🥇
      <a href="https://www.gatsbyjs.org">Gatsby</a></td>
    <td width="20%" align="center">
      <a href="https://compositor.io"><img src="https://avatars1.githubusercontent.com/u/19245838?s=400&v=4"></a>
      <br><br>🥉
      <a href="https://compositor.io">Compositor</a>
    </td>
    <td width="20%" align="center">
      <a href="https://www.holloway.com"><img src="https://avatars1.githubusercontent.com/u/35904294?s=400&v=4"></a>
      <br><br>
      <a href="https://www.holloway.com">Holloway</a>
    </td>
    <td width="20%" align="center">
      <br><br><br><br>
      <a href="https://opencollective.com/unified"><strong>You?</strong>
    </td>
  </tr>
</table>

## Installation

[npm][]:

```sh
npm install remark-cli
```

## Usage

```sh
# Add a table of contents to `readme.md`
$ remark readme.md --use toc --output

# Lint markdown files in the current directory
# according to the markdown style guide.
$ remark . --use preset-lint-markdown-style-guide
```

## CLI

See [**unified-args**][unified-args], which provides the interface,
for more information on all available options.

```txt
Usage: remark [options] [path | glob ...]

  CLI to process markdown with remark using plugins

Options:

  -h  --help                output usage information
  -v  --version             output version number
  -o  --output [path]       specify output location
  -r  --rc-path <path>      specify configuration file
  -i  --ignore-path <path>  specify ignore file
  -s  --setting <settings>  specify settings
  -e  --ext <extensions>    specify extensions
  -u  --use <plugins>       use plugins
  -w  --watch               watch for changes and reprocess
  -q  --quiet               output only warnings and errors
  -S  --silent              output only errors
  -f  --frail               exit with 1 on warnings
  -t  --tree                specify input and output as syntax tree
      --report <reporter>   specify reporter
      --file-path <path>    specify path to process as
      --tree-in             specify input as syntax tree
      --tree-out            output syntax tree
      --inspect             output formatted syntax tree
      --[no-]stdout         specify writing to stdout (on by default)
      --[no-]color          specify color in report (on by default)
      --[no-]config         search for configuration files (on by default)
      --[no-]ignore         search for ignore files (on by default)

Examples:

  # Process `input.md`
  $ remark input.md -o output.md

  # Pipe
  $ remark < input.md > output.md

  # Rewrite all applicable files
  $ remark . -o
```

## License

[MIT][license] © [Titus Wormer][author]

<!-- Definitions -->

[build-badge]: https://img.shields.io/travis/remarkjs/remark/master.svg

[build-status]: https://travis-ci.org/remarkjs/remark

[coverage-badge]: https://img.shields.io/codecov/c/github/remarkjs/remark.svg

[coverage-status]: https://codecov.io/github/remarkjs/remark

[dl-badge]: https://img.shields.io/npm/dm/remark-cli.svg

[dl]: https://www.npmjs.com/package/remark-cli

[chat-badge]: https://img.shields.io/badge/join%20the%20community-on%20spectrum-7b16ff.svg

[chat]: https://spectrum.chat/unified/remark

[license]: https://github.com/remarkjs/remark/blob/master/license

[author]: https://wooorm.com

[npm]: https://docs.npmjs.com/cli/install

[remark]: https://github.com/remarkjs/remark

[plugins]: https://github.com/remarkjs/remark/blob/master/doc/plugins.md

[markdown-extensions]: https://github.com/sindresorhus/markdown-extensions

[config-file]: https://github.com/unifiedjs/unified-engine/blob/master/doc/configure.md

[ignore-file]: https://github.com/unifiedjs/unified-engine/blob/master/doc/ignore.md

[unified-args]: https://github.com/unifiedjs/unified-args#cli

[announcement]: https://medium.com/unifiedjs/collectively-evolving-through-crowdsourcing-22c359ea95cc
