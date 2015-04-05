'use strict';

/*
 * Dependencies.
 */

const mdast = require('wooorm/mdast@0.16.0');
const debounce = require('component/debounce@1.0.0');
const keycode = require('timoxley/keycode');
const Quill = require('quilljs/quill');

/*
 * Methods.
 */

const Delta = Quill.require('delta');

/*
 * DOM elements.
 */

const $options = [].concat(
    [].slice.call(document.getElementsByTagName('input')),
    [].slice.call(document.getElementsByTagName('select'))
);

/*
 * Editors.
 */

const write = new Quill(document.getElementById('write'), {
    'formats': []
});

const read = new Quill(document.getElementById('read'), {
    'readOnly': true
});

/*
 * Options.
 */

const options = {};

/*
 * Shortcuts.
 */

const keyboard = write.modules.keyboard;
const hotkeys = keyboard.hotkeys;

/*
 * Quill does not remove bold, italic, underline
 * when settings formats to `0`
 */

delete hotkeys[66];
delete hotkeys[73];
delete hotkeys[85];

/**
 * Add a callback for key.
 *
 * @param {number} key
 * @param {boolean} hot
 * @param {function(Range)} callback
 */
function addKey(key, hot, before, after) {
    keyboard.addHotkey({
      'key': keycode(key),
      'metaKey': Boolean(hot)
    }, function (range) {
        const start = range.start;
        const end = range.end;

        write.insertText(start, before);
        write.insertText(end + before.length, after || before);
        write.setSelection(start + before.length, end + before.length);

        return false;
    });
}

/*
 * Listen.
 */

addKey('b', true, '**');
addKey('i', true, '_');
addKey('u', true, '~~');
addKey('/', true, '<!--', '-->');

/**
 * Visit.
 *
 * @param {Node} tree
 * @param {string} [type]
 * @param {function(node)} callback
 */
function visit(tree, type, callback) {
    if (!callback) {
        callback = type;
        type = null;
    }

    function one(node) {
        if (!type || node.type === type) {
            callback(node);
        }

        if (node.children) {
            node.children.forEach(one);
        }
    }

    one(tree);
}

/**
 * Create a formatter.
 *
 * @param {Quill} quill
 * @param {Node} ast
 * @return {Function}
 */
function formatFactory(quill, ast) {
    const editor = quill.editor;

    /**
     * Format nodes of type `type`.
     *
     * @param {string?} type
     * @param {Object} formats
     */
    return function (type, formats) {
        visit(ast, type, function (node) {
            const start = node.position.start.offset;
            const end = node.position.end.offset;
            const delta = new Delta().retain(start).retain(end - start, formats);
            let index = 0;

            delta.ops.forEach(function (op) {
                if (op.attributes) {
                    Object.keys(op.attributes).forEach(function (name) {
                        editor._formatAt(index, op.retain, name, op.attributes[name]);
                    });
                }

                index += op.retain;
            });
        });
    };
}

/**
 * Calculate offsets for `lines`.
 *
 * @param {Array.<string>} lines
 * @return {Array.<number>}
 */
function toOffsets(lines) {
    let total = 0;

    return lines.map((value) => total += value.length + 1);
}

/**
 * Add an offset based on `columns` to `position`.
 *
 * @param {Object} position
 * @return {Array.<number>} offsets
 */
function addRange(position, offsets) {
    position.offset = (offsets[position.line - 2] || 0) + position.column - 1;
}

/**
 * Add ranges for `doc` to `ast`.
 *
 * @param {string} doc
 * @return {Node} ast
 */
function addRanges(doc, ast) {
    const offsets = toOffsets(doc.split('\n'));

    visit(ast, function (node) {
        addRange(node.position.start, offsets);
        addRange(node.position.end, offsets);
    });
}

/**
 * Highlight `doc`, with `editor`.
 *
 * @return {Quill} quill
 * @param {string} doc
 */
function highlight(quill, doc) {
    const tree = mdast.parse(doc, options);
    const format = formatFactory(quill, tree);

    addRanges(doc, tree);

    format('strong', { 'bold': true });
    format('emphasis', { 'italic': true });
    format('delete', { 'strike': true });

    format('link', { 'color': '#4183c4' });
    format('image', { 'color': '#4183c4' });
    format('footnote', { 'color': '#4183c4' });

    format('escape', { 'color': '#cb4b16' });

    format('inlineCode', { 'font': 'monospace', 'background': '#f7f7f7' });
    format('code', { 'font': 'monospace', 'background': '#f7f7f7' });
    format('yaml', { 'font': 'monospace', 'background': '#f7f7f7' });
    format('html', { 'font': 'monospace', 'background': '#f7f7f7' });

    format('heading', { 'size': '18px' });
}

/**
 * Change.
 */
function onchange() {
    const ast = mdast.parse(write.getText(), options);
    const doc = mdast.stringify(ast, options);

    read.setText(doc);

    highlight(read, doc);
}

/*
 * Debounce. This is only for the formatting.
 */

const debouncedChange = debounce(onchange, 100);

/*
 * Setting changes.
 */

function ontextchange($target, name) {
    options[name] = $target.value;
}

function onnumberchange($target, name) {
    options[name] = Number($target.value);
}

function oncheckboxchange($target, name) {
    options[name] = $target.checked;
}

function onselectchange($target, name) {
    const $option = $target.selectedOptions[0];

    if ($option) options[name] = $option.value;
}

function onsettingchange(event) {
    const $target = event.target;
    const type = $target.hasAttribute('type') ? $target.type : event.target.nodeName.toLowerCase();

    if (!$target.hasAttribute('name')) return;

    onsettingchange[type in onsettingchange ? type : 'text']($target, $target.name);

    debouncedChange();
}

onsettingchange.select = onselectchange;
onsettingchange.checkbox = oncheckboxchange;
onsettingchange.text = ontextchange;
onsettingchange.number = onnumberchange;

/*
 * Listen.
 */

window.addEventListener('change', onsettingchange);

/*
 * Initial answer.
 */

write.on('text-change', debouncedChange);

$options.forEach(($node) => onsettingchange({ 'target': $node }));

write.setText([
    'Here’s a tiny demo for **mdast**.',
    '',
    'Its focus is to _showcase_ how the options above work.',
    '',
    'Cheers!',
    '',
    '---',
    '',
    'P.S. I’ve added some nice keyboard sortcuts (`b`, `i`, `u`, and `/`)',
    'for your convenience, and some syntax highlighting to show things are',
    'working!',
    ''
].join('\n'));

/*
 * Focus editor.
 */

write.focus();
