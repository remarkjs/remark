/**
 * @author Titus Wormer
 * @copyright 2015-2016 Titus Wormer
 * @license MIT
 * @module remark:script
 * @fileoverview Build the options documentation.
 */

'use strict';

/* eslint-env node */

/*
 * Dependencies.
 */

var fs = require('fs');
var path = require('path');
var remark = require('..');
var toc = require('remark-toc');
var settings = require('../.remarkrc.js').settings;

/*
 * Methods.
 */

var read = fs.readFileSync;
var join = path.join;

/*
 * Location for options.
 */

var BASE = join('script', 'setting');

/*
 * Get sections.
 */

var sections;

sections = fs.readdirSync(BASE).filter(function (filepath) {
    return filepath.charAt(0) !== '.';
}).map(function (filepath) {
    return join(BASE, filepath);
});

/*
 * Get information for each section.
 */

sections = sections.map(function (filepath) {
    return {
        'description': read(join(filepath, 'description.md'), 'utf8'),
        'path': filepath,
        'options': read(join(filepath, 'config.json'), 'utf8'),
        'fixture': read(join(filepath, 'fixture.text'), 'utf8'),
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
    section.ast = remark.parse(section.fixture, options.parse);
    section.output = remark.stringify(section.ast, options.stringify);

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

root = remark.parse(
    [
        '# remarksetting(7) -- remark settings',
        '',
        '## SYNOPSIS',
        '',
        '**remark**(1), **remark**(3), **remarkrc**(5)',
        '',
        '## DESCRIPTION',
        '',
        'This page holds information and usage examples on available',
        'options for **remark**(3)’s `parse()` and `stringify()`.',
        '',
        '## Table of Contents'
    ].join('\n')
);

/**
 * Define stringifier.
 *
 * @param {Object} section - Section to render.
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
        remark.parse(section.description).children
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

    code = 'var ast = remark.parse(document';

    if (section.options.parse) {
        code += ', ' +
            JSON.stringify(section.options.parse, null, 2).trimRight();
    }

    code += ');';

    if (!section.parseOnly) {
        code += '\n\nremark.stringify(ast';

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

remark().use(toc).run(root);

/*
 * Write.
 */

fs.writeFileSync('doc/remarksetting.7.md', remark.stringify(root, settings));
