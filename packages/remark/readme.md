# remark

[![Build][build-badge]][build]
[![Coverage][coverage-badge]][coverage]
[![Downloads][downloads-badge]][downloads]
[![Size][size-badge]][size]
[![Sponsors][sponsors-badge]][collective]
[![Backers][backers-badge]][collective]
[![Chat][chat-badge]][chat]

**[unified][]** processor with support for parsing from markdown and
serializing to markdown.

## Contents

*   [What is this?](#what-is-this)
*   [When should I use this?](#when-should-i-use-this)
*   [Install](#install)
*   [Use](#use)
*   [API](#api)
    *   [`remark()`](#remark-1)
*   [Examples](#examples)
    *   [Example: checking markdown](#example-checking-markdown)
    *   [Example: passing options to `remark-stringify`](#example-passing-options-to-remark-stringify)
*   [Syntax](#syntax)
*   [Syntax tree](#syntax-tree)
*   [Types](#types)
*   [Compatibility](#compatibility)
*   [Security](#security)
*   [Contribute](#contribute)
*   [Sponsor](#sponsor)
*   [License](#license)

## What is this?

This package is a [unified][] processor with support for parsing markdown as
input and serializing markdown as output by using unified with
[`remark-parse`][remark-parse] and [`remark-stringify`][remark-stringify].

See [the monorepo readme][remark] for info on what the remark ecosystem is.

## When should I use this?

You can use this package when you want to use unified, have markdown as input,
and want markdown as output.
This package is a shortcut for
`unified().use(remarkParse).use(remarkStringify)`.
When the input isn’t markdown (meaning you don’t need `remark-parse`) or the
output is not markdown (you don’t need `remark-stringify`), it’s recommended to
use `unified` directly.

When you want to inspect and format markdown files in a project on the command
line, you can use [`remark-cli`][remark-cli].

## Install

This package is [ESM only][esm].
In Node.js (version 16+), install with [npm][]:

```sh
npm install remark
```

In Deno with [`esm.sh`][esmsh]:

```js
import {remark} from 'https://esm.sh/remark@15'
```

In browsers with [`esm.sh`][esmsh]:

```html
<script type="module">
  import {remark} from 'https://esm.sh/remark@15?bundle'
</script>
```

## Use

Say we have the following module `example.js`:

```js
import {remark} from 'remark'
import remarkToc from 'remark-toc'

const doc = `
# Pluto

Pluto is a dwarf planet in the Kuiper belt.

## Contents

## History

### Discovery

In the 1840s, Urbain Le Verrier used Newtonian mechanics to predict the position of…

### Name and symbol

The name Pluto is for the Roman god of the underworld, from a Greek epithet for Hades…

### Planet X disproved

Once Pluto was found, its faintness and lack of a viewable disc cast doubt…

## Orbit

Pluto's orbital period is about 248 years…
`

const file = await remark()
  .use(remarkToc, {heading: 'contents', tight: true})
  .process(doc)

console.error(String(file))
```

…running that with `node example.js` yields:

```markdown
# Pluto

Pluto is a dwarf planet in the Kuiper belt.

## Contents

* [History](#history)
  * [Discovery](#discovery)
  * [Name and symbol](#name-and-symbol)
  * [Planet X disproved](#planet-x-disproved)
* [Orbit](#orbit)

## History

### Discovery

In the 1840s, Urbain Le Verrier used Newtonian mechanics to predict the position of…

### Name and symbol

The name Pluto is for the Roman god of the underworld, from a Greek epithet for Hades…

### Planet X disproved

Once Pluto was found, its faintness and lack of a viewable disc cast doubt…

## Orbit

Pluto's orbital period is about 248 years…
```

## API

This package exports the identifier [`remark`][api-remark].
There is no default export.

### `remark()`

Create a new unified processor that already uses
[`remark-parse`][remark-parse] and [`remark-stringify`][remark-stringify].

You can add more plugins with `use`.
See [`unified`][unified] for more information.

## Examples

### Example: checking markdown

The following example checks that markdown code style is consistent and follows
some best practices:

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

### Example: passing options to `remark-stringify`

When you use `remark-stringify` manually you can pass options to `use`.
Because `remark-stringify` is already used in `remark`, that’s not possible.
To define options for `remark-stringify`, you can instead pass options to
`data`:

```js
import {remark} from 'remark'

const doc = `
# Moons of Neptune

1. Naiad
2. Thalassa
3. Despine
4. …
`

const file = await remark()
  .data('settings', {
    bulletOrdered: ')',
    incrementListMarker: false,
    setext: true
  })
  .process(doc)

console.log(String(file))
```

Yields:

```markdown
Moons of Neptune
================

1) Naiad
1) Thalassa
1) Despine
1) …
```

## Syntax

Markdown is parsed and serialized according to CommonMark.
Other plugins can add support for syntax extensions.

## Syntax tree

The syntax tree used in remark is [mdast][].

## Types

This package is fully typed with [TypeScript][].
There are no extra exported types.

It also registers `Settings` with `unified`.
If you’re passing options with `.data('settings', …)`, make sure to import this
package somewhere in your types, as that registers the fields.

```js
/// <reference types="remark" />

import {unified} from 'unified'

// @ts-expect-error: `thisDoesNotExist` is not a valid option.
unified().data('settings', {thisDoesNotExist: false})
```

## Compatibility

Projects maintained by the unified collective are compatible with maintained
versions of Node.js.

When we cut a new major release, we drop support for unmaintained versions of
Node.
This means we try to keep the current release line, `remark@^15`, compatible
with Node.js 16.

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

[MIT][license] © [Titus Wormer][author]

<!-- Definitions -->

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

[license]: https://github.com/remarkjs/remark/blob/main/license

[author]: https://wooorm.com

[npm]: https://docs.npmjs.com/cli/install

[esm]: https://gist.github.com/sindresorhus/a39789f98801d908bbc7ff3ecc99d99c

[esmsh]: https://esm.sh

[mdast]: https://github.com/syntax-tree/mdast

[rehype]: https://github.com/rehypejs/rehype

[rehype-sanitize]: https://github.com/rehypejs/rehype-sanitize

[remark]: https://github.com/remarkjs/remark

[remark-parse]: ../remark-parse

[remark-stringify]: ../remark-stringify

[remark-cli]: ../remark-cli

[typescript]: https://www.typescriptlang.org

[unified]: https://github.com/unifiedjs/unified

[xss]: https://en.wikipedia.org/wiki/Cross-site_scripting

[api-remark]: #remark-1
