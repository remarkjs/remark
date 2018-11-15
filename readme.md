# ![remark][logo]

[![Travis][build-badge]][build-status]
[![Coverage][coverage-badge]][coverage-status]
[![Downloads][downloads-badge]][downloads]
[![Size][size-badge]][size]
[![Chat][chat-badge]][chat]

**remark** is a markdown processor powered by [plugins][] part of the
[unified][] [collective][].

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

## Intro

**remark** not another markdown to HTML compiler.
It can generate and reformat markdown too.
Powered by plugins to do all kinds of things: [check markdown code
style][remark-lint], [transform safely to React][remark-react], [add a table of
contents][remark-toc], or [compile to man pages][remark-man].

*   Visit [`unified.js.org`][website] and try its [guides][] for an overview
*   Read [unified][]’s readme for a technical intro
*   Browse [awesome remark][awesome] to find out more about the ecosystem
*   Follow us on [Medium][] and [Twitter][] to see what we’re up to
*   Check out [Contribute][] below to find out how to help out

This repository contains the following projects:

*   [`remark-parse`][api] — Parse a markdown document to a syntax tree
*   [`remark-stringify`][api] — Stringify a syntax tree to a markdown document
*   [`remark`][api] — Programmatic interface with both `remark-parse` and `remark-stringify`
*   [`remark-cli`][cli] — Command-line interface wrapping `remark`

## Contribute

**remark** is built by people just like you!
Check out [`contributing.md`][contributing] for ways to get started.

This project has a [Code of Conduct][coc].
By interacting with this repository, organisation, or community you agree to
abide by its terms.

Want to chat with the community and contributors?
Join us in [spectrum][chat]!

Have an idea for a cool new utility or tool?
That’s great!
If you want feedback, help, or just to share it with the world you can do so by
creating an issue in the [`remarkjs/ideas`][ideas] repository!

## License

[MIT](license) © [Titus Wormer](https://wooorm.com)

<!-- Definitions -->

[logo]: https://raw.githubusercontent.com/remarkjs/remark/4f6b3d7/logo.svg?sanitize=true

[build-badge]: https://img.shields.io/travis/remarkjs/remark/master.svg

[build-status]: https://travis-ci.org/remarkjs/remark

[coverage-badge]: https://img.shields.io/codecov/c/github/remarkjs/remark.svg

[coverage-status]: https://codecov.io/github/remarkjs/remark

[downloads-badge]: https://img.shields.io/npm/dm/remark.svg

[downloads]: https://www.npmjs.com/package/remark

[size-badge]: https://img.shields.io/bundlephobia/minzip/remark.svg

[size]: https://bundlephobia.com/result?p=remark

[chat-badge]: https://img.shields.io/badge/join%20the%20community-on%20spectrum-7b16ff.svg

[chat]: https://spectrum.chat/unified/remark

[api]: https://github.com/remarkjs/remark/tree/master/packages/remark

[cli]: https://github.com/remarkjs/remark/tree/master/packages/remark-cli

[plugins]: https://github.com/remarkjs/remark/tree/master/doc/plugins.md

[remark-lint]: https://github.com/remarkjs/remark-lint

[remark-react]: https://github.com/mapbox/remark-react

[remark-toc]: https://github.com/remarkjs/remark-toc

[remark-man]: https://github.com/remarkjs/remark-man

[unified]: https://github.com/unifiedjs/unified

[website]: https://unifiedjs.github.io

[guides]: https://unified.js.org/#guides

[contribute]: #contribute

[contributing]: contributing.md

[coc]: code-of-conduct.md

[ideas]: https://github.com/remarkjs/ideas

[awesome]: https://github.com/remarkjs/awesome

[collective]: https://opencollective.com/unified

[medium]: https://medium.com/unifiedjs

[announcement]: https://medium.com/unifiedjs/collectively-evolving-through-crowdsourcing-22c359ea95cc

[twitter]: https://twitter.com/unifiedjs
