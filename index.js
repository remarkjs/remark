'use strict';

/*
 * Dependencies.
 */

var mdast = require('wooorm/mdast@0.9.0');
var debounce = require('component/debounce@1.0.0');
var Quill = require('quilljs/quill');

/*
 * DOM elements.
 */

var $options = [].concat(
    [].slice.call(document.getElementsByTagName('input')),
    [].slice.call(document.getElementsByTagName('select'))
);

var write = new Quill(document.getElementById('write'), {
    'formats': []
});

var read = new Quill(document.getElementById('read'), {
    'readOnly': true
});

var keyboard = write.modules.keyboard;
var keys = keyboard.hotkeys;

/*
 * Quil does not remove bold, italic, underline
 * when settings formats to `0`
 */

delete keys[66];
delete keys[73];
delete keys[85];

function addHotKey(key, before, after) {
    if (!after) {
        after = before;
    }

    keyboard.addHotkey({
      'key': key,
      'metaKey': true
    }, function (range) {
        var start = range.start;
        var end = range.end;

        write.insertText(start, before);
        write.insertText(end + before.length, after);
        write.setSelection(start + before.length, end + before.length);

        return false;
    });
}

addHotKey('B', '**');
addHotKey('I', '_');

/*
 * Options.
 */

var options = {};

/*
 * Handlers.
 */

function onchange() {
    var ast = mdast.parse(write.getText(), options);

    read.setText(mdast.stringify(ast, options));
}

var debouncedChange = debounce(onchange, 10);

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
    var $option = $target.selectedOptions[0];

    if (!$option) {
        return;
    }

    options[name] = $option.value;
}

function onsettingchange(event) {
    var $target = event.target;

    var type = $target.hasAttribute('type') ? $target.type : event.target.nodeName.toLowerCase();

    if (!(type in onsettingchange)) {
        type = 'text';
    }

    onsettingchange[type]($target, $target.name);

    if ($target.name === 'tables' && options[$target.name] && !options.gfm) {
        document.querySelector('[name="gfm"]').checked = true;
        options.gfm = true;
    }

    if ($target.name === 'gfm' && !options[$target.name] && options.tables) {
        document.querySelector('[name="tables"]').checked = false;
        options.tables = false;
    }

    debouncedChange();
}

onsettingchange.select = onselectchange;
onsettingchange.checkbox = oncheckboxchange;
onsettingchange.text = ontextchange;
onsettingchange.number = onnumberchange;

function onanychange(event) {
    if (event.target.hasAttribute('name')) {
        onsettingchange(event);
    }
}

/*
 * Listen.
 */

window.addEventListener('change', onanychange);

/*
 * Initial answer.
 */

write.on('text-change', debouncedChange);

$options.forEach(function ($node) {
    onsettingchange({
        'target': $node
    });
});

write.setText([
    '---',
    'YAML-front-matter: is awesome',
    '---',
    '',
    '# Hello',
    '',
    'World!',
    '',
    'Emphasis',
    '---',
    '',
    '__Strong emphasis__, more **strong emphasis**.',
    '_Slight emphasis_, more *slight emphasis*. In a pedantic_file_name.',
    '~~Removed text~~.',
    '',
    '## List',
    '',
    '- 1',
    '    * 2',
    '        + 3',
    '',
    '1. 1',
    '9999. 2',
    '123. 3',
    '',
    '## Links',
    '',
    'Here’s a [link][1]. And [another](http://wooorm.com "My homepage").',
    '',
    '[1]: http://example.com "An example"',
    '',
    'Code',
    '---',
    '',
    'Inline `code`, indented:',
    '',
    '    alert(1);',
    '',
    '...or fenced:',
    '',
    '```markdown',
    '# Hai!',
    '```',
    '',
    '## Tables',
    '',
    '| Hello |',
    '|:-:|',
    '| World!!!!!! |',
    '',
    '## Footnotes',
    '',
    'Here’s an [^inline footnote, referencing another[^2]].',
    '',
    '[^2]: This one’s also a footnote.',
    '',
    'Horizontal Rules:',
    '',
    '---',
    '',
    '* * * * * * * * * * * *',
    ''
].join('\n'));

/*
 * Focus editor.
 */

write.focus();

/*
 * Focus editor.
 */

write.focus();
