<!--mdast setext-->

<!--lint disable no-multiple-toplevel-headings maximum-line-length-->

2.3.2 / 2015-12-21
==================

*   Fix missing link in `history.md` ([49453f7](https://github.com/wooorm/mdast/commit/49453f7))

2.3.1 / 2015-12-21
==================

*   Fix `package.json` files not loading on mdast(1) ([1ef6e05](https://github.com/wooorm/mdast/commit/1ef6e05))

2.3.0 / 2015-12-01
==================

*   Refactor to prefer prefixed plug-ins in mdast(1) ([44d4daa](https://github.com/wooorm/mdast/commit/44d4daa))
*   Fix recursive `plugins` key handling in mdast(1) ([4bb02b2](https://github.com/wooorm/mdast/commit/4bb02b2))
*   Add getting-started documentation ([a20d9d0](https://github.com/wooorm/mdast/commit/a20d9d0))
*   Fix stdout(4) and stderr(4) usage ([501a377](https://github.com/wooorm/mdast/commit/501a377))

2.2.2 / 2015-11-21
==================

*   Fix premature reporting ([a82d018](https://github.com/wooorm/mdast/commit/a82d018))
*   Remove distribution files from version control ([f068edd](https://github.com/wooorm/mdast/commit/f068edd))
*   Remove support for bower ([61162be](https://github.com/wooorm/mdast/commit/61162be))

2.2.1 / 2015-11-20
==================

*   Fix silent exit when without `.mdastignore` file ([7233fb2](https://github.com/wooorm/mdast/commit/7233fb2))

2.2.0 / 2015-11-19
==================

*   Update dependencies ([c2aca8f](https://github.com/wooorm/mdast/commit/c2aca8f))
*   Refactor to externalise file finding ([517d483](https://github.com/wooorm/mdast/commit/517d483))
*   Refactor to make node to `encode` optional ([03c3361](https://github.com/wooorm/mdast/commit/03c3361))
*   Add version to library, distribution files ([e245a43](https://github.com/wooorm/mdast/commit/e245a43))
*   Remove output to stdout(4) when watching ([594a45f](https://github.com/wooorm/mdast/commit/594a45f))
*   Remove variable capturing groups from regexes ([c17228c](https://github.com/wooorm/mdast/commit/c17228c))

2.1.0 / 2015-10-05
==================

*   Fix pipes inside code in tables ([baad536](https://github.com/wooorm/mdast/commit/baad536))
*   Add processing of just the changed watched file to mdast(1) ([e3748d2](https://github.com/wooorm/mdast/commit/e3748d2))
*   Add error when pedantic is used with incompatible options ([3326a89](https://github.com/wooorm/mdast/commit/3326a89))

2.0.0 / 2015-09-20
==================

*   Update unified ([3dec23f](https://github.com/wooorm/mdast/commit/3dec23f))
*   Update AUTHORS with recent contributors ([49ec46f](https://github.com/wooorm/mdast/commit/49ec46f))
*   Add support for watching files for changes to mdast(1) ([b3078f9](https://github.com/wooorm/mdast/commit/b3078f9))
*   Fix stdin detection in child-processes ([8f1d7f1](https://github.com/wooorm/mdast/commit/8f1d7f1))
*   Add list of tools built with mdast ([d7ad2ac](https://github.com/wooorm/mdast/commit/d7ad2ac))

1.2.0 / 2015-09-07
==================

*   Fix bug where colour on mdast(1) persisted ([ca2c53a](https://github.com/wooorm/mdast/commit/ca2c53a))
*   Add support for loading global plugins ([5e2d32e](https://github.com/wooorm/mdast/commit/5e2d32e))
*   Add more mdastplugin(3) examples ([8664a03](https://github.com/wooorm/mdast/commit/8664a03))
*   Move all info output of mdast(1) to stderr(4) ([daed42f](https://github.com/wooorm/mdast/commit/daed42f))
*   Refactor miscellaneous docs ([72412af](https://github.com/wooorm/mdast/commit/72412af))

1.1.0 / 2015-08-21
==================

*   Fix typo in man-page ([d435999](https://github.com/wooorm/mdast/commit/d435999))
*   Update list of plug-ins ([4add9e6](https://github.com/wooorm/mdast/commit/4add9e6))
*   Refactor to externalise reporter ([8c80af9](https://github.com/wooorm/mdast/commit/8c80af9))
*   Refactor mdast(1) to externalise `to-vfile` ([69629d5](https://github.com/wooorm/mdast/commit/69629d5))

1.0.0 / 2015-08-12
==================

Nothing much changed, just that **mdast** is now officially stable!
Thanks all for the 100 stars :wink:.

*   Update eslint ([2fc7dbb](https://github.com/wooorm/mdast/commit/2fc7dbb))

0.29.0 / 2015-08-08
===================

*   Update docs ([22fe26a](https://github.com/wooorm/mdast/commit/22fe26a))
*   Fix “nested’ fenced code rendering for RedCarpet ([84e84d8](https://github.com/wooorm/mdast/commit/84e84d8))
*   Add support for exiting with `1` on warnings ([06571a5](https://github.com/wooorm/mdast/commit/06571a5))
*   Add support for not writing to stdout(4) ([cde0cd3](https://github.com/wooorm/mdast/commit/cde0cd3))

0.28.0 / 2015-07-31
===================

*   Replace coveralls with codecov ([f86ebed](https://github.com/wooorm/mdast/commit/f86ebed))
*   Refactor to externalise core API ([9892ec4](https://github.com/wooorm/mdast/commit/9892ec4))
*   Add missing scripts for component ([af0584c](https://github.com/wooorm/mdast/commit/af0584c))

0.27.2 / 2015-07-26
===================

*   Refactor to externalise file ([58a0f51](https://github.com/wooorm/mdast/commit/58a0f51))
*   Fix and re-add invalid-comment support to non-commonmark ([16c9b92](https://github.com/wooorm/mdast/commit/16c9b92))

0.27.1 / 2015-07-22
===================

*   Fix failing UglifyJS2 by refactoring confusing code ([1a4fc46](https://github.com/wooorm/mdast/commit/1a4fc46))

0.27.0 / 2015-07-19
===================

*   Refactor to move copying functionality to `file-pipeline/copy` ([ac7bbcc](https://github.com/wooorm/mdast/commit/ac7bbcc))
*   Add `ast` property on files processed by API ([599641c](https://github.com/wooorm/mdast/commit/599641c))
*   Add documentation for file-sets ([b33b724](https://github.com/wooorm/mdast/commit/b33b724))
*   Add mdast-validate-links as a dependency ([72b0a1b](https://github.com/wooorm/mdast/commit/72b0a1b))

0.27.0-rc.2 / 2015-07-19
========================

*   Add support for passing a file-path to `FileSet#add` ([57a0082](https://github.com/wooorm/mdast/commit/57a0082))
*   Add `output` properties to rc-files ([a15567a](https://github.com/wooorm/mdast/commit/a15567a))
*   Fix several CLI bugs, increase stability ([274ea66](https://github.com/wooorm/mdast/commit/274ea66))
*   Remove `instanceof` operator in `file` ([3e84b34](https://github.com/wooorm/mdast/commit/3e84b34))

0.27.0-rc.1 / 2015-07-17
========================

*   Add CLI-pipelines ([ee5e603](https://github.com/wooorm/mdast/commit/ee5e603))
*   Fix order of multiple attachers in `mdast#use` ([070d664](https://github.com/wooorm/mdast/commit/070d664))
*   Remove travis deploy ([f693521](https://github.com/wooorm/mdast/commit/f693521))
*   Update `doc/plugins.md` ([be77bef](https://github.com/wooorm/mdast/commit/be77bef))
*   Fix invalid build-script ([a5738a1](https://github.com/wooorm/mdast/commit/a5738a1))
*   Refactor to externalise utilities ([09dfec2](https://github.com/wooorm/mdast/commit/09dfec2))

0.26.2 / 2015-07-06
===================

*   Fix incorrectly eaten initial table fence ([3da315e](https://github.com/wooorm/mdast/commit/3da315e))

0.26.1 / 2015-07-05
===================

*   Fix nested reference support ([4fc2c47](https://github.com/wooorm/mdast/commit/4fc2c47))

0.26.0 / 2015-06-30
===================

*   Add support for `listItemIndent` stringification setting ([f645bc5](https://github.com/wooorm/mdast/commit/f645bc5))
*   Fix table-cell position on padded cells ([6174e21](https://github.com/wooorm/mdast/commit/6174e21))

0.25.0 / 2015-06-28
===================

*   Fix HTML support ([09ec06c](https://github.com/wooorm/mdast/commit/09ec06c))
*   Add `hughsk/mdast-contributors` to plug-ins ([b16bc4f](https://github.com/wooorm/mdast/commit/b16bc4f))
*   Fix bug where escaped final-emphasis markers were not recognised ([a7f55e1](https://github.com/wooorm/mdast/commit/a7f55e1))
*   Add `mdast-html` to plug-ins ([a63d74b](https://github.com/wooorm/mdast/commit/a63d74b))

0.24.0 / 2015-06-21
===================

*   Add support for `'escape'` value for `entities` stringification ([518d3d8](https://github.com/wooorm/mdast/commit/518d3d8))
*   Fix bug where entities in definitions were not decoded ([5454a6c](https://github.com/wooorm/mdast/commit/5454a6c))

0.23.0 / 2015-06-18
===================

*   Add support for writing to directories to CLI ([8a6e464](https://github.com/wooorm/mdast/commit/8a6e464))

0.22.1 / 2015-06-18
===================

*   Add mdast-man as a dev-dependency ([7fb9d7f](https://github.com/wooorm/mdast/commit/7fb9d7f))
*   Fix failing eslint rule ([8949016](https://github.com/wooorm/mdast/commit/8949016))
*   Update user-home, eslint, mdast plug-ins ([adde30a](https://github.com/wooorm/mdast/commit/adde30a))
*   Fix bug in process without options and with done ([4aa68e0](https://github.com/wooorm/mdast/commit/4aa68e0))

0.22.0 / 2015-06-13
===================

*   Add `position` as a parse setting to ignore positional information ([a4d5855](https://github.com/wooorm/mdast/commit/a4d5855))
*   Add paragraph on the two parts of mdast to `readme.md` ([8360147](https://github.com/wooorm/mdast/commit/8360147))
*   Refactor to refer more representational plug-ins in `readme` ([b93f573](https://github.com/wooorm/mdast/commit/b93f573))
*   Add `mdast-lint` to plugins ([75d59d1](https://github.com/wooorm/mdast/commit/75d59d1))
*   Rebuild with new browserify ([6b396c3](https://github.com/wooorm/mdast/commit/6b396c3))
*   Add `--file-path <path>` option for STDIN to CLI ([a53dffb](https://github.com/wooorm/mdast/commit/a53dffb))
*   Fix incorrect example in docs ([f7135a8](https://github.com/wooorm/mdast/commit/f7135a8))
*   Add support for advanced CLI settings ([542ea5a](https://github.com/wooorm/mdast/commit/542ea5a))
*   Fix support for arrays as options on CLI ([e220520](https://github.com/wooorm/mdast/commit/e220520))

0.21.2 / 2015-06-03
===================

*   Update eslint ([5a3e9bb](https://github.com/wooorm/mdast/commit/5a3e9bb))
*   Update `man/` pages ([0c689f7](https://github.com/wooorm/mdast/commit/0c689f7))
*   Add `<stdin>` label to CLI warnings when piping ([aba731f](https://github.com/wooorm/mdast/commit/aba731f))
*   Fix typos ([688f63a](https://github.com/wooorm/mdast/commit/688f63a))
*   Fix UMD-installation example in `readme.md` ([6caaecd](https://github.com/wooorm/mdast/commit/6caaecd))
*   Fix `indent` for merged nodes ([1eee40f](https://github.com/wooorm/mdast/commit/1eee40f))
*   Remove extraneous `console.log` from tests ([f8e3aa1](https://github.com/wooorm/mdast/commit/f8e3aa1))
*   Update mdast-github, mdast-toc ([2a4a075](https://github.com/wooorm/mdast/commit/2a4a075))
*   Refactor markdown list-item, line-length style ([7075aac](https://github.com/wooorm/mdast/commit/7075aac))

0.21.1 / 2015-05-25
===================

*   Fix positional information on lists ([024fca2](https://github.com/wooorm/mdast/commit/024fca2))

0.21.0 / 2015-05-24
===================

*   Add support for tokenizing into multiple tokens ([a1b7125](https://github.com/wooorm/mdast/commit/a1b7125))
*   Add `indent` to `node.position` ([709777b](https://github.com/wooorm/mdast/commit/709777b))
*   Fix missing parentheses ([84316a8](https://github.com/wooorm/mdast/commit/84316a8))

0.20.1 / 2015-05-20
===================

*   Update eslint ([8174af6](https://github.com/wooorm/mdast/commit/8174af6))
*   Update `.editorconfig` with json, svg, mdastrc, eslintrc ([f3bc2a9](https://github.com/wooorm/mdast/commit/f3bc2a9))
*   Remove dollar signs from bash code in markdown ([3a3ceb5](https://github.com/wooorm/mdast/commit/3a3ceb5))
*   Add silent mode to supress non-fatal messages on CLI ([b1859d6](https://github.com/wooorm/mdast/commit/b1859d6))
*   Fix bug in empty ATX (closed) headings ([a80f8e9](https://github.com/wooorm/mdast/commit/a80f8e9))

0.20.0 / 2015-05-09
===================

*   Rebuild ([d1c45c3](https://github.com/wooorm/mdast/commit/d1c45c3))
*   Refactor `lib/parse` to normalize order ([f2fa3ac](https://github.com/wooorm/mdast/commit/f2fa3ac))
*   Add support for adjacent lists in blockquotes ([f89663c](https://github.com/wooorm/mdast/commit/f89663c))
*   Fix broken test ([523e1ad](https://github.com/wooorm/mdast/commit/523e1ad))
*   Fix incorrect links introduced in [609b938](https://github.com/wooorm/mdast/commit/609b938) ([6a8d725](https://github.com/wooorm/mdast/commit/6a8d725))
*   Add support for encoding unsafe HTML characters to entities ([ce28ed4](https://github.com/wooorm/mdast/commit/ce28ed4))
*   Add `incrementListMarker` setting to control not increas ordered items ([659e49c](https://github.com/wooorm/mdast/commit/659e49c))
*   Add warning when too much content is eaten by parser ([61732d5](https://github.com/wooorm/mdast/commit/61732d5))
*   Fix bug where setext-headings ate too much markdown ([da03727](https://github.com/wooorm/mdast/commit/da03727))
*   Remove support for atx-headings without initial spaces ([daa344c](https://github.com/wooorm/mdast/commit/daa344c))
*   Fix stringification of autolinks without protocol. ([2fb6938](https://github.com/wooorm/mdast/commit/2fb6938))
*   Remove unused `level` parameter to compilers ([5df6578](https://github.com/wooorm/mdast/commit/5df6578))
*   Refactor parameter ordering in private `add` function ([99db50b](https://github.com/wooorm/mdast/commit/99db50b))
*   Add improved docs to API ([c925a23](https://github.com/wooorm/mdast/commit/c925a23))
*   Add improved docs to CLI ([2b754cb](https://github.com/wooorm/mdast/commit/2b754cb))
*   Fix build fail on case-sensitive file systems ([609b938](https://github.com/wooorm/mdast/commit/609b938))
*   Add missing jsdoc comments ([8745960](https://github.com/wooorm/mdast/commit/8745960))
*   Refactor npm files ([4ca95ac](https://github.com/wooorm/mdast/commit/4ca95ac))
*   Refactor npm scripts ([00e9ddd](https://github.com/wooorm/mdast/commit/00e9ddd))
*   Update browserify, eslint, jscs ([9d5c1d8](https://github.com/wooorm/mdast/commit/9d5c1d8))
*   Add `.editorconfig` ([e239d68](https://github.com/wooorm/mdast/commit/e239d68))
*   Remove required `--output` in multi-file CLI mode ([f2f0b21](https://github.com/wooorm/mdast/commit/f2f0b21))
*   Rename sentence-cased docs files with lower-case names ([b03df38](https://github.com/wooorm/mdast/commit/b03df38))
*   Refactor loose list items in docs ([6402291](https://github.com/wooorm/mdast/commit/6402291))
*   Fix links in `doc/` and `man/` ([e0414bc](https://github.com/wooorm/mdast/commit/e0414bc))
*   Rename sentence-cased markdown files with lower-case names ([4bf2205](https://github.com/wooorm/mdast/commit/4bf2205))
*   Add support for link definitions without reference ([2295073](https://github.com/wooorm/mdast/commit/2295073))
*   Refactor to simplify identifier escaping ([8e6861a](https://github.com/wooorm/mdast/commit/8e6861a))
*   Fix incorrectly reported `root.position.end` ([76d8576](https://github.com/wooorm/mdast/commit/76d8576))
*   Add support for e-mail auto-links at the beginning of a paragraph ([2b390f0](https://github.com/wooorm/mdast/commit/2b390f0))
*   Add stack trace to uncaught CLI errors ([d329bfb](https://github.com/wooorm/mdast/commit/d329bfb))
*   Add warning for references without definitions ([67a39c2](https://github.com/wooorm/mdast/commit/67a39c2))
*   Add warnings for duplicate link references, footnotes ([2904f9c](https://github.com/wooorm/mdast/commit/2904f9c))

0.19.0 / 2015-04-21
===================

*   Rebuild markdown, man pages ([8832c33](https://github.com/wooorm/mdast/commit/8832c33))
*   Fix bug where mdast(1) would not process files ([8d6a073](https://github.com/wooorm/mdast/commit/8d6a073))
*   Add support for hiding current directory to `lib/file` ([448552c](https://github.com/wooorm/mdast/commit/448552c))
*   Add pretty error reporting to CLI, API ([fd4dd55](https://github.com/wooorm/mdast/commit/fd4dd55))
*   Add `man 3 mdast` to `mdast --help` ([10a3d7f](https://github.com/wooorm/mdast/commit/10a3d7f))
*   Update `doc/Plugins.md` with enw plugins ([22717c1](https://github.com/wooorm/mdast/commit/22717c1))

0.18.0 / 2015-04-12
===================

*   Add list of plugins to `doc/Plugins.md` ([175b242](https://github.com/wooorm/mdast/commit/175b242))
*   Refactor tokenizers to return tokenized node ([cce3ec9](https://github.com/wooorm/mdast/commit/cce3ec9))
*   Remove mergin of HTML nodes into a single token ([6d529d9](https://github.com/wooorm/mdast/commit/6d529d9))
*   Add support for plugin options to mdast(1) ([361f7dd](https://github.com/wooorm/mdast/commit/361f7dd))
*   Fix variable name ([1590bff](https://github.com/wooorm/mdast/commit/1590bff))
*   Update mdast-toc ([8e51ace](https://github.com/wooorm/mdast/commit/8e51ace))
*   Add `loose` property on lists ([e071484](https://github.com/wooorm/mdast/commit/e071484))
*   Add support for plug-in options to `mdasrc` files ([cc178f0](https://github.com/wooorm/mdast/commit/cc178f0))

0.17.1 / 2015-04-08
===================

*   Remove left-alignment for neutral columns in tables (Closes [GH-19](https://github.com/wooorm/mdast/issues/19), [d5d6657](https://github.com/wooorm/mdast/commit/d5d6657))

0.17.0 / 2015-04-07
===================

*   Refactor interface ([f75b2a3](https://github.com/wooorm/mdast/commit/f75b2a3))
*   Remove dead code since [79d29b5](https://github.com/wooorm/mdast/commit/79d29b5) ([e94eae5](https://github.com/wooorm/mdast/commit/e94eae5))

0.16.0 / 2015-04-04
===================

*   Fix extra indented code blocks ([5ed732e](https://github.com/wooorm/mdast/commit/5ed732e))
*   Fix support for multiple paragraphs in list-items ([79d29b5](https://github.com/wooorm/mdast/commit/79d29b5))
*   Add fixture for multiple footnotes to the same definition ([0a6ceb3](https://github.com/wooorm/mdast/commit/0a6ceb3), closes [#8](https://github.com/wooorm/mdast/issues/8))
*   Add support for a BOM ([9e0770d](https://github.com/wooorm/mdast/commit/9e0770d))
*   Fix `__proto__` support ([c3ac455](https://github.com/wooorm/mdast/commit/c3ac455)) ([0e2f447](https://github.com/wooorm/mdast/commit/0e2f447))
*   Refactor exports to expose a function ([c3ac455](https://github.com/wooorm/mdast/commit/c3ac455))
*   Add repeat-string as a dependency ([360e4ea](https://github.com/wooorm/mdast/commit/360e4ea))
*   Add support for `__proto__` as footnote, link identifier ([b8c9504](https://github.com/wooorm/mdast/commit/b8c9504))
*   Fix previous commit ([632fe86](https://github.com/wooorm/mdast/commit/632fe86)) ([f36a011](https://github.com/wooorm/mdast/commit/f36a011))
*   Fix list-items ([632fe86](https://github.com/wooorm/mdast/commit/632fe86))
*   Add error position for `he` dependency errors ([a71cb47](https://github.com/wooorm/mdast/commit/a71cb47))
*   Add `referenceImages` stringification setting ([e07e6d3](https://github.com/wooorm/mdast/commit/e07e6d3))
*   Refactor for changes in eslint, jscs ([407d81c](https://github.com/wooorm/mdast/commit/407d81c))
*   Add support for tokenizer errors ([ec48ea4](https://github.com/wooorm/mdast/commit/ec48ea4))
*   Add support for stringification of auto-links ([09e4a81](https://github.com/wooorm/mdast/commit/09e4a81))
*   Fix hard-break support ([2196cef](https://github.com/wooorm/mdast/commit/2196cef))
*   Refactor CLI test ([311dd36](https://github.com/wooorm/mdast/commit/311dd36))
*   Add support for unprefixed npm plugins to `--use` ([a2a031b](https://github.com/wooorm/mdast/commit/a2a031b))
*   Add mdast-yaml-config as a dev-dependency ([f1415d6](https://github.com/wooorm/mdast/commit/f1415d6))
*   Add `--no-color` argument to CLI ([263bc96](https://github.com/wooorm/mdast/commit/263bc96))
*   Add mdastconfig(7) man page ([78b311a](https://github.com/wooorm/mdast/commit/78b311a))

0.15.1 / 2015-03-27
===================

*   Fix runtime `setOptions` ([481e096](https://github.com/wooorm/mdast/commit/481e096))

0.15.0 / 2015-03-27
===================

*   Add support for setting `parse`, `stringify` options during runtime ([999f3f4](https://github.com/wooorm/mdast/commit/999f3f4))

0.14.0 / 2015-03-26
===================

*   Update `.travis.yml` ([85072a1](https://github.com/wooorm/mdast/commit/85072a1))
*   Fix more links in docs ([d83d44c](https://github.com/wooorm/mdast/commit/d83d44c))
*   Fix absolute links in `doc/Plugins.md` ([17803b8](https://github.com/wooorm/mdast/commit/17803b8))
*   Fix links in `Readme.md`, `doc/Plugins.md` ([a2c483f](https://github.com/wooorm/mdast/commit/a2c483f))
*   Move plugin documention to `doc/Plugins.md` ([aaec197](https://github.com/wooorm/mdast/commit/aaec197))
*   Fix `script/build-options.js` for plugin mechanism changes ([22c5caa](https://github.com/wooorm/mdast/commit/22c5caa))
*   Add, or better, re-add, plug-ins after update ([56a293d](https://github.com/wooorm/mdast/commit/56a293d))
*   Update generated lib for [ed4a4c0](https://github.com/wooorm/mdast/commit/ed4a4c0) ([36c4c70](https://github.com/wooorm/mdast/commit/36c4c70))
*   Update eslint ([eaa6900](https://github.com/wooorm/mdast/commit/eaa6900))

0.14.0-rc.1 / 2015-03-24
========================

*   Refactor plugin mechanism ([7dc23a6](https://github.com/wooorm/mdast/commit/7dc23a6))
*   Remove plugins from `.mdastrc` for the time being ([204e32a](https://github.com/wooorm/mdast/commit/204e32a))
*   Add support for `--quiet` flag in CLI ([64f9ed1](https://github.com/wooorm/mdast/commit/64f9ed1))
*   Add support for `--ext` flag in CLI ([fa0c1d7](https://github.com/wooorm/mdast/commit/fa0c1d7))

0.13.0 / 2015-03-22
===================

*   Add multi-file and directory to CLI ([675c761](https://github.com/wooorm/mdast/commit/675c761))
*   Refactor lib ([ed4a4c0](https://github.com/wooorm/mdast/commit/ed4a4c0))
*   Add support for `--no-rc` to CLI ([69a89e4](https://github.com/wooorm/mdast/commit/69a89e4))
*   Refactor CLI ([7ef836e](https://github.com/wooorm/mdast/commit/7ef836e))
*   Add support for `--` argument to CLI ([d7e7c05](https://github.com/wooorm/mdast/commit/d7e7c05))
*   Fix bug in node@0.10 re invalid error exit code ([8640af1](https://github.com/wooorm/mdast/commit/8640af1))
*   Fix `prepublish` by using local CLI ([21b768b](https://github.com/wooorm/mdast/commit/21b768b))
*   Add support for configuration files to CLI ([3cfca6a](https://github.com/wooorm/mdast/commit/3cfca6a))
*   Update build ([ed6654f](https://github.com/wooorm/mdast/commit/ed6654f))
*   Fix support for boolean attributes in CLI ([d1c86e0](https://github.com/wooorm/mdast/commit/d1c86e0))
*   Add support for global plugins ([ae922e7](https://github.com/wooorm/mdast/commit/ae922e7))
*   Add sceipt to regenerate fixtures ([5b7ae76](https://github.com/wooorm/mdast/commit/5b7ae76))
*   Fix miscellaneous link definition bugs ([e84a054](https://github.com/wooorm/mdast/commit/e84a054))
*   Refactor list support ([b4d2b47](https://github.com/wooorm/mdast/commit/b4d2b47))
*   Update core contributor ([7859f1a](https://github.com/wooorm/mdast/commit/7859f1a))
*   Add mdast-github as a dev-dependency ([20cb450](https://github.com/wooorm/mdast/commit/20cb450))

0.12.0 / 2015-03-16
===================

*   Add support for multiple key-value delimiters in settings ([9ff5faa](https://github.com/wooorm/mdast/commit/9ff5faa))
*   Add stack-trace to CLI errors ([9c52063](https://github.com/wooorm/mdast/commit/9c52063))
*   Update travis to use faster containers ([762ad4d](https://github.com/wooorm/mdast/commit/762ad4d))
*   Fix CLI test for file move ([60d1a2c](https://github.com/wooorm/mdast/commit/60d1a2c))
*   Update plug-in support ([e5cb258](https://github.com/wooorm/mdast/commit/e5cb258))
*   Refactor `doc/Options.md` ([24e713f](https://github.com/wooorm/mdast/commit/24e713f))
*   Update docs for `commonmark: true` mode ([9f3a2e6](https://github.com/wooorm/mdast/commit/9f3a2e6))
*   Update docs for `breaks: true` mode ([caf6256](https://github.com/wooorm/mdast/commit/caf6256))
*   Fix missing semi-colons in `doc/Nodes.md` ([55befb8](https://github.com/wooorm/mdast/commit/55befb8))
*   Add table of contents to `doc/Nodes.md`, `doc/Options.md` ([00aef4b](https://github.com/wooorm/mdast/commit/00aef4b))
*   Remove seperate support for `tables: true` mode ([052d00c](https://github.com/wooorm/mdast/commit/052d00c))
*   Add table of contents to `Readme.md` ([f42aa29](https://github.com/wooorm/mdast/commit/f42aa29))

0.11.0 / 2015-03-12
===================

*   Add support for GFMs task lists ([ec9c2cb](https://github.com/wooorm/mdast/commit/ec9c2db), closes [#16](https://github.com/wooorm/mdast/pull/16))

0.10.0 / 2015-03-11
===================

*   Add `test-api-extensive` target ([5c87d0d](https://github.com/wooorm/mdast/commit/5c87d0d))
*   Fix list-item stringification ([57741a7](https://github.com/wooorm/mdast/commit/57741a7))
*   Add `lib/defaults.js` ([47c1dd2](https://github.com/wooorm/mdast/commit/47c1dd2))
*   Add `camelcase` as a dependency for CLI ([2c0cdab](https://github.com/wooorm/mdast/commit/2c0cdab))
*   Update docs with signatures, more info, and style ([cbc41db](https://github.com/wooorm/mdast/commit/cbc41db))
*   Refactor `test/index.js` ([29da868](https://github.com/wooorm/mdast/commit/29da868))
*   Fix `test-api` script ([7f455d7](https://github.com/wooorm/mdast/commit/7f455d7))
*   Update eslint ([4ab1b29](https://github.com/wooorm/mdast/commit/4ab1b29))
*   Remove mdast dependency ([4de3846](https://github.com/wooorm/mdast/commit/4de3846))
*   Refactor wording in `Readme.md` ([6e9f218](https://github.com/wooorm/mdast/commit/6e9f218))
*   Update benchmark and benchmark results ([850c534](https://github.com/wooorm/mdast/commit/850c534))

0.9.0 / 2015-03-07
==================

*   Update mdast dependency ([6b1bd06](https://github.com/wooorm/mdast/commit/6b1bd06))
*   Update eslint ([bd30d2e](https://github.com/wooorm/mdast/commit/bd30d2e))
*   Update chalk ([aea84ed](https://github.com/wooorm/mdast/commit/aea84ed))
*   Update browser build ([7a8485e](https://github.com/wooorm/mdast/commit/7a8485e))
*   Fix link parsing/stringification support ([05d25f0](https://github.com/wooorm/mdast/commit/05d25f0))
*   Refactor escape, entity, inline code support ([e15f43c](https://github.com/wooorm/mdast/commit/e15f43c))
*   Fix blockquote, paragraph support ([089ca44](https://github.com/wooorm/mdast/commit/089ca44))

0.8.0 / 2015-02-27
==================

*   Fix reference link support ([3a7e5c6](https://github.com/wooorm/mdast/commit/3a7e5c6))

0.7.0 / 2015-02-25
==================

*   Fix fenced code block support ([66a763a](https://github.com/wooorm/mdast/commit/66a763a))
*   Add support for blank lines ([ad61b1e](https://github.com/wooorm/mdast/commit/ad61b1e))
*   Fix Setext heading support ([27c4a3b](https://github.com/wooorm/mdast/commit/27c4a3b))
*   Fix ATX heading support ([0568582](https://github.com/wooorm/mdast/commit/0568582))

0.6.0 / 2015-02-23
==================

*   Refactor code style in `lib/expressions.js` ([1d84c60](https://github.com/wooorm/mdast/commit/1d84c60))
*   Add CommonMark paragraph parsing ([2dda62f](https://github.com/wooorm/mdast/commit/2dda62f))
*   Add iojs, node 0.12 to travis ([465d2fc](https://github.com/wooorm/mdast/commit/465d2fc))
*   Update browserify ([965592d](https://github.com/wooorm/mdast/commit/965592d))

0.5.3 / 2015-02-20
==================

*   Add `AUTHORS` ([bd40fcf](https://github.com/wooorm/mdast/commit/bd40fcf))
*   Fix default value for `fence` in `Readme.md` ([1545df1](https://github.com/wooorm/mdast/commit/1545df1))
*   Add more verbose project description ([30b7490](https://github.com/wooorm/mdast/commit/30b7490))
*   Remove double space in example ([fce6485](https://github.com/wooorm/mdast/commit/fce6485))
*   Refactor `History.md` ([b3b86ee](https://github.com/wooorm/mdast/commit/b3b86ee))
*   Fix bug with tabs following code block fences ([dfc3432](https://github.com/wooorm/mdast/commit/dfc3432))
*   Update mdast dependency ([e6d9d9d](https://github.com/wooorm/mdast/commit/e6d9d9d))

0.5.2 / 2015-02-19
==================

*   Refactor to improve performance on repeated character ([196ef1d](https://github.com/wooorm/mdast/commit/196ef1d))

0.5.1 / 2015-02-19
==================

*   Remove ATX headers when not followed by white space ([1baa543](https://github.com/wooorm/mdast/commit/1baa543))
*   Fix miscellaneous emphasis issues ([3666c78](https://github.com/wooorm/mdast/commit/3666c78))
*   Fix empty list-item from throwing ([d7793ac](https://github.com/wooorm/mdast/commit/d7793ac))
*   Fix miscellaneous horizontal rule issues ([0a6a783](https://github.com/wooorm/mdast/commit/0a6a783))

0.5.0 / 2015-02-17
==================

*   Add tab support ([a051f84](https://github.com/wooorm/mdast/commit/a051f84))

0.4.1 / 2015-02-15
==================

*   Update mdast dependency ([c5c3c37](https://github.com/wooorm/mdast/commit/c5c3c37))
*   Add mdast as third argument to plug-ins ([00a9b9f](https://github.com/wooorm/mdast/commit/00a9b9f))

0.4.0 / 2015-02-15
==================

*   Refactor module to use more constants instead of literal strings ([1163134](https://github.com/wooorm/mdast/commit/1163134))
*   Remove ensured new line at end of file ([f4f0cc9](https://github.com/wooorm/mdast/commit/f4f0cc9))
*   Refactor istanbul ignore, error message ([4c4e172](https://github.com/wooorm/mdast/commit/4c4e172))
*   Remove support for `referenceFootnotes: false` ([ed8416e](https://github.com/wooorm/mdast/commit/ed8416e))
*   Add `lib/expressions.js` with precompiled expressions ([d8fe197](https://github.com/wooorm/mdast/commit/d8fe197))
*   Refactor module ([7c45751](https://github.com/wooorm/mdast/commit/7c45751))
*   Add support for escaped pipes in table cells ([b7a3f69](https://github.com/wooorm/mdast/commit/b7a3f69))
*   Fix bug in node@0.10 re invalid error exit code ([c557bc6](https://github.com/wooorm/mdast/commit/c557bc6))

0.3.0 / 2015-02-08
==================

*   Add man docs for mdast(1) ([f44182a](https://github.com/wooorm/mdast/commit/f44182a))
*   Refactor cli to use commander ([1a108e2](https://github.com/wooorm/mdast/commit/1a108e2))
*   Refactor to simplify options validation ([da6ae75](https://github.com/wooorm/mdast/commit/da6ae75))
*   Add support for YAML front matter ([a09fbe8](https://github.com/wooorm/mdast/commit/a09fbe8))
*   Update mdast, eslint as dev-dependencies ([d14f27e](https://github.com/wooorm/mdast/commit/d14f27e))
*   Replace file name underscores with dashes in `test/` ([efde50f](https://github.com/wooorm/mdast/commit/efde50f))
*   Fix option casing in `cli.js` ([b244333](https://github.com/wooorm/mdast/commit/b244333))
*   Merge branch 'feature/stringification/prefer-spaced-tables' ([3baffd4](https://github.com/wooorm/mdast/commit/3baffd4))
*   Add docs for `options.spacedTable` ([ce680c0](https://github.com/wooorm/mdast/commit/ce680c0))
*   Add support for `spacedTable` ([a726982](https://github.com/wooorm/mdast/commit/a726982))
*   Add tests for incorrect `spacedTable` option ([39bd79a](https://github.com/wooorm/mdast/commit/39bd79a))
*   Add fixtures for spaced table style ([67a4488](https://github.com/wooorm/mdast/commit/67a4488))
*   Merge branch 'feature/stringification/prefer-loose-tables' ([a12ab6c](https://github.com/wooorm/mdast/commit/a12ab6c))
*   Add docs for `options.looseTable` ([1d9dc58](https://github.com/wooorm/mdast/commit/1d9dc58))
*   Add support for `looseTable` ([bd9d35c](https://github.com/wooorm/mdast/commit/bd9d35c))
*   Add tests for incorrect `looseTable` option ([ad72c72](https://github.com/wooorm/mdast/commit/ad72c72))
*   Add fixtures for loose table style ([ee925bc](https://github.com/wooorm/mdast/commit/ee925bc))
*   Add auto inferring of input file if an output file is provided ([3b3b799](https://github.com/wooorm/mdast/commit/3b3b799))
*   Add `fence` parse option to `Readme.md` ([0c41167](https://github.com/wooorm/mdast/commit/0c41167))
*   Add `example.js` to `.npmignore`, `bower.json` ignore ([3f565e4](https://github.com/wooorm/mdast/commit/3f565e4))

0.2.0 / 2015-02-02
==================

*   Fix `mdast.js` ([94aaf42](https://github.com/wooorm/mdast/commit/94aaf42))
*   Merge branch 'feature/add-line-and-column-position' ([cafbe3d](https://github.com/wooorm/mdast/commit/cafbe3d))
*   Add `position` objects to nodes ([83c10ae](https://github.com/wooorm/mdast/commit/83c10ae))
*   Add `trimRightLines` function to `lib/utilities.js` ([8699992](https://github.com/wooorm/mdast/commit/8699992))
*   Add `build-usage` task to render `example.js` to `Readme.md` ([9018c02](https://github.com/wooorm/mdast/commit/9018c02))
*   Add `example.js` to lint tasks ([2996cee](https://github.com/wooorm/mdast/commit/2996cee))
*   Add `example.js` ([a9630a1](https://github.com/wooorm/mdast/commit/a9630a1))
*   Remove `requireMultipleVarDecl` rule from `.jscs.json` ([0c3be65](https://github.com/wooorm/mdast/commit/0c3be65))
*   Add `mdast`, `mdast-usage` as dev-dependencies ([0447038](https://github.com/wooorm/mdast/commit/0447038))
*   Fix markdown formatting in `History.md` by using `mdast` ([d56e481](https://github.com/wooorm/mdast/commit/d56e481))
*   Fix markdown formatting in `Readme.md` by using `mdast` ([e56f8ef](https://github.com/wooorm/mdast/commit/e56f8ef))
*   Fix build ([7bc61e3](https://github.com/wooorm/mdast/commit/7bc61e3))

0.1.12 / 2015-01-26
===================

*   Add test for throwing on errors in plug-ins ([160c8d1](https://github.com/wooorm/mdast/commit/160c8d1))
*   Add throwing on errors in plug-ins ([b8fb34f](https://github.com/wooorm/mdast/commit/b8fb34f))
*   Update eslint ([45d874e](https://github.com/wooorm/mdast/commit/45d874e))

0.1.11 / 2015-01-25
===================

*   Remove `backpedal` from `tokenizeBlock` in `lib/parse.js` ([04a7327](https://github.com/wooorm/mdast/commit/04a7327))
*   Merge branch 'feature/simplify-escapes' ([9202130](https://github.com/wooorm/mdast/commit/9202130))
*   Add support for `escape` node ([28f449d](https://github.com/wooorm/mdast/commit/28f449d))
*   Fix fixtures for new escape node ([fb4c1ef](https://github.com/wooorm/mdast/commit/fb4c1ef))
*   Add new `escape` node to `doc/Nodes.md` ([afc1fce](https://github.com/wooorm/mdast/commit/afc1fce))
*   Add test support for new `escape` node ([31bdc03](https://github.com/wooorm/mdast/commit/31bdc03))
*   Add docs for `--output`, `-o` CLI flags to `Readme.md` ([86bccfd](https://github.com/wooorm/mdast/commit/86bccfd))
*   Add `--output`, `-o` CLI flags ([c21a99d](https://github.com/wooorm/mdast/commit/c21a99d))
*   Add tests for `--output` CLI flag ([8f1f3b1](https://github.com/wooorm/mdast/commit/8f1f3b1))
*   Add docs for `mdast.use()` to `Readme.md` ([683adf6](https://github.com/wooorm/mdast/commit/683adf6))
*   Add `build.js` to `.gitignore`, `.npmignore`, `bower.json` ignore ([6ee164d](https://github.com/wooorm/mdast/commit/6ee164d))

0.1.10 / 2015-01-24
===================

*   Update build ([22794c2](https://github.com/wooorm/mdast/commit/22794c2))
*   Merge branch 'bug/fix-linked-image' ([146c5d0](https://github.com/wooorm/mdast/commit/146c5d0))
*   Add fixtures for links, images in links ([cbc572e](https://github.com/wooorm/mdast/commit/cbc572e))
*   Add check to inline tokenizer if a match is eaten ([95a3831](https://github.com/wooorm/mdast/commit/95a3831))
*   Add link check to nested image/links ([19dd972](https://github.com/wooorm/mdast/commit/19dd972))
*   Fix typo in `Readme.md` ([eb7df0b](https://github.com/wooorm/mdast/commit/eb7df0b))

0.1.9 / 2015-01-24
==================

*   Add UMD as an installation method in `Readme.md` ([5aec802](https://github.com/wooorm/mdast/commit/5aec802))
*   Add `index.js`, `lib/` to bower ignore ([82c15ee](https://github.com/wooorm/mdast/commit/82c15ee))
*   Remove bower dependencies due to UMD build ([d2042cf](https://github.com/wooorm/mdast/commit/d2042cf))
*   Add `mdast.js` to bowers `main` instead of `index.js` ([23f2cf4](https://github.com/wooorm/mdast/commit/23f2cf4))
*   Add `mdast.js`, `mdast.min.js` ([47dc79a](https://github.com/wooorm/mdast/commit/47dc79a))
*   Add `mdast.js`, `mdast.min.js` to `.npmignore` ([702a196](https://github.com/wooorm/mdast/commit/702a196))
*   Add `postbuild-bundle` npm script target to compress module ([5036ee5](https://github.com/wooorm/mdast/commit/5036ee5))
*   Add `bundle` npm script target to browserify module ([cf7fb28](https://github.com/wooorm/mdast/commit/cf7fb28))
*   Add esmangle as a dev-dependency ([8d522f8](https://github.com/wooorm/mdast/commit/8d522f8))
*   Add browserify as a dev-dependency ([17f33b2](https://github.com/wooorm/mdast/commit/17f33b2))
*   Fix bug in node@0.10 re require error exit code ([da7590c](https://github.com/wooorm/mdast/commit/da7590c))

0.1.8 / 2015-01-21
==================

*   Add missing `lib/utilities.js` to `component.json` ([b6d3ff7](https://github.com/wooorm/mdast/commit/b6d3ff7))
*   Merge branch 'feature/add-plugin-support' ([e4dc8c3](https://github.com/wooorm/mdast/commit/e4dc8c3))
*   Add assertions for plugins to `test/cli.sh` ([e3486d5](https://github.com/wooorm/mdast/commit/e3486d5))
*   Add failure on invalid plugin to cli ([e15aa0a](https://github.com/wooorm/mdast/commit/e15aa0a))
*   Add assertions for plugins to `test/index.js` ([200872c](https://github.com/wooorm/mdast/commit/200872c))
*   Rename `ware` internally from `parser` to `ware` ([1e9c43f](https://github.com/wooorm/mdast/commit/1e9c43f))
*   Add cli plugin usage to `Readme.md` ([8f3c0ce](https://github.com/wooorm/mdast/commit/8f3c0ce))
*   Add plugin support to cli ([6532998](https://github.com/wooorm/mdast/commit/6532998))
*   Fix plugin implementation ([729796e](https://github.com/wooorm/mdast/commit/729796e))
*   Add example plugin to `test/plugin.js` ([224f59f](https://github.com/wooorm/mdast/commit/224f59f))
*   Add initial draft of plugin implementation ([5b38ca2](https://github.com/wooorm/mdast/commit/5b38ca2))
*   Add ware as a dependency ([5fd5a2b](https://github.com/wooorm/mdast/commit/5fd5a2b))

0.1.7 / 2015-01-20
==================

*   Update copyright notice in `LICENSE` to include 2015 ([a85ad95](https://github.com/wooorm/mdast/commit/a85ad95))
*   Refactor license in `Readme.md` ([bd94033](https://github.com/wooorm/mdast/commit/bd94033))
*   Add link to whole license in `Readme.md` ([1667d67](https://github.com/wooorm/mdast/commit/1667d67))
*   Refactor fences code blocks in `Readme.md` ([4d20047](https://github.com/wooorm/mdast/commit/4d20047))
*   Update npm script targets in `package.json` ([84d33fb](https://github.com/wooorm/mdast/commit/84d33fb))
*   Update eslint ([05ec0e0](https://github.com/wooorm/mdast/commit/05ec0e0))
*   Fix incorrect links in documentation ([668df9e](https://github.com/wooorm/mdast/commit/668df9e))
*   Update `doc/Options.md` with footnote definitions ([da48b7e](https://github.com/wooorm/mdast/commit/da48b7e))
*   Merge branch 'feature/footnote-definition-node' ([9646dc5](https://github.com/wooorm/mdast/commit/9646dc5))
*   Update `lib/stringify.js` to compile footnote definitions ([a14614a](https://github.com/wooorm/mdast/commit/a14614a))
*   Update `lib/parse.js` to expose footnote definitions ([d8aac89](https://github.com/wooorm/mdast/commit/d8aac89))
*   Update `test/index.js` to validate footnote definition ([66392a0](https://github.com/wooorm/mdast/commit/66392a0))
*   Update fixtures for footnote definition ([157f782](https://github.com/wooorm/mdast/commit/157f782))
*   Add docs for footnote definition to `doc/Nodes.md` ([c0b2866](https://github.com/wooorm/mdast/commit/c0b2866))
*   Merge branch 'feature/empty-fenced-code-blocks' ([67e1b49](https://github.com/wooorm/mdast/commit/67e1b49))
*   Add stringification as fenced code blocks when missing value and language ([1afc355](https://github.com/wooorm/mdast/commit/1afc355))
*   Add support for missing `value` in `renderCodeBlock` ([a333b09](https://github.com/wooorm/mdast/commit/a333b09))
*   Fix expression for empty fenced code blocks ([9010b89](https://github.com/wooorm/mdast/commit/9010b89))
*   Add fixtures for empty fences code blocks ([add4e84](https://github.com/wooorm/mdast/commit/add4e84))
*   Add `options.closeAtx` to `Readme.md` ([ad3398e](https://github.com/wooorm/mdast/commit/ad3398e))
*   Merge branch 'feature/stringification/escape-less-dashes' ([6106814](https://github.com/wooorm/mdast/commit/6106814))
*   Remove extraneous escapes on invalid list bullets ([d1f78ee](https://github.com/wooorm/mdast/commit/d1f78ee))
*   Merge branch 'feature/stringification/prefer-closed-atx' ([f0d22d6](https://github.com/wooorm/mdast/commit/f0d22d6))
*   Add docs for `options.closeAtx` ([e6859cb](https://github.com/wooorm/mdast/commit/e6859cb))
*   Add support for `closeAtx` ([8f3fd26](https://github.com/wooorm/mdast/commit/8f3fd26))
*   Add tests for incorrect `closeAtx` options ([92e7d34](https://github.com/wooorm/mdast/commit/92e7d34))
*   Add fixtures for closed ATX styles ([50ed9d6](https://github.com/wooorm/mdast/commit/50ed9d6))

0.1.6 / 2015-01-13
==================

*   Add missing jsdoc comments to `test/index.js` ([a748d14](https://github.com/wooorm/mdast/commit/a748d14))
*   Add custom compiler to `mdast.stringify()` ([85e22a5](https://github.com/wooorm/mdast/commit/85e22a5))
*   Add custom parser to `mdast.parse()` ([c5c6289](https://github.com/wooorm/mdast/commit/c5c6289))
*   Add test for custom compiler to `mdast.stringify()` ([be21cc3](https://github.com/wooorm/mdast/commit/be21cc3))
*   Add test for custom parser to `mdast.parse()` ([38f1f3e](https://github.com/wooorm/mdast/commit/38f1f3e))
*   Add exposure of `Compiler` on `mdast.stringify` ([9ef9390](https://github.com/wooorm/mdast/commit/9ef9390))
*   Add exposure of `Parser` on `mdast.parse` ([f0af4ae](https://github.com/wooorm/mdast/commit/f0af4ae))
*   Merge branch 'feature/add-line-and-column-position' ([556b9d2](https://github.com/wooorm/mdast/commit/556b9d2))
*   Add duo to install methods ([b813f24](https://github.com/wooorm/mdast/commit/b813f24))
*   Add links to install methods to `Readme.md` ([5da914a](https://github.com/wooorm/mdast/commit/5da914a))
*   Add standardised state methods ([8d4db87](https://github.com/wooorm/mdast/commit/8d4db87))
*   Remove description of `gfm` parse option being better at paragraphs ([d40ad60](https://github.com/wooorm/mdast/commit/d40ad60))
*   Add better description to `pedantic` parse option ([8436c3d](https://github.com/wooorm/mdast/commit/8436c3d))
*   Refactor `lib/parse.js` ([9cfe84b](https://github.com/wooorm/mdast/commit/9cfe84b))
*   Refactor `lib/parse.js` to merge `BlockLexer`, `InlineLexer`, `Parser` ([d796675](https://github.com/wooorm/mdast/commit/d796675))
*   Refactor to prepare `Parser` to tokenise with less context ([f4e581e](https://github.com/wooorm/mdast/commit/f4e581e))
*   Refactor to prepare `BlockLexer` to tokenise with less context ([5eb610b](https://github.com/wooorm/mdast/commit/5eb610b))
*   Refactor to construct `InlineLexer` when constructing `Parser` ([c5064cc](https://github.com/wooorm/mdast/commit/c5064cc))
*   Add shared lexer info to new `shared` object in `lib/parse.js` ([8546d30](https://github.com/wooorm/mdast/commit/8546d30))
*   Remove `footnote` property on `root` when `footnotes: false` ([bee0d12](https://github.com/wooorm/mdast/commit/bee0d12))
*   Rename `Lexer` to `BlockLexer` in `lib/parse.js` ([8cf2a7d](https://github.com/wooorm/mdast/commit/8cf2a7d))
*   Remove `Parser.parse` method in `lib/parse.js` ([4e18216](https://github.com/wooorm/mdast/commit/4e18216))
*   Remove `top` parameter for block-level tokenizers ([7cffcda](https://github.com/wooorm/mdast/commit/7cffcda))
*   Add `trimLeft` and `trimRight` to `lib/utilities` ([6d72af3](https://github.com/wooorm/mdast/commit/6d72af3))
*   Refactor `InlineLexer` in `lib/parse.js` ([c9082f1](https://github.com/wooorm/mdast/commit/c9082f1))
*   Refactor Lexer in `lib/parse.js` ([9c10dbc](https://github.com/wooorm/mdast/commit/9c10dbc))
*   Remove `footnote-` prefix from generated footnote IDs ([3139523](https://github.com/wooorm/mdast/commit/3139523))
*   Merge branch 'master' into feature/add-line-and-column-position ([8aa8afc](https://github.com/wooorm/mdast/commit/8aa8afc))
*   Merge branch 'feature/stringification/preferred-code-fence-style' ([36c9885](https://github.com/wooorm/mdast/commit/36c9885))
*   Remove `markdown` language tag from code-fences to fix GitHub ([8a9e73d](https://github.com/wooorm/mdast/commit/8a9e73d))
*   Add example for `options.fence` ([8f00d1b](https://github.com/wooorm/mdast/commit/8f00d1b))
*   Add support for preferred code fence markers ([2090588](https://github.com/wooorm/mdast/commit/2090588))
*   Fix missing comma ([b7b25b3](https://github.com/wooorm/mdast/commit/b7b25b3))
*   Add fixture for code fence markers ([fd4ac34](https://github.com/wooorm/mdast/commit/fd4ac34))
*   Add test for incorrect code fence marker ([7c8d780](https://github.com/wooorm/mdast/commit/7c8d780))
*   Add better handling of incorrect parse options ([91c2a53](https://github.com/wooorm/mdast/commit/91c2a53))
*   Add copy to stringification settings in ([c9ad382](https://github.com/wooorm/mdast/commit/c9ad382))
*   Move `raise` method to `lib/utilities.js` ([65b7832](https://github.com/wooorm/mdast/commit/65b7832))
*   Refactor lots of regular expressions to be simpler
*   Add error when stringifying unknown nodes ([8114e8e](https://github.com/wooorm/mdast/commit/8114e8e))

0.1.5 / 2015-01-01
==================

*   Remove `cli.js` form `.npmignore` ([2660d85](https://github.com/wooorm/mdast/commit/2660d85))
*   Remove options description from `Readme.md` ([6b7ce6b](https://github.com/wooorm/mdast/commit/6b7ce6b))
*   Refactor API in `Readme.md` ([7592c62](https://github.com/wooorm/mdast/commit/7592c62))
*   Add build script to generate `Options.md` ([4ce3d44](https://github.com/wooorm/mdast/commit/4ce3d44))
*   Add `script/` and `doc/` to bower ignore, `.npmignore` ([0fd9da4](https://github.com/wooorm/mdast/commit/0fd9da4))
*   Add `doc/Options.md` ([8375837](https://github.com/wooorm/mdast/commit/8375837))
*   Add missing new-line character in `Readme.md` ([ce34a40](https://github.com/wooorm/mdast/commit/ce34a40))
*   Update CLI usage in `Readme.md` ([fdfbdeb](https://github.com/wooorm/mdast/commit/fdfbdeb))
*   Remove nodes containing information from `Readme.md` ([1234c23](https://github.com/wooorm/mdast/commit/1234c23))
*   Add `doc/Nodes.md` containing refactored AST information ([2240454](https://github.com/wooorm/mdast/commit/2240454))
*   Fix overflowing `logo.svg` ([8f5893a](https://github.com/wooorm/mdast/commit/8f5893a))

0.1.4 / 2014-12-30
==================

*   Update benchmark results in `Readme.md` ([852c1ef](https://github.com/wooorm/mdast/commit/852c1ef))
*   Update stringification options in `Readme.md` to reflect changes in [3f5d136](https://github.com/wooorm/mdast/commit/3f5d136) ([7049bb3](https://github.com/wooorm/mdast/commit/7049bb3))
*   Rename `horizontal-rule` stringification options to `rule` ([da1c223](https://github.com/wooorm/mdast/commit/da1c223))
*   Rename `setext-headings` stringification option to `setext` ([3f5d136](https://github.com/wooorm/mdast/commit/3f5d136))
*   Remove `prefer` before several stirngification options ([17b2668](https://github.com/wooorm/mdast/commit/17b2668))
*   Remove multiple new lines from CLI by using stdout(4) instead of console ([c8a6a39](https://github.com/wooorm/mdast/commit/c8a6a39))
*   Remove multiple new lines after the stringified AST ([b1aaabd](https://github.com/wooorm/mdast/commit/b1aaabd))
*   Fix bug in CLI with exit code when provided with invalid file path ([bea737e](https://github.com/wooorm/mdast/commit/bea737e))
*   Add mention of same file input output to `cli.js` ([6b8aee0](https://github.com/wooorm/mdast/commit/6b8aee0))
*   Update code example in `Readme.md` to reflect changes in [a1a5a09](https://github.com/wooorm/mdast/commit/a1a5a09) ([b3ea773](https://github.com/wooorm/mdast/commit/b3ea773))
*   Fix bug in longest-repetition at end of input ([9da5536](https://github.com/wooorm/mdast/commit/9da5536))
*   Merge branch 'feature/add-cli' ([5aa392a](https://github.com/wooorm/mdast/commit/5aa392a))
*   Add CLI useage to `Readme.md` ([2a261b5](https://github.com/wooorm/mdast/commit/2a261b5))
*   Fix typo in CLIs options ([2201691](https://github.com/wooorm/mdast/commit/2201691))
*   Fix typo in package description ([de94a32](https://github.com/wooorm/mdast/commit/de94a32))
*   Add test for missing input to `test/cli.sh` ([8e88164](https://github.com/wooorm/mdast/commit/8e88164))
*   Remove commented tests in `test/cli.sh` ([e2579b6](https://github.com/wooorm/mdast/commit/e2579b6))
*   Fix comment in CLIs help ([a7ef1f3](https://github.com/wooorm/mdast/commit/a7ef1f3))
*   Add `test-cli` npm script target to `package.json` ([13807c4](https://github.com/wooorm/mdast/commit/13807c4))
*   Add `test/cli.sh` ([d55c001](https://github.com/wooorm/mdast/commit/d55c001))
*   Add `lint-cli` npm script target to `package.json` ([ec682f1](https://github.com/wooorm/mdast/commit/ec682f1))
*   Add CLI ([301d834](https://github.com/wooorm/mdast/commit/301d834))
*   Add `cli.js` ([d788807](https://github.com/wooorm/mdast/commit/d788807))
*   Add `cli`, `bin` to package keywords ([7dc0dbf](https://github.com/wooorm/mdast/commit/7dc0dbf))

0.1.3 / 2014-12-28
==================

*   Merge branch 'feature/stringification/preferred-code-block-style' ([cde17e9](https://github.com/wooorm/mdast/commit/cde17e9))
*   Add documentation for preferred code block-style ([3a0b498](https://github.com/wooorm/mdast/commit/3a0b498))
*   Add support for preferred code block-style ([2d9efe0](https://github.com/wooorm/mdast/commit/2d9efe0))
*   Add tests for incorrect code block-style options ([7ae7635](https://github.com/wooorm/mdast/commit/7ae7635))
*   Add fixtures preferred code block-style ([b7ad069](https://github.com/wooorm/mdast/commit/b7ad069))
*   Merge branch 'feature/stringification/preferred-footnote-style' ([337b7d0](https://github.com/wooorm/mdast/commit/337b7d0))
*   Add documentation for stringification with reference footnote options ([f30b5d9](https://github.com/wooorm/mdast/commit/f30b5d9))
*   Add support for stringification with reference footnote options ([0a56d54](https://github.com/wooorm/mdast/commit/0a56d54))
*   Move internal copy method over to `lib/utilities.js` ([2a2256c](https://github.com/wooorm/mdast/commit/2a2256c))
*   Add tests for incorrect reference footnote options ([feb3051](https://github.com/wooorm/mdast/commit/feb3051))
*   Add fixtures for stringification of inline- and reference-style footnotes ([320d027](https://github.com/wooorm/mdast/commit/320d027))
*   Merge branch 'bug/parse/formatting-in-nested-footnotes' ([373ff32](https://github.com/wooorm/mdast/commit/373ff32))
*   Fix a bug when nested footnotes contain formatting ([814ad3d](https://github.com/wooorm/mdast/commit/814ad3d))
*   Merge branch 'bug/parse/fix-generating-unique-footnote-ids' ([5067adf](https://github.com/wooorm/mdast/commit/5067adf))
*   Fix a bug when generating footnote ids ([2f33abe](https://github.com/wooorm/mdast/commit/2f33abe))
*   Merge branch 'feature/stringification/preferred-link-style' ([6d2214a](https://github.com/wooorm/mdast/commit/6d2214a))
*   Add documentation for stringification with reference link options ([d601f5c](https://github.com/wooorm/mdast/commit/d601f5c))
*   Add support for stringification with reference link options ([2d36069](https://github.com/wooorm/mdast/commit/2d36069))
*   Add tests for incorrect setext header options ([d06b77c](https://github.com/wooorm/mdast/commit/d06b77c))
*   Add tests for incorrect reference link options ([9b74973](https://github.com/wooorm/mdast/commit/9b74973))
*   Add fixtures for stringification of inline- and reference-style links ([e68ac89](https://github.com/wooorm/mdast/commit/e68ac89))
*   Merge branch 'feature/stringification/less-escaped-characters' ([c72bdd0](https://github.com/wooorm/mdast/commit/c72bdd0))
*   Remove escape from exclamation-marks ([1d09c86](https://github.com/wooorm/mdast/commit/1d09c86))
*   Remove escape from dots when not preceded by a digit ([e82f1b0](https://github.com/wooorm/mdast/commit/e82f1b0))
*   Remove superfluous escaped full-stops from fixtures ([a1a5a09](https://github.com/wooorm/mdast/commit/a1a5a09))
*   Update jscs-jsdoc ([bb01118](https://github.com/wooorm/mdast/commit/bb01118))

0.1.2 / 2014-12-26
==================

*   Merge branch 'feature/stringification/emphasis-and-strong' ([c6b5025](https://github.com/wooorm/mdast/commit/c6b5025))
*   Add support for stringification with emphasis options ([b7fd038](https://github.com/wooorm/mdast/commit/b7fd038))
*   Add support for stringification with emphasis options ([7dfd330](https://github.com/wooorm/mdast/commit/7dfd330))
*   Add tests for incorrect emphasis options ([8d0e3ab](https://github.com/wooorm/mdast/commit/8d0e3ab))
*   Add fixtures for setting strong and emphasis style ([ad0c6e2](https://github.com/wooorm/mdast/commit/ad0c6e2))
*   Refactor table-stringification ([9314048](https://github.com/wooorm/mdast/commit/9314048))
*   Merge branch 'feature/add-prefered-horizontal-rule-stringification' ([da69db1](https://github.com/wooorm/mdast/commit/da69db1))
*   Add docs for `options.horizontalRule` to `Readme.md` ([7f2fbf8](https://github.com/wooorm/mdast/commit/7f2fbf8))
*   Add support for stringification with horizontal-rule options ([dbbf839](https://github.com/wooorm/mdast/commit/dbbf839))
*   Add tests for incorrect horizontal-rule options ([439d050](https://github.com/wooorm/mdast/commit/439d050))
*   Add fixtures for setting horizontal-rule styles ([c57247b](https://github.com/wooorm/mdast/commit/c57247b))
*   Merge branch 'feature/add-prefered-bullet-stringification' ([6faf93a](https://github.com/wooorm/mdast/commit/6faf93a))
*   Add docs for `options.button` to `Readme.md` ([43846a5](https://github.com/wooorm/mdast/commit/43846a5))
*   Add test for stringification with invalid bullet option ([0045306](https://github.com/wooorm/mdast/commit/0045306))
*   Add support for stringification with bullet options for unordered lists ([bb6b4bd](https://github.com/wooorm/mdast/commit/bb6b4bd))
*   Add fixtures for setting bullets for unordered lists ([a3a8566](https://github.com/wooorm/mdast/commit/a3a8566))
*   Add support for testing fixtures with options ([2196690](https://github.com/wooorm/mdast/commit/2196690))

0.1.1 / 2014-12-25
==================

*   Fix incorrect IDL in `Readme.md` ([2cf8fd4](https://github.com/wooorm/mdast/commit/2cf8fd4))
*   Fix incorrect link in `Readme.md` ([8c052c0](https://github.com/wooorm/mdast/commit/8c052c0))
*   Add proper `parse`, `stringify` docs to `Readme.md` ([7c1a9a5](https://github.com/wooorm/mdast/commit/7c1a9a5))
*   Add useage example for setext-heading stringification to docs ([f10e0b9](https://github.com/wooorm/mdast/commit/f10e0b9))
*   Add support for stringification to setex-style headings ([eae5300](https://github.com/wooorm/mdast/commit/eae5300))
*   Add fixtures for setex style headings ([835b31b](https://github.com/wooorm/mdast/commit/835b31b))
*   Add support for testing stringified output ([365a4bc](https://github.com/wooorm/mdast/commit/365a4bc))
*   Add stringification of final new-line ([bfceec8](https://github.com/wooorm/mdast/commit/bfceec8))
*   Remove stringification of superfluous new-lines ([7267bbd](https://github.com/wooorm/mdast/commit/7267bbd))
*   Refactor `lib/parse.js` to cache expressions ([b986fe2](https://github.com/wooorm/mdast/commit/b986fe2))
*   Refactor `test/index.js` to use constants ([deb8328](https://github.com/wooorm/mdast/commit/deb8328))
*   Refactor `lib/stringify.js` to use constants ([2699e17](https://github.com/wooorm/mdast/commit/2699e17))
*   Refactor `lib/parse.js` to use constants ([ecb9248](https://github.com/wooorm/mdast/commit/ecb9248))
*   Refactor to adhere to strict jsdoc style ([8db0db8](https://github.com/wooorm/mdast/commit/8db0db8))
*   Add jscs-jsdoc configuration to `.jscs.json` ([7fc2a99](https://github.com/wooorm/mdast/commit/7fc2a99))
*   Add jscs-jsdoc as a dev-dependency ([cf51e63](https://github.com/wooorm/mdast/commit/cf51e63))
*   Refactor npm scripts for changes in npm ([d2da45d](https://github.com/wooorm/mdast/commit/d2da45d))
*   Update markdown-table ([d7c4332](https://github.com/wooorm/mdast/commit/d7c4332))

0.1.0 / 2014-12-11
==================

*   Refactor `benchmark.js` ([5e292b4](https://github.com/wooorm/mdast/commit/5e292b4))
*   Update keywords, description in `package.json`, `component.json`, `bower.json` ([0ddb468](https://github.com/wooorm/mdast/commit/0ddb468))
*   Refactor `Readme.md` ([c0a5e0f](https://github.com/wooorm/mdast/commit/c0a5e0f))
*   Add badges for travis, coveralls to `Readme.md` ([2ed78e4](https://github.com/wooorm/mdast/commit/2ed78e4))
*   Add `logo.svg` ([0ef2ddb](https://github.com/wooorm/mdast/commit/0ef2ddb))
*   Add missing `new` operator to `lib/stringify.js` ([d34d099](https://github.com/wooorm/mdast/commit/d34d099))
*   Fix malformed `bower.json` ([5f25ad6](https://github.com/wooorm/mdast/commit/5f25ad6))
*   Fix incorrect script reference in `component.json` ([b4e5995](https://github.com/wooorm/mdast/commit/b4e5995))
*   Add strict mode to `index.js` ([7df8c8a](https://github.com/wooorm/mdast/commit/7df8c8a))
*   Refactor `bower.json` ([2d71079](https://github.com/wooorm/mdast/commit/2d71079))
*   Move `lib/stringify/index.js` to `lib/stringify.js` ([a554432](https://github.com/wooorm/mdast/commit/a554432))
*   Move `lib/parse/index.js` to `lib/parse.js` ([54fc3ac](https://github.com/wooorm/mdast/commit/54fc3ac))
*   Add npm deployment to `.travis.yml` ([35d2315](https://github.com/wooorm/mdast/commit/35d2315))
*   Remove `before_install` script in `.travis.yml` ([8969054](https://github.com/wooorm/mdast/commit/8969054))
*   Remove `Makefile` ([79b6908](https://github.com/wooorm/mdast/commit/79b6908))
*   Refactor `.npmignore` ([b3d6606](https://github.com/wooorm/mdast/commit/b3d6606))
*   Refactor `.gitignore` ([c38fe50](https://github.com/wooorm/mdast/commit/c38fe50))
*   Add broader version ranges to `package.json` ([ebb59d6](https://github.com/wooorm/mdast/commit/ebb59d6))
*   Update eslint ([fa518e6](https://github.com/wooorm/mdast/commit/fa518e6))
*   Update matcha ([b4092a7](https://github.com/wooorm/mdast/commit/b4092a7))
*   Update mocha ([c551efa](https://github.com/wooorm/mdast/commit/c551efa))
*   Refactor npm scripts in `package.json` ([8e48c03](https://github.com/wooorm/mdast/commit/8e48c03))
*   Move `test/mdast.spec.js` to `test/index.js` ([5b1e18d](https://github.com/wooorm/mdast/commit/5b1e18d))
*   Move `spec/` to `test/` ([8e34272](https://github.com/wooorm/mdast/commit/8e34272))
*   Move `benchmark/index.js` to `benchmark.js` ([1bba064](https://github.com/wooorm/mdast/commit/1bba064))
*   Refactor to disallow spaces after object keys ([a29d222](https://github.com/wooorm/mdast/commit/a29d222))
*   Add `.eslintrc` ([18a0343](https://github.com/wooorm/mdast/commit/18a0343))
*   Fix spacing around inline-code containing backticks ([a5d617f](https://github.com/wooorm/mdast/commit/a5d617f))
*   Refactor to simplify `spec/mdast.spec.js` ([6cc8d23](https://github.com/wooorm/mdast/commit/6cc8d23))
*   Add benchmark for `mdast.stringify` ([8c911ef](https://github.com/wooorm/mdast/commit/8c911ef))
*   Merge branch 'bug/fix-links' ([8db4a26](https://github.com/wooorm/mdast/commit/8db4a26))
*   Remove failing fixtures ([a2c5ce5](https://github.com/wooorm/mdast/commit/a2c5ce5))

0.1.0-rc.2 / 2014-12-10
=======================

*   Add block-level nodes to every list-item ([ab376d7](https://github.com/wooorm/mdast/commit/ab376d7))

0.1.0-rc.1 / 2014-12-07
=======================

*   Add near-finished stringifier ([260ca45](https://github.com/wooorm/mdast/commit/260ca45))
*   Fix test for changes in inline-code/code ([9f9a0bd](https://github.com/wooorm/mdast/commit/9f9a0bd))
*   Fix loose list-items by adding paragraph-nodes where needed ([ff604ee](https://github.com/wooorm/mdast/commit/ff604ee))
*   Fix multiple direct sibling blockquotes from appearing ([2a9462d](https://github.com/wooorm/mdast/commit/2a9462d))
*   Fix `undefined` in strings when using line-breaks inside list-items ([add8de0](https://github.com/wooorm/mdast/commit/add8de0))
*   Add inline-code node for code-spans ([a4a9abb](https://github.com/wooorm/mdast/commit/a4a9abb))
*   Remove null-type for table alignment ([743ac9f](https://github.com/wooorm/mdast/commit/743ac9f))
*   Add better errors for fixtures in spec ([a01ad74](https://github.com/wooorm/mdast/commit/a01ad74))
*   Add white-space trimming to code-blocks ([258a5cc](https://github.com/wooorm/mdast/commit/258a5cc))
*   Refactor position of `title` attribute in parse-output ([9d2aa88](https://github.com/wooorm/mdast/commit/9d2aa88))
*   Add `he` to API to decode HTML entities in `text` ([f0a8843](https://github.com/wooorm/mdast/commit/f0a8843))
*   Fix style issues in API ([bb7ab06](https://github.com/wooorm/mdast/commit/bb7ab06))
*   Update copyright in Readme.md ([94d5279](https://github.com/wooorm/mdast/commit/94d5279))
*   Remove testling ([45a2457](https://github.com/wooorm/mdast/commit/45a2457))
*   Refactor property order in bower.json, package.json, component.json ([eda2b4e](https://github.com/wooorm/mdast/commit/eda2b4e))
*   Update .gitignore, .npmignore ([295a784](https://github.com/wooorm/mdast/commit/295a784))
*   Add `he` as a dependency ([fa1686b](https://github.com/wooorm/mdast/commit/fa1686b))
*   Update eslint, jscs, mocha ([ca17296](https://github.com/wooorm/mdast/commit/ca17296))
*   Fix incorrect repo url ([082c6d1](https://github.com/wooorm/mdast/commit/082c6d1))
*   Refactor table output ([d09da47](https://github.com/wooorm/mdast/commit/d09da47))
*   Add initial work for both parse and stringify functionality ([20dedde](https://github.com/wooorm/mdast/commit/20dedde))
*   Refactor inline lexer ([d32fce5](https://github.com/wooorm/mdast/commit/d32fce5))
*   Add missing continue statement ([ae506ec](https://github.com/wooorm/mdast/commit/ae506ec))
*   Remove extraneous rule in eslint target ([68e725f](https://github.com/wooorm/mdast/commit/68e725f))
*   Refactor outputting similar nodes ([1266d71](https://github.com/wooorm/mdast/commit/1266d71))
*   Remove conditional assignment ([b1cbadc](https://github.com/wooorm/mdast/commit/b1cbadc))
*   Add benchmark to docs ([5170d2f](https://github.com/wooorm/mdast/commit/5170d2f))
*   Add a faster option setting mechanism ([7012903](https://github.com/wooorm/mdast/commit/7012903))
*   Add a simpler regular expression builder ([74b17cf](https://github.com/wooorm/mdast/commit/74b17cf))
*   Remove unneeded noop ([59eb0c5](https://github.com/wooorm/mdast/commit/59eb0c5))

0.0.3 / 2014-08-02
==================

*   Add documentation for settings ([200c12d](https://github.com/wooorm/mdast/commit/200c12d))
*   Fix option mechanism so different settings can work together ([ccbd4d9](https://github.com/wooorm/mdast/commit/ccbd4d9))
*   Add functionality to merge HTML nodes ([a8de527](https://github.com/wooorm/mdast/commit/a8de527))
*   Fix mailto removal in implicit links ([56cf803](https://github.com/wooorm/mdast/commit/56cf803))
*   Add more verbose comments ([2bbcd9d](https://github.com/wooorm/mdast/commit/2bbcd9d))
*   Fix typo in docs ([4bcb0e6](https://github.com/wooorm/mdast/commit/4bcb0e6))

0.0.2 / 2014-07-31
==================

*   Add docs for nodes ([7ca9bf6](https://github.com/wooorm/mdast/commit/7ca9bf6))
*   Rename cells > rows for tables ([3b6ec59](https://github.com/wooorm/mdast/commit/3b6ec59))
*   Fix a typo where images had an "href" attribute instead of "src" ([6413123](https://github.com/wooorm/mdast/commit/6413123))
*   Fix a bug where an internal type ([looseItem](https://github.com/wooorm/mdast/commit/looseItem) was exposed ([bd528d3](https://github.com/wooorm/mdast/commit/bd528d3))
*   Fix documentation for [b7b5b44](https://github.com/wooorm/mdast/commit/b7b5b44) ([15d1e5c](https://github.com/wooorm/mdast/commit/15d1e5c))
*   Refactored API so results are wrapped in a root token, resulting in easier footnote finding ([b7b5b44](https://github.com/wooorm/mdast/commit/b7b5b44))
*   Fininshed renaming: marked > mdast ([cbadc46](https://github.com/wooorm/mdast/commit/cbadc46))
*   Added initial functionality for footnotes ([feb9f52](https://github.com/wooorm/mdast/commit/feb9f52))
*   Fix a bug where multiple text tokens were not merged ([bcbefb8](https://github.com/wooorm/mdast/commit/bcbefb8))
*   Refactor fixture-loading mechanism ([a305087](https://github.com/wooorm/mdast/commit/a305087))
*   Refactored readme ([2cef93f](https://github.com/wooorm/mdast/commit/2cef93f))
*   Renamed README > Readme ([38aa366](https://github.com/wooorm/mdast/commit/38aa366))
*   Removed build.js ([8cf2070](https://github.com/wooorm/mdast/commit/8cf2070))
*   Added changelog ([84b17b9](https://github.com/wooorm/mdast/commit/84b17b9))
*   Update travis ([f87d151](https://github.com/wooorm/mdast/commit/f87d151))
*   Refactor bower.json ([a018d93](https://github.com/wooorm/mdast/commit/a018d93))
*   Refactor component.json ([410868f](https://github.com/wooorm/mdast/commit/410868f))
*   Added testling ([05ef1f3](https://github.com/wooorm/mdast/commit/05ef1f3))
*   Update mocha ([551766e](https://github.com/wooorm/mdast/commit/551766e))
*   Refactored package.json ([a921818](https://github.com/wooorm/mdast/commit/a921818))
*   Removed robotskirt, showdown, markdown ([8f7a14b](https://github.com/wooorm/mdast/commit/8f7a14b))
*   Added benchmark ([efa5710](https://github.com/wooorm/mdast/commit/efa5710))
*   Fixed npm script targets; initial benchmark ([e470335](https://github.com/wooorm/mdast/commit/e470335))
*   Removed bin, doc, man ([91a161c](https://github.com/wooorm/mdast/commit/91a161c))
*   Renamed lib/mdast.js > index.js ([3b7c751](https://github.com/wooorm/mdast/commit/3b7c751))
*   Removed marked tests ([41c97d7](https://github.com/wooorm/mdast/commit/41c97d7))
*   Added more istanbul ignore comments for error reporting code ([e7ca49b](https://github.com/wooorm/mdast/commit/e7ca49b))
*   Added a unit test for images with empty alt attributes ([f6358a8](https://github.com/wooorm/mdast/commit/f6358a8))
*   Made token types and variables more verbose ([211695b](https://github.com/wooorm/mdast/commit/211695b))
*   Inlined peek in api ([9082a7a](https://github.com/wooorm/mdast/commit/9082a7a))
*   Added unit tests for automatic email detection ([652d059](https://github.com/wooorm/mdast/commit/652d059))
*   Added two istanbul ignore comments for error reporting code ([300c411](https://github.com/wooorm/mdast/commit/300c411))
*   Removed an extraneous debug message, removed a dead statement ([f0b54d5](https://github.com/wooorm/mdast/commit/f0b54d5))
*   Fixed an istanbul-ignore comment ([9839346](https://github.com/wooorm/mdast/commit/9839346))
*   Added unit tests for pedantic list items (stricter definition) ([1cd72d4](https://github.com/wooorm/mdast/commit/1cd72d4))
*   Added unit tests for pedantic code blocks (persistant trailing whitespace) ([4fa9d8a](https://github.com/wooorm/mdast/commit/4fa9d8a))
*   Added a unit test for images with a title ([d6c24cd](https://github.com/wooorm/mdast/commit/d6c24cd))
*   Removed two uncovered branches from spec ([ed66d62](https://github.com/wooorm/mdast/commit/ed66d62))
*   Added inline pedantic fixtures ([4e9362d](https://github.com/wooorm/mdast/commit/4e9362d))
*   Removed functionality to exposing inline lexer ([17cd6be](https://github.com/wooorm/mdast/commit/17cd6be))
*   removed smartLists options and moved it to pedantic; added fixtures ([866fd20](https://github.com/wooorm/mdast/commit/866fd20))
*   Added a tables:false fixture ([90ab051](https://github.com/wooorm/mdast/commit/90ab051))
*   Added functionality to use options through fixture filenames ([0343bcc](https://github.com/wooorm/mdast/commit/0343bcc))
*   Refactored merge; added istanbul ignore coverage comments ([1b7967e](https://github.com/wooorm/mdast/commit/1b7967e))
*   Add unit test linting; add coverage ([66dd3dc](https://github.com/wooorm/mdast/commit/66dd3dc))
*   Fixed style ([e3f2857](https://github.com/wooorm/mdast/commit/e3f2857))
*   Refactor; things are working ([ae5dc9e](https://github.com/wooorm/mdast/commit/ae5dc9e))
*   Major refactor, JSON is now given instead of HTML ([24f7d44](https://github.com/wooorm/mdast/commit/24f7d44))
*   Refactored .jscs.json to indent with 2 instead of four spaces ([409758d](https://github.com/wooorm/mdast/commit/409758d))
*   Add myself as a copyright holder to LICENSE ([237d979](https://github.com/wooorm/mdast/commit/237d979))
*   Refactor for mdast ([19585b8](https://github.com/wooorm/mdast/commit/19585b8))

Forked from [marked](https://github.com/chjj/marked).
