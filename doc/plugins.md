![remark][logo]

# Plugins

**remark** is an ecosystem of [plugins][plugins].

See [tools built with remark »][products].

## Table of Contents

*   [List of Plugins](#list-of-plugins)
*   [List of Presets](#list-of-presets)
*   [List of Utilities](#list-of-utilities)
*   [Using plugins](#using-plugins)
*   [Creating plugins](#creating-plugins)

## List of Plugins

Have a good idea for a new plugin?  Let’s [chat][gitter] and make it happen!

*   [`remark-abbr`](https://github.com/zestedesavoir/zmarkdown/tree/master/packages/remark-abbr)
    — Custom syntax to handle abbreviations, custom mdast inline node type
    `abbr`.  Rehype compatible (`<abbr title="bar">foo</abbr>`)
*   [`remark-align`](https://github.com/zestedesavoir/zmarkdown/tree/master/packages/remark-align)
    — Custom syntax to handle text/block alignment, custom mdast block node
    type `CenterAligned`, `RightAligned`.  Rehype compatible (wraps in `div`s
    with alignment as configurable CSS class)
*   [`remark-attr`](https://github.com/arobase-che/remark-attr)
    — Add support for custom attributes to markdown
*   [`remark-autolink-headings`](https://github.com/ben-eb/remark-autolink-headings)
    — Automatically add GitHub style links to headings
*   [`remark-behead`](https://github.com/mrzmmr/remark-behead)
    — Increase or decrease heading depth
*   [`remark-bookmarks`](https://github.com/ben-eb/remark-bookmarks)
    – Link manager for Markdown files
*   [`remark-bracketed-spans`](https://github.com/sethvincent/remark-bracketed-spans)
    – Add an id, classes, and data attributes to `<span>` tags in markdown
*   [`remark-breaks`](https://github.com/remarkjs/remark-breaks)
    – Breaks support, without needing spaces
*   [`remark-collapse`](https://github.com/Rokt33r/remark-collapse)
    — Make a section collapsible
*   [`remark-comment-blocks`](https://github.com/ben-eb/remark-comment-blocks)
    — Wrap Markdown with a comment block
*   [`remark-comment-config`](https://github.com/remarkjs/remark-comment-config)
    — Configure remark with comments
*   [`remark-comments`](https://github.com/zestedesavoir/zmarkdown/tree/master/packages/remark-comments)
    — Configurable custom syntax to ignore parts of the Markdown input
*   [`remark-contributors`](https://github.com/hughsk/remark-contributors)
    — Inject a given table of contributors
*   [`remark-custom-blocks`](https://github.com/zestedesavoir/zmarkdown/tree/master/packages/remark-custom-blocks)
    — Configurable custom syntax to parse custom blocks, creating new mdast
    node types.  Rehype compatible
*   [`remark-defsplit`](https://github.com/eush77/remark-defsplit)
    — Extract inline link and image destinations as separate definitions
*   [`remark-disable-tokenizers`](https://github.com/zestedesavoir/zmarkdown/tree/master/packages/remark-disable-tokenizers)
    — Disable any or all remark’s `blockTokenizers` and `inlineTokenizers`
*   [`remark-embed-images`](https://github.com/dherges/remark-embed-images)
    — Embed images with data: URIs, inlining base64-encoded sources
*   [`remark-emoji`](https://github.com/rhysd/remark-emoji)
    — Transform unicode emoji to Gemoji shortcodes
*   [`remark-emoji-to-gemoji`](https://github.com/jackycute/remark-emoji-to-gemoji)
    — Transform Gemoji shortcodes to unicode emoji
*   [`remark-external-links`](https://github.com/xuopled/remark-external-links)
    — Automatically adds the target and rel attributes to external links
*   [`remark-first-heading`](https://github.com/laat/remark-first-heading)
    — Replacing the first heading in a document
*   [`remark-fix-guillemets`](https://github.com/zestedesavoir/zmarkdown/tree/master/packages/remark-fix-guillemets)
    — For weird typographic reasons, this fixes `<<a>>` being parsed as
      `<` + html tag `<a>` + `>` and instead replaces this with text `<<a>>`
*   [`remark-frontmatter`](https://github.com/remarkjs/remark-frontmatter)
    – Frontmatter (yaml, toml, and more) support
*   [`remark-gemoji`](https://github.com/remarkjs/remark-gemoji)
    — Gemoji short-code support in remark
*   [`remark-gemoji-to-emoji`](https://github.com/jackycute/remark-gemoji-to-emoji)
    — Transform Gemoji shortcodes to Unicode emoji
*   [`remark-generic-extensions`](https://github.com/medfreeman/remark-generic-extensions)
    — Commonmark generic directive extension
*   [`remark-github`](https://github.com/remarkjs/remark-github)
    — Auto-link references like in GitHub issues, PRs, and comments
*   [`remark-gitlab-artifact`](https://github.com/temando/remark-gitlab-artifact)
    — Download artifacts from GitLab projects to live alongside your Markdown
*   [`remark-grid-tables`](https://github.com/zestedesavoir/zmarkdown/tree/master/packages/remark-grid-tables)
    — Custom Markdown syntax to describe tables.  Rehype compatible
*   [`remark-graphviz`](https://github.com/temando/remark-graphviz)
    — Replace `dot` graphs with rendered SVGs
*   [`remark-heading-gap`](https://github.com/ben-eb/remark-heading-gap)
    — Adjust the gap between headings
*   [`remark-highlight.js`](https://github.com/ben-eb/remark-highlight.js)
    — Highlight code blocks in Markdown files with
    [highlight.js](https://github.com/isagalaev/highlight.js)
*   [`remark-html`](https://github.com/remarkjs/remark-html)
    — Compile Markdown to HTML documents
*   [`remark-html-emoji-image`](https://github.com/jackycute/remark-html-emoji-image)
    — Transform unicode emoji to HTML images
*   [`remark-html-katex`](https://github.com/rokt33r/remark-math/blob/master/packages/remark-html-katex/readme.md)
    — Transform math inline and block nodes to styled HTML equations with [KaTeX](https://github.com/Khan/KaTeX)
*   [`remark-iframes`](https://github.com/zestedesavoir/zmarkdown/tree/master/packages/remark-iframes)
    — Custom syntax with fully configurable iframe providers, following a
    whitelist approach.  Rehype compatible
*   [`remark-inline-links`](https://github.com/remarkjs/remark-inline-links)
    — Transform references and definitions to normal links and images
*   [`remark-inline-math`](https://github.com/bizen241/remark-inline-math)
    — Inline math support
*   [`remark-kbd`](https://github.com/zestedesavoir/zmarkdown/tree/master/packages/remark-kbd)
    — Custom syntax, parses `||foo||` into a new mdast inline node type `kbd`.
    Rehype compatible (`<kbd>foo</kbd>`)
*   [`remark-license`](https://github.com/remarkjs/remark-license)
    — Add a license section
*   [`remark-lint`](https://github.com/remarkjs/remark-lint)
    — Markdown code style linter
*   [`remark-man`](https://github.com/remarkjs/remark-man)
    — Compile Markdown to Man pages (roff)
*   [`remark-math`](https://github.com/rokt33r/remark-math)
    — Math inline and block support
*   [`remark-mermaid`](https://github.com/temando/remark-mermaid)
    — Replace [mermaid](https://mermaidjs.github.io/) graphs with rendered SVGs
*   [`remark-message-control`](https://github.com/remarkjs/remark-message-control)
    — Enable, disable, and ignore messages
*   [`remark-metadata`](https://github.com/temando/remark-metadata)
    — Add metadata about the processed file as front matter
*   [`remark-midas`](https://github.com/ben-eb/remark-midas)
    — Highlight CSS in Markdown files with [midas](https://github.com/ben-eb/midas)
*   [`remark-normalize-headings`](https://github.com/eush77/remark-normalize-headings)
    — Ensure at most one top-level heading is in the document
*   [`remark-openapi`](https://github.com/temando/remark-openapi)
    — Convert links to local or remote OpenAPI definition to tables with
    summaries of all paths
*   [`remark-parse-yaml`](https://github.com/landakram/remark-parse-yaml)
    — Parse YAML blocks into structured data
*   [`remark-ping`](https://github.com/zestedesavoir/zmarkdown/tree/master/packages/remark-ping)
    — Custom syntax, parses `@user`, `@**first last**`, configurable existence
    check.  Rehype compatible
*   [`remark-react`](https://github.com/mapbox/remark-react)
    — Compile Markdown to [React](https://github.com/facebook/react)
*   [`remark-react-codemirror`](https://github.com/craftzdog/remark-react-codemirror)
    — Syntax highlighting for
    [remark-react](https://github.com/mapbox/remark-react) through
    [CodeMirror](https://codemirror.net)
*   [`remark-react-lowlight`](https://github.com/bebraw/remark-react-lowlight)
    — Syntax highlighting for
    [remark-react](https://github.com/mapbox/remark-react) through
    [lowlight](https://github.com/wooorm/lowlight)
*   [`remark-redact`](https://github.com/seafoam6/remark-redact)
    — Conceal portions of text with a █
*   [`remark-reference-links`](https://github.com/remarkjs/remark-reference-links)
    — Transform links and images to references and definitions
*   [`remark-rehype`](https://github.com/remarkjs/remark-rehype)
    — [rehype](https://github.com/rehypejs/rehype) support
*   [`remark-retext`](https://github.com/remarkjs/remark-retext)
    — [retext](https://github.com/retextjs/retext) support
*   [`remark-shortcodes`](https://github.com/djm/remark-shortcodes)
    — Parses custom Wordpress/Hugo-like shortcodes inside your Markdown
*   [`remark-slug`](https://github.com/remarkjs/remark-slug)
    — Add slugs to headings
*   [`remark-strip-badges`](https://github.com/remarkjs/remark-strip-badges)
    — Remove badges (such as `shields.io`)
*   [`remark-strip-html`](https://github.com/craftzdog/remark-strip-html)
    — Remove html formatting
*   [`remark-squeeze-paragraphs`](https://github.com/eush77/remark-squeeze-paragraphs)
    — Remove empty paragraphs
*   [`remark-sub-super`](https://github.com/zestedesavoir/zmarkdown/tree/master/packages/remark-sub-super)
    — Custom syntax to parse subscript and superscript.  Rehype compatible
    (using `<sub>` and `<sup>`)
*   [`remark-swagger`](https://github.com/yoshuawuyts/remark-swagger)
    — Insert a swagger specification
*   [`remark-textr`](https://github.com/denysdovhan/remark-textr)
    — [`Textr`](https://github.com/shuvalov-anton/textr), a modular typographic
    framework
*   [`remark-title`](https://github.com/RichardLitt/remark-title)
    — Check and inject the title of a markdown as the first element.
*   [`remark-toc`](https://github.com/remarkjs/remark-toc)
    — Generate a Table of Contents (TOC) for Markdown files
*   [`remark-unlink`](https://github.com/eush77/remark-unlink)
    — Remove all links, references and definitions
*   [`remark-usage`](https://github.com/remarkjs/remark-usage)
    — Add a usage example to your readme
*   [`remark-validate-links`](https://github.com/remarkjs/remark-validate-links)
    — Validate links point to existing headings and files
*   [`remark-vdom`](https://github.com/remarkjs/remark-vdom)
    — Compile Markdown to [VDOM](https://github.com/Matt-Esch/virtual-dom/)
*   [`remark-wiki-link`](https://github.com/landakram/remark-wiki-link)
    — Parse and render wiki links
*   [`remark-yaml-annotations`](https://github.com/sfrdmn/remark-yaml-annotations)
    — Extend Markdown with YAML-based annotation syntax
*   [`remark-yaml-config`](https://github.com/remarkjs/remark-yaml-config)
    — Configure remark with YAML

## List of Presets

See [npm search][preset-search] for available and often inspirational presets.

## List of Utilities

See [**MDAST**][mdast-util] for a list of utilities for working with
the syntax tree.  See [`unist`][unist-util] for other utilities which work with
**MDAST** nodes, too.

And finally, see [**vfile**][vfile-util] for a list of utilities working with
virtual files.

## Using plugins

To use a plugin programmatically, invoke the [`use()`][unified-use]
function.

To use plugin with `remark-cli`, pass a [`--use` flag][unified-args-use]
or specify it in a [configuration file][config-file-use].

## Creating plugins

First, read up on the [concept of plugins][unified-plugins].  Then, read the
[guide on “Creating a plugin with unified”][guide].  Finally, take one of
existing [plugins][], which looks similar to what you’re about to do,
and work from there.  If you get stuck, [issues][] and [Gitter][] are good
places to get help.

You should pick a name prefixed by `'remark-'`, such as `remark-lint`.

Note that, if the thing you create cannot be given to `remark().use()`,
it isn’t a “plugin”.  Don’t use the `remark-` prefix as that could
confuse users.  If it works with the HAST tree, use `'mdast-util-'`, if
it works with any Unist tree, use `unist-util-`, if it works with virtual
files, use `vfile-`.

<!--Definitions:-->

[logo]: https://cdn.rawgit.com/remarkjs/remark/ee78519/logo.svg

[plugins]: #list-of-plugins

[products]: https://github.com/remarkjs/remark/blob/master/doc/products.md

[mdast-util]: https://github.com/syntax-tree/mdast#list-of-utilities

[unist-util]: https://github.com/syntax-tree/unist#unist-utilities

[vfile-util]: https://github.com/vfile/vfile#utilities

[unified-use]: https://github.com/unifiedjs/unified#processoruseplugin-options

[unified-args-use]: https://github.com/unifiedjs/unified-args#--use-plugin

[config-file-use]: https://github.com/unifiedjs/unified-engine/blob/master/doc/configure.md#plugins

[unified-plugins]: https://github.com/unifiedjs/unified#plugin

[issues]: https://github.com/remarkjs/remark/issues

[gitter]: https://gitter.im/remarkjs/Lobby

[guide]: https://unifiedjs.github.io/create-a-plugin.html

[preset-search]: https://www.npmjs.com/search?q=remark-preset
