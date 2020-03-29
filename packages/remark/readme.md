# remark

[![Build][build-badge]][build]
[![Coverage][coverage-badge]][coverage]
[![Downloads][downloads-badge]][downloads]
[![Size][size-badge]][size]
[![Sponsors][sponsors-badge]][collective]
[![Backers][backers-badge]][collective]
[![Chat][chat-badge]][chat]

[**unified**][unified] processor to parse and serialize Markdown.
Powered by [plugins][].
Part of the [unified][] collective.

*   API by [**unified**][unified]
*   Parses Markdown to a syntax tree with [`remark-parse`][parse]
*   [**mdast**][mdast] syntax tree
*   [Plugins][] transform the tree
*   Serializes syntax trees to Markdown with [`remark-stringify`][stringify]

Don’t need the parser?
Or compiler?
[That’s OK: use **unified** directly][unified-usage].

## Sponsors

<!--lint ignore no-html maximum-line-length-->

<table>
  <tr valign="top">
    <td width="33.33%" align="center" colspan="2">
      <a href="https://www.gatsbyjs.org">Gatsby</a><br>🥇<br><br>
      <a href="https://www.gatsbyjs.org"><img src="https://avatars1.githubusercontent.com/u/12551863?s=900&v=4"></a>
    </td>
    <td width="33.33%" align="center" colspan="2">
      <a href="https://zeit.co">ZEIT</a><br>🥇<br><br>
      <!--OC has a sharper image-->
      <a href="https://zeit.co"><img src="https://images.opencollective.com/zeit/d8a5bee/logo/512.png"></a>
    </td>
    <td width="33.33%" align="center" colspan="2">
      <a href="https://www.netlify.com">Netlify</a><br>🥇<br><br>
      <!--OC has a sharper image-->
      <a href="https://www.netlify.com"><img src="https://images.opencollective.com/netlify/4087de2/logo/512.png"></a>
    </td>
  </tr>
  <tr valign="top">
    <td width="16.67%" align="center">
      <a href="https://www.holloway.com">Holloway</a><br><br><br>
      <a href="https://www.holloway.com"><img src="https://avatars1.githubusercontent.com/u/35904294?s=300&v=4"></a>
    </td>
    <td width="16.67%" align="center">
      <a href="https://themeisle.com">ThemeIsle</a><br>🥉<br><br>
      <a href="https://themeisle.com"><img src="https://twitter-avatar.now.sh/themeisle"></a>
    </td>
    <td width="16.67%" align="center">
      <a href="https://boostio.co">BoostIO</a><br>🥉<br><br>
      <a href="https://boostio.co"><img src="https://avatars1.githubusercontent.com/u/13612118?s=300&v=4"></a>
    </td>
    <td width="50%" align="center" colspan="3">
      <br><br><br><br>
      <a href="https://opencollective.com/unified"><strong>You?</strong></a>
    </td>
  </tr>
</table>

## Install

[npm][]:

```sh
npm install remark
```

## Use

[See **unified** for more examples »][unified]

###### Common example

This example lints Markdown and turns it into HTML.

```js
var remark = require('remark')
var recommended = require('remark-preset-lint-recommended')
var html = require('remark-html')
var report = require('vfile-reporter')

remark()
  .use(recommended)
  .use(html)
  .process('## Hello world!', function(err, file) {
    console.error(report(err || file))
    console.log(String(file))
  })
```

Yields:

```txt
1:1  warning  Missing newline character at end of file  final-newline  remark-lint

⚠ 1 warning
```

```html
<h2>Hello world!</h2>
```

###### Settings through data

This example prettifies Markdown and configures [`remark-parse`][parse] and
[`remark-stringify`][stringify] through [data][].

```js
var remark = require('remark')

remark()
  .data('settings', {commonmark: true, emphasis: '*', strong: '*'})
  .process('_Emphasis_ and __importance__', function(err, file) {
    if (err) throw err
    console.log(String(file))
  })
```

Yields:

```markdown
*Emphasis* and **importance**
```

###### Settings through a preset

This example prettifies Markdown and configures [`remark-parse`][parse] and
[`remark-stringify`][stringify] through a [preset][].

```js
var remark = require('remark')

remark()
  .use({
    settings: {commonmark: true, emphasis: '*', strong: '*'}
  })
  .process('_Emphasis_ and __importance__', function(err, file) {
    if (err) throw err
    console.log(String(file))
  })
```

Yields:

```markdown
*Emphasis* and **importance**
```

## API

[See **unified** for API docs »][unified]

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

This project has a [code of conduct][coc].
By interacting with this repository, organization, or community you agree to
abide by its terms.

## License

[MIT][license] © [Titus Wormer][author]

<!-- Definitions -->

[build-badge]: https://img.shields.io/travis/remarkjs/remark.svg

[build]: https://travis-ci.org/remarkjs/remark

[coverage-badge]: https://img.shields.io/codecov/c/github/remarkjs/remark.svg

[coverage]: https://codecov.io/github/remarkjs/remark

[downloads-badge]: https://img.shields.io/npm/dm/remark.svg

[downloads]: https://www.npmjs.com/package/remark

[size-badge]: https://img.shields.io/bundlephobia/minzip/remark.svg

[size]: https://bundlephobia.com/result?p=remark

[sponsors-badge]: https://opencollective.com/unified/sponsors/badge.svg

[backers-badge]: https://opencollective.com/unified/backers/badge.svg

[collective]: https://opencollective.com/unified

[chat-badge]: https://img.shields.io/badge/chat-spectrum-7b16ff.svg

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

[mdast]: https://github.com/syntax-tree/mdast

[parse]: https://github.com/remarkjs/remark/blob/master/packages/remark-parse

[stringify]: https://github.com/remarkjs/remark/blob/master/packages/remark-stringify

[plugins]: https://github.com/remarkjs/remark/blob/master/doc/plugins.md

[unified-usage]: https://github.com/unifiedjs/unified#usage

[preset]: https://github.com/unifiedjs/unified#preset

[data]: https://github.com/unifiedjs/unified#processordatakey-value

[xss]: https://en.wikipedia.org/wiki/Cross-site_scripting

[rehype]: https://github.com/rehypejs/rehype

[sanitize]: https://github.com/rehypejs/rehype-sanitize
