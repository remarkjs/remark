![remark][logo]

# Plugins

**remark** is a Markdown processor powered by plugins part of the [unified][]
[collective][].

## Table of Contents

*   [List of Plugins](#list-of-plugins)
*   [List of Presets](#list-of-presets)
*   [List of Utilities](#list-of-utilities)
*   [Using plugins](#using-plugins)
*   [Creating plugins](#creating-plugins)

## List of Plugins

See [awesome remark][awesome] for the most awesome projects in the ecosystem.
More plugins can be found on GitHub tagged with the
[`remark-plugin` topic][topic].

Have a good idea for a new plugin?
See [Creating plugins][create] below.

*   [`remark-abbr`](https://github.com/zestedesavoir/zmarkdown/tree/master/packages/remark-abbr#readme)
    — custom syntax for abbreviations (new node type, rehype compatible)
*   [`remark-align`](https://github.com/zestedesavoir/zmarkdown/tree/master/packages/remark-align#readme)
    — custom syntax to align text or blocks (new node types, rehype compatible)
*   [`remark-attr`](https://github.com/arobase-che/remark-attr)
    — custom syntax to add attributes to markdown
*   [`remark-autolink-headings`](https://github.com/remarkjs/remark-autolink-headings)
    — add GitHub-style links to headings
*   [`remark-behead`](https://github.com/mrzmmr/remark-behead)
    — increase or decrease heading depth
*   [`remark-bookmarks`](https://github.com/remarkjs/remark-bookmarks)
    – automatic link manager
*   [`remark-bracketed-spans`](https://github.com/sethvincent/remark-bracketed-spans)
    – custom syntax for id’s, classes, and data attributes to spans of text
*   [`remark-breaks`](https://github.com/remarkjs/remark-breaks)
    – support hard breaks without needing spaces (like on issues)
*   [`remark-capitalize`](https://github.com/zeit/remark-capitalize)
    – transform all titles with
    [title.sh](https://github.com/zeit/title)
*   [`remark-code-extra`](https://github.com/samlanning/remark-code-extra)
    — Add to or transform the HTML output of code blocks (rehype compatible)
*   [`remark-code-frontmatter`](https://github.com/samlanning/remark-code-frontmatter)
    — Extract frontmatter from markdown code blocks    
*   [`remark-code-screenshot`](https://github.com/Swizec/remark-code-screenshot)
    – turn code blocks into carbon.now.sh screenshots
*   [`remark-collapse`](https://github.com/Rokt33r/remark-collapse)
    — make a section collapsible
*   [`remark-comment-config`](https://github.com/remarkjs/remark-comment-config)
    — configure remark with comments
*   [`remark-comments`](https://github.com/zestedesavoir/zmarkdown/tree/master/packages/remark-comments#readme)
    — custom syntax to ignore things
*   [`remark-containers`](https://github.com/Nevenall/remark-containers)
    — add custom containers
*   [`remark-contributors`](https://github.com/remarkjs/remark-contributors)
    — add a table of contributors
*   [`remark-custom-blocks`](https://github.com/zestedesavoir/zmarkdown/tree/master/packages/remark-custom-blocks#readme)
    — custom syntax for custom blocks (new node types, rehype compatible)
*   [`remark-defsplit`](https://github.com/remarkjs/remark-defsplit)
    — change links and images to references with separate definitions
*   [`remark-disable-tokenizers`](https://github.com/zestedesavoir/zmarkdown/tree/master/packages/remark-disable-tokenizers#readme)
    — turn some or all remark’s tokenizers on or off
*   [`remark-embed-images`](https://github.com/remarkjs/remark-embed-images)
    — embed local images as base64-encoded data URIs
*   [`remark-emoji`](https://github.com/rhysd/remark-emoji)
    — transform Gemoji short-codes to emoji
*   [`remark-emoji-to-gemoji`](https://github.com/jackycute/remark-emoji-to-gemoji)
    — transform emoji to Gemoji short-codes
*   [`remark-external-links`](https://github.com/remarkjs/remark-external-links)
    — add target and rel attributes to external links
*   [`remark-first-heading`](https://github.com/laat/remark-first-heading)
    — replace the first heading in a document
*   [`remark-fix-guillemets`](https://github.com/zestedesavoir/zmarkdown/tree/master/packages/remark-fix-guillemets#readme)
    — support ASCII guillements (`<<`, `>>`) mapping them to HTML
*   [`remark-frontmatter`](https://github.com/remarkjs/remark-frontmatter)
    – support frontmatter (yaml, toml, and more)
*   [`remark-gemoji`](https://github.com/remarkjs/remark-gemoji)
    — better support for Gemoji shortcodes
*   [`remark-gemoji-to-emoji`](https://github.com/jackycute/remark-gemoji-to-emoji)
    — transform Gemoji shortcodes to emoji
*   [`remark-generic-extensions`](https://github.com/medfreeman/remark-generic-extensions)
    — custom syntax for the CommonMark generic directive extension
*   [`remark-git-contributors`](https://github.com/remarkjs/remark-git-contributors)
    — add a table of contributors based on Git history, options, and more
*   [`remark-github`](https://github.com/remarkjs/remark-github)
    — autolink references to commits, issues, pull-requests, and users
*   [`remark-gitlab-artifact`](https://github.com/temando/remark-gitlab-artifact)
    — download artifacts from GitLab projects to live alongside your docs
*   [`remark-grid-tables`](https://github.com/zestedesavoir/zmarkdown/tree/master/packages/remark-grid-tables#readme)
    — custom syntax to describe tables (rehype compatible)
*   [`remark-graphviz`](https://github.com/temando/remark-graphviz)
    — transform [graphviz](https://www.graphviz.org) dot graphs to SVG
*   [`remark-heading-gap`](https://github.com/remarkjs/remark-heading-gap)
    — stringify with more blank lines between headings
*   [`remark-highlight.js`](https://github.com/remarkjs/remark-highlight.js)
    — highlight code blocks with [highlight.js](https://github.com/isagalaev/highlight.js)
    (rehype compatible)
*   [`remark-html`](https://github.com/remarkjs/remark-html)
    — stringify Markdown as HTML
*   [`remark-html-emoji-image`](https://github.com/jackycute/remark-html-emoji-image)
    — transform emoji to images
*   [`remark-html-katex`](https://github.com/Rokt33r/remark-math/tree/master/packages/remark-html-katex#readme)
    — change inline and block math to equations with [KaTeX](https://github.com/Khan/KaTeX)
*   [`remark-iframes`](https://github.com/zestedesavoir/zmarkdown/tree/master/packages/remark-iframes#readme)
    — custom syntax to create iframes (new node type, rehype compatible)
*   [`remark-images`](https://github.com/remarkjs/remark-images)
    — add an improved image syntax
*   [`remark-inline-links`](https://github.com/remarkjs/remark-inline-links)
    — change references and definitions to links and images
*   [`remark-jargon`](https://github.com/freesewing/freesewing/tree/develop/packages/remark-jargon)
    — inserts definitions for jargon terms
*   [`remark-kbd`](https://github.com/zestedesavoir/zmarkdown/tree/master/packages/remark-kbd#readme)
    — custom syntax for keyboard keys (new node type, rehype compatible)
*   [`remark-kbd-plus`](https://github.com/twardoch/remark-kbd-plus)
    — custom syntax for keyboard keys with plusses (new node type, rehype
    compatible)
*   [`remark-license`](https://github.com/remarkjs/remark-license)
    — add a license section
*   [`remark-linkify-regex`](https://gitlab.com/staltz/remark-linkify-regex)
    — change text matching a regex to links
*   [`remark-lint`](https://github.com/remarkjs/remark-lint)
    — check Markdown code style
*   [`remark-macro`](https://github.com/dimerapp/remark-macro)
    — support for block macros (new node types, rehype compatible)
*   [`remark-man`](https://github.com/remarkjs/remark-man)
    — stringify Markdown as man pages (roff)
*   [`remark-math`](https://github.com/Rokt33r/remark-math)
    — custom syntax for math (new node types, rehype compatible)
*   [`remark-mermaid`](https://github.com/temando/remark-mermaid)
    — transform [mermaid](https://mermaidjs.github.io/) graphs to SVG
*   [`remark-message-control`](https://github.com/remarkjs/remark-message-control)
    — turn some or all messages on or off
*   [`remark-metadata`](https://github.com/temando/remark-metadata)
    — add metadata about the processed file as front matter
*   [`remark-midas`](https://github.com/remarkjs/remark-midas)
    — highlight CSS code blocks with [midas](https://github.com/ben-eb/midas)
    (rehype compatible)
*   [`remark-normalize-headings`](https://github.com/remarkjs/remark-normalize-headings)
    — make sure at most one top-level heading exists
*   [`remark-openapi`](https://github.com/temando/remark-openapi)
    — transform links to local or remote OpenAPI definitions to tables
*   [`remark-parse-yaml`](https://github.com/landakram/remark-parse-yaml)
    — parse YAML nodes and expose their value as `parsedValue`
*   [`remark-ping`](https://github.com/zestedesavoir/zmarkdown/tree/master/packages/remark-ping#readme)
    — custom syntax for mentions with configurable existence check (new node
    type, rehype compatible)
*   [`remark-react`](https://github.com/remarkjs/remark-react)
    — “stringify” Markdown as [React](https://github.com/facebook/react)
*   [`remark-react-codemirror`](https://github.com/craftzdog/remark-react-codemirror)
    — highlight code blocks for **remark-react** with [CodeMirror](https://codemirror.net)
*   [`remark-react-lowlight`](https://github.com/inlinestyle/remark-react-lowlight)
    — highlight code blocks for **remark-react** with [lowlight](https://github.com/wooorm/lowlight)
*   [`remark-redact`](https://github.com/seafoam6/remark-redact)
    — conceal text matching a regex
*   [`remark-redactable`](https://github.com/code-dot-org/remark-redactable)
    — write plugins to redact content from a Markdown document,
    then restore it later
*   [`remark-reference-links`](https://github.com/remarkjs/remark-reference-links)
    — transform links and images into references and definitions
*   [`remark-rehype`](https://github.com/remarkjs/remark-rehype)
    — transform to [rehype](https://github.com/rehypejs/rehype)
*   [`remark-relative-links`](https://github.com/zslabs/remark-relative-links)
    — change absolute URLs to relative ones
*   [`remark-retext`](https://github.com/remarkjs/remark-retext)
    — transform to [retext](https://github.com/retextjs/retext)
*   [`remark-ruby`](https://github.com/laysent/remark-ruby)
    — add a custom syntax for ruby (furigana)
*   [`remark-sectionize`](https://github.com/jake-low/remark-sectionize)
    — wrap headings and subsequent content in section tags (new node type,
    rehype compatible)
*   [`remark-shortcodes`](https://github.com/djm/remark-shortcodes)
    — custom syntax Wordpress- and Hugo-like shortcodes (new node type)
*   [`remark-slug`](https://github.com/remarkjs/remark-slug)
    — add anchors to headings using GitHub’s algorithm
*   [`remark-strip-badges`](https://github.com/remarkjs/remark-strip-badges)
    — remove badges (such as `shields.io`)
*   [`remark-strip-html`](https://github.com/craftzdog/remark-strip-html)
    — remove HTML
*   [`remark-squeeze-paragraphs`](https://github.com/remarkjs/remark-squeeze-paragraphs)
    — remove empty paragraphs
*   [`remark-sub-super`](https://github.com/zestedesavoir/zmarkdown/tree/master/packages/remark-sub-super)
    — custom syntax for super- and subscript (new node types, rehype compatible)
*   [`remark-terms`](https://github.com/Nevenall/remark-terms)
    — add customizable syntax for special terms and phrases
*   [`remark-textr`](https://github.com/remarkjs/remark-textr)
    — transform text with [`Textr`](https://github.com/shuvalov-anton/textr)
*   [`remark-title`](https://github.com/RichardLitt/remark-title)
    — check and add the document title
*   [`remark-toc`](https://github.com/remarkjs/remark-toc)
    — add a table of contents
*   [`remark-tree-sitter`](https://github.com/samlanning/remark-tree-sitter)
    — highlight code blocks in Markdown files using
    [Tree-sitter](https://tree-sitter.github.io/tree-sitter/)
    (rehype compatible)
*   [`remark-unlink`](https://github.com/remarkjs/remark-unlink)
    — remove all links, references, and definitions
*   [`remark-unwrap-images`](https://github.com/remarkjs/remark-unwrap-images)
    — remove the wrapping paragraph for images
*   [`remark-usage`](https://github.com/remarkjs/remark-usage)
    — add a usage example
*   [`remark-utf8`](https://github.com/Swizec/remark-utf8)
    — turn bolds, italics, and code into UTF-8 special characters
*   [`remark-validate-links`](https://github.com/remarkjs/remark-validate-links)
    — check links to headings and files
*   [`remark-vdom`](https://github.com/remarkjs/remark-vdom)
    — “stringify” Markdown as [VDOM](https://github.com/Matt-Esch/virtual-dom/)
*   [`remark-wiki-link`](https://github.com/landakram/remark-wiki-link)
    — custom syntax for wiki links (rehype compatible)
*   [`remark-yaml-config`](https://github.com/remarkjs/remark-yaml-config)
    — configure remark with YAML

## List of Presets

See [npm search][npm-preset-search] or [github search][github-preset-search]
for available and often inspirational presets.

## List of Utilities

See [**mdast**][mdast-util] for a list of utilities for working with the syntax
tree.
See [`unist`][unist-util] for other utilities which work with **mdast**
nodes, too.
Finally, see [**vfile**][vfile-util] for a list of utilities working with
virtual files.

## Using plugins

To use a plugin programmatically, invoke the [`use()`][unified-use]
function.

To use plugin with `remark-cli`, pass a [`--use` flag][unified-args-use]
or specify it in a [configuration file][config-file-use].

## Creating plugins

Have an idea for a plugin?
Post it on [spectrum][] or in [ideas][] and make it happen!

To create a plugin, first read up on the [concept of plugins][unified-plugins].
Then, read the [guide on “Creating a plugin with unified”][guide].
Finally, take one of existing plugins, which looks similar to what you’re about
to make, and work from there.
If you get stuck, [spectrum][], [ideas][], and [issues][] are good places to get
help.

You should pick a name prefixed by `'remark-'`, such as `remark-lint`.

**Do not use the `remark-` prefix** if the thing you create doesn’t work with
`remark().use()`: it isn’t a “plugin” and will confuse users.
If it works with mdast, use `'mdast-util-'`, if it works with any unist tree,
use `unist-util-`, and if it works with virtual files, use `vfile-`.

<!--Definitions:-->

[logo]: https://raw.githubusercontent.com/remarkjs/remark/4f6b3d7/logo.svg?sanitize=true

[mdast-util]: https://github.com/syntax-tree/mdast#list-of-utilities

[unist-util]: https://github.com/syntax-tree/unist#unist-utilities

[vfile-util]: https://github.com/vfile/vfile#utilities

[unified-use]: https://github.com/unifiedjs/unified#processoruseplugin-options

[unified-args-use]: https://github.com/unifiedjs/unified-args#--use-plugin

[config-file-use]: https://github.com/unifiedjs/unified-engine/blob/master/doc/configure.md#plugins

[unified-plugins]: https://github.com/unifiedjs/unified#plugin

[issues]: https://github.com/remarkjs/remark/issues

[spectrum]: https://spectrum.chat/unified/remark

[guide]: https://unifiedjs.github.io/create-a-plugin.html

[npm-preset-search]: https://www.npmjs.com/search?q=remark-preset

[github-preset-search]: https://github.com/topics/remark-preset

[awesome]: https://github.com/remarkjs/awesome

[ideas]: https://github.com/remarkjs/ideas

[topic]: https://github.com/topics/remark-plugin

[unified]: https://github.com/unifiedjs/unified

[collective]: https://opencollective.com/unified

[create]: #creating-plugins
