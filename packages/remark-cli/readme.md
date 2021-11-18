# remark-cli

[![Build][build-badge]][build]
[![Coverage][coverage-badge]][coverage]
[![Downloads][downloads-badge]][downloads]
[![Sponsors][sponsors-badge]][collective]
[![Backers][backers-badge]][collective]
[![Chat][chat-badge]][chat]

Command line interface to inspect and change markdown files with **[remark][]**.

## Contents

*   [What is this?](#what-is-this)
*   [When should I use this?](#when-should-i-use-this)
*   [Install](#install)
*   [Use](#use)
*   [CLI](#cli)
*   [Examples](#examples)
    *   [Example: checking and formatting markdown on the CLI](#example-checking-and-formatting-markdown-on-the-cli)
    *   [Example: config files (JSON, YAML, JS)](#example-config-files-json-yaml-js)
*   [Compatibility](#compatibility)
*   [Security](#security)
*   [Contribute](#contribute)
*   [Sponsor](#sponsor)
*   [License](#license)

## What is this?

This package is a command line interface (CLI) that you can use in your terminal
or in npm scripts and the like to inspect and change markdown files.
This CLI is built around remark, which is a very popular ecosystem of plugins
that work with markdown as structured data, specifically ASTs (abstract syntax
trees).
You can choose from the 150+ plugins that already exist or make your own.

See [the monorepo readme][remark] for info on what the remark ecosystem is.

## When should I use this?

You can use this package when you want to work with the markdown files in your
project from the command line.
`remark-cli` has many options and you can combine it with many plugins, so it
should be possible to do what you want.
If not, you can always use [`remark`][remark-core] itself manually in a script.

## Install

This package is [ESM only](https://gist.github.com/sindresorhus/a39789f98801d908bbc7ff3ecc99d99c).
In Node.js (version 12.20+, 14.14+, or 16.0+), install with [npm][]:

```sh
npm install remark-cli
```

## Use

Add a table of contents with [`remark-toc`][remark-toc] to `readme.md`:

```sh
remark readme.md --use remark-toc --output
```

Lint all markdown files in the current directory according to the markdown style
guide with [`remark-preset-lint-markdown-style-guide`][markdown-style-guide].

```sh
remark . --use remark-preset-lint-markdown-style-guide
```

## CLI

The interface of `remark-cli` is explained as follows on its help page
(`remark --help`):

```txt
Usage: remark [options] [path | glob ...]

  CLI to process markdown with remark

Options:

  -h  --help                              output usage information
  -v  --version                           output version number
  -o  --output [path]                     specify output location
  -r  --rc-path <path>                    specify configuration file
  -i  --ignore-path <path>                specify ignore file
  -s  --setting <settings>                specify settings
  -e  --ext <extensions>                  specify extensions
  -u  --use <plugins>                     use plugins
  -w  --watch                             watch for changes and reprocess
  -q  --quiet                             output only warnings and errors
  -S  --silent                            output only errors
  -f  --frail                             exit with 1 on warnings
  -t  --tree                              specify input and output as syntax tree
      --report <reporter>                 specify reporter
      --file-path <path>                  specify path to process as
      --ignore-path-resolve-from dir|cwd  resolve patterns in `ignore-path` from its directory or cwd
      --ignore-pattern <globs>            specify ignore patterns
      --silently-ignore                   do not fail when given ignored files
      --tree-in                           specify input as syntax tree
      --tree-out                          output syntax tree
      --inspect                           output formatted syntax tree
      --[no-]stdout                       specify writing to stdout (on by default)
      --[no-]color                        specify color in report (on by default)
      --[no-]config                       search for configuration files (on by default)
      --[no-]ignore                       search for ignore files (on by default)

Examples:

  # Process `input.md`
  $ remark input.md -o output.md

  # Pipe
  $ remark < input.md > output.md

  # Rewrite all applicable files
  $ remark . -o
```

More information on all these options is available at
[`unified-args`][unified-args], which does the work.
`remark-cli` is `unified-args` preconfigured to:

*   Load `remark-` plugins
*   Search for markdown extensions
    ([`.md`, `.markdown`, etc][markdown-extensions])
*   Ignore paths found in [`.remarkignore` files][ignore-file]
*   Load configuration from
    [`.remarkrc`, `.remarkrc.js`, etc files][config-file]
*   Use configuration from
    [`remarkConfig` fields in `package.json` files][config-file]

## Examples

### Example: checking and formatting markdown on the CLI

This example checks and formats markdown with `remark-cli`.
It assumes you’re in a Node.js package.

First, install the CLI and plugins:

```sh
npm install remark-cli remark-toc remark-preset-lint-consistent remark-preset-lint-recommended --save-dev
```

Now, add an npm script in your `package.json`:

```js
  /* … */
  "scripts": {
    /* … */
    "format": "remark . --output",
    /* … */
  },
  /* … */
```

> 💡 **Tip**: add ESLint and such in the `format` script too.

Observe that the above change adds a `format` script, which can be run with
`npm run format`.
It runs remark on all markdown files (`.`) and rewrites them (`--output`).
Run `./node_modules/.bin/remark --help` for more info on the CLI.

Then, add a `remarkConfig` to your `package.json` to configure remark:

```js
  /* … */
  "remarkConfig": {
    "settings": {
      "bullet": "*", // Use `*` for list item bullets (default)
      // See <https://github.com/remarkjs/remark/tree/main/packages/remark-stringify> for more options.
    },
    "plugins": [
      "remark-preset-lint-consistent", // Check that markdown is consistent.
      "remark-preset-lint-recommended", // Few recommended rules.
      [
        // Generate a table of contents in `## Contents`
        "remark-toc",
        {
          "heading": "contents"
        }
      ]
    ]
  },
  /* … */
```

> 👉 **Note**: you must remove the comments in the above examples when
> copy/pasting them, as comments are not supported in `package.json` files.

Finally, you can run the npm script to check and format markdown files in your
project:

```sh
npm run format
```

### Example: config files (JSON, YAML, JS)

In the previous example, we saw that `remark-cli` was configured from within a
`package.json` file.
That’s a good place when the configuration is relatively short, when you have a
`package.json`, and when you don’t need comments (which are not allowed in
JSON).

You can also define configuration in separate files in different languages.
With the `package.json` config as inspiration, here’s a JavaScript version that
can be placed in `.remarkrc.js`:

```js
import remarkPresetLintConsistent from 'remark-preset-lint-consistent'
import remarkPresetLintRecommended from 'remark-preset-lint-recommended'
import remarkToc from 'remark-toc'

const remarkConfig = {
  settings: {
    bullet: '*', // Use `*` for list item bullets (default)
    // See <https://github.com/remarkjs/remark/tree/main/packages/remark-stringify> for more options.
  },
  plugins: [
    remarkPresetLintConsistent, // Check that markdown is consistent.
    remarkPresetLintRecommended, // Few recommended rules.
    // Generate a table of contents in `## Contents`
    [remarkToc, {heading: 'contents'}]
  ]
}

export default remarkConfig
```

This is the same configuration in YAML, which can be placed in `.remarkrc.yml`:

```yml
settings:
  bullet: "*"
plugins:
  # Check that markdown is consistent.
  - remark-preset-lint-consistent
  # Few recommended rules.
  - remark-preset-lint-recommended
  # Generate a table of contents in `## Contents`
  - - remark-toc
    - heading: contents
```

When `remark-cli` is about to process a markdown file it’ll search the file
system upwards for configuration files starting at the folder where that file
exists.
Take the following file structure as an illustration:

```txt
folder/
├─ subfolder/
│  ├─ .remarkrc.json
│  └─ file.md
├─ .remarkrc.js
├─ package.json
└─ readme.md
```

When `folder/subfolder/file.md` is processed, the closest config file is
`folder/subfolder/.remarkrc.json`.
For `folder/readme.md`, it’s `folder/.remarkrc.js`.

The order of precedence is as follows.
Earlier wins (so in the above file structure `folder/.remarkrc.js` wins over
`folder/package.json`):

1.  `.remarkc` (JSON)
2.  `.remarkc.json` (JSON)
3.  `.remarkc.cjs` (CJS)
4.  `.remarkc.mjs` (ESM)
5.  `.remarkc.js` (CJS or ESM, depending on `type: 'module'` in `package.json`)
6.  `.remarkc.yaml` (YAML)
7.  `.remarkc.yml` (YAML)
8.  `package.json` with `remarkConfig` field

## Compatibility

Projects maintained by the unified collective are compatible with all maintained
versions of Node.js.
As of now, that is Node.js 12.20+, 14.14+, and 16.0+.
Our projects sometimes work with older versions, but this is not guaranteed.

## Security

As markdown can be turned into HTML and improper use of HTML can open you up to
[cross-site scripting (XSS)][xss] attacks, use of remark can be unsafe.
When going to HTML, you will likely combine remark with **[rehype][]**, in which
case you should use [`rehype-sanitize`][rehype-sanitize].

Use of remark plugins could also open you up to other attacks.
Carefully assess each plugin and the risks involved in using them.

For info on how to submit a report, see our [security policy][security].

## Contribute

See [`contributing.md`][contributing] in [`remarkjs/.github`][health] for ways
to get started.
See [`support.md`][support] for ways to get help.
Join us in [Discussions][chat] to chat with the community and contributors.

This project has a [code of conduct][coc].
By interacting with this repository, organization, or community you agree to
abide by its terms.

## Sponsor

Support this effort and give back by sponsoring on [OpenCollective][collective]!

<!--lint ignore no-html-->

<table>
<tr valign="middle">
<td width="20%" align="center" rowspan="2" colspan="2">
  <a href="https://vercel.com">Vercel</a><br><br>
  <a href="https://vercel.com"><img src="https://avatars1.githubusercontent.com/u/14985020?s=256&v=4" width="128"></a>
</td>
<td width="20%" align="center" rowspan="2" colspan="2">
  <a href="https://motif.land">Motif</a><br><br>
  <a href="https://motif.land"><img src="https://avatars1.githubusercontent.com/u/74457950?s=256&v=4" width="128"></a>
</td>
<td width="20%" align="center" rowspan="2" colspan="2">
  <a href="https://www.hashicorp.com">HashiCorp</a><br><br>
  <a href="https://www.hashicorp.com"><img src="https://avatars1.githubusercontent.com/u/761456?s=256&v=4" width="128"></a>
</td>
<td width="20%" align="center" rowspan="2" colspan="2">
  <a href="https://www.gatsbyjs.org">Gatsby</a><br><br>
  <a href="https://www.gatsbyjs.org"><img src="https://avatars1.githubusercontent.com/u/12551863?s=256&v=4" width="128"></a>
</td>
<td width="20%" align="center" rowspan="2" colspan="2">
  <a href="https://www.netlify.com">Netlify</a><br><br>
  <!--OC has a sharper image-->
  <a href="https://www.netlify.com"><img src="https://images.opencollective.com/netlify/4087de2/logo/256.png" width="128"></a>
</td>
</tr>
<tr valign="middle">
</tr>
<tr valign="middle">
<td width="10%" align="center">
  <a href="https://www.coinbase.com">Coinbase</a><br><br>
  <a href="https://www.coinbase.com"><img src="https://avatars1.githubusercontent.com/u/1885080?s=256&v=4" width="64"></a>
</td>
<td width="10%" align="center">
  <a href="https://themeisle.com">ThemeIsle</a><br><br>
  <a href="https://themeisle.com"><img src="https://avatars1.githubusercontent.com/u/58979018?s=128&v=4" width="64"></a>
</td>
<td width="10%" align="center">
  <a href="https://expo.io">Expo</a><br><br>
  <a href="https://expo.io"><img src="https://avatars1.githubusercontent.com/u/12504344?s=128&v=4" width="64"></a>
</td>
<td width="10%" align="center">
  <a href="https://boosthub.io">Boost Hub</a><br><br>
  <a href="https://boosthub.io"><img src="https://images.opencollective.com/boosthub/6318083/logo/128.png" width="64"></a>
</td>
<td width="10%" align="center">
  <a href="https://www.holloway.com">Holloway</a><br><br>
  <a href="https://www.holloway.com"><img src="https://avatars1.githubusercontent.com/u/35904294?s=128&v=4" width="64"></a>
</td>
<td width="10%"></td>
<td width="10%"></td>
<td width="10%"></td>
<td width="10%"></td>
<td width="10%"></td>
</tr>
<tr valign="middle">
<td width="100%" align="center" colspan="10">
  <br>
  <a href="https://opencollective.com/unified"><strong>You?</strong></a>
  <br><br>
</td>
</tr>
</table>

## License

[MIT][license] © [Titus Wormer][author]

<!-- Definitions -->

[build-badge]: https://github.com/remarkjs/remark/workflows/main/badge.svg

[build]: https://github.com/remarkjs/remark/actions

[coverage-badge]: https://img.shields.io/codecov/c/github/remarkjs/remark.svg

[coverage]: https://codecov.io/github/remarkjs/remark

[downloads-badge]: https://img.shields.io/npm/dm/remark-cli.svg

[downloads]: https://www.npmjs.com/package/remark-cli

[sponsors-badge]: https://opencollective.com/unified/sponsors/badge.svg

[backers-badge]: https://opencollective.com/unified/backers/badge.svg

[collective]: https://opencollective.com/unified

[chat-badge]: https://img.shields.io/badge/chat-discussions-success.svg

[chat]: https://github.com/remarkjs/remark/discussions

[security]: https://github.com/remarkjs/.github/blob/main/security.md

[health]: https://github.com/remarkjs/.github

[contributing]: https://github.com/remarkjs/.github/blob/main/contributing.md

[support]: https://github.com/remarkjs/.github/blob/main/support.md

[coc]: https://github.com/remarkjs/.github/blob/main/code-of-conduct.md

[license]: https://github.com/remarkjs/remark/blob/main/license

[author]: https://wooorm.com

[npm]: https://docs.npmjs.com/cli/install

[xss]: https://en.wikipedia.org/wiki/Cross-site_scripting

[rehype]: https://github.com/rehypejs/rehype

[rehype-sanitize]: https://github.com/rehypejs/rehype-sanitize

[remark]: https://github.com/remarkjs/remark

[markdown-extensions]: https://github.com/sindresorhus/markdown-extensions

[config-file]: https://github.com/unifiedjs/unified-engine/blob/main/doc/configure.md

[ignore-file]: https://github.com/unifiedjs/unified-engine/blob/main/doc/ignore.md

[unified-args]: https://github.com/unifiedjs/unified-args#cli

[remark-core]: ../remark

[remark-toc]: https://github.com/remarkjs/remark-toc

[markdown-style-guide]: https://github.com/remarkjs/remark-lint/tree/main/packages/remark-preset-lint-markdown-style-guide
