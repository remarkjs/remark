![remark][file-logo]

# Plugins

**remark** is a tool that transforms markdown with plugins.
See [the monorepo readme][github-remark] for info on what the remark ecosystem
is.
This page lists existing plugins.

## Contents

* [List of plugins](#list-of-plugins)
* [List of utilities](#list-of-utilities)
* [Use plugins](#use-plugins)
* [Create plugins](#create-plugins)

## List of plugins

<a id="list-of-presets"></a>

For the most awesome projects in the ecosystem,
see [`remarkjs/awesome-remark`][github-remark-awesome-remark].
More plugins can be found on GitHub tagged with the
[`remark-plugin` topic][github-topic-remark-plugin].

> 👉 **Note**:
> some plugins don’t work with recent versions of remark due to changes in its
> underlying parser (micromark).
> Plugins that are up to date or unaffected are marked with `🟢` while plugins
> that are **currently broken** are marked with `⚠️`.

> 💡 **Tip**:
> remark plugins work with markdown and **rehype** plugins work with HTML.
> See [*§ List of plugins* in `rehypejs/rehype`][github-rehype-plugins] for more
> plugins.

<!--lint disable media-style-->

The list of plugins:

* [`remark-a11y-emoji`](https://github.com/florianeckerstorfer/remark-a11y-emoji)
  — accessible emoji
* ⚠️ [`remark-abbr`](https://github.com/zestedesavoir/zmarkdown/tree/HEAD/packages/remark-abbr#readme)
  — new syntax for abbreviations (new node type, rehype compatible)
* ⚠️ [`remark-admonitions`](https://github.com/elviswolcott/remark-admonitions)
  — new syntax for admonitions
  (👉 **note**: [`remark-directive`][github-remark-directive] is similar and up
  to date)
* ⚠️ [`remark-align`](https://github.com/zestedesavoir/zmarkdown/tree/HEAD/packages/remark-align#readme)
  — new syntax to align text or blocks (new node types, rehype
  compatible)
* 🟢 [`remark-api`](https://github.com/wooorm/remark-api)
  — generate an API section
* ⚠️ [`remark-attr`](https://github.com/arobase-che/remark-attr)
  — new syntax to add attributes to markdown
* 🟢 [`remark-behead`](https://github.com/mrzmmr/remark-behead)
  — increase or decrease heading depth
* 🟢 [`remark-breaks`](https://github.com/remarkjs/remark-breaks)
  – hard breaks w/o needing spaces (like on issues)
* 🟢 [`remark-capitalize`](https://github.com/zeit/remark-capitalize)
  – transform all titles w/ [`title.sh`](https://github.com/zeit/title)
* 🟢 [`remark-capitalize-headings`](https://github.com/Xunnamius/unified-utils/blob/main/packages/remark-capitalize-headings)
  – selectively capitalize headings
  (👉 **note**: alternative to [`remark-capitalize`](https://github.com/zeit/remark-capitalize))
* 🟢 [`remark-cite`](https://github.com/benrbray/remark-cite)
  – new syntax for Pandoc-style citations
* 🟢 [`remark-cjk-friendly`](https://github.com/tats-u/markdown-cjk-friendly/tree/main/packages/remark-cjk-friendly)
  – recognize emphasis in CJK languages ​​more reliably
* 🟢 [`remark-cjk-friendly-gfm-strikethrough`](https://github.com/tats-u/markdown-cjk-friendly/tree/main/packages/remark-cjk-friendly-gfm-strikethrough)
  – recognize GFM strikethrough in CJK languages ​​more reliably
* 🟢 [`remark-cloudinary-docusaurus`](https://github.com/johnnyreilly/remark-cloudinary-docusaurus)
  – allows Docusaurus to use Cloudinary to serve optimised images
* 🟢 [`remark-code-blocks`](https://github.com/mrzmmr/remark-code-blocks)
  — select and store code blocks
* 🟢 [`remark-code-extra`](https://github.com/samlanning/remark-code-extra)
  — add to or transform the HTML output of code blocks (rehype compatible)
* 🟢 [`remark-code-frontmatter`](https://github.com/samlanning/remark-code-frontmatter)
  — extract frontmatter from code blocks
* 🟢 [`remark-code-import`](https://github.com/kevin940726/remark-code-import)
  — populate code blocks from files
* 🟢 [`remark-code-screenshot`](https://github.com/Swizec/remark-code-screenshot)
  – turn code blocks into `carbon.now.sh` screenshots
* 🟢 [`remark-code-title`](https://github.com/kevinzunigacuellar/remark-code-title)
  — add titles to code blocks
* 🟢 [`remark-codesandbox`](https://github.com/kevin940726/remark-codesandbox)
  – create CodeSandbox from code blocks
* 🟢 [`remark-collapse`](https://github.com/Rokt33r/remark-collapse)
  — make a section collapsible
* 🟢 [`remark-comment-config`](https://github.com/remarkjs/remark-comment-config)
  — configure remark w/ comments
* ⚠️ [`remark-comments`](https://github.com/zestedesavoir/zmarkdown/tree/HEAD/packages/remark-comments#readme)
  — new syntax to ignore things
* ⚠️ [`remark-container`](https://github.com/zWingz/remark-container)
  — new syntax for containers
  (👉 **note**: [`remark-directive`][github-remark-directive] is similar and up
  to date)
* ⚠️ [`remark-containers`](https://github.com/Nevenall/remark-containers)
  — new syntax for containers
  (👉 **note**: [`remark-directive`][github-remark-directive] is similar and up
  to date)
* 🟢 [`remark-contributors`](https://github.com/remarkjs/remark-contributors)
  — add a table of contributors
* 🟢 [`remark-copy-linked-files`](https://github.com/sergioramos/remark-copy-linked-files)
  — find and copy files linked files to a destination directory
* 🟢 [`remark-corebc`](https://github.com/bchainhub/remark-corebc)
  — transforms Core Blockchain notations into markdown links
* 🟢 [`remark-corepass`](https://github.com/bchainhub/remark-corepass)
  — transform CorePass notations into markdown links
* ⚠️ [`remark-custom-blocks`](https://github.com/zestedesavoir/zmarkdown/tree/HEAD/packages/remark-custom-blocks#readme)
  — new syntax for custom blocks (new node types, rehype compatible)
  (👉 **note**: [`remark-directive`][github-remark-directive] is similar and up
  to date)
* 🟢 [`remark-custom-header-id`](https://github.com/sindresorhus/remark-custom-header-id)
  — add custom ID attribute to headers (`{#some-id}`)
* 🟢 [`remark-definition-list`](https://github.com/wataru-chocola/remark-definition-list)
  — support definition lists
* 🟢 [`remark-defsplit`](https://github.com/remarkjs/remark-defsplit)
  — change links and images to references w/ separate definitions
* ⚠️ [`remark-disable-tokenizers`](https://github.com/zestedesavoir/zmarkdown/tree/HEAD/packages/remark-disable-tokenizers#readme)
  — turn some or all remark’s tokenizers on or off
* 🟢 [`remark-directive`](https://github.com/remarkjs/remark-directive)
  — new syntax for directives (generic extensions)
* 🟢 [`remark-directive-rehype`](https://github.com/IGassmann/remark-directive-rehype)
  — turn [directives][github-remark-directive] into HTML custom elements
  (rehype compatible)
* 🟢 [`remark-directive-sugar`](https://github.com/lin-stephanie/remark-directive-sugar)
  — predefined directives for customizable badges, links, video embeds, and more
* 🟢 [`remark-docx`](https://github.com/inokawa/remark-docx)
  — compile markdown to docx
* 🟢 [`@m2d/remark-docx`](https://github.com/md2docx/remark-docx)
  — compile markdown to docx with support for GFM, tables, html, and more.
* 🟢 [`remark-dropcap`](https://github.com/brev/remark-dropcap)
  — fancy and accessible drop caps
* 🟢 [`remark-embed-images`](https://github.com/remarkjs/remark-embed-images)
  — embed local images as base64-encoded data URIs
* 🟢 [`remark-emoji`](https://github.com/rhysd/remark-emoji)
  — transform Gemoji short-codes to emoji
* 🟢 [`remark-extended-table`](https://github.com/wataru-chocola/remark-extended-table)
  — extended table syntax allowing colspan / rowspan
* 🟢 [`remark-extract-frontmatter`](https://github.com/mrzmmr/remark-extract-frontmatter)
  — store front matter in vfiles
* 🟢 [`remark-fediverse-user`](https://github.com/bchainhub/remark-fediverse-user)
  — transform Fediverse user notations into markdown links
* 🟢 [`remark-first-heading`](https://github.com/laat/remark-first-heading)
  — change the first heading in a document
* 🟢 [`remark-fix-guillemets`](https://github.com/zestedesavoir/zmarkdown/tree/HEAD/packages/remark-fix-guillemets#readme)
  — support ASCII guillements (`<<`, `>>`) mapping them to HTML
* 🟢 [`remark-flexible-code-titles`](https://github.com/ipikuka/remark-flexible-code-titles)
  — add titles or/and containers for code blocks with customizable attributes
* 🟢 [`remark-flexible-containers`](https://github.com/ipikuka/remark-flexible-containers)
  — add custom/flexible containers with customizable properties
* 🟢 [`remark-flexible-markers`](https://github.com/ipikuka/remark-flexible-markers)
  — add custom/flexible mark element with customizable properties
* 🟢 [`remark-flexible-paragraphs`](https://github.com/ipikuka/remark-flexible-paragraphs)
  — add custom/flexible paragraphs with customizable properties
* 🟢 [`remark-flexible-toc`](https://github.com/ipikuka/remark-flexible-toc)
  — expose the table of contents (toc) via Vfile.data or an option reference
* 🟢 [`remark-footnotes-extra`](https://github.com/miaobuao/remark-footnotes-extra)
  — add footnotes via short syntax
* 🟢 [`remark-frontmatter`](https://github.com/remarkjs/remark-frontmatter)
  – support frontmatter (yaml, toml, and more)
* 🟢 [`remark-gemoji`](https://github.com/remarkjs/remark-gemoji)
  — better support for Gemoji shortcodes
* ⚠️ [`remark-generic-extensions`](https://github.com/medfreeman/remark-generic-extensions)
  — new syntax for the CommonMark generic directive extension
  (👉 **note**: [`remark-directive`][github-remark-directive] is similar and up
  to date)
* 🟢 [`remark-gfm`](https://github.com/remarkjs/remark-gfm)
  — support GFM (autolink literals, footnotes, strikethrough, tables,
  tasklists)
* 🟢 [`remark-git-contributors`](https://github.com/remarkjs/remark-git-contributors)
  — add a table of contributors based on Git history, options, and more
* 🟢 [`remark-github`](https://github.com/remarkjs/remark-github)
  — autolink references to commits, issues, pull-requests, and users
* 🟢 [`remark-github-admonitions-to-directives`](https://github.com/incentro-dc/remark-github-admonitions-to-directives)
  — convert GitHub’s blockquote-based admonitions syntax to directives syntax
* 🟢 [`remark-github-beta-blockquote-admonitions`](https://github.com/myl7/remark-github-beta-blockquote-admonitions)
  — [GitHub beta blockquote-based admonitions](https://github.com/github/feedback/discussions/16925)
* 🟢 [`remark-github-blockquote-alert`](https://github.com/jaywcjlove/remark-github-blockquote-alert)
  — remark plugin to add support for [GitHub Alert](https://docs.github.com/en/get-started/writing-on-github/getting-started-with-writing-and-formatting-on-github/basic-writing-and-formatting-syntax#alerts)
* ⚠️ [`remark-grid-tables`](https://github.com/zestedesavoir/zmarkdown/tree/HEAD/packages/remark-grid-tables#readme)
  — new syntax to describe tables (rehype compatible)
* 🟢 [`@adobe/remark-grid-tables`](https://github.com/adobe/remark-gridtables)
  — pandoc compatible grid-table syntax
* 🟢 [`@it-service-npm/remark-heading-adjustment`](https://github.com/IT-Service-NPM/remark-heading-adjustment)
  — adjusting the depth of headings with `settings.topHeadingDepth` or `processor.data().topHeadingDepth`
* 🟢 [`remark-heading-id`](https://github.com/imcuttle/remark-heading-id)
  — custom heading id support `{#custom-id}`
* 🟢 [`remark-heading-gap`](https://github.com/remarkjs/remark-heading-gap)
  — serialize w/ more blank lines between headings
* 🟢 [`@vcarl/remark-headings`](https://github.com/vcarl/remark-headings)
  — extract a list of headings as data
* 🟢 [`remark-hexo`](https://github.com/bennycode/remark-hexo)
  — renders [Hexo tags](https://hexo.io/docs/tag-plugins)
* 🟢 [`remark-highlight.js`](https://github.com/remarkjs/remark-highlight.js)
  — highlight code blocks w/
  [`highlight.js`](https://github.com/isagalaev/highlight.js)
  (rehype compatible)
* 🟢 [`remark-hint`](https://github.com/sergioramos/remark-hint)
  — add hints/tips/warnings to markdown
* 🟢 [`remark-html`](https://github.com/remarkjs/remark-html)
  — serialize markdown as HTML
* ⚠️ [`remark-iframes`](https://github.com/zestedesavoir/zmarkdown/tree/HEAD/packages/remark-iframes#readme)
  — new syntax to create iframes (new node type, rehype compatible)
* 🟢 [`remark-ignore`](https://github.com/Xunnamius/unified-utils/blob/main/packages/remark-ignore)
  — use comments to exclude nodes from transformation
* 🟢 [`remark-images`](https://github.com/remarkjs/remark-images)
  — add an improved image syntax
* 🟢 [`remark-img-links`](https://github.com/Pondorasti/remark-img-links)
  — prefix relative image paths with an absolute URL
* 🟢 [`@it-service-npm/remark-include`](https://github.com/IT-Service-NPM/remark-include)
  — add `::include{file=path.md}` statements to compose markdown files together
* 🟢 [`remark-inline-links`](https://github.com/remarkjs/remark-inline-links)
  — change references and definitions to links and images
* 🟢 [`remark-ins`](https://github.com/ipikuka/remark-ins)
  — add ins element for inserted texts opposite to deleted texts
* 🟢 [`remark-join-cjk-lines`](https://github.com/purefun/remark-join-cjk-lines)
  — remove extra space between CJK Characters.
* ⚠️ [`remark-kbd`](https://github.com/zestedesavoir/zmarkdown/tree/HEAD/packages/remark-kbd#readme)
  — new syntax for keyboard keys (new node type, rehype compatible)
* ⚠️ [`remark-kbd-plus`](https://github.com/twardoch/remark-kbd-plus)
  — new syntax for keyboard keys w/ plusses (new node type, rehype
  compatible)
* 🟢 [`remark-license`](https://github.com/remarkjs/remark-license)
  — add a license section
* 🟢 [`remark-link-rewrite`](https://github.com/rjanjic/remark-link-rewrite)
  — customize link URLs dynamically
* 🟢 [`remark-linkify-regex`](https://gitlab.com/staltz/remark-linkify-regex)
  — change text matching a regex to links
* 🟢 [`remark-lint`](https://github.com/remarkjs/remark-lint)
  — check markdown code style
* 🟢 [`remark-man`](https://github.com/remarkjs/remark-man)
  — serialize markdown as man pages (roff)
* 🟢 [`remark-math`](https://github.com/remarkjs/remark-math)
  — new syntax for math (new node types, rehype compatible)
* 🟢 [`remark-mdx`](https://github.com/mdx-js/mdx/tree/main/packages/remark-mdx)
  — support MDX (JSX, expressions, ESM)
* 🟢 [`remark-mentions`](https://github.com/FinnRG/remark-mentions)
  — replace @ mentions with links
* 🟢 [`remark-merge-data`](https://github.com/s-h-a-d-o-w/remark-merge-data)
  — merge globally defined data with data declared across code blocks
* 🟢 [`remark-mermaidjs`](https://github.com/remcohaszing/remark-mermaidjs)
  — transform mermaid code blocks into inline SVGs
* 🟢 [`remark-message-control`](https://github.com/remarkjs/remark-message-control)
  — turn some or all messages on or off
* 🟢 [`remark-normalize-headings`](https://github.com/remarkjs/remark-normalize-headings)
  — make sure at most one top-level heading exists
* 🟢 [`remark-numbered-footnote-labels`](https://github.com/jackfletch/remark-numbered-footnote-labels)
  — label footnotes w/ numbers
* 🟢 [`@agentofuser/remark-oembed`](https://github.com/agentofuser/remark-oembed)
  — transform URLs for youtube, twitter, etc. embeds
* 🟢 [`remark-oembed`](https://github.com/sergioramos/remark-oembed)
  — transform URLs surrounded by newlines into *asynchronously* loading
  embeds
* 🟢 [`remark-package-dependencies`](https://github.com/unlight/remark-package-dependencies)
  — inject your dependencies
* ⚠️ [`remark-parse-yaml`](https://github.com/landakram/remark-parse-yaml)
  — parse YAML nodes and expose their value as `parsedValue`
* 🟢 [`remark-pdf`](https://github.com/inokawa/remark-pdf)
  — compile markdown to pdf
* ⚠️ [`remark-ping`](https://github.com/zestedesavoir/zmarkdown/tree/HEAD/packages/remark-ping#readme)
  — new syntax for mentions w/ configurable existence check (new node
  type, rehype compatible)
* 🟢 [`remark-plugin-autonbsp`](https://github.com/denisinvader/remark-plugin-autonbsp)
  —  replace whitespace with non-breaking spaces
  to avoid hanging articles, prepositions and digits
* 🟢 [`remark-prepend-url`](https://github.com/alxjpzmn/remark-prepend-url)
  —  prepend an absolute url to relative links
* 🟢 [`remark-prettier`](https://github.com/remcohaszing/remark-prettier)
  — check and format markdown using Prettier
* 🟢 [`remark-prism`](https://github.com/sergioramos/remark-prism)
  — highlight code blocks w/ [Prism](https://prismjs.com/) (supporting most
  Prism plugins)
* 🟢 [`@handlewithcare/remark-prosemirror`](https://github.com/handlewithcarecollective/remark-prosemirror)
  — compile markdown to [ProseMirror](https://prosemirror.net/) documents
* ⚠️ [`remark-redact`](https://github.com/seafoam6/remark-redact)
  — new syntax to conceal text matching a regex
* 🟢 [`remark-redactable`](https://github.com/code-dot-org/remark-redactable)
  — write plugins to redact content from a markdown document,
  then restore it later
* 🟢 [`remark-refer-plantuml`](https://github.com/PrinOrange/remark-refer-plantuml)
  — automatically transform PlantUML code into referenced embeddable image URLs
* 🟢 [`remark-reference-links`](https://github.com/remarkjs/remark-reference-links)
  — transform links and images into references and definitions
* 🟢 [`remark-rehype`](https://github.com/remarkjs/remark-rehype)
  — transform to [rehype](https://github.com/rehypejs/rehype)
* 🟢 [`remark-relative-links`](https://github.com/zslabs/remark-relative-links)
  — change absolute URLs to relative ones
* 🟢 [`remark-remove-comments`](https://github.com/alvinometric/remark-remove-comments)
  — remove HTML comments from the processed output
* 🟢 [`remark-remove-unused-definitions`](https://github.com/Xunnamius/unified-utils/blob/main/packages/remark-remove-unused-definitions)
  — remove unused reference-style link definitions
* 🟢 [`remark-remove-url-trailing-slash`](https://github.com/Xunnamius/unified-utils/blob/main/packages/remark-remove-url-trailing-slash)
  — remove trailing slashes from the ends of all URL paths
* 🟢 [`remark-renumber-references`](https://github.com/Xunnamius/unified-utils/blob/main/packages/remark-renumber-references)
  — renumber numeric reference-style link ids contiguously starting from 1
* 🟢 [`remark-retext`](https://github.com/remarkjs/remark-retext)
  — transform to [retext](https://github.com/retextjs/retext)
* 🟢 [`remark-ruby`](https://github.com/laysent/remark-ruby)
  — new syntax for ruby (furigana)
* 🟢 [`remark-sectionize`](https://github.com/jake-low/remark-sectionize)
  — wrap headings and subsequent content in section tags (new node type,
  rehype compatible)
* ⚠️ [`remark-shortcodes`](https://github.com/djm/remark-shortcodes)
  — new syntax for Wordpress- and Hugo-like shortcodes (new node type)
  (👉 **note**: [`remark-directive`][github-remark-directive] is similar and up
  to date)
* 🟢 [`remark-simple-plantuml`](https://github.com/akebifiky/remark-simple-plantuml)
  — turn PlantUML code blocks to images
* 🟢 [`remark-slate`](https://github.com/hanford/remark-slate)
  — compile markdown to [Slate nodes](https://docs.slatejs.org/concepts/02-nodes)
* 🟢 [`remark-slate-transformer`](https://github.com/inokawa/remark-slate-transformer)
  — compile markdown to
  [Slate nodes](https://docs.slatejs.org/concepts/02-nodes)
  and Slate nodes to markdown
* 🟢 [`remark-smartypants`](https://github.com/silvenon/remark-smartypants)
  — SmartyPants
* 🟢 [`remark-smcat`](https://github.com/shedali/remark-smcat)
  — state machine cat
* 🟢 [`remark-sort-definitions`](https://github.com/Xunnamius/unified-utils/blob/main/packages/remark-sort-definitions)
  — reorder reference-style link definitions
* 🟢 [`remark-sources`](https://github.com/unlight/remark-sources)
  — insert source code
* 🟢 [`remark-strip-badges`](https://github.com/remarkjs/remark-strip-badges)
  — remove badges (such as `shields.io`)
* 🟢 [`remark-strip-html`](https://github.com/craftzdog/remark-strip-html)
  — remove HTML
* 🟢 [`remark-squeeze-paragraphs`](https://github.com/remarkjs/remark-squeeze-paragraphs)
  — remove empty paragraphs
* ⚠️ [`remark-sub-super`](https://github.com/zestedesavoir/zmarkdown/tree/HEAD/packages/remark-sub-super)
  — new syntax for super- and subscript (new node types, rehype
  compatible)
* ⚠️ [`remark-terms`](https://github.com/Nevenall/remark-terms)
  — new customizable syntax for special terms and phrases
* 🟢 [`remark-textr`](https://github.com/remarkjs/remark-textr)
  — transform text w/ [`Textr`](https://github.com/shuvalov-anton/textr)
* 🟢 [`remark-tight-comments`](https://github.com/Xunnamius/unified-utils/blob/main/packages/remark-tight-comments)
  — selectively remove newlines around comments
* 🟢 [`remark-title`](https://github.com/RichardLitt/remark-title)
  — check and add the document title
* 🟢 [`remark-toc`](https://github.com/remarkjs/remark-toc)
  — add a table of contents
* 🟢 [`remark-torchlight`](https://github.com/torchlight-api/remark-torchlight)
  — syntax highlighting powered by [torchlight.dev](https://torchlight.dev)
* 🟢 [`remark-tree-sitter`](https://github.com/samlanning/remark-tree-sitter)
  — highlight code blocks in markdown files using
  [Tree-sitter](https://tree-sitter.github.io/tree-sitter/)
  (rehype compatible)
* 🟢 [`remark-truncate-links`](https://github.com/GaiAma/Coding4GaiAma/tree/HEAD/packages/remark-truncate-links)
  — truncate/shorten urls not manually named
* 🟢 [`remark-twemoji`](https://github.com/madiodio/remark-twemoji)
  — turn emoji into [Twemoji](https://github.com/twitter/twemoji)
* 🟢 [`remark-typedoc-symbol-links`](https://github.com/kamranayub/remark-typedoc-symbol-links)
  — turn Typedoc symbol link expressions into markdown links
* 🟢 [`remark-typescript`](https://github.com/trevorblades/remark-typescript)
  — turn TypeScript code to JavaScript
* 🟢 [`remark-typograf`](https://github.com/mavrin/remark-typograf)
  — transform text w/ [Typograf](https://github.com/typograf)
* 🟢 [`remark-unlink`](https://github.com/remarkjs/remark-unlink)
  — remove all links, references, and definitions
* 🟢 [`remark-usage`](https://github.com/remarkjs/remark-usage)
  — add a usage example
* 🟢 [`remark-utf8`](https://github.com/Swizec/remark-utf8)
  — turn bolds, italics, and code into UTF 8 special characters
* 🟢 [`remark-validate-links`](https://github.com/remarkjs/remark-validate-links)
  — check links to headings and files
* ⚠️ [`remark-variables`](https://github.com/mrzmmr/remark-variables)
  — new syntax for variables
* 🟢 [`remark-vdom`](https://github.com/remarkjs/remark-vdom)
  — compile markdown to [VDOM](https://github.com/Matt-Esch/virtual-dom/)
* 🟢 [`remark-wiki-link`](https://github.com/landakram/remark-wiki-link)
  — new syntax for wiki links (rehype compatible)
* 🟢 [`remark-yaml-config`](https://github.com/remarkjs/remark-yaml-config)
  — configure remark w/ YAML

<!--lint enable media-style-->

## List of utilities

For things that work with the syntax tree used in remark for markdown,
see [*§ List of utilities* in `syntax-tree/mdast`][github-mdast-utilities].
For tools that work with **mdast** and other syntax trees,
see [*§ List of utilities* in `syntax-tree/unist`][github-unist-utilities].
For tools that work with the virtual file format used in remark,
see [*§ List of utilities* in `vfile/vfile`][github-vfile-utilities].

## Use plugins

To use a plugin programmatically (from JavaScript),
call the [`use()`][github-unified-use] method.
To use plugin with `remark-cli` (from the terminal),
pass a [`--use` flag][github-unified-args-use] or
specify it in a
[configuration file][github-unified-engine-config-files].

## Create plugins

To create a plugin,
first read up on what they are in
[*§ Plugin* in `unifiedjs/unified`][github-unified-plugin].
After that read
[*§ Create a remark plugin* on `unifiedjs.com`][unifiedjs-create-a-plugin]
for a practical introduction.
Finally take one of the existing plugins,
which looks similar to what you’re about to make,
and work from there.
If you get stuck,
[discussions][health-discussions] is a good place to get help.

You should pick a name prefixed by `remark-` (such as `remark-lint`).
**Do not use the `remark-` prefix** if the thing you create doesn’t work with
`remark().use()`:
it isn’t a “plugin” and will confuse users.
If it works with mdast use `mdast-util-`.
If it works with any unist tree use `unist-util-`.
If it works with virtual files use `vfile-`.

Use default exports to expose plugins from your packages.
Add `remark-plugin` keywords in `package.json`.
Add a `remark-plugin` topic to your repo on GitHub.
Create a pull request to add the plugin here on this page!

[file-logo]: https://raw.githubusercontent.com/remarkjs/remark/1f338e72/logo.svg?sanitize=true

[github-mdast-utilities]: https://github.com/syntax-tree/mdast#list-of-utilities

[github-rehype-plugins]: https://github.com/rehypejs/rehype/blob/main/doc/plugins.md#list-of-plugins

[github-remark]: https://github.com/remarkjs/remark

[github-remark-awesome-remark]: https://github.com/remarkjs/awesome-remark

[github-remark-directive]: https://github.com/remarkjs/remark-directive

[github-topic-remark-plugin]: https://github.com/topics/remark-plugin

[github-unified-args-use]: https://github.com/unifiedjs/unified-args#--use-plugin

[github-unified-engine-config-files]: https://github.com/unifiedjs/unified-engine#config-files

[github-unified-plugin]: https://github.com/unifiedjs/unified#plugin

[github-unified-use]: https://github.com/unifiedjs/unified#processoruseplugin-options

[github-unist-utilities]: https://github.com/syntax-tree/unist#unist-utilities

[github-vfile-utilities]: https://github.com/vfile/vfile#list-of-utilities

[health-discussions]: https://github.com/remarkjs/remark/discussions

[unifiedjs-create-a-plugin]: https://unifiedjs.com/learn/guide/create-a-remark-plugin/
