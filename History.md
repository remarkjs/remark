
n.n.n / 2014-12-07
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
