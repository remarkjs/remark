
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
