'use strict';

/*
 * Dependencies.
 */

var fs = require('fs');
var mdast = require('..');
var toc = require('mdast-toc');

/*
 * Location for options.
 */

var BASE = 'script/setting';

/*
 * Get sections.
 */

var sections;

sections = fs.readdirSync(BASE).filter(function (filepath) {
    return filepath.charAt(0) !== '.';
}).map(function (filepath) {
    return BASE + '/' + filepath;
});

var settings = JSON.parse(fs.readFileSync('.mdastrc')).settings;

/*
 * Get information for each section.
 */

sections = sections.map(function (filepath) {
    return {
        'description': fs.readFileSync(filepath + '/description.md', 'utf8'),
        'path': filepath,
        'options': fs.readFileSync(filepath + '/config.json', 'utf8'),
        'fixture': fs.readFileSync(filepath + '/fixture.text', 'utf8'),
        'parseOnly': /parse/.test(filepath)
    };
});

/*
 * Clean sections.
 */

sections = sections.map(function (section) {
    section.description = section.description.trim();

    return section;
});

/*
 * Process sections.
 */

sections = sections.map(function (section) {
    var options = JSON.parse(section.options);

    section.title = options.title;
    section.ast = mdast.parse(section.fixture, options.parse);
    section.output = mdast.stringify(section.ast, options.stringify);

    section.options = JSON.parse(section.options);

    return section;
});

/*
 * Detect if the option is for `parse` or `stringify`.
 */

var parse = [];
var stringify = [];

sections.forEach(function (section) {
    (section.parseOnly ? parse : stringify).push(section);
});

/*
 * Create a document.
 */

var root;

root = mdast.parse(
    '![mdast](https://cdn.rawgit.com/wooorm/mdast/master/logo.svg)\n' +
    '\n' +
    '# Options\n' +
    '\n' +
    'This page contains information and usage examples regarding ' +
        'available options for [`mdast.parse()`](https://github.com/' +
        'wooorm/mdast/blob/master/doc/mdast.3.md#mdastparsefile-options)' +
        ' and [`mdast.stringify()`](https://github.com/wooorm/mdast/blob/' +
        'master/doc/mdast.3.md#mdaststringifyast-options).\n' +
    '\n' +
    'Information on **mdast** itself is available in the project’s ' +
        '[readme.md](https://github.com/wooorm/mdast#readme).\n' +
    '\n' +
    '## Table of Contents\n' +
    '\n'
);

/**
 * Define stringifier.
 *
 * @param {Object} section
 */
function renderSection(section) {
    var code;

    root.children.push({
        'type': 'heading',
        'depth': 3,
        'children': [{
            'type': 'text',
            'value': section.title
        }]
    });

    root.children = root.children.concat(
        mdast.parse(section.description).children
    );

    root.children.push({
        'type': 'paragraph',
        'children': [{
            'type': 'text',
            'value': 'The following document:'
        }]
    });

    root.children.push({
        'type': 'code',
        'lang': 'markdown',
        'value': section.fixture.trimRight()
    });

    root.children.push({
        'type': 'paragraph',
        'children': [{
            'type': 'text',
            'value': 'And the below JavaScript:'
        }]
    });

    code = 'var ast = mdast.parse(document';

    if (section.options.parse) {
        code += ', ' +
            JSON.stringify(section.options.parse, null, 2).trimRight();
    }

    code += ');';

    if (!section.parseOnly) {
        code += '\n\nmdast.stringify(ast';

        if (section.options.stringify) {
            code += ', ' +
                JSON.stringify(section.options.stringify, null, 2)
                .trimRight();
        }

        code += ');';
    }

    root.children.push({
        'type': 'code',
        'lang': 'javascript',
        'value': code
    });

    root.children.push({
        'type': 'paragraph',
        'children': [{
            'type': 'text',
            'value': 'Yields:'
        }]
    });

    if (section.parseOnly) {
        root.children.push({
            'type': 'code',
            'lang': 'json',
            'value': JSON.stringify(section.ast, 0, 2)
        });
    } else {
        root.children.push({
            'type': 'code',
            'lang': 'markdown',
            'value': section.output.trimRight()
        });
    }
}

/*
 * Add a heading for parse options.
 */

root.children.push({
    'type': 'heading',
    'depth': 2,
    'children': [{
        'type': 'text',
        'value': 'Parse'
    }]
});

/*
 * Add parse options.
 */

parse.forEach(renderSection);

/*
 * Add a heading for stringify options.
 */

root.children.push({
    'type': 'heading',
    'depth': 2,
    'children': [{
        'type': 'text',
        'value': 'Stringify'
    }]
});

/*
 * Add stringify options.
 */

stringify.forEach(renderSection);

/*
 * Add toc.
 */

mdast().use(toc).run(root);

/*
 * Write.
 */

fs.writeFileSync('doc/options.md', mdast.stringify(root, settings));
