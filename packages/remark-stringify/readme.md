# remark-stringify

[![Build][build-badge]][build]
[![Coverage][coverage-badge]][coverage]
[![Downloads][downloads-badge]][downloads]
[![Size][size-badge]][size]
[![Sponsors][sponsors-badge]][collective]
[![Backers][backers-badge]][collective]
[![Chat][chat-badge]][chat]

**[remark][]** plugin to add support for serializing markdown.

## Contents

*   [What is this?](#what-is-this)
*   [When should I use this?](#when-should-i-use-this)
*   [Install](#install)
*   [Use](#use)
*   [API](#api)
    *   [`unified().use(remarkStringify[, options])`](#unifieduseremarkstringify-options)
*   [Syntax](#syntax)
*   [Syntax tree](#syntax-tree)
*   [Types](#types)
*   [Security](#security)
*   [Contribute](#contribute)
*   [Sponsor](#sponsor)
*   [License](#license)

## What is this?

This package is a [unified][] ([remark][]) plugin that defines how to take a
syntax tree as input and turn it into serialized markdown.

This plugin is built on [`mdast-util-to-markdown`][mdast-util-to-markdown],
which turns [mdast][] syntax trees into a string.
remark focusses on making it easier to transform content by abstracting such
internals away.

**unified** is a project that transforms content with abstract syntax trees
(ASTs).
**remark** adds support for markdown to unified.
**mdast** is the markdown AST that remark uses.
This is a remark plugin that defines how mdast is turned into markdown.

## When should I use this?

This plugin adds support to unified for serializing markdown.
You can alternatively use [`remark`][remark-core] instead, which combines
unified, [`remark-parse`][remark-parse], and this plugin.

You can combine this plugin with other plugins to add syntax extensions.
Notable examples that deeply integrate with it are
[`remark-gfm`][remark-gfm],
[`remark-mdx`][remark-mdx],
[`remark-frontmatter`][remark-frontmatter],
[`remark-math`][remark-math], and
[`remark-directive`][remark-directive].
You can also use any other [remark plugin][plugin] before `remark-stringify`.

If you want to handle syntax trees manually, you can use
[`mdast-util-to-markdown`][mdast-util-to-markdown].

## Install

This package is [ESM only](https://gist.github.com/sindresorhus/a39789f98801d908bbc7ff3ecc99d99c).
In Node.js (version 12.20+, 14.14+, or 16.0+), install with [npm][]:

```sh
npm install remark-stringify
```

In Deno with [Skypack][]:

```js
import remarkStringify from 'https://cdn.skypack.dev/remark-stringify@10?dts'
```

In browsers with [Skypack][]:

```html
<script type="module">
  import remarkStringify from 'https://cdn.skypack.dev/remark-stringify@10?min'
</script>
```

## Use

Say we have the following module `example.js`:

```js
import {unified} from 'unified'
import rehypeParse from 'rehype-parse'
import rehypeRemark from 'rehype-remark'
import remarkStringify from 'remark-stringify'

main()

async function main() {
  const file = await unified()
    .use(rehypeParse)
    .use(rehypeRemark)
    .use(remarkStringify, {
      bullet: '*',
      fence: '~',
      fences: true,
      incrementListMarker: false
    })
    .process('<h1>Hello, world!</h1>')

  console.log(String(file))
}
```

Running that with `node example.js` yields:

```markdown
# Hello, world!
```

## API

This package exports no identifiers.
The default export is `remarkStringify`.

### `unified().use(remarkStringify[, options])`

Add support for serializing markdown.
Options are passed to [`mdast-util-to-markdown`][mdast-util-to-markdown]:
all formatting options are supported.

##### `options`

Configuration (optional).

###### `options.bullet`

Marker to use for bullets of items in unordered lists (`'*'`, `'+'`, or `'-'`,
default: `'*'`).

###### `options.bulletOther`

Marker to use in certain cases where the primary bullet doesn’t work (`'*'`,
`'+'`, or `'-'`, default: depends).
See [`mdast-util-to-markdown`][mdast-util-to-markdown] for more information.

###### `options.bulletOrdered`

Marker to use for bullets of items in ordered lists (`'.'` or `')'`, default:
`'.'`).

###### `options.bulletOrderedOther`

Marker to use in certain cases where the primary bullet for ordered items
doesn’t work (`'.'` or `')'`, default: none).
See [`mdast-util-to-markdown`][mdast-util-to-markdown] for more information.

###### `options.closeAtx`

Whether to add the same number of number signs (`#`) at the end of an ATX
heading as the opening sequence (`boolean`, default: `false`).

###### `options.emphasis`

Marker to use for emphasis (`'*'` or `'_'`, default: `'*'`).

###### `options.fence`

Marker to use for fenced code (``'`'`` or `'~'`, default: ``'`'``).

###### `options.fences`

Whether to use fenced code always (`boolean`, default: `false`).
The default is to use fenced code if there is a language defined, if the code is
empty, or if it starts or ends in blank lines.

###### `options.incrementListMarker`

Whether to increment the counter of ordered lists items (`boolean`, default:
`true`).

###### `options.listItemIndent`

How to indent the content of list items (`'one'`, `'tab'`, or `'mixed'`,
default: `'tab'`).
Either with the size of the bullet plus one space (when `'one'`), a tab stop
(`'tab'`), or depending on the item and its parent list (`'mixed'`, uses `'one'`
if the item and list are tight and `'tab'` otherwise).

###### `options.quote`

Marker to use for titles (`'"'` or `"'"`, default: `'"'`).

###### `options.resourceLink`

Whether to always use resource links (`boolean`, default: `false`).
The default is to use autolinks (`<https://example.com>`) when possible
and resource links (`[text](url)`) otherwise.

###### `options.rule`

Marker to use for thematic breaks (`'*'`, `'-'`, or `'_'`, default: `'*'`).

###### `options.ruleRepetition`

Number of markers to use for thematic breaks (`number`, default:
`3`, min: `3`).

###### `options.ruleSpaces`

Whether to add spaces between markers in thematic breaks (`boolean`, default:
`false`).

###### `options.setext`

Whether to use setext headings when possible (`boolean`, default: `false`).
The default is to always use ATX headings (`# heading`) instead of setext
headings (`heading\n=======`).
Setext headings can’t be used for empty headings or headings with a rank of
three or more.

###### `options.strong`

Marker to use for strong (`'*'` or `'_'`, default: `'*'`).

###### `options.tightDefinitions`

Whether to join definitions without a blank line (`boolean`, default: `false`).
The default is to add blank lines between any flow (“block”) construct.

###### `options.handlers`

This option is a bit advanced as it requires knowledge of ASTs, so we defer
to the documentation available in
[`mdast-util-to-markdown`][mdast-util-to-markdown].

###### `options.join`

This option is a bit advanced as it requires knowledge of ASTs, so we defer
to the documentation available in
[`mdast-util-to-markdown`][mdast-util-to-markdown].

###### `options.unsafe`

This option is a bit advanced as it requires deep knowledge of markdown, so we
defer to the documentation available in
[`mdast-util-to-markdown`][mdast-util-to-markdown].

## Syntax

Markdown is serialized according to CommonMark but care is taken to format in
such a way that the resulting markdown should work with most markdown parsers.
Other plugins can add support for syntax extensions.

## Syntax tree

The syntax tree format used in remark is [mdast][].

## Types

This package is fully typed with [TypeScript][].
An `Options` type is exported, which models the interface of accepted options.

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

[downloads-badge]: https://img.shields.io/npm/dm/remark-stringify.svg

[downloads]: https://www.npmjs.com/package/remark-stringify

[size-badge]: https://img.shields.io/bundlephobia/minzip/remark-stringify.svg

[size]: https://bundlephobia.com/result?p=remark-stringify

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

[skypack]: https://www.skypack.dev

[unified]: https://github.com/unifiedjs/unified

[remark]: https://github.com/remarkjs/remark

[mdast]: https://github.com/syntax-tree/mdast

[xss]: https://en.wikipedia.org/wiki/Cross-site_scripting

[typescript]: https://www.typescriptlang.org

[rehype]: https://github.com/rehypejs/rehype

[rehype-sanitize]: https://github.com/rehypejs/rehype-sanitize

[mdast-util-to-markdown]: https://github.com/syntax-tree/mdast-util-to-markdown

[remark-gfm]: https://github.com/remarkjs/remark-gfm

[remark-mdx]: https://github.com/mdx-js/mdx/tree/main/packages/remark-mdx

[remark-frontmatter]: https://github.com/remarkjs/remark-frontmatter

[remark-math]: https://github.com/remarkjs/remark-math

[remark-directive]: https://github.com/remarkjs/remark-directive

[remark-parse]: ../remark-parse/

[remark-core]: ../remark/

[plugin]: https://github.com/remarkjs/remark#plugin
