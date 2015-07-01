'use strict';

/*
 * Dependencies.
 */

const mdast = require('wooorm/mdast@0.26.0');
const debounce = require('component/debounce@1.0.0');
const keycode = require('timoxley/keycode');
const query = require('component/querystring');
const events = require('component/event');

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
const $ast = document.getElementsByName('ast')[0];
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
 * Change.
 */
function onchange() {
    var fn = options.ast ? 'parse' : 'process';
    var value = mdast[fn]($write.value, options);

    if (options.ast) {
        value = JSON.stringify(value, 0, 2);
    }

    $read.value = value;
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
    var length = $stringify.length;
    var index = -1;

    while (++index < length) {
        $stringify[index].disabled = $ast.checked;
    }
}

/*
 * Intents.
 */

function onintenttoggelsettings() {
    var hidden = $settings.classList.contains('hidden');

    $settings.classList[hidden ? 'remove' : 'add']('hidden');
    $toggleSettings.textContent = (hidden ? 'Show' : 'Hide') + ' settings';
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
events.bind($ast, 'change', onmethodchange);

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
