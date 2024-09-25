![remark][logo]

# Plugins

**remark** is a tool that transforms markdown with plugins.
See [the monorepo readme][remark] for info on what the remark ecosystem is.
This page lists existing plugins.

## Contents

* [List of plugins](#list-of-plugins)
* [List of presets](#list-of-presets)
* [List of utilities](#list-of-utilities)
* [Use plugins](#use-plugins)
* [Create plugins](#create-plugins)

## List of plugins

See [`awesome-remark`][awesome-remark] for the most awesome projects in the
ecosystem.
More plugins can be found on GitHub tagged with the
[`remark-plugin` topic][topic].

> 👉 **Note**: some plugins don’t work with recent versions of remark due to
> changes in its underlying parser (micromark).
> Plugins that are up to date or unaffected are marked with `🟢` while plugins
> that are **currently broken** are marked with `⚠️`.

> 💡 **Tip**: remark plugins work with markdown and **rehype** plugins work with
> HTML.
> See rehype’s [List of plugins][rehype-plugins] for more plugins.

The list of plugins:

* [`remark-a11y-emoji`](https://github.com/florianeckerstorfer/remark-a11y-emoji) ![remark-a11y-emoji stars](https://img.shields.io/github/stars/florianeckerstorfer/remark-a11y-emoji?style=social) — accessible emoji
* ⚠️ [`remark-abbr`](https://github.com/zestedesavoir/zmarkdown/tree/HEAD/packages/remark-abbr#readme) ![remark-abbr stars](https://img.shields.io/github/stars/zestedesavoir/zmarkdown?style=social) — new syntax for abbreviations (new node type, rehype compatible)
* ⚠️ [`remark-admonitions`](https://github.com/elviswolcott/remark-admonitions) ![remark-admonitions stars](https://img.shields.io/github/stars/elviswolcott/remark-admonitions?style=social) — new syntax for admonitions
* ⚠️ [`remark-align`](https://github.com/zestedesavoir/zmarkdown/tree/HEAD/packages/remark-align#readme) ![remark-align stars](https://img.shields.io/github/stars/zestedesavoir/zmarkdown?style=social) — new syntax to align text or blocks (new node types, rehype compatible)
* 🟢 [`remark-api`](https://github.com/wooorm/remark-api) ![remark-api stars](https://img.shields.io/github/stars/wooorm/remark-api?style=social) — generate an API section
* ⚠️ [`remark-attr`](https://github.com/arobase-che/remark-attr) ![remark-attr stars](https://img.shields.io/github/stars/arobase-che/remark-attr?style=social) — new syntax to add attributes to markdown
* 🟢 [`remark-behead`](https://github.com/mrzmmr/remark-behead) ![remark-behead stars](https://img.shields.io/github/stars/mrzmmr/remark-behead?style=social) — increase or decrease heading depth
* 🟢 [`remark-breaks`](https://github.com/remarkjs/remark-breaks) ![remark-breaks stars](https://img.shields.io/github/stars/remarkjs/remark-breaks?style=social) – hard breaks w/o needing spaces (like on issues)
* 🟢 [`remark-capitalize`](https://github.com/zeit/remark-capitalize) ![remark-capitalize stars](https://img.shields.io/github/stars/zeit/remark-capitalize?style=social) – transform all titles w/ [`title.sh`](https://github.com/zeit/title)
* 🟢 [`remark-capitalize-headings`](https://github.com/Xunnamius/unified-utils/blob/main/packages/remark-capitalize-headings) ![remark-capitalize-headings stars](https://img.shields.io/github/stars/Xunnamius/unified-utils?style=social) – selectively capitalize headings
* 🟢 [`remark-cite`](https://github.com/benrbray/remark-cite) ![remark-cite stars](https://img.shields.io/github/stars/benrbray/remark-cite?style=social) – new syntax for Pandoc-style citations
* 🟢 [`remark-cloudinary-docusaurus`](https://github.com/johnnyreilly/remark-cloudinary-docusaurus) ![remark-cloudinary-docusaurus stars](https://img.shields.io/github/stars/johnnyreilly/remark-cloudinary-docusaurus?style=social) – allows Docusaurus to use Cloudinary to serve optimised images
* 🟢 [`remark-code-blocks`](https://github.com/mrzmmr/remark-code-blocks) ![remark-code-blocks stars](https://img.shields.io/github/stars/mrzmmr/remark-code-blocks?style=social) — select and store code blocks
* 🟢 [`remark-code-extra`](https://github.com/samlanning/remark-code-extra) ![remark-code-extra stars](https://img.shields.io/github/stars/samlanning/remark-code-extra?style=social) — add to or transform the HTML output of code blocks (rehype compatible)
* 🟢 [`remark-code-frontmatter`](https://github.com/samlanning/remark-code-frontmatter) ![remark-code-frontmatter stars](https://img.shields.io/github/stars/samlanning/remark-code-frontmatter?style=social) — extract frontmatter from code blocks
* 🟢 [`remark-code-import`](https://github.com/kevin940726/remark-code-import) ![remark-code-import stars](https://img.shields.io/github/stars/kevin940726/remark-code-import?style=social) — populate code blocks from files
* 🟢 [`remark-code-screenshot`](https://github.com/Swizec/remark-code-screenshot) ![remark-code-screenshot stars](https://img.shields.io/github/stars/Swizec/remark-code-screenshot?style=social) – turn code blocks into `carbon.now.sh` screenshots
* 🟢 [`remark-code-title`](https://github.com/kevinzunigacuellar/remark-code-title) ![remark-code-title stars](https://img.shields.io/github/stars/kevinzunigacuellar/remark-code-title?style=social) — add titles to code blocks
* 🟢 [`remark-codesandbox`](https://github.com/kevin940726/remark-codesandbox) ![remark-codesandbox stars](https://img.shields.io/github/stars/kevin940726/remark-codesandbox?style=social) – create CodeSandbox from code blocks
* 🟢 [`remark-collapse`](https://github.com/Rokt33r/remark-collapse) ![remark-collapse stars](https://img.shields.io/github/stars/Rokt33r/remark-collapse?style=social) — make a section collapsible
* 🟢 [`remark-comment-config`](https://github.com/remarkjs/remark-comment-config) ![remark-comment-config stars](https://img.shields.io/github/stars/remarkjs/remark-comment-config?style=social) — configure remark w/ comments
* ⚠️ [`remark-comments`](https://github.com/zestedesavoir/zmarkdown/tree/HEAD/packages/remark-comments#readme) ![remark-comments stars](https://img.shields.io/github/stars/zestedesavoir/zmarkdown?style=social) — new syntax to ignore things
* ⚠️ [`remark-container`](https://github.com/zWingz/remark-container) ![remark-container stars](https://img.shields.io/github/stars/zWingz/remark-container?style=social) — new syntax for containers
* ⚠️ [`remark-containers`](https://github.com/Nevenall/remark-containers) ![remark-containers stars](https://img.shields.io/github/stars/Nevenall/remark-containers?style=social) — new syntax for containers
* 🟢 [`remark-contributors`](https://github.com/remarkjs/remark-contributors) ![remark-contributors stars](https://img.shields.io/github/stars/remarkjs/remark-contributors?style=social) — add a table of contributors
* 🟢 [`remark-copy-linked-files`](https://github.com/sergioramos/remark-copy-linked-files) ![remark-copy-linked-files stars](https://img.shields.io/github/stars/sergioramos/remark-copy-linked-files?style=social) — find and copy files linked files to a destination directory
* 🟢 [`remark-corebc`](https://github.com/bchainhub/remark-corebc) ![remark-corebc stars](https://img.shields.io/github/stars/bchainhub/remark-corebc?style=social) — transforms Core Blockchain notations into markdown links
* 🟢 [`remark-corepass`](https://github.com/bchainhub/remark-corepass) ![remark-corepass stars](https://img.shields.io/github/stars/bchainhub/remark-corepass?style=social) — transform CorePass notations into markdown links
* ⚠️ [`remark-custom-blocks`](https://github.com/zestedesavoir/zmarkdown/tree/HEAD/packages/remark-custom-blocks#readme) ![remark-custom-blocks stars](https://img.shields.io/github/stars/zestedesavoir/zmarkdown?style=social) — new syntax for custom blocks (new node types, rehype compatible)
* 🟢 [`remark-custom-header-id`](https://github.com/sindresorhus/remark-custom-header-id) ![remark-custom-header-id stars](https://img.shields.io/github/stars/sindresorhus/remark-custom-header-id?style=social) — add custom ID attribute to headers (`{#some-id}`)
* 🟢 [`remark-definition-list`](https://github.com/wataru-chocola/remark-definition-list) ![remark-definition-list stars](https://img.shields.io/github/stars/wataru-chocola/remark-definition-list?style=social) — support definition lists
* 🟢 [`remark-defsplit`](https://github.com/remarkjs/remark-defsplit) ![remark-defsplit stars](https://img.shields.io/github/stars/remarkjs/remark-defsplit?style=social) — change links and images to references w/ separate definitions
* ⚠️ [`remark-disable-tokenizers`](https://github.com/zestedesavoir/zmarkdown/tree/HEAD/packages/remark-disable-tokenizers#readme) ![remark-disable-tokenizers stars](https://img.shields.io/github/stars/zestedesavoir/zmarkdown?style=social) — turn some or all remark's tokenizers on or off
* 🟢 [`remark-directive`](https://github.com/remarkjs/remark-directive) ![remark-directive stars](https://img.shields.io/github/stars/remarkjs/remark-directive?style=social) — new syntax for directives (generic extensions)
* 🟢 [`remark-directive-rehype`](https://github.com/IGassmann/remark-directive-rehype) ![remark-directive-rehype stars](https://img.shields.io/github/stars/IGassmann/remark-directive-rehype?style=social) — turn [directives][d] into HTML custom elements (rehype compatible)
* 🟢 [`remark-docx`](https://github.com/inokawa/remark-docx) ![remark-docx stars](https://img.shields.io/github/stars/inokawa/remark-docx?style=social) — compile markdown to docx
* 🟢 [`remark-dropcap`](https://github.com/brev/remark-dropcap) ![remark-dropcap stars](https://img.shields.io/github/stars/brev/remark-dropcap?style=social) — fancy and accessible drop caps
* 🟢 [`remark-embed-images`](https://github.com/remarkjs/remark-embed-images) ![remark-embed-images stars](https://img.shields.io/github/stars/remarkjs/remark-embed-images?style=social) — embed local images as base64-encoded data URIs
* 🟢 [`remark-emoji`](https://github.com/rhysd/remark-emoji) ![remark-emoji stars](https://img.shields.io/github/stars/rhysd/remark-emoji?style=social) — transform Gemoji short-codes to emoji
* 🟢 [`remark-extended-table`](https://github.com/wataru-chocola/remark-extended-table) ![remark-extended-table stars](https://img.shields.io/github/stars/wataru-chocola/remark-extended-table?style=social) — extended table syntax allowing colspan / rowspan
* 🟢 [`remark-extract-frontmatter`](https://github.com/mrzmmr/remark-extract-frontmatter) ![remark-extract-frontmatter stars](https://img.shields.io/github/stars/mrzmmr/remark-extract-frontmatter?style=social) — store front matter in vfiles
* 🟢 [`remark-fediverse-user`](https://github.com/bchainhub/remark-fediverse-user) ![remark-fediverse-user stars](https://img.shields.io/github/stars/bchainhub/remark-fediverse-user?style=social) — transform Fediverse user notations into markdown links
* 🟢 [`remark-first-heading`](https://github.com/laat/remark-first-heading) ![remark-first-heading stars](https://img.shields.io/github/stars/laat/remark-first-heading?style=social) — change the first heading in a document
* 🟢 [`remark-fix-guillemets`](https://github.com/zestedesavoir/zmarkdown/tree/HEAD/packages/remark-fix-guillemets#readme) ![remark-fix-guillemets stars](https://img.shields.io/github/stars/zestedesavoir/zmarkdown?style=social) — support ASCII guillements (`<<`, `>>`) mapping them to HTML
* 🟢 [`remark-flexible-code-titles`](https://github.com/ipikuka/remark-flexible-code-titles) ![remark-flexible-code-titles stars](https://img.shields.io/github/stars/ipikuka/remark-flexible-code-titles?style=social) — add titles or/and containers for code blocks with customizable attributes
* 🟢 [`remark-flexible-containers`](https://github.com/ipikuka/remark-flexible-containers) ![remark-flexible-containers stars](https://img.shields.io/github/stars/ipikuka/remark-flexible-containers?style=social) — add custom/flexible containers with customizable properties
* 🟢 [`remark-flexible-markers`](https://github.com/ipikuka/remark-flexible-markers) ![remark-flexible-markers stars](https://img.shields.io/github/stars/ipikuka/remark-flexible-markers?style=social) — add custom/flexible mark element with customizable properties
* 🟢 [`remark-flexible-paragraphs`](https://github.com/ipikuka/remark-flexible-paragraphs) ![remark-flexible-paragraphs stars](https://img.shields.io/github/stars/ipikuka/remark-flexible-paragraphs?style=social) — add custom/flexible paragraphs with customizable properties
* 🟢 [`remark-flexible-toc`](https://github.com/ipikuka/remark-flexible-toc) ![remark-flexible-toc stars](https://img.shields.io/github/stars/ipikuka/remark-flexible-toc?style=social) — expose the table of contents (toc) via Vfile.data or an option reference
* 🟢 [`remark-frontmatter`](https://github.com/remarkjs/remark-frontmatter) ![remark-frontmatter stars](https://img.shields.io/github/stars/remarkjs/remark-frontmatter?style=social) – support frontmatter (yaml, toml, and more)
* 🟢 [`remark-gemoji`](https://github.com/remarkjs/remark-gemoji) ![remark-gemoji stars](https://img.shields.io/github/stars/remarkjs/remark-gemoji?style=social) — better support for Gemoji shortcodes
* ⚠️ [`remark-generic-extensions`](https://github.com/medfreeman/remark-generic-extensions) ![remark-generic-extensions stars](https://img.shields.io/github/stars/medfreeman/remark-generic-extensions?style=social) — new syntax for the CommonMark generic directive extension
* 🟢 [`remark-gfm`](https://github.com/remarkjs/remark-gfm) ![remark-gfm stars](https://img.shields.io/github/stars/remarkjs/remark-gfm?style=social) — support GFM (autolink literals, footnotes, strikethrough, tables, tasklists)
* 🟢 [`remark-git-contributors`](https://github.com/remarkjs/remark-git-contributors) ![remark-git-contributors stars](https://img.shields.io/github/stars/remarkjs/remark-git-contributors?style=social) — add a table of contributors based on Git history, options, and more
* 🟢 [`remark-github`](https://github.com/remarkjs/remark-github) ![remark-github stars](https://img.shields.io/github/stars/remarkjs/remark-github?style=social) — autolink references to commits, issues, pull-requests, and users
* 🟢 [`remark-github-admonitions-to-directives`](https://github.com/incentro-dc/remark-github-admonitions-to-directives) ![remark-github-admonitions-to-directives stars](https://img.shields.io/github/stars/incentro-dc/remark-github-admonitions-to-directives?style=social) — convert GitHub's blockquote-based admonitions syntax to directives syntax
* 🟢 [`remark-github-beta-blockquote-admonitions`](https://github.com/myl7/remark-github-beta-blockquote-admonitions) ![remark-github-beta-blockquote-admonitions stars](https://img.shields.io/github/stars/myl7/remark-github-beta-blockquote-admonitions?style=social) — [GitHub beta blockquote-based admonitions](https://github.com/github/feedback/discussions/16925)
* 🟢 [`remark-github-blockquote-alert`](https://github.com/jaywcjlove/remark-github-blockquote-alert) ![remark-github-blockquote-alert stars](https://img.shields.io/github/stars/jaywcjlove/remark-github-blockquote-alert?style=social) — remark plugin to add support for [GitHub Alert](https://docs.github.com/en/get-started/writing-on-github/getting-started-with-writing-and-formatting-on-github/basic-writing-and-formatting-syntax#alerts)
* ⚠️ [`remark-grid-tables`](https://github.com/zestedesavoir/zmarkdown/tree/HEAD/packages/remark-grid-tables#readme) ![remark-grid-tables stars](https://img.shields.io/github/stars/zestedesavoir/zmarkdown?style=social) — new syntax to describe tables (rehype compatible)
* 🟢 [`remark-heading-id`](https://github.com/imcuttle/remark-heading-id) ![remark-heading-id stars](https://img.shields.io/github/stars/imcuttle/remark-heading-id?style=social) — custom heading id support `{#custom-id}`
* 🟢 [`remark-heading-gap`](https://github.com/remarkjs/remark-heading-gap) ![remark-heading-gap stars](https://img.shields.io/github/stars/remarkjs/remark-heading-gap?style=social) — serialize w/ more blank lines between headings
* 🟢 [`@vcarl/remark-headings`](https://github.com/vcarl/remark-headings) ![remark-headings stars](https://img.shields.io/github/stars/vcarl/remark-headings?style=social) — extract a list of headings as data
* 🟢 [`remark-hexo`](https://github.com/bennycode/remark-hexo) ![remark-hexo stars](https://img.shields.io/github/stars/bennycode/remark-hexo?style=social) — renders [Hexo tags](https://hexo.io/docs/tag-plugins)
* 🟢 [`remark-highlight.js`](https://github.com/remarkjs/remark-highlight.js) ![remark-highlight.js stars](https://img.shields.io/github/stars/remarkjs/remark-highlight.js?style=social) — highlight code blocks w/ [`highlight.js`](https://github.com/isagalaev/highlight.js) (rehype compatible)
* 🟢 [`remark-hint`](https://github.com/sergioramos/remark-hint) ![remark-hint stars](https://img.shields.io/github/stars/sergioramos/remark-hint?style=social) — add hints/tips/warnings to markdown
* 🟢 [`remark-html`](https://github.com/remarkjs/remark-html) ![remark-html stars](https://img.shields.io/github/stars/remarkjs/remark-html?style=social) — serialize markdown as HTML
* ⚠️ [`remark-iframes`](https://github.com/zestedesavoir/zmarkdown/tree/HEAD/packages/remark-iframes#readme) ![remark-iframes stars](https://img.shields.io/github/stars/zestedesavoir/zmarkdown?style=social) — new syntax to create iframes (new node type, rehype compatible)
* 🟢 [`remark-ignore`](https://github.com/Xunnamius/unified-utils/blob/main/packages/remark-ignore) ![remark-ignore stars](https://img.shields.io/github/stars/Xunnamius/unified-utils?style=social) — use comments to exclude nodes from transformation
* 🟢 [`remark-images`](https://github.com/remarkjs/remark-images) ![remark-images stars](https://img.shields.io/github/stars/remarkjs/remark-images?style=social) — add an improved image syntax
* 🟢 [`remark-img-links`](https://github.com/Pondorasti/remark-img-links) ![remark-img-links stars](https://img.shields.io/github/stars/Pondorasti/remark-img-links?style=social) — prefix relative image paths with an absolute URL
* 🟢 [`remark-inline-links`](https://github.com/remarkjs/remark-inline-links) ![remark-inline-links stars](https://img.shields.io/github/stars/remarkjs/remark-inline-links?style=social) — change references and definitions to links and images
* 🟢 [`remark-ins`](https://github.com/ipikuka/remark-ins) ![remark-ins stars](https://img.shields.io/github/stars/ipikuka/remark-ins?style=social) — add ins element for inserted texts opposite to deleted texts
* 🟢 [`remark-join-cjk-lines`](https://github.com/purefun/remark-join-cjk-lines) ![remark-join-cjk-lines stars](https://img.shields.io/github/stars/purefun/remark-join-cjk-lines?style=social) — remove extra space between CJK Characters.
* ⚠️ [`remark-kbd`](https://github.com/zestedesavoir/zmarkdown/tree/HEAD/packages/remark-kbd#readme) ![remark-kbd stars](https://img.shields.io/github/stars/zestedesavoir/zmarkdown?style=social) — new syntax for keyboard keys (new node type, rehype compatible)
* ⚠️ [`remark-kbd-plus`](https://github.com/twardoch/remark-kbd-plus) ![remark-kbd-plus stars](https://img.shields.io/github/stars/twardoch/remark-kbd-plus?style=social) — new syntax for keyboard keys w/ plusses (new node type, rehype compatible)
* 🟢 [`remark-license`](https://github.com/remarkjs/remark-license) ![remark-license stars](https://img.shields.io/github/stars/remarkjs/remark-license?style=social) — add a license section
* 🟢 [`remark-link-rewrite`](https://github.com/rjanjic/remark-link-rewrite) ![remark-link-rewrite stars](https://img.shields.io/github/stars/rjanjic/remark-link-rewrite?style=social) — customize link URLs dynamically
* 🟢 [`remark-linkify-regex`](https://gitlab.com/staltz/remark-linkify-regex) ![remark-linkify-regex stars](https://img.shields.io/github/stars/staltz/remark-linkify-regex?style=social) — change text matching a regex to links
* 🟢 [`remark-lint`](https://github.com/remarkjs/remark-lint) ![remark-lint stars](https://img.shields.io/github/stars/remarkjs/remark-lint?style=social) — check markdown code style
* 🟢 [`remark-macro`](https://github.com/dimerapp/remark-macro) ![remark-macro stars](https://img.shields.io/github/stars/dimerapp/remark-macro?style=social) — support for block macros (new node types, rehype compatible)
* 🟢 [`remark-man`](https://github.com/remarkjs/remark-man) ![remark-man stars](https://img.shields.io/github/stars/remarkjs/remark-man?style=social) — serialize markdown as man pages (roff)
* 🟢 [`remark-math`](https://github.com/remarkjs/remark-math) ![remark-math stars](https://img.shields.io/github/stars/remarkjs/remark-math?style=social) — new syntax for math (new node types, rehype compatible)
* 🟢 [`remark-mdx`](https://github.com/mdx-js/mdx/tree/main/packages/remark-mdx) ![remark-mdx stars](https://img.shields.io/github/stars/mdx-js/mdx?style=social) — support MDX (JSX, expressions, ESM)
* 🟢 [`remark-mentions`](https://github.com/FinnRG/remark-mentions) ![remark-mentions stars](https://img.shields.io/github/stars/FinnRG/remark-mentions?style=social) — replace @ mentions with links
* 🟢 [`remark-mermaidjs`](https://github.com/remcohaszing/remark-mermaidjs) ![remark-mermaidjs stars](https://img.shields.io/github/stars/remcohaszing/remark-mermaidjs?style=social) — transform mermaid code blocks into inline SVGs
* 🟢 [`remark-message-control`](https://github.com/remarkjs/remark-message-control) ![remark-message-control stars](https://img.shields.io/github/stars/remarkjs/remark-message-control?style=social) — turn some or all messages on or off
* 🟢 [`remark-normalize-headings`](https://github.com/remarkjs/remark-normalize-headings) ![remark-normalize-headings stars](https://img.shields.io/github/stars/remarkjs/remark-normalize-headings?style=social) — make sure at most one top-level heading exists
* 🟢 [`remark-numbered-footnote-labels`](https://github.com/jackfletch/remark-numbered-footnote-labels) ![remark-numbered-footnote-labels stars](https://img.shields.io/github/stars/jackfletch/remark-numbered-footnote-labels?style=social) — label footnotes w/ numbers
* 🟢 [`@agentofuser/remark-oembed`](https://github.com/agentofuser/remark-oembed) ![remark-oembed stars](https://img.shields.io/github/stars/agentofuser/remark-oembed?style=social) — transform URLs for youtube, twitter, etc. embeds
* 🟢 [`remark-oembed`](https://github.com/sergioramos/remark-oembed) ![remark-oembed stars](https://img.shields.io/github/stars/sergioramos/remark-oembed?style=social) — transform URLs surrounded by newlines into *asynchronously* loading embeds
* 🟢 [`remark-package-dependencies`](https://github.com/unlight/remark-package-dependencies) ![remark-package-dependencies stars](https://img.shields.io/github/stars/unlight/remark-package-dependencies?style=social) — inject your dependencies
* ⚠️ [`remark-parse-yaml`](https://github.com/landakram/remark-parse-yaml) ![remark-parse-yaml stars](https://img.shields.io/github/stars/landakram/remark-parse-yaml?style=social) — parse YAML nodes and expose their value as `parsedValue`
* 🟢 [`remark-pdf`](https://github.com/inokawa/remark-pdf) ![remark-pdf stars](https://img.shields.io/github/stars/inokawa/remark-pdf?style=social) — compile markdown to pdf
* ⚠️ [`remark-ping`](https://github.com/zestedesavoir/zmarkdown/tree/HEAD/packages/remark-ping#readme) ![remark-ping stars](https://img.shields.io/github/stars/zestedesavoir/zmarkdown?style=social) — new syntax for mentions w/ configurable existence check (new node type, rehype compatible)
* 🟢 [`remark-prettier`](https://github.com/remcohaszing/remark-prettier) ![remark-prettier stars](https://img.shields.io/github/stars/remcohaszing/remark-prettier?style=social) — check and format markdown using Prettier
* 🟢 [`remark-prism`](https://github.com/sergioramos/remark-prism) ![remark-prism stars](https://img.shields.io/github/stars/sergioramos/remark-prism?style=social) — highlight code blocks w/ [Prism](https://prismjs.com/) (supporting most Prism plugins)
* ⚠️ [`remark-redact`](https://github.com/seafoam6/remark-redact) ![remark-redact stars](https://img.shields.io/github/stars/seafoam6/remark-redact?style=social) — new syntax to conceal text matching a regex
* 🟢 [`remark-redactable`](https://github.com/code-dot-org/remark-redactable) ![remark-redactable stars](https://img.shields.io/github/stars/code-dot-org/remark-redactable?style=social) — write plugins to redact content from a markdown document, then restore it later
* 🟢 [`remark-reference-links`](https://github.com/remarkjs/remark-reference-links) ![remark-reference-links stars](https://img.shields.io/github/stars/remarkjs/remark-reference-links?style=social) — transform links and images into references and definitions
* 🟢 [`remark-rehype`](https://github.com/remarkjs/remark-rehype) ![remark-rehype stars](https://img.shields.io/github/stars/remarkjs/remark-rehype?style=social) — transform to [rehype](https://github.com/rehypejs/rehype)
* 🟢 [`remark-relative-links`](https://github.com/zslabs/remark-relative-links) ![remark-relative-links stars](https://img.shields.io/github/stars/zslabs/remark-relative-links?style=social) — change absolute URLs to relative ones
* 🟢 [`remark-remove-comments`](https://github.com/alvinometric/remark-remove-comments) ![remark-remove-comments stars](https://img.shields.io/github/stars/alvinometric/remark-remove-comments?style=social) — remove HTML comments from the processed output
* 🟢 [`remark-remove-unused-definitions`](https://github.com/Xunnamius/unified-utils/blob/main/packages/remark-remove-unused-definitions) ![remark-remove-unused-definitions stars](https://img.shields.io/github/stars/Xunnamius/unified-utils?style=social) — remove unused reference-style link definitions
* 🟢 [`remark-remove-url-trailing-slash`](https://github.com/Xunnamius/unified-utils/blob/main/packages/remark-remove-url-trailing-slash) ![remark-remove-url-trailing-slash stars](https://img.shields.io/github/stars/Xunnamius/unified-utils?style=social) — remove trailing slashes from the ends of all URL paths
* 🟢 [`remark-renumber-references`](https://github.com/Xunnamius/unified-utils/blob/main/packages/remark-renumber-references) ![remark-renumber-references stars](https://img.shields.io/github/stars/Xunnamius/unified-utils?style=social) — renumber numeric reference-style link ids contiguously starting from 1
* 🟢 [`remark-retext`](https://github.com/remarkjs/remark-retext) ![remark-retext stars](https://img.shields.io/github/stars/remarkjs/remark-retext?style=social) — transform to [retext](https://github.com/retextjs/retext)
* 🟢 [`remark-ruby`](https://github.com/laysent/remark-ruby) ![remark-ruby stars](https://img.shields.io/github/stars/laysent/remark-ruby?style=social) — new syntax for ruby (furigana)
* 🟢 [`remark-sectionize`](https://github.com/jake-low/remark-sectionize) ![remark-sectionize stars](https://img.shields.io/github/stars/jake-low/remark-sectionize?style=social) — wrap headings and subsequent content in section tags (new node type, rehype compatible)
* ⚠️ [`remark-shortcodes`](https://github.com/djm/remark-shortcodes) ![remark-shortcodes stars](https://img.shields.io/github/stars/djm/remark-shortcodes?style=social) — new syntax for Wordpress- and Hugo-like shortcodes (new node type) (👉 **note**: [`remark-directive`][d] is similar and up to date)
* 🟢 [`remark-simple-plantuml`](https://github.com/akebifiky/remark-simple-plantuml) ![remark-simple-plantuml stars](https://img.shields.io/github/stars/akebifiky/remark-simple-plantuml?style=social) — turn PlantUML code blocks to images
* 🟢 [`remark-slate`](https://github.com/hanford/remark-slate) ![remark-slate stars](https://img.shields.io/github/stars/hanford/remark-slate?style=social) — compile markdown to [Slate nodes](https://docs.slatejs.org/concepts/02-nodes)
* 🟢 [`remark-slate-transformer`](https://github.com/inokawa/remark-slate-transformer) ![remark-slate-transformer stars](https://img.shields.io/github/stars/inokawa/remark-slate-transformer?style=social) — compile markdown to [Slate nodes](https://docs.slatejs.org/concepts/02-nodes) and Slate nodes to markdown
* 🟢 [`remark-smartypants`](https://github.com/silvenon/remark-smartypants) ![remark-smartypants stars](https://img.shields.io/github/stars/silvenon/remark-smartypants?style=social) — SmartyPants
* 🟢 [`remark-smcat`](https://github.com/shedali/remark-smcat) ![remark-smcat stars](https://img.shields.io/github/stars/shedali/remark-smcat?style=social) — state machine cat
* 🟢 [`remark-sort-definitions`](https://github.com/Xunnamius/unified-utils/blob/main/packages/remark-sort-definitions) ![remark-sort-definitions stars](https://img.shields.io/github/stars/Xunnamius/unified-utils?style=social) — reorder reference-style link definitions
* 🟢 [`remark-sources`](https://github.com/unlight/remark-sources) ![remark-sources stars](https://img.shields.io/github/stars/unlight/remark-sources?style=social) — insert source code
* 🟢 [`remark-strip-badges`](https://github.com/remarkjs/remark-strip-badges) ![remark-strip-badges stars](https://img.shields.io/github/stars/remarkjs/remark-strip-badges?style=social) — remove badges (such as `shields.io`)
* 🟢 [`remark-strip-html`](https://github.com/craftzdog/remark-strip-html) ![remark-strip-html stars](https://img.shields.io/github/stars/craftzdog/remark-strip-html?style=social) — remove HTML
* 🟢 [`remark-squeeze-paragraphs`](https://github.com/remarkjs/remark-squeeze-paragraphs) ![remark-squeeze-paragraphs stars](https://img.shields.io/github/stars/remarkjs/remark-squeeze-paragraphs?style=social) — remove empty paragraphs
* ⚠️ [`remark-sub-super`](https://github.com/zestedesavoir/zmarkdown/tree/HEAD/packages/remark-sub-super) ![remark-sub-super stars](https://img.shields.io/github/stars/zestedesavoir/zmarkdown?style=social) — new syntax for super- and subscript (new node types, rehype compatible)
* ⚠️ [`remark-terms`](https://github.com/Nevenall/remark-terms) ![remark-terms stars](https://img.shields.io/github/stars/Nevenall/remark-terms?style=social) — new customizable syntax for special terms and phrases
* 🟢 [`remark-textr`](https://github.com/remarkjs/remark-textr) ![remark-textr stars](https://img.shields.io/github/stars/remarkjs/remark-textr?style=social) — transform text w/ [`Textr`](https://github.com/shuvalov-anton/textr)
* 🟢 [`remark-tight-comments`](https://github.com/Xunnamius/unified-utils/blob/main/packages/remark-tight-comments) ![remark-tight-comments stars](https://img.shields.io/github/stars/Xunnamius/unified-utils?style=social) — selectively remove newlines around comments
* 🟢 [`remark-title`](https://github.com/RichardLitt/remark-title) ![remark-title stars](https://img.shields.io/github/stars/RichardLitt/remark-title?style=social) — check and add the document title
* 🟢 [`remark-toc`](https://github.com/remarkjs/remark-toc) ![remark-toc stars](https://img.shields.io/github/stars/remarkjs/remark-toc?style=social) — add a table of contents
* 🟢 [`remark-torchlight`](https://github.com/torchlight-api/remark-torchlight) ![remark-torchlight stars](https://img.shields.io/github/stars/torchlight-api/remark-torchlight?style=social) — syntax
* 🟢 [`remark-tree-sitter`](https://github.com/samlanning/remark-tree-sitter) ![remark-tree-sitter stars](https://img.shields.io/github/stars/samlanning/remark-tree-sitter?style=social) — highlight code blocks in markdown files using [Tree-sitter](https://tree-sitter.github.io/tree-sitter/) (rehype compatible)
* 🟢 [`remark-truncate-links`](https://github.com/GaiAma/Coding4GaiAma/tree/HEAD/packages/remark-truncate-links) ![remark-truncate-links stars](https://img.shields.io/github/stars/GaiAma/Coding4GaiAma?style=social) — truncate/shorten URLs not manually named
* 🟢 [`remark-twemoji`](https://github.com/madiodio/remark-twemoji) ![remark-twemoji stars](https://img.shields.io/github/stars/madiodio/remark-twemoji?style=social) — turn emoji into [Twemoji](https://github.com/twitter/twemoji)
* 🟢 [`remark-typedoc-symbol-links`](https://github.com/kamranayub/remark-typedoc-symbol-links) ![remark-typedoc-symbol-links stars](https://img.shields.io/github/stars/kamranayub/remark-typedoc-symbol-links?style=social) — turn Typedoc symbol link expressions into markdown links
* 🟢 [`remark-typescript`](https://github.com/trevorblades/remark-typescript) ![remark-typescript stars](https://img.shields.io/github/stars/trevorblades/remark-typescript?style=social) — turn TypeScript code to JavaScript
* 🟢 [`remark-typograf`](https://github.com/mavrin/remark-typograf) ![remark-typograf stars](https://img.shields.io/github/stars/mavrin/remark-typograf?style=social) — transform text w/ [Typograf](https://github.com/typograf)
* 🟢 [`remark-unlink`](https://github.com/remarkjs/remark-unlink) ![remark-unlink stars](https://img.shields.io/github/stars/remarkjs/remark-unlink?style=social) — remove all links, references, and definitions
* 🟢 [`remark-unwrap-images`](https://github.com/remarkjs/remark-unwrap-images) ![remark-unwrap-images stars](https://img.shields.io/github/stars/remarkjs/remark-unwrap-images?style=social) — remove the wrapping paragraph for images
* 🟢 [`remark-usage`](https://github.com/remarkjs/remark-usage) ![remark-usage stars](https://img.shields.io/github/stars/remarkjs/remark-usage?style=social) — add a usage example
* 🟢 [`remark-utf8`](https://github.com/Swizec/remark-utf8) ![remark-utf8 stars](https://img.shields.io/github/stars/Swizec/remark-utf8?style=social) — turn bolds, italics, and code into UTF-8 special characters
* 🟢 [`remark-validate-links`](https://github.com/remarkjs/remark-validate-links) ![remark-validate-links stars](https://img.shields.io/github/stars/remarkjs/remark-validate-links?style=social) — check links to headings and files
* ⚠️ [`remark-variables`](https://github.com/mrzmmr/remark-variables) ![remark-variables stars](https://img.shields.io/github/stars/mrzmmr/remark-variables?style=social) — new syntax for variables
* 🟢 [`remark-vdom`](https://github.com/remarkjs/remark-vdom) ![remark-vdom stars](https://img.shields.io/github/stars/remarkjs/remark-vdom?style=social) — compile markdown to [VDOM](https://github.com/Matt-Esch/virtual-dom/)
* 🟢 [`remark-wiki-link`](https://github.com/landakram/remark-wiki-link) ![remark-wiki-link stars](https://img.shields.io/github/stars/landakram/remark-wiki-link?style=social) — new syntax for wiki links (rehype compatible)
* 🟢 [`remark-yaml-config`](https://github.com/remarkjs/remark-yaml-config) ![remark-yaml-config stars](https://img.shields.io/github/stars/remarkjs/remark-yaml-config?style=social) — configure remark w/ YAML

## List of presets

Use [GitHub search][github-preset-search] to find available and often
inspirational presets.

## List of utilities

See [mdast][mdast-util] for a list of utilities that work with the syntax
tree.
See [unist][unist-util] for other utilities which work with **mdast** and other
syntax trees too.
Finally, see [vfile][vfile-util] for a list of utilities working with virtual
files.

## Use plugins

To use a plugin programmatically, call the [`use()`][unified-use] function.
To use plugin with `remark-cli`, pass a [`--use` flag][unified-args-use] or
specify it in a [configuration file][config-file-use].

## Create plugins

To create a plugin, first read up on the [concept of plugins][unified-plugins].
Then, read the [guide on “Creating a plugin with unified”][guide].
Finally, take one of existing plugins, which looks similar to what you’re about
to make, and work from there.
If you get stuck, [discussions][] is a good place to get help.

You should pick a name prefixed by `'remark-'` (such as `remark-lint`).
**Do not use the `remark-` prefix** if the thing you create doesn’t work with
`remark().use()`: it isn’t a “plugin” and will confuse users.
If it works with mdast, use `'mdast-util-'`, if it works with any unist tree,
use `unist-util-`, and if it works with virtual files, use `vfile-`.

Use default exports to expose plugins from your packages, add `remark-plugin`
keywords in `package.json`, add a `remark-plugin` topic to your repo on GitHub,
and create a pull request to add the plugin here on this page!

<!--Definitions:-->

[logo]: https://raw.githubusercontent.com/remarkjs/remark/1f338e72/logo.svg?sanitize=true

[d]: https://github.com/remarkjs/remark-directive

[remark]: https://github.com/remarkjs/remark

[awesome-remark]: https://github.com/remarkjs/awesome-remark

[topic]: https://github.com/topics/remark-plugin

[github-preset-search]: https://github.com/topics/remark-preset

[mdast-util]: https://github.com/syntax-tree/mdast#list-of-utilities

[unist-util]: https://github.com/syntax-tree/unist#unist-utilities

[vfile-util]: https://github.com/vfile/vfile#utilities

[unified-use]: https://github.com/unifiedjs/unified#processoruseplugin-options

[unified-args-use]: https://github.com/unifiedjs/unified-args#--use-plugin

[config-file-use]: https://github.com/unifiedjs/unified-engine/blob/HEAD/doc/configure.md#plugins

[unified-plugins]: https://github.com/unifiedjs/unified#plugin

[guide]: https://unifiedjs.com/learn/guide/create-a-plugin/

[discussions]: https://github.com/remarkjs/remark/discussions

[rehype-plugins]: https://github.com/rehypejs/rehype/blob/main/doc/plugins.md#list-of-plugins
