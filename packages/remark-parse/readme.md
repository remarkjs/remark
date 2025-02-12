# remark-parse

[![Build][badge-build-image]][badge-build-url]
[![Coverage][badge-coverage-image]][badge-coverage-url]
[![Downloads][badge-downloads-image]][badge-downloads-url]
[![Size][badge-size-image]][badge-size-url]

**[remark][github-remark]** plugin to add support for parsing from markdown.

## Contents

* [What is this?](#what-is-this)
* [When should I use this?](#when-should-i-use-this)
* [Install](#install)
* [Use](#use)
* [API](#api)
  * [`unified().use(remarkParse)`](#unifieduseremarkparse)
* [Examples](#examples)
  * [Example: support GFM and frontmatter](#example-support-gfm-and-frontmatter)
  * [Example: turning markdown into a man page](#example-turning-markdown-into-a-man-page)
* [Syntax](#syntax)
* [Syntax tree](#syntax-tree)
* [Types](#types)
* [Compatibility](#compatibility)
* [Security](#security)
* [Contribute](#contribute)
* [Sponsor](#sponsor)
* [License](#license)

## What is this?

This package is a [unified][github-unified] ([remark][github-remark])
plugin that defines how to take markdown as input and turn it into a syntax
tree.

See [the monorepo readme][github-remark] for info on what the remark ecosystem
is.

## When should I use this?

This plugin adds support to unified for parsing markdown.
If you also need to serialize markdown,
you can alternatively use [`remark`][github-remark-core],
which combines `unified`,
this plugin,
and [`remark-stringify`][github-remark-stringify].

If you *just* want to turn markdown into HTML (with maybe a few extensions),
we recommend [`micromark`][github-micromark] instead.
If you don’t use plugins and want to access the syntax tree,
you can directly use
[`mdast-util-from-markdown`][github-mdast-util-from-markdown].
remark focusses on making it easier to transform content by abstracting these
internals away.

You can combine this plugin with other plugins to add syntax extensions.
Notable examples that deeply integrate with it are
[`remark-gfm`][github-remark-gfm],
[`remark-mdx`][github-remark-mdx],
[`remark-frontmatter`][github-remark-frontmatter],
[`remark-math`][github-remark-math],
and
[`remark-directive`][github-remark-directive].
You can also use any other [remark plugin][github-remark-plugins]
after `remark-parse`.

## Install

This package is [ESM only][esm].
In Node.js (version 16+),
install with [npm][npm-install]:

```sh
npm install remark-parse
```

In Deno with [`esm.sh`][esmsh]:

```js
import remarkParse from 'https://esm.sh/remark-parse@11'
```

In browsers with [`esm.sh`][esmsh]:

```html
<script type="module">
  import remarkParse from 'https://esm.sh/remark-parse@11?bundle'
</script>
```

## Use

Say we have the following module `example.js`:

```js
import rehypeStringify from 'rehype-stringify'
import remarkGfm from 'remark-gfm'
import remarkParse from 'remark-parse'
import remarkRehype from 'remark-rehype'
import {unified} from 'unified'

const value = `
# Mercury

**Mercury** is the first planet from the [Sun](https://en.wikipedia.org/wiki/Sun)
and the smallest planet in the Solar System.
`

const file = await unified()
  .use(remarkParse)
  .use(remarkGfm)
  .use(remarkRehype)
  .use(rehypeStringify)
  .process(value)

console.log(String(file))
```

…then running `node example.js` yields:

```html
<h1>Mercury</h1>
<p><strong>Mercury</strong> is the first planet from the <a href="https://en.wikipedia.org/wiki/Sun">Sun</a>
and the smallest planet in the Solar System.</p>
```

## API

This package exports no identifiers.
The default export is [`remarkParse`][api-remark-parse].

### `unified().use(remarkParse)`

Add support for parsing from markdown.

###### Parameters

There are no parameters.

###### Returns

Nothing (`undefined`).

## Examples

### Example: support GFM and frontmatter

We support CommonMark by default.
Non-standard markdown extensions can be enabled with plugins.

This example shows how to support GFM features
(autolink literals, footnotes, strikethrough, tables, tasklists)
and frontmatter (YAML):

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

### Example: turning markdown into a man page

Man pages (short for manual pages) are a way to document CLIs.
For an example,
type `man git-log` in your terminal.
They use an old markup format called roff.
There’s a remark plugin,
[`remark-man`][github-remark-man],
that can serialize as roff.

This example shows how to turn markdown into man pages by using unified with
`remark-parse` and `remark-man`:

```js
import remarkMan from 'remark-man'
import remarkParse from 'remark-parse'
import {unified} from 'unified'

const doc = `
# titan(7) -- largest moon of saturn

Titan is the largest moon…
`

const file = await unified().use(remarkParse).use(remarkMan).process(doc)

console.log(String(file))
```

Yields:

```roff
.TH "TITAN" "7" "January 2025" "" ""
.SH "NAME"
\fBtitan\fR - largest moon of saturn
.P
Titan is the largest moon…
```

## Syntax

Markdown is parsed according to CommonMark.
Other plugins can add support for syntax extensions.
If you’re interested in extending markdown,
see [*§ Extensions* in `micromark/micromark`][github-micromark-extensions].

## Syntax tree

The syntax tree used in remark is [mdast][github-mdast].

## Types

This package is fully typed with [TypeScript][].
It exports the additional type `Options` (which is currently empty).

## Compatibility

Projects maintained by the unified collective are compatible with maintained
versions of Node.js.

When we cut a new major release,
we drop support for unmaintained versions of Node.
This means we try to keep the current release line,
`remark-parse@11`,
compatible with Node.js 16.

## Security

See [*§ Security* in `remarkjs/remark`][github-remark-security].

## Contribute

See [`contributing.md`][health-contributing] in [`remarkjs/.github`][health]
for ways to get started.
See [`support.md`][health-support] for ways to get help.

This project has a [code of conduct][health-coc].
By interacting with this repository,
organization,
or community you agree to abide by its terms.

## Sponsor

Support this effort and give back by sponsoring on [OpenCollective][]!

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

[MIT][file-license] © [Titus Wormer][author]

<!-- Definitions -->

[api-remark-parse]: #unifieduseremarkparse

[author]: https://wooorm.com

[badge-build-image]: https://github.com/remarkjs/remark/workflows/main/badge.svg

[badge-build-url]: https://github.com/remarkjs/remark/actions

[badge-coverage-image]: https://img.shields.io/codecov/c/github/remarkjs/remark.svg

[badge-coverage-url]: https://codecov.io/github/remarkjs/remark

[badge-downloads-image]: https://img.shields.io/npm/dm/remark-parse.svg

[badge-downloads-url]: https://www.npmjs.com/package/remark-parse

[badge-size-image]: https://img.shields.io/bundlejs/size/remark-parse

[badge-size-url]: https://bundlejs.com/?q=remark-parse

[esm]: https://gist.github.com/sindresorhus/a39789f98801d908bbc7ff3ecc99d99c

[esmsh]: https://esm.sh

[file-license]: license

[github-mdast]: https://github.com/syntax-tree/mdast

[github-mdast-util-from-markdown]: https://github.com/syntax-tree/mdast-util-from-markdown

[github-micromark]: https://github.com/micromark/micromark

[github-micromark-extensions]: https://github.com/micromark/micromark#extensions

[github-remark]: https://github.com/remarkjs/remark

[github-remark-core]: https://github.com/remarkjs/remark/tree/main/packages/remark

[github-remark-directive]: https://github.com/remarkjs/remark-directive

[github-remark-frontmatter]: https://github.com/remarkjs/remark-frontmatter

[github-remark-gfm]: https://github.com/remarkjs/remark-gfm

[github-remark-man]: https://github.com/remarkjs/remark-man

[github-remark-math]: https://github.com/remarkjs/remark-math

[github-remark-mdx]: https://github.com/mdx-js/mdx/tree/main/packages/remark-mdx

[github-remark-plugins]: https://github.com/remarkjs/remark#plugins

[github-remark-security]: https://github.com/remarkjs/remark#security

[github-remark-stringify]: https://github.com/remarkjs/remark/tree/main/packages/remark-stringify

[github-unified]: https://github.com/unifiedjs/unified

[health]: https://github.com/remarkjs/.github

[health-coc]: https://github.com/remarkjs/.github/blob/main/code-of-conduct.md

[health-contributing]: https://github.com/remarkjs/.github/blob/main/contributing.md

[health-support]: https://github.com/remarkjs/.github/blob/main/support.md

[npm-install]: https://docs.npmjs.com/cli/install

[opencollective]: https://opencollective.com/unified

[typescript]: https://www.typescriptlang.org
