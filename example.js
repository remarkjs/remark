// Load dependencies:
var remark = require('./index.js');
var html = require('remark-html');
var yamlConfig = require('remark-yaml-config');

// Use plugins:
var processor = remark().use(yamlConfig).use(html);

// Process the document:
var doc = processor.process([
    '---',
    'remark:',
    '  commonmark: true',
    '---',
    '',
    '2) Some *emphasis*, **strongness**, and `code`.'
].join('\n'));

// Yields:
console.log('html', doc);
