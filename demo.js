'use strict';

/*
 * Dependencies.
 */

const remark = require('wooorm/remark@3.x');
const remarkRange = require('wooorm/remark-range@2.x');
const vfile = require('wooorm/vfile');
const debounce = require('component/debounce@1.0.0');
const assign = require('sindresorhus/object-assign');
const keycode = require('timoxley/keycode');
const query = require('component/querystring');
const events = require('component/event');
const jquery = require('components/jquery');
const jstree = require('vakata/jstree');
const escapeHtml = require('component/escape-html');

/*
 * Constants.
 */

const defaultText = `Here’s a tiny demo for __remark__.

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

    text = escapeHtml(text);

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
        const value = remark[fn]($write.value, options);
        $read.value = isAST ? JSON.stringify(value, 0, 2) : value;
    } else {
        const file = vfile($write.value);
        let ast = remark.parse(file, assign({}, options, { position: true }));
        ast = remark.use(remarkRange).run(ast, file);

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

function targetType($target) {
    const type = $target.hasAttribute('type') ? $target.type : $target.nodeName.toLowerCase();
    return type in getTargetValue ? type : 'text';
}

const getTargetValue = {
    text: ($target) => $target.value,
    number: ($target) => Number($target.value),
    checkbox: ($target) => $target.checked,
    select: ($target) => $target.selectedIndex >= 0 && $target.selectedOptions[0].value
};

const setTargetValue = {
    text: ($target, value) => $target.value = value,
    number: ($target, value) => $target.value = Number(value),
    checkbox: ($target, value) => $target.checked = value,
    select: ($target, value) => {
        const $option = $target.querySelector(`[value="${value}"]`);
        $target.selectedIndex = $option ? $option.index : -1;
    }
};

function initializeOptions() {
    for (let name in localStorage) {
        const $target = document.getElementsByName(name)[0];
        if (!$target) continue;

        const type = targetType($target);
        let value = localStorage.getItem(name);
        if (type == 'checkbox') {
            value = value && value != 'false';
        }

        setTargetValue[type]($target, value);
        options[name] = value;
    }
}

function setOption(name, value) {
    options[name] = value;
    localStorage.setItem(name, value);
}

function onsettingchange(event) {
    const $target = event.target;
    const type = targetType($target);

    if (!$target.hasAttribute('name')) return;

    setOption($target.name, getTargetValue[type]($target));

    debouncedChange();
}

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

initializeOptions();
$write.value = getPermalink() || defaultText;
onchange();

/*
 * Focus editor.
 */

$write.focus();
