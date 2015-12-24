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

*   [ben-eb/mdast-autolink-headings](https://github.com/ben-eb/mdast-autolink-headings)
    — Automatically add GitHub style links to headings;

*   [wooorm/remark-comment-config](https://github.com/wooorm/remark-comment-config)
    — Set settings with comments during runtime;

*   [hughsk/mdast-contributors](https://github.com/hughsk/mdast-contributors)
    — Inject a given list of contributors into a table in a document;

*   [eush77/mdast-defsplit](https://github.com/eush77/mdast-defsplit)
    — Extract inline link/image destinations as separate definitions;

*   [rsystem-se/mdast-deku](https://github.com/rsystem-se/mdast-deku)
    — Compile Markdown to [Deku](https://github.com/dekujs/deku);

*   [wooorm/remark-github](https://github.com/wooorm/remark-github)
    — Auto-link references like in GitHub issues, PRs, and comments;

*   [ben-eb/mdast-highlight.js](https://github.com/ben-eb/mdast-highlight.js)
    — Highlight code blocks in Markdown files with
    [highlight.js](https://github.com/isagalaev/highlight.js);

*   [wooorm/remark-html](https://github.com/wooorm/remark-html)
    — Compile Markdown to HTML documents;

*   [wooorm/mdast-inline-links](https://github.com/wooorm/mdast-inline-links)
    — Transform references and definitions into normal links and images;

*   [wooorm/remark-lint](https://github.com/wooorm/remark-lint)
    — Markdown code style linter;

*   [wooorm/remark-man](https://github.com/wooorm/remark-man)
    — Compile Markdown to Man pages (roff);

*   [ben-eb/mdast-midas](https://github.com/ben-eb/mdast-midas)
    — Highlight CSS in Markdown files with [midas](https://github.com/ben-eb/midas);

*   [eush77/mdast-normalize-headings](https://github.com/eush77/mdast-normalize-headings)
    — Normalize headings depths, such as multiple top-level headings;

*   [wooorm/mdast-range](https://github.com/wooorm/mdast-range)
    — Add range information;

*   [mapbox/mdast-react](https://github.com/mapbox/mdast-react)
    — Compile Markdown to [React](https://github.com/facebook/react);

*   [wooorm/mdast-reference-links](https://github.com/wooorm/mdast-reference-links)
    — Transform links and images into references and definitions;

*   [wooorm/remark-slug](https://github.com/wooorm/remark-slug)
    — Add slugs to headings;

*   [wooorm/mdast-strip-badges](https://github.com/wooorm/mdast-strip-badges)
    — Remove badges (such as `shields.io`);

*   [eush77/mdast-squeeze-paragraphs](https://github.com/eush77/mdast-squeeze-paragraphs)
    — Remove empty paragraphs;

*   [wooorm/remark-toc](https://github.com/wooorm/remark-toc)
    — Generate a Table of Contents (TOC) for Markdown files;

*   [eush77/mdast-unlink](https://github.com/eush77/mdast-unlink)
    — Remove all links, references and definitions;

*   [wooorm/remark-usage](https://github.com/wooorm/remark-usage)
    — Add a usage example to your readme;

*   [wooorm/remark-validate-links](https://github.com/wooorm/remark-validate-links)
    — Validate links point to existing headings and files;

*   [wooorm/remark-yaml](https://github.com/wooorm/remark-yaml)
    — Parse and stringify YAML code blocks;

*   [wooorm/remark-yaml-config](https://github.com/wooorm/remark-yaml-config)
    — Set settings with YAML during runtime;

## List of Utilities

Although not **remark** plug-ins, the following projects are useful when
working with the AST ([**mdast**](https://github.com/wooorm/mdast)):

*   [wooorm/mdast-util-definitions](https://github.com/wooorm/mdast-util-definitions)
    — Find definition nodes;

*   [wooorm/mdast-util-escape](https://github.com/wooorm/mdast-util-escape)
    — Escape text to be inserted into a node;

*   [wooorm/mdast-util-heading-range](https://github.com/wooorm/mdast-util-heading-range)
    — Markdown heading as ranges;

*   [wooorm/mdast-util-heading-style](https://github.com/wooorm/mdast-util-heading-style)
    — Get the style of a heading (`"atx"`, `"atx-closed"`, or `"setext"`);

*   [anandthakker/mdast-util-inject](https://github.com/anandthakker/mdast-util-inject)
    — Inject one AST into another at a specified heading, keeping heading
    structure intact;

*   [wooorm/mdast-util-position](https://github.com/wooorm/mdast-util-position)
    — Get the position of nodes;

*   [wooorm/mdast-util-to-string](https://github.com/wooorm/mdast-util-to-string)
    — Get the plain text content of a node.

*   [wooorm/mdast-zone](https://github.com/wooorm/mdast-zone)
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
[**remark-toc**](https://www.npmjs.com/package/remark-toc) or
[**remark-yaml-config**](https://www.npmjs.com/package/remark-yaml-config).
The reasoning here is that they can be used on the CLI without this prefix,
but can still be meaningful. For example, `lint` was not available, but instead
of opting for `liiint` or some other weird form, using `remark-lint` ensured a
unique name on package managers, while still being meaningful to users.

Additionally, when the library could be used in the browser, I recommend
publishing at least to [Component](https://github.com/componentjs/guide/blob/master/creating-components/publishing.md).
This will also make a package usable by [Duo](https://github.com/duojs/duo).

When publishing a plugin, you should utilize the package manager’s keywords
functionality and include `"remark"` in the list.
