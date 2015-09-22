'use strict';

/*
 * Dependencies.
 */

const mdast = require('wooorm/mdast@0.26.0');
const mdastRange = require('wooorm/mdast-range@1.0.1');
const vfile = require('wooorm/vfile');
const debounce = require('component/debounce@1.0.0');
const assign = require('sindresorhus/object-assign');
const keycode = require('timoxley/keycode');
const query = require('component/querystring');
const events = require('component/event');
const jquery = require('components/jquery');
const jstree = require('vakata/jstree');

/*
 * Constants.
 */

const defaultText = `Here’s a tiny demo for __mdast__.

Its focus is to *showcase* how the options above work.

Cheers!

---

P.S. You can also permalink the current document using \`⌘+s\` or \`Ctrl+s\`.
`;

/*
 * DOM elements.
 */

const $write = document.getElementById('write');
const $read = document.getElementById('read');
const $readTree = document.getElementById('read-tree');
const $position = document.getElementsByName('position')[0];
const $output = document.getElementsByName('output')[0];
const $stringify = document.querySelectorAll('.stringify');
const $settings = document.getElementById('settings');
const $toggleSettings = document.getElementById('toggle-settings');
const $clear = document.getElementById('clear');
const $permalink = document.getElementById('permalink');

const $options = [].concat(
    [].slice.call(document.getElementsByTagName('input')),
    [].slice.call(document.getElementsByTagName('select'))
);

/*
 * Options.
 */

const options = {};

/**
 * Make jstree-formatted tree from mdast tree.
 */
function makeJstree(node) {
    let text;

    if (node.type != 'text') {
        text = node.type;
        const props = Object.keys(node)
                  .filter((key) => (
                      ['type', 'value', 'children', 'position'].indexOf(key) < 0 ||
                          (key == 'value' && node.type != 'text')
                  ))
                  .map((key) => `${key}=${JSON.stringify(node[key])}`);

        if (props.length) {
            text += `(${props.join(', ')})`;
        }
    }
    else {
        text = JSON.stringify(node.value);
    }

    return assign({
        text,
        a_attr: {
            title: text
        },
        data: {
            position: node.position
        }
    }, node.children && {
        children: node.children.map(makeJstree)
    });
}

/**
 * Change.
 */
function onchange() {
    const isTree = options.output === 'tree';
    const isAST = options.output === 'ast';

    $readTree.style.display = isTree ? '' : 'none';
    $read.style.display = isTree ? 'none' : '';

    if (!isTree) {
        const fn = isAST ? 'parse' : 'process';
        const value = mdast[fn]($write.value, options);
        $read.value = isAST ? JSON.stringify(value, 0, 2) : value;
    } else {
        const file = vfile($write.value);
        let ast = mdast.parse(file, assign({}, options, { position: true }));
        ast = mdast.use(mdastRange).run(ast, file);

        jquery($readTree)
            .jstree('destroy')
            .off('.jstree')
            .on('hover_node.jstree', function (ev, data) {
                const position = data.node.data.position;
                $write.focus();
                $write.setSelectionRange(position.start.offset, position.end.offset);
            })
            .on('dehover_node.jstree', function (ev, data) {
                $write.setSelectionRange(0, 0);
            })
            .jstree({
                core: {
                    data: assign(makeJstree(ast), {
                        state: {
                            opened: true
                        }
                    }),
                    themes: {
                        name: 'proton',
                        responsive: true
                    }
                },
                conditionalselect: () => false,
                plugins: ['wholerow', 'conditionalselect']
            });
    }
}

/**
 * Get permalink.
 */
function getPermalink() {
    const variables = query.parse(window.location.search);

    for (let key in variables) {
        if (key === 'text') return variables[key];
    }

    return null;
}

/**
 * Get permalink.
 */
function setPermalink() {
    const variables = query.parse(window.location.search);

    variables.text = $write.value || '';

    window.location.search = '?' + query.stringify(variables);
}

const debouncedChange = debounce(onchange, 20);

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

function onmethodchange() {
    const $option = $output.selectedOptions[0];
    const compiled = $option && $option.value === 'markdown';
    const isTree = $option && $option.value === 'tree';
    const length = $stringify.length;
    let index = -1;

    while (++index < length) {
        $stringify[index].disabled = !compiled;
    }

    $position.checked = isTree ? true : $position.checked;
    $position.disabled = isTree;
}

/*
 * Intents.
 */

function onintenttoggelsettings() {
    var hidden = $settings.classList.contains('hidden');

    $settings.classList[hidden ? 'remove' : 'add']('hidden');
    $toggleSettings.textContent = (hidden ? 'Hide' : 'Show') + ' settings';
}

function onintentclear() {
    $write.value = '';
    onchange();
}

function onintentpermalink() {
    setPermalink();
}

const SHORTCUT_MAP = {
    's': onintentpermalink
};

function onkeydown(event) {
    var key = keycode(event);

    if (!event.metaKey) {
        return;
    }

    if (key in SHORTCUT_MAP) {
        SHORTCUT_MAP[key]();
        event.preventDefault();
    }
}

events.bind(document, 'keydown', onkeydown);

events.bind($toggleSettings, 'click', onintenttoggelsettings);
events.bind($clear, 'click', onintentclear);
events.bind($permalink, 'click', onintentpermalink);

/*
 * Listen.
 */

events.bind(window, 'change', onsettingchange);
events.bind($output, 'change', onmethodchange);

events.bind($write, 'change', debouncedChange);
events.bind($write, 'onpropertychange', debouncedChange);
events.bind($write, 'input', debouncedChange);

/*
 * Initial answer.
 */

$options.forEach(($node) => onsettingchange({ 'target': $node }));

$write.value = getPermalink() || defaultText;

/*
 * Focus editor.
 */

$write.focus();
