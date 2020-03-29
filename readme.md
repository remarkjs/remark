# ![remark][logo]

[![Build][build-badge]][build]
[![Coverage][coverage-badge]][coverage]
[![Downloads][downloads-badge]][downloads]
[![Size][size-badge]][size]
[![Sponsors][sponsors-badge]][collective]
[![Backers][backers-badge]][collective]
[![Chat][chat-badge]][chat]

**remark** is a Markdown processor powered by [plugins][] part of the
[unified][] collective.

## Intro

**remark** is [the world’s most popular Markdown parser][popular]!
And it does so much more than parse: it inspects (check, lint) and transforms
(generate, compile) Markdown too!

Everything is possible with plugins, such as [checking Markdown code
style (`remark-lint`)][remark-lint], [transforming safely to React
(`remark-react`)][remark-react], [adding a table of
contents (`remark-toc`)][remark-toc], or [compiling to man pages
(`remark-man`)][remark-man].

On top of that, remark is part of the [unified][website]
[collective][governance].
Learn more about us:

*   Visit [`unifiedjs.com`][website] and peruse its [Learn][] section for an
    overview
*   Read [unified][]’s readme for a technical intro
*   Browse [awesome remark][awesome] to find out more about the ecosystem
*   Follow us on [Twitter][] to see what we’re up to
*   Check out [Contribute][] below to find out how to help out

This repository contains the following projects:

*   [`remark-parse`][parse] — Parse Markdown to syntax trees
*   [`remark-stringify`][stringify] — Serialize syntax trees to Markdown
*   [`remark`][api] — Programmatic interface with both `remark-parse` and `remark-stringify`
*   [`remark-cli`][cli] — Command line interface wrapping `remark`

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
Join us in [spectrum][chat] to chat with the community and contributors.

A curated list of awesome resources can be found in [**awesome
remark**][awesome].

This project has a [code of conduct][coc].
By interacting with this repository, organization, or community you agree to
abide by its terms.

## License

[MIT](license) © [Titus Wormer](https://wooorm.com)

<!-- Definitions -->

[logo]: https://raw.githubusercontent.com/remarkjs/remark/4f6b3d7/logo.svg?sanitize=true

[build-badge]: https://img.shields.io/travis/remarkjs/remark.svg

[build]: https://travis-ci.org/remarkjs/remark

[coverage-badge]: https://img.shields.io/codecov/c/github/remarkjs/remark.svg

[coverage]: https://codecov.io/github/remarkjs/remark

[downloads-badge]: https://img.shields.io/npm/dm/remark.svg

[downloads]: https://www.npmjs.com/package/remark

[size-badge]: https://img.shields.io/bundlephobia/minzip/remark.svg

[size]: https://bundlephobia.com/result?p=remark

[chat-badge]: https://img.shields.io/badge/chat-spectrum-7b16ff.svg

[chat]: https://spectrum.chat/unified/remark

[sponsors-badge]: https://opencollective.com/unified/sponsors/badge.svg

[backers-badge]: https://opencollective.com/unified/backers/badge.svg

[popular]: https://www.npmtrends.com/remark-parse-vs-marked-vs-markdown-it

[api]: https://github.com/remarkjs/remark/tree/master/packages/remark

[parse]: https://github.com/remarkjs/remark/tree/master/packages/remark-parse

[stringify]: https://github.com/remarkjs/remark/tree/master/packages/remark-stringify

[cli]: https://github.com/remarkjs/remark/tree/master/packages/remark-cli

[plugins]: https://github.com/remarkjs/remark/tree/master/doc/plugins.md

[remark-lint]: https://github.com/remarkjs/remark-lint

[remark-react]: https://github.com/mapbox/remark-react

[remark-toc]: https://github.com/remarkjs/remark-toc

[remark-man]: https://github.com/remarkjs/remark-man

[unified]: https://github.com/unifiedjs/unified

[website]: https://unifiedjs.com

[learn]: https://unifiedjs.com/learn/

[contribute]: #contribute

[health]: https://github.com/remarkjs/.github

[contributing]: https://github.com/remarkjs/.github/blob/master/contributing.md

[support]: https://github.com/remarkjs/.github/blob/master/support.md

[coc]: https://github.com/remarkjs/.github/blob/master/code-of-conduct.md

[ideas]: https://github.com/remarkjs/ideas

[awesome]: https://github.com/remarkjs/awesome-remark

[collective]: https://opencollective.com/unified

[governance]: https://github.com/unifiedjs/governance

[twitter]: https://twitter.com/unifiedjs

[xss]: https://en.wikipedia.org/wiki/Cross-site_scripting

[rehype]: https://github.com/rehypejs/rehype

[sanitize]: https://github.com/rehypejs/rehype-sanitize
