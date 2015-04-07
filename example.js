var mdast = require('./index.js');
var yamlConfig = require('mdast-yaml-config');

// Use a plugin. mdast-yaml-config allows settings in YAML frontmatter.
var processor = mdast().use(yamlConfig);

// Parse, modify, and stringify the document:
var doc = processor.process(
    '---\n' +
    'mdast:\n' +
    '  commonmark: true\n' +
    '---\n' +
    '\n' +
    '2) Some *emphasis*, **strongness**, and `code`.\n'
);

// Yields:
console.log('markdown', doc);
