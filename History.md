
n.n.n / 2014-12-28
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
==================

 * Add block-level nodes to every list-item

0.1.0-rc.1 / 2014-12-07
==================

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
