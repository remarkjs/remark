![mdast](https://cdn.rawgit.com/wooorm/mdast/master/logo.svg)

# Getting Started

**mdast** is a markdown processor powered by plugins. The core of **mdast** is
the syntax tree. A syntax tree makes it easy for other programs to read and
write something, in this case markdown.

*   It could be used to read certain information from structured markdown
    documents. For example, an [**awesome** list
    »](https://github.com/sindresorhus/awesome/issues/427#issuecomment-160111301)

*   It could be used to generate markdown from other data. For example,
    [API docs with **documentation**
    »](https://github.com/documentationjs/documentation)

[Read how to install **mdast** »](https://github.com/wooorm/mdast/blob/master/doc/installation.md)

## Application Programming Interface

The core of **mdast**, called **mdast**(3), reads and writes markdown. And,
allows authors to use plug-ins which transform markdown documents.

*   [Read how to install **mdast**(3) »](https://github.com/wooorm/mdast/blob/master/doc/installation.md)
*   [Read more on the API in **mdast**(3) »](https://github.com/wooorm/mdast/blob/master/doc/mdast.3.md)

## Command Line Interface

On top of the core sits an elaborate CLI, called **mdast**(1), which can be
used to validate, prepare, and compile markdown in a build step.

*   [Read how to install **mdast**(1) with npm »](https://github.com/wooorm/mdast/blob/master/doc/installation.md#npm)
*   [Read more on the CLI in **mdast**(1) »](https://github.com/wooorm/mdast/blob/master/doc/mdast.1.md)
*   [Read how to use plug-ins in  **mdastplugin**(7) »](https://github.com/wooorm/mdast/blob/master/doc/mdastplugin.7.md#command-line-usage)
*   [Read how to use settings in **mdastconfig**(7) »](https://github.com/wooorm/mdast/blob/master/doc/mdastconfig.7.md#command-line-settings)
*   [Read how to use configuration files in **mdastrc**(5) »](https://github.com/wooorm/mdast/blob/master/doc/mdastrc.5.md)
*   [Read how to ignore files in **mdastignore**(5) »](https://github.com/wooorm/mdast/blob/master/doc/mdastignore.5.md)

## Configuration

Most customisation is deferred to plug-ins, but the core of **mdast** has
several settings. For example, which flavour of markdown is used, or whether
to use asterisks (`*`) or underscores (`_`) for emphasis.

*   [View available settings in **mdastsetting**(7) »](https://github.com/wooorm/mdast/blob/master/doc/mdastsetting.7.md)
*   [Read how to set settings in **mdastconfig**(7) »](https://github.com/wooorm/mdast/blob/master/doc/mdastconfig.7.md)

## Syntax Tree

**mdast** exposes markdown as an abstract syntax tree.

*   [Read more on the AST in **mdastnode**(7) »](https://github.com/wooorm/mdast/blob/master/doc/mdastnode.7.md)

## Plug-ins

**mdast** gets really cool when you combine it with plugins.

*   [View available plug-ins and utilities »](https://github.com/wooorm/mdast/blob/master/doc/plugins.md)
*   [Read how to use plug-ins in  **mdastplugin**(7) »](https://github.com/wooorm/mdast/blob/master/doc/mdastplugin.7.md)
*   [Read how to create plug-ins in **mdastplugin**(3) »](https://github.com/wooorm/mdast/blob/master/doc/mdastplugin.3.md)
