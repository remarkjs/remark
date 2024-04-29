# ![remark][logo]

[![Build][build-badge]][build]
[![Coverage][coverage-badge]][coverage]
[![Downloads][downloads-badge]][downloads]
[![Size][size-badge]][size]
[![Sponsors][sponsors-badge]][collective]
[![Backers][backers-badge]][collective]
[![Chat][chat-badge]][chat]

**remark** is a tool that transforms markdown with plugins.
These plugins can inspect and change your markup.
You can use remark on the server, the client, CLIs, deno, etc.

## Feature highlights

* [x] **[compliant][syntax]**
  — 100% to CommonMark, 100% to GFM or MDX with a plugin
* [x] **[ASTs][syntax-tree]**
  — inspecting and changing content made easy
* [x] **[popular][]**
  — world’s most popular markdown parser
* [x] **[plugins][]**
  — 150+ plugins you can pick and choose from

## Intro

remark is an ecosystem of plugins that work with markdown as structured data,
specifically ASTs (abstract syntax trees).
ASTs make it easy for programs to deal with markdown.
We call those programs plugins.
Plugins inspect and change trees.
You can use the many existing plugins or you can make your own.

* to learn markdown, see this [cheatsheet and tutorial][cheat]
* for more about us, see [`unifiedjs.com`][site]
* for updates, see [Twitter][]
* for questions, see [support][]
* to help, see [contribute][] or [sponsor][] below

## Contents

* [What is this?](#what-is-this)
* [When should I use this?](#when-should-i-use-this)
* [Plugins](#plugins)
* [Examples](#examples)
  * [Example: turning markdown into HTML](#example-turning-markdown-into-html)
  * [Example: support for GFM and frontmatter](#example-support-for-gfm-and-frontmatter)
  * [Example: checking markdown](#example-checking-markdown)
  * [Example: checking and formatting markdown on the CLI](#example-checking-and-formatting-markdown-on-the-cli)
* [Syntax](#syntax)
* [Syntax tree](#syntax-tree)
* [Types](#types)
* [Compatibility](#compatibility)
* [Security](#security)
* [Contribute](#contribute)
* [Sponsor](#sponsor)
* [License](#license)

## What is this?

With this project and a plugin, you can turn this markdown:

```markdown
# Hello, *Mercury*!
```

…into the following HTML:

```html
<h1>Hello, <em>Mercury</em>!</h1>
```

<details><summary>Show example code</summary>

```js
import rehypeStringify from 'rehype-stringify'
import remarkParse from 'remark-parse'
import remarkRehype from 'remark-rehype'
import {unified} from 'unified'

const file = await unified()
  .use(remarkParse)
  .use(remarkRehype)
  .use(rehypeStringify)
  .process('# Hello, *Mercury*!')

console.log(String(file)) // => '<h1>Hello, <em>Mercury</em>!</h1>'
```

</details>

With another plugin, you can turn this markdown:

```markdown
# Hi, Saturn!
```

…into the following markdown:

```markdown
## Hi, Saturn!
```

<details><summary>Show example code</summary>

```js
import remarkParse from 'remark-parse'
import remarkStringify from 'remark-stringify'
import {unified} from 'unified'
import {visit} from 'unist-util-visit'

const file = await unified()
  .use(remarkParse)
  .use(myRemarkPluginToIncreaseHeadings)
  .use(remarkStringify)
  .process('# Hi, Saturn!')

console.log(String(file)) // => '## Hi, Saturn!'

function myRemarkPluginToIncreaseHeadings() {
  /**
   * @param {import('mdast').Root} tree
   */
  return function (tree) {
    visit(tree, function (node) {
      if (node.type === 'heading') {
        node.depth++
      }
    })
  }
}
```

</details>

You can use remark for many different things.
**[unified][]** is the core project that transforms content with ASTs.
**remark** adds support for markdown to unified.
**[mdast][]** is the markdown AST that remark uses.

This GitHub repository is a monorepo that contains the following packages:

* [`remark-parse`][remark-parse]
  — plugin to take markdown as input and turn it into a syntax tree (mdast)
* [`remark-stringify`][remark-stringify]
  — plugin to take a syntax tree (mdast) and turn it into markdown as output
* [`remark`][remark-core]
  — `unified`, `remark-parse`, and `remark-stringify`, useful when input and
  output are markdown
* [`remark-cli`][remark-cli]
  — CLI around `remark` to inspect and format markdown in scripts

## When should I use this?

Depending on the input you have and output you want, you can use different
parts of remark.
If the input is markdown, you can use `remark-parse` with `unified`.
If the output is markdown, you can use `remark-stringify` with `unified`
If both the input and output are markdown, you can use `remark` on its own.
When you want to inspect and format markdown files in a project, you can use
`remark-cli`.

If you *just* want to turn markdown into HTML (with maybe a few extensions),
we recommend [`micromark`][micromark] instead.

If you don’t use plugins and want to deal with syntax trees manually, you can
use [`mdast-util-from-markdown`][mdast-util-from-markdown] and
[`mdast-util-to-markdown`][mdast-util-to-markdown].

## Plugins

remark plugins deal with markdown.
Some popular examples are:

* [`remark-gfm`][remark-gfm]
  — add support for GFM (GitHub flavored markdown)
* [`remark-lint`][remark-lint]
  — inspect markdown and warn about inconsistencies
* [`remark-toc`][remark-toc]
  — generate a table of contents
* [`remark-rehype`][remark-rehype]
  — turn markdown into HTML

These plugins are exemplary because what they do and how they do it is quite
different, respectively to extend markdown syntax, inspect trees, change trees,
and transform to other syntax trees.

You can choose from the 150+ plugins that already exist.
Here are three good ways to find plugins:

* [`awesome-remark`][awesome-remark]
  — selection of the most awesome projects
* [List of plugins][list-of-plugins]
  — list of all plugins
* [`remark-plugin` topic][topic]
  — any tagged repo on GitHub

Some plugins are maintained by us here in the `@remarkjs` organization while
others are maintained by folks elsewhere.
Anyone can make remark plugins, so as always when choosing whether to include
dependencies in your project, make sure to carefully assess the quality of
remark plugins too.

## Examples

### Example: turning markdown into HTML

remark is an ecosystem around markdown.
A different ecosystem is for HTML: [rehype][].
The following example turns markdown into HTML by combining both ecosystems with
[`remark-rehype`][remark-rehype]:

```js
import rehypeSanitize from 'rehype-sanitize'
import rehypeStringify from 'rehype-stringify'
import remarkParse from 'remark-parse'
import remarkRehype from 'remark-rehype'
import {unified} from 'unified'

const file = await unified()
  .use(remarkParse)
  .use(remarkRehype)
  .use(rehypeSanitize)
  .use(rehypeStringify)
  .process('# Hello, Neptune!')

console.log(String(file))
```

Yields:

```html
<h1>Hello, Neptune!</h1>
```

### Example: support for GFM and frontmatter

remark supports CommonMark by default.
Non-standard markdown extensions can be enabled with plugins.
The following example adds support for GFM (autolink literals, footnotes,
strikethrough, tables, tasklists) and frontmatter (YAML):

```js
import rehypeStringify from 'rehype-stringify'
import remarkFrontmatter from 'remark-frontmatter'
import remarkGfm from 'remark-gfm'
import remarkParse from 'remark-parse'
import remarkRehype from 'remark-rehype'
import {unified} from 'unified'

const doc = `---
layout: solar-system
---

# Hi ~~Mars~~Venus!
`

const file = await unified()
  .use(remarkParse)
  .use(remarkFrontmatter)
  .use(remarkGfm)
  .use(remarkRehype)
  .use(rehypeStringify)
  .process(doc)

console.log(String(file))
```

Yields:

```html
<h1>Hi <del>Mars</del>Venus!</h1>
```

### Example: checking markdown

The following example checks that markdown code style is consistent and follows
recommended best practices:

```js
import {remark} from 'remark'
import remarkPresetLintConsistent from 'remark-preset-lint-consistent'
import remarkPresetLintRecommended from 'remark-preset-lint-recommended'
import {reporter} from 'vfile-reporter'

const file = await remark()
  .use(remarkPresetLintConsistent)
  .use(remarkPresetLintRecommended)
  .process('1) Hello, _Jupiter_ and *Neptune*!')

console.error(reporter(file))
```

Yields:

```txt
          warning Missing newline character at end of file final-newline             remark-lint
1:1-1:35  warning Marker style should be `.`               ordered-list-marker-style remark-lint
1:4       warning Incorrect list-item indent: add 1 space  list-item-indent          remark-lint
1:25-1:34 warning Emphasis should use `_` as a marker      emphasis-marker           remark-lint

⚠ 4 warnings
```

### Example: checking and formatting markdown on the CLI

The following example checks and formats markdown with `remark-cli`, which is
the CLI (command line interface) of remark that you can use in your terminal.
This example assumes you’re in a Node.js package.

First, install the CLI and plugins:

```sh
npm install remark-cli remark-preset-lint-consistent remark-preset-lint-recommended remark-toc --save-dev
```

…then add an npm script in your `package.json`:

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

The above change adds a `format` script, which can be run with
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
> copy/pasting them as comments are not supported in `package.json` files.

Finally, you can run the npm script to check and format markdown files in your
project:

```sh
npm run format
```

## Syntax

Markdown is parsed and serialized according to CommonMark.
Other plugins can add support for syntax extensions.

We use [`micromark`][micromark] for our parsing.
See its documentation for more information on markdown, CommonMark, and
extensions.

## Syntax tree

The syntax tree used in remark is [mdast][].
It represents markdown constructs as JSON objects.

This markdown:

```markdown
## Hello *Pluto*!
```

…yields the following tree (positional info remove for brevity):

```js
{
  type: 'heading',
  depth: 2,
  children: [
    {type: 'text', value: 'Hello '},
    {type: 'emphasis', children: [{type: 'text', value: 'Pluto'}]}
    {type: 'text', value: '!'}
  ]
}
```

## Types

The remark organization and the unified collective as a whole is fully typed
with [TypeScript][].
Types for mdast are available in [`@types/mdast`][types-mdast].

For TypeScript to work, it is important to type your plugins.
For example:

```js
/**
 * @typedef {import('mdast').Root} Root
 * @typedef {import('vfile').VFile} VFile
 */

/**
 * @typedef Options
 *   Configuration.
 * @property {boolean | null | undefined} [someField]
 *   Some option (optional).
 */

/**
 * My plugin.
 *
 * @param {Options | null | undefined} [options]
 *   Configuration (optional).
 * @returns
 *   Transform.
 */
export function myRemarkPluginAcceptingOptions(options) {
  /**
   * Transform.
   *
   * @param {Root} tree
   *   Tree.
   * @param {VFile} file
   *   File
   * @returns {undefined}
   *   Nothing.
   */
  return function (tree, file) {
    // Do things.
  }
}
```

## Compatibility

Projects maintained by the unified collective are compatible with maintained
versions of Node.js.

When we cut a new major release, we drop support for unmaintained versions of
Node.
This means we try to keep the current release line compatible with Node.js 16.

## Security

As markdown can be turned into HTML and improper use of HTML can open you up to
[cross-site scripting (XSS)][xss] attacks, use of remark can be unsafe.
When going to HTML, you will combine remark with **[rehype][]**, in which case
you should use [`rehype-sanitize`][rehype-sanitize].

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
  <a href="https://www.gitbook.com">GitBook</a><br><br>
  <a href="https://www.gitbook.com"><img src="https://avatars1.githubusercontent.com/u/7111340?s=256&v=4" width="128"></a>
</td>
<td width="20%" align="center" rowspan="2" colspan="2">
  <a href="https://www.gatsbyjs.org">Gatsby</a><br><br>
  <a href="https://www.gatsbyjs.org"><img src="https://avatars1.githubusercontent.com/u/12551863?s=256&v=4" width="128"></a>
</td>
</tr>
<tr valign="middle">
</tr>
<tr valign="middle">
<td width="20%" align="center" rowspan="2" colspan="2">
  <a href="https://www.netlify.com">Netlify</a><br><br>
  <!--OC has a sharper image-->
  <a href="https://www.netlify.com"><img src="https://images.opencollective.com/netlify/4087de2/logo/256.png" width="128"></a>
</td>
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
  <a href="https://boostnote.io">Boost Note</a><br><br>
  <a href="https://boostnote.io"><img src="https://images.opencollective.com/boosthub/6318083/logo/128.png" width="64"></a>
</td>
<td width="10%" align="center">
  <a href="https://markdown.space">Markdown Space</a><br><br>
  <a href="https://markdown.space"><img src="https://images.opencollective.com/markdown-space/e1038ed/logo/128.png" width="64"></a>
</td>
<td width="10%" align="center">
  <a href="https://www.holloway.com">Holloway</a><br><br>
  <a href="https://www.holloway.com"><img src="https://avatars1.githubusercontent.com/u/35904294?s=128&v=4" width="64"></a>
</td>
<td width="10%"></td>
<td width="10%"></td>
</tr>
<tr valign="middle">
<td width="100%" align="center" colspan="8">
  <br>
  <a href="https://opencollective.com/unified"><strong>You?</strong></a>
  <br><br>
</td>
</tr>
</table>

## License

[MIT](license) © [Titus Wormer](https://wooorm.com)

<!-- Definitions -->

[logo]: https://raw.githubusercontent.com/remarkjs/remark/1f338e72/logo.svg?sanitize=true

[build-badge]: https://github.com/remarkjs/remark/workflows/main/badge.svg

[build]: https://github.com/remarkjs/remark/actions

[coverage-badge]: https://img.shields.io/codecov/c/github/remarkjs/remark.svg

[coverage]: https://codecov.io/github/remarkjs/remark

[downloads-badge]: https://img.shields.io/npm/dm/remark.svg

[downloads]: https://www.npmjs.com/package/remark

[size-badge]: https://img.shields.io/bundlejs/size/remark

[size]: https://bundlejs.com/?q=remark

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

[typescript]: https://www.typescriptlang.org

[cheat]: https://commonmark.org/help/

[twitter]: https://twitter.com/unifiedjs

[site]: https://unifiedjs.com

[topic]: https://github.com/topics/remark-plugin

[popular]: https://www.npmtrends.com/remark-parse-vs-marked-vs-micromark-vs-markdown-it

[types-mdast]: https://github.com/DefinitelyTyped/DefinitelyTyped/tree/master/types/mdast

[mdast]: https://github.com/syntax-tree/mdast

[mdast-util-from-markdown]: https://github.com/syntax-tree/mdast-util-from-markdown

[mdast-util-to-markdown]: https://github.com/syntax-tree/mdast-util-to-markdown

[micromark]: https://github.com/micromark/micromark

[rehype]: https://github.com/rehypejs/rehype

[rehype-sanitize]: https://github.com/rehypejs/rehype-sanitize

[remark-cli]: packages/remark-cli/

[remark-core]: packages/remark/

[remark-gfm]: https://github.com/remarkjs/remark-gfm

[remark-lint]: https://github.com/remarkjs/remark-lint

[remark-parse]: packages/remark-parse/

[remark-rehype]: https://github.com/remarkjs/remark-rehype

[remark-stringify]: packages/remark-stringify/

[remark-toc]: https://github.com/remarkjs/remark-toc

[awesome-remark]: https://github.com/remarkjs/awesome-remark

[unified]: https://github.com/unifiedjs/unified

[xss]: https://en.wikipedia.org/wiki/Cross-site_scripting

[list-of-plugins]: doc/plugins.md#list-of-plugins

[syntax]: #syntax

[syntax-tree]: #syntax-tree

[plugins]: #plugins

[contribute]: #contribute

[sponsor]: #sponsor
