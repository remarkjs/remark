// Load dependencies:
var mdast = require('./index.js');
var html = require('mdast-html');
var yamlConfig = require('mdast-yaml-config');

// Use plugins:
var processor = mdast().use(yamlConfig).use(html);

// Process the document:
var doc = processor.process([
    '---',
    'mdast:',
    '  commonmark: true',
    '---',
    '',
    '2) Some *emphasis*, **strongness**, and `code`.'
].join('\n'));

// Yields:
console.log('html', doc);
