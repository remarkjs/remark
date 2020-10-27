![remark][logo]

# Plugins

**remark** is a Markdown processor powered by plugins part of the [unified][]
[collective][].

## Contents

*   [List of plugins](#list-of-plugins)
*   [List of presets](#list-of-presets)
*   [List of utilities](#list-of-utilities)
*   [Using plugins](#using-plugins)
*   [Creating plugins](#creating-plugins)

## List of plugins

See [awesome remark][awesome] for the most awesome projects in the ecosystem.
More plugins can be found on GitHub tagged with the
[`remark-plugin` topic][topic].

Have a good idea for a new plugin?
See [Creating plugins][create] below.

Some plugins are affected by the recent switch in the underlying parser of
remark.
Their status is encoded below as:

*   🟢 This plugin **was not affected** or **a new version is already released**
*   ⚠️ This plugin is affected: it’s **currently broken** and maintainers
    have been notified

The list of plugins:

*   🟢 [`remark-a11y-emoji`](https://github.com/florianeckerstorfer/remark-a11y-emoji)
    — accessible emoji
*   ⚠️ [`remark-abbr`](https://github.com/zestedesavoir/zmarkdown/tree/HEAD/packages/remark-abbr#readme)
    — new syntax for abbreviations (new node type, rehype compatible)
*   ⚠️ [`remark-admonitions`](https://github.com/elviswolcott/remark-admonitions)
    — new syntax for admonitions
*   ⚠️ [`remark-align`](https://github.com/zestedesavoir/zmarkdown/tree/HEAD/packages/remark-align#readme)
    — new syntax to align text or blocks (new node types, rehype
    compatible)
*   ⚠️ [`remark-attr`](https://github.com/arobase-che/remark-attr)
    — new syntax to add attributes to Markdown
*   🟢 [`remark-autolink-headings`](https://github.com/remarkjs/remark-autolink-headings)
    — add GitHub-style links to headings
*   🟢 [`remark-behead`](https://github.com/mrzmmr/remark-behead)
    — increase or decrease heading depth
*   🟢 [`remark-breaks`](https://github.com/remarkjs/remark-breaks)
    – hard breaks w/o needing spaces (like on issues)
*   🟢 [`remark-capitalize`](https://github.com/zeit/remark-capitalize)
    – transform all titles w/ [`title.sh`](https://github.com/zeit/title)
*   🟢 [`remark-code-blocks`](https://github.com/mrzmmr/remark-code-blocks)
    — select and store code blocks
*   🟢 [`remark-code-extra`](https://github.com/samlanning/remark-code-extra)
    — add to or transform the HTML output of code blocks (rehype compatible)
*   🟢 [`remark-code-frontmatter`](https://github.com/samlanning/remark-code-frontmatter)
    — extract frontmatter from code blocks
*   🟢 [`remark-code-import`](https://github.com/kevin940726/remark-code-import)
    — populate code blocks from files
*   🟢 [`remark-code-screenshot`](https://github.com/Swizec/remark-code-screenshot)
    – turn code blocks into `carbon.now.sh` screenshots
*   🟢 [`remark-codesandbox`](https://github.com/kevin940726/remark-codesandbox)
    – create CodeSandbox from code blocks
*   🟢 [`remark-collapse`](https://github.com/Rokt33r/remark-collapse)
    — make a section collapsible
*   🟢 [`remark-comment-config`](https://github.com/remarkjs/remark-comment-config)
    — configure remark w/ comments
*   ⚠️ [`remark-comments`](https://github.com/zestedesavoir/zmarkdown/tree/HEAD/packages/remark-comments#readme)
    — new syntax to ignore things
*   ⚠️ [`remark-container`](https://github.com/zWingz/remark-container)
    — new syntax for containers
*   ⚠️ [`remark-containers`](https://github.com/Nevenall/remark-containers)
    — new syntax for containers
*   🟢 [`remark-contributors`](https://github.com/remarkjs/remark-contributors)
    — add a table of contributors
*   🟢 [`remark-copy-linked-files`](https://github.com/sergioramos/remark-copy-linked-files)
    — find and copy files linked files to a destination directory
*   ⚠️ [`remark-custom-blocks`](https://github.com/zestedesavoir/zmarkdown/tree/HEAD/packages/remark-custom-blocks#readme)
    — new syntax for custom blocks (new node types, rehype compatible)
*   🟢 [`remark-defsplit`](https://github.com/remarkjs/remark-defsplit)
    — change links and images to references w/ separate definitions
*   ⚠️ [`remark-disable-tokenizers`](https://github.com/zestedesavoir/zmarkdown/tree/HEAD/packages/remark-disable-tokenizers#readme)
    — turn some or all remark’s tokenizers on or off
*   🟢 [`remark-directive`](https://github.com/remarkjs/remark-directive)
    — new syntax for directives (generic extensions)
*   🟢 [`remark-dropcap`](https://github.com/brev/remark-dropcap)
    — fancy and accessible drop caps
*   🟢 [`remark-embed-images`](https://github.com/remarkjs/remark-embed-images)
    — embed local images as base64-encoded data URIs
*   🟢 [`remark-emoji`](https://github.com/rhysd/remark-emoji)
    — transform Gemoji short-codes to emoji
*   🟢 [`remark-external-links`](https://github.com/remarkjs/remark-external-links)
    — add `target` and `rel` attributes to external links
*   🟢 [`remark-extract-frontmatter`](https://github.com/mrzmmr/remark-extract-frontmatter)
    — store front matter in vfiles
*   ⚠️ [`remark-fenced-divs`](https://github.com/benabel/remark-fenced-divs)
    — new syntax for Pandoc’s `fenced_divs` support (new node type, rehype
    compatible)
*   🟢 [`remark-first-heading`](https://github.com/laat/remark-first-heading)
    — change the first heading in a document
*   🟢 [`remark-fix-guillemets`](https://github.com/zestedesavoir/zmarkdown/tree/HEAD/packages/remark-fix-guillemets#readme)
    — support ASCII guillements (`<<`, `>>`) mapping them to HTML
*   🟢 [`remark-footnotes`](https://github.com/remarkjs/remark-footnotes)
    – support pandoc footnotes
*   🟢 [`remark-frontmatter`](https://github.com/remarkjs/remark-frontmatter)
    – support frontmatter (yaml, toml, and more)
*   🟢 [`remark-gemoji`](https://github.com/remarkjs/remark-gemoji)
    — better support for Gemoji shortcodes
*   ⚠️ [`remark-generic-extensions`](https://github.com/medfreeman/remark-generic-extensions)
    — new syntax for the CommonMark generic directive extension
*   🟢 [`remark-gfm`](https://github.com/remarkjs/remark-gfm)
    — support GFM (tables, tasklists, strikethrough, autolink literals)
*   🟢 [`remark-git-contributors`](https://github.com/remarkjs/remark-git-contributors)
    — add a table of contributors based on Git history, options, and more
*   🟢 [`remark-github`](https://github.com/remarkjs/remark-github)
    — autolink references to commits, issues, pull-requests, and users
*   ⚠️ [`remark-grid-tables`](https://github.com/zestedesavoir/zmarkdown/tree/HEAD/packages/remark-grid-tables#readme)
    — new syntax to describe tables (rehype compatible)
*   🟢 [`remark-heading-id`](https://github.com/imcuttle/remark-heading-id)
    — custom heading id support `{#custom-id}`
*   🟢 [`remark-heading-gap`](https://github.com/remarkjs/remark-heading-gap)
    — serialize w/ more blank lines between headings
*   🟢 [`remark-highlight.js`](https://github.com/remarkjs/remark-highlight.js)
    — highlight code blocks w/ [highlight.js](https://github.com/isagalaev/highlight.js)
    (rehype compatible)
*   🟢 [`remark-hint`](https://github.com/sergioramos/remark-hint)
    — add hints/tips/warnings to markdown
*   🟢 [`remark-html`](https://github.com/remarkjs/remark-html)
    — serialize Markdown as HTML
*   🟢 [`remark-html-katex`](https://github.com/remarkjs/remark-math/tree/HEAD/packages/remark-html-katex#readme)
    — change inline and block math to equations w/ [KaTeX](https://github.com/Khan/KaTeX)
*   ⚠️ [`remark-iframes`](https://github.com/zestedesavoir/zmarkdown/tree/HEAD/packages/remark-iframes#readme)
    — new syntax to create iframes (new node type, rehype compatible)
*   🟢 [`remark-images`](https://github.com/remarkjs/remark-images)
    — add an improved image syntax
*   🟢 [`remark-inline-links`](https://github.com/remarkjs/remark-inline-links)
    — change references and definitions to links and images
*   🟢 [`remark-jargon`](https://github.com/freesewing/freesewing/tree/develop/packages/remark-jargon)
    — inserts definitions for jargon terms
*   🟢 [`remark-join-cjk-lines`](https://github.com/purefun/remark-join-cjk-lines)
    — remove extra space between CJK Characters.
*   ⚠️ [`remark-kbd`](https://github.com/zestedesavoir/zmarkdown/tree/HEAD/packages/remark-kbd#readme)
    — new syntax for keyboard keys (new node type, rehype compatible)
*   ⚠️ [`remark-kbd-plus`](https://github.com/twardoch/remark-kbd-plus)
    — new syntax for keyboard keys w/ plusses (new node type, rehype
    compatible)
*   🟢 [`remark-license`](https://github.com/remarkjs/remark-license)
    — add a license section
*   🟢 [`remark-linkify-regex`](https://gitlab.com/staltz/remark-linkify-regex)
    — change text matching a regex to links
*   🟢 [`remark-lint`](https://github.com/remarkjs/remark-lint)
    — check Markdown code style
*   🟢 [`remark-macro`](https://github.com/dimerapp/remark-macro)
    — support for block macros (new node types, rehype compatible)
*   🟢 [`remark-man`](https://github.com/remarkjs/remark-man)
    — serialize Markdown as man pages (roff)
*   🟢 [`remark-math`](https://github.com/remarkjs/remark-math)
    — new syntax for math (new node types, rehype compatible)
*   🟢 [`remark-message-control`](https://github.com/remarkjs/remark-message-control)
    — turn some or all messages on or off
*   🟢 [`remark-midas`](https://github.com/remarkjs/remark-midas)
    — highlight CSS code blocks w/ [midas](https://github.com/ben-eb/midas)
    (rehype compatible)
*   🟢 [`remark-normalize-headings`](https://github.com/remarkjs/remark-normalize-headings)
    — make sure at most one top-level heading exists
*   🟢 [`remark-numbered-footnote-labels`](https://github.com/jackfletch/remark-numbered-footnote-labels)
    — label footnotes w/ numbers
*   🟢 [`@agentofuser/remark-oembed`](https://github.com/agentofuser/remark-oembed)
    — transform URLs for youtube, twitter, etc. embeds
*   🟢 [`remark-oembed`](https://github.com/sergioramos/remark-oembed)
    — transform URLs surrounded by newlines into *asynchronously* loading
    embeds
*   🟢 [`remark-package-dependencies`](https://github.com/unlight/remark-package-dependencies)
    — inject your dependencies
*   ⚠️ [`remark-parse-yaml`](https://github.com/landakram/remark-parse-yaml)
    — parse YAML nodes and expose their value as `parsedValue`
*   ⚠️ [`remark-ping`](https://github.com/zestedesavoir/zmarkdown/tree/HEAD/packages/remark-ping#readme)
    — new syntax for mentions w/ configurable existence check (new node
    type, rehype compatible)
*   🟢 [`remark-prism`](https://github.com/sergioramos/remark-prism)
    — highlight code blocks w/ [Prism](https://prismjs.com/) (supporting most
    Prism plugins)
*   🟢 [`remark-react`](https://github.com/remarkjs/remark-react)
    — compile Markdown to [React](https://github.com/facebook/react)
*   🟢 [`remark-react-codemirror`](https://github.com/craftzdog/remark-react-codemirror)
    — highlight code blocks for `remark-react` w/ [CodeMirror](https://codemirror.net)
*   ⚠️ [`remark-redact`](https://github.com/seafoam6/remark-redact)
    — new syntax to conceal text matching a regex
*   🟢 [`remark-redactable`](https://github.com/code-dot-org/remark-redactable)
    — write plugins to redact content from a Markdown document,
    then restore it later
*   🟢 [`remark-reference-links`](https://github.com/remarkjs/remark-reference-links)
    — transform links and images into references and definitions
*   🟢 [`remark-rehype`](https://github.com/remarkjs/remark-rehype)
    — transform to [rehype](https://github.com/rehypejs/rehype)
*   🟢 [`remark-relative-links`](https://github.com/zslabs/remark-relative-links)
    — change absolute URLs to relative ones
*   🟢 [`remark-retext`](https://github.com/remarkjs/remark-retext)
    — transform to [retext](https://github.com/retextjs/retext)
*   ⚠️ [`remark-ruby`](https://github.com/laysent/remark-ruby)
    — new syntax for ruby (furigana)
*   🟢 [`remark-sectionize`](https://github.com/jake-low/remark-sectionize)
    — wrap headings and subsequent content in section tags (new node type,
    rehype compatible)
*   ⚠️ [`remark-shortcodes`](https://github.com/djm/remark-shortcodes)
    — new syntax for Wordpress- and Hugo-like shortcodes (new node type)
*   🟢 [`remark-simple-plantuml`](https://github.com/akebifiky/remark-simple-plantuml)
    — turn PlantUML code blocks to images
*   🟢 [`remark-slate`](https://github.com/hanford/remark-slate)
    — compile Markdown to [Slate nodes](https://docs.slatejs.org/concepts/02-nodes)
*   🟢 [`remark-slate-transformer`](https://github.com/inokawa/remark-slate-transformer)
    — compile markdown to [Slate nodes](https://docs.slatejs.org/concepts/02-nodes)
    and Slate nodes to markdown
*   🟢 [`remark-slug`](https://github.com/remarkjs/remark-slug)
    — add anchors to headings using GitHub’s algorithm
*   🟢 [`remark-smartypants`](https://github.com/silvenon/remark-smartypants)
    — SmartyPants
*   🟢 [`remark-smcat`](https://github.com/shedali/remark-smcat)
    — state machine cat
*   🟢 [`remark-sources`](https://github.com/unlight/remark-sources)
    — insert source code
*   🟢 [`remark-strip-badges`](https://github.com/remarkjs/remark-strip-badges)
    — remove badges (such as `shields.io`)
*   🟢 [`remark-strip-html`](https://github.com/craftzdog/remark-strip-html)
    — remove HTML
*   🟢 [`remark-squeeze-paragraphs`](https://github.com/remarkjs/remark-squeeze-paragraphs)
    — remove empty paragraphs
*   ⚠️ [`remark-sub-super`](https://github.com/zestedesavoir/zmarkdown/tree/HEAD/packages/remark-sub-super)
    — new syntax for super- and subscript (new node types, rehype
    compatible)
*   ⚠️ [`remark-terms`](https://github.com/Nevenall/remark-terms)
    — new customizable syntax for special terms and phrases
*   🟢 [`remark-textr`](https://github.com/remarkjs/remark-textr)
    — transform text w/ [`Textr`](https://github.com/shuvalov-anton/textr)
*   🟢 [`remark-title`](https://github.com/RichardLitt/remark-title)
    — check and add the document title
*   🟢 [`remark-toc`](https://github.com/remarkjs/remark-toc)
    — add a table of contents
*   🟢 [`remark-tree-sitter`](https://github.com/samlanning/remark-tree-sitter)
    — highlight code blocks in Markdown files using
    [Tree-sitter](https://tree-sitter.github.io/tree-sitter/)
    (rehype compatible)
*   🟢 [`remark-truncate-links`](https://github.com/GaiAma/Coding4GaiAma/tree/HEAD/packages/remark-truncate-links)
    — truncate/shorten urls not manually named
*   🟢 [`remark-twemoji`](https://github.com/madiodio/remark-twemoji)
    — turn emoji into [Twemoji](https://github.com/twitter/twemoji)
*   🟢 [`remark-typescript`](https://github.com/trevorblades/remark-typescript)
    — turn TypeScript code to JavaScript
*   🟢 [`remark-typograf`](https://github.com/mavrin/remark-typograf)
    — transform text w/ [Typograf](https://github.com/typograf)
*   🟢 [`remark-unlink`](https://github.com/remarkjs/remark-unlink)
    — remove all links, references, and definitions
*   🟢 [`remark-unwrap-images`](https://github.com/remarkjs/remark-unwrap-images)
    — remove the wrapping paragraph for images
*   🟢 [`remark-usage`](https://github.com/remarkjs/remark-usage)
    — add a usage example
*   🟢 [`remark-utf8`](https://github.com/Swizec/remark-utf8)
    — turn bolds, italics, and code into UTF 8 special characters
*   🟢 [`remark-validate-links`](https://github.com/remarkjs/remark-validate-links)
    — check links to headings and files
*   ⚠️ [`remark-variables`](https://github.com/mrzmmr/remark-variables)
    — new syntax for variables
*   🟢 [`remark-vdom`](https://github.com/remarkjs/remark-vdom)
    — compile Markdown to [VDOM](https://github.com/Matt-Esch/virtual-dom/)
*   🟢 [`remark-wiki-link`](https://github.com/landakram/remark-wiki-link)
    — new syntax for wiki links (rehype compatible)
*   🟢 [`remark-yaml-config`](https://github.com/remarkjs/remark-yaml-config)
    — configure remark w/ YAML

## List of presets

See [npm search][npm-preset-search] or [github search][github-preset-search]
for available and often inspirational presets.

## List of utilities

See [**mdast**][mdast-util] for a list of utilities for working with the syntax
tree.
See [`unist`][unist-util] for other utilities which work with **mdast**
nodes, too.
Finally, see [**vfile**][vfile-util] for a list of utilities working with
virtual files.

## Using plugins

To use a plugin programmatically, call the [`use()`][unified-use] function.

To use plugin with `remark-cli`, pass a [`--use` flag][unified-args-use] or
specify it in a [configuration file][config-file-use].

## Creating plugins

Have an idea for a plugin?
Post it in [ideas][] and make it happen!

To create a plugin, first read up on the [concept of plugins][unified-plugins].
Then, read the [guide on “Creating a plugin with unified”][guide].
Finally, take one of existing plugins, which looks similar to what you’re about
to make, and work from there.
If you get stuck, [ideas][], [issues][], and [discussions][] are good places to
get help.

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

[config-file-use]: https://github.com/unifiedjs/unified-engine/blob/HEAD/doc/configure.md#plugins

[unified-plugins]: https://github.com/unifiedjs/unified#plugin

[issues]: https://github.com/remarkjs/remark/issues

[discussions]: https://github.com/remarkjs/remark/discussions

[guide]: https://unifiedjs.com/learn/guide/create-a-plugin/

[npm-preset-search]: https://www.npmjs.com/search?q=remark-preset

[github-preset-search]: https://github.com/topics/remark-preset

[awesome]: https://github.com/remarkjs/awesome

[ideas]: https://github.com/remarkjs/ideas

[topic]: https://github.com/topics/remark-plugin

[unified]: https://github.com/unifiedjs/unified

[collective]: https://opencollective.com/unified

[create]: #creating-plugins
