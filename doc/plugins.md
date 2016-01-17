![remark](https://cdn.rawgit.com/wooorm/remark/master/logo.svg)

# Plugins

**remark** plugins lie at the core of **remark**’s vision. As they operate on
the same syntax tree, there is no start-up time penalty when using more than
one plug-in: something which traditional tools, which need to re-compile
to markdown to connect together need.

See [tools built with remark »](https://github.com/wooorm/remark/blob/master/doc/products.md).

## Table of Contents

*   [List of Plugins](#list-of-plugins)
*   [List of Utilities](#list-of-utilities)
*   [Using plugins](#using-plugins)
*   [Creating plugins](#creating-plugins)
*   [Publishing plugins](#publishing-plugins)

## List of Plugins

*   [`ben-eb/remark-autolink-headings`](https://github.com/ben-eb/remark-autolink-headings)
    — Automatically add GitHub style links to headings;

*   [`ben-eb/remark-comment-blocks`](https://github.com/ben-eb/remark-comment-blocks)
    — Wrap Markdown with a comment block;

*   [`wooorm/remark-comment-config`](https://github.com/wooorm/remark-comment-config)
    — Set settings with comments during runtime;

*   [`hughsk/remark-contributors`](https://github.com/hughsk/remark-contributors)
    — Inject a given list of contributors into a table in a document;

*   [`eush77/remark-defsplit`](https://github.com/eush77/remark-defsplit)
    — Extract inline link and image destinations as separate definitions;

*   [`wooorm/remark-github`](https://github.com/wooorm/remark-github)
    — Auto-link references like in GitHub issues, PRs, and comments;

*   [`ben-eb/remark-heading-gap`](https://github.com/ben-eb/remark-heading-gap)
    — Adjust the gap between headings;

*   [`ben-eb/remark-highlight.js`](https://github.com/ben-eb/remark-highlight.js)
    — Highlight code blocks in Markdown files with
    [highlight.js](https://github.com/isagalaev/highlight.js);

*   [`wooorm/remark-html`](https://github.com/wooorm/remark-html)
    — Compile Markdown to HTML documents;

*   [`wooorm/remark-inline-links`](https://github.com/wooorm/remark-inline-links)
    — Transform references and definitions into normal links and images;

*   [`wooorm/remark-license`](https://github.com/wooorm/remark-license)
    — Add a license section;

*   [`wooorm/remark-lint`](https://github.com/wooorm/remark-lint)
    — Markdown code style linter;

*   [`wooorm/remark-man`](https://github.com/wooorm/remark-man)
    — Compile Markdown to Man pages (roff);

*   [`ben-eb/remark-midas`](https://github.com/ben-eb/remark-midas)
    — Highlight CSS in Markdown files with [midas](https://github.com/ben-eb/midas);

*   [`eush77/remark-normalize-headings`](https://github.com/eush77/remark-normalize-headings)
    — Make sure there is no more than a single top-level heading in the document

*   [`wooorm/remark-range`](https://github.com/wooorm/remark-range)
    — Add range information;

*   [`mapbox/remark-react`](https://github.com/mapbox/remark-react)
    — Compile Markdown to [React](https://github.com/facebook/react);

*   [`wooorm/remark-reference-links`](https://github.com/wooorm/remark-reference-links)
    — Transform links and images into references and definitions;

*   [`wooorm/remark-retext`](https://github.com/wooorm/remark-retext)
    — [retext](https://github.com/wooorm/retext) support;

*   [`wooorm/remark-slug`](https://github.com/wooorm/remark-slug)
    — Add slugs to headings;

*   [`wooorm/remark-strip-badges`](https://github.com/wooorm/remark-strip-badges)
    — Remove badges (such as `shields.io`);

*   [`eush77/remark-squeeze-paragraphs`](https://github.com/eush77/remark-squeeze-paragraphs)
    — Remove empty paragraphs;

*   [`denysdovhan/remark-textr`](https://github.com/denysdovhan/remark-textr)
    — [`Textr`](https://github.com/shuvalov-anton/textr), a modular typographic
    framework;

*   [`wooorm/remark-toc`](https://github.com/wooorm/remark-toc)
    — Generate a Table of Contents (TOC) for Markdown files;

*   [`eush77/remark-unlink`](https://github.com/eush77/remark-unlink)
    — Remove all links, references and definitions;

*   [`wooorm/remark-usage`](https://github.com/wooorm/remark-usage)
    — Add a usage example to your readme;

*   [`wooorm/remark-validate-links`](https://github.com/wooorm/remark-validate-links)
    — Validate links point to existing headings and files;

*   [`wooorm/remark-vdom`](https://github.com/wooorm/remark-vdom)
    — Compile Markdown to [VDOM](https://github.com/Matt-Esch/virtual-dom/);

*   [`wooorm/remark-yaml`](https://github.com/wooorm/remark-yaml)
    — Parse and stringify YAML code blocks;

*   [`wooorm/remark-yaml-config`](https://github.com/wooorm/remark-yaml-config)
    — Set settings with YAML during runtime;

## List of Utilities

Although not **remark** plug-ins, the following projects are useful when
working with the AST ([**mdast**](https://github.com/wooorm/mdast)):

*   [`wooorm/mdast-util-definitions`](https://github.com/wooorm/mdast-util-definitions)
    — Find definition nodes;

*   [`wooorm/mdast-util-heading-range`](https://github.com/wooorm/mdast-util-heading-range)
    — Markdown heading as ranges;

*   [`wooorm/mdast-util-heading-style`](https://github.com/wooorm/mdast-util-heading-style)
    — Get the style of a heading (`"atx"`, `"atx-closed"`, or `"setext"`);

*   [`anandthakker/mdast-util-inject`](https://github.com/anandthakker/mdast-util-inject)
    — Inject one AST into another at a specified heading, keeping heading
    structure intact;

*   [`wooorm/mdast-util-position`](https://github.com/wooorm/mdast-util-position)
    — Get the position of nodes;

*   [`wooorm/mdast-util-to-string`](https://github.com/wooorm/mdast-util-to-string)
    — Get the plain text content of a node.

*   [`eush77/mdast-normalize-headings`](https://github.com/eush77/mdast-normalize-headings)
    — Make sure there is no more than a single top-level heading in the document

*   [`eush77/mdast-squeeze-paragraphs`](https://github.com/eush77/mdast-squeeze-paragraphs)
    — Remove empty paragraphs;

*   [`wooorm/mdast-zone`](https://github.com/wooorm/mdast-zone)
    — HTML comments as ranges or markers.

In addition, see [`unist`](https://github.com/wooorm/unist#unist-node-utilties)
for other utilities which work with **remark** nodes, but also with
[retext](https://github.com/wooorm/retext) nodes.

And finally, see [`wooorm/vfile`](https://github.com/wooorm/vfile#related-tools)
for a list of utilities for working with virtual files and

## Using plugins

See [**remarkplugin**(7)](https://github.com/wooorm/remark/blob/master/doc/remarkplugin.7.md)
for more information on using plugins.

## Creating plugins

See [**remarkplugin**(3)](https://github.com/wooorm/remark/blob/master/doc/remarkplugin.3.md)
for more information on creating plugins.

## Publishing plugins

It is recommended to publish a plugin as an
[npm module](https://docs.npmjs.com/getting-started/publishing-npm-packages).

You should pick a name prefixed by `"remark-"`, valid examples are
[`remark-toc`](https://www.npmjs.com/package/remark-toc) or
[`remark-yaml-config`](https://www.npmjs.com/package/remark-yaml-config).
The reasoning here is that they can be used on the CLI without this prefix,
but can still be meaningful. For example, `lint` was not available, but instead
of opting for `liiint` or some other weird form, using `remark-lint` ensured a
unique name on package managers, while still being meaningful to users.

When publishing a plugin, you should utilize the package manager’s keywords
functionality and include `"remark"` in the list.
