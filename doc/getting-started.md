![remark](https://cdn.rawgit.com/wooorm/remark/master/logo.svg)

# Getting Started

**remark** is a markdown processor powered by plugins. The core of **remark**
is the syntax tree ([**mdast**](https://github.com/wooorm/mdast)). A syntax
tree makes it easy for other programs to read and write something, in this
case markdown.

*   It could be used to read certain information from structured markdown
    documents. For example, an [**awesome** list
    »](https://github.com/sindresorhus/awesome/issues/427#issuecomment-160111301)

*   It could be used to generate markdown from other data. For example,
    [API docs with **documentation**
    »](https://github.com/documentationjs/documentation)

[Read how to install **remark** »](https://github.com/wooorm/remark/blob/master/doc/installation.md)

## Application Programming Interface

The core of **remark**, called **remark**(3), reads and writes markdown. And,
allows authors to use plug-ins which transform markdown documents.

*   [Read how to install **remark**(3) »](https://github.com/wooorm/remark/blob/master/doc/installation.md)
*   [Read more on the API in **remark**(3) »](https://github.com/wooorm/remark/blob/master/doc/remark.3.md)

## Command Line Interface

On top of the core sits an elaborate CLI, called **remark**(1), which can be
used to validate, prepare, and compile markdown in a build step.

*   [Read how to install **remark**(1) with npm »](https://github.com/wooorm/remark/blob/master/doc/installation.md#npm)
*   [Read more on the CLI in **remark**(1) »](https://github.com/wooorm/remark/blob/master/doc/remark.1.md)
*   [Read how to use plug-ins in  **remarkplugin**(7) »](https://github.com/wooorm/remark/blob/master/doc/remarkplugin.7.md#command-line-usage)
*   [Read how to use settings in **remarkconfig**(7) »](https://github.com/wooorm/remark/blob/master/doc/remarkconfig.7.md#command-line-settings)
*   [Read how to use configuration files in **remarkrc**(5) »](https://github.com/wooorm/remark/blob/master/doc/remarkrc.5.md)
*   [Read how to ignore files in **remarkignore**(5) »](https://github.com/wooorm/remark/blob/master/doc/remarkignore.5.md)

## Configuration

Most customisation is deferred to plug-ins, but the core of **remark** has
several settings. For example, which flavour of markdown is used, or whether
to use asterisks (`*`) or underscores (`_`) for emphasis.

*   [View available settings in **remarksetting**(7) »](https://github.com/wooorm/remark/blob/master/doc/remarksetting.7.md)
*   [Read how to set settings in **remarkconfig**(7) »](https://github.com/wooorm/remark/blob/master/doc/remarkconfig.7.md)

## Syntax Tree

**remark** exposes markdown as an abstract syntax tree, defined by
**mdast**.

*   [Read more on the AST in **mdast** »](https://github.com/wooorm/mdast)

## Plug-ins

**remark** gets really cool when you combine it with plugins.

*   [View available plug-ins and utilities »](https://github.com/wooorm/remark/blob/master/doc/plugins.md)
*   [Read how to use plug-ins in  **remarkplugin**(7) »](https://github.com/wooorm/remark/blob/master/doc/remarkplugin.7.md)
*   [Read how to create plug-ins in **remarkplugin**(3) »](https://github.com/wooorm/remark/blob/master/doc/remarkplugin.3.md)
