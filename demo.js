'use strict';

/* eslint-env browser */
/* eslint-disable camelcase, guard-for-in, import/no-unassigned-import */

var remark = require('remark')();
var vfile = require('vfile');
var debounce = require('debounce');
var assign = require('object-assign');
var keycode = require('keycode');
var query = require('component-querystring');
var events = require('component-event');
var jquery = require('jquery');
var escapeHtml = require('escape-html');

require('jstree');

var defaultText = [
  'Here’s a tiny demo for __remark__.',
  '',
  'Its focus is to *showcase* how the options above work.',
  '',
  'Cheers!',
  '',
  '---',
  '',
  'P.S. You can also permalink the current document using `⌘+s` or `Ctrl+s`.',
  ''
].join('\n');

var $write = document.getElementById('write');
var $read = document.getElementById('read');
var $readTree = document.getElementById('read-tree');
var $position = document.getElementsByName('position')[0];
var $output = document.getElementsByName('output')[0];
var $stringify = document.querySelectorAll('.stringify');
var $settings = document.getElementById('settings');
var $toggleSettings = document.getElementById('toggle-settings');
var $clear = document.getElementById('clear');
var $permalink = document.getElementById('permalink');

// var $options = [].concat(
//   [].slice.call(document.getElementsByTagName('input')),
//   [].slice.call(document.getElementsByTagName('select'))
// );

var options = {};

var debouncedChange = debounce(onchange, 20);

var SHORTCUT_MAP = {s: setPermalink};

var getTargetValue = {
  text: function ($target) {
    return $target.value;
  },
  number: function ($target) {
    return Number($target.value);
  },
  checkbox: function ($target) {
    return $target.checked;
  },
  select: function ($target) {
    return $target.selectedIndex >= 0 && $target.selectedOptions[0].value;
  }
};

var setTargetValue = {
  text: function ($target, value) {
    $target.value = value;
  },
  number: function ($target, value) {
    $target.value = Number(value);
  },
  checkbox: function ($target, value) {
    $target.checked = value;
  },
  select: function ($target, value) {
    var $option = $target.querySelector('[value="' + value + '"]');
    $target.selectedIndex = $option ? $option.index : -1;
  }
};

/* Listen. */
events.bind(document, 'keydown', onkeydown);
events.bind($toggleSettings, 'click', onintenttoggelsettings);
events.bind($clear, 'click', onintentclear);
events.bind($permalink, 'click', setPermalink);
events.bind(window, 'change', onsettingchange);
events.bind($output, 'change', onmethodchange);
events.bind($write, 'change', debouncedChange);
events.bind($write, 'onpropertychange', debouncedChange);
events.bind($write, 'input', debouncedChange);

/* Initial answer. */
initializeOptions();
$write.value = getPermalink() || defaultText;
onchange();

/* Focus editor. */
$write.focus();

/* Intents. */
function onintenttoggelsettings() {
  var hidden = $settings.classList.contains('hidden');

  $settings.classList[hidden ? 'remove' : 'add']('hidden');
  $toggleSettings.textContent = (hidden ? 'Hide' : 'Show') + ' settings';
}

function onintentclear() {
  $write.value = '';
  onchange();
}

function onkeydown(ev) {
  var key = keycode(ev);

  if (ev.metaKey && key in SHORTCUT_MAP) {
    SHORTCUT_MAP[key]();
    ev.preventDefault();
  }
}

/* Change. */
function onchange() {
  var isTree = options.output === 'tree';
  var isAST = options.output === 'ast';
  var fn;
  var value;
  var file;
  var ast;

  $readTree.style.display = isTree ? '' : 'none';
  $read.style.display = isTree ? 'none' : '';

  if (isTree) {
    file = vfile($write.value);
    ast = remark.run(remark.parse(file, assign({}, options, {position: true})));

    jquery($readTree)
      .jstree('destroy')
      .off('.jstree')
      .on('hover_node.jstree', function (ev, data) {
        var position = data.node.data.position;
        $write.focus();
        $write.setSelectionRange(position.start.offset, position.end.offset);
      })
      .on('dehover_node.jstree', function () {
        $write.setSelectionRange(0, 0);
      })
      .jstree({
        core: {
          data: assign(makeJstree(ast), {state: {opened: true}}),
          themes: {name: 'proton', responsive: true}
        },
        conditionalselect: function () {
          return false;
        },
        plugins: ['wholerow', 'conditionalselect']
      });
  } else {
    fn = isAST ? 'parse' : 'process';
    value = remark[fn]($write.value, options);
    $read.value = isAST ? JSON.stringify(value, 0, 2) : value;
  }
}

/* Make jstree-formatted tree from mdast tree. */
function makeJstree(node) {
  var keys = ['type', 'value', 'children', 'position'];
  var text;
  var props;

  if (node.type === 'text') {
    text = JSON.stringify(node.value);
  } else {
    text = node.type;
    props = Object.keys(node)
      .filter(function (key) {
        return keys.indexOf(key) === -1 || (key === 'value' && node.type !== 'text');
      })
      .map(function (key) {
        return key + '=' + JSON.stringify(node[key]);
      });

    if (props.length !== 0) {
      text += '(' + props.join(', ') + ')';
    }
  }

  text = escapeHtml(text);

  return assign({
    text: text,
    a_attr: {title: text},
    data: {position: node.position}
  }, node.children && {children: node.children.map(makeJstree)});
}

function setOption(name, value) {
  options[name] = value;
  localStorage.setItem(name, value);
}

function onsettingchange(event) {
  var $target = event.target;
  var type = targetType($target);

  if ($target.hasAttribute('name')) {
    setOption($target.name, getTargetValue[type]($target));
    debouncedChange();
  }
}

function onmethodchange() {
  var $option = $output.selectedOptions[0];
  var compiled = $option && $option.value === 'markdown';
  var isTree = $option && $option.value === 'tree';
  var length = $stringify.length;
  var index = -1;

  while (++index < length) {
    $stringify[index].disabled = !compiled;
  }

  $position.checked = isTree ? true : $position.checked;
  $position.disabled = isTree;
}

function initializeOptions() {
  var name;
  var $target;
  var type;
  var value;

  for (name in localStorage) {
    $target = document.getElementsByName(name)[0];

    if (!$target) {
      continue;
    }

    type = targetType($target);
    value = localStorage.getItem(name);

    if (type === 'checkbox') {
      value = value && value !== 'false';
    }

    setTargetValue[type]($target, value);
    options[name] = value;
  }
}

/* Get permalink. */
function getPermalink() {
  var variables = query.parse(window.location.search);
  var key;

  for (key in variables) {
    if (key === 'text') {
      return variables[key];
    }
  }

  return null;
}

/* Set permalink. */
function setPermalink() {
  var variables = query.parse(window.location.search);
  variables.text = $write.value || '';
  window.location.search = '?' + query.stringify(variables);
}

function targetType($target) {
  var type = $target.hasAttribute('type') ? $target.type : $target.nodeName.toLowerCase();
  return type in getTargetValue ? type : 'text';
}
