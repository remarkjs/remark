// See [Nodes](doc/Nodes.md) for information about returned objects.
var mdast = require('./index.js');

// Parse markdown with `mdast.parse`:
var ast = mdast.parse('Some *emphasis*, **strongness**, and `code`.');

// Yields:
console.log('json', JSON.stringify(ast, 0, 2));

// And passing that document into `mdast.stringify`:
var doc = mdast.stringify(ast);

// Yields:
console.log('markdown', doc);
