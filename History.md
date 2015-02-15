
0.4.0 / 2015-02-15
==================

  * Refactor module to use more constants instead of literal strings
  * Remove ensured new line at end of file
  * Refactor istanbul ignore, error message
  * Remove support for `referenceFootnotes: false`
  * Add `lib/expressions.js` with precompiled expressions
  * Refactor module
  * Add support for escaped pipes in table cells
  * Fix bug in node@0.10 re invalid error exit code

0.3.0 / 2015-02-08
==================

  * Add man docs for mdast(1)
  * Refactor cli to use commander
  * Refactor to simplify options validation
  * Add support for YAML front matter
  * Update mdast, eslint as dev-dependencies
  * Replace file name underscores with dashes in `test/`
  * Fix option casing in `cli.js`
  * Merge branch 'feature/stringification/prefer-spaced-tables'
  * Add docs for `options.spacedTable`
  * Add support for `spacedTable`
  * Add tests for incorrect `spacedTable` option
  * Add fixtures for spaced table style
  * Merge branch 'feature/stringification/prefer-loose-tables'
  * Add docs for `options.looseTable`
  * Add support for `looseTable`
  * Add tests for incorrect `looseTable` option
  * Add fixtures for loose table style
  * Add auto inferring of input file if an output file is provided
  * Add `fence` parse option to `Readme.md`
  * Add `example.js` to `.npmignore`, `bower.json` ignore

0.2.0 / 2015-02-02
==================

* Fix `mdast.js`
* Merge branch 'feature/add-line-and-column-position'
* Add `position` objects to nodes
* Add `trimRightLines` function to `lib/utilities.js`
* Add `build-usage` task to render `example.js` to `Readme.md`
* Add `example.js` to lint tasks
* Add `example.js`
* Remove `requireMultipleVarDecl` rule from `.jscs.json`
* Add `mdast`, `mdast-usage` as dev-dependencies
* Fix markdown formatting in `History.md` by using `mdast`
* Fix markdown formatting in `Readme.md` by using `mdast`
* Fix build

0.1.12 / 2015-01-26
===================

* Add test for throwing on errors in plug-ins
* Add throwing on errors in plug-ins
* Update eslint

0.1.11 / 2015-01-25
===================

* Remove `backpedal` from `tokenizeBlock` in `lib/parse.js`
* Merge branch 'feature/simplify-escapes'
* Add support for `escape` node
* Fix fixtures for new escape node
* Add new `escape` node to `doc/Nodes.md`
* Add test support for new `escape` node
* Add docs for `--output`, `-o` CLI flags to `Readme.md`
* Add `--output`, `-o` CLI flags
* Add tests for `--output` CLI flag
* Add docs for `mdast.use()` to `Readme.md`
* Add `build.js` to `.gitignore`, `.npmignore`, `bower.json` ignore

0.1.10 / 2015-01-24
===================

* Update build
* Merge branch 'bug/fix-linked-image'
* Add fixtures for links, images in links
* Add check to inline tokenizer if a match is eaten
* Add link check to nested image/links
* Fix typo in `Readme.md`

0.1.9 / 2015-01-24
==================

* Add UMD as an installation method in `Readme.md`
* Add `index.js`, `lib/` to bower ignore
* Remove bower dependencies due to UMD build
* Add `mdast.js` to bowers `main` instead of `index.js`
* Add `mdast.js`, `mdast.min.js`
* Add `mdast.js`, `mdast.min.js` to `.npmignore`
* Add `postbuild-bundle` npm script target to compress module
* Add `bundle` npm script target to browserify module
* Add esmangle as a dev-dependency
* Add browserify as a dev-dependency
* Fix bug in node@0.10 re require error exit code

0.1.8 / 2015-01-21
==================

* Add missing `lib/utilities.js` to `component.json`
* Merge branch 'feature/add-plugin-support'
* Add assertions for plugins to `test/cli.sh`
* Add failure on invalid plugin to cli
* Add assertions for plugins to `test/index.js`
* Rename `ware` internally from `parser` to `ware`
* Add cli plugin usage to `Readme.md`
* Add plugin support to cli
* Fix plugin implementation
* Add example plugin to `test/plugin.js`
* Add initial draft of plugin implementation
* Add ware as a dependency

0.1.7 / 2015-01-20
==================

* Update copyright notice in `LICENSE` to include 2015
* Refactor license in `Readme.md`
* Add link to whole license in `Readme.md`
* Refactor fences code blocks in `Readme.md`
* Update npm script targets in `package.json`
* Update eslint
* Fix incorrect links in documentation
* Update `doc/Options.md` with footnote definitions
* Merge branch 'feature/footnote-definition-node'
* Update `lib/stringify.js` to compile footnote definitions
* Update `lib/parse.js` to expose footnote definitions
* Update `test/index.js` to validate footnote definition
* Update fixtures for footnote definition
* Add docs for footnote definition to `doc/Nodes.md`
* Merge branch 'feature/empty-fenced-code-blocks'
* Add stringification as fenced code blocks when missing value and language
* Add support for missing `value` in `renderCodeBlock`
* Fix expression for empty fenced code blocks
* Add fixtures for empty fences code blocks
* Add `options.closeAtx` to `Readme.md`
* Merge branch 'feature/stringification/escape-less-dashes'
* Remove extraneous escapes on invalid list bullets
* Merge branch 'feature/stringification/prefer-closed-atx'
* Add docs for `options.closeAtx`
* Add support for `closeAtx`
* Add tests for incorrect `closeAtx` options
* Add fixtures for closed ATX styles

0.1.6 / 2015-01-13
==================

* Add missing jsdoc comments to `test/index.js`
* Add custom compiler to `mdast.stringify()`
* Add custom parser to `mdast.parse()`
* Add test for custom compiler to `mdast.stringify()`
* Add test for custom parser to `mdast.parse()`
* Add exposure of `Compiler` on `mdast.stringify`
* Add exposure of `Parser` on `mdast.parse`
* Merge branch 'feature/add-line-and-column-position'
* Add duo to install methods
* Add links to install methods to `Readme.md`
* Add standardised state methods
* Remove description of `gfm` parse option being better at paragraphs
* Add better description to `pedantic` parse option
* Refactor `lib/parse.js`
* Refactor `lib/parse.js` to merge `BlockLexer`, `InlineLexer`, `Parser`
* Refactor to prepare `Parser` to tokenise with less context
* Refactor to prepare `BlockLexer` to tokenise with less context
* Refactor to construct `InlineLexer` when constructing `Parser`
* Add shared lexer info to new `shared` object in `lib/parse.js`
* Remove `footnote` property on `root` when `footnotes: false`
* Rename `Lexer` to `BlockLexer` in `lib/parse.js`
* Remove `Parser.parse` method in `lib/parse.js`
* Remove `top` parameter for block-level tokenizers
* Add `trimLeft` and `trimRight` to `lib/utilities`
* Refactor `InlineLexer` in `lib/parse.js`
* Refactor Lexer in `lib/parse.js`
* Remove `footnote-` prefix from generated footnote IDs
* Merge branch 'master' into feature/add-line-and-column-position
* Merge branch 'feature/stringification/preferred-code-fence-style'
* Remove `markdown` language tag from code-fences to fix GitHub
* Add example for `options.fence`
* Add support for preferred code fence markers
* Fix missing comma
* Add fixture for code fence markers
* Add test for incorrect code fence marker
* Add better handling of incorrect parse options
* Add copy to stringification settings in
* Move `raise` method to `lib/utilities.js`
* Refactor lots of regular expressions to be simpler
* Add error when stringifying unknown nodes

0.1.5 / 2015-01-01
==================

* Remove `cli.js` form `.npmignore`
* Remove options description from `Readme.md`
* Refactor API in `Readme.md`
* Add build script to generate `Options.md`
* Add `script/` and `doc/` to bower ignore, `.npmignore`
* Add `doc/Options.md`
* Add missing new-line character in `Readme.md`
* Update CLI usage in `Readme.md`
* Remove nodes containing information from `Readme.md`
* Add `doc/Nodes.md` containing refactored AST information
* Fix overflowing `logo.svg`

0.1.4 / 2014-12-30
==================

* Update benchmark results in `Readme.md`
* Update stringification options in `Readme.md` to reflect changes in 3f5d136
* Rename `horizontal-rule` stringification options to `rule`
* Rename `setext-headings` stringification option to `setext`
* Remove `prefer` before several stirngification options
* Remove multiple new lines from CLI by using stdout instead of console
* Remove multiple new lines after the stringified AST
* Fix bug in CLI with exit code when provided with invalid file path
* Add mention of same file input output to `cli.js`
* Update code example in `Readme.md` to reflect changes in a1a5a09
* Fix bug in longest-repetition at end of input
* Merge branch 'feature/add-cli'
* Add CLI useage to `Readme.md`
* Fix typo in CLIs options
* Fix typo in package description
* Add test for missing input to `test/cli.sh`
* Remove commented tests in `test/cli.sh`
* Fix comment in CLIs help
* Add `test-cli` npm script target to `package.json`
* Add `test/cli.sh`
* Add `lint-cli` npm script target to `package.json`
* Add CLI
* Add `cli.js`
* Add `cli`, `bin` to package keywords

0.1.3 / 2014-12-28
==================

* Merge branch 'feature/stringification/preferred-code-block-style'
* Add documentation for preferred code block-style
* Add support for preferred code block-style
* Add tests for incorrect code block-style options
* Add fixtures preferred code block-style
* Merge branch 'feature/stringification/preferred-footnote-style'
* Add documentation for stringification with reference footnote options
* Add support for stringification with reference footnote options
* Move internal copy method over to `lib/utilities.js`
* Add tests for incorrect reference footnote options
* Add fixtures for stringification of inline- and reference-style footnotes
* Merge branch 'bug/parse/formatting-in-nested-footnotes'
* Fix a bug when nested footnotes contain formatting
* Merge branch 'bug/parse/fix-generating-unique-footnote-ids'
* Fix a bug when generating footnote ids
* Merge branch 'feature/stringification/preferred-link-style'
* Add documentation for stringification with reference link options
* Add support for stringification with reference link options
* Add tests for incorrect setext header options
* Add tests for incorrect reference link options
* Add fixtures for stringification of inline- and reference-style links
* Merge branch 'feature/stringification/less-escaped-characters'
* Remove escape from exclamation-marks
* Remove escape from dots when not preceded by a digit
* Remove superfluous escaped full-stops from fixtures
* Update jscs-jsdoc

0.1.2 / 2014-12-26
==================

* Merge branch 'feature/stringification/emphasis-and-strong'
* Add support for stringification with emphasis options
* Add support for stringification with emphasis options
* Add tests for incorrect emphasis options
* Add fixtures for setting strong and emphasis style
* Refactor table-stringification
* Merge branch 'feature/add-prefered-horizontal-rule-stringification'
* Add docs for `options.horizontalRule` to `Readme.md`
* Add support for stringification with horizontal-rule options
* Add tests for incorrect horizontal-rule options
* Add fixtures for setting horizontal-rule styles
* Merge branch 'feature/add-prefered-bullet-stringification'
* Add docs for `options.button` to `Readme.md`
* Add test for stringification with invalid bullet option
* Add support for stringification with bullet options for unordered lists
* Add fixtures for setting bullets for unordered lists
* Add support for testing fixtures with options

0.1.1 / 2014-12-25
==================

* Fix incorrect IDL in `Readme.md`
* Fix incorrect link in `Readme.md`
* Add proper `parse`, `stringify` docs to `Readme.md`
* Add useage example for setext-heading stringification to docs
* Add support for stringification to setex-style headings
* Add fixtures for setex style headings
* Add support for testing stringified output
* Add stringification of final new-line
* Remove stringification of superfluous new-lines
* Refactor `lib/parse.js` to cache expressions
* Refactor `test/index.js` to use constants
* Refactor `lib/stringify.js` to use constants
* Refactor `lib/parse.js` to use constants
* Refactor to adhere to strict jsdoc style
* Add jscs-jsdoc configuration to `.jscs.json`
* Add jscs-jsdoc as a dev-dependency
* Refactor npm scripts for changes in npm
* Update markdown-table

0.1.0 / 2014-12-11
==================

* Refactor `benchmark.js`
* Update keywords, description in `package.json`, `component.json`, `bower.json`
* Refactor `Readme.md`
* Add badges for travis, coveralls to `Readme.md`
* Add `logo.svg`
* Add missing `new` operator to `lib/stringify.js`
* Fix malformed `bower.json`
* Fix incorrect script reference in `component.json`
* Add strict mode to `index.js`
* Refactor `bower.json`
* Move `lib/stringify/index.js` to `lib/stringify.js`
* Move `lib/parse/index.js` to `lib/parse.js`
* Add npm deployment to `.travis.yml`
* Remove `before_install` script in `.travis.yml`
* Remove `Makefile`
* Refactor `.npmignore`
* Refactor `.gitignore`
* Add broader version ranges to `package.json`
* Update eslint
* Update matcha
* Update mocha
* Refactor npm scripts in `package.json`
* Move `test/mdast.spec.js` to `test/index.js`
* Move `spec/` to `test/`
* Move `benchmark/index.js` to `benchmark.js`
* Refactor to disallow spaces after object keys
* Add `.eslintrc`
* Fix spacing around inline-code containing backticks
* Refactor to simplify `spec/mdast.spec.js`
* Add benchmark for `mdast.stringify`
* Merge branch 'bug/fix-links'
* Remove failing fixtures

0.1.0-rc.2 / 2014-12-10
=======================

* Add block-level nodes to every list-item

0.1.0-rc.1 / 2014-12-07
=======================

* Add near-finished stringifier
* Fix test for changes in inline-code/code
* Fix loose list-items by adding paragraph-nodes where needed
* Fix multiple direct sibling blockquotes from appearing
* Fix `undefined` in strings when using line-breaks inside list-items
* Add inline-code node for code-spans
* Remove null-type for table alignment
* Add better errors for fixtures in spec
* Add white-space trimming to code-blocks
* Refactor position of `title` attribute in parse-output
* Add he to API to decode HTML entities in `text`
* Fix style issues in API
* Update copyright in Readme.md
* Remove testling
* Refactor property order in bower.json, package.json, component.json
* Update .gitignore, .npmignore
* Add he as a dependency
* Update eslint, jscs, mocha
* Fix incorrect repo url
* Refactor table output
* Add initial work for both parse and stringify functionality
* Refactor inline lexer
* Add missing continue statement
* Remove extraneous rule in eslint target
* Refactor outputting similar nodes
* Remove conditional assignment
* Add benchmark to docs
* Add a faster option setting mechanism
* Add a simpler regular expression builder
* Remove unneeded noop

0.0.3 / 2014-08-02
==================

* Add documentation for settings
* Fix option mechanism so different settings can work together
* Add functionality to merge HTML nodes
* Fix mailto removal in implicit links
* Add more verbose comments
* Fix typo in docs

0.0.2 / 2014-07-31
==================

* Add docs for nodes
* Rename cells > rows for tables
* Fix a typo where images had an "href" attribute instead of "src"
* Fix a bug where an internal type (looseItem) was exposed
* Fix documentation for b7b5b44
* Refactored API so results are wrapped in a root token, resulting in easier footnote finding
* Fininshed renaming: marked > mdast
* Added initial functionality for footnotes
* Fix a bug where multiple text tokens were not merged
* Refactor fixture-loading mechanism
* Refactored readme
* Renamed README > Readme
* Removed build.js
* Added changelog
* Update travis
* Refactor bower.json
* Refactor component.json
* Added testling
* Update mocha
* Refactored package.json
* Removed robotskirt, showdown, markdown
* Added benchmark
* Fixed npm script targets; initial benchmark
* Removed bin, doc, man
* Renamed lib/mdast.js > index.js
* Removed marked tests
* Added more istanbul ignore comments for error reporting code
* Added a unit test for images with empty alt attributes
* Made token types and variables more verbose
* Inlined peek in api
* Added unit tests for automatic email detection
* Added two istanbul ignore comments for error reporting code
* Removed an extraneous debug message, removed a dead statement
* Fixed an istanbul-ignore comment
* Added unit tests for pedantic list items (stricter definition)
* Added unit tests for pedantic code blocks (persistant trailing whitespace)
* Added a unit test for images with a title
* Removed two uncovered branches from spec
* Added inline pedantic fixtures
* Removed functionality to exposing inline lexer
* removed smartLists options and moved it to pedantic; added fixtures
* Added a tables:false fixture
* Added functionality to use options through fixture filenames
* Refactored merge; added istanbul ignore coverage comments
* Add unit test linting; add coverage
* Fixed style
* Refactor; things are working
* Major refactor, JSON is now given instead of HTML
* Refactored .jscs.json to indent with 2 instead of four spaces
* Add myself as a copyright holder to LICENSE
* Refactor for mdast

Forked from [marked](https://github.com/chjj/marked).
