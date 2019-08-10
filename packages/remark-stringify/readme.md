# remark-stringify

[![Build][build-badge]][build]
[![Coverage][coverage-badge]][coverage]
[![Downloads][downloads-badge]][downloads]
[![Size][size-badge]][size]
[![Chat][chat-badge]][chat]
[![Sponsors][sponsors-badge]][collective]
[![Backers][backers-badge]][collective]

[Compiler][] for [**unified**][unified].
Stringifies [**mdast**][mdast] syntax trees to Markdown.
Used in the [**remark** processor][remark] but can be used on its own as well.
Can be [extended][extend] to change how Markdown is compiled.

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
      <a href="https://www.gatsbyjs.org">Gatsby</a>
    </td>
    <td width="20%" align="center">
      <a href="https://www.netlify.com"><img src="https://avatars1.githubusercontent.com/u/7892489?s=400&v=4"></a>
      <br><br>🥇
      <a href="https://www.netlify.com">Netlify</a>
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

[**Read more about the unified collective on Medium »**][announcement]

## Install

[npm][]:

```sh
npm install remark-stringify
```

## Use

```js
var unified = require('unified')
var createStream = require('unified-stream')
var html = require('rehype-parse')
var rehype2remark = require('rehype-remark')
var stringify = require('remark-stringify')

var processor = unified()
  .use(html)
  .use(rehype2remark)
  .use(stringify, {
    bullet: '*',
    fence: '~',
    fences: true,
    incrementListMarker: false
  })

process.stdin.pipe(createStream(processor)).pipe(process.stdout)
```

[See **unified** for more examples »][unified]

## Table of Contents

*   [API](#api)
    *   [`processor().use(stringify[, options])`](#processorusestringify-options)
    *   [`stringify.Compiler`](#stringifycompiler)
*   [Extending the Compiler](#extending-the-compiler)
    *   [`Compiler#visitors`](#compilervisitors)
    *   [`function visitor(node[, parent])`](#function-visitornode-parent)
*   [Security](#security)
*   [Contribute](#contribute)
*   [License](#license)

## API

[See **unified** for API docs »][unified]

### `processor().use(stringify[, options])`

Configure the `processor` to stringify [**mdast**][mdast] syntax trees to
Markdown.

##### `options`

Options can be passed directly, or passed later through
[`processor.data()`][data].

###### `options.gfm`

Stringify with the required escapes for GFM compatible Markdown (`boolean`,
default: `true`).

*   Escape pipes (`|`, for tables)
*   Escape colons (`:`, for literal URLs)
*   Escape tildes (`~`, for strike-through)

###### `options.commonmark`

Stringify for CommonMark compatible Markdown (`boolean`, default: `false`).

*   Compile adjacent blockquotes separately
*   Escape more characters using slashes, instead of as entities

###### `options.pedantic`

Stringify for pedantic compatible markdown (`boolean`, default: `false`).

*   Escape underscores in words

###### `options.entities`

How to stringify entities (`string` or `boolean`, default: `false`):

*   `true` — Entities are generated for special HTML characters (`&` > `&amp;`)
    and non-ASCII characters (`©` > `&copy;`).
    If named entities are not (widely) supported, numbered character references
    are used (`’` > `&#x2019;`)
*   `'numbers'` — Numbered entities are generated (`&` > `&#x26;`) for special
    HTML characters and non-ASCII characters
*   `'escape'` — Special HTML characters are encoded (`&` > `&amp;`, `’` >
    `&#x2019;`), non-ASCII characters not (ö persists)

###### `options.setext`

Compile headings, when possible, in Setext-style (`boolean`, default: `false`).
Uses `=` for level one headings and `-` for level two headings.
Other heading levels are compiled as ATX (respecting `closeAtx`).

###### `options.closeAtx`

Compile ATX headings with the same amount of closing hashes as opening hashes
(`boolean`, default: `false`).

###### `options.looseTable`

Create tables without fences: initial and final pipes (`boolean`, default:
`false`).

###### `options.spacedTable`

Create tables with a space between a pipe and content (`boolean`, default:
`true`).

###### `options.paddedTable`

Create tables with more spaces so that all cells in a column align (`boolean`,
default: `true`).

###### `options.stringLength`

Function passed to [`markdown-table`][markdown-table] to detect the length of a
table cell (`Function`, default: [`s => s.length`][string-length]).
Used to pad tables.

###### `options.fence`

Marker to use for fenced code blocks (`'~'` or ``'`'``, default: ``'`'``).

###### `options.fences`

Create code blocks with a fence instead of indentation if they have no info
string (`boolean`, default: `false`).

When `false`, code blocks are indented.
Code blocks with an info string are always fenced.

###### `options.bullet`

Marker to use for the bullet of unordered list items (`'-'`, `'*'`, or `'+'`,
default: `'-'`).

###### `options.listItemIndent`

Style of indentation for list items (`'tab'`, `'mixed'` or `'1'`, default:
`'tab'`).

*   `'tab'`: use a tab stops (4 spaces)
*   `'1'`: use one space
*   `'mixed'`: use `1` for tight and `tab` for loose list items

###### `options.incrementListMarker`

Increment ordered list item numbers (`boolean`, default: `true`).

When `false`, all list item numbers will be the same.

###### `options.rule`

Marker to use for thematic breaks / horizontal rules (`'-'`, `'*'`, or `'_'`,
default: `'*'`).

###### `options.ruleRepetition`

Number of markers to use for thematic breaks / horizontal rules (`number`,
default: `3`).
Musts be `3` or more.

###### `options.ruleSpaces`

Place a space between thematic break (horizontal rule) markers (`boolean`,
default `true`).

###### `options.strong`

Marker to use for importance (`'_'` or `'*'`, default `'*'`).

###### `options.emphasis`

Marker to use for emphasis (`'_'` or `'*'`, default `'_'`).

### `stringify.Compiler`

Access to the [compiler][], if you need it.

## Extending the Compiler

If the `remark-stringify` plugin is used, it adds a [`Compiler`][compiler]
constructor function to the `processor`.
Other plugins can add visitors to its prototype to change how Markdown is
compiled.

The below plugin modifies a [visitor][] to add an extra blank line before
headings with a rank of `2`.

```js
module.exports = gap

function gap() {
  var Compiler = this.Compiler
  var visitors = Compiler.prototype.visitors
  var original = visitors.heading

  visitors.heading = heading

  function heading(node) {
    return (node.depth === 2 ? '\n' : '') + original.apply(this, arguments)
  }
}
```

### `Compiler#visitors`

Map of types to [visitor][]s (`Object.<Function>`).

### `function visitor(node[, parent])`

Stringify `node`.

###### Parameters

*   `node` ([`Node`][node]) — Node to compile
*   `parent` ([`Parent`][parent], optional) — Parent of `node`.
    Not available on the root node

###### Returns

`string` — Compiled given `node`.

## Security

As Markdown is sometimes used for HTML, and improper use of HTML can open you up
to a [cross-site scripting (XSS)][xss] attack, use of remark can also be unsafe.
When going to HTML, use remark in combination with the [**rehype**][rehype]
ecosystem, and use [`rehype-sanitize`][sanitize] to make the tree safe.

Use of remark plugins could also open you up to other attacks.
Carefully assess each plugin and the risks involved in using them.

## Contribute

See [`contributing.md`][contributing] in [`remarkjs/.github`][health] for ways
to get started.
See [`support.md`][support] for ways to get help.
Ideas for new plugins and tools can be posted in [`remarkjs/ideas`][ideas].

A curated list of awesome remark resources can be found in [**awesome
remark**][awesome].

This project has a [Code of Conduct][coc].
By interacting with this repository, organisation, or community you agree to
abide by its terms.

## License

[MIT][license] © [Titus Wormer][author]

<!-- Definitions -->

[build-badge]: https://img.shields.io/travis/remarkjs/remark.svg

[build]: https://travis-ci.org/remarkjs/remark

[coverage-badge]: https://img.shields.io/codecov/c/github/remarkjs/remark.svg

[coverage]: https://codecov.io/github/remarkjs/remark

[downloads-badge]: https://img.shields.io/npm/dm/remark-stringify.svg

[downloads]: https://www.npmjs.com/package/remark-stringify

[size-badge]: https://img.shields.io/bundlephobia/minzip/remark-stringify.svg

[size]: https://bundlephobia.com/result?p=remark-stringify

[sponsors-badge]: https://opencollective.com/unified/sponsors/badge.svg

[backers-badge]: https://opencollective.com/unified/backers/badge.svg

[collective]: https://opencollective.com/unified

[chat-badge]: https://img.shields.io/badge/join%20the%20community-on%20spectrum-7b16ff.svg

[chat]: https://spectrum.chat/unified/remark

[health]: https://github.com/remarkjs/.github

[contributing]: https://github.com/remarkjs/.github/blob/master/contributing.md

[support]: https://github.com/remarkjs/.github/blob/master/support.md

[coc]: https://github.com/remarkjs/.github/blob/master/code-of-conduct.md

[ideas]: https://github.com/remarkjs/ideas

[awesome]: https://github.com/remarkjs/awesome-remark

[license]: https://github.com/remarkjs/remark/blob/master/license

[author]: https://wooorm.com

[npm]: https://docs.npmjs.com/cli/install

[unified]: https://github.com/unifiedjs/unified

[data]: https://github.com/unifiedjs/unified#processordatakey-value

[remark]: https://github.com/remarkjs/remark/tree/master/packages/remark

[compiler]: https://github.com/unifiedjs/unified#processorcompiler

[mdast]: https://github.com/syntax-tree/mdast

[node]: https://github.com/syntax-tree/unist#node

[parent]: https://github.com/syntax-tree/unist#parent

[extend]: #extending-the-compiler

[visitor]: #function-visitornode-parent

[announcement]: https://medium.com/unifiedjs/collectively-evolving-through-crowdsourcing-22c359ea95cc

[markdown-table]: https://github.com/wooorm/markdown-table

[string-length]: https://github.com/wooorm/markdown-table#stringlengthcell

[xss]: https://en.wikipedia.org/wiki/Cross-site_scripting

[rehype]: https://github.com/rehypejs/rehype

[sanitize]: https://github.com/rehypejs/rehype-sanitize
