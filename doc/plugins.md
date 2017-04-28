![remark][logo]

# Plugins

**remark** plug-ins lie at the core of **remark**’s vision.  As they work
on the same syntax tree, no start-up time penalty is inflicted when using
more than one plug-in: something which traditional tools, which need to
re-compile to markdown to connect together need.

See [tools built with remark »][products].

## Table of Contents

*   [List of Plugins](#list-of-plugins)
*   [List of Utilities](#list-of-utilities)
*   [Using plugins](#using-plugins)
*   [Creating plugins](#creating-plugins)

## List of Plugins

*   [`ben-eb/remark-autolink-headings`](https://github.com/ben-eb/remark-autolink-headings)
    — Automatically add GitHub style links to headings
*   [`ben-eb/remark-bookmarks`](https://github.com/ben-eb/remark-bookmarks)
    – Link manager for Markdown files
*   [`sethvincent/remark-bracketed-spans`](https://github.com/sethvincent/remark-bracketed-spans)
    – Add an id, classes, and data attributes to `<span>` tags in markdown
*   [`ben-eb/remark-comment-blocks`](https://github.com/ben-eb/remark-comment-blocks)
    — Wrap Markdown with a comment block
*   [`wooorm/remark-comment-config`](https://github.com/wooorm/remark-comment-config)
    — Configure remark with comments
*   [`hughsk/remark-contributors`](https://github.com/hughsk/remark-contributors)
    — Inject a given table of contributors
*   [`eush77/remark-defsplit`](https://github.com/eush77/remark-defsplit)
    — Extract inline link and image destinations as separate definitions
*   [`rhysd/remark-emoji`](https://github.com/rhysd/remark-emoji)
    — Transform unicode emoji to Gemoji shortcodes
*   [`jackycute/remark-emoji-to-gemoji`](https://github.com/jackycute/remark-emoji-to-gemoji)
    — Transform Gemoji shortcodes to unicode emoji
*   [`xuopled/remark-external-links`](https://github.com/xuopled/remark-external-links)
    — Automatically adds the target and rel attributes to external links
*   [`laat/remark-first-heading`](https://github.com/laat/remark-first-heading)
    — Replacing the first heading in a document
*   [`wooorm/remark-gemoji`](https://github.com/wooorm/remark-gemoji)
    — Gemoji short-code support in remark
*   [`jackycute/remark-gemoji-to-emoji`](https://github.com/jackycute/remark-gemoji-to-emoji)
    — Transform Gemoji shortcodes to Unicode emoji
*   [`wooorm/remark-github`](https://github.com/wooorm/remark-github)
    — Auto-link references like in GitHub issues, PRs, and comments
*   [`ben-eb/remark-heading-gap`](https://github.com/ben-eb/remark-heading-gap)
    — Adjust the gap between headings
*   [`ben-eb/remark-highlight.js`](https://github.com/ben-eb/remark-highlight.js)
    — Highlight code blocks in Markdown files with
    [highlight.js](https://github.com/isagalaev/highlight.js)
*   [`wooorm/remark-html`](https://github.com/wooorm/remark-html)
    — Compile Markdown to HTML documents
*   [`jackycute/remark-html-emoji-image`](https://github.com/jackycute/remark-html-emoji-image)
    — Transform unicode emoji to HTML images
*   [`rokt33r/remark-html-katex`](https://github.com/rokt33r/remark-math/blob/master/packages/remark-html-katex/readme.md)
    — Transform math inline and block nodes to styled HTML equations with [KaTeX](https://github.com/Khan/KaTeX)
*   [`wooorm/remark-inline-links`](https://github.com/wooorm/remark-inline-links)
    — Transform references and definitions to normal links and images
*   [`bizen241/remark-inline-math`](https://github.com/bizen241/remark-inline-math)
    — Inline math support
*   [`wooorm/remark-license`](https://github.com/wooorm/remark-license)
    — Add a license section
*   [`wooorm/remark-lint`](https://github.com/wooorm/remark-lint)
    — Markdown code style linter
*   [`wooorm/remark-man`](https://github.com/wooorm/remark-man)
    — Compile Markdown to Man pages (roff)
*   [`rokt33r/remark-math`](https://github.com/rokt33r/remark-math)
    — Math inline and block support
*   [`wooorm/remark-message-control`](https://github.com/wooorm/remark-message-control)
    — Enable, disable, and ignore messages
*   [`ben-eb/remark-midas`](https://github.com/ben-eb/remark-midas)
    — Highlight CSS in Markdown files with [midas](https://github.com/ben-eb/midas)
*   [`eush77/remark-normalize-headings`](https://github.com/eush77/remark-normalize-headings)
    — Ensure at most one top-level heading is in the document
*   [`mapbox/remark-react`](https://github.com/mapbox/remark-react)
    — Compile Markdown to [React](https://github.com/facebook/react)
*   [`bebraw/remark-react-lowlight`](https://github.com/bebraw/remark-react-lowlight)
    — Syntax highlighting for
    [remark-react](https://github.com/mapbox/remark-react) through
    [lowlight](https://github.com/wooorm/lowlight)
*   [`wooorm/remark-reference-links`](https://github.com/wooorm/remark-reference-links)
    — Transform links and images to references and definitions
*   [`wooorm/remark-rehype`](https://github.com/wooorm/remark-rehype)
    — [rehype](https://github.com/wooorm/rehype) support
*   [`wooorm/remark-retext`](https://github.com/wooorm/remark-retext)
    — [retext](https://github.com/wooorm/retext) support
*   [`strugee/remark-rewrite-headers`](https://github.com/strugee/remark-rewrite-headers)
    — Change heading levels
*   [`wooorm/remark-slug`](https://github.com/wooorm/remark-slug)
    — Add slugs to headings
*   [`wooorm/remark-strip-badges`](https://github.com/wooorm/remark-strip-badges)
    — Remove badges (such as `shields.io`)
*   [`eush77/remark-squeeze-paragraphs`](https://github.com/eush77/remark-squeeze-paragraphs)
    — Remove empty paragraphs
*   [`yoshuawuyts/remark-swagger`](https://github.com/yoshuawuyts/remark-swagger)
    — Insert a swagger specification
*   [`denysdovhan/remark-textr`](https://github.com/denysdovhan/remark-textr)
    — [`Textr`](https://github.com/shuvalov-anton/textr), a modular typographic
    framework
*   [`RichardLitt/remark-title`](https://github.com/RichardLitt/remark-title)
    — Check and inject the title of a markdown as the first element.
*   [`wooorm/remark-toc`](https://github.com/wooorm/remark-toc)
    — Generate a Table of Contents (TOC) for Markdown files
*   [`eush77/remark-unlink`](https://github.com/eush77/remark-unlink)
    — Remove all links, references and definitions
*   [`wooorm/remark-usage`](https://github.com/wooorm/remark-usage)
    — Add a usage example to your readme
*   [`wooorm/remark-validate-links`](https://github.com/wooorm/remark-validate-links)
    — Validate links point to existing headings and files
*   [`wooorm/remark-vdom`](https://github.com/wooorm/remark-vdom)
    — Compile Markdown to [VDOM](https://github.com/Matt-Esch/virtual-dom/)
*   [`sfrdmn/remark-yaml-annotations`](https://github.com/sfrdmn/remark-yaml-annotations)
    — Extend Markdown with YAML-based annotation syntax
*   [`wooorm/remark-yaml-config`](https://github.com/wooorm/remark-yaml-config)
    — Configure remark with YAML

## List of Utilities

See [**MDAST**][mdast-util] for a list of utilities for working with
the AST.  See [`unist`][unist-util] for other utilities which work with
**MDAST** nodes, too.

And finally, see [`wooorm/vfile`][vfile-util] for a list of utilities
for working with virtual files and

## Using plugins

To use a plug-in programmatically, invoke the [`use()`][unified-use]
function.

To use plug-in with `remark-cli`, pass a [`--use` flag][unified-args-use]
or specify it in a [configuration file][config-file-use].

## Creating plugins

First, read up on the [concept of plug-ins][unified-plugins].
Then, I suggest taking one of existing [plug-ins][plugins], which looks
similar to what you’re about to do, and work from there.  If you get
stuck, [issues][] and [Gitter][] are good places to get help.

A good place for publishing plug-ins is [npm][npm-publish].

You should pick a name prefixed by `"remark-"`, such as
[`remark-lint`][remark-lint].  The reasoning here is that they can be
used on the CLI without this prefix, but can still be meaningful.  For
example, `lint` was not available, but instead of opting for `liiint`
or some other weird form, using `remark-lint` ensured a unique name on
package managers, while still being meaningful to users.

When publishing a plug-in, you should use the package manager’s keywords
functionality and include `"remark"` in the list.

<!--Definitions:-->

[logo]: https://cdn.rawgit.com/wooorm/remark/6ecac20/logo.svg

[plugins]: #list-of-plugins

[products]: https://github.com/wooorm/remark/blob/master/doc/products.md

[mdast-util]: https://github.com/wooorm/mdast#list-of-utilities

[unist-util]: https://github.com/wooorm/unist#unist-node-utilties

[vfile-util]: https://github.com/wooorm/vfile#related-tools

[unified-use]: https://github.com/wooorm/unified#processoruseplugin-options

[unified-args-use]: https://github.com/wooorm/unified-args#--use-plugin

[config-file-use]: https://github.com/wooorm/unified-engine/blob/master/doc/configure.md#plugins

[unified-plugins]: https://github.com/wooorm/unified#plugin

[npm-publish]: https://docs.npmjs.com/getting-started/publishing-npm-packages

[remark-lint]: https://www.npmjs.com/package/remark-toc

[issues]: https://github.com/wooorm/remark/issues

[gitter]: https://gitter.im/wooorm/remark
