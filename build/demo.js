(function outer(modules, cache, entries){

  /**
   * Global
   */

  var global = (function(){ return this; })();

  /**
   * Require `name`.
   *
   * @param {String} name
   * @api public
   */

  function require(name){
    if (cache[name]) return cache[name].exports;
    if (modules[name]) return call(name, require);
    throw new Error('cannot find module "' + name + '"');
  }

  /**
   * Call module `id` and cache it.
   *
   * @param {Number} id
   * @param {Function} require
   * @return {Function}
   * @api private
   */

  function call(id, require){
    var m = cache[id] = { exports: {} };
    var mod = modules[id];
    var name = mod[2];
    var fn = mod[0];
    var threw = true;

    try {
      fn.call(m.exports, function(req){
        var dep = modules[id][1][req];
        return require(dep || req);
      }, m, m.exports, outer, modules, cache, entries);
      threw = false;
    } finally {
      if (threw) {
        delete cache[id];
      } else if (name) {
        // expose as 'name'.
        cache[name] = cache[id];
      }
    }

    return cache[id].exports;
  }

  /**
   * Require all entries exposing them on global if needed.
   */

  for (var id in entries) {
    if (entries[id]) {
      global[entries[id]] = require(id);
    } else {
      require(id);
    }
  }

  /**
   * Duo flag.
   */

  require.duo = true;

  /**
   * Expose cache.
   */

  require.cache = cache;

  /**
   * Expose modules
   */

  require.modules = modules;

  /**
   * Return newest require.
   */

   return require;
})({
1: [function(require, module, exports) {
'use strict';

/*
 * Dependencies.
 */

var mdast = require('wooorm/mdast@0.26.0');
var mdastRange = require('wooorm/mdast-range@1.0.1');
var vfile = require('wooorm/vfile');
var debounce = require('component/debounce@1.0.0');
var assign = require('sindresorhus/object-assign');
var keycode = require('timoxley/keycode');
var query = require('component/querystring');
var events = require('component/event');
var jquery = require('components/jquery');
var jstree = require('vakata/jstree');
var escapeHtml = require('component/escape-html');

/*
 * Constants.
 */

var defaultText = 'Here’s a tiny demo for __mdast__.\n\nIts focus is to *showcase* how the options above work.\n\nCheers!\n\n---\n\nP.S. You can also permalink the current document using `⌘+s` or `Ctrl+s`.\n';

/*
 * DOM elements.
 */

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

var $options = [].concat([].slice.call(document.getElementsByTagName('input')), [].slice.call(document.getElementsByTagName('select')));

/*
 * Options.
 */

var options = {};

/**
 * Make jstree-formatted tree from mdast tree.
 */
function makeJstree(node) {
    var text = undefined;

    if (node.type != 'text') {
        text = node.type;
        var props = Object.keys(node).filter(function (key) {
            return ['type', 'value', 'children', 'position'].indexOf(key) < 0 || key == 'value' && node.type != 'text';
        }).map(function (key) {
            return key + '=' + JSON.stringify(node[key]);
        });

        if (props.length) {
            text += '(' + props.join(', ') + ')';
        }
    } else {
        text = JSON.stringify(node.value);
    }

    text = escapeHtml(text);

    return assign({
        text: text,
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
    var isTree = options.output === 'tree';
    var isAST = options.output === 'ast';

    $readTree.style.display = isTree ? '' : 'none';
    $read.style.display = isTree ? 'none' : '';

    if (!isTree) {
        var fn = isAST ? 'parse' : 'process';
        var value = mdast[fn]($write.value, options);
        $read.value = isAST ? JSON.stringify(value, 0, 2) : value;
    } else {
        var file = vfile($write.value);
        var ast = mdast.parse(file, assign({}, options, { position: true }));
        ast = mdast.use(mdastRange).run(ast, file);

        jquery($readTree).jstree('destroy').off('.jstree').on('hover_node.jstree', function (ev, data) {
            var position = data.node.data.position;
            $write.focus();
            $write.setSelectionRange(position.start.offset, position.end.offset);
        }).on('dehover_node.jstree', function (ev, data) {
            $write.setSelectionRange(0, 0);
        }).jstree({
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
            conditionalselect: function conditionalselect() {
                return false;
            },
            plugins: ['wholerow', 'conditionalselect']
        });
    }
}

/**
 * Get permalink.
 */
function getPermalink() {
    var variables = query.parse(window.location.search);

    for (var key in variables) {
        if (key === 'text') return variables[key];
    }

    return null;
}

/**
 * Get permalink.
 */
function setPermalink() {
    var variables = query.parse(window.location.search);

    variables.text = $write.value || '';

    window.location.search = '?' + query.stringify(variables);
}

var debouncedChange = debounce(onchange, 20);

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
    var $option = $target.selectedOptions[0];

    if ($option) options[name] = $option.value;
}

function onsettingchange(event) {
    var $target = event.target;
    var type = $target.hasAttribute('type') ? $target.type : event.target.nodeName.toLowerCase();

    if (!$target.hasAttribute('name')) return;

    onsettingchange[type in onsettingchange ? type : 'text']($target, $target.name);

    debouncedChange();
}

onsettingchange.select = onselectchange;
onsettingchange.checkbox = oncheckboxchange;
onsettingchange.text = ontextchange;
onsettingchange.number = onnumberchange;

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

var SHORTCUT_MAP = {
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

$options.forEach(function ($node) {
    return onsettingchange({ 'target': $node });
});

$write.value = getPermalink() || defaultText;

/*
 * Focus editor.
 */

$write.focus();
}, {"wooorm/mdast@0.26.0":2,"wooorm/mdast-range@1.0.1":3,"wooorm/vfile":4,"component/debounce@1.0.0":5,"sindresorhus/object-assign":6,"timoxley/keycode":7,"component/querystring":8,"component/event":9,"components/jquery":10,"vakata/jstree":11,"component/escape-html":12}],
2: [function(require, module, exports) {
'use strict';

/*
 * Dependencies.
 */

var Ware = require('ware');
var parser = require('./lib/parse.js');
var stringifier = require('./lib/stringify.js');
var File = require('./lib/file.js');
var utilities = require('./lib/utilities.js');

/*
 * Methods.
 */

var clone = utilities.clone;
var Parser = parser.Parser;
var parseProto = Parser.prototype;
var Compiler = stringifier.Compiler;
var compileProto = Compiler.prototype;

/**
 * Throws if passed an exception.
 *
 * Here until the following PR is merged into
 * segmentio/ware:
 *
 *   https://github.com/segmentio/ware/pull/21
 *
 * @param {Error?} exception
 */
function fail(exception) {
    if (exception) {
        throw exception;
    }
}

/**
 * Create a custom, cloned, Parser.
 *
 * @return {Function}
 */
function constructParser() {
    var customProto;
    var expressions;
    var key;

    /**
     * Extensible prototype.
     */
    function CustomProto() {}

    CustomProto.prototype = parseProto;

    customProto = new CustomProto();

    /**
     * Extensible constructor.
     */
    function CustomParser() {
        Parser.apply(this, arguments);
    }

    CustomParser.prototype = customProto;

    /*
     * Construct new objects for things that plugin's
     * might modify.
     */

    customProto.blockTokenizers = clone(parseProto.blockTokenizers);
    customProto.blockMethods = clone(parseProto.blockMethods);
    customProto.inlineTokenizers = clone(parseProto.inlineTokenizers);
    customProto.inlineMethods = clone(parseProto.inlineMethods);

    expressions = parseProto.expressions;
    customProto.expressions = {};

    for (key in expressions) {
        customProto.expressions[key] = clone(expressions[key]);
    }

    return CustomParser;
}

/**
 * Create a custom, cloned, Compiler.
 *
 * @return {Function}
 */
function constructCompiler() {
    var customProto;

    /**
     * Extensible prototype.
     */
    function CustomProto() {}

    CustomProto.prototype = compileProto;

    customProto = new CustomProto();

    /**
     * Extensible constructor.
     */
    function CustomCompiler() {
        Compiler.apply(this, arguments);
    }

    CustomCompiler.prototype = customProto;

    return CustomCompiler;
}

/**
 * Construct an MDAST instance.
 *
 * @constructor {MDAST}
 */
function MDAST() {
    var self = this;

    if (!(self instanceof MDAST)) {
        return new MDAST();
    }

    self.ware = new Ware();
    self.attachers = [];

    self.Parser = constructParser();
    self.Compiler = constructCompiler();
}

/**
 * Attach a plugin.
 *
 * @param {Function|Array.<Function>} attach
 * @param {Object?} options
 * @return {MDAST}
 */
function use(attach, options) {
    var self = this;
    var index;
    var transformer;

    if (!(self instanceof MDAST)) {
        self = new MDAST();
    }

    /*
     * Multiple attachers.
     */

    if ('length' in attach && typeof attach !== 'function') {
        index = attach.length;

        while (attach[--index]) {
            self.use(attach[index]);
        }

        return self;
    }

    /*
     * Single plugin.
     */

    if (self.attachers.indexOf(attach) === -1) {
        transformer = attach(self, options);

        self.attachers.push(attach);

        if (transformer) {
            self.ware.use(transformer);
        }
    }

    return self;
}

/**
 * Apply transformers to `node`.
 *
 * @param {Node} ast
 * @param {File?} [file]
 * @param {Function?} [done]
 * @return {Node} - `ast`.
 */
function run(ast, file, done) {
    var self = this;

    if (typeof file === 'function') {
        done = file;
        file = null;
    }

    file = new File(file);

    done = typeof done === 'function' ? done : fail;

    if (typeof ast !== 'object' && typeof ast.type !== 'string') {
        utilities.raise(ast, 'ast');
    }

    /*
     * Only run when this is an instance of MDAST.
     */

    if (self.ware) {
        self.ware.run(ast, file, done);
    } else {
        done(null, ast, file);
    }

    return ast;
}

/**
 * Wrapper to pass a file to `parser`.
 */
function parse(value, options) {
    return parser.call(this, new File(value), options);
}

/**
 * Wrapper to pass a file to `stringifier`.
 */
function stringify(ast, file, options) {
    if (options === null || options === undefined) {
        options = file;
        file = null;
    }

    return stringifier.call(this, ast, new File(file), options);
}

/**
 * Parse a value and apply transformers.
 *
 * @param {string|File} value
 * @param {Object?} [options]
 * @param {Function?} [done]
 * @return {string?}
 */
function process(value, options, done) {
    var file = new File(value);
    var self = this instanceof MDAST ? this : new MDAST();
    var result = null;
    var ast;

    if (typeof options === 'function') {
        done = options;
        options = null;
    }

    if (!options) {
        options = {};
    }

    /**
     * Invoked when `run` completes. Hoists `result` into
     * the upper scope to return something for sync
     * operations.
     */
    function callback(exception) {
        if (exception) {
            (done || fail)(exception);
        } else {
            result = self.stringify(ast, file, options);

            if (done) {
                done(null, result, file);
            }
        }
    }

    ast = self.parse(file, options);
    self.run(ast, file, callback);

    return result;
}

/*
 * Methods.
 */

var proto = MDAST.prototype;

proto.use = use;
proto.parse = parse;
proto.run = run;
proto.stringify = stringify;
proto.process = process;

/*
 * Functions.
 */

MDAST.use = use;
MDAST.parse = parse;
MDAST.run = run;
MDAST.stringify = stringify;
MDAST.process = process;

/*
 * Expose `mdast`.
 */

module.exports = MDAST;
}, {"ware":13,"./lib/parse.js":14,"./lib/stringify.js":15,"./lib/file.js":16,"./lib/utilities.js":17}],
13: [function(require, module, exports) {
/**
 * Module Dependencies
 */

'use strict';

var slice = [].slice;
var wrap = require('wrap-fn');

/**
 * Expose `Ware`.
 */

module.exports = Ware;

/**
 * Throw an error.
 *
 * @param {Error} error
 */

function fail(err) {
  throw err;
}

/**
 * Initialize a new `Ware` manager, with optional `fns`.
 *
 * @param {Function or Array or Ware} fn (optional)
 */

function Ware(fn) {
  if (!(this instanceof Ware)) return new Ware(fn);
  this.fns = [];
  if (fn) this.use(fn);
}

/**
 * Use a middleware `fn`.
 *
 * @param {Function or Array or Ware} fn
 * @return {Ware}
 */

Ware.prototype.use = function (fn) {
  if (fn instanceof Ware) {
    return this.use(fn.fns);
  }

  if (fn instanceof Array) {
    for (var i = 0, f; f = fn[i++];) this.use(f);
    return this;
  }

  this.fns.push(fn);
  return this;
};

/**
 * Run through the middleware with the given `args` and optional `callback`.
 *
 * @param {Mixed} args...
 * @param {Function} callback (optional)
 * @return {Ware}
 */

Ware.prototype.run = function () {
  var fns = this.fns;
  var ctx = this;
  var i = 0;
  var last = arguments[arguments.length - 1];
  var done = 'function' == typeof last && last;
  var args = done ? slice.call(arguments, 0, arguments.length - 1) : slice.call(arguments);

  // next step
  function next(err) {
    if (err) return (done || fail)(err);
    var fn = fns[i++];
    var arr = slice.call(args);

    if (!fn) {
      return done && done.apply(null, [null].concat(args));
    }

    wrap(fn, next).apply(ctx, arr);
  }

  next();

  return this;
};
}, {"wrap-fn":18}],
18: [function(require, module, exports) {
/**
 * Module Dependencies
 */

'use strict';

var noop = function noop() {};
var co = require('co');

/**
 * Export `wrap-fn`
 */

module.exports = wrap;

/**
 * Wrap a function to support
 * sync, async, and gen functions.
 *
 * @param {Function} fn
 * @param {Function} done
 * @return {Function}
 * @api public
 */

function wrap(fn, done) {
  done = once(done || noop);

  return function () {
    // prevents arguments leakage
    // see https://github.com/petkaantonov/bluebird/wiki/Optimization-killers#3-managing-arguments
    var i = arguments.length;
    var args = new Array(i);
    while (i--) args[i] = arguments[i];

    var ctx = this;

    // done
    if (!fn) {
      return done.apply(ctx, [null].concat(args));
    }

    // async
    if (fn.length > args.length) {
      // NOTE: this only handles uncaught synchronous errors
      try {
        return fn.apply(ctx, args.concat(done));
      } catch (e) {
        return done(e);
      }
    }

    // generator
    if (generator(fn)) {
      return co(fn).apply(ctx, args.concat(done));
    }

    // sync
    return sync(fn, done).apply(ctx, args);
  };
}

/**
 * Wrap a synchronous function execution.
 *
 * @param {Function} fn
 * @param {Function} done
 * @return {Function}
 * @api private
 */

function sync(fn, done) {
  return function () {
    var ret;

    try {
      ret = fn.apply(this, arguments);
    } catch (err) {
      return done(err);
    }

    if (promise(ret)) {
      ret.then(function (value) {
        done(null, value);
      }, done);
    } else {
      ret instanceof Error ? done(ret) : done(null, ret);
    }
  };
}

/**
 * Is `value` a generator?
 *
 * @param {Mixed} value
 * @return {Boolean}
 * @api private
 */

function generator(value) {
  return value && value.constructor && 'GeneratorFunction' == value.constructor.name;
}

/**
 * Is `value` a promise?
 *
 * @param {Mixed} value
 * @return {Boolean}
 * @api private
 */

function promise(value) {
  return value && 'function' == typeof value.then;
}

/**
 * Once
 */

function once(fn) {
  return function () {
    var ret = fn.apply(this, arguments);
    fn = noop;
    return ret;
  };
}
}, {"co":19}],
19: [function(require, module, exports) {

/**
 * slice() reference.
 */

'use strict';

var slice = Array.prototype.slice;

/**
 * Expose `co`.
 */

module.exports = co;

/**
 * Wrap the given generator `fn` and
 * return a thunk.
 *
 * @param {Function} fn
 * @return {Function}
 * @api public
 */

function co(fn) {
  var isGenFun = isGeneratorFunction(fn);

  return function (done) {
    var ctx = this;

    // in toThunk() below we invoke co()
    // with a generator, so optimize for
    // this case
    var gen = fn;

    // we only need to parse the arguments
    // if gen is a generator function.
    if (isGenFun) {
      var args = slice.call(arguments),
          len = args.length;
      var hasCallback = len && 'function' == typeof args[len - 1];
      done = hasCallback ? args.pop() : error;
      gen = fn.apply(this, args);
    } else {
      done = done || error;
    }

    next();

    // #92
    // wrap the callback in a setImmediate
    // so that any of its errors aren't caught by `co`
    function exit(err, res) {
      setImmediate(function () {
        done.call(ctx, err, res);
      });
    }

    function next(err, res) {
      var ret;

      // multiple args
      if (arguments.length > 2) res = slice.call(arguments, 1);

      // error
      if (err) {
        try {
          ret = gen['throw'](err);
        } catch (e) {
          return exit(e);
        }
      }

      // ok
      if (!err) {
        try {
          ret = gen.next(res);
        } catch (e) {
          return exit(e);
        }
      }

      // done
      if (ret.done) return exit(null, ret.value);

      // normalize
      ret.value = toThunk(ret.value, ctx);

      // run
      if ('function' == typeof ret.value) {
        var called = false;
        try {
          ret.value.call(ctx, function () {
            if (called) return;
            called = true;
            next.apply(ctx, arguments);
          });
        } catch (e) {
          setImmediate(function () {
            if (called) return;
            called = true;
            next(e);
          });
        }
        return;
      }

      // invalid
      next(new TypeError('You may only yield a function, promise, generator, array, or object, ' + 'but the following was passed: "' + String(ret.value) + '"'));
    }
  };
}

/**
 * Convert `obj` into a normalized thunk.
 *
 * @param {Mixed} obj
 * @param {Mixed} ctx
 * @return {Function}
 * @api private
 */

function toThunk(obj, ctx) {

  if (isGeneratorFunction(obj)) {
    return co(obj.call(ctx));
  }

  if (isGenerator(obj)) {
    return co(obj);
  }

  if (isPromise(obj)) {
    return promiseToThunk(obj);
  }

  if ('function' == typeof obj) {
    return obj;
  }

  if (isObject(obj) || Array.isArray(obj)) {
    return objectToThunk.call(ctx, obj);
  }

  return obj;
}

/**
 * Convert an object of yieldables to a thunk.
 *
 * @param {Object} obj
 * @return {Function}
 * @api private
 */

function objectToThunk(obj) {
  var ctx = this;
  var isArray = Array.isArray(obj);

  return function (done) {
    var keys = Object.keys(obj);
    var pending = keys.length;
    var results = isArray ? new Array(pending) // predefine the array length
    : new obj.constructor();
    var finished;

    if (!pending) {
      setImmediate(function () {
        done(null, results);
      });
      return;
    }

    // prepopulate object keys to preserve key ordering
    if (!isArray) {
      for (var i = 0; i < pending; i++) {
        results[keys[i]] = undefined;
      }
    }

    for (var i = 0; i < keys.length; i++) {
      run(obj[keys[i]], keys[i]);
    }

    function run(fn, key) {
      if (finished) return;
      try {
        fn = toThunk(fn, ctx);

        if ('function' != typeof fn) {
          results[key] = fn;
          return --pending || done(null, results);
        }

        fn.call(ctx, function (err, res) {
          if (finished) return;

          if (err) {
            finished = true;
            return done(err);
          }

          results[key] = res;
          --pending || done(null, results);
        });
      } catch (err) {
        finished = true;
        done(err);
      }
    }
  };
}

/**
 * Convert `promise` to a thunk.
 *
 * @param {Object} promise
 * @return {Function}
 * @api private
 */

function promiseToThunk(promise) {
  return function (fn) {
    promise.then(function (res) {
      fn(null, res);
    }, fn);
  };
}

/**
 * Check if `obj` is a promise.
 *
 * @param {Object} obj
 * @return {Boolean}
 * @api private
 */

function isPromise(obj) {
  return obj && 'function' == typeof obj.then;
}

/**
 * Check if `obj` is a generator.
 *
 * @param {Mixed} obj
 * @return {Boolean}
 * @api private
 */

function isGenerator(obj) {
  return obj && 'function' == typeof obj.next && 'function' == typeof obj['throw'];
}

/**
 * Check if `obj` is a generator function.
 *
 * @param {Mixed} obj
 * @return {Boolean}
 * @api private
 */

function isGeneratorFunction(obj) {
  return obj && obj.constructor && 'GeneratorFunction' == obj.constructor.name;
}

/**
 * Check for plain object.
 *
 * @param {Mixed} val
 * @return {Boolean}
 * @api private
 */

function isObject(val) {
  return val && Object == val.constructor;
}

/**
 * Throw `err` in a new stack.
 *
 * This is used when co() is invoked
 * without supplying a callback, which
 * should only be for demonstrational
 * purposes.
 *
 * @param {Error} err
 * @api private
 */

function error(err) {
  if (!err) return;
  setImmediate(function () {
    throw err;
  });
}
}, {}],
14: [function(require, module, exports) {
/**
 * @author Titus Wormer
 * @copyright 2015 Titus Wormer. All rights reserved.
 * @module Parse
 * @fileoverview Parse a markdown document into an
 *   abstract syntax tree.
 */

'use strict';

/*
 * Dependencies.
 */

var he = require('he');
var repeat = require('repeat-string');
var utilities = require('./utilities.js');
var defaultExpressions = require('./expressions.js');
var defaultOptions = require('./defaults.js').parse;

/*
 * Methods.
 */

var clone = utilities.clone;
var copy = utilities.copy;
var raise = utilities.raise;
var trim = utilities.trim;
var trimRightLines = utilities.trimRightLines;
var clean = utilities.clean;
var validate = utilities.validate;
var normalize = utilities.normalizeIdentifier;
var objectCreate = utilities.create;
var arrayPush = [].push;

/*
 * Characters.
 */

var AT_SIGN = '@';
var CARET = '^';
var EQUALS = '=';
var EXCLAMATION_MARK = '!';
var MAILTO_PROTOCOL = 'mailto:';
var NEW_LINE = '\n';
var SPACE = ' ';
var TAB = '\t';
var EMPTY = '';
var LT = '<';
var GT = '>';
var BRACKET_OPEN = '[';

/*
 * Types.
 */

var BLOCK = 'block';
var INLINE = 'inline';
var HORIZONTAL_RULE = 'horizontalRule';
var HTML = 'html';
var YAML = 'yaml';
var TABLE = 'table';
var TABLE_CELL = 'tableCell';
var TABLE_HEADER = 'tableHeader';
var TABLE_ROW = 'tableRow';
var PARAGRAPH = 'paragraph';
var TEXT = 'text';
var CODE = 'code';
var LIST = 'list';
var LIST_ITEM = 'listItem';
var FOOTNOTE_DEFINITION = 'footnoteDefinition';
var HEADING = 'heading';
var BLOCKQUOTE = 'blockquote';
var LINK = 'link';
var IMAGE = 'image';
var FOOTNOTE = 'footnote';
var ESCAPE = 'escape';
var STRONG = 'strong';
var EMPHASIS = 'emphasis';
var DELETE = 'delete';
var INLINE_CODE = 'inlineCode';
var BREAK = 'break';
var ROOT = 'root';

/**
 * Wrapper around he's `decode` function.
 *
 * @example
 *   decode('&amp;'); // '&'
 *   decode('&amp'); // '&'
 *
 * @param {string} value
 * @param {function(string)} eat
 * @return {string}
 * @throws {Error} - When `eat.file.quiet` is not `true`.
 *   However, by default `he` does not throw on incorrect
 *   encoded entities, but when
 *   `he.decode.options.strict: true`, they occur on
 *   entities with a missing closing semi-colon.
 */
function decode(value, eat) {
    try {
        return he.decode(value);
    } catch (exception) {
        eat.file.fail(exception, eat.now());
    }
}

/**
 * Factory to de-escape a value, based on an expression
 * at `key` in `scope`.
 *
 * @example
 *   var expressions = {escape: /\\(a)/}
 *   var descape = descapeFactory(expressions, 'escape');
 *
 * @param {Object} scope - Map of expressions.
 * @param {string} key - Key in `map` at which the
 *   non-global expression exists.
 * @return {function(string): string} - Function which
 *   takes a value and returns its unescaped version.
 */
function descapeFactory(scope, key) {
    var globalExpression;
    var expression;

    /**
     * Private method to get a global expression
     * from the expression at `key` in `scope`.
     * This method is smart about not recreating
     * the expressions every time.
     *
     * @private
     * @return {RegExp}
     */
    function generate() {
        if (scope[key] !== globalExpression) {
            globalExpression = scope[key];
            expression = new RegExp(scope[key].source.replace(CARET, EMPTY), 'g');
        }

        return expression;
    }

    /**
     * De-escape a string using the expression at `key`
     * in `scope`.
     *
     * @example
     *   var expressions = {escape: /\\(a)/}
     *   var descape = descapeFactory(expressions, 'escape');
     *   descape('\a'); // 'a'
     *
     * @param {string} value - Escaped string.
     * @return {string} - Unescaped string.
     */
    function descape(value) {
        return value.replace(generate(), '$1');
    }

    return descape;
}

/*
 * Tab size.
 */

var TAB_SIZE = 4;

/*
 * Expressions.
 */

var EXPRESSION_RIGHT_ALIGNMENT = /^[ \t]*-+:[ \t]*$/;
var EXPRESSION_CENTER_ALIGNMENT = /^[ \t]*:-+:[ \t]*$/;
var EXPRESSION_LEFT_ALIGNMENT = /^[ \t]*:-+[ \t]*$/;
var EXPRESSION_TABLE_FENCE = /^[ \t]*|\|[ \t]*$/g;
var EXPRESSION_TABLE_INITIAL = /^[ \t]*\|[ \t]*/g;
var EXPRESSION_TABLE_CONTENT = /((?:\\[\s\S]|[^\|])+?)([ \t]?\|[ \t]?\n?|\n?$)/g;
var EXPRESSION_TABLE_BORDER = /[ \t]*\|[ \t]*/;
var EXPRESSION_BLOCK_QUOTE = /^[ \t]*>[ \t]?/gm;
var EXPRESSION_BULLET = /^([ \t]*)([*+-]|\d+[.)])( {1,4}(?! )| |\t)([^\n]*)/;
var EXPRESSION_PEDANTIC_BULLET = /^([ \t]*)([*+-]|\d+[.)])([ \t]+)/;
var EXPRESSION_INITIAL_INDENT = /^( {1,4}|\t)?/gm;
var EXPRESSION_INITIAL_TAB = /^( {4}|\t)?/gm;
var EXPRESSION_HTML_LINK_OPEN = /^<a /i;
var EXPRESSION_HTML_LINK_CLOSE = /^<\/a>/i;
var EXPRESSION_LOOSE_LIST_ITEM = /\n\n(?!\s*$)/;
var EXPRESSION_TASK_ITEM = /^\[([\ \t]|x|X)\][\ \t]/;

/*
 * A map of characters, and their column length,
 * which can be used as indentation.
 */

var INDENTATION_CHARACTERS = objectCreate();

INDENTATION_CHARACTERS[SPACE] = SPACE.length;
INDENTATION_CHARACTERS[TAB] = TAB_SIZE;

/**
 * Gets indentation information for a line.
 *
 * @example
 *   getIndent('  foo');
 *   // {indent: 2, stops: {1: 0, 2: 1}}
 *
 *   getIndent('\tfoo');
 *   // {indent: 4, stops: {4: 0}}
 *
 *   getIndent('  \tfoo');
 *   // {indent: 4, stops: {1: 0, 2: 1, 4: 2}}
 *
 *   getIndent('\t  foo')
 *   // {indent: 6, stops: {4: 0, 5: 1, 6: 2}}
 *
 * @param {string} value - Indented line.
 * @return {Object}
 */
function getIndent(value) {
    var index = 0;
    var indent = 0;
    var character = value.charAt(index);
    var stops = {};
    var size;

    while (character in INDENTATION_CHARACTERS) {
        size = INDENTATION_CHARACTERS[character];

        indent += size;

        if (size > 1) {
            indent = Math.floor(indent / size) * size;
        }

        stops[indent] = index;

        character = value.charAt(++index);
    }

    return {
        'indent': indent,
        'stops': stops
    };
}

/**
 * Remove the minimum indent from every line in `value`.
 * Supports both tab, spaced, and mixed indentation (as
 * well as possible).
 *
 * @example
 *   removeIndentation('  foo'); // 'foo'
 *   removeIndentation('    foo', 2); // '  foo'
 *   removeIndentation('\tfoo', 2); // '  foo'
 *   removeIndentation('  foo\n bar'); // ' foo\n bar'
 *
 * @param {string} value
 * @param {number?} [maximum] - Maximum indentation
 *   to remove.
 * @return {string} - Unindented `value`.
 */
function removeIndentation(value, maximum) {
    var values = value.split(NEW_LINE);
    var position = values.length + 1;
    var minIndent = Infinity;
    var matrix = [];
    var index;
    var indentation;
    var stops;
    var padding;

    values.unshift(repeat(SPACE, maximum) + EXCLAMATION_MARK);

    while (position--) {
        indentation = getIndent(values[position]);

        matrix[position] = indentation.stops;

        if (trim(values[position]).length === 0) {
            continue;
        }

        if (indentation.indent) {
            if (indentation.indent > 0 && indentation.indent < minIndent) {
                minIndent = indentation.indent;
            }
        } else {
            minIndent = Infinity;

            break;
        }
    }

    if (minIndent !== Infinity) {
        position = values.length;

        while (position--) {
            stops = matrix[position];
            index = minIndent;

            while (index && !(index in stops)) {
                index--;
            }

            if (trim(values[position]).length !== 0 && minIndent && index !== minIndent) {
                padding = TAB;
            } else {
                padding = EMPTY;
            }

            values[position] = padding + values[position].slice(index in stops ? stops[index] + 1 : 0);
        }
    }

    values.shift();

    return values.join(NEW_LINE);
}

/**
 * Ensure that `value` is at least indented with
 * `indent` spaces.  Does not support tabs. Does support
 * multiple lines.
 *
 * @example
 *   ensureIndentation('foo', 2); // '  foo'
 *   ensureIndentation('  foo', 4); // '    foo'
 *
 * @param {string} value
 * @param {number} indent - The maximum amount of
 *   spacing to insert.
 * @return {string} - indented `value`.
 */
function ensureIndentation(value, indent) {
    var values = value.split(NEW_LINE);
    var length = values.length;
    var index = -1;
    var line;
    var position;

    while (++index < length) {
        line = values[index];

        position = -1;

        while (++position < indent) {
            if (line.charAt(position) !== SPACE) {
                values[index] = repeat(SPACE, indent - position) + line;
                break;
            }
        }
    }

    return values.join(NEW_LINE);
}

/**
 * Get the alignment from a table rule.
 *
 * @example
 *   getAlignment([':-', ':-:', '-:', '--']);
 *   // ['left', 'center', 'right', null];
 *
 * @param {Array.<string>} cells
 * @return {Array.<string?>}
 */
function getAlignment(cells) {
    var results = [];
    var index = -1;
    var length = cells.length;
    var alignment;

    while (++index < length) {
        alignment = cells[index];

        if (EXPRESSION_RIGHT_ALIGNMENT.test(alignment)) {
            results[index] = 'right';
        } else if (EXPRESSION_CENTER_ALIGNMENT.test(alignment)) {
            results[index] = 'center';
        } else if (EXPRESSION_LEFT_ALIGNMENT.test(alignment)) {
            results[index] = 'left';
        } else {
            results[index] = null;
        }
    }

    return results;
}

/**
 * Construct a state `toggler`: a function which inverses
 * `property` in context based on its current value.
 * The by `toggler` returned function restores that value.
 *
 * @example
 *   var context = {};
 *   var key = 'foo';
 *   var val = true;
 *   context[key] = val;
 *   context.enter = stateToggler(key, val);
 *   context[key]; // true
 *   var exit = context.enter();
 *   context[key]; // false
 *   var nested = context.enter();
 *   context[key]; // false
 *   nested();
 *   context[key]; // false
 *   exit();
 *   context[key]; // true
 *
 * @param {string} key - Property to toggle.
 * @param {boolean} state - It's default state.
 * @return {function(): function()} - Enter.
 */
function stateToggler(key, state) {
    /**
     * Construct a toggler for the bound `key`.
     *
     * @return {Function} - Exit state.
     */
    function enter() {
        var self = this;
        var current = self[key];

        self[key] = !state;

        /**
         * State canceler, cancels the state, if allowed.
         */
        function exit() {
            self[key] = current;
        }

        return exit;
    }

    return enter;
}

/**
 * Construct a state toggler which doesn't toggle.
 *
 * @example
 *   var context = {};
 *   var key = 'foo';
 *   var val = true;
 *   context[key] = val;
 *   context.enter = noopToggler();
 *   context[key]; // true
 *   var exit = context.enter();
 *   context[key]; // true
 *   exit();
 *   context[key]; // true
 *
 * @return {function(): function()} - Enter.
 */
function noopToggler() {
    /**
     * No-operation.
     */
    function exit() {}

    /**
     * @return {Function}
     */
    function enter() {
        return exit;
    }

    return enter;
}

/*
 * Define nodes of a type which can be merged.
 */

var MERGEABLE_NODES = objectCreate();

/**
 * Merge two text nodes: `token` into `prev`.
 *
 * @param {Object} prev - Preceding sibling.
 * @param {Object} token - Following sibling.
 * @return {Object} - `prev`.
 */
MERGEABLE_NODES.text = function (prev, token) {
    prev.value += token.value;

    return prev;
};

/**
 * Merge two blockquotes: `token` into `prev`, unless in
 * CommonMark mode.
 *
 * @param {Object} prev - Preceding sibling.
 * @param {Object} token - Following sibling.
 * @return {Object} - `prev`, or `token` in CommonMark mode.
 */
MERGEABLE_NODES.blockquote = function (prev, token) {
    if (this.options.commonmark) {
        return token;
    }

    prev.children = prev.children.concat(token.children);

    return prev;
};

/**
 * Merge two lists: `token` into `prev`. Knows, about
 * which bullets were used.
 *
 * @param {Object} prev - Preceding sibling.
 * @param {Object} token - Following sibling.
 * @return {Object} - `prev`, or `token` when the lists are
 *   of different types (a different bullet is used).
 */
MERGEABLE_NODES.list = function (prev, token) {
    if (!this.currentBullet || this.currentBullet !== this.previousBullet || this.currentBullet.length !== 1) {
        return token;
    }

    prev.children = prev.children.concat(token.children);

    return prev;
};

/**
 * Tokenise a line.  Unsets `currentBullet` and
 * `previousBullet` if more than one lines are found, thus
 * preventing lists from merging when they use different
 * bullets.
 *
 * @example
 *   tokenizeNewline(eat, '\n\n');
 *
 * @param {function(string)} eat
 * @param {string} $0 - Lines.
 */
function tokenizeNewline(eat, $0) {
    if ($0.length > 1) {
        this.currentBullet = null;
        this.previousBullet = null;
    }

    eat($0);
}

/**
 * Tokenise an indented code block.
 *
 * @example
 *   tokenizeCode(eat, '\tfoo');
 *
 * @param {function(string)} eat
 * @param {string} $0 - Whole code.
 * @return {Node} - `code` node.
 */
function tokenizeCode(eat, $0) {
    $0 = trimRightLines($0);

    return eat($0)(this.renderCodeBlock(removeIndentation($0, TAB_SIZE), null, eat));
}

/**
 * Tokenise a fenced code block.
 *
 * @example
 *   var $0 = '```js\nfoo()\n```';
 *   tokenizeFences(eat, $0, '', '```', '`', 'js', 'foo()\n');
 *
 * @param {function(string)} eat
 * @param {string} $0 - Whole code.
 * @param {string} $1 - Initial spacing.
 * @param {string} $2 - Initial fence.
 * @param {string} $3 - Fence marker.
 * @param {string} $4 - Programming language flag.
 * @param {string} $5 - Content.
 * @return {Node} - `code` node.
 */
function tokenizeFences(eat, $0, $1, $2, $3, $4, $5) {
    $0 = trimRightLines($0);

    /*
     * If the initial fence was preceded by spaces,
     * exdent that amount of white space from the code
     * block.  Because it's possible that the code block
     * is exdented, we first have to ensure at least
     * those spaces are available.
     */

    if ($1) {
        $5 = removeIndentation(ensureIndentation($5, $1.length), $1.length);
    }

    return eat($0)(this.renderCodeBlock($5, $4, eat));
}

/**
 * Tokenise an ATX-style heading.
 *
 * @example
 *   tokenizeHeading(eat, ' # foo', ' ', '#', ' ', 'foo');
 *
 * @param {function(string)} eat
 * @param {string} $0 - Whole heading.
 * @param {string} $1 - Initial spacing.
 * @param {string} $2 - Hashes.
 * @param {string} $3 - Internal spacing.
 * @param {string} $4 - Content.
 * @return {Node} - `heading` node.
 */
function tokenizeHeading(eat, $0, $1, $2, $3, $4) {
    var now = eat.now();

    now.column += ($1 + $2 + ($3 || '')).length;

    return eat($0)(this.renderHeading($4, $2.length, now));
}

/**
 * Tokenise a Setext-style heading.
 *
 * @example
 *   tokenizeLineHeading(eat, 'foo\n===', '', 'foo', '=');
 *
 * @param {function(string)} eat
 * @param {string} $0 - Whole heading.
 * @param {string} $1 - Initial spacing.
 * @param {string} $2 - Content.
 * @param {string} $3 - Underline marker.
 * @return {Node} - `heading` node.
 */
function tokenizeLineHeading(eat, $0, $1, $2, $3) {
    var now = eat.now();

    now.column += $1.length;

    return eat($0)(this.renderHeading($2, $3 === EQUALS ? 1 : 2, now));
}

/**
 * Tokenise a horizontal rule.
 *
 * @example
 *   tokenizeHorizontalRule(eat, '***');
 *
 * @param {function(string)} eat
 * @param {string} $0 - Whole rule.
 * @return {Node} - `horizontalRule` node.
 */
function tokenizeHorizontalRule(eat, $0) {
    return eat($0)(this.renderVoid(HORIZONTAL_RULE));
}

/**
 * Tokenise a blockquote.
 *
 * @example
 *   tokenizeBlockquote(eat, '> Foo');
 *
 * @param {function(string)} eat
 * @param {string} $0 - Whole blockquote.
 * @return {Node} - `blockquote` node.
 */
function tokenizeBlockquote(eat, $0) {
    var now = eat.now();
    var indent = this.indent(now.line);
    var value = trimRightLines($0);
    var add = eat(value);

    value = value.replace(EXPRESSION_BLOCK_QUOTE, function (prefix) {
        indent(prefix.length);

        return '';
    });

    return add(this.renderBlockquote(value, now));
}

/**
 * Tokenise a list.
 *
 * @example
 *   tokenizeList(eat, '- Foo', '', '-');
 *
 * @param {function(string)} eat
 * @param {string} $0 - Whole list.
 * @param {string} $1 - Indent.
 * @param {string} $2 - Bullet.
 * @return {Node} - `list` node.
 */
function tokenizeList(eat, $0, $1, $2) {
    var self = this;
    var firstBullet = $2;
    var value = trimRightLines($0);
    var matches = value.match(self.rules.item);
    var length = matches.length;
    var index = 0;
    var isLoose = false;
    var now;
    var bullet;
    var item;
    var enterTop;
    var exitBlockquote;
    var node;
    var indent;
    var size;
    var position;
    var end;

    /*
     * Determine if all list-items belong to the
     * same list.
     */

    if (!self.options.pedantic) {
        while (++index < length) {
            bullet = self.rules.bullet.exec(matches[index])[0];

            if (firstBullet !== bullet && (firstBullet.length === 1 && bullet.length === 1 || bullet.charAt(bullet.length - 1) !== firstBullet.charAt(firstBullet.length - 1))) {
                matches = matches.slice(0, index);
                matches[index - 1] = trimRightLines(matches[index - 1]);

                length = matches.length;

                break;
            }
        }
    }

    if (self.options.commonmark) {
        index = -1;

        while (++index < length) {
            item = matches[index];
            indent = self.rules.indent.exec(item);
            indent = indent[1] + repeat(SPACE, indent[2].length) + indent[3];
            size = getIndent(indent).indent;
            position = indent.length;
            end = item.length;

            while (++position < end) {
                if (item.charAt(position) === NEW_LINE && item.charAt(position - 1) === NEW_LINE && getIndent(item.slice(position + 1)).indent < size) {
                    matches[index] = item.slice(0, position - 1);

                    matches = matches.slice(0, index + 1);
                    length = matches.length;

                    break;
                }
            }
        }
    }

    self.previousBullet = self.currentBullet;
    self.currentBullet = firstBullet;

    index = -1;

    node = eat(matches.join(NEW_LINE)).reset(self.renderList([], firstBullet));

    enterTop = self.exitTop();
    exitBlockquote = self.enterBlockquote();

    while (++index < length) {
        item = matches[index];
        now = eat.now();

        item = eat(item)(self.renderListItem(item, now), node);

        if (item.loose) {
            isLoose = true;
        }

        if (index !== length - 1) {
            eat(NEW_LINE);
        }
    }

    node.loose = isLoose;

    enterTop();
    exitBlockquote();

    return node;
}

/**
 * Tokenise HTML.
 *
 * @example
 *   tokenizeHtml(eat, '<span>foo</span>');
 *
 * @param {function(string)} eat
 * @param {string} $0 - Whole HTML.
 * @return {Node} - `html` node.
 */
function tokenizeHtml(eat, $0) {
    $0 = trimRightLines($0);

    return eat($0)(this.renderRaw(HTML, $0));
}

/**
 * Tokenise a definition.
 *
 * @example
 *   var $0 = '[foo]: http://example.com "Example Domain"';
 *   var $1 = 'foo';
 *   var $2 = 'http://example.com';
 *   var $3 = 'Example Domain';
 *   tokenizeDefinition(eat, $0, $1, $2, $3);
 *
 * @property {boolean} onlyAtTop
 * @property {boolean} notInBlockquote
 * @param {function(string)} eat
 * @param {string} $0 - Whole definition.
 * @param {string} $1 - Key.
 * @param {string} $2 - URL.
 * @param {string} $3 - Title.
 * @return {Node} - `definition` node.
 */
function tokenizeDefinition(eat, $0, $1, $2, $3) {
    var link = $2;

    /*
     * Remove angle-brackets from `link`.
     */

    if (link.charAt(0) === LT && link.charAt(link.length - 1) === GT) {
        link = link.slice(1, -1);
    }

    return eat($0)({
        'type': 'definition',
        'identifier': normalize($1),
        'title': $3 ? decode(this.descape($3), eat) : null,
        'link': decode(this.descape(link), eat)
    });
}

tokenizeDefinition.onlyAtTop = true;
tokenizeDefinition.notInBlockquote = true;

/**
 * Tokenise YAML front matter.
 *
 * @example
 *   var $0 = '---\nfoo: bar\n---';
 *   var $1 = 'foo: bar';
 *   tokenizeYAMLFrontMatter(eat, $0, $1);
 *
 * @property {boolean} onlyAtStart
 * @param {function(string)} eat
 * @param {string} $0 - Whole front matter.
 * @param {string} $1 - Content.
 * @return {Node} - `yaml` node.
 */
function tokenizeYAMLFrontMatter(eat, $0, $1) {
    return eat($0)(this.renderRaw(YAML, $1 ? trimRightLines($1) : EMPTY));
}

tokenizeYAMLFrontMatter.onlyAtStart = true;

/**
 * Tokenise a footnote definition.
 *
 * @example
 *   var $0 = '[foo]: Bar.';
 *   var $1 = '[foo]';
 *   var $2 = 'foo';
 *   var $3 = 'Bar.';
 *   tokenizeFootnoteDefinition(eat, $0, $1, $2, $3);
 *
 * @property {boolean} onlyAtTop
 * @property {boolean} notInBlockquote
 * @param {function(string)} eat
 * @param {string} $0 - Whole definition.
 * @param {string} $1 - Whole key.
 * @param {string} $2 - Key.
 * @param {string} $3 - Whole value.
 * @return {Node} - `footnoteDefinition` node.
 */
function tokenizeFootnoteDefinition(eat, $0, $1, $2, $3) {
    var self = this;
    var now = eat.now();
    var indent = self.indent(now.line);

    $3 = $3.replace(EXPRESSION_INITIAL_TAB, function (value) {
        indent(value.length);

        return EMPTY;
    });

    now.column += $1.length;

    return eat($0)(self.renderFootnoteDefinition(normalize($2), $3, now));
}

tokenizeFootnoteDefinition.onlyAtTop = true;
tokenizeFootnoteDefinition.notInBlockquote = true;

/**
 * Tokenise a table.
 *
 * @example
 *   var $0 = ' | foo |\n | --- |\n | bar |';
 *   var $1 = ' | foo |';
 *   var $2 = '| foo |';
 *   var $3 = ' | --- |';
 *   var $4 = '| --- |';
 *   var $5 = ' | bar |';
 *   tokenizeTable(eat, $0, $1, $2, $3, $4, $5);
 *
 * @property {boolean} onlyAtTop
 * @param {function(string)} eat
 * @param {string} $0 - Whole table.
 * @param {string} $1 - Whole heading.
 * @param {string} $2 - Trimmed heading.
 * @param {string} $3 - Whole alignment.
 * @param {string} $4 - Trimmed alignment.
 * @param {string} $5 - Rows.
 * @return {Node} - `table` node.
 */
function tokenizeTable(eat, $0, $1, $2, $3, $4, $5) {
    var self = this;
    var now;
    var node;
    var index;
    var length;

    $0 = trimRightLines($0);

    node = eat($0).reset({
        'type': TABLE,
        'align': [],
        'children': []
    });

    /**
     * Eat a fence.  Returns an empty string so it can be
     * passed to `String#replace()`.
     *
     * @param {string} value - Fence.
     * @return {string} - Empty string.
     */
    function eatFence(value) {
        eat(value);

        return EMPTY;
    }

    /**
     * Factory to eat a cell to a bound `row`.
     *
     * @param {Object} row - Parent to add cells to.
     * @return {Function} - `eatCell` bound to `row`.
     */
    function eatCellFactory(row) {
        /**
         * Eat a cell.  Returns an empty string so it can be
         * passed to `String#replace()`.
         *
         * @param {string} value - Complete match.
         * @param {string} content - Cell content.
         * @param {string} pipe - Fence.
         * @return {string} - Empty string.
         */
        function eatCell(value, content, pipe) {
            var cell = utilities.trimLeft(content);

            now = eat.now();

            now.column += content.length - cell.length;

            eat(content)(self.renderInline(TABLE_CELL, utilities.trimRight(cell), now), row);

            eat(pipe);

            return EMPTY;
        }

        return eatCell;
    }

    /**
     * Eat a row of type `type`.
     *
     * @param {string} type - Type of the returned node,
     *   such as `tableHeader` or `tableRow`.
     * @param {string} value - Row, including initial and
     *   final fences.
     */
    function renderRow(type, value) {
        var row = eat(value).reset(self.renderParent(type, []), node);

        value.replace(EXPRESSION_TABLE_INITIAL, eatFence).replace(EXPRESSION_TABLE_CONTENT, eatCellFactory(row));
    }

    /*
     * Add the table's header.
     */

    renderRow(TABLE_HEADER, $1);

    eat(NEW_LINE);

    /*
     * Add the table's alignment.
     */

    eat($3);

    $4 = $4.replace(EXPRESSION_TABLE_FENCE, EMPTY).split(EXPRESSION_TABLE_BORDER);

    node.align = getAlignment($4);

    /*
     * Add the table rows to table's children.
     */

    $5 = trimRightLines($5).split(NEW_LINE);

    index = -1;
    length = $5.length;

    while (++index < length) {
        renderRow(TABLE_ROW, $5[index]);

        if (index !== length - 1) {
            eat(NEW_LINE);
        }
    }

    return node;
}

tokenizeTable.onlyAtTop = true;

/**
 * Tokenise a paragraph token.
 *
 * @example
 *   tokenizeParagraph(eat, 'Foo.');
 *
 * @param {function(string)} eat
 * @param {string} $0 - Whole paragraph.
 * @return {Node?} - `paragraph` node, when the node does
 *   not just contain white space.
 */
function tokenizeParagraph(eat, $0) {
    var now = eat.now();

    if (trim($0) === EMPTY) {
        eat($0);

        return null;
    }

    $0 = trimRightLines($0);

    return eat($0)(this.renderInline(PARAGRAPH, $0, now));
}

/**
 * Tokenise a text token.
 *
 * @example
 *   tokenizeText(eat, 'foo');
 *
 * @param {function(string)} eat
 * @param {string} $0 - Whole text.
 * @return {Node} - `text` node.
 */
function tokenizeText(eat, $0) {
    return eat($0)(this.renderRaw(TEXT, $0));
}

/**
 * Create a code-block token.
 *
 * @example
 *   renderCodeBlock('foo()', 'js', now());
 *
 * @param {string?} [value] - Code.
 * @param {string?} [language] - Optional language flag.
 * @param {Function} eat
 * @return {Object} - `code` node.
 */
function renderCodeBlock(value, language, eat) {
    return {
        'type': CODE,
        'lang': language ? decode(this.descape(language), eat) : null,
        'value': trimRightLines(value || EMPTY)
    };
}

/**
 * Create a list token.
 *
 * @example
 *   var children = [renderListItem('- foo')];
 *   renderList(children, '-');
 *
 * @param {string} children - Children.
 * @param {string} bullet - First bullet.
 * @return {Object} - `list` node.
 */
function renderList(children, bullet) {
    var start = parseInt(bullet, 10);

    if (start !== start) {
        start = null;
    }

    /*
     * `loose` should be added later.
     */

    return {
        'type': LIST,
        'ordered': bullet.length > 1,
        'start': start,
        'loose': null,
        'children': children
    };
}

/**
 * Create a list-item using overly simple mechanics.
 *
 * @example
 *   renderPedanticListItem('- _foo_', now());
 *
 * @param {string} value - List-item.
 * @param {Object} position - List-item location.
 * @return {string} - Cleaned `value`.
 */
function renderPedanticListItem(value, position) {
    var self = this;
    var indent = self.indent(position.line);

    /**
     * A simple replacer which removed all matches,
     * and adds their length to `offset`.
     *
     * @param {string} $0
     * @return {string}
     */
    function replacer($0) {
        indent($0.length);

        return EMPTY;
    }

    /*
     * Remove the list-item's bullet.
     */

    value = value.replace(EXPRESSION_PEDANTIC_BULLET, replacer);

    /*
     * The initial line was also matched by the below, so
     * we reset the `line`.
     */

    indent = self.indent(position.line);

    return value.replace(EXPRESSION_INITIAL_INDENT, replacer);
}

/**
 * Create a list-item using sane mechanics.
 *
 * @example
 *   renderNormalListItem('- _foo_', now());
 *
 * @param {string} value - List-item.
 * @param {Object} position - List-item location.
 * @return {string} - Cleaned `value`.
 */
function renderNormalListItem(value, position) {
    var self = this;
    var indent = self.indent(position.line);
    var bullet;
    var rest;
    var lines;
    var trimmedLines;
    var index;
    var length;
    var max;

    /*
     * Remove the list-item's bullet.
     */

    value = value.replace(EXPRESSION_BULLET, function ($0, $1, $2, $3, $4) {
        bullet = $1 + $2 + $3;
        rest = $4;

        /*
         * Make sure that the first nine numbered list items
         * can indent with an extra space.  That is, when
         * the bullet did not receive an extra final space.
         */

        if (Number($2) < 10 && bullet.length % 2 === 1) {
            $2 = SPACE + $2;
        }

        max = $1 + repeat(SPACE, $2.length) + $3;

        return max + rest;
    });

    lines = value.split(NEW_LINE);

    trimmedLines = removeIndentation(value, getIndent(max).indent).split(NEW_LINE);

    /*
     * We replaced the initial bullet with something
     * else above, which was used to trick
     * `removeIndentation` into removing some more
     * characters when possible. However, that could
     * result in the initial line to be stripped more
     * than it should be.
     */

    trimmedLines[0] = rest;

    indent(bullet.length);

    index = 0;
    length = lines.length;

    while (++index < length) {
        indent(lines[index].length - trimmedLines[index].length);
    }

    return trimmedLines.join(NEW_LINE);
}

/*
 * A map of two functions which can create list items.
 */

var LIST_ITEM_MAP = objectCreate();

LIST_ITEM_MAP['true'] = renderPedanticListItem;
LIST_ITEM_MAP['false'] = renderNormalListItem;

/**
 * Create a list-item token.
 *
 * @example
 *   renderListItem('- _foo_', now());
 *
 * @param {Object} value - List-item.
 * @param {Object} position - List-item location.
 * @return {Object} - `listItem` node.
 */
function renderListItem(value, position) {
    var self = this;
    var checked = null;
    var node;
    var task;
    var indent;

    value = LIST_ITEM_MAP[self.options.pedantic].apply(self, arguments);

    if (self.options.gfm) {
        task = value.match(EXPRESSION_TASK_ITEM);

        if (task) {
            indent = task[0].length;
            checked = task[1].toLowerCase() === 'x';

            self.indent(position.line)(indent);
            value = value.slice(indent);
        }
    }

    node = {
        'type': LIST_ITEM,
        'loose': EXPRESSION_LOOSE_LIST_ITEM.test(value) || value.charAt(value.length - 1) === NEW_LINE
    };

    if (self.options.gfm) {
        node.checked = checked;
    }

    node.children = self.tokenizeBlock(value, position);

    return node;
}

/**
 * Create a footnote-definition token.
 *
 * @example
 *   renderFootnoteDefinition('1', '_foo_', now());
 *
 * @param {string} identifier - Unique reference.
 * @param {string} value - Contents
 * @param {Object} position - Definition location.
 * @return {Object} - `footnoteDefinition` node.
 */
function renderFootnoteDefinition(identifier, value, position) {
    var self = this;
    var exitBlockquote = self.enterBlockquote();
    var token;

    token = {
        'type': FOOTNOTE_DEFINITION,
        'identifier': identifier,
        'children': self.tokenizeBlock(value, position)
    };

    exitBlockquote();

    return token;
}

/**
 * Create a heading token.
 *
 * @example
 *   renderHeading('_foo_', 1, now());
 *
 * @param {string} value - Content.
 * @param {number} depth - Heading depth.
 * @param {Object} position - Heading content location.
 * @return {Object} - `heading` node
 */
function renderHeading(value, depth, position) {
    return {
        'type': HEADING,
        'depth': depth,
        'children': this.tokenizeInline(value, position)
    };
}

/**
 * Create a blockquote token.
 *
 * @example
 *   renderBlockquote('_foo_', eat);
 *
 * @param {string} value - Content.
 * @param {Object} now - Position.
 * @return {Object} - `blockquote` node.
 */
function renderBlockquote(value, now) {
    var self = this;
    var exitBlockquote = self.enterBlockquote();
    var token = {
        'type': BLOCKQUOTE,
        'children': this.tokenizeBlock(value, now)
    };

    exitBlockquote();

    return token;
}

/**
 * Create a void token.
 *
 * @example
 *   renderVoid('horizontalRule');
 *
 * @param {string} type - Node type.
 * @return {Object} - Node of type `type`.
 */
function renderVoid(type) {
    return {
        'type': type
    };
}

/**
 * Create a parent.
 *
 * @example
 *   renderParent('paragraph', '_foo_');
 *
 * @param {string} type - Node type.
 * @param {Array.<Object>} children - Child nodes.
 * @return {Object} - Node of type `type`.
 */
function renderParent(type, children) {
    return {
        'type': type,
        'children': children
    };
}

/**
 * Create a raw token.
 *
 * @example
 *   renderRaw('inlineCode', 'foo()');
 *
 * @param {string} type - Node type.
 * @param {string} value - Contents.
 * @return {Object} - Node of type `type`.
 */
function renderRaw(type, value) {
    return {
        'type': type,
        'value': value
    };
}

/**
 * Create a link token.
 *
 * @example
 *   renderLink(true, 'example.com', 'example', 'Example Domain', now(), eat);
 *   renderLink(false, 'fav.ico', 'example', 'Example Domain', now(), eat);
 *
 * @param {boolean} isLink - Whether linking to a document
 *   or an image.
 * @param {string} href - URI reference.
 * @param {string} text - Content.
 * @param {string?} title - Title.
 * @param {Object} position - Location of link.
 * @param {function(string)} eat
 * @return {Object} - `link` or `image` node.
 */
function renderLink(isLink, href, text, title, position, eat) {
    var self = this;
    var exitLink = self.enterLink();
    var token;

    token = {
        'type': isLink ? LINK : IMAGE,
        'title': title ? decode(self.descape(title), eat) : null
    };

    href = decode(href, eat);

    if (isLink) {
        token.href = href;
        token.children = self.tokenizeInline(text, position);
    } else {
        token.src = href;
        token.alt = text ? decode(self.descape(text), eat) : null;
    }

    exitLink();

    return token;
}

/**
 * Create a footnote token.
 *
 * @example
 *   renderFootnote('_foo_', now());
 *
 * @param {string} value - Contents.
 * @param {Object} position - Location of footnote.
 * @return {Object} - `footnote` node.
 */
function renderFootnote(value, position) {
    return this.renderInline(FOOTNOTE, value, position);
}

/**
 * Add a token with inline content.
 *
 * @example
 *   renderInline('strong', '_foo_', now());
 *
 * @param {string} type - Node type.
 * @param {string} value - Contents.
 * @param {Object} position - Location of node.
 * @return {Object} - Node of type `type`.
 */
function renderInline(type, value, position) {
    return this.renderParent(type, this.tokenizeInline(value, position));
}

/**
 * Add a token with block content.
 *
 * @example
 *   renderBlock('blockquote', 'Foo.', now());
 *
 * @param {string} type - Node type.
 * @param {string} value - Contents.
 * @param {Object} position - Location of node.
 * @return {Object} - Node of type `type`.
 */
function renderBlock(type, value, position) {
    return this.renderParent(type, this.tokenizeBlock(value, position));
}

/**
 * Tokenise an escape sequence.
 *
 * @example
 *   tokenizeEscape(eat, '\\a', 'a');
 *
 * @param {function(string)} eat
 * @param {string} $0 - Whole escape.
 * @param {string} $1 - Escaped character.
 * @return {Node} - `escape` node.
 */
function tokenizeEscape(eat, $0, $1) {
    return eat($0)(this.renderRaw(ESCAPE, $1));
}

/**
 * Tokenise a URL in carets.
 *
 * @example
 *   tokenizeAutoLink(eat, '<http://foo.bar>', 'http://foo.bar', '');
 *
 * @property {boolean} notInLink
 * @param {function(string)} eat
 * @param {string} $0 - Whole link.
 * @param {string} $1 - URL.
 * @param {string?} [$2] - Protocol or at.
 * @return {Node} - `link` node.
 */
function tokenizeAutoLink(eat, $0, $1, $2) {
    var self = this;
    var href = $1;
    var text = $1;
    var now = eat.now();
    var offset = 1;
    var tokenize;
    var node;

    if ($2 === AT_SIGN) {
        if (text.substr(0, MAILTO_PROTOCOL.length).toLowerCase() !== MAILTO_PROTOCOL) {
            href = MAILTO_PROTOCOL + text;
        } else {
            text = text.substr(MAILTO_PROTOCOL.length);
            offset += MAILTO_PROTOCOL.length;
        }
    }

    now.column += offset;

    /*
     * Temporarily remove support for escapes in autolinks.
     */

    tokenize = self.inlineTokenizers.escape;
    self.inlineTokenizers.escape = null;

    node = eat($0)(self.renderLink(true, href, text, null, now, eat));

    self.inlineTokenizers.escape = tokenize;

    return node;
}

tokenizeAutoLink.notInLink = true;

/**
 * Tokenise a URL in text.
 *
 * @example
 *   tokenizeURL(eat, 'http://foo.bar');
 *
 * @property {boolean} notInLink
 * @param {function(string)} eat
 * @param {string} $0 - Whole link.
 * @return {Node} - `link` node.
 */
function tokenizeURL(eat, $0) {
    var now = eat.now();

    return eat($0)(this.renderLink(true, $0, $0, null, now, eat));
}

tokenizeURL.notInLink = true;

/**
 * Tokenise an HTML tag.
 *
 * @example
 *   tokenizeTag(eat, '<span foo="bar">');
 *
 * @param {function(string)} eat
 * @param {string} $0 - Content.
 * @return {Node} - `html` node.
 */
function tokenizeTag(eat, $0) {
    var self = this;

    if (!self.inLink && EXPRESSION_HTML_LINK_OPEN.test($0)) {
        self.inLink = true;
    } else if (self.inLink && EXPRESSION_HTML_LINK_CLOSE.test($0)) {
        self.inLink = false;
    }

    return eat($0)(self.renderRaw(HTML, $0));
}

/**
 * Tokenise a link.
 *
 * @example
 *   tokenizeLink(
 *     eat, '![foo](fav.ico "Favicon")', '![', 'foo', null,
 *     'fav.ico', 'Foo Domain'
 *   );
 *
 * @param {function(string)} eat
 * @param {string} $0 - Whole link.
 * @param {string} $1 - Prefix.
 * @param {string} $2 - Text.
 * @param {string?} $3 - URL wrapped in angle braces.
 * @param {string?} $4 - Literal URL.
 * @param {string?} $5 - Title wrapped in single or double
 *   quotes.
 * @param {string?} [$6] - Title wrapped in double quotes.
 * @param {string?} [$7] - Title wrapped in parentheses.
 * @return {Node?} - `link` node, `image` node, or `null`.
 */
function tokenizeLink(eat, $0, $1, $2, $3, $4, $5, $6, $7) {
    var isLink = $1 === BRACKET_OPEN;
    var href = $4 || $3 || '';
    var title = $7 || $6 || $5;
    var now;

    if (!isLink || !this.inLink) {
        now = eat.now();

        now.column += $1.length;

        return eat($0)(this.renderLink(isLink, this.descape(href), $2, title, now, eat));
    }

    return null;
}

/**
 * Tokenise a reference link, image, or footnote;
 * shortcut reference link, or footnote.
 *
 * @example
 *   tokenizeReference(eat, '[foo]', '[', 'foo');
 *   tokenizeReference(eat, '[foo][]', '[', 'foo', '');
 *   tokenizeReference(eat, '[foo][bar]', '[', 'foo', 'bar');
 *
 * @property {boolean} notInLink
 * @param {function(string)} eat
 * @param {string} $0 - Whole link.
 * @param {string} $1 - Prefix.
 * @param {string} $2 - identifier.
 * @param {string} $3 - Content.
 * @return {Node} - `linkReference`, `imageReference`, or
 *   `footnoteReference`.
 */
function tokenizeReference(eat, $0, $1, $2, $3) {
    var self = this;
    var text = $2;
    var identifier = $3 || $2;
    var type = $1 === BRACKET_OPEN ? 'link' : 'image';
    var isFootnote = self.options.footnotes && identifier.charAt(0) === CARET;
    var now = eat.now();
    var referenceType;
    var node;
    var exitLink;

    if ($3 === undefined) {
        referenceType = 'shortcut';
    } else if ($3 === '') {
        referenceType = 'collapsed';
    } else {
        referenceType = 'full';
    }

    if (referenceType !== 'shortcut') {
        isFootnote = false;
    }

    if (isFootnote) {
        identifier = identifier.substr(1);
    }

    if (isFootnote) {
        if (identifier.indexOf(SPACE) !== -1) {
            return eat($0)(self.renderFootnote(identifier, eat.now()));
        } else {
            type = 'footnote';
        }
    }

    now.column += $1.length;

    node = {
        'type': type + 'Reference',
        'identifier': normalize(identifier)
    };

    if (type === 'link' || type === 'image') {
        node.referenceType = referenceType;
    }

    if (type === 'link') {
        exitLink = self.enterLink();
        node.children = self.tokenizeInline(text, now);
        exitLink();
    } else if (type === 'image') {
        node.alt = decode(self.descape(text), eat);
    }

    return eat($0)(node);
}

tokenizeReference.notInLink = true;

/**
 * Tokenise strong emphasis.
 *
 * @example
 *   tokenizeStrong(eat, '**foo**', '**', 'foo');
 *   tokenizeStrong(eat, '__foo__', null, null, '__', 'foo');
 *
 * @param {function(string)} eat
 * @param {string} $0 - Whole emphasis.
 * @param {string?} $1 - Marker.
 * @param {string?} $2 - Content.
 * @param {string?} [$3] - Marker.
 * @param {string?} [$4] - Content.
 * @return {Node?} - `strong` node, when not empty.
 */
function tokenizeStrong(eat, $0, $1, $2, $3, $4) {
    var now = eat.now();
    var value = $2 || $4;

    if (trim(value) === EMPTY) {
        return null;
    }

    now.column += 2;

    return eat($0)(this.renderInline(STRONG, value, now));
}

/**
 * Tokenise slight emphasis.
 *
 * @example
 *   tokenizeEmphasis(eat, '*foo*', '*', 'foo');
 *   tokenizeEmphasis(eat, '_foo_', null, null, '_', 'foo');
 *
 * @param {function(string)} eat
 * @param {string} $0 - Whole emphasis.
 * @param {string?} $1 - Marker.
 * @param {string?} $2 - Content.
 * @param {string?} [$3] - Marker.
 * @param {string?} [$4] - Content.
 * @return {Node?} - `emphasis` node, when not empty.
 */
function tokenizeEmphasis(eat, $0, $1, $2, $3, $4) {
    var now = eat.now();
    var marker = $1 || $3;
    var value = $2 || $4;

    if (trim(value) === EMPTY || value.charAt(0) === marker || value.charAt(value.length - 1) === marker) {
        return null;
    }

    now.column += 1;

    return eat($0)(this.renderInline(EMPHASIS, value, now));
}

/**
 * Tokenise a deletion.
 *
 * @example
 *   tokenizeDeletion(eat, '~~foo~~', '~~', 'foo');
 *
 * @param {function(string)} eat
 * @param {string} $0 - Whole deletion.
 * @param {string} $1 - Content.
 * @return {Node} - `delete` node.
 */
function tokenizeDeletion(eat, $0, $1) {
    var now = eat.now();

    now.column += 2;

    return eat($0)(this.renderInline(DELETE, $1, now));
}

/**
 * Tokenise inline code.
 *
 * @example
 *   tokenizeInlineCode(eat, '`foo()`', '`', 'foo()');
 *
 * @param {function(string)} eat
 * @param {string} $0 - Whole code.
 * @param {string} $1 - Initial markers.
 * @param {string} $2 - Content.
 * @return {Node} - `inlineCode` node.
 */
function tokenizeInlineCode(eat, $0, $1, $2) {
    return eat($0)(this.renderRaw(INLINE_CODE, trim($2 || '')));
}

/**
 * Tokenise a break.
 *
 * @example
 *   tokenizeBreak(eat, '  \n');
 *
 * @param {function(string)} eat
 * @param {string} $0
 * @return {Node} - `break` node.
 */
function tokenizeBreak(eat, $0) {
    return eat($0)(this.renderVoid(BREAK));
}

/**
 * Construct a new parser.
 *
 * @example
 *   var parser = new Parser();
 *
 * @constructor
 * @class {Parser}
 * @param {Object?} [options] - Passed to
 *   `Parser#setOptions()`.
 */
function Parser(options) {
    var self = this;
    var rules = copy({}, self.expressions.rules);

    self.inLink = false;
    self.atTop = true;
    self.atStart = true;
    self.inBlockquote = false;

    self.rules = rules;
    self.descape = descapeFactory(rules, 'escape');

    self.options = clone(self.options);

    self.setOptions(options);
}

/**
 * Set options.  Does not overwrite previously set
 * options.
 *
 * @example
 *   var parser = new Parser();
 *   parser.setOptions({gfm: true});
 *
 * @this {Parser}
 * @throws {Error} - When an option is invalid.
 * @param {Object?} [options] - Parse settings.
 * @return {Parser} - `self`.
 */
Parser.prototype.setOptions = function (options) {
    var self = this;
    var expressions = self.expressions;
    var rules = self.rules;
    var current = self.options;
    var key;

    if (options === null || options === undefined) {
        options = {};
    } else if (typeof options === 'object') {
        options = clone(options);
    } else {
        raise(options, 'options');
    }

    self.options = options;

    for (key in defaultOptions) {
        validate.boolean(options, key, current[key]);

        if (options[key]) {
            copy(rules, expressions[key]);
        }
    }

    if (options.gfm && options.breaks) {
        copy(rules, expressions.breaksGFM);
    }

    if (options.gfm && options.commonmark) {
        copy(rules, expressions.commonmarkGFM);
    }

    if (options.commonmark) {
        self.enterBlockquote = noopToggler();
    }

    return self;
};

/*
 * Expose `defaults`.
 */

Parser.prototype.options = defaultOptions;

/*
 * Expose `expressions`.
 */

Parser.prototype.expressions = defaultExpressions;

/**
 * Factory to track indentation for each line corresponding
 * to the given `start` and the number of invocations.
 *
 * @param {number} start - Starting line.
 * @return {function(offset)} - Indenter.
 */
Parser.prototype.indent = function (start) {
    var self = this;
    var line = start;

    /**
     * Intender which increments the global offset,
     * starting at the bound line, and further incrementing
     * each line for each invocation.
     *
     * @example
     *   indenter(2)
     *
     * @param {number} offset - Number to increment the
     *   offset.
     */
    function indenter(offset) {
        self.offset[line] = (self.offset[line] || 0) + offset;

        line++;
    }

    return indenter;
};

/**
 * Parse `value` into an AST.
 *
 * @example
 *   var parser = new Parser();
 *   parser.parse(new File('_Foo_.'));
 *
 * @this {Parser}
 * @param {Object} file
 * @return {Object} - `root` node.
 */
Parser.prototype.parse = function (file) {
    var self = this;
    var value = clean(String(file));
    var token;

    self.file = file;

    /*
     * Add an `offset` matrix, used to keep track of
     * syntax and white space indentation per line.
     */

    self.offset = {};

    token = self.renderBlock(ROOT, value);

    if (self.options.position) {
        token.position = {
            'start': {
                'line': 1,
                'column': 1
            }
        };

        token.position.end = self.eof || token.position.start;
    }

    return token;
};

/*
 * Enter and exit helpers.
 */

Parser.prototype.enterLink = stateToggler('inLink', false);
Parser.prototype.exitTop = stateToggler('atTop', true);
Parser.prototype.exitStart = stateToggler('atStart', true);
Parser.prototype.enterBlockquote = stateToggler('inBlockquote', false);

/*
 * Expose helpers
 */

Parser.prototype.renderRaw = renderRaw;
Parser.prototype.renderVoid = renderVoid;
Parser.prototype.renderParent = renderParent;
Parser.prototype.renderInline = renderInline;
Parser.prototype.renderBlock = renderBlock;

Parser.prototype.renderLink = renderLink;
Parser.prototype.renderCodeBlock = renderCodeBlock;
Parser.prototype.renderBlockquote = renderBlockquote;
Parser.prototype.renderList = renderList;
Parser.prototype.renderListItem = renderListItem;
Parser.prototype.renderFootnoteDefinition = renderFootnoteDefinition;
Parser.prototype.renderHeading = renderHeading;
Parser.prototype.renderFootnote = renderFootnote;

/**
 * Construct a tokenizer.  This creates both
 * `tokenizeInline` and `tokenizeBlock`.
 *
 * @example
 *   Parser.prototype.tokenizeInline = tokenizeFactory('inline');
 *
 * @param {string} type - Name of parser, used to find
 *   its expressions (`%sMethods`) and tokenizers
 *   (`%Tokenizers`).
 * @return {function(string, Object?): Array.<Object>}
 */
function tokenizeFactory(type) {
    /**
     * Tokenizer for a bound `type`
     *
     * @example
     *   parser = new Parser();
     *   parser.tokenizeInline('_foo_');
     *
     * @param {string} value - Content.
     * @param {Object?} [location] - Offset at which `value`
     *   starts.
     * @return {Array.<Object>} - Nodes.
     */
    function tokenize(value, location) {
        var self = this;
        var offset = self.offset;
        var tokens = [];
        var rules = self.rules;
        var methods = self[type + 'Methods'];
        var tokenizers = self[type + 'Tokenizers'];
        var line = location ? location.line : 1;
        var column = location ? location.column : 1;
        var patchPosition = self.options.position;
        var add;
        var index;
        var length;
        var method;
        var name;
        var match;
        var matched;
        var valueLength;
        var eater;

        /*
         * Trim white space only lines.
         */

        if (!value) {
            return tokens;
        }

        /**
         * Update line and column based on `value`.
         *
         * @example
         *   updatePosition('foo');
         *
         * @param {string} subvalue
         */
        function updatePosition(subvalue) {
            var character = -1;
            var subvalueLength = subvalue.length;
            var lastIndex = -1;

            while (++character < subvalueLength) {
                if (subvalue.charAt(character) === NEW_LINE) {
                    lastIndex = character;
                    line++;
                }
            }

            if (lastIndex === -1) {
                column = column + subvalue.length;
            } else {
                column = subvalue.length - lastIndex;
            }

            if (line in offset) {
                if (lastIndex !== -1) {
                    column += offset[line];
                } else if (column <= offset[line]) {
                    column = offset[line] + 1;
                }
            }
        }

        /**
         * Get offset. Called before the fisrt character is
         * eaten to retrieve the range's offsets.
         *
         * @return {Function} - `done`, to be called when
         *   the last character is eaten.
         */
        function getOffset() {
            var indentation = [];
            var pos = line + 1;

            /**
             * Done. Called when the last character is
             * eaten to retrieve the range's offsets.
             *
             * @return {Array.<number>} - Offset.
             */
            function done() {
                var last = line + 1;

                while (pos < last) {
                    indentation.push((offset[pos] || 0) + 1);

                    pos++;
                }

                return indentation;
            }

            return done;
        }

        /**
         * Get the current position.
         *
         * @example
         *   position = now(); // {line: 1, column: 1}
         *
         * @return {Object}
         */
        function now() {
            return {
                'line': line,
                'column': column
            };
        }

        /**
         * Store position information for a node.
         *
         * @example
         *   start = now();
         *   updatePosition('foo');
         *   location = new Position(start);
         *   // {start: {line: 1, column: 1}, end: {line: 1, column: 3}}
         *
         * @param {Object} start
         */
        function Position(start) {
            this.start = start;
            this.end = now();
        }

        /**
         * Throw when a value is incorrectly eaten.
         * This shouldn’t happen but will throw on new,
         * incorrect rules.
         *
         * @example
         *   // When the current value is set to `foo bar`.
         *   validateEat('foo');
         *   eat('foo');
         *
         *   validateEat('bar');
         *   // throws, because the space is not eaten.
         *
         * @param {string} subvalue - Value to be eaten.
         * @throws {Error} - When `subvalue` cannot be eaten.
         */
        function validateEat(subvalue) {
            /* istanbul ignore if */
            if (value.substring(0, subvalue.length) !== subvalue) {
                self.file.fail('Incorrectly eaten value: please report this ' + 'warning on http://git.io/vUYWz', now());
            }
        }

        /**
         * Mark position and patch `node.position`.
         *
         * @example
         *   var update = position();
         *   updatePosition('foo');
         *   update({});
         *   // {
         *   //   position: {
         *   //     start: {line: 1, column: 1}
         *   //     end: {line: 1, column: 3}
         *   //   }
         *   // }
         *
         * @returns {function(Node): Node}
         */
        function position() {
            var before = now();

            /**
             * Add the position to a node.
             *
             * @example
             *   update({type: 'text', value: 'foo'});
             *
             * @param {Node} node - Node to attach position
             *   on.
             * @return {Node} - `node`.
             */
            function update(node, indent) {
                var prev = node.position;
                var start = prev ? prev.start : before;
                var combined = [];
                var n = prev && prev.end.line;
                var l = before.line;

                node.position = new Position(start);

                /*
                 * If there was already a `position`, this
                 * node was merged.  Fixing `start` wasn't
                 * hard, but the indent is different.
                 * Especially because some information, the
                 * indent between `n` and `l` wasn't
                 * tracked.  Luckily, that space is
                 * (should be?) empty, so we can safely
                 * check for it now.
                 */

                if (prev) {
                    combined = prev.indent;

                    if (n < l) {
                        while (++n < l) {
                            combined.push((offset[n] || 0) + 1);
                        }

                        combined.push(before.column);
                    }

                    indent = combined.concat(indent);
                }

                node.position.indent = indent;

                return node;
            }

            return update;
        }

        /**
         * Add `token` to `parent`s children or to `tokens`.
         * Performs merges where possible.
         *
         * @example
         *   add({});
         *
         *   add({}, {children: []});
         *
         * @param {Object} token - Node to add.
         * @param {Object} [parent] - Parent to insert into.
         * @return {Object} - Added or merged into token.
         */
        add = function (token, parent) {
            var isMultiple = ('length' in token);
            var prev;
            var children;

            if (!parent) {
                children = tokens;
            } else {
                children = parent.children;
            }

            if (isMultiple) {
                arrayPush.apply(children, token);
            } else {
                if (type === INLINE && token.type === TEXT) {
                    token.value = decode(token.value, eater);
                }

                prev = children[children.length - 1];

                if (prev && token.type === prev.type && token.type in MERGEABLE_NODES) {
                    token = MERGEABLE_NODES[token.type].call(self, prev, token);
                }

                if (token !== prev) {
                    children.push(token);
                }

                if (self.atStart && tokens.length) {
                    self.exitStart();
                }
            }

            return token;
        };

        /**
         * Remove `subvalue` from `value`.
         * Expects `subvalue` to be at the start from
         * `value`, and applies no validation.
         *
         * @example
         *   eat('foo')({type: 'text', value: 'foo'});
         *
         * @param {string} subvalue - Removed from `value`,
         *   and passed to `updatePosition`.
         * @return {Function} - Wrapper around `add`, which
         *   also adds `position` to node.
         */
        function eat(subvalue) {
            var indent = getOffset();
            var pos = position();
            var current = now();

            validateEat(subvalue);

            /**
             * Add the given arguments, add `position` to
             * the returned node, and return the node.
             *
             * @return {Node}
             */
            function apply() {
                return pos(add.apply(null, arguments), indent);
            }

            /**
             * Functions just like apply, but resets the
             * content:  the line and column are reversed,
             * and the eaten value is re-added.
             *
             * This is useful for nodes with a single
             * type of content, such as lists and tables.
             *
             * See `apply` above for what parameters are
             * expected.
             *
             * @return {Node}
             */
            function reset() {
                var node = apply.apply(null, arguments);

                line = current.line;
                column = current.column;
                value = subvalue + value;

                return node;
            }

            apply.reset = reset;

            value = value.substring(subvalue.length);

            updatePosition(subvalue);

            indent = indent();

            return apply;
        }

        /**
         * Same as `eat` above, but will not add positional
         * information to nodes.
         *
         * @example
         *   noEat('foo')({type: 'text', value: 'foo'});
         *
         * @param {string} subvalue - Removed from `value`.
         * @return {Function} - Wrapper around `add`.
         */
        function noEat(subvalue) {
            validateEat(subvalue);

            /**
             * Add the given arguments, and return the
             * node.
             *
             * @return {Node}
             */
            function apply() {
                return add.apply(null, arguments);
            }

            /**
             * Functions just like apply, but resets the
             * content: the eaten value is re-added.
             *
             * @return {Node}
             */
            function reset() {
                var node = apply.apply(null, arguments);

                value = subvalue + value;

                return node;
            }

            apply.reset = reset;

            value = value.substring(subvalue.length);

            return apply;
        }

        /*
         * Expose the eater, depending on if `position`s
         * should be patched on nodes.
         */

        eater = patchPosition ? eat : noEat;

        /*
         * Expose `now` on `eater`.
         */

        eater.now = now;

        /*
         * Expose `file` on `eater`.
         */

        eater.file = self.file;

        /*
         * Sync initial offset.
         */

        updatePosition(EMPTY);

        /*
         * Iterate over `value`, and iterate over all
         * block-expressions.  When one matches, invoke
         * its companion function.  If no expression
         * matches, something failed (should not happen)
         * and an exception is thrown.
         */

        while (value) {
            index = -1;
            length = methods.length;
            matched = false;

            while (++index < length) {
                name = methods[index];

                method = tokenizers[name];

                match = rules[name] && method && (!method.onlyAtStart || self.atStart) && (!method.onlyAtTop || self.atTop) && (!method.notInBlockquote || !self.inBlockquote) && (!method.notInLink || !self.inLink) && rules[name].exec(value);

                if (match) {
                    valueLength = value.length;

                    method.apply(self, [eater].concat(match));

                    matched = valueLength !== value.length;

                    if (matched) {
                        break;
                    }
                }
            }

            /* istanbul ignore if */
            if (!matched) {
                self.file.fail('Infinite loop', eater.now());

                /*
                 * Errors are not thrown on `File#fail`
                 * when `quiet: true`.
                 */

                break;
            }
        }

        self.eof = now();

        return tokens;
    }

    return tokenize;
}

/*
 * Expose tokenizers for block-level nodes.
 */

Parser.prototype.blockTokenizers = {
    'yamlFrontMatter': tokenizeYAMLFrontMatter,
    'newline': tokenizeNewline,
    'code': tokenizeCode,
    'fences': tokenizeFences,
    'heading': tokenizeHeading,
    'lineHeading': tokenizeLineHeading,
    'horizontalRule': tokenizeHorizontalRule,
    'blockquote': tokenizeBlockquote,
    'list': tokenizeList,
    'html': tokenizeHtml,
    'definition': tokenizeDefinition,
    'footnoteDefinition': tokenizeFootnoteDefinition,
    'looseTable': tokenizeTable,
    'table': tokenizeTable,
    'paragraph': tokenizeParagraph
};

/*
 * Expose order in which to parse block-level nodes.
 */

Parser.prototype.blockMethods = ['yamlFrontMatter', 'newline', 'code', 'fences', 'blockquote', 'heading', 'horizontalRule', 'list', 'lineHeading', 'html', 'definition', 'footnoteDefinition', 'looseTable', 'table', 'paragraph', 'blockText'];

/**
 * Block tokenizer.
 *
 * @example
 *   var parser = new Parser();
 *   parser.tokenizeBlock('> foo.');
 *
 * @param {string} value - Content.
 * @return {Array.<Object>} - Nodes.
 */

Parser.prototype.tokenizeBlock = tokenizeFactory(BLOCK);

/*
 * Expose tokenizers for inline-level nodes.
 */

Parser.prototype.inlineTokenizers = {
    'escape': tokenizeEscape,
    'autoLink': tokenizeAutoLink,
    'url': tokenizeURL,
    'tag': tokenizeTag,
    'link': tokenizeLink,
    'reference': tokenizeReference,
    'shortcutReference': tokenizeReference,
    'strong': tokenizeStrong,
    'emphasis': tokenizeEmphasis,
    'deletion': tokenizeDeletion,
    'inlineCode': tokenizeInlineCode,
    'break': tokenizeBreak,
    'inlineText': tokenizeText
};

/*
 * Expose order in which to parse inline-level nodes.
 */

Parser.prototype.inlineMethods = ['escape', 'autoLink', 'url', 'tag', 'link', 'reference', 'shortcutReference', 'strong', 'emphasis', 'deletion', 'inlineCode', 'break', 'inlineText'];

/**
 * Inline tokenizer.
 *
 * @example
 *   var parser = new Parser();
 *   parser.tokenizeInline('_foo_');
 *
 * @param {string} value - Content.
 * @return {Array.<Object>} - Nodes.
 */

Parser.prototype.tokenizeInline = tokenizeFactory(INLINE);

/**
 * Transform a markdown document into an AST.
 *
 * @example
 *   parse(new File('> foo.'), {gfm: true});
 *
 * @this {Object?} - When this function is places on an
 *   object which also houses a `Parser` property, that
 *   class is used.
 * @param {File} file - Virtual file.
 * @param {Object?} [options] - Settings for the parser.
 * @return {Object} - Abstract syntax tree.
 */
function parse(file, options) {
    var CustomParser = this.Parser || Parser;

    return new CustomParser(options).parse(file);
}

/*
 * Expose `Parser` on `parse`.
 */

parse.Parser = Parser;

/*
 * Expose `tokenizeFactory` so dependencies could create
 * their own tokenizers.
 */

Parser.prototype.tokenizeFactory = tokenizeFactory;

/*
 * Expose `parse` on `module.exports`.
 */

module.exports = parse;
}, {"he":20,"repeat-string":21,"./utilities.js":17,"./expressions.js":22,"./defaults.js":23}],
20: [function(require, module, exports) {
/*! http://mths.be/he v0.5.0 by @mathias | MIT license */
'use strict';

;(function (root) {

	// Detect free variables `exports`.
	var freeExports = typeof exports == 'object' && exports;

	// Detect free variable `module`.
	var freeModule = typeof module == 'object' && module && module.exports == freeExports && module;

	// Detect free variable `global`, from Node.js or Browserified code,
	// and use it as `root`.
	var freeGlobal = typeof global == 'object' && global;
	if (freeGlobal.global === freeGlobal || freeGlobal.window === freeGlobal) {
		root = freeGlobal;
	}

	/*--------------------------------------------------------------------------*/

	// All astral symbols.
	var regexAstralSymbols = /[\uD800-\uDBFF][\uDC00-\uDFFF]/g;
	// All ASCII symbols (not just printable ASCII) except those listed in the
	// first column of the overrides table.
	// http://whatwg.org/html/tokenization.html#table-charref-overrides
	var regexAsciiWhitelist = /[\x01-\x7F]/g;
	// All BMP symbols that are not ASCII newlines, printable ASCII symbols, or
	// code points listed in the first column of the overrides table on
	// http://whatwg.org/html/tokenization.html#table-charref-overrides.
	var regexBmpWhitelist = /[\x01-\t\x0B\f\x0E-\x1F\x7F\x81\x8D\x8F\x90\x9D\xA0-\uFFFF]/g;

	var regexEncodeNonAscii = /<\u20D2|=\u20E5|>\u20D2|\u205F\u200A|\u219D\u0338|\u2202\u0338|\u2220\u20D2|\u2229\uFE00|\u222A\uFE00|\u223C\u20D2|\u223D\u0331|\u223E\u0333|\u2242\u0338|\u224B\u0338|\u224D\u20D2|\u224E\u0338|\u224F\u0338|\u2250\u0338|\u2261\u20E5|\u2264\u20D2|\u2265\u20D2|\u2266\u0338|\u2267\u0338|\u2268\uFE00|\u2269\uFE00|\u226A\u0338|\u226A\u20D2|\u226B\u0338|\u226B\u20D2|\u227F\u0338|\u2282\u20D2|\u2283\u20D2|\u228A\uFE00|\u228B\uFE00|\u228F\u0338|\u2290\u0338|\u2293\uFE00|\u2294\uFE00|\u22B4\u20D2|\u22B5\u20D2|\u22D8\u0338|\u22D9\u0338|\u22DA\uFE00|\u22DB\uFE00|\u22F5\u0338|\u22F9\u0338|\u2933\u0338|\u29CF\u0338|\u29D0\u0338|\u2A6D\u0338|\u2A70\u0338|\u2A7D\u0338|\u2A7E\u0338|\u2AA1\u0338|\u2AA2\u0338|\u2AAC\uFE00|\u2AAD\uFE00|\u2AAF\u0338|\u2AB0\u0338|\u2AC5\u0338|\u2AC6\u0338|\u2ACB\uFE00|\u2ACC\uFE00|\u2AFD\u20E5|[\xA0-\u0113\u0116-\u0122\u0124-\u012B\u012E-\u014D\u0150-\u017E\u0192\u01B5\u01F5\u0237\u02C6\u02C7\u02D8-\u02DD\u0311\u0391-\u03A1\u03A3-\u03A9\u03B1-\u03C9\u03D1\u03D2\u03D5\u03D6\u03DC\u03DD\u03F0\u03F1\u03F5\u03F6\u0401-\u040C\u040E-\u044F\u0451-\u045C\u045E\u045F\u2002-\u2005\u2007-\u2010\u2013-\u2016\u2018-\u201A\u201C-\u201E\u2020-\u2022\u2025\u2026\u2030-\u2035\u2039\u203A\u203E\u2041\u2043\u2044\u204F\u2057\u205F-\u2063\u20AC\u20DB\u20DC\u2102\u2105\u210A-\u2113\u2115-\u211E\u2122\u2124\u2127-\u2129\u212C\u212D\u212F-\u2131\u2133-\u2138\u2145-\u2148\u2153-\u215E\u2190-\u219B\u219D-\u21A7\u21A9-\u21AE\u21B0-\u21B3\u21B5-\u21B7\u21BA-\u21DB\u21DD\u21E4\u21E5\u21F5\u21FD-\u2205\u2207-\u2209\u220B\u220C\u220F-\u2214\u2216-\u2218\u221A\u221D-\u2238\u223A-\u2257\u2259\u225A\u225C\u225F-\u2262\u2264-\u228B\u228D-\u229B\u229D-\u22A5\u22A7-\u22B0\u22B2-\u22BB\u22BD-\u22DB\u22DE-\u22E3\u22E6-\u22F7\u22F9-\u22FE\u2305\u2306\u2308-\u2310\u2312\u2313\u2315\u2316\u231C-\u231F\u2322\u2323\u232D\u232E\u2336\u233D\u233F\u237C\u23B0\u23B1\u23B4-\u23B6\u23DC-\u23DF\u23E2\u23E7\u2423\u24C8\u2500\u2502\u250C\u2510\u2514\u2518\u251C\u2524\u252C\u2534\u253C\u2550-\u256C\u2580\u2584\u2588\u2591-\u2593\u25A1\u25AA\u25AB\u25AD\u25AE\u25B1\u25B3-\u25B5\u25B8\u25B9\u25BD-\u25BF\u25C2\u25C3\u25CA\u25CB\u25EC\u25EF\u25F8-\u25FC\u2605\u2606\u260E\u2640\u2642\u2660\u2663\u2665\u2666\u266A\u266D-\u266F\u2713\u2717\u2720\u2736\u2758\u2772\u2773\u27C8\u27C9\u27E6-\u27ED\u27F5-\u27FA\u27FC\u27FF\u2902-\u2905\u290C-\u2913\u2916\u2919-\u2920\u2923-\u292A\u2933\u2935-\u2939\u293C\u293D\u2945\u2948-\u294B\u294E-\u2976\u2978\u2979\u297B-\u297F\u2985\u2986\u298B-\u2996\u299A\u299C\u299D\u29A4-\u29B7\u29B9\u29BB\u29BC\u29BE-\u29C5\u29C9\u29CD-\u29D0\u29DC-\u29DE\u29E3-\u29E5\u29EB\u29F4\u29F6\u2A00-\u2A02\u2A04\u2A06\u2A0C\u2A0D\u2A10-\u2A17\u2A22-\u2A27\u2A29\u2A2A\u2A2D-\u2A31\u2A33-\u2A3C\u2A3F\u2A40\u2A42-\u2A4D\u2A50\u2A53-\u2A58\u2A5A-\u2A5D\u2A5F\u2A66\u2A6A\u2A6D-\u2A75\u2A77-\u2A9A\u2A9D-\u2AA2\u2AA4-\u2AB0\u2AB3-\u2AC8\u2ACB\u2ACC\u2ACF-\u2ADB\u2AE4\u2AE6-\u2AE9\u2AEB-\u2AF3\u2AFD\uFB00-\uFB04]|\uD835[\uDC9C\uDC9E\uDC9F\uDCA2\uDCA5\uDCA6\uDCA9-\uDCAC\uDCAE-\uDCB9\uDCBB\uDCBD-\uDCC3\uDCC5-\uDCCF\uDD04\uDD05\uDD07-\uDD0A\uDD0D-\uDD14\uDD16-\uDD1C\uDD1E-\uDD39\uDD3B-\uDD3E\uDD40-\uDD44\uDD46\uDD4A-\uDD50\uDD52-\uDD6B]/g;
	var encodeMap = { '\xC1': 'Aacute', '\xE1': 'aacute', 'Ă': 'Abreve', 'ă': 'abreve', '∾': 'ac', '∿': 'acd', '∾̳': 'acE', '\xC2': 'Acirc', '\xE2': 'acirc', '\xB4': 'acute', 'А': 'Acy', 'а': 'acy', '\xC6': 'AElig', '\xE6': 'aelig', '⁡': 'af', '𝔄': 'Afr', '𝔞': 'afr', '\xC0': 'Agrave', '\xE0': 'agrave', 'ℵ': 'aleph', 'Α': 'Alpha', 'α': 'alpha', 'Ā': 'Amacr', 'ā': 'amacr', '⨿': 'amalg', '&': 'amp', '⩕': 'andand', '⩓': 'And', '∧': 'and', '⩜': 'andd', '⩘': 'andslope', '⩚': 'andv', '∠': 'ang', '⦤': 'ange', '⦨': 'angmsdaa', '⦩': 'angmsdab', '⦪': 'angmsdac', '⦫': 'angmsdad', '⦬': 'angmsdae', '⦭': 'angmsdaf', '⦮': 'angmsdag', '⦯': 'angmsdah', '∡': 'angmsd', '∟': 'angrt', '⊾': 'angrtvb', '⦝': 'angrtvbd', '∢': 'angsph', '\xC5': 'angst', '⍼': 'angzarr', 'Ą': 'Aogon', 'ą': 'aogon', '𝔸': 'Aopf', '𝕒': 'aopf', '⩯': 'apacir', '≈': 'ap', '⩰': 'apE', '≊': 'ape', '≋': 'apid', '\'': 'apos', '\xE5': 'aring', '𝒜': 'Ascr', '𝒶': 'ascr', '≔': 'colone', '*': 'ast', '≍': 'CupCap', '\xC3': 'Atilde', '\xE3': 'atilde', '\xC4': 'Auml', '\xE4': 'auml', '∳': 'awconint', '⨑': 'awint', '≌': 'bcong', '϶': 'bepsi', '‵': 'bprime', '∽': 'bsim', '⋍': 'bsime', '∖': 'setmn', '⫧': 'Barv', '⊽': 'barvee', '⌅': 'barwed', '⌆': 'Barwed', '⎵': 'bbrk', '⎶': 'bbrktbrk', 'Б': 'Bcy', 'б': 'bcy', '„': 'bdquo', '∵': 'becaus', '⦰': 'bemptyv', 'ℬ': 'Bscr', 'Β': 'Beta', 'β': 'beta', 'ℶ': 'beth', '≬': 'twixt', '𝔅': 'Bfr', '𝔟': 'bfr', '⋂': 'xcap', '◯': 'xcirc', '⋃': 'xcup', '⨀': 'xodot', '⨁': 'xoplus', '⨂': 'xotime', '⨆': 'xsqcup', '★': 'starf', '▽': 'xdtri', '△': 'xutri', '⨄': 'xuplus', '⋁': 'Vee', '⋀': 'Wedge', '⤍': 'rbarr', '⧫': 'lozf', '▪': 'squf', '▴': 'utrif', '▾': 'dtrif', '◂': 'ltrif', '▸': 'rtrif', '␣': 'blank', '▒': 'blk12', '░': 'blk14', '▓': 'blk34', '█': 'block', '=⃥': 'bne', '≡⃥': 'bnequiv', '⫭': 'bNot', '⌐': 'bnot', '𝔹': 'Bopf', '𝕓': 'bopf', '⊥': 'bot', '⋈': 'bowtie', '⧉': 'boxbox', '┐': 'boxdl', '╕': 'boxdL', '╖': 'boxDl', '╗': 'boxDL', '┌': 'boxdr', '╒': 'boxdR', '╓': 'boxDr', '╔': 'boxDR', '─': 'boxh', '═': 'boxH', '┬': 'boxhd', '╤': 'boxHd', '╥': 'boxhD', '╦': 'boxHD', '┴': 'boxhu', '╧': 'boxHu', '╨': 'boxhU', '╩': 'boxHU', '⊟': 'minusb', '⊞': 'plusb', '⊠': 'timesb', '┘': 'boxul', '╛': 'boxuL', '╜': 'boxUl', '╝': 'boxUL', '└': 'boxur', '╘': 'boxuR', '╙': 'boxUr', '╚': 'boxUR', '│': 'boxv', '║': 'boxV', '┼': 'boxvh', '╪': 'boxvH', '╫': 'boxVh', '╬': 'boxVH', '┤': 'boxvl', '╡': 'boxvL', '╢': 'boxVl', '╣': 'boxVL', '├': 'boxvr', '╞': 'boxvR', '╟': 'boxVr', '╠': 'boxVR', '˘': 'breve', '\xA6': 'brvbar', '𝒷': 'bscr', '⁏': 'bsemi', '⧅': 'bsolb', '\\': 'bsol', '⟈': 'bsolhsub', '•': 'bull', '≎': 'bump', '⪮': 'bumpE', '≏': 'bumpe', 'Ć': 'Cacute', 'ć': 'cacute', '⩄': 'capand', '⩉': 'capbrcup', '⩋': 'capcap', '∩': 'cap', '⋒': 'Cap', '⩇': 'capcup', '⩀': 'capdot', 'ⅅ': 'DD', '∩︀': 'caps', '⁁': 'caret', 'ˇ': 'caron', 'ℭ': 'Cfr', '⩍': 'ccaps', 'Č': 'Ccaron', 'č': 'ccaron', '\xC7': 'Ccedil', '\xE7': 'ccedil', 'Ĉ': 'Ccirc', 'ĉ': 'ccirc', '∰': 'Cconint', '⩌': 'ccups', '⩐': 'ccupssm', 'Ċ': 'Cdot', 'ċ': 'cdot', '\xB8': 'cedil', '⦲': 'cemptyv', '\xA2': 'cent', '\xB7': 'middot', '𝔠': 'cfr', 'Ч': 'CHcy', 'ч': 'chcy', '✓': 'check', 'Χ': 'Chi', 'χ': 'chi', 'ˆ': 'circ', '≗': 'cire', '↺': 'olarr', '↻': 'orarr', '⊛': 'oast', '⊚': 'ocir', '⊝': 'odash', '⊙': 'odot', '\xAE': 'reg', 'Ⓢ': 'oS', '⊖': 'ominus', '⊕': 'oplus', '⊗': 'otimes', '○': 'cir', '⧃': 'cirE', '⨐': 'cirfnint', '⫯': 'cirmid', '⧂': 'cirscir', '∲': 'cwconint', '”': 'rdquo', '’': 'rsquo', '♣': 'clubs', ':': 'colon', '∷': 'Colon', '⩴': 'Colone', ',': 'comma', '@': 'commat', '∁': 'comp', '∘': 'compfn', 'ℂ': 'Copf', '≅': 'cong', '⩭': 'congdot', '≡': 'equiv', '∮': 'oint', '∯': 'Conint', '𝕔': 'copf', '∐': 'coprod', '\xA9': 'copy', '℗': 'copysr', '↵': 'crarr', '✗': 'cross', '⨯': 'Cross', '𝒞': 'Cscr', '𝒸': 'cscr', '⫏': 'csub', '⫑': 'csube', '⫐': 'csup', '⫒': 'csupe', '⋯': 'ctdot', '⤸': 'cudarrl', '⤵': 'cudarrr', '⋞': 'cuepr', '⋟': 'cuesc', '↶': 'cularr', '⤽': 'cularrp', '⩈': 'cupbrcap', '⩆': 'cupcap', '∪': 'cup', '⋓': 'Cup', '⩊': 'cupcup', '⊍': 'cupdot', '⩅': 'cupor', '∪︀': 'cups', '↷': 'curarr', '⤼': 'curarrm', '⋎': 'cuvee', '⋏': 'cuwed', '\xA4': 'curren', '∱': 'cwint', '⌭': 'cylcty', '†': 'dagger', '‡': 'Dagger', 'ℸ': 'daleth', '↓': 'darr', '↡': 'Darr', '⇓': 'dArr', '‐': 'dash', '⫤': 'Dashv', '⊣': 'dashv', '⤏': 'rBarr', '˝': 'dblac', 'Ď': 'Dcaron', 'ď': 'dcaron', 'Д': 'Dcy', 'д': 'dcy', '⇊': 'ddarr', 'ⅆ': 'dd', '⤑': 'DDotrahd', '⩷': 'eDDot', '\xB0': 'deg', '∇': 'Del', 'Δ': 'Delta', 'δ': 'delta', '⦱': 'demptyv', '⥿': 'dfisht', '𝔇': 'Dfr', '𝔡': 'dfr', '⥥': 'dHar', '⇃': 'dharl', '⇂': 'dharr', '˙': 'dot', '`': 'grave', '˜': 'tilde', '⋄': 'diam', '♦': 'diams', '\xA8': 'die', 'ϝ': 'gammad', '⋲': 'disin', '\xF7': 'div', '⋇': 'divonx', 'Ђ': 'DJcy', 'ђ': 'djcy', '⌞': 'dlcorn', '⌍': 'dlcrop', '$': 'dollar', '𝔻': 'Dopf', '𝕕': 'dopf', '⃜': 'DotDot', '≐': 'doteq', '≑': 'eDot', '∸': 'minusd', '∔': 'plusdo', '⊡': 'sdotb', '⇐': 'lArr', '⇔': 'iff', '⟸': 'xlArr', '⟺': 'xhArr', '⟹': 'xrArr', '⇒': 'rArr', '⊨': 'vDash', '⇑': 'uArr', '⇕': 'vArr', '∥': 'par', '⤓': 'DownArrowBar', '⇵': 'duarr', '̑': 'DownBreve', '⥐': 'DownLeftRightVector', '⥞': 'DownLeftTeeVector', '⥖': 'DownLeftVectorBar', '↽': 'lhard', '⥟': 'DownRightTeeVector', '⥗': 'DownRightVectorBar', '⇁': 'rhard', '↧': 'mapstodown', '⊤': 'top', '⤐': 'RBarr', '⌟': 'drcorn', '⌌': 'drcrop', '𝒟': 'Dscr', '𝒹': 'dscr', 'Ѕ': 'DScy', 'ѕ': 'dscy', '⧶': 'dsol', 'Đ': 'Dstrok', 'đ': 'dstrok', '⋱': 'dtdot', '▿': 'dtri', '⥯': 'duhar', '⦦': 'dwangle', 'Џ': 'DZcy', 'џ': 'dzcy', '⟿': 'dzigrarr', '\xC9': 'Eacute', '\xE9': 'eacute', '⩮': 'easter', 'Ě': 'Ecaron', 'ě': 'ecaron', '\xCA': 'Ecirc', '\xEA': 'ecirc', '≖': 'ecir', '≕': 'ecolon', 'Э': 'Ecy', 'э': 'ecy', 'Ė': 'Edot', 'ė': 'edot', 'ⅇ': 'ee', '≒': 'efDot', '𝔈': 'Efr', '𝔢': 'efr', '⪚': 'eg', '\xC8': 'Egrave', '\xE8': 'egrave', '⪖': 'egs', '⪘': 'egsdot', '⪙': 'el', '∈': 'in', '⏧': 'elinters', 'ℓ': 'ell', '⪕': 'els', '⪗': 'elsdot', 'Ē': 'Emacr', 'ē': 'emacr', '∅': 'empty', '◻': 'EmptySmallSquare', '▫': 'EmptyVerySmallSquare', ' ': 'emsp13', ' ': 'emsp14', ' ': 'emsp', 'Ŋ': 'ENG', 'ŋ': 'eng', ' ': 'ensp', 'Ę': 'Eogon', 'ę': 'eogon', '𝔼': 'Eopf', '𝕖': 'eopf', '⋕': 'epar', '⧣': 'eparsl', '⩱': 'eplus', 'ε': 'epsi', 'Ε': 'Epsilon', 'ϵ': 'epsiv', '≂': 'esim', '⩵': 'Equal', '=': 'equals', '≟': 'equest', '⇌': 'rlhar', '⩸': 'equivDD', '⧥': 'eqvparsl', '⥱': 'erarr', '≓': 'erDot', 'ℯ': 'escr', 'ℰ': 'Escr', '⩳': 'Esim', 'Η': 'Eta', 'η': 'eta', '\xD0': 'ETH', '\xF0': 'eth', '\xCB': 'Euml', '\xEB': 'euml', '€': 'euro', '!': 'excl', '∃': 'exist', 'Ф': 'Fcy', 'ф': 'fcy', '♀': 'female', 'ﬃ': 'ffilig', 'ﬀ': 'fflig', 'ﬄ': 'ffllig', '𝔉': 'Ffr', '𝔣': 'ffr', 'ﬁ': 'filig', '◼': 'FilledSmallSquare', 'fj': 'fjlig', '♭': 'flat', 'ﬂ': 'fllig', '▱': 'fltns', 'ƒ': 'fnof', '𝔽': 'Fopf', '𝕗': 'fopf', '∀': 'forall', '⋔': 'fork', '⫙': 'forkv', 'ℱ': 'Fscr', '⨍': 'fpartint', '\xBD': 'half', '⅓': 'frac13', '\xBC': 'frac14', '⅕': 'frac15', '⅙': 'frac16', '⅛': 'frac18', '⅔': 'frac23', '⅖': 'frac25', '\xBE': 'frac34', '⅗': 'frac35', '⅜': 'frac38', '⅘': 'frac45', '⅚': 'frac56', '⅝': 'frac58', '⅞': 'frac78', '⁄': 'frasl', '⌢': 'frown', '𝒻': 'fscr', 'ǵ': 'gacute', 'Γ': 'Gamma', 'γ': 'gamma', 'Ϝ': 'Gammad', '⪆': 'gap', 'Ğ': 'Gbreve', 'ğ': 'gbreve', 'Ģ': 'Gcedil', 'Ĝ': 'Gcirc', 'ĝ': 'gcirc', 'Г': 'Gcy', 'г': 'gcy', 'Ġ': 'Gdot', 'ġ': 'gdot', '≥': 'ge', '≧': 'gE', '⪌': 'gEl', '⋛': 'gel', '⩾': 'ges', '⪩': 'gescc', '⪀': 'gesdot', '⪂': 'gesdoto', '⪄': 'gesdotol', '⋛︀': 'gesl', '⪔': 'gesles', '𝔊': 'Gfr', '𝔤': 'gfr', '≫': 'gg', '⋙': 'Gg', 'ℷ': 'gimel', 'Ѓ': 'GJcy', 'ѓ': 'gjcy', '⪥': 'gla', '≷': 'gl', '⪒': 'glE', '⪤': 'glj', '⪊': 'gnap', '⪈': 'gne', '≩': 'gnE', '⋧': 'gnsim', '𝔾': 'Gopf', '𝕘': 'gopf', '⪢': 'GreaterGreater', '≳': 'gsim', '𝒢': 'Gscr', 'ℊ': 'gscr', '⪎': 'gsime', '⪐': 'gsiml', '⪧': 'gtcc', '⩺': 'gtcir', '>': 'gt', '⋗': 'gtdot', '⦕': 'gtlPar', '⩼': 'gtquest', '⥸': 'gtrarr', '≩︀': 'gvnE', ' ': 'hairsp', 'ℋ': 'Hscr', 'Ъ': 'HARDcy', 'ъ': 'hardcy', '⥈': 'harrcir', '↔': 'harr', '↭': 'harrw', '^': 'Hat', 'ℏ': 'hbar', 'Ĥ': 'Hcirc', 'ĥ': 'hcirc', '♥': 'hearts', '…': 'mldr', '⊹': 'hercon', '𝔥': 'hfr', 'ℌ': 'Hfr', '⤥': 'searhk', '⤦': 'swarhk', '⇿': 'hoarr', '∻': 'homtht', '↩': 'larrhk', '↪': 'rarrhk', '𝕙': 'hopf', 'ℍ': 'Hopf', '―': 'horbar', '𝒽': 'hscr', 'Ħ': 'Hstrok', 'ħ': 'hstrok', '⁃': 'hybull', '\xCD': 'Iacute', '\xED': 'iacute', '⁣': 'ic', '\xCE': 'Icirc', '\xEE': 'icirc', 'И': 'Icy', 'и': 'icy', 'İ': 'Idot', 'Е': 'IEcy', 'е': 'iecy', '\xA1': 'iexcl', '𝔦': 'ifr', 'ℑ': 'Im', '\xCC': 'Igrave', '\xEC': 'igrave', 'ⅈ': 'ii', '⨌': 'qint', '∭': 'tint', '⧜': 'iinfin', '℩': 'iiota', 'Ĳ': 'IJlig', 'ĳ': 'ijlig', 'Ī': 'Imacr', 'ī': 'imacr', 'ℐ': 'Iscr', 'ı': 'imath', '⊷': 'imof', 'Ƶ': 'imped', '℅': 'incare', '∞': 'infin', '⧝': 'infintie', '⊺': 'intcal', '∫': 'int', '∬': 'Int', 'ℤ': 'Zopf', '⨗': 'intlarhk', '⨼': 'iprod', '⁢': 'it', 'Ё': 'IOcy', 'ё': 'iocy', 'Į': 'Iogon', 'į': 'iogon', '𝕀': 'Iopf', '𝕚': 'iopf', 'Ι': 'Iota', 'ι': 'iota', '\xBF': 'iquest', '𝒾': 'iscr', '⋵': 'isindot', '⋹': 'isinE', '⋴': 'isins', '⋳': 'isinsv', 'Ĩ': 'Itilde', 'ĩ': 'itilde', 'І': 'Iukcy', 'і': 'iukcy', '\xCF': 'Iuml', '\xEF': 'iuml', 'Ĵ': 'Jcirc', 'ĵ': 'jcirc', 'Й': 'Jcy', 'й': 'jcy', '𝔍': 'Jfr', '𝔧': 'jfr', 'ȷ': 'jmath', '𝕁': 'Jopf', '𝕛': 'jopf', '𝒥': 'Jscr', '𝒿': 'jscr', 'Ј': 'Jsercy', 'ј': 'jsercy', 'Є': 'Jukcy', 'є': 'jukcy', 'Κ': 'Kappa', 'κ': 'kappa', 'ϰ': 'kappav', 'Ķ': 'Kcedil', 'ķ': 'kcedil', 'К': 'Kcy', 'к': 'kcy', '𝔎': 'Kfr', '𝔨': 'kfr', 'ĸ': 'kgreen', 'Х': 'KHcy', 'х': 'khcy', 'Ќ': 'KJcy', 'ќ': 'kjcy', '𝕂': 'Kopf', '𝕜': 'kopf', '𝒦': 'Kscr', '𝓀': 'kscr', '⇚': 'lAarr', 'Ĺ': 'Lacute', 'ĺ': 'lacute', '⦴': 'laemptyv', 'ℒ': 'Lscr', 'Λ': 'Lambda', 'λ': 'lambda', '⟨': 'lang', '⟪': 'Lang', '⦑': 'langd', '⪅': 'lap', '\xAB': 'laquo', '⇤': 'larrb', '⤟': 'larrbfs', '←': 'larr', '↞': 'Larr', '⤝': 'larrfs', '↫': 'larrlp', '⤹': 'larrpl', '⥳': 'larrsim', '↢': 'larrtl', '⤙': 'latail', '⤛': 'lAtail', '⪫': 'lat', '⪭': 'late', '⪭︀': 'lates', '⤌': 'lbarr', '⤎': 'lBarr', '❲': 'lbbrk', '{': 'lcub', '[': 'lsqb', '⦋': 'lbrke', '⦏': 'lbrksld', '⦍': 'lbrkslu', 'Ľ': 'Lcaron', 'ľ': 'lcaron', 'Ļ': 'Lcedil', 'ļ': 'lcedil', '⌈': 'lceil', 'Л': 'Lcy', 'л': 'lcy', '⤶': 'ldca', '“': 'ldquo', '⥧': 'ldrdhar', '⥋': 'ldrushar', '↲': 'ldsh', '≤': 'le', '≦': 'lE', '⇆': 'lrarr', '⟦': 'lobrk', '⥡': 'LeftDownTeeVector', '⥙': 'LeftDownVectorBar', '⌊': 'lfloor', '↼': 'lharu', '⇇': 'llarr', '⇋': 'lrhar', '⥎': 'LeftRightVector', '↤': 'mapstoleft', '⥚': 'LeftTeeVector', '⋋': 'lthree', '⧏': 'LeftTriangleBar', '⊲': 'vltri', '⊴': 'ltrie', '⥑': 'LeftUpDownVector', '⥠': 'LeftUpTeeVector', '⥘': 'LeftUpVectorBar', '↿': 'uharl', '⥒': 'LeftVectorBar', '⪋': 'lEg', '⋚': 'leg', '⩽': 'les', '⪨': 'lescc', '⩿': 'lesdot', '⪁': 'lesdoto', '⪃': 'lesdotor', '⋚︀': 'lesg', '⪓': 'lesges', '⋖': 'ltdot', '≶': 'lg', '⪡': 'LessLess', '≲': 'lsim', '⥼': 'lfisht', '𝔏': 'Lfr', '𝔩': 'lfr', '⪑': 'lgE', '⥢': 'lHar', '⥪': 'lharul', '▄': 'lhblk', 'Љ': 'LJcy', 'љ': 'ljcy', '≪': 'll', '⋘': 'Ll', '⥫': 'llhard', '◺': 'lltri', 'Ŀ': 'Lmidot', 'ŀ': 'lmidot', '⎰': 'lmoust', '⪉': 'lnap', '⪇': 'lne', '≨': 'lnE', '⋦': 'lnsim', '⟬': 'loang', '⇽': 'loarr', '⟵': 'xlarr', '⟷': 'xharr', '⟼': 'xmap', '⟶': 'xrarr', '↬': 'rarrlp', '⦅': 'lopar', '𝕃': 'Lopf', '𝕝': 'lopf', '⨭': 'loplus', '⨴': 'lotimes', '∗': 'lowast', '_': 'lowbar', '↙': 'swarr', '↘': 'searr', '◊': 'loz', '(': 'lpar', '⦓': 'lparlt', '⥭': 'lrhard', '‎': 'lrm', '⊿': 'lrtri', '‹': 'lsaquo', '𝓁': 'lscr', '↰': 'lsh', '⪍': 'lsime', '⪏': 'lsimg', '‘': 'lsquo', '‚': 'sbquo', 'Ł': 'Lstrok', 'ł': 'lstrok', '⪦': 'ltcc', '⩹': 'ltcir', '<': 'lt', '⋉': 'ltimes', '⥶': 'ltlarr', '⩻': 'ltquest', '◃': 'ltri', '⦖': 'ltrPar', '⥊': 'lurdshar', '⥦': 'luruhar', '≨︀': 'lvnE', '\xAF': 'macr', '♂': 'male', '✠': 'malt', '⤅': 'Map', '↦': 'map', '↥': 'mapstoup', '▮': 'marker', '⨩': 'mcomma', 'М': 'Mcy', 'м': 'mcy', '—': 'mdash', '∺': 'mDDot', ' ': 'MediumSpace', 'ℳ': 'Mscr', '𝔐': 'Mfr', '𝔪': 'mfr', '℧': 'mho', '\xB5': 'micro', '⫰': 'midcir', '∣': 'mid', '−': 'minus', '⨪': 'minusdu', '∓': 'mp', '⫛': 'mlcp', '⊧': 'models', '𝕄': 'Mopf', '𝕞': 'mopf', '𝓂': 'mscr', 'Μ': 'Mu', 'μ': 'mu', '⊸': 'mumap', 'Ń': 'Nacute', 'ń': 'nacute', '∠⃒': 'nang', '≉': 'nap', '⩰̸': 'napE', '≋̸': 'napid', 'ŉ': 'napos', '♮': 'natur', 'ℕ': 'Nopf', '\xA0': 'nbsp', '≎̸': 'nbump', '≏̸': 'nbumpe', '⩃': 'ncap', 'Ň': 'Ncaron', 'ň': 'ncaron', 'Ņ': 'Ncedil', 'ņ': 'ncedil', '≇': 'ncong', '⩭̸': 'ncongdot', '⩂': 'ncup', 'Н': 'Ncy', 'н': 'ncy', '–': 'ndash', '⤤': 'nearhk', '↗': 'nearr', '⇗': 'neArr', '≠': 'ne', '≐̸': 'nedot', '​': 'ZeroWidthSpace', '≢': 'nequiv', '⤨': 'toea', '≂̸': 'nesim', '\n': 'NewLine', '∄': 'nexist', '𝔑': 'Nfr', '𝔫': 'nfr', '≧̸': 'ngE', '≱': 'nge', '⩾̸': 'nges', '⋙̸': 'nGg', '≵': 'ngsim', '≫⃒': 'nGt', '≯': 'ngt', '≫̸': 'nGtv', '↮': 'nharr', '⇎': 'nhArr', '⫲': 'nhpar', '∋': 'ni', '⋼': 'nis', '⋺': 'nisd', 'Њ': 'NJcy', 'њ': 'njcy', '↚': 'nlarr', '⇍': 'nlArr', '‥': 'nldr', '≦̸': 'nlE', '≰': 'nle', '⩽̸': 'nles', '≮': 'nlt', '⋘̸': 'nLl', '≴': 'nlsim', '≪⃒': 'nLt', '⋪': 'nltri', '⋬': 'nltrie', '≪̸': 'nLtv', '∤': 'nmid', '⁠': 'NoBreak', '𝕟': 'nopf', '⫬': 'Not', '\xAC': 'not', '≭': 'NotCupCap', '∦': 'npar', '∉': 'notin', '≹': 'ntgl', '⋵̸': 'notindot', '⋹̸': 'notinE', '⋷': 'notinvb', '⋶': 'notinvc', '⧏̸': 'NotLeftTriangleBar', '≸': 'ntlg', '⪢̸': 'NotNestedGreaterGreater', '⪡̸': 'NotNestedLessLess', '∌': 'notni', '⋾': 'notnivb', '⋽': 'notnivc', '⊀': 'npr', '⪯̸': 'npre', '⋠': 'nprcue', '⧐̸': 'NotRightTriangleBar', '⋫': 'nrtri', '⋭': 'nrtrie', '⊏̸': 'NotSquareSubset', '⋢': 'nsqsube', '⊐̸': 'NotSquareSuperset', '⋣': 'nsqsupe', '⊂⃒': 'vnsub', '⊈': 'nsube', '⊁': 'nsc', '⪰̸': 'nsce', '⋡': 'nsccue', '≿̸': 'NotSucceedsTilde', '⊃⃒': 'vnsup', '⊉': 'nsupe', '≁': 'nsim', '≄': 'nsime', '⫽⃥': 'nparsl', '∂̸': 'npart', '⨔': 'npolint', '⤳̸': 'nrarrc', '↛': 'nrarr', '⇏': 'nrArr', '↝̸': 'nrarrw', '𝒩': 'Nscr', '𝓃': 'nscr', '⊄': 'nsub', '⫅̸': 'nsubE', '⊅': 'nsup', '⫆̸': 'nsupE', '\xD1': 'Ntilde', '\xF1': 'ntilde', 'Ν': 'Nu', 'ν': 'nu', '#': 'num', '№': 'numero', ' ': 'numsp', '≍⃒': 'nvap', '⊬': 'nvdash', '⊭': 'nvDash', '⊮': 'nVdash', '⊯': 'nVDash', '≥⃒': 'nvge', '>⃒': 'nvgt', '⤄': 'nvHarr', '⧞': 'nvinfin', '⤂': 'nvlArr', '≤⃒': 'nvle', '<⃒': 'nvlt', '⊴⃒': 'nvltrie', '⤃': 'nvrArr', '⊵⃒': 'nvrtrie', '∼⃒': 'nvsim', '⤣': 'nwarhk', '↖': 'nwarr', '⇖': 'nwArr', '⤧': 'nwnear', '\xD3': 'Oacute', '\xF3': 'oacute', '\xD4': 'Ocirc', '\xF4': 'ocirc', 'О': 'Ocy', 'о': 'ocy', 'Ő': 'Odblac', 'ő': 'odblac', '⨸': 'odiv', '⦼': 'odsold', 'Œ': 'OElig', 'œ': 'oelig', '⦿': 'ofcir', '𝔒': 'Ofr', '𝔬': 'ofr', '˛': 'ogon', '\xD2': 'Ograve', '\xF2': 'ograve', '⧁': 'ogt', '⦵': 'ohbar', 'Ω': 'ohm', '⦾': 'olcir', '⦻': 'olcross', '‾': 'oline', '⧀': 'olt', 'Ō': 'Omacr', 'ō': 'omacr', 'ω': 'omega', 'Ο': 'Omicron', 'ο': 'omicron', '⦶': 'omid', '𝕆': 'Oopf', '𝕠': 'oopf', '⦷': 'opar', '⦹': 'operp', '⩔': 'Or', '∨': 'or', '⩝': 'ord', 'ℴ': 'oscr', '\xAA': 'ordf', '\xBA': 'ordm', '⊶': 'origof', '⩖': 'oror', '⩗': 'orslope', '⩛': 'orv', '𝒪': 'Oscr', '\xD8': 'Oslash', '\xF8': 'oslash', '⊘': 'osol', '\xD5': 'Otilde', '\xF5': 'otilde', '⨶': 'otimesas', '⨷': 'Otimes', '\xD6': 'Ouml', '\xF6': 'ouml', '⌽': 'ovbar', '⏞': 'OverBrace', '⎴': 'tbrk', '⏜': 'OverParenthesis', '\xB6': 'para', '⫳': 'parsim', '⫽': 'parsl', '∂': 'part', 'П': 'Pcy', 'п': 'pcy', '%': 'percnt', '.': 'period', '‰': 'permil', '‱': 'pertenk', '𝔓': 'Pfr', '𝔭': 'pfr', 'Φ': 'Phi', 'φ': 'phi', 'ϕ': 'phiv', '☎': 'phone', 'Π': 'Pi', 'π': 'pi', 'ϖ': 'piv', 'ℎ': 'planckh', '⨣': 'plusacir', '⨢': 'pluscir', '+': 'plus', '⨥': 'plusdu', '⩲': 'pluse', '\xB1': 'pm', '⨦': 'plussim', '⨧': 'plustwo', '⨕': 'pointint', '𝕡': 'popf', 'ℙ': 'Popf', '\xA3': 'pound', '⪷': 'prap', '⪻': 'Pr', '≺': 'pr', '≼': 'prcue', '⪯': 'pre', '≾': 'prsim', '⪹': 'prnap', '⪵': 'prnE', '⋨': 'prnsim', '⪳': 'prE', '′': 'prime', '″': 'Prime', '∏': 'prod', '⌮': 'profalar', '⌒': 'profline', '⌓': 'profsurf', '∝': 'prop', '⊰': 'prurel', '𝒫': 'Pscr', '𝓅': 'pscr', 'Ψ': 'Psi', 'ψ': 'psi', ' ': 'puncsp', '𝔔': 'Qfr', '𝔮': 'qfr', '𝕢': 'qopf', 'ℚ': 'Qopf', '⁗': 'qprime', '𝒬': 'Qscr', '𝓆': 'qscr', '⨖': 'quatint', '?': 'quest', '"': 'quot', '⇛': 'rAarr', '∽̱': 'race', 'Ŕ': 'Racute', 'ŕ': 'racute', '√': 'Sqrt', '⦳': 'raemptyv', '⟩': 'rang', '⟫': 'Rang', '⦒': 'rangd', '⦥': 'range', '\xBB': 'raquo', '⥵': 'rarrap', '⇥': 'rarrb', '⤠': 'rarrbfs', '⤳': 'rarrc', '→': 'rarr', '↠': 'Rarr', '⤞': 'rarrfs', '⥅': 'rarrpl', '⥴': 'rarrsim', '⤖': 'Rarrtl', '↣': 'rarrtl', '↝': 'rarrw', '⤚': 'ratail', '⤜': 'rAtail', '∶': 'ratio', '❳': 'rbbrk', '}': 'rcub', ']': 'rsqb', '⦌': 'rbrke', '⦎': 'rbrksld', '⦐': 'rbrkslu', 'Ř': 'Rcaron', 'ř': 'rcaron', 'Ŗ': 'Rcedil', 'ŗ': 'rcedil', '⌉': 'rceil', 'Р': 'Rcy', 'р': 'rcy', '⤷': 'rdca', '⥩': 'rdldhar', '↳': 'rdsh', 'ℜ': 'Re', 'ℛ': 'Rscr', 'ℝ': 'Ropf', '▭': 'rect', '⥽': 'rfisht', '⌋': 'rfloor', '𝔯': 'rfr', '⥤': 'rHar', '⇀': 'rharu', '⥬': 'rharul', 'Ρ': 'Rho', 'ρ': 'rho', 'ϱ': 'rhov', '⇄': 'rlarr', '⟧': 'robrk', '⥝': 'RightDownTeeVector', '⥕': 'RightDownVectorBar', '⇉': 'rrarr', '⊢': 'vdash', '⥛': 'RightTeeVector', '⋌': 'rthree', '⧐': 'RightTriangleBar', '⊳': 'vrtri', '⊵': 'rtrie', '⥏': 'RightUpDownVector', '⥜': 'RightUpTeeVector', '⥔': 'RightUpVectorBar', '↾': 'uharr', '⥓': 'RightVectorBar', '˚': 'ring', '‏': 'rlm', '⎱': 'rmoust', '⫮': 'rnmid', '⟭': 'roang', '⇾': 'roarr', '⦆': 'ropar', '𝕣': 'ropf', '⨮': 'roplus', '⨵': 'rotimes', '⥰': 'RoundImplies', ')': 'rpar', '⦔': 'rpargt', '⨒': 'rppolint', '›': 'rsaquo', '𝓇': 'rscr', '↱': 'rsh', '⋊': 'rtimes', '▹': 'rtri', '⧎': 'rtriltri', '⧴': 'RuleDelayed', '⥨': 'ruluhar', '℞': 'rx', 'Ś': 'Sacute', 'ś': 'sacute', '⪸': 'scap', 'Š': 'Scaron', 'š': 'scaron', '⪼': 'Sc', '≻': 'sc', '≽': 'sccue', '⪰': 'sce', '⪴': 'scE', 'Ş': 'Scedil', 'ş': 'scedil', 'Ŝ': 'Scirc', 'ŝ': 'scirc', '⪺': 'scnap', '⪶': 'scnE', '⋩': 'scnsim', '⨓': 'scpolint', '≿': 'scsim', 'С': 'Scy', 'с': 'scy', '⋅': 'sdot', '⩦': 'sdote', '⇘': 'seArr', '\xA7': 'sect', ';': 'semi', '⤩': 'tosa', '✶': 'sext', '𝔖': 'Sfr', '𝔰': 'sfr', '♯': 'sharp', 'Щ': 'SHCHcy', 'щ': 'shchcy', 'Ш': 'SHcy', 'ш': 'shcy', '↑': 'uarr', '\xAD': 'shy', 'Σ': 'Sigma', 'σ': 'sigma', 'ς': 'sigmaf', '∼': 'sim', '⩪': 'simdot', '≃': 'sime', '⪞': 'simg', '⪠': 'simgE', '⪝': 'siml', '⪟': 'simlE', '≆': 'simne', '⨤': 'simplus', '⥲': 'simrarr', '⨳': 'smashp', '⧤': 'smeparsl', '⌣': 'smile', '⪪': 'smt', '⪬': 'smte', '⪬︀': 'smtes', 'Ь': 'SOFTcy', 'ь': 'softcy', '⌿': 'solbar', '⧄': 'solb', '/': 'sol', '𝕊': 'Sopf', '𝕤': 'sopf', '♠': 'spades', '⊓': 'sqcap', '⊓︀': 'sqcaps', '⊔': 'sqcup', '⊔︀': 'sqcups', '⊏': 'sqsub', '⊑': 'sqsube', '⊐': 'sqsup', '⊒': 'sqsupe', '□': 'squ', '𝒮': 'Sscr', '𝓈': 'sscr', '⋆': 'Star', '☆': 'star', '⊂': 'sub', '⋐': 'Sub', '⪽': 'subdot', '⫅': 'subE', '⊆': 'sube', '⫃': 'subedot', '⫁': 'submult', '⫋': 'subnE', '⊊': 'subne', '⪿': 'subplus', '⥹': 'subrarr', '⫇': 'subsim', '⫕': 'subsub', '⫓': 'subsup', '∑': 'sum', '♪': 'sung', '\xB9': 'sup1', '\xB2': 'sup2', '\xB3': 'sup3', '⊃': 'sup', '⋑': 'Sup', '⪾': 'supdot', '⫘': 'supdsub', '⫆': 'supE', '⊇': 'supe', '⫄': 'supedot', '⟉': 'suphsol', '⫗': 'suphsub', '⥻': 'suplarr', '⫂': 'supmult', '⫌': 'supnE', '⊋': 'supne', '⫀': 'supplus', '⫈': 'supsim', '⫔': 'supsub', '⫖': 'supsup', '⇙': 'swArr', '⤪': 'swnwar', '\xDF': 'szlig', '\t': 'Tab', '⌖': 'target', 'Τ': 'Tau', 'τ': 'tau', 'Ť': 'Tcaron', 'ť': 'tcaron', 'Ţ': 'Tcedil', 'ţ': 'tcedil', 'Т': 'Tcy', 'т': 'tcy', '⃛': 'tdot', '⌕': 'telrec', '𝔗': 'Tfr', '𝔱': 'tfr', '∴': 'there4', 'Θ': 'Theta', 'θ': 'theta', 'ϑ': 'thetav', '  ': 'ThickSpace', ' ': 'thinsp', '\xDE': 'THORN', '\xFE': 'thorn', '⨱': 'timesbar', '\xD7': 'times', '⨰': 'timesd', '⌶': 'topbot', '⫱': 'topcir', '𝕋': 'Topf', '𝕥': 'topf', '⫚': 'topfork', '‴': 'tprime', '™': 'trade', '▵': 'utri', '≜': 'trie', '◬': 'tridot', '⨺': 'triminus', '⨹': 'triplus', '⧍': 'trisb', '⨻': 'tritime', '⏢': 'trpezium', '𝒯': 'Tscr', '𝓉': 'tscr', 'Ц': 'TScy', 'ц': 'tscy', 'Ћ': 'TSHcy', 'ћ': 'tshcy', 'Ŧ': 'Tstrok', 'ŧ': 'tstrok', '\xDA': 'Uacute', '\xFA': 'uacute', '↟': 'Uarr', '⥉': 'Uarrocir', 'Ў': 'Ubrcy', 'ў': 'ubrcy', 'Ŭ': 'Ubreve', 'ŭ': 'ubreve', '\xDB': 'Ucirc', '\xFB': 'ucirc', 'У': 'Ucy', 'у': 'ucy', '⇅': 'udarr', 'Ű': 'Udblac', 'ű': 'udblac', '⥮': 'udhar', '⥾': 'ufisht', '𝔘': 'Ufr', '𝔲': 'ufr', '\xD9': 'Ugrave', '\xF9': 'ugrave', '⥣': 'uHar', '▀': 'uhblk', '⌜': 'ulcorn', '⌏': 'ulcrop', '◸': 'ultri', 'Ū': 'Umacr', 'ū': 'umacr', '⏟': 'UnderBrace', '⏝': 'UnderParenthesis', '⊎': 'uplus', 'Ų': 'Uogon', 'ų': 'uogon', '𝕌': 'Uopf', '𝕦': 'uopf', '⤒': 'UpArrowBar', '↕': 'varr', 'υ': 'upsi', 'ϒ': 'Upsi', 'Υ': 'Upsilon', '⇈': 'uuarr', '⌝': 'urcorn', '⌎': 'urcrop', 'Ů': 'Uring', 'ů': 'uring', '◹': 'urtri', '𝒰': 'Uscr', '𝓊': 'uscr', '⋰': 'utdot', 'Ũ': 'Utilde', 'ũ': 'utilde', '\xDC': 'Uuml', '\xFC': 'uuml', '⦧': 'uwangle', '⦜': 'vangrt', '⊊︀': 'vsubne', '⫋︀': 'vsubnE', '⊋︀': 'vsupne', '⫌︀': 'vsupnE', '⫨': 'vBar', '⫫': 'Vbar', '⫩': 'vBarv', 'В': 'Vcy', 'в': 'vcy', '⊩': 'Vdash', '⊫': 'VDash', '⫦': 'Vdashl', '⊻': 'veebar', '≚': 'veeeq', '⋮': 'vellip', '|': 'vert', '‖': 'Vert', '❘': 'VerticalSeparator', '≀': 'wr', '𝔙': 'Vfr', '𝔳': 'vfr', '𝕍': 'Vopf', '𝕧': 'vopf', '𝒱': 'Vscr', '𝓋': 'vscr', '⊪': 'Vvdash', '⦚': 'vzigzag', 'Ŵ': 'Wcirc', 'ŵ': 'wcirc', '⩟': 'wedbar', '≙': 'wedgeq', '℘': 'wp', '𝔚': 'Wfr', '𝔴': 'wfr', '𝕎': 'Wopf', '𝕨': 'wopf', '𝒲': 'Wscr', '𝓌': 'wscr', '𝔛': 'Xfr', '𝔵': 'xfr', 'Ξ': 'Xi', 'ξ': 'xi', '⋻': 'xnis', '𝕏': 'Xopf', '𝕩': 'xopf', '𝒳': 'Xscr', '𝓍': 'xscr', '\xDD': 'Yacute', '\xFD': 'yacute', 'Я': 'YAcy', 'я': 'yacy', 'Ŷ': 'Ycirc', 'ŷ': 'ycirc', 'Ы': 'Ycy', 'ы': 'ycy', '\xA5': 'yen', '𝔜': 'Yfr', '𝔶': 'yfr', 'Ї': 'YIcy', 'ї': 'yicy', '𝕐': 'Yopf', '𝕪': 'yopf', '𝒴': 'Yscr', '𝓎': 'yscr', 'Ю': 'YUcy', 'ю': 'yucy', '\xFF': 'yuml', 'Ÿ': 'Yuml', 'Ź': 'Zacute', 'ź': 'zacute', 'Ž': 'Zcaron', 'ž': 'zcaron', 'З': 'Zcy', 'з': 'zcy', 'Ż': 'Zdot', 'ż': 'zdot', 'ℨ': 'Zfr', 'Ζ': 'Zeta', 'ζ': 'zeta', '𝔷': 'zfr', 'Ж': 'ZHcy', 'ж': 'zhcy', '⇝': 'zigrarr', '𝕫': 'zopf', '𝒵': 'Zscr', '𝓏': 'zscr', '‍': 'zwj', '‌': 'zwnj' };

	var regexEscape = /["&'<>`]/g;
	var escapeMap = {
		'"': '&quot;',
		'&': '&amp;',
		'\'': '&#x27;',
		'<': '&lt;',
		// See https://mathiasbynens.be/notes/ambiguous-ampersands: in HTML, the
		// following is not strictly necessary unless it’s part of a tag or an
		// unquoted attribute value. We’re only escaping it to support those
		// situations, and for XML support.
		'>': '&gt;',
		// In Internet Explorer ≤ 8, the backtick character can be used
		// to break out of (un)quoted attribute values or HTML comments.
		// See http://html5sec.org/#102, http://html5sec.org/#108, and
		// http://html5sec.org/#133.
		'`': '&#x60;'
	};

	var regexInvalidEntity = /&#(?:[xX][^a-fA-F0-9]|[^0-9xX])/;
	var regexInvalidRawCodePoint = /[\0-\x08\x0B\x0E-\x1F\x7F-\x9F\uFDD0-\uFDEF\uFFFE\uFFFF]|[\uD83F\uD87F\uD8BF\uD8FF\uD93F\uD97F\uD9BF\uD9FF\uDA3F\uDA7F\uDABF\uDAFF\uDB3F\uDB7F\uDBBF\uDBFF][\uDFFE\uDFFF]|[\uD800-\uDBFF](?![\uDC00-\uDFFF])|(?:[^\uD800-\uDBFF]|^)[\uDC00-\uDFFF]/;
	var regexDecode = /&#([0-9]+)(;?)|&#[xX]([a-fA-F0-9]+)(;?)|&([0-9a-zA-Z]+);|&(Aacute|iacute|Uacute|plusmn|otilde|Otilde|Agrave|agrave|yacute|Yacute|oslash|Oslash|Atilde|atilde|brvbar|Ccedil|ccedil|ograve|curren|divide|Eacute|eacute|Ograve|oacute|Egrave|egrave|ugrave|frac12|frac14|frac34|Ugrave|Oacute|Iacute|ntilde|Ntilde|uacute|middot|Igrave|igrave|iquest|aacute|laquo|THORN|micro|iexcl|icirc|Icirc|Acirc|ucirc|ecirc|Ocirc|ocirc|Ecirc|Ucirc|aring|Aring|aelig|AElig|acute|pound|raquo|acirc|times|thorn|szlig|cedil|COPY|Auml|ordf|ordm|uuml|macr|Uuml|auml|Ouml|ouml|para|nbsp|Euml|quot|QUOT|euml|yuml|cent|sect|copy|sup1|sup2|sup3|Iuml|iuml|shy|eth|reg|not|yen|amp|AMP|REG|uml|ETH|deg|gt|GT|LT|lt)([=a-zA-Z0-9])?/g;
	var decodeMap = { 'Aacute': '\xC1', 'aacute': '\xE1', 'Abreve': 'Ă', 'abreve': 'ă', 'ac': '∾', 'acd': '∿', 'acE': '∾̳', 'Acirc': '\xC2', 'acirc': '\xE2', 'acute': '\xB4', 'Acy': 'А', 'acy': 'а', 'AElig': '\xC6', 'aelig': '\xE6', 'af': '⁡', 'Afr': '𝔄', 'afr': '𝔞', 'Agrave': '\xC0', 'agrave': '\xE0', 'alefsym': 'ℵ', 'aleph': 'ℵ', 'Alpha': 'Α', 'alpha': 'α', 'Amacr': 'Ā', 'amacr': 'ā', 'amalg': '⨿', 'amp': '&', 'AMP': '&', 'andand': '⩕', 'And': '⩓', 'and': '∧', 'andd': '⩜', 'andslope': '⩘', 'andv': '⩚', 'ang': '∠', 'ange': '⦤', 'angle': '∠', 'angmsdaa': '⦨', 'angmsdab': '⦩', 'angmsdac': '⦪', 'angmsdad': '⦫', 'angmsdae': '⦬', 'angmsdaf': '⦭', 'angmsdag': '⦮', 'angmsdah': '⦯', 'angmsd': '∡', 'angrt': '∟', 'angrtvb': '⊾', 'angrtvbd': '⦝', 'angsph': '∢', 'angst': '\xC5', 'angzarr': '⍼', 'Aogon': 'Ą', 'aogon': 'ą', 'Aopf': '𝔸', 'aopf': '𝕒', 'apacir': '⩯', 'ap': '≈', 'apE': '⩰', 'ape': '≊', 'apid': '≋', 'apos': '\'', 'ApplyFunction': '⁡', 'approx': '≈', 'approxeq': '≊', 'Aring': '\xC5', 'aring': '\xE5', 'Ascr': '𝒜', 'ascr': '𝒶', 'Assign': '≔', 'ast': '*', 'asymp': '≈', 'asympeq': '≍', 'Atilde': '\xC3', 'atilde': '\xE3', 'Auml': '\xC4', 'auml': '\xE4', 'awconint': '∳', 'awint': '⨑', 'backcong': '≌', 'backepsilon': '϶', 'backprime': '‵', 'backsim': '∽', 'backsimeq': '⋍', 'Backslash': '∖', 'Barv': '⫧', 'barvee': '⊽', 'barwed': '⌅', 'Barwed': '⌆', 'barwedge': '⌅', 'bbrk': '⎵', 'bbrktbrk': '⎶', 'bcong': '≌', 'Bcy': 'Б', 'bcy': 'б', 'bdquo': '„', 'becaus': '∵', 'because': '∵', 'Because': '∵', 'bemptyv': '⦰', 'bepsi': '϶', 'bernou': 'ℬ', 'Bernoullis': 'ℬ', 'Beta': 'Β', 'beta': 'β', 'beth': 'ℶ', 'between': '≬', 'Bfr': '𝔅', 'bfr': '𝔟', 'bigcap': '⋂', 'bigcirc': '◯', 'bigcup': '⋃', 'bigodot': '⨀', 'bigoplus': '⨁', 'bigotimes': '⨂', 'bigsqcup': '⨆', 'bigstar': '★', 'bigtriangledown': '▽', 'bigtriangleup': '△', 'biguplus': '⨄', 'bigvee': '⋁', 'bigwedge': '⋀', 'bkarow': '⤍', 'blacklozenge': '⧫', 'blacksquare': '▪', 'blacktriangle': '▴', 'blacktriangledown': '▾', 'blacktriangleleft': '◂', 'blacktriangleright': '▸', 'blank': '␣', 'blk12': '▒', 'blk14': '░', 'blk34': '▓', 'block': '█', 'bne': '=⃥', 'bnequiv': '≡⃥', 'bNot': '⫭', 'bnot': '⌐', 'Bopf': '𝔹', 'bopf': '𝕓', 'bot': '⊥', 'bottom': '⊥', 'bowtie': '⋈', 'boxbox': '⧉', 'boxdl': '┐', 'boxdL': '╕', 'boxDl': '╖', 'boxDL': '╗', 'boxdr': '┌', 'boxdR': '╒', 'boxDr': '╓', 'boxDR': '╔', 'boxh': '─', 'boxH': '═', 'boxhd': '┬', 'boxHd': '╤', 'boxhD': '╥', 'boxHD': '╦', 'boxhu': '┴', 'boxHu': '╧', 'boxhU': '╨', 'boxHU': '╩', 'boxminus': '⊟', 'boxplus': '⊞', 'boxtimes': '⊠', 'boxul': '┘', 'boxuL': '╛', 'boxUl': '╜', 'boxUL': '╝', 'boxur': '└', 'boxuR': '╘', 'boxUr': '╙', 'boxUR': '╚', 'boxv': '│', 'boxV': '║', 'boxvh': '┼', 'boxvH': '╪', 'boxVh': '╫', 'boxVH': '╬', 'boxvl': '┤', 'boxvL': '╡', 'boxVl': '╢', 'boxVL': '╣', 'boxvr': '├', 'boxvR': '╞', 'boxVr': '╟', 'boxVR': '╠', 'bprime': '‵', 'breve': '˘', 'Breve': '˘', 'brvbar': '\xA6', 'bscr': '𝒷', 'Bscr': 'ℬ', 'bsemi': '⁏', 'bsim': '∽', 'bsime': '⋍', 'bsolb': '⧅', 'bsol': '\\', 'bsolhsub': '⟈', 'bull': '•', 'bullet': '•', 'bump': '≎', 'bumpE': '⪮', 'bumpe': '≏', 'Bumpeq': '≎', 'bumpeq': '≏', 'Cacute': 'Ć', 'cacute': 'ć', 'capand': '⩄', 'capbrcup': '⩉', 'capcap': '⩋', 'cap': '∩', 'Cap': '⋒', 'capcup': '⩇', 'capdot': '⩀', 'CapitalDifferentialD': 'ⅅ', 'caps': '∩︀', 'caret': '⁁', 'caron': 'ˇ', 'Cayleys': 'ℭ', 'ccaps': '⩍', 'Ccaron': 'Č', 'ccaron': 'č', 'Ccedil': '\xC7', 'ccedil': '\xE7', 'Ccirc': 'Ĉ', 'ccirc': 'ĉ', 'Cconint': '∰', 'ccups': '⩌', 'ccupssm': '⩐', 'Cdot': 'Ċ', 'cdot': 'ċ', 'cedil': '\xB8', 'Cedilla': '\xB8', 'cemptyv': '⦲', 'cent': '\xA2', 'centerdot': '\xB7', 'CenterDot': '\xB7', 'cfr': '𝔠', 'Cfr': 'ℭ', 'CHcy': 'Ч', 'chcy': 'ч', 'check': '✓', 'checkmark': '✓', 'Chi': 'Χ', 'chi': 'χ', 'circ': 'ˆ', 'circeq': '≗', 'circlearrowleft': '↺', 'circlearrowright': '↻', 'circledast': '⊛', 'circledcirc': '⊚', 'circleddash': '⊝', 'CircleDot': '⊙', 'circledR': '\xAE', 'circledS': 'Ⓢ', 'CircleMinus': '⊖', 'CirclePlus': '⊕', 'CircleTimes': '⊗', 'cir': '○', 'cirE': '⧃', 'cire': '≗', 'cirfnint': '⨐', 'cirmid': '⫯', 'cirscir': '⧂', 'ClockwiseContourIntegral': '∲', 'CloseCurlyDoubleQuote': '”', 'CloseCurlyQuote': '’', 'clubs': '♣', 'clubsuit': '♣', 'colon': ':', 'Colon': '∷', 'Colone': '⩴', 'colone': '≔', 'coloneq': '≔', 'comma': ',', 'commat': '@', 'comp': '∁', 'compfn': '∘', 'complement': '∁', 'complexes': 'ℂ', 'cong': '≅', 'congdot': '⩭', 'Congruent': '≡', 'conint': '∮', 'Conint': '∯', 'ContourIntegral': '∮', 'copf': '𝕔', 'Copf': 'ℂ', 'coprod': '∐', 'Coproduct': '∐', 'copy': '\xA9', 'COPY': '\xA9', 'copysr': '℗', 'CounterClockwiseContourIntegral': '∳', 'crarr': '↵', 'cross': '✗', 'Cross': '⨯', 'Cscr': '𝒞', 'cscr': '𝒸', 'csub': '⫏', 'csube': '⫑', 'csup': '⫐', 'csupe': '⫒', 'ctdot': '⋯', 'cudarrl': '⤸', 'cudarrr': '⤵', 'cuepr': '⋞', 'cuesc': '⋟', 'cularr': '↶', 'cularrp': '⤽', 'cupbrcap': '⩈', 'cupcap': '⩆', 'CupCap': '≍', 'cup': '∪', 'Cup': '⋓', 'cupcup': '⩊', 'cupdot': '⊍', 'cupor': '⩅', 'cups': '∪︀', 'curarr': '↷', 'curarrm': '⤼', 'curlyeqprec': '⋞', 'curlyeqsucc': '⋟', 'curlyvee': '⋎', 'curlywedge': '⋏', 'curren': '\xA4', 'curvearrowleft': '↶', 'curvearrowright': '↷', 'cuvee': '⋎', 'cuwed': '⋏', 'cwconint': '∲', 'cwint': '∱', 'cylcty': '⌭', 'dagger': '†', 'Dagger': '‡', 'daleth': 'ℸ', 'darr': '↓', 'Darr': '↡', 'dArr': '⇓', 'dash': '‐', 'Dashv': '⫤', 'dashv': '⊣', 'dbkarow': '⤏', 'dblac': '˝', 'Dcaron': 'Ď', 'dcaron': 'ď', 'Dcy': 'Д', 'dcy': 'д', 'ddagger': '‡', 'ddarr': '⇊', 'DD': 'ⅅ', 'dd': 'ⅆ', 'DDotrahd': '⤑', 'ddotseq': '⩷', 'deg': '\xB0', 'Del': '∇', 'Delta': 'Δ', 'delta': 'δ', 'demptyv': '⦱', 'dfisht': '⥿', 'Dfr': '𝔇', 'dfr': '𝔡', 'dHar': '⥥', 'dharl': '⇃', 'dharr': '⇂', 'DiacriticalAcute': '\xB4', 'DiacriticalDot': '˙', 'DiacriticalDoubleAcute': '˝', 'DiacriticalGrave': '`', 'DiacriticalTilde': '˜', 'diam': '⋄', 'diamond': '⋄', 'Diamond': '⋄', 'diamondsuit': '♦', 'diams': '♦', 'die': '\xA8', 'DifferentialD': 'ⅆ', 'digamma': 'ϝ', 'disin': '⋲', 'div': '\xF7', 'divide': '\xF7', 'divideontimes': '⋇', 'divonx': '⋇', 'DJcy': 'Ђ', 'djcy': 'ђ', 'dlcorn': '⌞', 'dlcrop': '⌍', 'dollar': '$', 'Dopf': '𝔻', 'dopf': '𝕕', 'Dot': '\xA8', 'dot': '˙', 'DotDot': '⃜', 'doteq': '≐', 'doteqdot': '≑', 'DotEqual': '≐', 'dotminus': '∸', 'dotplus': '∔', 'dotsquare': '⊡', 'doublebarwedge': '⌆', 'DoubleContourIntegral': '∯', 'DoubleDot': '\xA8', 'DoubleDownArrow': '⇓', 'DoubleLeftArrow': '⇐', 'DoubleLeftRightArrow': '⇔', 'DoubleLeftTee': '⫤', 'DoubleLongLeftArrow': '⟸', 'DoubleLongLeftRightArrow': '⟺', 'DoubleLongRightArrow': '⟹', 'DoubleRightArrow': '⇒', 'DoubleRightTee': '⊨', 'DoubleUpArrow': '⇑', 'DoubleUpDownArrow': '⇕', 'DoubleVerticalBar': '∥', 'DownArrowBar': '⤓', 'downarrow': '↓', 'DownArrow': '↓', 'Downarrow': '⇓', 'DownArrowUpArrow': '⇵', 'DownBreve': '̑', 'downdownarrows': '⇊', 'downharpoonleft': '⇃', 'downharpoonright': '⇂', 'DownLeftRightVector': '⥐', 'DownLeftTeeVector': '⥞', 'DownLeftVectorBar': '⥖', 'DownLeftVector': '↽', 'DownRightTeeVector': '⥟', 'DownRightVectorBar': '⥗', 'DownRightVector': '⇁', 'DownTeeArrow': '↧', 'DownTee': '⊤', 'drbkarow': '⤐', 'drcorn': '⌟', 'drcrop': '⌌', 'Dscr': '𝒟', 'dscr': '𝒹', 'DScy': 'Ѕ', 'dscy': 'ѕ', 'dsol': '⧶', 'Dstrok': 'Đ', 'dstrok': 'đ', 'dtdot': '⋱', 'dtri': '▿', 'dtrif': '▾', 'duarr': '⇵', 'duhar': '⥯', 'dwangle': '⦦', 'DZcy': 'Џ', 'dzcy': 'џ', 'dzigrarr': '⟿', 'Eacute': '\xC9', 'eacute': '\xE9', 'easter': '⩮', 'Ecaron': 'Ě', 'ecaron': 'ě', 'Ecirc': '\xCA', 'ecirc': '\xEA', 'ecir': '≖', 'ecolon': '≕', 'Ecy': 'Э', 'ecy': 'э', 'eDDot': '⩷', 'Edot': 'Ė', 'edot': 'ė', 'eDot': '≑', 'ee': 'ⅇ', 'efDot': '≒', 'Efr': '𝔈', 'efr': '𝔢', 'eg': '⪚', 'Egrave': '\xC8', 'egrave': '\xE8', 'egs': '⪖', 'egsdot': '⪘', 'el': '⪙', 'Element': '∈', 'elinters': '⏧', 'ell': 'ℓ', 'els': '⪕', 'elsdot': '⪗', 'Emacr': 'Ē', 'emacr': 'ē', 'empty': '∅', 'emptyset': '∅', 'EmptySmallSquare': '◻', 'emptyv': '∅', 'EmptyVerySmallSquare': '▫', 'emsp13': ' ', 'emsp14': ' ', 'emsp': ' ', 'ENG': 'Ŋ', 'eng': 'ŋ', 'ensp': ' ', 'Eogon': 'Ę', 'eogon': 'ę', 'Eopf': '𝔼', 'eopf': '𝕖', 'epar': '⋕', 'eparsl': '⧣', 'eplus': '⩱', 'epsi': 'ε', 'Epsilon': 'Ε', 'epsilon': 'ε', 'epsiv': 'ϵ', 'eqcirc': '≖', 'eqcolon': '≕', 'eqsim': '≂', 'eqslantgtr': '⪖', 'eqslantless': '⪕', 'Equal': '⩵', 'equals': '=', 'EqualTilde': '≂', 'equest': '≟', 'Equilibrium': '⇌', 'equiv': '≡', 'equivDD': '⩸', 'eqvparsl': '⧥', 'erarr': '⥱', 'erDot': '≓', 'escr': 'ℯ', 'Escr': 'ℰ', 'esdot': '≐', 'Esim': '⩳', 'esim': '≂', 'Eta': 'Η', 'eta': 'η', 'ETH': '\xD0', 'eth': '\xF0', 'Euml': '\xCB', 'euml': '\xEB', 'euro': '€', 'excl': '!', 'exist': '∃', 'Exists': '∃', 'expectation': 'ℰ', 'exponentiale': 'ⅇ', 'ExponentialE': 'ⅇ', 'fallingdotseq': '≒', 'Fcy': 'Ф', 'fcy': 'ф', 'female': '♀', 'ffilig': 'ﬃ', 'fflig': 'ﬀ', 'ffllig': 'ﬄ', 'Ffr': '𝔉', 'ffr': '𝔣', 'filig': 'ﬁ', 'FilledSmallSquare': '◼', 'FilledVerySmallSquare': '▪', 'fjlig': 'fj', 'flat': '♭', 'fllig': 'ﬂ', 'fltns': '▱', 'fnof': 'ƒ', 'Fopf': '𝔽', 'fopf': '𝕗', 'forall': '∀', 'ForAll': '∀', 'fork': '⋔', 'forkv': '⫙', 'Fouriertrf': 'ℱ', 'fpartint': '⨍', 'frac12': '\xBD', 'frac13': '⅓', 'frac14': '\xBC', 'frac15': '⅕', 'frac16': '⅙', 'frac18': '⅛', 'frac23': '⅔', 'frac25': '⅖', 'frac34': '\xBE', 'frac35': '⅗', 'frac38': '⅜', 'frac45': '⅘', 'frac56': '⅚', 'frac58': '⅝', 'frac78': '⅞', 'frasl': '⁄', 'frown': '⌢', 'fscr': '𝒻', 'Fscr': 'ℱ', 'gacute': 'ǵ', 'Gamma': 'Γ', 'gamma': 'γ', 'Gammad': 'Ϝ', 'gammad': 'ϝ', 'gap': '⪆', 'Gbreve': 'Ğ', 'gbreve': 'ğ', 'Gcedil': 'Ģ', 'Gcirc': 'Ĝ', 'gcirc': 'ĝ', 'Gcy': 'Г', 'gcy': 'г', 'Gdot': 'Ġ', 'gdot': 'ġ', 'ge': '≥', 'gE': '≧', 'gEl': '⪌', 'gel': '⋛', 'geq': '≥', 'geqq': '≧', 'geqslant': '⩾', 'gescc': '⪩', 'ges': '⩾', 'gesdot': '⪀', 'gesdoto': '⪂', 'gesdotol': '⪄', 'gesl': '⋛︀', 'gesles': '⪔', 'Gfr': '𝔊', 'gfr': '𝔤', 'gg': '≫', 'Gg': '⋙', 'ggg': '⋙', 'gimel': 'ℷ', 'GJcy': 'Ѓ', 'gjcy': 'ѓ', 'gla': '⪥', 'gl': '≷', 'glE': '⪒', 'glj': '⪤', 'gnap': '⪊', 'gnapprox': '⪊', 'gne': '⪈', 'gnE': '≩', 'gneq': '⪈', 'gneqq': '≩', 'gnsim': '⋧', 'Gopf': '𝔾', 'gopf': '𝕘', 'grave': '`', 'GreaterEqual': '≥', 'GreaterEqualLess': '⋛', 'GreaterFullEqual': '≧', 'GreaterGreater': '⪢', 'GreaterLess': '≷', 'GreaterSlantEqual': '⩾', 'GreaterTilde': '≳', 'Gscr': '𝒢', 'gscr': 'ℊ', 'gsim': '≳', 'gsime': '⪎', 'gsiml': '⪐', 'gtcc': '⪧', 'gtcir': '⩺', 'gt': '>', 'GT': '>', 'Gt': '≫', 'gtdot': '⋗', 'gtlPar': '⦕', 'gtquest': '⩼', 'gtrapprox': '⪆', 'gtrarr': '⥸', 'gtrdot': '⋗', 'gtreqless': '⋛', 'gtreqqless': '⪌', 'gtrless': '≷', 'gtrsim': '≳', 'gvertneqq': '≩︀', 'gvnE': '≩︀', 'Hacek': 'ˇ', 'hairsp': ' ', 'half': '\xBD', 'hamilt': 'ℋ', 'HARDcy': 'Ъ', 'hardcy': 'ъ', 'harrcir': '⥈', 'harr': '↔', 'hArr': '⇔', 'harrw': '↭', 'Hat': '^', 'hbar': 'ℏ', 'Hcirc': 'Ĥ', 'hcirc': 'ĥ', 'hearts': '♥', 'heartsuit': '♥', 'hellip': '…', 'hercon': '⊹', 'hfr': '𝔥', 'Hfr': 'ℌ', 'HilbertSpace': 'ℋ', 'hksearow': '⤥', 'hkswarow': '⤦', 'hoarr': '⇿', 'homtht': '∻', 'hookleftarrow': '↩', 'hookrightarrow': '↪', 'hopf': '𝕙', 'Hopf': 'ℍ', 'horbar': '―', 'HorizontalLine': '─', 'hscr': '𝒽', 'Hscr': 'ℋ', 'hslash': 'ℏ', 'Hstrok': 'Ħ', 'hstrok': 'ħ', 'HumpDownHump': '≎', 'HumpEqual': '≏', 'hybull': '⁃', 'hyphen': '‐', 'Iacute': '\xCD', 'iacute': '\xED', 'ic': '⁣', 'Icirc': '\xCE', 'icirc': '\xEE', 'Icy': 'И', 'icy': 'и', 'Idot': 'İ', 'IEcy': 'Е', 'iecy': 'е', 'iexcl': '\xA1', 'iff': '⇔', 'ifr': '𝔦', 'Ifr': 'ℑ', 'Igrave': '\xCC', 'igrave': '\xEC', 'ii': 'ⅈ', 'iiiint': '⨌', 'iiint': '∭', 'iinfin': '⧜', 'iiota': '℩', 'IJlig': 'Ĳ', 'ijlig': 'ĳ', 'Imacr': 'Ī', 'imacr': 'ī', 'image': 'ℑ', 'ImaginaryI': 'ⅈ', 'imagline': 'ℐ', 'imagpart': 'ℑ', 'imath': 'ı', 'Im': 'ℑ', 'imof': '⊷', 'imped': 'Ƶ', 'Implies': '⇒', 'incare': '℅', 'in': '∈', 'infin': '∞', 'infintie': '⧝', 'inodot': 'ı', 'intcal': '⊺', 'int': '∫', 'Int': '∬', 'integers': 'ℤ', 'Integral': '∫', 'intercal': '⊺', 'Intersection': '⋂', 'intlarhk': '⨗', 'intprod': '⨼', 'InvisibleComma': '⁣', 'InvisibleTimes': '⁢', 'IOcy': 'Ё', 'iocy': 'ё', 'Iogon': 'Į', 'iogon': 'į', 'Iopf': '𝕀', 'iopf': '𝕚', 'Iota': 'Ι', 'iota': 'ι', 'iprod': '⨼', 'iquest': '\xBF', 'iscr': '𝒾', 'Iscr': 'ℐ', 'isin': '∈', 'isindot': '⋵', 'isinE': '⋹', 'isins': '⋴', 'isinsv': '⋳', 'isinv': '∈', 'it': '⁢', 'Itilde': 'Ĩ', 'itilde': 'ĩ', 'Iukcy': 'І', 'iukcy': 'і', 'Iuml': '\xCF', 'iuml': '\xEF', 'Jcirc': 'Ĵ', 'jcirc': 'ĵ', 'Jcy': 'Й', 'jcy': 'й', 'Jfr': '𝔍', 'jfr': '𝔧', 'jmath': 'ȷ', 'Jopf': '𝕁', 'jopf': '𝕛', 'Jscr': '𝒥', 'jscr': '𝒿', 'Jsercy': 'Ј', 'jsercy': 'ј', 'Jukcy': 'Є', 'jukcy': 'є', 'Kappa': 'Κ', 'kappa': 'κ', 'kappav': 'ϰ', 'Kcedil': 'Ķ', 'kcedil': 'ķ', 'Kcy': 'К', 'kcy': 'к', 'Kfr': '𝔎', 'kfr': '𝔨', 'kgreen': 'ĸ', 'KHcy': 'Х', 'khcy': 'х', 'KJcy': 'Ќ', 'kjcy': 'ќ', 'Kopf': '𝕂', 'kopf': '𝕜', 'Kscr': '𝒦', 'kscr': '𝓀', 'lAarr': '⇚', 'Lacute': 'Ĺ', 'lacute': 'ĺ', 'laemptyv': '⦴', 'lagran': 'ℒ', 'Lambda': 'Λ', 'lambda': 'λ', 'lang': '⟨', 'Lang': '⟪', 'langd': '⦑', 'langle': '⟨', 'lap': '⪅', 'Laplacetrf': 'ℒ', 'laquo': '\xAB', 'larrb': '⇤', 'larrbfs': '⤟', 'larr': '←', 'Larr': '↞', 'lArr': '⇐', 'larrfs': '⤝', 'larrhk': '↩', 'larrlp': '↫', 'larrpl': '⤹', 'larrsim': '⥳', 'larrtl': '↢', 'latail': '⤙', 'lAtail': '⤛', 'lat': '⪫', 'late': '⪭', 'lates': '⪭︀', 'lbarr': '⤌', 'lBarr': '⤎', 'lbbrk': '❲', 'lbrace': '{', 'lbrack': '[', 'lbrke': '⦋', 'lbrksld': '⦏', 'lbrkslu': '⦍', 'Lcaron': 'Ľ', 'lcaron': 'ľ', 'Lcedil': 'Ļ', 'lcedil': 'ļ', 'lceil': '⌈', 'lcub': '{', 'Lcy': 'Л', 'lcy': 'л', 'ldca': '⤶', 'ldquo': '“', 'ldquor': '„', 'ldrdhar': '⥧', 'ldrushar': '⥋', 'ldsh': '↲', 'le': '≤', 'lE': '≦', 'LeftAngleBracket': '⟨', 'LeftArrowBar': '⇤', 'leftarrow': '←', 'LeftArrow': '←', 'Leftarrow': '⇐', 'LeftArrowRightArrow': '⇆', 'leftarrowtail': '↢', 'LeftCeiling': '⌈', 'LeftDoubleBracket': '⟦', 'LeftDownTeeVector': '⥡', 'LeftDownVectorBar': '⥙', 'LeftDownVector': '⇃', 'LeftFloor': '⌊', 'leftharpoondown': '↽', 'leftharpoonup': '↼', 'leftleftarrows': '⇇', 'leftrightarrow': '↔', 'LeftRightArrow': '↔', 'Leftrightarrow': '⇔', 'leftrightarrows': '⇆', 'leftrightharpoons': '⇋', 'leftrightsquigarrow': '↭', 'LeftRightVector': '⥎', 'LeftTeeArrow': '↤', 'LeftTee': '⊣', 'LeftTeeVector': '⥚', 'leftthreetimes': '⋋', 'LeftTriangleBar': '⧏', 'LeftTriangle': '⊲', 'LeftTriangleEqual': '⊴', 'LeftUpDownVector': '⥑', 'LeftUpTeeVector': '⥠', 'LeftUpVectorBar': '⥘', 'LeftUpVector': '↿', 'LeftVectorBar': '⥒', 'LeftVector': '↼', 'lEg': '⪋', 'leg': '⋚', 'leq': '≤', 'leqq': '≦', 'leqslant': '⩽', 'lescc': '⪨', 'les': '⩽', 'lesdot': '⩿', 'lesdoto': '⪁', 'lesdotor': '⪃', 'lesg': '⋚︀', 'lesges': '⪓', 'lessapprox': '⪅', 'lessdot': '⋖', 'lesseqgtr': '⋚', 'lesseqqgtr': '⪋', 'LessEqualGreater': '⋚', 'LessFullEqual': '≦', 'LessGreater': '≶', 'lessgtr': '≶', 'LessLess': '⪡', 'lesssim': '≲', 'LessSlantEqual': '⩽', 'LessTilde': '≲', 'lfisht': '⥼', 'lfloor': '⌊', 'Lfr': '𝔏', 'lfr': '𝔩', 'lg': '≶', 'lgE': '⪑', 'lHar': '⥢', 'lhard': '↽', 'lharu': '↼', 'lharul': '⥪', 'lhblk': '▄', 'LJcy': 'Љ', 'ljcy': 'љ', 'llarr': '⇇', 'll': '≪', 'Ll': '⋘', 'llcorner': '⌞', 'Lleftarrow': '⇚', 'llhard': '⥫', 'lltri': '◺', 'Lmidot': 'Ŀ', 'lmidot': 'ŀ', 'lmoustache': '⎰', 'lmoust': '⎰', 'lnap': '⪉', 'lnapprox': '⪉', 'lne': '⪇', 'lnE': '≨', 'lneq': '⪇', 'lneqq': '≨', 'lnsim': '⋦', 'loang': '⟬', 'loarr': '⇽', 'lobrk': '⟦', 'longleftarrow': '⟵', 'LongLeftArrow': '⟵', 'Longleftarrow': '⟸', 'longleftrightarrow': '⟷', 'LongLeftRightArrow': '⟷', 'Longleftrightarrow': '⟺', 'longmapsto': '⟼', 'longrightarrow': '⟶', 'LongRightArrow': '⟶', 'Longrightarrow': '⟹', 'looparrowleft': '↫', 'looparrowright': '↬', 'lopar': '⦅', 'Lopf': '𝕃', 'lopf': '𝕝', 'loplus': '⨭', 'lotimes': '⨴', 'lowast': '∗', 'lowbar': '_', 'LowerLeftArrow': '↙', 'LowerRightArrow': '↘', 'loz': '◊', 'lozenge': '◊', 'lozf': '⧫', 'lpar': '(', 'lparlt': '⦓', 'lrarr': '⇆', 'lrcorner': '⌟', 'lrhar': '⇋', 'lrhard': '⥭', 'lrm': '‎', 'lrtri': '⊿', 'lsaquo': '‹', 'lscr': '𝓁', 'Lscr': 'ℒ', 'lsh': '↰', 'Lsh': '↰', 'lsim': '≲', 'lsime': '⪍', 'lsimg': '⪏', 'lsqb': '[', 'lsquo': '‘', 'lsquor': '‚', 'Lstrok': 'Ł', 'lstrok': 'ł', 'ltcc': '⪦', 'ltcir': '⩹', 'lt': '<', 'LT': '<', 'Lt': '≪', 'ltdot': '⋖', 'lthree': '⋋', 'ltimes': '⋉', 'ltlarr': '⥶', 'ltquest': '⩻', 'ltri': '◃', 'ltrie': '⊴', 'ltrif': '◂', 'ltrPar': '⦖', 'lurdshar': '⥊', 'luruhar': '⥦', 'lvertneqq': '≨︀', 'lvnE': '≨︀', 'macr': '\xAF', 'male': '♂', 'malt': '✠', 'maltese': '✠', 'Map': '⤅', 'map': '↦', 'mapsto': '↦', 'mapstodown': '↧', 'mapstoleft': '↤', 'mapstoup': '↥', 'marker': '▮', 'mcomma': '⨩', 'Mcy': 'М', 'mcy': 'м', 'mdash': '—', 'mDDot': '∺', 'measuredangle': '∡', 'MediumSpace': ' ', 'Mellintrf': 'ℳ', 'Mfr': '𝔐', 'mfr': '𝔪', 'mho': '℧', 'micro': '\xB5', 'midast': '*', 'midcir': '⫰', 'mid': '∣', 'middot': '\xB7', 'minusb': '⊟', 'minus': '−', 'minusd': '∸', 'minusdu': '⨪', 'MinusPlus': '∓', 'mlcp': '⫛', 'mldr': '…', 'mnplus': '∓', 'models': '⊧', 'Mopf': '𝕄', 'mopf': '𝕞', 'mp': '∓', 'mscr': '𝓂', 'Mscr': 'ℳ', 'mstpos': '∾', 'Mu': 'Μ', 'mu': 'μ', 'multimap': '⊸', 'mumap': '⊸', 'nabla': '∇', 'Nacute': 'Ń', 'nacute': 'ń', 'nang': '∠⃒', 'nap': '≉', 'napE': '⩰̸', 'napid': '≋̸', 'napos': 'ŉ', 'napprox': '≉', 'natural': '♮', 'naturals': 'ℕ', 'natur': '♮', 'nbsp': '\xA0', 'nbump': '≎̸', 'nbumpe': '≏̸', 'ncap': '⩃', 'Ncaron': 'Ň', 'ncaron': 'ň', 'Ncedil': 'Ņ', 'ncedil': 'ņ', 'ncong': '≇', 'ncongdot': '⩭̸', 'ncup': '⩂', 'Ncy': 'Н', 'ncy': 'н', 'ndash': '–', 'nearhk': '⤤', 'nearr': '↗', 'neArr': '⇗', 'nearrow': '↗', 'ne': '≠', 'nedot': '≐̸', 'NegativeMediumSpace': '​', 'NegativeThickSpace': '​', 'NegativeThinSpace': '​', 'NegativeVeryThinSpace': '​', 'nequiv': '≢', 'nesear': '⤨', 'nesim': '≂̸', 'NestedGreaterGreater': '≫', 'NestedLessLess': '≪', 'NewLine': '\n', 'nexist': '∄', 'nexists': '∄', 'Nfr': '𝔑', 'nfr': '𝔫', 'ngE': '≧̸', 'nge': '≱', 'ngeq': '≱', 'ngeqq': '≧̸', 'ngeqslant': '⩾̸', 'nges': '⩾̸', 'nGg': '⋙̸', 'ngsim': '≵', 'nGt': '≫⃒', 'ngt': '≯', 'ngtr': '≯', 'nGtv': '≫̸', 'nharr': '↮', 'nhArr': '⇎', 'nhpar': '⫲', 'ni': '∋', 'nis': '⋼', 'nisd': '⋺', 'niv': '∋', 'NJcy': 'Њ', 'njcy': 'њ', 'nlarr': '↚', 'nlArr': '⇍', 'nldr': '‥', 'nlE': '≦̸', 'nle': '≰', 'nleftarrow': '↚', 'nLeftarrow': '⇍', 'nleftrightarrow': '↮', 'nLeftrightarrow': '⇎', 'nleq': '≰', 'nleqq': '≦̸', 'nleqslant': '⩽̸', 'nles': '⩽̸', 'nless': '≮', 'nLl': '⋘̸', 'nlsim': '≴', 'nLt': '≪⃒', 'nlt': '≮', 'nltri': '⋪', 'nltrie': '⋬', 'nLtv': '≪̸', 'nmid': '∤', 'NoBreak': '⁠', 'NonBreakingSpace': '\xA0', 'nopf': '𝕟', 'Nopf': 'ℕ', 'Not': '⫬', 'not': '\xAC', 'NotCongruent': '≢', 'NotCupCap': '≭', 'NotDoubleVerticalBar': '∦', 'NotElement': '∉', 'NotEqual': '≠', 'NotEqualTilde': '≂̸', 'NotExists': '∄', 'NotGreater': '≯', 'NotGreaterEqual': '≱', 'NotGreaterFullEqual': '≧̸', 'NotGreaterGreater': '≫̸', 'NotGreaterLess': '≹', 'NotGreaterSlantEqual': '⩾̸', 'NotGreaterTilde': '≵', 'NotHumpDownHump': '≎̸', 'NotHumpEqual': '≏̸', 'notin': '∉', 'notindot': '⋵̸', 'notinE': '⋹̸', 'notinva': '∉', 'notinvb': '⋷', 'notinvc': '⋶', 'NotLeftTriangleBar': '⧏̸', 'NotLeftTriangle': '⋪', 'NotLeftTriangleEqual': '⋬', 'NotLess': '≮', 'NotLessEqual': '≰', 'NotLessGreater': '≸', 'NotLessLess': '≪̸', 'NotLessSlantEqual': '⩽̸', 'NotLessTilde': '≴', 'NotNestedGreaterGreater': '⪢̸', 'NotNestedLessLess': '⪡̸', 'notni': '∌', 'notniva': '∌', 'notnivb': '⋾', 'notnivc': '⋽', 'NotPrecedes': '⊀', 'NotPrecedesEqual': '⪯̸', 'NotPrecedesSlantEqual': '⋠', 'NotReverseElement': '∌', 'NotRightTriangleBar': '⧐̸', 'NotRightTriangle': '⋫', 'NotRightTriangleEqual': '⋭', 'NotSquareSubset': '⊏̸', 'NotSquareSubsetEqual': '⋢', 'NotSquareSuperset': '⊐̸', 'NotSquareSupersetEqual': '⋣', 'NotSubset': '⊂⃒', 'NotSubsetEqual': '⊈', 'NotSucceeds': '⊁', 'NotSucceedsEqual': '⪰̸', 'NotSucceedsSlantEqual': '⋡', 'NotSucceedsTilde': '≿̸', 'NotSuperset': '⊃⃒', 'NotSupersetEqual': '⊉', 'NotTilde': '≁', 'NotTildeEqual': '≄', 'NotTildeFullEqual': '≇', 'NotTildeTilde': '≉', 'NotVerticalBar': '∤', 'nparallel': '∦', 'npar': '∦', 'nparsl': '⫽⃥', 'npart': '∂̸', 'npolint': '⨔', 'npr': '⊀', 'nprcue': '⋠', 'nprec': '⊀', 'npreceq': '⪯̸', 'npre': '⪯̸', 'nrarrc': '⤳̸', 'nrarr': '↛', 'nrArr': '⇏', 'nrarrw': '↝̸', 'nrightarrow': '↛', 'nRightarrow': '⇏', 'nrtri': '⋫', 'nrtrie': '⋭', 'nsc': '⊁', 'nsccue': '⋡', 'nsce': '⪰̸', 'Nscr': '𝒩', 'nscr': '𝓃', 'nshortmid': '∤', 'nshortparallel': '∦', 'nsim': '≁', 'nsime': '≄', 'nsimeq': '≄', 'nsmid': '∤', 'nspar': '∦', 'nsqsube': '⋢', 'nsqsupe': '⋣', 'nsub': '⊄', 'nsubE': '⫅̸', 'nsube': '⊈', 'nsubset': '⊂⃒', 'nsubseteq': '⊈', 'nsubseteqq': '⫅̸', 'nsucc': '⊁', 'nsucceq': '⪰̸', 'nsup': '⊅', 'nsupE': '⫆̸', 'nsupe': '⊉', 'nsupset': '⊃⃒', 'nsupseteq': '⊉', 'nsupseteqq': '⫆̸', 'ntgl': '≹', 'Ntilde': '\xD1', 'ntilde': '\xF1', 'ntlg': '≸', 'ntriangleleft': '⋪', 'ntrianglelefteq': '⋬', 'ntriangleright': '⋫', 'ntrianglerighteq': '⋭', 'Nu': 'Ν', 'nu': 'ν', 'num': '#', 'numero': '№', 'numsp': ' ', 'nvap': '≍⃒', 'nvdash': '⊬', 'nvDash': '⊭', 'nVdash': '⊮', 'nVDash': '⊯', 'nvge': '≥⃒', 'nvgt': '>⃒', 'nvHarr': '⤄', 'nvinfin': '⧞', 'nvlArr': '⤂', 'nvle': '≤⃒', 'nvlt': '<⃒', 'nvltrie': '⊴⃒', 'nvrArr': '⤃', 'nvrtrie': '⊵⃒', 'nvsim': '∼⃒', 'nwarhk': '⤣', 'nwarr': '↖', 'nwArr': '⇖', 'nwarrow': '↖', 'nwnear': '⤧', 'Oacute': '\xD3', 'oacute': '\xF3', 'oast': '⊛', 'Ocirc': '\xD4', 'ocirc': '\xF4', 'ocir': '⊚', 'Ocy': 'О', 'ocy': 'о', 'odash': '⊝', 'Odblac': 'Ő', 'odblac': 'ő', 'odiv': '⨸', 'odot': '⊙', 'odsold': '⦼', 'OElig': 'Œ', 'oelig': 'œ', 'ofcir': '⦿', 'Ofr': '𝔒', 'ofr': '𝔬', 'ogon': '˛', 'Ograve': '\xD2', 'ograve': '\xF2', 'ogt': '⧁', 'ohbar': '⦵', 'ohm': 'Ω', 'oint': '∮', 'olarr': '↺', 'olcir': '⦾', 'olcross': '⦻', 'oline': '‾', 'olt': '⧀', 'Omacr': 'Ō', 'omacr': 'ō', 'Omega': 'Ω', 'omega': 'ω', 'Omicron': 'Ο', 'omicron': 'ο', 'omid': '⦶', 'ominus': '⊖', 'Oopf': '𝕆', 'oopf': '𝕠', 'opar': '⦷', 'OpenCurlyDoubleQuote': '“', 'OpenCurlyQuote': '‘', 'operp': '⦹', 'oplus': '⊕', 'orarr': '↻', 'Or': '⩔', 'or': '∨', 'ord': '⩝', 'order': 'ℴ', 'orderof': 'ℴ', 'ordf': '\xAA', 'ordm': '\xBA', 'origof': '⊶', 'oror': '⩖', 'orslope': '⩗', 'orv': '⩛', 'oS': 'Ⓢ', 'Oscr': '𝒪', 'oscr': 'ℴ', 'Oslash': '\xD8', 'oslash': '\xF8', 'osol': '⊘', 'Otilde': '\xD5', 'otilde': '\xF5', 'otimesas': '⨶', 'Otimes': '⨷', 'otimes': '⊗', 'Ouml': '\xD6', 'ouml': '\xF6', 'ovbar': '⌽', 'OverBar': '‾', 'OverBrace': '⏞', 'OverBracket': '⎴', 'OverParenthesis': '⏜', 'para': '\xB6', 'parallel': '∥', 'par': '∥', 'parsim': '⫳', 'parsl': '⫽', 'part': '∂', 'PartialD': '∂', 'Pcy': 'П', 'pcy': 'п', 'percnt': '%', 'period': '.', 'permil': '‰', 'perp': '⊥', 'pertenk': '‱', 'Pfr': '𝔓', 'pfr': '𝔭', 'Phi': 'Φ', 'phi': 'φ', 'phiv': 'ϕ', 'phmmat': 'ℳ', 'phone': '☎', 'Pi': 'Π', 'pi': 'π', 'pitchfork': '⋔', 'piv': 'ϖ', 'planck': 'ℏ', 'planckh': 'ℎ', 'plankv': 'ℏ', 'plusacir': '⨣', 'plusb': '⊞', 'pluscir': '⨢', 'plus': '+', 'plusdo': '∔', 'plusdu': '⨥', 'pluse': '⩲', 'PlusMinus': '\xB1', 'plusmn': '\xB1', 'plussim': '⨦', 'plustwo': '⨧', 'pm': '\xB1', 'Poincareplane': 'ℌ', 'pointint': '⨕', 'popf': '𝕡', 'Popf': 'ℙ', 'pound': '\xA3', 'prap': '⪷', 'Pr': '⪻', 'pr': '≺', 'prcue': '≼', 'precapprox': '⪷', 'prec': '≺', 'preccurlyeq': '≼', 'Precedes': '≺', 'PrecedesEqual': '⪯', 'PrecedesSlantEqual': '≼', 'PrecedesTilde': '≾', 'preceq': '⪯', 'precnapprox': '⪹', 'precneqq': '⪵', 'precnsim': '⋨', 'pre': '⪯', 'prE': '⪳', 'precsim': '≾', 'prime': '′', 'Prime': '″', 'primes': 'ℙ', 'prnap': '⪹', 'prnE': '⪵', 'prnsim': '⋨', 'prod': '∏', 'Product': '∏', 'profalar': '⌮', 'profline': '⌒', 'profsurf': '⌓', 'prop': '∝', 'Proportional': '∝', 'Proportion': '∷', 'propto': '∝', 'prsim': '≾', 'prurel': '⊰', 'Pscr': '𝒫', 'pscr': '𝓅', 'Psi': 'Ψ', 'psi': 'ψ', 'puncsp': ' ', 'Qfr': '𝔔', 'qfr': '𝔮', 'qint': '⨌', 'qopf': '𝕢', 'Qopf': 'ℚ', 'qprime': '⁗', 'Qscr': '𝒬', 'qscr': '𝓆', 'quaternions': 'ℍ', 'quatint': '⨖', 'quest': '?', 'questeq': '≟', 'quot': '"', 'QUOT': '"', 'rAarr': '⇛', 'race': '∽̱', 'Racute': 'Ŕ', 'racute': 'ŕ', 'radic': '√', 'raemptyv': '⦳', 'rang': '⟩', 'Rang': '⟫', 'rangd': '⦒', 'range': '⦥', 'rangle': '⟩', 'raquo': '\xBB', 'rarrap': '⥵', 'rarrb': '⇥', 'rarrbfs': '⤠', 'rarrc': '⤳', 'rarr': '→', 'Rarr': '↠', 'rArr': '⇒', 'rarrfs': '⤞', 'rarrhk': '↪', 'rarrlp': '↬', 'rarrpl': '⥅', 'rarrsim': '⥴', 'Rarrtl': '⤖', 'rarrtl': '↣', 'rarrw': '↝', 'ratail': '⤚', 'rAtail': '⤜', 'ratio': '∶', 'rationals': 'ℚ', 'rbarr': '⤍', 'rBarr': '⤏', 'RBarr': '⤐', 'rbbrk': '❳', 'rbrace': '}', 'rbrack': ']', 'rbrke': '⦌', 'rbrksld': '⦎', 'rbrkslu': '⦐', 'Rcaron': 'Ř', 'rcaron': 'ř', 'Rcedil': 'Ŗ', 'rcedil': 'ŗ', 'rceil': '⌉', 'rcub': '}', 'Rcy': 'Р', 'rcy': 'р', 'rdca': '⤷', 'rdldhar': '⥩', 'rdquo': '”', 'rdquor': '”', 'rdsh': '↳', 'real': 'ℜ', 'realine': 'ℛ', 'realpart': 'ℜ', 'reals': 'ℝ', 'Re': 'ℜ', 'rect': '▭', 'reg': '\xAE', 'REG': '\xAE', 'ReverseElement': '∋', 'ReverseEquilibrium': '⇋', 'ReverseUpEquilibrium': '⥯', 'rfisht': '⥽', 'rfloor': '⌋', 'rfr': '𝔯', 'Rfr': 'ℜ', 'rHar': '⥤', 'rhard': '⇁', 'rharu': '⇀', 'rharul': '⥬', 'Rho': 'Ρ', 'rho': 'ρ', 'rhov': 'ϱ', 'RightAngleBracket': '⟩', 'RightArrowBar': '⇥', 'rightarrow': '→', 'RightArrow': '→', 'Rightarrow': '⇒', 'RightArrowLeftArrow': '⇄', 'rightarrowtail': '↣', 'RightCeiling': '⌉', 'RightDoubleBracket': '⟧', 'RightDownTeeVector': '⥝', 'RightDownVectorBar': '⥕', 'RightDownVector': '⇂', 'RightFloor': '⌋', 'rightharpoondown': '⇁', 'rightharpoonup': '⇀', 'rightleftarrows': '⇄', 'rightleftharpoons': '⇌', 'rightrightarrows': '⇉', 'rightsquigarrow': '↝', 'RightTeeArrow': '↦', 'RightTee': '⊢', 'RightTeeVector': '⥛', 'rightthreetimes': '⋌', 'RightTriangleBar': '⧐', 'RightTriangle': '⊳', 'RightTriangleEqual': '⊵', 'RightUpDownVector': '⥏', 'RightUpTeeVector': '⥜', 'RightUpVectorBar': '⥔', 'RightUpVector': '↾', 'RightVectorBar': '⥓', 'RightVector': '⇀', 'ring': '˚', 'risingdotseq': '≓', 'rlarr': '⇄', 'rlhar': '⇌', 'rlm': '‏', 'rmoustache': '⎱', 'rmoust': '⎱', 'rnmid': '⫮', 'roang': '⟭', 'roarr': '⇾', 'robrk': '⟧', 'ropar': '⦆', 'ropf': '𝕣', 'Ropf': 'ℝ', 'roplus': '⨮', 'rotimes': '⨵', 'RoundImplies': '⥰', 'rpar': ')', 'rpargt': '⦔', 'rppolint': '⨒', 'rrarr': '⇉', 'Rrightarrow': '⇛', 'rsaquo': '›', 'rscr': '𝓇', 'Rscr': 'ℛ', 'rsh': '↱', 'Rsh': '↱', 'rsqb': ']', 'rsquo': '’', 'rsquor': '’', 'rthree': '⋌', 'rtimes': '⋊', 'rtri': '▹', 'rtrie': '⊵', 'rtrif': '▸', 'rtriltri': '⧎', 'RuleDelayed': '⧴', 'ruluhar': '⥨', 'rx': '℞', 'Sacute': 'Ś', 'sacute': 'ś', 'sbquo': '‚', 'scap': '⪸', 'Scaron': 'Š', 'scaron': 'š', 'Sc': '⪼', 'sc': '≻', 'sccue': '≽', 'sce': '⪰', 'scE': '⪴', 'Scedil': 'Ş', 'scedil': 'ş', 'Scirc': 'Ŝ', 'scirc': 'ŝ', 'scnap': '⪺', 'scnE': '⪶', 'scnsim': '⋩', 'scpolint': '⨓', 'scsim': '≿', 'Scy': 'С', 'scy': 'с', 'sdotb': '⊡', 'sdot': '⋅', 'sdote': '⩦', 'searhk': '⤥', 'searr': '↘', 'seArr': '⇘', 'searrow': '↘', 'sect': '\xA7', 'semi': ';', 'seswar': '⤩', 'setminus': '∖', 'setmn': '∖', 'sext': '✶', 'Sfr': '𝔖', 'sfr': '𝔰', 'sfrown': '⌢', 'sharp': '♯', 'SHCHcy': 'Щ', 'shchcy': 'щ', 'SHcy': 'Ш', 'shcy': 'ш', 'ShortDownArrow': '↓', 'ShortLeftArrow': '←', 'shortmid': '∣', 'shortparallel': '∥', 'ShortRightArrow': '→', 'ShortUpArrow': '↑', 'shy': '\xAD', 'Sigma': 'Σ', 'sigma': 'σ', 'sigmaf': 'ς', 'sigmav': 'ς', 'sim': '∼', 'simdot': '⩪', 'sime': '≃', 'simeq': '≃', 'simg': '⪞', 'simgE': '⪠', 'siml': '⪝', 'simlE': '⪟', 'simne': '≆', 'simplus': '⨤', 'simrarr': '⥲', 'slarr': '←', 'SmallCircle': '∘', 'smallsetminus': '∖', 'smashp': '⨳', 'smeparsl': '⧤', 'smid': '∣', 'smile': '⌣', 'smt': '⪪', 'smte': '⪬', 'smtes': '⪬︀', 'SOFTcy': 'Ь', 'softcy': 'ь', 'solbar': '⌿', 'solb': '⧄', 'sol': '/', 'Sopf': '𝕊', 'sopf': '𝕤', 'spades': '♠', 'spadesuit': '♠', 'spar': '∥', 'sqcap': '⊓', 'sqcaps': '⊓︀', 'sqcup': '⊔', 'sqcups': '⊔︀', 'Sqrt': '√', 'sqsub': '⊏', 'sqsube': '⊑', 'sqsubset': '⊏', 'sqsubseteq': '⊑', 'sqsup': '⊐', 'sqsupe': '⊒', 'sqsupset': '⊐', 'sqsupseteq': '⊒', 'square': '□', 'Square': '□', 'SquareIntersection': '⊓', 'SquareSubset': '⊏', 'SquareSubsetEqual': '⊑', 'SquareSuperset': '⊐', 'SquareSupersetEqual': '⊒', 'SquareUnion': '⊔', 'squarf': '▪', 'squ': '□', 'squf': '▪', 'srarr': '→', 'Sscr': '𝒮', 'sscr': '𝓈', 'ssetmn': '∖', 'ssmile': '⌣', 'sstarf': '⋆', 'Star': '⋆', 'star': '☆', 'starf': '★', 'straightepsilon': 'ϵ', 'straightphi': 'ϕ', 'strns': '\xAF', 'sub': '⊂', 'Sub': '⋐', 'subdot': '⪽', 'subE': '⫅', 'sube': '⊆', 'subedot': '⫃', 'submult': '⫁', 'subnE': '⫋', 'subne': '⊊', 'subplus': '⪿', 'subrarr': '⥹', 'subset': '⊂', 'Subset': '⋐', 'subseteq': '⊆', 'subseteqq': '⫅', 'SubsetEqual': '⊆', 'subsetneq': '⊊', 'subsetneqq': '⫋', 'subsim': '⫇', 'subsub': '⫕', 'subsup': '⫓', 'succapprox': '⪸', 'succ': '≻', 'succcurlyeq': '≽', 'Succeeds': '≻', 'SucceedsEqual': '⪰', 'SucceedsSlantEqual': '≽', 'SucceedsTilde': '≿', 'succeq': '⪰', 'succnapprox': '⪺', 'succneqq': '⪶', 'succnsim': '⋩', 'succsim': '≿', 'SuchThat': '∋', 'sum': '∑', 'Sum': '∑', 'sung': '♪', 'sup1': '\xB9', 'sup2': '\xB2', 'sup3': '\xB3', 'sup': '⊃', 'Sup': '⋑', 'supdot': '⪾', 'supdsub': '⫘', 'supE': '⫆', 'supe': '⊇', 'supedot': '⫄', 'Superset': '⊃', 'SupersetEqual': '⊇', 'suphsol': '⟉', 'suphsub': '⫗', 'suplarr': '⥻', 'supmult': '⫂', 'supnE': '⫌', 'supne': '⊋', 'supplus': '⫀', 'supset': '⊃', 'Supset': '⋑', 'supseteq': '⊇', 'supseteqq': '⫆', 'supsetneq': '⊋', 'supsetneqq': '⫌', 'supsim': '⫈', 'supsub': '⫔', 'supsup': '⫖', 'swarhk': '⤦', 'swarr': '↙', 'swArr': '⇙', 'swarrow': '↙', 'swnwar': '⤪', 'szlig': '\xDF', 'Tab': '\t', 'target': '⌖', 'Tau': 'Τ', 'tau': 'τ', 'tbrk': '⎴', 'Tcaron': 'Ť', 'tcaron': 'ť', 'Tcedil': 'Ţ', 'tcedil': 'ţ', 'Tcy': 'Т', 'tcy': 'т', 'tdot': '⃛', 'telrec': '⌕', 'Tfr': '𝔗', 'tfr': '𝔱', 'there4': '∴', 'therefore': '∴', 'Therefore': '∴', 'Theta': 'Θ', 'theta': 'θ', 'thetasym': 'ϑ', 'thetav': 'ϑ', 'thickapprox': '≈', 'thicksim': '∼', 'ThickSpace': '  ', 'ThinSpace': ' ', 'thinsp': ' ', 'thkap': '≈', 'thksim': '∼', 'THORN': '\xDE', 'thorn': '\xFE', 'tilde': '˜', 'Tilde': '∼', 'TildeEqual': '≃', 'TildeFullEqual': '≅', 'TildeTilde': '≈', 'timesbar': '⨱', 'timesb': '⊠', 'times': '\xD7', 'timesd': '⨰', 'tint': '∭', 'toea': '⤨', 'topbot': '⌶', 'topcir': '⫱', 'top': '⊤', 'Topf': '𝕋', 'topf': '𝕥', 'topfork': '⫚', 'tosa': '⤩', 'tprime': '‴', 'trade': '™', 'TRADE': '™', 'triangle': '▵', 'triangledown': '▿', 'triangleleft': '◃', 'trianglelefteq': '⊴', 'triangleq': '≜', 'triangleright': '▹', 'trianglerighteq': '⊵', 'tridot': '◬', 'trie': '≜', 'triminus': '⨺', 'TripleDot': '⃛', 'triplus': '⨹', 'trisb': '⧍', 'tritime': '⨻', 'trpezium': '⏢', 'Tscr': '𝒯', 'tscr': '𝓉', 'TScy': 'Ц', 'tscy': 'ц', 'TSHcy': 'Ћ', 'tshcy': 'ћ', 'Tstrok': 'Ŧ', 'tstrok': 'ŧ', 'twixt': '≬', 'twoheadleftarrow': '↞', 'twoheadrightarrow': '↠', 'Uacute': '\xDA', 'uacute': '\xFA', 'uarr': '↑', 'Uarr': '↟', 'uArr': '⇑', 'Uarrocir': '⥉', 'Ubrcy': 'Ў', 'ubrcy': 'ў', 'Ubreve': 'Ŭ', 'ubreve': 'ŭ', 'Ucirc': '\xDB', 'ucirc': '\xFB', 'Ucy': 'У', 'ucy': 'у', 'udarr': '⇅', 'Udblac': 'Ű', 'udblac': 'ű', 'udhar': '⥮', 'ufisht': '⥾', 'Ufr': '𝔘', 'ufr': '𝔲', 'Ugrave': '\xD9', 'ugrave': '\xF9', 'uHar': '⥣', 'uharl': '↿', 'uharr': '↾', 'uhblk': '▀', 'ulcorn': '⌜', 'ulcorner': '⌜', 'ulcrop': '⌏', 'ultri': '◸', 'Umacr': 'Ū', 'umacr': 'ū', 'uml': '\xA8', 'UnderBar': '_', 'UnderBrace': '⏟', 'UnderBracket': '⎵', 'UnderParenthesis': '⏝', 'Union': '⋃', 'UnionPlus': '⊎', 'Uogon': 'Ų', 'uogon': 'ų', 'Uopf': '𝕌', 'uopf': '𝕦', 'UpArrowBar': '⤒', 'uparrow': '↑', 'UpArrow': '↑', 'Uparrow': '⇑', 'UpArrowDownArrow': '⇅', 'updownarrow': '↕', 'UpDownArrow': '↕', 'Updownarrow': '⇕', 'UpEquilibrium': '⥮', 'upharpoonleft': '↿', 'upharpoonright': '↾', 'uplus': '⊎', 'UpperLeftArrow': '↖', 'UpperRightArrow': '↗', 'upsi': 'υ', 'Upsi': 'ϒ', 'upsih': 'ϒ', 'Upsilon': 'Υ', 'upsilon': 'υ', 'UpTeeArrow': '↥', 'UpTee': '⊥', 'upuparrows': '⇈', 'urcorn': '⌝', 'urcorner': '⌝', 'urcrop': '⌎', 'Uring': 'Ů', 'uring': 'ů', 'urtri': '◹', 'Uscr': '𝒰', 'uscr': '𝓊', 'utdot': '⋰', 'Utilde': 'Ũ', 'utilde': 'ũ', 'utri': '▵', 'utrif': '▴', 'uuarr': '⇈', 'Uuml': '\xDC', 'uuml': '\xFC', 'uwangle': '⦧', 'vangrt': '⦜', 'varepsilon': 'ϵ', 'varkappa': 'ϰ', 'varnothing': '∅', 'varphi': 'ϕ', 'varpi': 'ϖ', 'varpropto': '∝', 'varr': '↕', 'vArr': '⇕', 'varrho': 'ϱ', 'varsigma': 'ς', 'varsubsetneq': '⊊︀', 'varsubsetneqq': '⫋︀', 'varsupsetneq': '⊋︀', 'varsupsetneqq': '⫌︀', 'vartheta': 'ϑ', 'vartriangleleft': '⊲', 'vartriangleright': '⊳', 'vBar': '⫨', 'Vbar': '⫫', 'vBarv': '⫩', 'Vcy': 'В', 'vcy': 'в', 'vdash': '⊢', 'vDash': '⊨', 'Vdash': '⊩', 'VDash': '⊫', 'Vdashl': '⫦', 'veebar': '⊻', 'vee': '∨', 'Vee': '⋁', 'veeeq': '≚', 'vellip': '⋮', 'verbar': '|', 'Verbar': '‖', 'vert': '|', 'Vert': '‖', 'VerticalBar': '∣', 'VerticalLine': '|', 'VerticalSeparator': '❘', 'VerticalTilde': '≀', 'VeryThinSpace': ' ', 'Vfr': '𝔙', 'vfr': '𝔳', 'vltri': '⊲', 'vnsub': '⊂⃒', 'vnsup': '⊃⃒', 'Vopf': '𝕍', 'vopf': '𝕧', 'vprop': '∝', 'vrtri': '⊳', 'Vscr': '𝒱', 'vscr': '𝓋', 'vsubnE': '⫋︀', 'vsubne': '⊊︀', 'vsupnE': '⫌︀', 'vsupne': '⊋︀', 'Vvdash': '⊪', 'vzigzag': '⦚', 'Wcirc': 'Ŵ', 'wcirc': 'ŵ', 'wedbar': '⩟', 'wedge': '∧', 'Wedge': '⋀', 'wedgeq': '≙', 'weierp': '℘', 'Wfr': '𝔚', 'wfr': '𝔴', 'Wopf': '𝕎', 'wopf': '𝕨', 'wp': '℘', 'wr': '≀', 'wreath': '≀', 'Wscr': '𝒲', 'wscr': '𝓌', 'xcap': '⋂', 'xcirc': '◯', 'xcup': '⋃', 'xdtri': '▽', 'Xfr': '𝔛', 'xfr': '𝔵', 'xharr': '⟷', 'xhArr': '⟺', 'Xi': 'Ξ', 'xi': 'ξ', 'xlarr': '⟵', 'xlArr': '⟸', 'xmap': '⟼', 'xnis': '⋻', 'xodot': '⨀', 'Xopf': '𝕏', 'xopf': '𝕩', 'xoplus': '⨁', 'xotime': '⨂', 'xrarr': '⟶', 'xrArr': '⟹', 'Xscr': '𝒳', 'xscr': '𝓍', 'xsqcup': '⨆', 'xuplus': '⨄', 'xutri': '△', 'xvee': '⋁', 'xwedge': '⋀', 'Yacute': '\xDD', 'yacute': '\xFD', 'YAcy': 'Я', 'yacy': 'я', 'Ycirc': 'Ŷ', 'ycirc': 'ŷ', 'Ycy': 'Ы', 'ycy': 'ы', 'yen': '\xA5', 'Yfr': '𝔜', 'yfr': '𝔶', 'YIcy': 'Ї', 'yicy': 'ї', 'Yopf': '𝕐', 'yopf': '𝕪', 'Yscr': '𝒴', 'yscr': '𝓎', 'YUcy': 'Ю', 'yucy': 'ю', 'yuml': '\xFF', 'Yuml': 'Ÿ', 'Zacute': 'Ź', 'zacute': 'ź', 'Zcaron': 'Ž', 'zcaron': 'ž', 'Zcy': 'З', 'zcy': 'з', 'Zdot': 'Ż', 'zdot': 'ż', 'zeetrf': 'ℨ', 'ZeroWidthSpace': '​', 'Zeta': 'Ζ', 'zeta': 'ζ', 'zfr': '𝔷', 'Zfr': 'ℨ', 'ZHcy': 'Ж', 'zhcy': 'ж', 'zigrarr': '⇝', 'zopf': '𝕫', 'Zopf': 'ℤ', 'Zscr': '𝒵', 'zscr': '𝓏', 'zwj': '‍', 'zwnj': '‌' };
	var decodeMapLegacy = { 'Aacute': '\xC1', 'aacute': '\xE1', 'Acirc': '\xC2', 'acirc': '\xE2', 'acute': '\xB4', 'AElig': '\xC6', 'aelig': '\xE6', 'Agrave': '\xC0', 'agrave': '\xE0', 'amp': '&', 'AMP': '&', 'Aring': '\xC5', 'aring': '\xE5', 'Atilde': '\xC3', 'atilde': '\xE3', 'Auml': '\xC4', 'auml': '\xE4', 'brvbar': '\xA6', 'Ccedil': '\xC7', 'ccedil': '\xE7', 'cedil': '\xB8', 'cent': '\xA2', 'copy': '\xA9', 'COPY': '\xA9', 'curren': '\xA4', 'deg': '\xB0', 'divide': '\xF7', 'Eacute': '\xC9', 'eacute': '\xE9', 'Ecirc': '\xCA', 'ecirc': '\xEA', 'Egrave': '\xC8', 'egrave': '\xE8', 'ETH': '\xD0', 'eth': '\xF0', 'Euml': '\xCB', 'euml': '\xEB', 'frac12': '\xBD', 'frac14': '\xBC', 'frac34': '\xBE', 'gt': '>', 'GT': '>', 'Iacute': '\xCD', 'iacute': '\xED', 'Icirc': '\xCE', 'icirc': '\xEE', 'iexcl': '\xA1', 'Igrave': '\xCC', 'igrave': '\xEC', 'iquest': '\xBF', 'Iuml': '\xCF', 'iuml': '\xEF', 'laquo': '\xAB', 'lt': '<', 'LT': '<', 'macr': '\xAF', 'micro': '\xB5', 'middot': '\xB7', 'nbsp': '\xA0', 'not': '\xAC', 'Ntilde': '\xD1', 'ntilde': '\xF1', 'Oacute': '\xD3', 'oacute': '\xF3', 'Ocirc': '\xD4', 'ocirc': '\xF4', 'Ograve': '\xD2', 'ograve': '\xF2', 'ordf': '\xAA', 'ordm': '\xBA', 'Oslash': '\xD8', 'oslash': '\xF8', 'Otilde': '\xD5', 'otilde': '\xF5', 'Ouml': '\xD6', 'ouml': '\xF6', 'para': '\xB6', 'plusmn': '\xB1', 'pound': '\xA3', 'quot': '"', 'QUOT': '"', 'raquo': '\xBB', 'reg': '\xAE', 'REG': '\xAE', 'sect': '\xA7', 'shy': '\xAD', 'sup1': '\xB9', 'sup2': '\xB2', 'sup3': '\xB3', 'szlig': '\xDF', 'THORN': '\xDE', 'thorn': '\xFE', 'times': '\xD7', 'Uacute': '\xDA', 'uacute': '\xFA', 'Ucirc': '\xDB', 'ucirc': '\xFB', 'Ugrave': '\xD9', 'ugrave': '\xF9', 'uml': '\xA8', 'Uuml': '\xDC', 'uuml': '\xFC', 'Yacute': '\xDD', 'yacute': '\xFD', 'yen': '\xA5', 'yuml': '\xFF' };
	var decodeMapNumeric = { '0': '�', '128': '€', '130': '‚', '131': 'ƒ', '132': '„', '133': '…', '134': '†', '135': '‡', '136': 'ˆ', '137': '‰', '138': 'Š', '139': '‹', '140': 'Œ', '142': 'Ž', '145': '‘', '146': '’', '147': '“', '148': '”', '149': '•', '150': '–', '151': '—', '152': '˜', '153': '™', '154': 'š', '155': '›', '156': 'œ', '158': 'ž', '159': 'Ÿ' };
	var invalidReferenceCodePoints = [1, 2, 3, 4, 5, 6, 7, 8, 11, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25, 26, 27, 28, 29, 30, 31, 127, 128, 129, 130, 131, 132, 133, 134, 135, 136, 137, 138, 139, 140, 141, 142, 143, 144, 145, 146, 147, 148, 149, 150, 151, 152, 153, 154, 155, 156, 157, 158, 159, 64976, 64977, 64978, 64979, 64980, 64981, 64982, 64983, 64984, 64985, 64986, 64987, 64988, 64989, 64990, 64991, 64992, 64993, 64994, 64995, 64996, 64997, 64998, 64999, 65000, 65001, 65002, 65003, 65004, 65005, 65006, 65007, 65534, 65535, 131070, 131071, 196606, 196607, 262142, 262143, 327678, 327679, 393214, 393215, 458750, 458751, 524286, 524287, 589822, 589823, 655358, 655359, 720894, 720895, 786430, 786431, 851966, 851967, 917502, 917503, 983038, 983039, 1048574, 1048575, 1114110, 1114111];

	/*--------------------------------------------------------------------------*/

	var stringFromCharCode = String.fromCharCode;

	var object = {};
	var hasOwnProperty = object.hasOwnProperty;
	var has = function has(object, propertyName) {
		return hasOwnProperty.call(object, propertyName);
	};

	var contains = function contains(array, value) {
		var index = -1;
		var length = array.length;
		while (++index < length) {
			if (array[index] == value) {
				return true;
			}
		}
		return false;
	};

	var merge = function merge(options, defaults) {
		if (!options) {
			return defaults;
		}
		var result = {};
		var key;
		for (key in defaults) {
			// A `hasOwnProperty` check is not needed here, since only recognized
			// option names are used anyway. Any others are ignored.
			result[key] = has(options, key) ? options[key] : defaults[key];
		}
		return result;
	};

	// Modified version of `ucs2encode`; see http://mths.be/punycode.
	var codePointToSymbol = function codePointToSymbol(codePoint, strict) {
		var output = '';
		if (codePoint >= 0xD800 && codePoint <= 0xDFFF || codePoint > 0x10FFFF) {
			// See issue #4:
			// “Otherwise, if the number is in the range 0xD800 to 0xDFFF or is
			// greater than 0x10FFFF, then this is a parse error. Return a U+FFFD
			// REPLACEMENT CHARACTER.”
			if (strict) {
				parseError('character reference outside the permissible Unicode range');
			}
			return '�';
		}
		if (has(decodeMapNumeric, codePoint)) {
			if (strict) {
				parseError('disallowed character reference');
			}
			return decodeMapNumeric[codePoint];
		}
		if (strict && contains(invalidReferenceCodePoints, codePoint)) {
			parseError('disallowed character reference');
		}
		if (codePoint > 0xFFFF) {
			codePoint -= 0x10000;
			output += stringFromCharCode(codePoint >>> 10 & 0x3FF | 0xD800);
			codePoint = 0xDC00 | codePoint & 0x3FF;
		}
		output += stringFromCharCode(codePoint);
		return output;
	};

	var hexEscape = function hexEscape(symbol) {
		return '&#x' + symbol.charCodeAt(0).toString(16).toUpperCase() + ';';
	};

	var parseError = function parseError(message) {
		throw Error('Parse error: ' + message);
	};

	/*--------------------------------------------------------------------------*/

	var encode = function encode(string, options) {
		options = merge(options, encode.options);
		var strict = options.strict;
		if (strict && regexInvalidRawCodePoint.test(string)) {
			parseError('forbidden code point');
		}
		var encodeEverything = options.encodeEverything;
		var useNamedReferences = options.useNamedReferences;
		var allowUnsafeSymbols = options.allowUnsafeSymbols;
		if (encodeEverything) {
			// Encode ASCII symbols.
			string = string.replace(regexAsciiWhitelist, function (symbol) {
				// Use named references if requested & possible.
				if (useNamedReferences && has(encodeMap, symbol)) {
					return '&' + encodeMap[symbol] + ';';
				}
				return hexEscape(symbol);
			});
			// Shorten a few escapes that represent two symbols, of which at least one
			// is within the ASCII range.
			if (useNamedReferences) {
				string = string.replace(/&gt;\u20D2/g, '&nvgt;').replace(/&lt;\u20D2/g, '&nvlt;').replace(/&#x66;&#x6A;/g, '&fjlig;');
			}
			// Encode non-ASCII symbols.
			if (useNamedReferences) {
				// Encode non-ASCII symbols that can be replaced with a named reference.
				string = string.replace(regexEncodeNonAscii, function (string) {
					// Note: there is no need to check `has(encodeMap, string)` here.
					return '&' + encodeMap[string] + ';';
				});
			}
			// Note: any remaining non-ASCII symbols are handled outside of the `if`.
		} else if (useNamedReferences) {
				// Apply named character references.
				// Encode `<>"'&` using named character references.
				if (!allowUnsafeSymbols) {
					string = string.replace(regexEscape, function (string) {
						return '&' + encodeMap[string] + ';'; // no need to check `has()` here
					});
				}
				// Shorten escapes that represent two symbols, of which at least one is
				// `<>"'&`.
				string = string.replace(/&gt;\u20D2/g, '&nvgt;').replace(/&lt;\u20D2/g, '&nvlt;');
				// Encode non-ASCII symbols that can be replaced with a named reference.
				string = string.replace(regexEncodeNonAscii, function (string) {
					// Note: there is no need to check `has(encodeMap, string)` here.
					return '&' + encodeMap[string] + ';';
				});
			} else if (!allowUnsafeSymbols) {
				// Encode `<>"'&` using hexadecimal escapes, now that they’re not handled
				// using named character references.
				string = string.replace(regexEscape, hexEscape);
			}
		return string
		// Encode astral symbols.
		.replace(regexAstralSymbols, function ($0) {
			// https://mathiasbynens.be/notes/javascript-encoding#surrogate-formulae
			var high = $0.charCodeAt(0);
			var low = $0.charCodeAt(1);
			var codePoint = (high - 0xD800) * 0x400 + low - 0xDC00 + 0x10000;
			return '&#x' + codePoint.toString(16).toUpperCase() + ';';
		})
		// Encode any remaining BMP symbols that are not printable ASCII symbols
		// using a hexadecimal escape.
		.replace(regexBmpWhitelist, hexEscape);
	};
	// Expose default options (so they can be overridden globally).
	encode.options = {
		'allowUnsafeSymbols': false,
		'encodeEverything': false,
		'strict': false,
		'useNamedReferences': false
	};

	var decode = function decode(html, options) {
		options = merge(options, decode.options);
		var strict = options.strict;
		if (strict && regexInvalidEntity.test(html)) {
			parseError('malformed character reference');
		}
		return html.replace(regexDecode, function ($0, $1, $2, $3, $4, $5, $6, $7) {
			var codePoint;
			var semicolon;
			var hexDigits;
			var reference;
			var next;
			if ($1) {
				// Decode decimal escapes, e.g. `&#119558;`.
				codePoint = $1;
				semicolon = $2;
				if (strict && !semicolon) {
					parseError('character reference was not terminated by a semicolon');
				}
				return codePointToSymbol(codePoint, strict);
			}
			if ($3) {
				// Decode hexadecimal escapes, e.g. `&#x1D306;`.
				hexDigits = $3;
				semicolon = $4;
				if (strict && !semicolon) {
					parseError('character reference was not terminated by a semicolon');
				}
				codePoint = parseInt(hexDigits, 16);
				return codePointToSymbol(codePoint, strict);
			}
			if ($5) {
				// Decode named character references with trailing `;`, e.g. `&copy;`.
				reference = $5;
				if (has(decodeMap, reference)) {
					return decodeMap[reference];
				} else {
					// Ambiguous ampersand; see http://mths.be/notes/ambiguous-ampersands.
					if (strict) {
						parseError('named character reference was not terminated by a semicolon');
					}
					return $0;
				}
			}
			// If we’re still here, it’s a legacy reference for sure. No need for an
			// extra `if` check.
			// Decode named character references without trailing `;`, e.g. `&amp`
			// This is only a parse error if it gets converted to `&`, or if it is
			// followed by `=` in an attribute context.
			reference = $6;
			next = $7;
			if (next && options.isAttributeValue) {
				if (strict && next == '=') {
					parseError('`&` did not start a character reference');
				}
				return $0;
			} else {
				if (strict) {
					parseError('named character reference was not terminated by a semicolon');
				}
				// Note: there is no need to check `has(decodeMapLegacy, reference)`.
				return decodeMapLegacy[reference] + (next || '');
			}
		});
	};
	// Expose default options (so they can be overridden globally).
	decode.options = {
		'isAttributeValue': false,
		'strict': false
	};

	var escape = function escape(string) {
		return string.replace(regexEscape, function ($0) {
			// Note: there is no need to check `has(escapeMap, $0)` here.
			return escapeMap[$0];
		});
	};

	/*--------------------------------------------------------------------------*/

	var he = {
		'version': '0.5.0',
		'encode': encode,
		'decode': decode,
		'escape': escape,
		'unescape': decode
	};

	// Some AMD build optimizers, like r.js, check for specific condition patterns
	// like the following:
	if (typeof define == 'function' && typeof define.amd == 'object' && define.amd) {
		define(function () {
			return he;
		});
	} else if (freeExports && !freeExports.nodeType) {
		if (freeModule) {
			// in Node.js or RingoJS v0.8.0+
			freeModule.exports = he;
		} else {
			// in Narwhal or RingoJS v0.7.0-
			for (var key in he) {
				has(he, key) && (freeExports[key] = he[key]);
			}
		}
	} else {
		// in Rhino or a web browser
		root.he = he;
	}
})(undefined);
}, {}],
21: [function(require, module, exports) {
/*!
 * repeat-string <https://github.com/jonschlinkert/repeat-string>
 *
 * Copyright (c) 2014-2015, Jon Schlinkert.
 * Licensed under the MIT License.
 */

'use strict';

/**
 * Expose `repeat`
 */

module.exports = repeat;

/**
 * Repeat the given `string` the specified `number`
 * of times.
 *
 * **Example:**
 *
 * ```js
 * var repeat = require('repeat-string');
 * repeat('A', 5);
 * //=> AAAAA
 * ```
 *
 * @param {String} `string` The string to repeat
 * @param {Number} `number` The number of times to repeat the string
 * @return {String} Repeated string
 * @api public
 */

function repeat(str, num) {
  if (typeof str !== 'string') {
    throw new TypeError('repeat-string expects a string.');
  }

  if (num === 1) return str;
  if (num === 2) return str + str;

  var max = str.length * num;
  if (cache !== str || typeof cache === 'undefined') {
    cache = str;
    res = '';
  }

  while (max > res.length && num > 0) {
    if (num & 1) {
      res += str;
    }

    num >>= 1;
    if (!num) break;
    str += str;
  }

  return res.substr(0, max);
}

/**
 * Results cache
 */

var res = '';
var cache;
}, {}],
17: [function(require, module, exports) {
/**
 * @author Titus Wormer
 * @copyright 2015 Titus Wormer. All rights reserved.
 * @module Utilities
 * @fileoverview Collection of tiny helpers useful for
 *   both parsing and compiling markdown.
 */

'use strict';

/*
 * Methods.
 */

var has = Object.prototype.hasOwnProperty;

/*
 * Expressions.
 */

var WHITE_SPACE_FINAL = /\s+$/;
var NEW_LINES_FINAL = /\n+$/;
var WHITE_SPACE_INITIAL = /^\s+/;
var EXPRESSION_LINE_BREAKS = /\r\n|\r/g;
var EXPRESSION_SYMBOL_FOR_NEW_LINE = /\u2424/g;
var WHITE_SPACE_COLLAPSABLE = /[ \t\n]+/g;
var EXPRESSION_BOM = /^\ufeff/;

/**
 * Shallow copy `context` into `target`.
 *
 * @example
 *   var target = {};
 *   copy(target, {foo: 'bar'}); // target
 *
 * @param {Object} target - Object to copy into.
 * @param {Object} context - Object to copy from.
 * @return {Object} - `target`.
 */
function copy(target, context) {
    var key;

    for (key in context) {
        if (has.call(context, key)) {
            target[key] = context[key];
        }
    }

    return target;
}

/**
 * Shallow clone `context`.
 *
 * @example
 *   clone({foo: 'bar'}) // {foo: 'bar'}
 *   clone(['foo', 'bar']) // ['foo', 'bar']
 *
 * @return {Object|Array} context - Object to clone.
 * @return {Object|Array} - Shallow clone of `context`.
 */
function clone(context) {
    if ('concat' in context) {
        return context.concat();
    }

    return copy({}, context);
}

/**
 * Throw an exception with in its `message` `value`
 * and `name`.
 *
 * @param {*} value - Invalid value.
 * @param {string} name - Setting name.
 */
function raise(value, name) {
    throw new Error('Invalid value `' + value + '` ' + 'for setting `' + name + '`');
}

/**
 * Validate a value to be boolean. Defaults to `def`.
 * Raises an exception with `context[name]` when not
 * a boolean.
 *
 * @example
 *   validateBoolean({foo: null}, 'foo', true) // true
 *   validateBoolean({foo: false}, 'foo', true) // false
 *   validateBoolean({foo: 'bar'}, 'foo', true) // Throws
 *
 * @throws {Error} - When a setting is neither omitted nor
 *   a boolean.
 * @param {Object} context - Settings.
 * @param {string} name - Setting name.
 * @param {boolean} def - Default value.
 */
function validateBoolean(context, name, def) {
    var value = context[name];

    if (value === null || value === undefined) {
        value = def;
    }

    if (typeof value !== 'boolean') {
        raise(value, 'options.' + name);
    }

    context[name] = value;
}

/**
 * Validate a value to be boolean. Defaults to `def`.
 * Raises an exception with `context[name]` when not
 * a boolean.
 *
 * @example
 *   validateNumber({foo: null}, 'foo', 1) // 1
 *   validateNumber({foo: 2}, 'foo', 1) // 2
 *   validateNumber({foo: 'bar'}, 'foo', 1) // Throws
 *
 * @throws {Error} - When a setting is neither omitted nor
 *   a number.
 * @param {Object} context - Settings.
 * @param {string} name - Setting name.
 * @param {number} def - Default value.
 */
function validateNumber(context, name, def) {
    var value = context[name];

    if (value === null || value === undefined) {
        value = def;
    }

    if (typeof value !== 'number' || value !== value) {
        raise(value, 'options.' + name);
    }

    context[name] = value;
}

/**
 * Validate a value to be in `map`. Defaults to `def`.
 * Raises an exception with `context[name]` when not
 * not in `map`.
 *
 * @example
 *   var map = {bar: true, baz: true};
 *   validateString({foo: null}, 'foo', 'bar', map) // 'bar'
 *   validateString({foo: 'baz'}, 'foo', 'bar', map) // 'baz'
 *   validateString({foo: true}, 'foo', 'bar', map) // Throws
 *
 * @throws {Error} - When a setting is neither omitted nor
 *   in `map`.
 * @param {Object} context - Settings.
 * @param {string} name - Setting name.
 * @param {string} def - Default value.
 * @param {Object} map - Enum.
 */
function validateString(context, name, def, map) {
    var value = context[name];

    if (value === null || value === undefined) {
        value = def;
    }

    if (!(value in map)) {
        raise(value, 'options.' + name);
    }

    context[name] = value;
}

/**
 * Remove final white space from `value`.
 *
 * @example
 *   trimRight('foo '); // 'foo'
 *
 * @param {string} value - Content to trim.
 * @return {string} - Trimmed content.
 */
function trimRight(value) {
    return String(value).replace(WHITE_SPACE_FINAL, '');
}

/**
 * Remove final new line characters from `value`.
 *
 * @example
 *   trimRightLines('foo\n\n'); // 'foo'
 *
 * @param {string} value - Content to trim.
 * @return {string} - Trimmed content.
 */
function trimRightLines(value) {
    return String(value).replace(NEW_LINES_FINAL, '');
}

/**
 * Remove initial white space from `value`.
 *
 * @example
 *   trimLeft(' foo'); // 'foo'
 *
 * @param {string} value - Content to trim.
 * @return {string} - Trimmed content.
 */
function trimLeft(value) {
    return String(value).replace(WHITE_SPACE_INITIAL, '');
}

/**
 * Remove initial and final white space from `value`.
 *
 * @example
 *   trim(' foo '); // 'foo'
 *
 * @param {string} value - Content to trim.
 * @return {string} - Trimmed content.
 */
function trim(value) {
    return trimLeft(trimRight(value));
}

/**
 * Collapse white space.
 *
 * @example
 *   collapse('foo\t bar'); // 'foo bar'
 *
 * @param {string} value - Content to collapse.
 * @return {string} - Collapsed content.
 */
function collapse(value) {
    return String(value).replace(WHITE_SPACE_COLLAPSABLE, ' ');
}

/**
 * Clean a string in preperation of parsing.
 *
 * @example
 *   clean('\ufefffoo'); // 'foo'
 *   clean('foo\r\nbar'); // 'foo\nbar'
 *   clean('foo\u2424bar'); // 'foo\nbar'
 *
 * @param {string} value - Content to clean.
 * @return {string} - Cleaned content.
 */
function clean(value) {
    return String(value).replace(EXPRESSION_BOM, '').replace(EXPRESSION_LINE_BREAKS, '\n').replace(EXPRESSION_SYMBOL_FOR_NEW_LINE, '\n');
}

/**
 * Normalize an identifier.  Collapses multiple white space
 * characters into a single space, and removes casing.
 *
 * @example
 *   normalizeIdentifier('FOO\t bar'); // 'foo bar'
 *
 * @param {string} value - Content to normalize.
 * @return {string} - Normalized content.
 */
function normalizeIdentifier(value) {
    return collapse(value).toLowerCase();
}

/**
 * Count how many characters `character` occur in `value`.
 *
 * @example
 *   countCharacter('foo(bar(baz)', '(') // 2
 *   countCharacter('foo(bar(baz)', ')') // 1
 *
 * @param {string} value - Content to search in.
 * @param {string} character - Character to search for.
 * @return {number} - Count.
 */
function countCharacter(value, character) {
    var index = -1;
    var length = value.length;
    var count = 0;

    while (++index < length) {
        if (value.charAt(index) === character) {
            count++;
        }
    }

    return count;
}

/**
 * Create an empty object.
 *
 * @example
 *   objectObject(); // Same as `{}`.
 *
 * @return {Object}
 */
function objectObject() {
    return {};
}

/*
 * Break coverage.
 */

objectObject();

/**
 * Create an object without prototype.
 *
 * @example
 *   objectNull(); // New object without prototype.
 *
 * @return {Object}
 */
function objectNull() {
    return Object.create(null);
}

/*
 * Expose `validate`.
 */

exports.validate = {
    'boolean': validateBoolean,
    'string': validateString,
    'number': validateNumber
};

/*
 * Expose.
 */

exports.trim = trim;
exports.trimLeft = trimLeft;
exports.trimRight = trimRight;
exports.trimRightLines = trimRightLines;
exports.collapse = collapse;
exports.normalizeIdentifier = normalizeIdentifier;
exports.clean = clean;
exports.raise = raise;
exports.copy = copy;
exports.clone = clone;
exports.countCharacter = countCharacter;

/* istanbul ignore else */
if ('create' in Object) {
    exports.create = objectNull;
} else {
    exports.create = objectObject;
}
}, {}],
22: [function(require, module, exports) {
/* This file is generated by `script/build-expressions.js` */
'use strict';

module.exports = {
  'rules': {
    'newline': /^\n([ \t]*\n)*/,
    'code': /^((?: {4}|\t)[^\n]*\n?([ \t]*\n)*)+/,
    'horizontalRule': /^[ \t]*([-*_])( *\1){2,} *(?=\n|$)/,
    'heading': /^([ \t]*)(#{1,6})(?:([ \t]+)([^\n]+?))??(?:[ \t]+#+)?[ \t]*(?=\n|$)/,
    'lineHeading': /^(\ {0,3})([^\n]+?)[ \t]*\n\ {0,3}(=|-){1,}[ \t]*(?=\n|$)/,
    'definition': /^[ \t]*\[((?:[^\\](?:\\|\\(?:\\{2})+)\]|[^\]])+)\]:[ \t\n]*(<[^>\[\]]+>|[^\s\[\]]+)(?:[ \t\n]+['"(]((?:[^\n]|\n(?!\n))*?)['")])?[ \t]*(?=\n|$)/,
    'bullet': /(?:[*+-]|\d+\.)/,
    'indent': /^([ \t]*)((?:[*+-]|\d+\.))( {1,4}(?! )| |\t)/,
    'item': /([ \t]*)((?:[*+-]|\d+\.))( {1,4}(?! )| |\t)[^\n]*(?:\n(?!\1(?:[*+-]|\d+\.)[ \t])[^\n]*)*/gm,
    'list': /^([ \t]*)((?:[*+-]|\d+\.))[ \t][\s\S]+?(?:(?=\n+\1?(?:[-*_][ \t]*){3,}(?:\n|$))|(?=\n+[ \t]*\[((?:[^\\](?:\\|\\(?:\\{2})+)\]|[^\]])+)\]:[ \t\n]*(<[^>\[\]]+>|[^\s\[\]]+)(?:[ \t\n]+['"(]((?:[^\n]|\n(?!\n))*?)['")])?[ \t]*(?=\n|$))|\n{2,}(?![ \t])(?!\1(?:[*+-]|\d+\.)[ \t])|$)/,
    'blockquote': /^(?=[ \t]*>)(?:(?:(?:[ \t]*>[^\n]*\n)*(?:[ \t]*>[^\n]+(?=\n|$))|(?![ \t]*>)(?![ \t]*\[((?:[^\\](?:\\|\\(?:\\{2})+)\]|[^\]])+)\]:[ \t\n]*(<[^>\[\]]+>|[^\s\[\]]+)(?:[ \t\n]+['"(]((?:[^\n]|\n(?!\n))*?)['")])?[ \t]*(?=\n|$))[^\n]+)(?:\n|$))*(?:[ \t]*>[ \t]*(?:\n[ \t]*>[ \t]*)*)?/,
    'html': /^(?:[ \t]*(?:(?:(?:<(?:article|header|aside|hgroup|blockquote|hr|iframe|body|li|map|button|object|canvas|ol|caption|output|col|p|colgroup|pre|dd|progress|div|section|dl|table|td|dt|tbody|embed|textarea|fieldset|tfoot|figcaption|th|figure|thead|footer|tr|form|ul|h1|h2|h3|h4|h5|h6|video|script|style)(?:(?:\s+)(?:[a-zA-Z_:][a-zA-Z0-9_.:-]*)(?:(?:\s+)?=(?:\s+)?(?:[^"'=<>`]+|'[^']*'|"[^"]*"))?)*(?:\s+)?\/?>?)|(?:<\/(?:article|header|aside|hgroup|blockquote|hr|iframe|body|li|map|button|object|canvas|ol|caption|output|col|p|colgroup|pre|dd|progress|div|section|dl|table|td|dt|tbody|embed|textarea|fieldset|tfoot|figcaption|th|figure|thead|footer|tr|form|ul|h1|h2|h3|h4|h5|h6|video|script|style)(?:\s+)?>))|(?:<!--(?!-?>)(?:[^-]|-(?!-))*-->)|(?:<\?(?:[^\?]|\?(?!>))+\?>)|(?:<![a-zA-Z]+\s+[\s\S]+?>)|(?:<!\[CDATA\[[\s\S]+?\]\]>))[\s\S]*?[ \t]*?(?:\n{2,}|\s*$))/i,
    'paragraph': /^(?:(?:[^\n]+\n?(?![ \t]*([-*_])( *\1){2,} *(?=\n|$)|([ \t]*)(#{1,6})(?:([ \t]+)([^\n]+?))??(?:[ \t]+#+)?[ \t]*(?=\n|$)|(\ {0,3})([^\n]+?)[ \t]*\n\ {0,3}(=|-){1,}[ \t]*(?=\n|$)|[ \t]*\[((?:[^\\](?:\\|\\(?:\\{2})+)\]|[^\]])+)\]:[ \t\n]*(<[^>\[\]]+>|[^\s\[\]]+)(?:[ \t\n]+['"(]((?:[^\n]|\n(?!\n))*?)['")])?[ \t]*(?=\n|$)|(?=[ \t]*>)(?:(?:(?:[ \t]*>[^\n]*\n)*(?:[ \t]*>[^\n]+(?=\n|$))|(?![ \t]*>)(?![ \t]*\[((?:[^\\](?:\\|\\(?:\\{2})+)\]|[^\]])+)\]:[ \t\n]*(<[^>\[\]]+>|[^\s\[\]]+)(?:[ \t\n]+['"(]((?:[^\n]|\n(?!\n))*?)['")])?[ \t]*(?=\n|$))[^\n]+)(?:\n|$))*(?:[ \t]*>[ \t]*(?:\n[ \t]*>[ \t]*)*)?|<(?!(?:a|em|strong|small|s|cite|q|dfn|abbr|data|time|code|var|samp|kbd|sub|sup|i|b|u|mark|ruby|rt|rp|bdi|bdo|span|br|wbr|ins|del|img)\b)(?!mailto:)\w+(?!:\/|[^\w\s@]*@)\b))+)/,
    'escape': /^\\([\\`*{}\[\]()#+\-.!_>])/,
    'autoLink': /^<([^ >]+(@|:\/)[^ >]+)>/,
    'tag': /^(?:(?:<(?:[a-zA-Z][a-zA-Z0-9]*)(?:(?:\s+)(?:[a-zA-Z_:][a-zA-Z0-9_.:-]*)(?:(?:\s+)?=(?:\s+)?(?:[^"'=<>`]+|'[^']*'|"[^"]*"))?)*(?:\s+)?\/?>)|(?:<\/(?:[a-zA-Z][a-zA-Z0-9]*)(?:\s+)?>)|(?:<!--(?!-?>)(?:[^-]|-(?!-))*-->)|(?:<\?(?:[^\?]|\?(?!>))+\?>)|(?:<![a-zA-Z]+\s+[\s\S]+?>)|(?:<!\[CDATA\[[\s\S]+?\]\]>))/,
    'strong': /^(_)_((?:\\[\s\S]|[^\\])+?)__(?!_)|^(\*)\*((?:\\[\s\S]|[^\\])+?)\*\*(?!\*)/,
    'emphasis': /^\b(_)((?:__|\\[\s\S]|[^\\])+?)_\b|^(\*)((?:\*\*|\\[\s\S]|[^\\])+?)\*(?!\*)/,
    'inlineCode': /^(`+)((?!`)[\s\S]*?(?:`\s+|[^`]))?(\1)(?!`)/,
    'break': /^ {2,}\n(?!\s*$)/,
    'inlineText': /^[\s\S]+?(?=[\\<!\[_*`]| {2,}\n|$)/,
    'link': /^(!?\[)((?:\[[^\]]*\]|[^\[\]]|\](?=[^\[]*\]))*)\]\(\s*(?:(?!<)((?:\((?:\\[\s\S]|[^\)])*?\)|\\[\s\S]|[\s\S])*?)|<([\s\S]*?)>)(?:\s+['"]([\s\S]*?)['"])?\s*\)/,
    'shortcutReference': /^(!?\[)((?:\\[\s\S]|[^\[\]])+?)\]/,
    'reference': /^(!?\[)((?:\[[^\]]*\]|[^\[\]]|\](?=[^\[]*\]))*)\]\s*\[((?:\\[\s\S]|[^\[\]])*)\]/
  },
  'gfm': {
    'fences': /^( *)(([`~])\3{2,})[ \t]*([^\n`~]+)?[ \t]*(?:\n([\s\S]*?))??(?:\n\ {0,3}\2\3*[ \t]*(?=\n|$)|$)/,
    'paragraph': /^(?:(?:[^\n]+\n?(?![ \t]*([-*_])( *\1){2,} *(?=\n|$)|( *)(([`~])\5{2,})[ \t]*([^\n`~]+)?[ \t]*(?:\n([\s\S]*?))??(?:\n\ {0,3}\4\5*[ \t]*(?=\n|$)|$)|([ \t]*)((?:[*+-]|\d+\.))[ \t][\s\S]+?(?:(?=\n+\8?(?:[-*_][ \t]*){3,}(?:\n|$))|(?=\n+[ \t]*\[((?:[^\\](?:\\|\\(?:\\{2})+)\]|[^\]])+)\]:[ \t\n]*(<[^>\[\]]+>|[^\s\[\]]+)(?:[ \t\n]+['"(]((?:[^\n]|\n(?!\n))*?)['")])?[ \t]*(?=\n|$))|\n{2,}(?![ \t])(?!\8(?:[*+-]|\d+\.)[ \t])|$)|([ \t]*)(#{1,6})(?:([ \t]+)([^\n]+?))??(?:[ \t]+#+)?[ \t]*(?=\n|$)|(\ {0,3})([^\n]+?)[ \t]*\n\ {0,3}(=|-){1,}[ \t]*(?=\n|$)|[ \t]*\[((?:[^\\](?:\\|\\(?:\\{2})+)\]|[^\]])+)\]:[ \t\n]*(<[^>\[\]]+>|[^\s\[\]]+)(?:[ \t\n]+['"(]((?:[^\n]|\n(?!\n))*?)['")])?[ \t]*(?=\n|$)|(?=[ \t]*>)(?:(?:(?:[ \t]*>[^\n]*\n)*(?:[ \t]*>[^\n]+(?=\n|$))|(?![ \t]*>)(?![ \t]*\[((?:[^\\](?:\\|\\(?:\\{2})+)\]|[^\]])+)\]:[ \t\n]*(<[^>\[\]]+>|[^\s\[\]]+)(?:[ \t\n]+['"(]((?:[^\n]|\n(?!\n))*?)['")])?[ \t]*(?=\n|$))[^\n]+)(?:\n|$))*(?:[ \t]*>[ \t]*(?:\n[ \t]*>[ \t]*)*)?|<(?!(?:a|em|strong|small|s|cite|q|dfn|abbr|data|time|code|var|samp|kbd|sub|sup|i|b|u|mark|ruby|rt|rp|bdi|bdo|span|br|wbr|ins|del|img)\b)(?!mailto:)\w+(?!:\/|[^\w\s@]*@)\b))+)/,
    'table': /^( *\|(.+))\n( *\|( *[-:]+[-| :]*)\n)((?: *\|.*(?:\n|$))*)/,
    'looseTable': /^( *(\S.*\|.*))\n( *([-:]+ *\|[-| :]*)\n)((?:.*\|.*(?:\n|$))*)/,
    'escape': /^\\([\\`*{}\[\]()#+\-.!_>~|])/,
    'url': /^https?:\/\/[^\s<]+[^<.,:;"')\]\s]/,
    'deletion': /^~~(?=\S)([\s\S]*?\S)~~/,
    'inlineText': /^[\s\S]+?(?=[\\<!\[_*`~]|https?:\/\/| {2,}\n|$)/
  },
  'footnotes': {
    'footnoteDefinition': /^( *\[\^([^\]]+)\]: *)([^\n]+(\n+ +[^\n]+)*)/
  },
  'yaml': {
    'yamlFrontMatter': /^-{3}\n([\s\S]+?\n)?-{3}/
  },
  'pedantic': {
    'heading': /^([ \t]*)(#{1,6})([ \t]*)([^\n]*?)[ \t]*#*[ \t]*(?=\n|$)/,
    'strong': /^(_)_(?=\S)([\s\S]*?\S)__(?!_)|^(\*)\*(?=\S)([\s\S]*?\S)\*\*(?!\*)/,
    'emphasis': /^(_)(?=\S)([\s\S]*?\S)_(?!_)|^(\*)(?=\S)([\s\S]*?\S)\*(?!\*)/
  },
  'commonmark': {
    'list': /^([ \t]*)((?:[*+-]|\d+[\.\)]))[ \t][\s\S]+?(?:(?=\n+\1?(?:[-*_][ \t]*){3,}(?:\n|$))|(?=\n+[ \t]*\[((?:[^\\](?:\\|\\(?:\\{2})+)\]|[^\]])+)\]:[ \t\n]*(<[^>\[\]]+>|[^\s\[\]]+)(?:[ \t\n]+['"(]((?:[^\n]|\n(?!\n))*?)['")])?[ \t]*(?=\n|$))|\n{2,}(?![ \t])(?!\1(?:[*+-]|\d+[\.\)])[ \t])|$)/,
    'item': /([ \t]*)((?:[*+-]|\d+[\.\)]))( {1,4}(?! )| |\t)[^\n]*(?:\n(?!\1(?:[*+-]|\d+[\.\)])[ \t])[^\n]*)*/gm,
    'bullet': /(?:[*+-]|\d+[\.\)])/,
    'indent': /^([ \t]*)((?:[*+-]|\d+[\.\)]))( {1,4}(?! )| |\t)/,
    'link': /^(!?\[)((?:(?:\[(?:\[(?:\\[\s\S]|[^\[\]])*?\]|\\[\s\S]|[^\[\]])*?\])|\\[\s\S]|[^\[\]])*?)\]\(\s*(?:(?!<)((?:\((?:\\[\s\S]|[^\(\)\s])*?\)|\\[\s\S]|[^\(\)\s])*?)|<([^\n]*?)>)(?:\s+(?:\'((?:\\[\s\S]|[^\'])*?)\'|"((?:\\[\s\S]|[^"])*?)"|\(((?:\\[\s\S]|[^\)])*?)\)))?\s*\)/,
    'reference': /^(!?\[)((?:(?:\[(?:\[(?:\\[\s\S]|[^\[\]])*?\]|\\[\s\S]|[^\[\]])*?\])|\\[\s\S]|[^\[\]])*?)\]\s*\[((?:\\[\s\S]|[^\[\]])*)\]/,
    'paragraph': /^(?:(?:[^\n]+\n?(?!\ {0,3}([-*_])( *\1){2,} *(?=\n|$)|(\ {0,3})(#{1,6})(?:([ \t]+)([^\n]+?))??(?:[ \t]+#+)?\ {0,3}(?=\n|$)|(?=\ {0,3}>)(?:(?:(?:\ {0,3}>[^\n]*\n)*(?:\ {0,3}>[^\n]+(?=\n|$))|(?!\ {0,3}>)(?!\ {0,3}\[((?:[^\\](?:\\|\\(?:\\{2})+)\]|[^\]])+)\]:[ \t\n]*(<[^>\[\]]+>|[^\s\[\]]+)(?:[ \t\n]+['"(]((?:[^\n]|\n(?!\n))*?)['")])?\ {0,3}(?=\n|$))[^\n]+)(?:\n|$))*(?:\ {0,3}>\ {0,3}(?:\n\ {0,3}>\ {0,3})*)?|<(?!(?:a|em|strong|small|s|cite|q|dfn|abbr|data|time|code|var|samp|kbd|sub|sup|i|b|u|mark|ruby|rt|rp|bdi|bdo|span|br|wbr|ins|del|img)\b)(?!mailto:)\w+(?!:\/|[^\w\s@]*@)\b))+)/,
    'blockquote': /^(?=[ \t]*>)(?:(?:(?:[ \t]*>[^\n]*\n)*(?:[ \t]*>[^\n]+(?=\n|$))|(?![ \t]*>)(?![ \t]*([-*_])( *\1){2,} *(?=\n|$)|([ \t]*)((?:[*+-]|\d+\.))[ \t][\s\S]+?(?:(?=\n+\3?(?:[-*_][ \t]*){3,}(?:\n|$))|(?=\n+[ \t]*\[((?:[^\\](?:\\|\\(?:\\{2})+)\]|[^\]])+)\]:[ \t\n]*(<[^>\[\]]+>|[^\s\[\]]+)(?:[ \t\n]+['"(]((?:[^\n]|\n(?!\n))*?)['")])?[ \t]*(?=\n|$))|\n{2,}(?![ \t])(?!\3(?:[*+-]|\d+\.)[ \t])|$)|( *)(([`~])\10{2,})[ \t]*([^\n`~]+)?[ \t]*(?:\n([\s\S]*?))??(?:\n\ {0,3}\9\10*[ \t]*(?=\n|$)|$)|((?: {4}|\t)[^\n]*\n?([ \t]*\n)*)+|[ \t]*\[((?:[^\\](?:\\|\\(?:\\{2})+)\]|[^\]])+)\]:[ \t\n]*(<[^>\[\]]+>|[^\s\[\]]+)(?:[ \t\n]+['"(]((?:[^\n]|\n(?!\n))*?)['")])?[ \t]*(?=\n|$))[^\n]+)(?:\n|$))*(?:[ \t]*>[ \t]*(?:\n[ \t]*>[ \t]*)*)?/,
    'escape': /^\\(\n|[\\`*{}\[\]()#+\-.!_>"$%&',\/:;<=?@^~|])/
  },
  'commonmarkGFM': {
    'paragraph': /^(?:(?:[^\n]+\n?(?!\ {0,3}([-*_])( *\1){2,} *(?=\n|$)|( *)(([`~])\5{2,})\ {0,3}([^\n`~]+)?\ {0,3}(?:\n([\s\S]*?))??(?:\n\ {0,3}\4\5*\ {0,3}(?=\n|$)|$)|(\ {0,3})((?:[*+-]|\d+\.))[ \t][\s\S]+?(?:(?=\n+\8?(?:[-*_]\ {0,3}){3,}(?:\n|$))|(?=\n+\ {0,3}\[((?:[^\\](?:\\|\\(?:\\{2})+)\]|[^\]])+)\]:[ \t\n]*(<[^>\[\]]+>|[^\s\[\]]+)(?:[ \t\n]+['"(]((?:[^\n]|\n(?!\n))*?)['")])?\ {0,3}(?=\n|$))|\n{2,}(?![ \t])(?!\8(?:[*+-]|\d+\.)[ \t])|$)|(\ {0,3})(#{1,6})(?:([ \t]+)([^\n]+?))??(?:[ \t]+#+)?\ {0,3}(?=\n|$)|(?=\ {0,3}>)(?:(?:(?:\ {0,3}>[^\n]*\n)*(?:\ {0,3}>[^\n]+(?=\n|$))|(?!\ {0,3}>)(?!\ {0,3}\[((?:[^\\](?:\\|\\(?:\\{2})+)\]|[^\]])+)\]:[ \t\n]*(<[^>\[\]]+>|[^\s\[\]]+)(?:[ \t\n]+['"(]((?:[^\n]|\n(?!\n))*?)['")])?\ {0,3}(?=\n|$))[^\n]+)(?:\n|$))*(?:\ {0,3}>\ {0,3}(?:\n\ {0,3}>\ {0,3})*)?|<(?!(?:a|em|strong|small|s|cite|q|dfn|abbr|data|time|code|var|samp|kbd|sub|sup|i|b|u|mark|ruby|rt|rp|bdi|bdo|span|br|wbr|ins|del|img)\b)(?!mailto:)\w+(?!:\/|[^\w\s@]*@)\b))+)/
  },
  'breaks': {
    'break': /^ *\n(?!\s*$)/,
    'inlineText': /^[\s\S]+?(?=[\\<!\[_*`]| *\n|$)/
  },
  'breaksGFM': {
    'inlineText': /^[\s\S]+?(?=[\\<!\[_*`~]|https?:\/\/| *\n|$)/
  }
};
}, {}],
23: [function(require, module, exports) {
/**
 * @author Titus Wormer
 * @copyright 2015 Titus Wormer. All rights reserved.
 * @module Defaults
 * @fileoverview Default values for parse and
 *  stringification settings.
 */

'use strict';

/*
 * Note that `stringify.entities` is a string.
 */

module.exports = {
    'parse': {
        'position': true,
        'gfm': true,
        'yaml': true,
        'commonmark': false,
        'footnotes': false,
        'pedantic': false,
        'breaks': false
    },
    'stringify': {
        'entities': 'false',
        'setext': false,
        'closeAtx': false,
        'looseTable': false,
        'spacedTable': true,
        'incrementListMarker': true,
        'fences': false,
        'fence': '`',
        'bullet': '-',
        'listItemIndent': 'tab',
        'rule': '*',
        'ruleSpaces': true,
        'ruleRepetition': 3,
        'strong': '*',
        'emphasis': '_'
    }
};
}, {}],
15: [function(require, module, exports) {
/**
 * @author Titus Wormer
 * @copyright 2015 Titus Wormer. All rights reserved.
 * @module Stringify
 * @fileoverview Compile a an abstract syntax tree into
 *   a markdown document.
 */

'use strict';

/*
 * Dependencies.
 */

var he = require('he');
var table = require('markdown-table');
var repeat = require('repeat-string');
var utilities = require('./utilities.js');
var defaultOptions = require('./defaults.js').stringify;

/*
 * Methods.
 */

var clone = utilities.clone;
var raise = utilities.raise;
var validate = utilities.validate;
var count = utilities.countCharacter;
var objectCreate = utilities.create;

/*
 * Constants.
 */

var INDENT = 4;
var MINIMUM_CODE_FENCE_LENGTH = 3;
var YAML_FENCE_LENGTH = 3;
var MINIMUM_RULE_LENGTH = 3;
var MAILTO = 'mailto:';

/*
 * Expressions.
 */

var EXPRESSIONS_WHITE_SPACE = /\s/;

/*
 * Expression for a protocol.
 *
 * @see http://en.wikipedia.org/wiki/URI_scheme#Generic_syntax
 */

var PROTOCOL = /^[a-z][a-z+.-]+:\/?/i;

/*
 * Characters.
 */

var ANGLE_BRACKET_CLOSE = '>';
var ANGLE_BRACKET_OPEN = '<';
var ASTERISK = '*';
var CARET = '^';
var COLON = ':';
var DASH = '-';
var DOT = '.';
var EMPTY = '';
var EQUALS = '=';
var EXCLAMATION_MARK = '!';
var HASH = '#';
var LINE = '\n';
var PARENTHESIS_OPEN = '(';
var PARENTHESIS_CLOSE = ')';
var PIPE = '|';
var PLUS = '+';
var QUOTE_DOUBLE = '"';
var QUOTE_SINGLE = '\'';
var SPACE = ' ';
var SQUARE_BRACKET_OPEN = '[';
var SQUARE_BRACKET_CLOSE = ']';
var TICK = '`';
var TILDE = '~';
var UNDERSCORE = '_';

/*
 * Character combinations.
 */

var BREAK = LINE + LINE;
var GAP = BREAK + LINE;
var DOUBLE_TILDE = TILDE + TILDE;

/*
 * Allowed entity options.
 */

var ENTITY_OPTIONS = objectCreate();

ENTITY_OPTIONS['true'] = true;
ENTITY_OPTIONS['false'] = true;
ENTITY_OPTIONS.numbers = true;
ENTITY_OPTIONS.escape = true;

/*
 * Allowed list-bullet characters.
 */

var LIST_BULLETS = objectCreate();

LIST_BULLETS[ASTERISK] = true;
LIST_BULLETS[DASH] = true;
LIST_BULLETS[PLUS] = true;

/*
 * Allowed horizontal-rule bullet characters.
 */

var HORIZONTAL_RULE_BULLETS = objectCreate();

HORIZONTAL_RULE_BULLETS[ASTERISK] = true;
HORIZONTAL_RULE_BULLETS[DASH] = true;
HORIZONTAL_RULE_BULLETS[UNDERSCORE] = true;

/*
 * Allowed emphasis characters.
 */

var EMPHASIS_MARKERS = objectCreate();

EMPHASIS_MARKERS[UNDERSCORE] = true;
EMPHASIS_MARKERS[ASTERISK] = true;

/*
 * Allowed fence markers.
 */

var FENCE_MARKERS = objectCreate();

FENCE_MARKERS[TICK] = true;
FENCE_MARKERS[TILDE] = true;

/*
 * Which method to use based on `list.ordered`.
 */

var ORDERED_MAP = objectCreate();

ORDERED_MAP['true'] = 'visitOrderedItems';
ORDERED_MAP['false'] = 'visitUnorderedItems';

/*
 * Allowed list-item-indent's.
 */

var LIST_ITEM_INDENTS = objectCreate();

var LIST_ITEM_TAB = 'tab';
var LIST_ITEM_ONE = '1';
var LIST_ITEM_MIXED = 'mixed';

LIST_ITEM_INDENTS[LIST_ITEM_ONE] = true;
LIST_ITEM_INDENTS[LIST_ITEM_TAB] = true;
LIST_ITEM_INDENTS[LIST_ITEM_MIXED] = true;

/*
 * Which checkbox to use.
 */

var CHECKBOX_MAP = objectCreate();

CHECKBOX_MAP['null'] = EMPTY;
CHECKBOX_MAP.undefined = EMPTY;
CHECKBOX_MAP['true'] = SQUARE_BRACKET_OPEN + 'x' + SQUARE_BRACKET_CLOSE + SPACE;
CHECKBOX_MAP['false'] = SQUARE_BRACKET_OPEN + SPACE + SQUARE_BRACKET_CLOSE + SPACE;

/**
 * Encode noop.
 * Simply returns the given value.
 *
 * @example
 *   var encode = encodeNoop();
 *   encode('AT&T') // 'AT&T'
 *
 * @param {string} value - Content.
 * @return {string} - Content, without any modifications.
 */
function encodeNoop(value) {
    return value;
}

/**
 * Factory to encode HTML entities.
 * Creates a no-operation function when `type` is
 * `'false'`, a function which encodes using named
 * references when `type` is `'true'`, and a function
 * which encodes using numbered references when `type` is
 * `'numbers'`.
 *
 * By default this should not throw errors, but he does
 * throw an error when in `strict` mode:
 *
 *     he.encode.options.strict = true;
 *     encodeFactory('true')('\x01') // throws
 *
 * These are thrown on the currently compiled `File`.
 *
 * @example
 *   var file = new File();
 *
 *   var encode = encodeFactory('false', file);
 *   encode('AT&T') // 'AT&T'
 *
 *   encode = encodeFactory('true', file);
 *   encode('AT&T') // 'AT&amp;T'
 *
 *   encode = encodeFactory('numbers', file);
 *   encode('AT&T') // 'ATT&#x26;T'
 *
 * @param {string} type - Either `'true'`, `'false'`, or
 *   `numbers`.
 * @param {File} file - Currently compiled virtual file.
 * @return {function(string): string} - Function which
 *   takes a value and returns its encoded version.
 */
function encodeFactory(type, file) {
    var options = {};
    var fn;

    if (type === 'false') {
        return encodeNoop;
    }

    if (type === 'true') {
        options.useNamedReferences = true;
    }

    fn = type === 'escape' ? 'escape' : 'encode';

    /**
     * Encode HTML entities using `he` using bound options.
     *
     * @see https://github.com/mathiasbynens/he#strict
     *
     * @example
     *   // When `type` is `'true'`.
     *   encode('AT&T'); // 'AT&amp;T'
     *
     *   // When `type` is `'numbers'`.
     *   encode('AT&T'); // 'ATT&#x26;T'
     *
     * @param {string} value - Content.
     * @param {Object} node - Node which is compiled.
     * @return {string} - Encoded content.
     * @throws {Error} - When `file.quiet` is not `true`.
     *   However, by default `he` does not throw on
     *   parse errors, but when
     *   `he.encode.options.strict: true`, they occur on
     *   invalid HTML.
     */
    function encode(value, node) {
        try {
            return he[fn](value, options);
        } catch (exception) {
            file.fail(exception, node.position);
        }
    }

    return encode;
}

/**
 * Checks if `url` needs to be enclosed by angle brackets.
 *
 * @example
 *   encloseURI('foo bar') // '<foo bar>'
 *   encloseURI('foo(bar(baz)') // '<foo(bar(baz)>'
 *   encloseURI('') // '<>'
 *   encloseURI('example.com') // 'example.com'
 *   encloseURI('example.com', true) // '<example.com>'
 *
 * @param {string} uri
 * @param {boolean?} [always] - Force enclosing.
 * @return {boolean} - Properly enclosed `uri`.
 */
function encloseURI(uri, always) {
    if (always || !uri.length || EXPRESSIONS_WHITE_SPACE.test(uri) || count(uri, PARENTHESIS_OPEN) !== count(uri, PARENTHESIS_CLOSE)) {
        return ANGLE_BRACKET_OPEN + uri + ANGLE_BRACKET_CLOSE;
    }

    return uri;
}

/**
 * There is currently no way to support nested delimiters
 * across Markdown.pl, CommonMark, and GitHub (RedCarpet).
 * The following supports Markdown.pl, and GitHub.
 * CommonMark is not supported when mixing double- and
 * single quotes inside a title.
 *
 * @see https://github.com/vmg/redcarpet/issues/473
 * @see https://github.com/jgm/CommonMark/issues/308
 *
 * @example
 *   encloseTitle('foo') // '"foo"'
 *   encloseTitle('foo \'bar\' baz') // '"foo \'bar\' baz"'
 *   encloseTitle('foo "bar" baz') // '\'foo "bar" baz\''
 *   encloseTitle('foo "bar" \'baz\'') // '"foo "bar" \'baz\'"'
 *
 * @param {string} title - Content.
 * @return {string} - Properly enclosed title.
 */
function encloseTitle(title) {
    var delimiter = QUOTE_DOUBLE;

    if (title.indexOf(delimiter) !== -1) {
        delimiter = QUOTE_SINGLE;
    }

    return delimiter + title + delimiter;
}

/**
 * Get the count of the longest repeating streak
 * of `character` in `value`.
 *
 * @example
 *   getLongestRepetition('` foo `` bar `', '`') // 2
 *
 * @param {string} value - Content.
 * @param {string} character - Single character to look
 *   for.
 * @return {number} - Number of characters at the place
 *   where `character` occurs in its longest streak in
 *   `value`.
 */
function getLongestRepetition(value, character) {
    var highestCount = 0;
    var index = -1;
    var length = value.length;
    var currentCount = 0;
    var currentCharacter;

    while (++index < length) {
        currentCharacter = value.charAt(index);

        if (currentCharacter === character) {
            currentCount++;

            if (currentCount > highestCount) {
                highestCount = currentCount;
            }
        } else {
            currentCount = 0;
        }
    }

    return highestCount;
}

/**
 * Pad `value` with `level * INDENT` spaces.  Respects
 * lines.
 *
 * @example
 *   pad('foo', 1) // '    foo'
 *
 * @param {string} value - Content.
 * @param {number} level - Indentation level.
 * @return {string} - Padded `value`.
 */
function pad(value, level) {
    var index;
    var padding;

    value = value.split(LINE);

    index = value.length;
    padding = repeat(SPACE, level * INDENT);

    while (index--) {
        if (value[index].length !== 0) {
            value[index] = padding + value[index];
        }
    }

    return value.join(LINE);
}

/**
 * Construct a new compiler.
 *
 * @example
 *   var compiler = new Compiler(new File('> foo.'));
 *
 * @constructor
 * @class {Compiler}
 * @param {File} file - Virtual file.
 * @param {Object?} [options] - Passed to
 *   `Compiler#setOptions()`.
 */
function Compiler(file, options) {
    var self = this;

    self.file = file;

    self.options = clone(self.options);

    self.setOptions(options);
}

/*
 * Cache prototype.
 */

var compilerPrototype = Compiler.prototype;

/*
 * Expose defaults.
 */

compilerPrototype.options = defaultOptions;

/*
 * Map of applicable enum's.
 */

var maps = {
    'entities': ENTITY_OPTIONS,
    'bullet': LIST_BULLETS,
    'rule': HORIZONTAL_RULE_BULLETS,
    'listItemIndent': LIST_ITEM_INDENTS,
    'emphasis': EMPHASIS_MARKERS,
    'strong': EMPHASIS_MARKERS,
    'fence': FENCE_MARKERS
};

/**
 * Set options.  Does not overwrite previously set
 * options.
 *
 * @example
 *   var compiler = new Compiler();
 *   compiler.setOptions({bullet: '*'});
 *
 * @this {Compiler}
 * @throws {Error} - When an option is invalid.
 * @param {Object?} [options] - Stringify settings.
 * @return {Compiler} - `self`.
 */
compilerPrototype.setOptions = function (options) {
    var self = this;
    var current = self.options;
    var ruleRepetition;
    var key;

    if (options === null || options === undefined) {
        options = {};
    } else if (typeof options === 'object') {
        options = clone(options);
    } else {
        raise(options, 'options');
    }

    for (key in defaultOptions) {
        validate[typeof current[key]](options, key, current[key], maps[key]);
    }

    ruleRepetition = options.ruleRepetition;

    if (ruleRepetition && ruleRepetition < MINIMUM_RULE_LENGTH) {
        raise(ruleRepetition, 'options.ruleRepetition');
    }

    self.encode = encodeFactory(String(options.entities), self.file);

    self.options = options;

    return self;
};

/**
 * Visit a token.
 *
 * @example
 *   var compiler = new Compiler();
 *
 *   compiler.visit({
 *     type: 'strong',
 *     children: [{
 *       type: 'text',
 *       value: 'Foo'
 *     }]
 *   });
 *   // '**Foo**'
 *
 * @param {Object} token - Node.
 * @param {Object?} [parent] - `token`s parent node.
 * @return {string} - Compiled `token`.
 */
compilerPrototype.visit = function (token, parent) {
    var self = this;

    if (typeof self[token.type] !== 'function') {
        self.file.fail('Missing compiler for node of type `' + token.type + '`: ' + token, token);
    }

    return self[token.type](token, parent);
};

/**
 * Visit all tokens.
 *
 * @example
 *   var compiler = new Compiler();
 *
 *   compiler.all({
 *     type: 'strong',
 *     children: [{
 *       type: 'text',
 *       value: 'Foo'
 *     },
 *     {
 *       type: 'text',
 *       value: 'Bar'
 *     }]
 *   });
 *   // ['Foo', 'Bar']
 *
 * @param {Object} parent - Parent node of children.
 * @return {Array.<string>} - List of compiled children.
 */
compilerPrototype.all = function (parent) {
    var self = this;
    var tokens = parent.children;
    var values = [];
    var index = -1;
    var length = tokens.length;

    while (++index < length) {
        values[index] = self.visit(tokens[index], parent);
    }

    return values;
};

/**
 * Visit ordered list items.
 *
 * Starts the list with
 * `token.start` and increments each following list item
 * bullet by one:
 *
 *     2. foo
 *     3. bar
 *
 * In `incrementListMarker: false` mode, does not increment
 * each marker ans stays on `token.start`:
 *
 *     1. foo
 *     1. bar
 *
 * Adds an extra line after an item if it has
 * `loose: true`.
 *
 * @example
 *   var compiler = new Compiler();
 *
 *   compiler.visitOrderedItems({
 *     type: 'list',
 *     ordered: true,
 *     children: [{
 *       type: 'listItem',
 *       children: [{
 *         type: 'text',
 *         value: 'bar'
 *       }]
 *     }]
 *   });
 *   // '1.  bar'
 *
 * @param {Object} token - `list` node with
 *   `ordered: true`.
 * @return {string} - Markdown list.
 */
compilerPrototype.visitOrderedItems = function (token) {
    var self = this;
    var increment = self.options.incrementListMarker;
    var values = [];
    var tokens = token.children;
    var index = -1;
    var length = tokens.length;
    var start = token.start;
    var bullet;

    while (++index < length) {
        bullet = (increment ? start + index : start) + DOT;
        values[index] = self.listItem(tokens[index], token, index, bullet);
    }

    return values.join(LINE);
};

/**
 * Visit unordered list items.
 *
 * Uses `options.bullet` as each item's bullet.
 *
 * Adds an extra line after an item if it has
 * `loose: true`.
 *
 * @example
 *   var compiler = new Compiler();
 *
 *   compiler.visitUnorderedItems({
 *     type: 'list',
 *     ordered: false,
 *     children: [{
 *       type: 'listItem',
 *       children: [{
 *         type: 'text',
 *         value: 'bar'
 *       }]
 *     }]
 *   });
 *   // '-   bar'
 *
 * @param {Object} token - `list` node with
 *   `ordered: false`.
 * @return {string} - Markdown list.
 */
compilerPrototype.visitUnorderedItems = function (token) {
    var self = this;
    var values = [];
    var tokens = token.children;
    var length = tokens.length;
    var index = -1;
    var bullet = self.options.bullet;

    while (++index < length) {
        values[index] = self.listItem(tokens[index], token, index, bullet);
    }

    return values.join(LINE);
};

/**
 * Stringify a block node with block children (e.g., `root`
 * or `blockquote`).
 *
 * Knows about code following a list, or adjacent lists
 * with similar bullets, and places an extra newline
 * between them.
 *
 * @example
 *   var compiler = new Compiler();
 *
 *   compiler.block({
 *     type: 'root',
 *     children: [{
 *       type: 'paragraph',
 *       children: [{
 *         type: 'text',
 *         value: 'bar'
 *       }]
 *     }]
 *   });
 *   // 'bar'
 *
 * @param {Object} token - `root` node.
 * @return {string} - Markdown block content.
 */
compilerPrototype.block = function (token) {
    var self = this;
    var values = [];
    var tokens = token.children;
    var index = -1;
    var length = tokens.length;
    var child;
    var prev;

    while (++index < length) {
        child = tokens[index];

        if (prev) {
            /*
             * Duplicate tokens, such as a list
             * directly following another list,
             * often need multiple new lines.
             *
             * Additionally, code blocks following a list
             * might easily be mistaken for a paragraph
             * in the list itself.
             */

            if (child.type === prev.type && prev.type === 'list') {
                values.push(prev.ordered === child.ordered ? GAP : BREAK);
            } else if (prev.type === 'list' && child.type === 'code' && !child.lang) {
                values.push(GAP);
            } else {
                values.push(BREAK);
            }
        }

        values.push(self.visit(child, token));

        prev = child;
    }

    return values.join(EMPTY);
};

/**
 * Stringify a root.
 *
 * Adds a final newline to ensure valid POSIX files.
 *
 * @example
 *   var compiler = new Compiler();
 *
 *   compiler.root({
 *     type: 'root',
 *     children: [{
 *       type: 'paragraph',
 *       children: [{
 *         type: 'text',
 *         value: 'bar'
 *       }]
 *     }]
 *   });
 *   // 'bar'
 *
 * @param {Object} token - `root` node.
 * @return {string} - Markdown document.
 */
compilerPrototype.root = function (token) {
    return this.block(token) + LINE;
};

/**
 * Stringify a heading.
 *
 * In `setext: true` mode and when `depth` is smaller than
 * three, creates a setext header:
 *
 *     Foo
 *     ===
 *
 * Otherwise, an ATX header is generated:
 *
 *     ### Foo
 *
 * In `closeAtx: true` mode, the header is closed with
 * hashes:
 *
 *     ### Foo ###
 *
 * @example
 *   var compiler = new Compiler();
 *
 *   compiler.heading({
 *     type: 'heading',
 *     depth: 2,
 *     children: [{
 *       type: 'strong',
 *       children: [{
 *         type: 'text',
 *         value: 'bar'
 *       }]
 *     }]
 *   });
 *   // '## **bar**'
 *
 * @param {Object} token - `heading` node.
 * @return {string} - Markdown heading.
 */
compilerPrototype.heading = function (token) {
    var self = this;
    var setext = self.options.setext;
    var closeAtx = self.options.closeAtx;
    var depth = token.depth;
    var content = self.all(token).join(EMPTY);
    var prefix;

    if (setext && depth < 3) {
        return content + LINE + repeat(depth === 1 ? EQUALS : DASH, content.length);
    }

    prefix = repeat(HASH, token.depth);
    content = prefix + SPACE + content;

    if (closeAtx) {
        content += SPACE + prefix;
    }

    return content;
};

/**
 * Stringify text.
 *
 * Supports named entities in `settings.encode: true` mode:
 *
 *     AT&amp;T
 *
 * Supports numbered entities in `settings.encode: numbers`
 * mode:
 *
 *     AT&#x26;T
 *
 * @example
 *   var compiler = new Compiler();
 *
 *   compiler.text({
 *     type: 'text',
 *     value: 'foo'
 *   });
 *   // 'foo'
 *
 * @param {Object} token - `text` node.
 * @return {string} - Raw markdown text.
 */
compilerPrototype.text = function (token) {
    return this.encode(token.value, token);
};

/**
 * Stringify escaped text.
 *
 * @example
 *   var compiler = new Compiler();
 *
 *   compiler.escape({
 *     type: 'escape',
 *     value: '\n'
 *   });
 *   // '\\\n'
 *
 * @param {Object} token - `escape` node.
 * @return {string} - Markdown escape.
 */
compilerPrototype.escape = function (token) {
    return '\\' + token.value;
};

/**
 * Stringify a paragraph.
 *
 * @example
 *   var compiler = new Compiler();
 *
 *   compiler.paragraph({
 *     type: 'paragraph',
 *     children: [{
 *       type: 'strong',
 *       children: [{
 *         type: 'text',
 *         value: 'bar'
 *       }]
 *     }]
 *   });
 *   // '**bar**'
 *
 * @param {Object} token - `paragraph` node.
 * @return {string} - Markdown paragraph.
 */
compilerPrototype.paragraph = function (token) {
    return this.all(token).join(EMPTY);
};

/**
 * Stringify a block quote.
 *
 * @example
 *   var compiler = new Compiler();
 *
 *   compiler.paragraph({
 *     type: 'blockquote',
 *     children: [{
 *       type: 'paragraph',
 *       children: [{
 *         type: 'strong',
 *         children: [{
 *           type: 'text',
 *           value: 'bar'
 *         }]
 *       }]
 *     }]
 *   });
 *   // '> **bar**'
 *
 * @param {Object} token - `blockquote` node.
 * @return {string} - Markdown block quote.
 */
compilerPrototype.blockquote = function (token) {
    var indent = ANGLE_BRACKET_CLOSE + SPACE;

    return indent + this.block(token).split(LINE).join(LINE + indent);
};

/**
 * Stringify a list. See `Compiler#visitOrderedList()` and
 * `Compiler#visitUnorderedList()` for internal working.
 *
 * @example
 *   var compiler = new Compiler();
 *
 *   compiler.visitUnorderedItems({
 *     type: 'list',
 *     ordered: false,
 *     children: [{
 *       type: 'listItem',
 *       children: [{
 *         type: 'text',
 *         value: 'bar'
 *       }]
 *     }]
 *   });
 *   // '-   bar'
 *
 * @param {Object} token - `list` node.
 * @return {string} - Markdown list.
 */
compilerPrototype.list = function (token) {
    return this[ORDERED_MAP[token.ordered]](token);
};

/**
 * Stringify a list item.
 *
 * Prefixes the content with a checked checkbox when
 * `checked: true`:
 *
 *     [x] foo
 *
 * Prefixes the content with an unchecked checkbox when
 * `checked: false`:
 *
 *     [ ] foo
 *
 * @example
 *   var compiler = new Compiler();
 *
 *   compiler.listItem({
 *     type: 'listItem',
 *     checked: true,
 *     children: [{
 *       type: 'text',
 *       value: 'bar'
 *     }]
 *   }, {
 *     type: 'list',
 *     ordered: false,
 *     children: [{
 *       type: 'listItem',
 *       checked: true,
 *       children: [{
 *         type: 'text',
 *         value: 'bar'
 *       }]
 *     }]
 *   }, 0, '*');
 *   '-   [x] bar'
 *
 * @param {Object} token - `listItem` node.
 * @param {Object} parent - `list` node.
 * @param {number} position - Index of `token` in `parent`.
 * @param {string} bullet - Bullet to use.  This, and the
 *   `listItemIndent` setting define the used indent.
 * @return {string} - Markdown list item.
 */
compilerPrototype.listItem = function (token, parent, position, bullet) {
    var self = this;
    var style = self.options.listItemIndent;
    var tokens = token.children;
    var values = [];
    var index = -1;
    var length = tokens.length;
    var loose = token.loose;
    var value;
    var indent;
    var spacing;

    while (++index < length) {
        values[index] = self.visit(tokens[index], token);
    }

    value = CHECKBOX_MAP[token.checked] + values.join(loose ? BREAK : LINE);

    if (style === LIST_ITEM_ONE || style === LIST_ITEM_MIXED && value.indexOf(LINE) === -1) {
        indent = bullet.length + 1;
        spacing = SPACE;
    } else {
        indent = Math.ceil((bullet.length + 1) / INDENT) * INDENT;
        spacing = repeat(SPACE, indent - bullet.length);
    }

    value = bullet + spacing + pad(value, indent / INDENT).slice(indent);

    if (loose && parent.children.length - 1 !== position) {
        value += LINE;
    }

    return value;
};

/**
 * Stringify inline code.
 *
 * Knows about internal ticks (`\``), and ensures one more
 * tick is used to enclose the inline code:
 *
 *     ```foo ``bar`` baz```
 *
 * Even knows about inital and final ticks:
 *
 *     `` `foo ``
 *     `` foo` ``
 *
 * @example
 *   var compiler = new Compiler();
 *
 *   compiler.inlineCode({
 *     type: 'inlineCode',
 *     value: 'foo(); `bar`; baz()'
 *   });
 *   // '``foo(); `bar`; baz()``'
 *
 * @param {Object} token - `inlineCode` node.
 * @return {string} - Markdown inline code.
 */
compilerPrototype.inlineCode = function (token) {
    var value = token.value;
    var ticks = repeat(TICK, getLongestRepetition(value, TICK) + 1);
    var start = ticks;
    var end = ticks;

    if (value.charAt(0) === TICK) {
        start += SPACE;
    }

    if (value.charAt(value.length - 1) === TICK) {
        end = SPACE + end;
    }

    return start + token.value + end;
};

/**
 * Stringify YAML front matter.
 *
 * @example
 *   var compiler = new Compiler();
 *
 *   compiler.yaml({
 *     type: 'yaml',
 *     value: 'foo: bar'
 *   });
 *   // '---\nfoo: bar\n---'
 *
 * @param {Object} token - `yaml` node.
 * @return {string} - Markdown YAML document.
 */
compilerPrototype.yaml = function (token) {
    var delimiter = repeat(DASH, YAML_FENCE_LENGTH);
    var value = token.value ? LINE + token.value : EMPTY;

    return delimiter + value + LINE + delimiter;
};

/**
 * Stringify a code block.
 *
 * Creates indented code when:
 *
 * - No language tag exists;
 * - Not in `fences: true` mode;
 * - A non-empty value exists.
 *
 * Otherwise, GFM fenced code is created:
 *
 *     ```js
 *     foo();
 *     ```
 *
 * When in ``fence: `~` `` mode, uses tildes as fences:
 *
 *     ~~~js
 *     foo();
 *     ~~~
 *
 * Knows about internal fences (Note: GitHub/Kramdown does
 * not support this):
 *
 *     ````javascript
 *     ```markdown
 *     foo
 *     ```
 *     ````
 *
 * Supports named entities in the language flag with
 * `settings.encode` mode.
 *
 * @example
 *   var compiler = new Compiler();
 *
 *   compiler.code({
 *     type: 'code',
 *     lang: 'js',
 *     value: 'fooo();'
 *   });
 *   // '```js\nfooo();\n```'
 *
 * @param {Object} token - `code` node.
 * @return {string} - Markdown code block.
 */
compilerPrototype.code = function (token) {
    var value = token.value;
    var marker = this.options.fence;
    var language = this.encode(token.lang || EMPTY, token);
    var fence;

    /*
     * Probably pedantic.
     */

    if (!language && !this.options.fences && value) {
        return pad(value, 1);
    }

    fence = getLongestRepetition(value, marker) + 1;

    fence = repeat(marker, Math.max(fence, MINIMUM_CODE_FENCE_LENGTH));

    return fence + language + LINE + value + LINE + fence;
};

/**
 * Stringify HTML.
 *
 * @example
 *   var compiler = new Compiler();
 *
 *   compiler.html({
 *     type: 'html',
 *     value: '<div>bar</div>'
 *   });
 *   // '<div>bar</div>'
 *
 * @param {Object} token - `html` node.
 * @return {string} - Markdown HTML.
 */
compilerPrototype.html = function (token) {
    return token.value;
};

/**
 * Stringify a horizontal rule.
 *
 * The character used is configurable by `rule`: (`'_'`)
 *
 *     ___
 *
 * The number of repititions is defined through
 * `ruleRepetition`: (`6`)
 *
 *     ******
 *
 * Whether spaces delimit each character, is configured
 * through `ruleSpaces`: (`true`)
 *
 *     * * *
 *
 * @example
 *   var compiler = new Compiler();
 *
 *   compiler.horizontalRule({
 *     type: 'horizontalRule'
 *   });
 *   // '***'
 *
 * @return {string} - Markdown rule.
 */
compilerPrototype.horizontalRule = function () {
    var options = this.options;
    var rule = repeat(options.rule, options.ruleRepetition);

    if (options.ruleSpaces) {
        rule = rule.split(EMPTY).join(SPACE);
    }

    return rule;
};

/**
 * Stringify a strong.
 *
 * The marker used is configurable by `strong`, which
 * defaults to an asterisk (`'*'`) but also accepts an
 * underscore (`'_'`):
 *
 *     _foo_
 *
 * @example
 *   var compiler = new Compiler();
 *
 *   compiler.strong({
 *     type: 'strong',
 *     children: [{
 *       type: 'text',
 *       value: 'Foo'
 *     }]
 *   });
 *   // '**Foo**'
 *
 * @param {Object} token - `strong` node.
 * @return {string} - Markdown strong-emphasised text.
 */
compilerPrototype.strong = function (token) {
    var marker = this.options.strong;

    marker = marker + marker;

    return marker + this.all(token).join(EMPTY) + marker;
};

/**
 * Stringify an emphasis.
 *
 * The marker used is configurable by `emphasis`, which
 * defaults to an underscore (`'_'`) but also accepts an
 * asterisk (`'*'`):
 *
 *     *foo*
 *
 * @example
 *   var compiler = new Compiler();
 *
 *   compiler.emphasis({
 *     type: 'emphasis',
 *     children: [{
 *       type: 'text',
 *       value: 'Foo'
 *     }]
 *   });
 *   // '_Foo_'
 *
 * @param {Object} token - `emphasis` node.
 * @return {string} - Markdown emphasised text.
 */
compilerPrototype.emphasis = function (token) {
    var marker = this.options.emphasis;

    return marker + this.all(token).join(EMPTY) + marker;
};

/**
 * Stringify a hard break.
 *
 * @example
 *   var compiler = new Compiler();
 *
 *   compiler.break({
 *     type: 'break'
 *   });
 *   // '  \n'
 *
 * @return {string} - Hard markdown break.
 */
compilerPrototype['break'] = function () {
    return SPACE + SPACE + LINE;
};

/**
 * Stringify a delete.
 *
 * @example
 *   var compiler = new Compiler();
 *
 *   compiler.delete({
 *     type: 'delete',
 *     children: [{
 *       type: 'text',
 *       value: 'Foo'
 *     }]
 *   });
 *   // '~~Foo~~'
 *
 * @param {Object} token - `delete` node.
 * @return {string} - Markdown strike-through.
 */
compilerPrototype['delete'] = function (token) {
    return DOUBLE_TILDE + this.all(token).join(EMPTY) + DOUBLE_TILDE;
};

/**
 * Stringify a link.
 *
 * When no title exists, the compiled `children` equal
 * `href`, and `href` starts with a protocol, an auto
 * link is created:
 *
 *     <http://example.com>
 *
 * Otherwise, is smart about enclosing `href` (see
 * `encloseURI()`) and `title` (see `encloseTitle()`).
 *
 *    [foo](<foo at bar dot com> 'An "example" e-mail')
 *
 * Supports named entities in the `href` and `title` when
 * in `settings.encode` mode.
 *
 * @example
 *   var compiler = new Compiler();
 *
 *   compiler.link({
 *     type: 'link',
 *     href: 'http://example.com',
 *     title: 'Example Domain',
 *     children: [{
 *       type: 'text',
 *       value: 'Foo'
 *     }]
 *   });
 *   // '[Foo](http://example.com "Example Domain")'
 *
 * @param {Object} token - `link` node.
 * @return {string} - Markdown link.
 */
compilerPrototype.link = function (token) {
    var self = this;
    var url = self.encode(token.href, token);
    var value = self.all(token).join(EMPTY);

    if (token.title === null && PROTOCOL.test(url) && (url === value || url === MAILTO + value)) {
        return encloseURI(url, true);
    }

    url = encloseURI(url);

    if (token.title) {
        url += SPACE + encloseTitle(self.encode(token.title, token));
    }

    value = SQUARE_BRACKET_OPEN + value + SQUARE_BRACKET_CLOSE;

    value += PARENTHESIS_OPEN + url + PARENTHESIS_CLOSE;

    return value;
};

/**
 * Stringify a link label.
 *
 * Because link references are easily, mistakingly,
 * created (for example, `[foo]`), reference nodes have
 * an extra property depicting how it looked in the
 * original document, so stringification can cause minimal
 * changes.
 *
 * @example
 *   label({
 *     type: 'referenceImage',
 *     referenceType: 'full',
 *     identifier: 'foo'
 *   });
 *   // '[foo]'
 *
 *   label({
 *     type: 'referenceImage',
 *     referenceType: 'collapsed',
 *     identifier: 'foo'
 *   });
 *   // '[]'
 *
 *   label({
 *     type: 'referenceImage',
 *     referenceType: 'shortcut',
 *     identifier: 'foo'
 *   });
 *   // ''
 *
 * @param {Object} token - `linkReference` or
 *   `imageReference` node.
 * @return {string} - Markdown label reference.
 */
function label(token) {
    var value = EMPTY;
    var type = token.referenceType;

    if (type === 'full') {
        value = token.identifier;
    }

    if (type !== 'shortcut') {
        value = SQUARE_BRACKET_OPEN + value + SQUARE_BRACKET_CLOSE;
    }

    return value;
}

/**
 * Stringify a link reference.
 *
 * See `label()` on how reference labels are created.
 *
 * @example
 *   var compiler = new Compiler();
 *
 *   compiler.linkReference({
 *     type: 'linkReference',
 *     referenceType: 'collapsed',
 *     identifier: 'foo',
 *     children: [{
 *       type: 'text',
 *       value: 'Foo'
 *     }]
 *   });
 *   // '[Foo][]'
 *
 * @param {Object} token - `linkReference` node.
 * @return {string} - Markdown link reference.
 */
compilerPrototype.linkReference = function (token) {
    return SQUARE_BRACKET_OPEN + this.all(token).join(EMPTY) + SQUARE_BRACKET_CLOSE + label(token);
};

/**
 * Stringify an image reference.
 *
 * See `label()` on how reference labels are created.
 *
 * Supports named entities in the `alt` when
 * in `settings.encode` mode.
 *
 * @example
 *   var compiler = new Compiler();
 *
 *   compiler.imageReference({
 *     type: 'imageReference',
 *     referenceType: 'full',
 *     identifier: 'foo',
 *     alt: 'Foo'
 *   });
 *   // '![Foo][foo]'
 *
 * @param {Object} token - `imageReference` node.
 * @return {string} - Markdown image reference.
 */
compilerPrototype.imageReference = function (token) {
    var alt = this.encode(token.alt, token);

    return EXCLAMATION_MARK + SQUARE_BRACKET_OPEN + alt + SQUARE_BRACKET_CLOSE + label(token);
};

/**
 * Stringify a footnote reference.
 *
 * @example
 *   var compiler = new Compiler();
 *
 *   compiler.footnoteReference({
 *     type: 'footnoteReference',
 *     identifier: 'foo'
 *   });
 *   // '[^foo]'
 *
 * @param {Object} token - `footnoteReference` node.
 * @return {string} - Markdown footnote reference.
 */
compilerPrototype.footnoteReference = function (token) {
    return SQUARE_BRACKET_OPEN + CARET + token.identifier + SQUARE_BRACKET_CLOSE;
};

/**
 * Stringify an link- or image definition.
 *
 * Is smart about enclosing `href` (see `encloseURI()`) and
 * `title` (see `encloseTitle()`).
 *
 *    [foo]: <foo at bar dot com> 'An "example" e-mail'
 *
 * @example
 *   var compiler = new Compiler();
 *
 *   compiler.definition({
 *     type: 'definition',
 *     link: 'http://example.com',
 *     title: 'Example Domain',
 *     identifier: 'foo'
 *   });
 *   // '[foo]: http://example.com "Example Domain"'
 *
 * @param {Object} token - `definition` node.
 * @return {string} - Markdown link- or image definition.
 */
compilerPrototype.definition = function (token) {
    var value = SQUARE_BRACKET_OPEN + token.identifier + SQUARE_BRACKET_CLOSE;
    var url = encloseURI(token.link);

    if (token.title) {
        url += SPACE + encloseTitle(token.title);
    }

    return value + COLON + SPACE + url;
};

/**
 * Stringify an image.
 *
 * Is smart about enclosing `href` (see `encloseURI()`) and
 * `title` (see `encloseTitle()`).
 *
 *    ![foo](</fav icon.png> 'My "favourite" icon')
 *
 * Supports named entities in `src`, `alt`, and `title`
 * when in `settings.encode` mode.
 *
 * @example
 *   var compiler = new Compiler();
 *
 *   compiler.image({
 *     type: 'image',
 *     href: 'http://example.png/favicon.png',
 *     title: 'Example Icon',
 *     alt: 'Foo'
 *   });
 *   // '![Foo](http://example.png/favicon.png "Example Icon")'
 *
 * @param {Object} token - `image` node.
 * @return {string} - Markdown image.
 */
compilerPrototype.image = function (token) {
    var encode = this.encode;
    var url = encloseURI(encode(token.src, token));
    var value;

    if (token.title) {
        url += SPACE + encloseTitle(encode(token.title, token));
    }

    value = EXCLAMATION_MARK + SQUARE_BRACKET_OPEN + encode(token.alt || EMPTY, token) + SQUARE_BRACKET_CLOSE;

    value += PARENTHESIS_OPEN + url + PARENTHESIS_CLOSE;

    return value;
};

/**
 * Stringify a footnote.
 *
 * @example
 *   var compiler = new Compiler();
 *
 *   compiler.footnote({
 *     type: 'footnote',
 *     children: [{
 *       type: 'text',
 *       value: 'Foo'
 *     }]
 *   });
 *   // '[^Foo]'
 *
 * @param {Object} token - `footnote` node.
 * @return {string} - Markdown footnote.
 */
compilerPrototype.footnote = function (token) {
    return SQUARE_BRACKET_OPEN + CARET + this.all(token).join(EMPTY) + SQUARE_BRACKET_CLOSE;
};

/**
 * Stringify a footnote definition.
 *
 * @example
 *   var compiler = new Compiler();
 *
 *   compiler.footnoteDefinition({
 *     type: 'footnoteDefinition',
 *     identifier: 'foo',
 *     children: [{
 *       type: 'paragraph',
 *       children: [{
 *         type: 'text',
 *         value: 'bar'
 *       }]
 *     }]
 *   });
 *   // '[^foo]: bar'
 *
 * @param {Object} token - `footnoteDefinition` node.
 * @return {string} - Markdown footnote definition.
 */
compilerPrototype.footnoteDefinition = function (token) {
    var id = token.identifier.toLowerCase();

    return SQUARE_BRACKET_OPEN + CARET + id + SQUARE_BRACKET_CLOSE + COLON + SPACE + this.all(token).join(BREAK + repeat(SPACE, INDENT));
};

/**
 * Stringify table.
 *
 * Creates a fenced table by default, but not in
 * `looseTable: true` mode:
 *
 *     Foo | Bar
 *     :-: | ---
 *     Baz | Qux
 *
 * NOTE: Be careful with `looseTable: true` mode, as a
 * loose table inside an indented code block on GitHub
 * renders as an actual table!
 *
 * Creates a spaces table by default, but not in
 * `spacedTable: false`:
 *
 *     |Foo|Bar|
 *     |:-:|---|
 *     |Baz|Qux|
 *
 * @example
 *   var compiler = new Compiler();
 *
 *   compiler.table({
 *     type: 'table',
 *     align: ['center', null],
 *     children: [
 *       {
 *         type: 'tableHeader',
 *         children: [
 *           {
 *             type: 'tableCell'
 *             children: [{
 *               type: 'text'
 *               value: 'Foo'
 *             }]
 *           },
 *           {
 *             type: 'tableCell'
 *             children: [{
 *               type: 'text'
 *               value: 'Bar'
 *             }]
 *           }
 *         ]
 *       },
 *       {
 *         type: 'tableRow',
 *         children: [
 *           {
 *             type: 'tableCell'
 *             children: [{
 *               type: 'text'
 *               value: 'Baz'
 *             }]
 *           },
 *           {
 *             type: 'tableCell'
 *             children: [{
 *               type: 'text'
 *               value: 'Qux'
 *             }]
 *           }
 *         ]
 *       }
 *     ]
 *   });
 *   // '| Foo | Bar |\n| :-: | --- |\n| Baz | Qux |'
 *
 * @param {Object} token - `table` node.
 * @return {string} - Markdown table.
 */
compilerPrototype.table = function (token) {
    var self = this;
    var loose = self.options.looseTable;
    var spaced = self.options.spacedTable;
    var rows = token.children;
    var index = rows.length;
    var result = [];
    var start;

    while (index--) {
        result[index] = self.all(rows[index]);
    }

    start = loose ? EMPTY : spaced ? PIPE + SPACE : PIPE;

    return table(result, {
        'align': token.align,
        'start': start,
        'end': start.split(EMPTY).reverse().join(EMPTY),
        'delimiter': spaced ? SPACE + PIPE + SPACE : PIPE
    });
};

/**
 * Stringify a table cell.
 *
 * @example
 *   var compiler = new Compiler();
 *
 *   compiler.tableCell({
 *     type: 'tableCell',
 *     children: [{
 *       type: 'text'
 *       value: 'Qux'
 *     }]
 *   });
 *   // 'Qux'
 *
 * @param {Object} token - `tableCell` node.
 * @return {string} - Markdown table cell.
 */
compilerPrototype.tableCell = function (token) {
    return this.all(token).join(EMPTY);
};

/**
 * Stringify an abstract syntax tree.
 *
 * @example
 *   stringify({
 *     type: 'strong',
 *     children: [{
 *       type: 'text',
 *       value: 'Foo'
 *     }]
 *   }, new File());
 *   // '**Foo**'
 *
 * @param {Object} ast - A node, most commonly, `root`.
 * @param {File} file - Virtual file.
 * @param {Object?} [options] - Passed to
 *   `Compiler#setOptions()`.
 * @return {string} - Markdown document.
 */
function stringify(ast, file, options) {
    var CustomCompiler = this.Compiler || Compiler;

    return new CustomCompiler(file, options).visit(ast);
}

/*
 * Expose `Compiler` on `stringify`.
 */

stringify.Compiler = Compiler;

/*
 * Expose `stringify` on `module.exports`.
 */

module.exports = stringify;
}, {"he":20,"markdown-table":24,"repeat-string":21,"./utilities.js":17,"./defaults.js":23}],
24: [function(require, module, exports) {
'use strict';

/*
 * Useful expressions.
 */

var EXPRESSION_DOT = /\./;
var EXPRESSION_LAST_DOT = /\.[^.]*$/;

/*
 * Allowed alignment values.
 */

var LEFT = 'l';
var RIGHT = 'r';
var CENTER = 'c';
var DOT = '.';
var NULL = '';

var ALLIGNMENT = [LEFT, RIGHT, CENTER, DOT, NULL];

/*
 * Characters.
 */

var COLON = ':';
var DASH = '-';
var PIPE = '|';
var SPACE = ' ';
var NEW_LINE = '\n';

/**
 * Get the length of `value`.
 *
 * @param {string} value
 * @return {number}
 */
function lengthNoop(value) {
    return String(value).length;
}

/**
 * Get a string consisting of `length` `character`s.
 *
 * @param {number} length
 * @param {string} [character=' ']
 * @return {string}
 */
function pad(length, character) {
    return Array(length + 1).join(character || SPACE);
}

/**
 * Get the position of the last dot in `value`.
 *
 * @param {string} value
 * @return {number}
 */
function dotindex(value) {
    var match = EXPRESSION_LAST_DOT.exec(value);

    return match ? match.index + 1 : value.length;
}

/**
 * Create a table from a matrix of strings.
 *
 * @param {Array.<Array.<string>>} table
 * @param {Object?} options
 * @param {boolean?} [options.rule=true]
 * @param {string?} [options.delimiter=" | "]
 * @param {string?} [options.start="| "]
 * @param {string?} [options.end=" |"]
 * @param {Array.<string>?} options.align
 * @param {function(string)?} options.stringLength
 * @return {string} Pretty table
 */
function markdownTable(table, options) {
    var settings = options || {};
    var delimiter = settings.delimiter;
    var start = settings.start;
    var end = settings.end;
    var alignment = settings.align;
    var calculateStringLength = settings.stringLength || lengthNoop;
    var cellCount = 0;
    var rowIndex = -1;
    var rowLength = table.length;
    var sizes = [];
    var align;
    var rule;
    var rows;
    var row;
    var cells;
    var index;
    var position;
    var size;
    var value;
    var spacing;
    var before;
    var after;

    alignment = alignment ? alignment.concat() : [];

    if (delimiter === null || delimiter === undefined) {
        delimiter = SPACE + PIPE + SPACE;
    }

    if (start === null || start === undefined) {
        start = PIPE + SPACE;
    }

    if (end === null || end === undefined) {
        end = SPACE + PIPE;
    }

    while (++rowIndex < rowLength) {
        row = table[rowIndex];

        index = -1;

        if (row.length > cellCount) {
            cellCount = row.length;
        }

        while (++index < cellCount) {
            position = row[index] ? dotindex(row[index]) : null;

            if (!sizes[index]) {
                sizes[index] = 3;
            }

            if (position > sizes[index]) {
                sizes[index] = position;
            }
        }
    }

    if (typeof alignment === 'string') {
        alignment = pad(cellCount, alignment).split('');
    }

    /*
     * Make sure only valid alignments are used.
     */

    index = -1;

    while (++index < cellCount) {
        align = alignment[index];

        if (typeof align === 'string') {
            align = align.charAt(0).toLowerCase();
        }

        if (ALLIGNMENT.indexOf(align) === -1) {
            align = NULL;
        }

        alignment[index] = align;
    }

    rowIndex = -1;
    rows = [];

    while (++rowIndex < rowLength) {
        row = table[rowIndex];

        index = -1;
        cells = [];

        while (++index < cellCount) {
            value = row[index];

            if (value === null || value === undefined) {
                value = '';
            } else {
                value = String(value);
            }

            if (alignment[index] !== DOT) {
                cells[index] = value;
            } else {
                position = dotindex(value);

                size = sizes[index] + (EXPRESSION_DOT.test(value) ? 0 : 1) - (calculateStringLength(value) - position);

                cells[index] = value + pad(size - 1);
            }
        }

        rows[rowIndex] = cells;
    }

    sizes = [];
    rowIndex = -1;

    while (++rowIndex < rowLength) {
        cells = rows[rowIndex];

        index = -1;

        while (++index < cellCount) {
            value = cells[index];

            if (!sizes[index]) {
                sizes[index] = 3;
            }

            size = calculateStringLength(value);

            if (size > sizes[index]) {
                sizes[index] = size;
            }
        }
    }

    rowIndex = -1;

    while (++rowIndex < rowLength) {
        cells = rows[rowIndex];

        index = -1;

        while (++index < cellCount) {
            value = cells[index];

            position = sizes[index] - (calculateStringLength(value) || 0);
            spacing = pad(position);

            if (alignment[index] === RIGHT || alignment[index] === DOT) {
                value = spacing + value;
            } else if (alignment[index] !== CENTER) {
                value = value + spacing;
            } else {
                position = position / 2;

                if (position % 1 === 0) {
                    before = position;
                    after = position;
                } else {
                    before = position + 0.5;
                    after = position - 0.5;
                }

                value = pad(before) + value + pad(after);
            }

            cells[index] = value;
        }

        rows[rowIndex] = cells.join(delimiter);
    }

    if (settings.rule !== false) {
        index = -1;
        rule = [];

        while (++index < cellCount) {
            align = alignment[index];

            /*
             * When `align` is left, don't add colons.
             */

            value = align === RIGHT || align === NULL ? DASH : COLON;
            value += pad(sizes[index] - 2, DASH);
            value += align !== LEFT && align !== NULL ? COLON : DASH;

            rule[index] = value;
        }

        rows.splice(1, 0, rule.join(delimiter));
    }

    return start + rows.join(end + NEW_LINE + start) + end;
}

/*
 * Expose `markdownTable`.
 */

module.exports = markdownTable;
}, {}],
16: [function(require, module, exports) {
/**
 * @author Titus Wormer
 * @copyright 2015 Titus Wormer. All rights reserved.
 * @module File
 * @fileoverview Virtual file format to attach additional
 *   information related to the processed input.  Similar
 *   to`wearefractal/vinyl`.  Additionally, File can be
 *   passed directly to an ESLint formatter to visualise
 *   warnings and errors relating to a file.
 */

'use strict';

/**
 * ESLint's formatter API expects `filePath` to be a
 * string.  This hack supports invocation as well as
 * implicit coercion.
 *
 * @example
 *   var file = new File();
 *   filePath = filePathFactory(file);
 *
 * @param {File} file
 * @return {Function}
 */
function filePathFactory(file) {
    /**
     * Get the location of `file`.
     *
     * Returns empty string when without `filename`.
     *
     * @example
     *   var file = new File({
     *     'directory': '~',
     *     'filename': 'example',
     *     'extension': 'markdown'
     *   });
     *
     *   String(file.filePath); // ~/example.markdown
     *   file.filePath() // ~/example.markdown
     *
     * @property {Function} toString - Itself.
     * @return {string}
     */
    function filePath() {
        var directory;

        if (file.filename) {
            directory = file.directory;

            if (directory.charAt(directory.length - 1) === '/') {
                directory = directory.slice(0, -1);
            }

            if (directory === '.') {
                directory = '';
            }

            return (directory ? directory + '/' : '') + file.filename + (file.extension ? '.' + file.extension : '');
        }

        return '';
    }

    filePath.toString = filePath;

    return filePath;
}

/**
 * Construct a new file.
 *
 * @example
 *   var file = new File({
 *     'directory': '~',
 *     'filename': 'example',
 *     'extension': 'markdown',
 *     'contents': 'Foo *bar* baz'
 *   });
 *
 *   file === File(file) // true
 *   file === new File(file) // true
 *   File('foo') instanceof File // true
 *
 * @constructor
 * @class {File}
 * @param {Object|File|string} [options] - either an
 *   options object, or the value of `contents` (both
 *   optional).  When a `file` is passed in, it's
 *   immediately returned.
 */
function File(options) {
    var self = this;

    if (!(self instanceof File)) {
        return new File(options);
    }

    if (options instanceof File) {
        return options;
    }

    if (!options) {
        options = {};
    } else if (typeof options === 'string') {
        options = {
            'contents': options
        };
    }

    self.filename = options.filename || null;
    self.contents = options.contents || '';

    self.directory = options.directory === undefined ? '' : options.directory;

    self.extension = options.extension === undefined ? 'md' : options.extension;

    self.messages = [];

    /*
     * Make sure eslint’s formatters stringify `filePath`
     * properly.
     */

    self.filePath = filePathFactory(self);
}

/**
 * Move a file by passing a new directory, filename,
 * and extension.  When these are not given, the default
 * values are kept.
 *
 * @example
 *   var file = new File({
 *     'directory': '~',
 *     'filename': 'example',
 *     'extension': 'markdown',
 *     'contents': 'Foo *bar* baz'
 *   });
 *
 *   file.move({'directory': '/var/www'});
 *   file.filePath(); // '/var/www/example.markdown'
 *
 *   file.move({'extension': 'md'});
 *   file.filePath(); // '/var/www/example.md'
 *
 * @this {File}
 * @param {Object} options
 */
function move(options) {
    var self = this;

    if (!options) {
        options = {};
    }

    self.directory = options.directory || self.directory || '';
    self.filename = options.filename || self.filename || null;
    self.extension = options.extension || self.extension || 'md';
}

/**
 * Stringify a position.
 *
 * @example
 *   stringify({'line': 1, 'column': 3}) // '1:3'
 *   stringify({'line': 1}) // '1:1'
 *   stringify({'column': 3}) // '1:3'
 *   stringify() // '1:1'
 *
 * @param {Object?} [position] - Single position, like
 *   those available at `node.position.start`.
 * @return {string}
 */
function stringify(position) {
    if (!position) {
        position = {};
    }

    return (position.line || 1) + ':' + (position.column || 1);
}

/**
 * Warn.
 *
 * Creates an exception (see `File#exception()`),
 * sets `fatal: false`, and adds it to the file's
 * `messages` list.
 *
 * @example
 *   var file = new File();
 *   file.warn('Something went wrong');
 *
 * @this {File}
 * @param {string|Error} reason - Reason for warning.
 * @param {Node|Location|Position} [position] - Location
 *   of warning in file.
 * @return {Error}
 */
function warn(reason, position) {
    var err = this.exception(reason, position);

    err.fatal = false;

    this.messages.push(err);

    return err;
}

/**
 * Fail.
 *
 * Creates an exception (see `File#exception()`),
 * sets `fatal: true`, adds it to the file's
 * `messages` list.  If `quiet` is not true,
 * throws the error.
 *
 * @example
 *   var file = new File();
 *   file.fail('Something went wrong'); // throws
 *
 * @this {File}
 * @throws {Error} - When not `quiet: true`.
 * @param {string|Error} reason - Reason for failure.
 * @param {Node|Location|Position} [position] - Location
 *   of failure in file.
 * @return {Error} - Unless thrown, of course.
 */
function fail(reason, position) {
    var err = this.exception(reason, position);

    err.fatal = true;

    this.messages.push(err);

    if (!this.quiet) {
        throw err;
    }

    return err;
}

/**
 * Create a pretty exception with `reason` at `position`.
 * When an error is passed in as `reason`, copies the
 * stack.  This does not add a message to `messages`.
 *
 * @example
 *   var file = new File();
 *   var err = file.exception('Something went wrong');
 *
 * @this {File}
 * @param {string|Error} reason - Reason for message.
 * @param {Node|Location|Position} [position] - Location
 *   of message in file.
 * @return {Error} - An object including file information,
 *   line and column indices.
 */
function exception(reason, position) {
    var file = this.filePath();
    var message = reason.message || reason;
    var location;
    var err;

    /*
     * Node / location / position.
     */

    if (position && position.position) {
        position = position.position;
    }

    if (position && position.start) {
        location = stringify(position.start) + '-' + stringify(position.end);
        position = position.start;
    } else {
        location = stringify(position);
    }

    err = new Error(message);

    err.name = (file ? file + ':' : '') + location;
    err.file = file;
    err.reason = message;
    err.line = position ? position.line : null;
    err.column = position ? position.column : null;

    if (reason.stack) {
        err.stack = reason.stack;
    }

    return err;
}

/**
 * Check if `file` has a fatal message.
 *
 * @example
 *   var file = new File();
 *   file.quiet = true;
 *   file.hasFailed; // false
 *
 *   file.fail('Something went wrong');
 *   file.hasFailed; // true
 *
 * @this {File}
 * @return {boolean}
 */
function hasFailed() {
    var messages = this.messages;
    var index = -1;
    var length = messages.length;

    while (++index < length) {
        if (messages[index].fatal) {
            return true;
        }
    }

    return false;
}

/**
 * Create a string representation of `file`.
 *
 * @example
 *   var file = new File('Foo');
 *   String(file); // 'Foo'
 *
 * @this {File}
 * @return {string} - value at the `contents` property
 *   in context.
 */
function toString() {
    return this.contents;
}

/*
 * Methods.
 */

File.prototype.move = move;
File.prototype.exception = exception;
File.prototype.toString = toString;
File.prototype.warn = warn;
File.prototype.fail = fail;
File.prototype.hasFailed = hasFailed;

/*
 * Expose.
 */

module.exports = File;
}, {}],
3: [function(require, module, exports) {
/**
 * @author Titus Wormer
 * @copyright 2015 Titus Wormer
 * @license MIT
 * @module mdast:range
 * @fileoverview Patch index-based range on mdast nodes.
 */

'use strict';

/* eslint-env commonjs */

/*
 * Dependencies.
 */

var visit = require('unist-util-visit');

/**
 * Calculate offsets for `lines`.
 *
 * @param {Array.<string>} lines - Lines to compile.
 * @return {Array.<number>}
 */
function toOffsets(lines) {
    var total = 0;
    var index = -1;
    var length = lines.length;
    var result = [];

    while (++index < length) {
        result[index] = total += lines[index].length + 1;
    }

    return result;
}

/**
 * Add an offset based on `offsets` to `position`.
 *
 * @param {Object} position - Position.
 */
function addRange(position, fn) {
    position.offset = fn(position);
}

/**
 * Factory to reverse an offset into a line--column
 * tuple.
 *
 * @param {Array.<number>} offsets - Offsets, as returned
 *   by `toOffsets()`.
 * @return {Function} - Bound method.
 */
function positionToOffsetFactory(offsets) {
    /**
     * Calculate offsets for `lines`.
     *
     * @param {Object} position - Position.
     * @return {Object} - Object with `line` and `colymn`
     *   properties based on the bound `offsets`.
     */
    function positionToOffset(position) {
        var line = position && position.line;
        var column = position && position.column;

        if (!isNaN(line) && !isNaN(column)) {
            return (offsets[line - 2] || 0) + column - 1 || 0;
        }

        return -1;
    }

    return positionToOffset;
}

/**
 * Factory to reverse an offset into a line--column
 * tuple.
 *
 * @param {Array.<number>} offsets - Offsets, as returned
 *   by `toOffsets()`.
 * @return {Function} - Bound method.
 */
function offsetToPositionFactory(offsets) {
    /**
     * Calculate offsets for `lines`.
     *
     * @param {number} offset - Offset.
     * @return {Object} - Object with `line` and `colymn`
     *   properties based on the bound `offsets`.
     */
    function offsetToPosition(offset) {
        var index = -1;
        var length = offsets.length;

        if (offset < 0) {
            return {};
        }

        while (++index < length) {
            if (offsets[index] > offset) {
                return {
                    'line': index + 1,
                    'column': offset - (offsets[index - 1] || 0) + 1
                };
            }
        }

        return {};
    }

    return offsetToPosition;
}

/**
 * Add ranges for `ast`.
 *
 * @param {Node} ast - Context to patch.
 * @param {VFile} file - Virtual file.
 */
function transformer(ast, file) {
    var contents = String(file).split('\n');
    var positionToOffset;

    /*
     * Invalid.
     */

    if (!file || typeof file.contents !== 'string') {
        throw new Error('Missing `file` for mdast-range');
    }

    /*
     * Construct.
     */

    contents = toOffsets(contents);
    positionToOffset = positionToOffsetFactory(contents);

    /*
     * Expose methods.
     */

    file.offsetToPosition = offsetToPositionFactory(contents);
    file.positionToOffset = positionToOffset;

    /*
     * Add `offset` on both `start` and `end`.
     */

    visit(ast, function (node) {
        var position = node.position;

        if (position && position.start) {
            addRange(position.start, positionToOffset);
        }

        if (position && position.end) {
            addRange(position.end, positionToOffset);
        }
    });
}

/**
 * Attacher.
 *
 * @return {Function} - `transformer`.
 */
function attacher() {
    return transformer;
}

/*
 * Expose.
 */

module.exports = attacher;
}, {"unist-util-visit":25}],
25: [function(require, module, exports) {
/**
 * @author Titus Wormer
 * @copyright 2015 Titus Wormer. All rights reserved.
 * @module unist:util:visit
 * @fileoverview Utility to recursively walk over unist nodes.
 */

'use strict';

/**
 * Walk forwards.
 *
 * @param {Array.<*>} values - Things to iterate over,
 *   forwards.
 * @param {function(*, number): boolean} callback - Function
 *   to invoke.
 * @return {boolean} - False if iteration stopped.
 */
function forwards(values, callback) {
    var index = -1;
    var length = values.length;

    while (++index < length) {
        if (callback(values[index], index) === false) {
            return false;
        }
    }

    return true;
}

/**
 * Walk backwards.
 *
 * @param {Array.<*>} values - Things to iterate over,
 *   backwards.
 * @param {function(*, number): boolean} callback - Function
 *   to invoke.
 * @return {boolean} - False if iteration stopped.
 */
function backwards(values, callback) {
    var index = values.length;
    var length = -1;

    while (--index > length) {
        if (callback(values[index], index) === false) {
            return false;
        }
    }

    return true;
}

/**
 * Visit.
 *
 * @param {Node} tree - Root node
 * @param {string} [type] - Node type.
 * @param {function(node): boolean?} callback - Invoked
 *   with each found node.  Can return `false` to stop.
 * @param {boolean} [reverse] - By default, `visit` will
 *   walk forwards, when `reverse` is `true`, `visit`
 *   walks backwards.
 */
function visit(tree, type, callback, reverse) {
    var iterate;
    var one;
    var all;

    if (typeof type === 'function') {
        reverse = callback;
        callback = type;
        type = null;
    }

    iterate = reverse ? backwards : forwards;

    /**
     * Visit `children` in `parent`.
     */
    all = function (children, parent) {
        return iterate(children, function (child, index) {
            return child && one(child, index, parent);
        });
    };

    /**
     * Visit a single node.
     */
    one = function (node, index, parent) {
        var result;

        index = index || (parent ? 0 : null);

        if (!type || node.type === type) {
            result = callback(node, index, parent || null);
        }

        if (node.children && result !== false) {
            return all(node.children, node);
        }

        return result;
    };

    one(tree);
}

/*
 * Expose.
 */

module.exports = visit;
}, {}],
4: [function(require, module, exports) {
/**
 * @author Titus Wormer
 * @copyright 2015 Titus Wormer
 * @license MIT
 * @module vfile
 * @fileoverview Virtual file format to attach additional
 *   information related to processed input.  Similar to
 *   `wearefractal/vinyl`.  Additionally, `VFile` can be
 *   passed directly to ESLint formatters to visualise
 *   warnings and errors relating to a file.
 * @example
 *   var VFile = require('vfile');
 *
 *   var file = new VFile({
 *     'directory': '~',
 *     'filename': 'example',
 *     'extension': 'txt',
 *     'contents': 'Foo *bar* baz'
 *   });
 *
 *   file.toString(); // 'Foo *bar* baz'
 *   file.filePath(); // '~/example.txt'
 *
 *   file.move({'extension': 'md'});
 *   file.filePath(); // '~/example.md'
 *
 *   file.warn('Something went wrong', {'line': 2, 'column': 3});
 *   // { [~/example.md:2:3: Something went wrong]
 *   //   name: '~/example.md:2:3',
 *   //   file: '~/example.md',
 *   //   reason: 'Something went wrong',
 *   //   line: 2,
 *   //   column: 3,
 *   //   fatal: false }
 */

'use strict';

var SEPARATOR = '/';

try {
    SEPARATOR = require('pa' + 'th').sep;
} catch (e) {} /* empty */

/**
 * File-related message with location information.
 *
 * @typedef {Error} VFileMessage
 * @property {string} name - (Starting) location of the
 *   message, preceded by its file-path when available,
 *   and joined by `:`. Used internally by the native
 *   `Error#toString()`.
 * @property {string} file - File-path.
 * @property {string} reason - Reason for message.
 * @property {number?} line - Line of message, when
 *   available.
 * @property {number?} column - Column of message, when
 *   available.
 * @property {string?} stack - Stack of message, when
 *   available.
 * @property {boolean?} fatal - Whether the associated file
 *   is still processable.
 */

/**
 * Stringify a position.
 *
 * @example
 *   stringify({'line': 1, 'column': 3}) // '1:3'
 *   stringify({'line': 1}) // '1:1'
 *   stringify({'column': 3}) // '1:3'
 *   stringify() // '1:1'
 *
 * @private
 * @param {Object?} [position] - Single position, like
 *   those available at `node.position.start`.
 * @return {string}
 */
function stringify(position) {
    if (!position) {
        position = {};
    }

    return (position.line || 1) + ':' + (position.column || 1);
}

/**
 * ESLint's formatter API expects `filePath` to be a
 * string.  This hack supports invocation as well as
 * implicit coercion.
 *
 * @example
 *   var file = new VFile({
 *     'filename': 'example',
 *     'extension': 'txt'
 *   });
 *
 *   filePath = filePathFactory(file);
 *
 *   String(filePath); // 'example.txt'
 *   filePath(); // 'example.txt'
 *
 * @private
 * @param {VFile} file - Virtual file.
 * @return {Function}
 */
function filePathFactory(file) {
    /**
     * Get the filename, with extension and directory, if applicable.
     *
     * @example
     *   var file = new VFile({
     *     'directory': '~',
     *     'filename': 'example',
     *     'extension': 'txt'
     *   });
     *
     *   String(file.filePath); // ~/example.txt
     *   file.filePath() // ~/example.txt
     *
     * @memberof {VFile}
     * @property {Function} toString - Itself. ESLint's
     *   formatter API expects `filePath` to be `string`.
     *   This hack supports invocation as well as implicit
     *   coercion.
     * @return {string} - If the `vFile` has a `filename`,
     *   it will be prefixed with the directory (slashed),
     *   if applicable, and suffixed with the (dotted)
     *   extension (if applicable).  Otherwise, an empty
     *   string is returned.
     */
    function filePath() {
        var directory = file.directory;
        var separator;

        if (file.filename || file.extension) {
            separator = directory.charAt(directory.length - 1);

            if (separator === '/' || separator === '\\') {
                directory = directory.slice(0, -1);
            }

            if (directory === '.') {
                directory = '';
            }

            return (directory ? directory + SEPARATOR : '') + file.filename + (file.extension ? '.' + file.extension : '');
        }

        return '';
    }

    filePath.toString = filePath;

    return filePath;
}

/**
 * Construct a new file.
 *
 * @example
 *   var file = new VFile({
 *     'directory': '~',
 *     'filename': 'example',
 *     'extension': 'txt',
 *     'contents': 'Foo *bar* baz'
 *   });
 *
 *   file === VFile(file) // true
 *   file === new VFile(file) // true
 *   VFile('foo') instanceof VFile // true
 *
 * @constructor
 * @class {VFile}
 * @param {Object|VFile|string} [options] - either an
 *   options object, or the value of `contents` (both
 *   optional).  When a `file` is passed in, it's
 *   immediately returned.
 * @property {string} [contents=''] - Content of file.
 * @property {string} [directory=''] - Path to parent
 *   directory.
 * @property {string} [filename=''] - Filename.
 *   A file-path can still be generated when no filename
 *   exists.
 * @property {string} [extension=''] - Extension.
 *   A file-path can still be generated when no extension
 *   exists.
 * @property {boolean?} quiet - Whether an error created by
 *   `VFile#fail()` is returned (when truthy) or thrown
 *   (when falsey). Ensure all `messages` associated with
 *   a file are handled properly when setting this to
 *   `true`.
 * @property {Array.<VFileMessage>} messages - List of associated
 *   messages.
 */
function VFile(options) {
    var self = this;

    /*
     * No `new` operator.
     */

    if (!(self instanceof VFile)) {
        return new VFile(options);
    }

    /*
     * Given file.
     */

    if (options && typeof options.message === 'function' && typeof options.hasFailed === 'function') {
        return options;
    }

    if (!options) {
        options = {};
    } else if (typeof options === 'string') {
        options = {
            'contents': options
        };
    }

    self.contents = options.contents || '';

    self.messages = [];

    /*
     * Make sure eslint’s formatters stringify `filePath`
     * properly.
     */

    self.filePath = filePathFactory(self);

    self.history = [];

    self.move({
        'filename': options.filename,
        'directory': options.directory,
        'extension': options.extension
    });
}

/**
 * Get the value of the file.
 *
 * @example
 *   var vFile = new VFile('Foo');
 *   String(vFile); // 'Foo'
 *
 * @this {VFile}
 * @memberof {VFile}
 * @return {string} - value at the `contents` property
 *   in context.
 */
function toString() {
    return this.contents;
}

/**
 * Move a file by passing a new directory, filename,
 * and extension.  When these are not given, the default
 * values are kept.
 *
 * @example
 *   var file = new VFile({
 *     'directory': '~',
 *     'filename': 'example',
 *     'extension': 'txt',
 *     'contents': 'Foo *bar* baz'
 *   });
 *
 *   file.move({'directory': '/var/www'});
 *   file.filePath(); // '/var/www/example.txt'
 *
 *   file.move({'extension': 'md'});
 *   file.filePath(); // '/var/www/example.md'
 *
 * @this {VFile}
 * @memberof {VFile}
 * @param {Object?} [options] - Configuration.
 * @return {VFile} - Context object.
 */
function move(options) {
    var self = this;
    var before = self.filePath();
    var after;

    if (!options) {
        options = {};
    }

    self.directory = options.directory || self.directory || '';
    self.filename = options.filename || self.filename || '';
    self.extension = options.extension || self.extension || '';

    after = self.filePath();

    if (after && before !== after) {
        self.history.push(after);
    }

    return self;
}

/**
 * Create a message with `reason` at `position`.
 * When an error is passed in as `reason`, copies the
 * stack.  This does not add a message to `messages`.
 *
 * @example
 *   var file = new VFile();
 *
 *   file.message('Something went wrong');
 *   // { [1:1: Something went wrong]
 *   //   name: '1:1',
 *   //   file: '',
 *   //   reason: 'Something went wrong',
 *   //   line: null,
 *   //   column: null }
 *
 * @this {VFile}
 * @memberof {VFile}
 * @param {string|Error} reason - Reason for message.
 * @param {Node|Location|Position} [position] - Location
 *   of message in file.
 * @return {VFileMessage} - File-related message with
 *   location information.
 */
function message(reason, position) {
    var filePath = this.filePath();
    var range;
    var err;
    var location = {
        'start': {
            'line': null,
            'column': null
        },
        'end': {
            'line': null,
            'column': null
        }
    };

    /*
     * Node / location / position.
     */

    if (position && position.position) {
        position = position.position;
    }

    if (position && position.start) {
        range = stringify(position.start) + '-' + stringify(position.end);
        location = position;
        position = position.start;
    } else {
        range = stringify(position);

        if (position) {
            location.start = position;
            location.end.line = null;
            location.end.column = null;
        }
    }

    err = new Error(reason.message || reason);

    err.name = (filePath ? filePath + ':' : '') + range;
    err.file = filePath;
    err.reason = reason.message || reason;
    err.line = position ? position.line : null;
    err.column = position ? position.column : null;
    err.location = location;

    if (reason.stack) {
        err.stack = reason.stack;
    }

    return err;
}

/**
 * Warn. Creates a non-fatal message (see `VFile#message()`),
 * and adds it to the file's `messages` list.
 *
 * @example
 *   var file = new VFile();
 *
 *   file.warn('Something went wrong');
 *   // { [1:1: Something went wrong]
 *   //   name: '1:1',
 *   //   file: '',
 *   //   reason: 'Something went wrong',
 *   //   line: null,
 *   //   column: null,
 *   //   fatal: false }
 *
 * @see VFile#message
 * @this {VFile}
 * @memberof {VFile}
 */
function warn() {
    var err = this.message.apply(this, arguments);

    err.fatal = false;

    this.messages.push(err);

    return err;
}

/**
 * Fail. Creates a fatal message (see `VFile#message()`),
 * sets `fatal: true`, adds it to the file's
 * `messages` list.
 *
 * If `quiet` is not `true`, throws the error.
 *
 * @example
 *   var file = new VFile();
 *
 *   file.fail('Something went wrong');
 *   // 1:1: Something went wrong
 *   //     at VFile.exception (vfile/index.js:296:11)
 *   //     at VFile.fail (vfile/index.js:360:20)
 *   //     at repl:1:6
 *
 *   file.quiet = true;
 *   file.fail('Something went wrong');
 *   // { [1:1: Something went wrong]
 *   //   name: '1:1',
 *   //   file: '',
 *   //   reason: 'Something went wrong',
 *   //   line: null,
 *   //   column: null,
 *   //   fatal: true }
 *
 * @this {VFile}
 * @memberof {VFile}
 * @throws {VFileMessage} - When not `quiet: true`.
 * @param {string|Error} reason - Reason for failure.
 * @param {Node|Location|Position} [position] - Place
 *   of failure in file.
 * @return {VFileMessage} - Unless thrown, of course.
 */
function fail(reason, position) {
    var err = this.message(reason, position);

    err.fatal = true;

    this.messages.push(err);

    if (!this.quiet) {
        throw err;
    }

    return err;
}

/**
 * Check if a fatal message occurred making the file no
 * longer processable.
 *
 * @example
 *   var file = new VFile();
 *   file.quiet = true;
 *
 *   file.hasFailed(); // false
 *
 *   file.fail('Something went wrong');
 *   file.hasFailed(); // true
 *
 * @this {VFile}
 * @memberof {VFile}
 * @return {boolean} - `true` if at least one of file's
 *   `messages` has a `fatal` property set to `true`
 */
function hasFailed() {
    var messages = this.messages;
    var index = -1;
    var length = messages.length;

    while (++index < length) {
        if (messages[index].fatal) {
            return true;
        }
    }

    return false;
}

/**
 * Access metadata.
 *
 * @example
 *   var file = new VFile('Foo');
 *
 *   file.namespace('foo').bar = 'baz';
 *
 *   console.log(file.namespace('foo').bar) // 'baz';
 *
 * @this {VFile}
 * @memberof {VFile}
 * @param {string} key - Namespace key.
 * @return {Object} - Private space.
 */
function namespace(key) {
    var self = this;
    var space = self.data;

    if (!space) {
        space = self.data = {};
    }

    if (!space[key]) {
        space[key] = {};
    }

    return space[key];
}

/*
 * Methods.
 */

var vFilePrototype = VFile.prototype;

vFilePrototype.move = move;
vFilePrototype.toString = toString;
vFilePrototype.message = message;
vFilePrototype.warn = warn;
vFilePrototype.fail = fail;
vFilePrototype.hasFailed = hasFailed;
vFilePrototype.namespace = namespace;

/*
 * Expose.
 */

module.exports = VFile;
}, {}],
5: [function(require, module, exports) {

/**
 * Module dependencies.
 */

'use strict';

var now = require('date-now');

/**
 * Returns a function, that, as long as it continues to be invoked, will not
 * be triggered. The function will be called after it stops being called for
 * N milliseconds. If `immediate` is passed, trigger the function on the
 * leading edge, instead of the trailing.
 *
 * @source underscore.js
 * @see http://unscriptable.com/2009/03/20/debouncing-javascript-methods/
 * @param {Function} function to wrap
 * @param {Number} timeout in ms (`100`)
 * @param {Boolean} whether to execute at the beginning (`false`)
 * @api public
 */

module.exports = function debounce(func, wait, immediate) {
  var timeout, args, context, timestamp, result;
  if (null == wait) wait = 100;

  function later() {
    var last = now() - timestamp;

    if (last < wait && last > 0) {
      timeout = setTimeout(later, wait - last);
    } else {
      timeout = null;
      if (!immediate) {
        result = func.apply(context, args);
        if (!timeout) context = args = null;
      }
    }
  };

  return function debounced() {
    context = this;
    args = arguments;
    timestamp = now();
    var callNow = immediate && !timeout;
    if (!timeout) timeout = setTimeout(later, wait);
    if (callNow) {
      result = func.apply(context, args);
      context = args = null;
    }

    return result;
  };
};
}, {"date-now":26}],
26: [function(require, module, exports) {
"use strict";

module.exports = Date.now || now;

function now() {
    return new Date().getTime();
}
}, {}],
6: [function(require, module, exports) {
/* eslint-disable no-unused-vars */
'use strict';
var hasOwnProperty = Object.prototype.hasOwnProperty;
var propIsEnumerable = Object.prototype.propertyIsEnumerable;

function toObject(val) {
	if (val === null || val === undefined) {
		throw new TypeError('Object.assign cannot be called with null or undefined');
	}

	return Object(val);
}

module.exports = Object.assign || function (target, source) {
	var from;
	var to = toObject(target);
	var symbols;

	for (var s = 1; s < arguments.length; s++) {
		from = Object(arguments[s]);

		for (var key in from) {
			if (hasOwnProperty.call(from, key)) {
				to[key] = from[key];
			}
		}

		if (Object.getOwnPropertySymbols) {
			symbols = Object.getOwnPropertySymbols(from);
			for (var i = 0; i < symbols.length; i++) {
				if (propIsEnumerable.call(from, symbols[i])) {
					to[symbols[i]] = from[symbols[i]];
				}
			}
		}
	}

	return to;
};
}, {}],
7: [function(require, module, exports) {
// Source: http://jsfiddle.net/vWx8V/
// http://stackoverflow.com/questions/5603195/full-list-of-javascript-keycodes

/**
 * Conenience method returns corresponding value for given keyName or keyCode.
 *
 * @param {Mixed} keyCode {Number} or keyName {String}
 * @return {Mixed}
 * @api public
 */

'use strict';

exports = module.exports = function (searchInput) {
  // Keyboard Events
  if (searchInput && 'object' === typeof searchInput) {
    var hasKeyCode = searchInput.which || searchInput.keyCode || searchInput.charCode;
    if (hasKeyCode) searchInput = hasKeyCode;
  }

  // Numbers
  if ('number' === typeof searchInput) return names[searchInput];

  // Everything else (cast to string)
  var search = String(searchInput);

  // check codes
  var foundNamedKey = codes[search.toLowerCase()];
  if (foundNamedKey) return foundNamedKey;

  // check aliases
  var foundNamedKey = aliases[search.toLowerCase()];
  if (foundNamedKey) return foundNamedKey;

  // weird character?
  if (search.length === 1) return search.charCodeAt(0);

  return undefined;
};

/**
 * Get by name
 *
 *   exports.code['enter'] // => 13
 */

var codes = exports.code = exports.codes = {
  'backspace': 8,
  'tab': 9,
  'enter': 13,
  'shift': 16,
  'ctrl': 17,
  'alt': 18,
  'pause/break': 19,
  'caps lock': 20,
  'esc': 27,
  'space': 32,
  'page up': 33,
  'page down': 34,
  'end': 35,
  'home': 36,
  'left': 37,
  'up': 38,
  'right': 39,
  'down': 40,
  'insert': 45,
  'delete': 46,
  'command': 91,
  'right click': 93,
  'numpad *': 106,
  'numpad +': 107,
  'numpad -': 109,
  'numpad .': 110,
  'numpad /': 111,
  'num lock': 144,
  'scroll lock': 145,
  'my computer': 182,
  'my calculator': 183,
  ';': 186,
  '=': 187,
  ',': 188,
  '-': 189,
  '.': 190,
  '/': 191,
  '`': 192,
  '[': 219,
  '\\': 220,
  ']': 221,
  "'": 222
};

// Helper aliases

var aliases = exports.aliases = {
  'windows': 91,
  '⇧': 16,
  '⌥': 18,
  '⌃': 17,
  '⌘': 91,
  'ctl': 17,
  'control': 17,
  'option': 18,
  'pause': 19,
  'break': 19,
  'caps': 20,
  'return': 13,
  'escape': 27,
  'spc': 32,
  'pgup': 33,
  'pgdn': 33,
  'ins': 45,
  'del': 46,
  'cmd': 91
};

/*!
 * Programatically add the following
 */

// lower case chars
for (i = 97; i < 123; i++) codes[String.fromCharCode(i)] = i - 32;

// numbers
for (var i = 48; i < 58; i++) codes[i - 48] = i;

// function keys
for (i = 1; i < 13; i++) codes['f' + i] = i + 111;

// numpad keys
for (i = 0; i < 10; i++) codes['numpad ' + i] = i + 96;

/**
 * Get by code
 *
 *   exports.name[13] // => 'Enter'
 */

var names = exports.names = exports.title = {}; // title for backward compat

// Create reverse mapping
for (i in codes) names[codes[i]] = i;

// Add aliases
for (var alias in aliases) {
  codes[alias] = aliases[alias];
}
}, {}],
8: [function(require, module, exports) {

/**
 * Module dependencies.
 */

'use strict';

var trim = require('trim');
var type = require('type');

var pattern = /(\w+)\[(\d+)\]/;

/**
 * Safely encode the given string
 * 
 * @param {String} str
 * @return {String}
 * @api private
 */

var encode = function encode(str) {
  try {
    return encodeURIComponent(str);
  } catch (e) {
    return str;
  }
};

/**
 * Safely decode the string
 * 
 * @param {String} str
 * @return {String}
 * @api private
 */

var decode = function decode(str) {
  try {
    return decodeURIComponent(str.replace(/\+/g, ' '));
  } catch (e) {
    return str;
  }
};

/**
 * Parse the given query `str`.
 *
 * @param {String} str
 * @return {Object}
 * @api public
 */

exports.parse = function (str) {
  if ('string' != typeof str) return {};

  str = trim(str);
  if ('' == str) return {};
  if ('?' == str.charAt(0)) str = str.slice(1);

  var obj = {};
  var pairs = str.split('&');
  for (var i = 0; i < pairs.length; i++) {
    var parts = pairs[i].split('=');
    var key = decode(parts[0]);
    var m;

    if (m = pattern.exec(key)) {
      obj[m[1]] = obj[m[1]] || [];
      obj[m[1]][m[2]] = decode(parts[1]);
      continue;
    }

    obj[parts[0]] = null == parts[1] ? '' : decode(parts[1]);
  }

  return obj;
};

/**
 * Stringify the given `obj`.
 *
 * @param {Object} obj
 * @return {String}
 * @api public
 */

exports.stringify = function (obj) {
  if (!obj) return '';
  var pairs = [];

  for (var key in obj) {
    var value = obj[key];

    if ('array' == type(value)) {
      for (var i = 0; i < value.length; ++i) {
        pairs.push(encode(key + '[' + i + ']') + '=' + encode(value[i]));
      }
      continue;
    }

    pairs.push(encode(key) + '=' + encode(obj[key]));
  }

  return pairs.join('&');
};
}, {"trim":27,"type":28}],
27: [function(require, module, exports) {
'use strict';

exports = module.exports = trim;

function trim(str) {
  if (str.trim) return str.trim();
  return str.replace(/^\s*|\s*$/g, '');
}

exports.left = function (str) {
  if (str.trimLeft) return str.trimLeft();
  return str.replace(/^\s*/, '');
};

exports.right = function (str) {
  if (str.trimRight) return str.trimRight();
  return str.replace(/\s*$/, '');
};
}, {}],
28: [function(require, module, exports) {
/**
 * toString ref.
 */

'use strict';

var toString = Object.prototype.toString;

/**
 * Return the type of `val`.
 *
 * @param {Mixed} val
 * @return {String}
 * @api public
 */

module.exports = function (val) {
  switch (toString.call(val)) {
    case '[object Date]':
      return 'date';
    case '[object RegExp]':
      return 'regexp';
    case '[object Arguments]':
      return 'arguments';
    case '[object Array]':
      return 'array';
    case '[object Error]':
      return 'error';
  }

  if (val === null) return 'null';
  if (val === undefined) return 'undefined';
  if (val !== val) return 'nan';
  if (val && val.nodeType === 1) return 'element';

  val = val.valueOf ? val.valueOf() : Object.prototype.valueOf.apply(val);

  return typeof val;
};
}, {}],
9: [function(require, module, exports) {
'use strict';

var bind = window.addEventListener ? 'addEventListener' : 'attachEvent',
    unbind = window.removeEventListener ? 'removeEventListener' : 'detachEvent',
    prefix = bind !== 'addEventListener' ? 'on' : '';

/**
 * Bind `el` event `type` to `fn`.
 *
 * @param {Element} el
 * @param {String} type
 * @param {Function} fn
 * @param {Boolean} capture
 * @return {Function}
 * @api public
 */

exports.bind = function (el, type, fn, capture) {
  el[bind](prefix + type, fn, capture || false);
  return fn;
};

/**
 * Unbind `el` event `type`'s callback `fn`.
 *
 * @param {Element} el
 * @param {String} type
 * @param {Function} fn
 * @param {Boolean} capture
 * @return {Function}
 * @api public
 */

exports.unbind = function (el, type, fn, capture) {
  el[unbind](prefix + type, fn, capture || false);
  return fn;
};
}, {}],
10: [function(require, module, exports) {
/*!
 * jQuery JavaScript Library v2.1.4
 * http://jquery.com/
 *
 * Includes Sizzle.js
 * http://sizzlejs.com/
 *
 * Copyright 2005, 2014 jQuery Foundation, Inc. and other contributors
 * Released under the MIT license
 * http://jquery.org/license
 *
 * Date: 2015-04-28T16:01Z
 */"use strict";(function(global,factory){if(typeof module === "object" && typeof module.exports === "object"){ // For CommonJS and CommonJS-like environments where a proper `window`
// is present, execute the factory and get jQuery.
// For environments that do not have a `window` with a `document`
// (such as Node.js), expose a factory as module.exports.
// This accentuates the need for the creation of a real `window`.
// e.g. var jQuery = require("jquery")(window);
// See ticket #14549 for more info.
module.exports = global.document?factory(global,true):function(w){if(!w.document){throw new Error("jQuery requires a window with a document");}return factory(w);};}else {factory(global);} // Pass this if window is not defined yet
})(typeof window !== "undefined"?window:undefined,function(window,noGlobal){ // Support: Firefox 18+
// Can't be in strict mode, several libs including ASP.NET trace
// the stack via arguments.caller.callee and Firefox dies if
// you try to trace through "use strict" call chains. (#13335)
//
var arr=[];var _slice=arr.slice;var concat=arr.concat;var push=arr.push;var indexOf=arr.indexOf;var class2type={};var toString=class2type.toString;var hasOwn=class2type.hasOwnProperty;var support={};var  // Use the correct document accordingly with window argument (sandbox)
document=window.document,version="2.1.4", // Define a local copy of jQuery
jQuery=function jQuery(selector,context){ // The jQuery object is actually just the init constructor 'enhanced'
// Need init if jQuery is called (just allow error to be thrown if not included)
return new jQuery.fn.init(selector,context);}, // Support: Android<4.1
// Make sure we trim BOM and NBSP
rtrim=/^[\s\uFEFF\xA0]+|[\s\uFEFF\xA0]+$/g, // Matches dashed string for camelizing
rmsPrefix=/^-ms-/,rdashAlpha=/-([\da-z])/gi, // Used by jQuery.camelCase as callback to replace()
fcamelCase=function fcamelCase(all,letter){return letter.toUpperCase();};jQuery.fn = jQuery.prototype = { // The current version of jQuery being used
jquery:version,constructor:jQuery, // Start with an empty selector
selector:"", // The default length of a jQuery object is 0
length:0,toArray:function toArray(){return _slice.call(this);}, // Get the Nth element in the matched element set OR
// Get the whole matched element set as a clean array
get:function get(num){return num != null? // Return just the one element from the set
num < 0?this[num + this.length]:this[num]: // Return all the elements in a clean array
_slice.call(this);}, // Take an array of elements and push it onto the stack
// (returning the new matched element set)
pushStack:function pushStack(elems){ // Build a new jQuery matched element set
var ret=jQuery.merge(this.constructor(),elems); // Add the old object onto the stack (as a reference)
ret.prevObject = this;ret.context = this.context; // Return the newly-formed element set
return ret;}, // Execute a callback for every element in the matched set.
// (You can seed the arguments with an array of args, but this is
// only used internally.)
each:function each(callback,args){return jQuery.each(this,callback,args);},map:function map(callback){return this.pushStack(jQuery.map(this,function(elem,i){return callback.call(elem,i,elem);}));},slice:function slice(){return this.pushStack(_slice.apply(this,arguments));},first:function first(){return this.eq(0);},last:function last(){return this.eq(-1);},eq:function eq(i){var len=this.length,j=+i + (i < 0?len:0);return this.pushStack(j >= 0 && j < len?[this[j]]:[]);},end:function end(){return this.prevObject || this.constructor(null);}, // For internal use only.
// Behaves like an Array's method, not like a jQuery method.
push:push,sort:arr.sort,splice:arr.splice};jQuery.extend = jQuery.fn.extend = function(){var options,name,src,copy,copyIsArray,clone,target=arguments[0] || {},i=1,length=arguments.length,deep=false; // Handle a deep copy situation
if(typeof target === "boolean"){deep = target; // Skip the boolean and the target
target = arguments[i] || {};i++;} // Handle case when target is a string or something (possible in deep copy)
if(typeof target !== "object" && !jQuery.isFunction(target)){target = {};} // Extend jQuery itself if only one argument is passed
if(i === length){target = this;i--;}for(;i < length;i++) { // Only deal with non-null/undefined values
if((options = arguments[i]) != null){ // Extend the base object
for(name in options) {src = target[name];copy = options[name]; // Prevent never-ending loop
if(target === copy){continue;} // Recurse if we're merging plain objects or arrays
if(deep && copy && (jQuery.isPlainObject(copy) || (copyIsArray = jQuery.isArray(copy)))){if(copyIsArray){copyIsArray = false;clone = src && jQuery.isArray(src)?src:[];}else {clone = src && jQuery.isPlainObject(src)?src:{};} // Never move original objects, clone them
target[name] = jQuery.extend(deep,clone,copy); // Don't bring in undefined values
}else if(copy !== undefined){target[name] = copy;}}}} // Return the modified object
return target;};jQuery.extend({ // Unique for each copy of jQuery on the page
expando:"jQuery" + (version + Math.random()).replace(/\D/g,""), // Assume jQuery is ready without the ready module
isReady:true,error:function error(msg){throw new Error(msg);},noop:function noop(){},isFunction:function isFunction(obj){return jQuery.type(obj) === "function";},isArray:Array.isArray,isWindow:function isWindow(obj){return obj != null && obj === obj.window;},isNumeric:function isNumeric(obj){ // parseFloat NaNs numeric-cast false positives (null|true|false|"")
// ...but misinterprets leading-number strings, particularly hex literals ("0x...")
// subtraction forces infinities to NaN
// adding 1 corrects loss of precision from parseFloat (#15100)
return !jQuery.isArray(obj) && obj - parseFloat(obj) + 1 >= 0;},isPlainObject:function isPlainObject(obj){ // Not plain objects:
// - Any object or value whose internal [[Class]] property is not "[object Object]"
// - DOM nodes
// - window
if(jQuery.type(obj) !== "object" || obj.nodeType || jQuery.isWindow(obj)){return false;}if(obj.constructor && !hasOwn.call(obj.constructor.prototype,"isPrototypeOf")){return false;} // If the function hasn't returned already, we're confident that
// |obj| is a plain object, created by {} or constructed with new Object
return true;},isEmptyObject:function isEmptyObject(obj){var name;for(name in obj) {return false;}return true;},type:function type(obj){if(obj == null){return obj + "";} // Support: Android<4.0, iOS<6 (functionish RegExp)
return typeof obj === "object" || typeof obj === "function"?class2type[toString.call(obj)] || "object":typeof obj;}, // Evaluates a script in a global context
globalEval:function globalEval(code){var script,indirect=eval;code = jQuery.trim(code);if(code){ // If the code includes a valid, prologue position
// strict mode pragma, execute code by injecting a
// script tag into the document.
if(code.indexOf("use strict") === 1){script = document.createElement("script");script.text = code;document.head.appendChild(script).parentNode.removeChild(script);}else { // Otherwise, avoid the DOM node creation, insertion
// and removal by using an indirect global eval
indirect(code);}}}, // Convert dashed to camelCase; used by the css and data modules
// Support: IE9-11+
// Microsoft forgot to hump their vendor prefix (#9572)
camelCase:function camelCase(string){return string.replace(rmsPrefix,"ms-").replace(rdashAlpha,fcamelCase);},nodeName:function nodeName(elem,name){return elem.nodeName && elem.nodeName.toLowerCase() === name.toLowerCase();}, // args is for internal usage only
each:function each(obj,callback,args){var value,i=0,length=obj.length,isArray=isArraylike(obj);if(args){if(isArray){for(;i < length;i++) {value = callback.apply(obj[i],args);if(value === false){break;}}}else {for(i in obj) {value = callback.apply(obj[i],args);if(value === false){break;}}} // A special, fast, case for the most common use of each
}else {if(isArray){for(;i < length;i++) {value = callback.call(obj[i],i,obj[i]);if(value === false){break;}}}else {for(i in obj) {value = callback.call(obj[i],i,obj[i]);if(value === false){break;}}}}return obj;}, // Support: Android<4.1
trim:function trim(text){return text == null?"":(text + "").replace(rtrim,"");}, // results is for internal usage only
makeArray:function makeArray(arr,results){var ret=results || [];if(arr != null){if(isArraylike(Object(arr))){jQuery.merge(ret,typeof arr === "string"?[arr]:arr);}else {push.call(ret,arr);}}return ret;},inArray:function inArray(elem,arr,i){return arr == null?-1:indexOf.call(arr,elem,i);},merge:function merge(first,second){var len=+second.length,j=0,i=first.length;for(;j < len;j++) {first[i++] = second[j];}first.length = i;return first;},grep:function grep(elems,callback,invert){var callbackInverse,matches=[],i=0,length=elems.length,callbackExpect=!invert; // Go through the array, only saving the items
// that pass the validator function
for(;i < length;i++) {callbackInverse = !callback(elems[i],i);if(callbackInverse !== callbackExpect){matches.push(elems[i]);}}return matches;}, // arg is for internal usage only
map:function map(elems,callback,arg){var value,i=0,length=elems.length,isArray=isArraylike(elems),ret=[]; // Go through the array, translating each of the items to their new values
if(isArray){for(;i < length;i++) {value = callback(elems[i],i,arg);if(value != null){ret.push(value);}} // Go through every key on the object,
}else {for(i in elems) {value = callback(elems[i],i,arg);if(value != null){ret.push(value);}}} // Flatten any nested arrays
return concat.apply([],ret);}, // A global GUID counter for objects
guid:1, // Bind a function to a context, optionally partially applying any
// arguments.
proxy:function proxy(fn,context){var tmp,args,proxy;if(typeof context === "string"){tmp = fn[context];context = fn;fn = tmp;} // Quick check to determine if target is callable, in the spec
// this throws a TypeError, but we will just return undefined.
if(!jQuery.isFunction(fn)){return undefined;} // Simulated bind
args = _slice.call(arguments,2);proxy = function(){return fn.apply(context || this,args.concat(_slice.call(arguments)));}; // Set the guid of unique handler to the same of original handler, so it can be removed
proxy.guid = fn.guid = fn.guid || jQuery.guid++;return proxy;},now:Date.now, // jQuery.support is not used in Core but other projects attach their
// properties to it so it needs to exist.
support:support}); // Populate the class2type map
jQuery.each("Boolean Number String Function Array Date RegExp Object Error".split(" "),function(i,name){class2type["[object " + name + "]"] = name.toLowerCase();});function isArraylike(obj){ // Support: iOS 8.2 (not reproducible in simulator)
// `in` check used to prevent JIT error (gh-2145)
// hasOwn isn't used here due to false negatives
// regarding Nodelist length in IE
var length="length" in obj && obj.length,type=jQuery.type(obj);if(type === "function" || jQuery.isWindow(obj)){return false;}if(obj.nodeType === 1 && length){return true;}return type === "array" || length === 0 || typeof length === "number" && length > 0 && length - 1 in obj;}var Sizzle= /*!
 * Sizzle CSS Selector Engine v2.2.0-pre
 * http://sizzlejs.com/
 *
 * Copyright 2008, 2014 jQuery Foundation, Inc. and other contributors
 * Released under the MIT license
 * http://jquery.org/license
 *
 * Date: 2014-12-16
 */(function(window){var i,support,Expr,getText,isXML,tokenize,compile,select,outermostContext,sortInput,hasDuplicate, // Local document vars
setDocument,document,docElem,documentIsHTML,rbuggyQSA,rbuggyMatches,matches,contains, // Instance-specific data
expando="sizzle" + 1 * new Date(),preferredDoc=window.document,dirruns=0,done=0,classCache=createCache(),tokenCache=createCache(),compilerCache=createCache(),sortOrder=function sortOrder(a,b){if(a === b){hasDuplicate = true;}return 0;}, // General-purpose constants
MAX_NEGATIVE=1 << 31, // Instance methods
hasOwn=({}).hasOwnProperty,arr=[],pop=arr.pop,push_native=arr.push,push=arr.push,slice=arr.slice, // Use a stripped-down indexOf as it's faster than native
// http://jsperf.com/thor-indexof-vs-for/5
indexOf=function indexOf(list,elem){var i=0,len=list.length;for(;i < len;i++) {if(list[i] === elem){return i;}}return -1;},booleans="checked|selected|async|autofocus|autoplay|controls|defer|disabled|hidden|ismap|loop|multiple|open|readonly|required|scoped", // Regular expressions
// Whitespace characters http://www.w3.org/TR/css3-selectors/#whitespace
whitespace="[\\x20\\t\\r\\n\\f]", // http://www.w3.org/TR/css3-syntax/#characters
characterEncoding="(?:\\\\.|[\\w-]|[^\\x00-\\xa0])+", // Loosely modeled on CSS identifier characters
// An unquoted value should be a CSS identifier http://www.w3.org/TR/css3-selectors/#attribute-selectors
// Proper syntax: http://www.w3.org/TR/CSS21/syndata.html#value-def-identifier
identifier=characterEncoding.replace("w","w#"), // Attribute selectors: http://www.w3.org/TR/selectors/#attribute-selectors
attributes="\\[" + whitespace + "*(" + characterEncoding + ")(?:" + whitespace +  // Operator (capture 2)
"*([*^$|!~]?=)" + whitespace +  // "Attribute values must be CSS identifiers [capture 5] or strings [capture 3 or capture 4]"
"*(?:'((?:\\\\.|[^\\\\'])*)'|\"((?:\\\\.|[^\\\\\"])*)\"|(" + identifier + "))|)" + whitespace + "*\\]",pseudos=":(" + characterEncoding + ")(?:\\((" +  // To reduce the number of selectors needing tokenize in the preFilter, prefer arguments:
// 1. quoted (capture 3; capture 4 or capture 5)
"('((?:\\\\.|[^\\\\'])*)'|\"((?:\\\\.|[^\\\\\"])*)\")|" +  // 2. simple (capture 6)
"((?:\\\\.|[^\\\\()[\\]]|" + attributes + ")*)|" +  // 3. anything else (capture 2)
".*" + ")\\)|)", // Leading and non-escaped trailing whitespace, capturing some non-whitespace characters preceding the latter
rwhitespace=new RegExp(whitespace + "+","g"),rtrim=new RegExp("^" + whitespace + "+|((?:^|[^\\\\])(?:\\\\.)*)" + whitespace + "+$","g"),rcomma=new RegExp("^" + whitespace + "*," + whitespace + "*"),rcombinators=new RegExp("^" + whitespace + "*([>+~]|" + whitespace + ")" + whitespace + "*"),rattributeQuotes=new RegExp("=" + whitespace + "*([^\\]'\"]*?)" + whitespace + "*\\]","g"),rpseudo=new RegExp(pseudos),ridentifier=new RegExp("^" + identifier + "$"),matchExpr={"ID":new RegExp("^#(" + characterEncoding + ")"),"CLASS":new RegExp("^\\.(" + characterEncoding + ")"),"TAG":new RegExp("^(" + characterEncoding.replace("w","w*") + ")"),"ATTR":new RegExp("^" + attributes),"PSEUDO":new RegExp("^" + pseudos),"CHILD":new RegExp("^:(only|first|last|nth|nth-last)-(child|of-type)(?:\\(" + whitespace + "*(even|odd|(([+-]|)(\\d*)n|)" + whitespace + "*(?:([+-]|)" + whitespace + "*(\\d+)|))" + whitespace + "*\\)|)","i"),"bool":new RegExp("^(?:" + booleans + ")$","i"), // For use in libraries implementing .is()
// We use this for POS matching in `select`
"needsContext":new RegExp("^" + whitespace + "*[>+~]|:(even|odd|eq|gt|lt|nth|first|last)(?:\\(" + whitespace + "*((?:-\\d)?\\d*)" + whitespace + "*\\)|)(?=[^-]|$)","i")},rinputs=/^(?:input|select|textarea|button)$/i,rheader=/^h\d$/i,rnative=/^[^{]+\{\s*\[native \w/, // Easily-parseable/retrievable ID or TAG or CLASS selectors
rquickExpr=/^(?:#([\w-]+)|(\w+)|\.([\w-]+))$/,rsibling=/[+~]/,rescape=/'|\\/g, // CSS escapes http://www.w3.org/TR/CSS21/syndata.html#escaped-characters
runescape=new RegExp("\\\\([\\da-f]{1,6}" + whitespace + "?|(" + whitespace + ")|.)","ig"),funescape=function funescape(_,escaped,escapedWhitespace){var high="0x" + escaped - 0x10000; // NaN means non-codepoint
// Support: Firefox<24
// Workaround erroneous numeric interpretation of +"0x"
return high !== high || escapedWhitespace?escaped:high < 0? // BMP codepoint
String.fromCharCode(high + 0x10000): // Supplemental Plane codepoint (surrogate pair)
String.fromCharCode(high >> 10 | 0xD800,high & 0x3FF | 0xDC00);}, // Used for iframes
// See setDocument()
// Removing the function wrapper causes a "Permission Denied"
// error in IE
unloadHandler=function unloadHandler(){setDocument();}; // Optimize for push.apply( _, NodeList )
try{push.apply(arr = slice.call(preferredDoc.childNodes),preferredDoc.childNodes); // Support: Android<4.0
// Detect silently failing push.apply
arr[preferredDoc.childNodes.length].nodeType;}catch(e) {push = {apply:arr.length? // Leverage slice if possible
function(target,els){push_native.apply(target,slice.call(els));}: // Support: IE<9
function(target,els){var j=target.length,i=0; // Can't trust NodeList.length
while(target[j++] = els[i++]) {}target.length = j - 1;}};}function Sizzle(selector,context,results,seed){var match,elem,m,nodeType, // QSA vars
i,groups,old,nid,newContext,newSelector;if((context?context.ownerDocument || context:preferredDoc) !== document){setDocument(context);}context = context || document;results = results || [];nodeType = context.nodeType;if(typeof selector !== "string" || !selector || nodeType !== 1 && nodeType !== 9 && nodeType !== 11){return results;}if(!seed && documentIsHTML){ // Try to shortcut find operations when possible (e.g., not under DocumentFragment)
if(nodeType !== 11 && (match = rquickExpr.exec(selector))){ // Speed-up: Sizzle("#ID")
if(m = match[1]){if(nodeType === 9){elem = context.getElementById(m); // Check parentNode to catch when Blackberry 4.6 returns
// nodes that are no longer in the document (jQuery #6963)
if(elem && elem.parentNode){ // Handle the case where IE, Opera, and Webkit return items
// by name instead of ID
if(elem.id === m){results.push(elem);return results;}}else {return results;}}else { // Context is not a document
if(context.ownerDocument && (elem = context.ownerDocument.getElementById(m)) && contains(context,elem) && elem.id === m){results.push(elem);return results;}} // Speed-up: Sizzle("TAG")
}else if(match[2]){push.apply(results,context.getElementsByTagName(selector));return results; // Speed-up: Sizzle(".CLASS")
}else if((m = match[3]) && support.getElementsByClassName){push.apply(results,context.getElementsByClassName(m));return results;}} // QSA path
if(support.qsa && (!rbuggyQSA || !rbuggyQSA.test(selector))){nid = old = expando;newContext = context;newSelector = nodeType !== 1 && selector; // qSA works strangely on Element-rooted queries
// We can work around this by specifying an extra ID on the root
// and working up from there (Thanks to Andrew Dupont for the technique)
// IE 8 doesn't work on object elements
if(nodeType === 1 && context.nodeName.toLowerCase() !== "object"){groups = tokenize(selector);if(old = context.getAttribute("id")){nid = old.replace(rescape,"\\$&");}else {context.setAttribute("id",nid);}nid = "[id='" + nid + "'] ";i = groups.length;while(i--) {groups[i] = nid + toSelector(groups[i]);}newContext = rsibling.test(selector) && testContext(context.parentNode) || context;newSelector = groups.join(",");}if(newSelector){try{push.apply(results,newContext.querySelectorAll(newSelector));return results;}catch(qsaError) {}finally {if(!old){context.removeAttribute("id");}}}}} // All others
return select(selector.replace(rtrim,"$1"),context,results,seed);} /**
 * Create key-value caches of limited size
 * @returns {Function(string, Object)} Returns the Object data after storing it on itself with
 *	property name the (space-suffixed) string and (if the cache is larger than Expr.cacheLength)
 *	deleting the oldest entry
 */function createCache(){var keys=[];function cache(key,value){ // Use (key + " ") to avoid collision with native prototype properties (see Issue #157)
if(keys.push(key + " ") > Expr.cacheLength){ // Only keep the most recent entries
delete cache[keys.shift()];}return cache[key + " "] = value;}return cache;} /**
 * Mark a function for special use by Sizzle
 * @param {Function} fn The function to mark
 */function markFunction(fn){fn[expando] = true;return fn;} /**
 * Support testing using an element
 * @param {Function} fn Passed the created div and expects a boolean result
 */function assert(fn){var div=document.createElement("div");try{return !!fn(div);}catch(e) {return false;}finally { // Remove from its parent by default
if(div.parentNode){div.parentNode.removeChild(div);} // release memory in IE
div = null;}} /**
 * Adds the same handler for all of the specified attrs
 * @param {String} attrs Pipe-separated list of attributes
 * @param {Function} handler The method that will be applied
 */function addHandle(attrs,handler){var arr=attrs.split("|"),i=attrs.length;while(i--) {Expr.attrHandle[arr[i]] = handler;}} /**
 * Checks document order of two siblings
 * @param {Element} a
 * @param {Element} b
 * @returns {Number} Returns less than 0 if a precedes b, greater than 0 if a follows b
 */function siblingCheck(a,b){var cur=b && a,diff=cur && a.nodeType === 1 && b.nodeType === 1 && (~b.sourceIndex || MAX_NEGATIVE) - (~a.sourceIndex || MAX_NEGATIVE); // Use IE sourceIndex if available on both nodes
if(diff){return diff;} // Check if b follows a
if(cur){while(cur = cur.nextSibling) {if(cur === b){return -1;}}}return a?1:-1;} /**
 * Returns a function to use in pseudos for input types
 * @param {String} type
 */function createInputPseudo(type){return function(elem){var name=elem.nodeName.toLowerCase();return name === "input" && elem.type === type;};} /**
 * Returns a function to use in pseudos for buttons
 * @param {String} type
 */function createButtonPseudo(type){return function(elem){var name=elem.nodeName.toLowerCase();return (name === "input" || name === "button") && elem.type === type;};} /**
 * Returns a function to use in pseudos for positionals
 * @param {Function} fn
 */function createPositionalPseudo(fn){return markFunction(function(argument){argument = +argument;return markFunction(function(seed,matches){var j,matchIndexes=fn([],seed.length,argument),i=matchIndexes.length; // Match elements found at the specified indexes
while(i--) {if(seed[j = matchIndexes[i]]){seed[j] = !(matches[j] = seed[j]);}}});});} /**
 * Checks a node for validity as a Sizzle context
 * @param {Element|Object=} context
 * @returns {Element|Object|Boolean} The input node if acceptable, otherwise a falsy value
 */function testContext(context){return context && typeof context.getElementsByTagName !== "undefined" && context;} // Expose support vars for convenience
support = Sizzle.support = {}; /**
 * Detects XML nodes
 * @param {Element|Object} elem An element or a document
 * @returns {Boolean} True iff elem is a non-HTML XML node
 */isXML = Sizzle.isXML = function(elem){ // documentElement is verified for cases where it doesn't yet exist
// (such as loading iframes in IE - #4833)
var documentElement=elem && (elem.ownerDocument || elem).documentElement;return documentElement?documentElement.nodeName !== "HTML":false;}; /**
 * Sets document-related variables once based on the current document
 * @param {Element|Object} [doc] An element or document object to use to set the document
 * @returns {Object} Returns the current document
 */setDocument = Sizzle.setDocument = function(node){var hasCompare,parent,doc=node?node.ownerDocument || node:preferredDoc; // If no document and documentElement is available, return
if(doc === document || doc.nodeType !== 9 || !doc.documentElement){return document;} // Set our document
document = doc;docElem = doc.documentElement;parent = doc.defaultView; // Support: IE>8
// If iframe document is assigned to "document" variable and if iframe has been reloaded,
// IE will throw "permission denied" error when accessing "document" variable, see jQuery #13936
// IE6-8 do not support the defaultView property so parent will be undefined
if(parent && parent !== parent.top){ // IE11 does not have attachEvent, so all must suffer
if(parent.addEventListener){parent.addEventListener("unload",unloadHandler,false);}else if(parent.attachEvent){parent.attachEvent("onunload",unloadHandler);}} /* Support tests
	---------------------------------------------------------------------- */documentIsHTML = !isXML(doc); /* Attributes
	---------------------------------------------------------------------- */ // Support: IE<8
// Verify that getAttribute really returns attributes and not properties
// (excepting IE8 booleans)
support.attributes = assert(function(div){div.className = "i";return !div.getAttribute("className");}); /* getElement(s)By*
	---------------------------------------------------------------------- */ // Check if getElementsByTagName("*") returns only elements
support.getElementsByTagName = assert(function(div){div.appendChild(doc.createComment(""));return !div.getElementsByTagName("*").length;}); // Support: IE<9
support.getElementsByClassName = rnative.test(doc.getElementsByClassName); // Support: IE<10
// Check if getElementById returns elements by name
// The broken getElementById methods don't pick up programatically-set names,
// so use a roundabout getElementsByName test
support.getById = assert(function(div){docElem.appendChild(div).id = expando;return !doc.getElementsByName || !doc.getElementsByName(expando).length;}); // ID find and filter
if(support.getById){Expr.find["ID"] = function(id,context){if(typeof context.getElementById !== "undefined" && documentIsHTML){var m=context.getElementById(id); // Check parentNode to catch when Blackberry 4.6 returns
// nodes that are no longer in the document #6963
return m && m.parentNode?[m]:[];}};Expr.filter["ID"] = function(id){var attrId=id.replace(runescape,funescape);return function(elem){return elem.getAttribute("id") === attrId;};};}else { // Support: IE6/7
// getElementById is not reliable as a find shortcut
delete Expr.find["ID"];Expr.filter["ID"] = function(id){var attrId=id.replace(runescape,funescape);return function(elem){var node=typeof elem.getAttributeNode !== "undefined" && elem.getAttributeNode("id");return node && node.value === attrId;};};} // Tag
Expr.find["TAG"] = support.getElementsByTagName?function(tag,context){if(typeof context.getElementsByTagName !== "undefined"){return context.getElementsByTagName(tag); // DocumentFragment nodes don't have gEBTN
}else if(support.qsa){return context.querySelectorAll(tag);}}:function(tag,context){var elem,tmp=[],i=0, // By happy coincidence, a (broken) gEBTN appears on DocumentFragment nodes too
results=context.getElementsByTagName(tag); // Filter out possible comments
if(tag === "*"){while(elem = results[i++]) {if(elem.nodeType === 1){tmp.push(elem);}}return tmp;}return results;}; // Class
Expr.find["CLASS"] = support.getElementsByClassName && function(className,context){if(documentIsHTML){return context.getElementsByClassName(className);}}; /* QSA/matchesSelector
	---------------------------------------------------------------------- */ // QSA and matchesSelector support
// matchesSelector(:active) reports false when true (IE9/Opera 11.5)
rbuggyMatches = []; // qSa(:focus) reports false when true (Chrome 21)
// We allow this because of a bug in IE8/9 that throws an error
// whenever `document.activeElement` is accessed on an iframe
// So, we allow :focus to pass through QSA all the time to avoid the IE error
// See http://bugs.jquery.com/ticket/13378
rbuggyQSA = [];if(support.qsa = rnative.test(doc.querySelectorAll)){ // Build QSA regex
// Regex strategy adopted from Diego Perini
assert(function(div){ // Select is set to empty string on purpose
// This is to test IE's treatment of not explicitly
// setting a boolean content attribute,
// since its presence should be enough
// http://bugs.jquery.com/ticket/12359
docElem.appendChild(div).innerHTML = "<a id='" + expando + "'></a>" + "<select id='" + expando + "-\f]' msallowcapture=''>" + "<option selected=''></option></select>"; // Support: IE8, Opera 11-12.16
// Nothing should be selected when empty strings follow ^= or $= or *=
// The test attribute must be unknown in Opera but "safe" for WinRT
// http://msdn.microsoft.com/en-us/library/ie/hh465388.aspx#attribute_section
if(div.querySelectorAll("[msallowcapture^='']").length){rbuggyQSA.push("[*^$]=" + whitespace + "*(?:''|\"\")");} // Support: IE8
// Boolean attributes and "value" are not treated correctly
if(!div.querySelectorAll("[selected]").length){rbuggyQSA.push("\\[" + whitespace + "*(?:value|" + booleans + ")");} // Support: Chrome<29, Android<4.2+, Safari<7.0+, iOS<7.0+, PhantomJS<1.9.7+
if(!div.querySelectorAll("[id~=" + expando + "-]").length){rbuggyQSA.push("~=");} // Webkit/Opera - :checked should return selected option elements
// http://www.w3.org/TR/2011/REC-css3-selectors-20110929/#checked
// IE8 throws error here and will not see later tests
if(!div.querySelectorAll(":checked").length){rbuggyQSA.push(":checked");} // Support: Safari 8+, iOS 8+
// https://bugs.webkit.org/show_bug.cgi?id=136851
// In-page `selector#id sibing-combinator selector` fails
if(!div.querySelectorAll("a#" + expando + "+*").length){rbuggyQSA.push(".#.+[+~]");}});assert(function(div){ // Support: Windows 8 Native Apps
// The type and name attributes are restricted during .innerHTML assignment
var input=doc.createElement("input");input.setAttribute("type","hidden");div.appendChild(input).setAttribute("name","D"); // Support: IE8
// Enforce case-sensitivity of name attribute
if(div.querySelectorAll("[name=d]").length){rbuggyQSA.push("name" + whitespace + "*[*^$|!~]?=");} // FF 3.5 - :enabled/:disabled and hidden elements (hidden elements are still enabled)
// IE8 throws error here and will not see later tests
if(!div.querySelectorAll(":enabled").length){rbuggyQSA.push(":enabled",":disabled");} // Opera 10-11 does not throw on post-comma invalid pseudos
div.querySelectorAll("*,:x");rbuggyQSA.push(",.*:");});}if(support.matchesSelector = rnative.test(matches = docElem.matches || docElem.webkitMatchesSelector || docElem.mozMatchesSelector || docElem.oMatchesSelector || docElem.msMatchesSelector)){assert(function(div){ // Check to see if it's possible to do matchesSelector
// on a disconnected node (IE 9)
support.disconnectedMatch = matches.call(div,"div"); // This should fail with an exception
// Gecko does not error, returns false instead
matches.call(div,"[s!='']:x");rbuggyMatches.push("!=",pseudos);});}rbuggyQSA = rbuggyQSA.length && new RegExp(rbuggyQSA.join("|"));rbuggyMatches = rbuggyMatches.length && new RegExp(rbuggyMatches.join("|")); /* Contains
	---------------------------------------------------------------------- */hasCompare = rnative.test(docElem.compareDocumentPosition); // Element contains another
// Purposefully does not implement inclusive descendent
// As in, an element does not contain itself
contains = hasCompare || rnative.test(docElem.contains)?function(a,b){var adown=a.nodeType === 9?a.documentElement:a,bup=b && b.parentNode;return a === bup || !!(bup && bup.nodeType === 1 && (adown.contains?adown.contains(bup):a.compareDocumentPosition && a.compareDocumentPosition(bup) & 16));}:function(a,b){if(b){while(b = b.parentNode) {if(b === a){return true;}}}return false;}; /* Sorting
	---------------------------------------------------------------------- */ // Document order sorting
sortOrder = hasCompare?function(a,b){ // Flag for duplicate removal
if(a === b){hasDuplicate = true;return 0;} // Sort on method existence if only one input has compareDocumentPosition
var compare=!a.compareDocumentPosition - !b.compareDocumentPosition;if(compare){return compare;} // Calculate position if both inputs belong to the same document
compare = (a.ownerDocument || a) === (b.ownerDocument || b)?a.compareDocumentPosition(b): // Otherwise we know they are disconnected
1; // Disconnected nodes
if(compare & 1 || !support.sortDetached && b.compareDocumentPosition(a) === compare){ // Choose the first element that is related to our preferred document
if(a === doc || a.ownerDocument === preferredDoc && contains(preferredDoc,a)){return -1;}if(b === doc || b.ownerDocument === preferredDoc && contains(preferredDoc,b)){return 1;} // Maintain original order
return sortInput?indexOf(sortInput,a) - indexOf(sortInput,b):0;}return compare & 4?-1:1;}:function(a,b){ // Exit early if the nodes are identical
if(a === b){hasDuplicate = true;return 0;}var cur,i=0,aup=a.parentNode,bup=b.parentNode,ap=[a],bp=[b]; // Parentless nodes are either documents or disconnected
if(!aup || !bup){return a === doc?-1:b === doc?1:aup?-1:bup?1:sortInput?indexOf(sortInput,a) - indexOf(sortInput,b):0; // If the nodes are siblings, we can do a quick check
}else if(aup === bup){return siblingCheck(a,b);} // Otherwise we need full lists of their ancestors for comparison
cur = a;while(cur = cur.parentNode) {ap.unshift(cur);}cur = b;while(cur = cur.parentNode) {bp.unshift(cur);} // Walk down the tree looking for a discrepancy
while(ap[i] === bp[i]) {i++;}return i? // Do a sibling check if the nodes have a common ancestor
siblingCheck(ap[i],bp[i]): // Otherwise nodes in our document sort first
ap[i] === preferredDoc?-1:bp[i] === preferredDoc?1:0;};return doc;};Sizzle.matches = function(expr,elements){return Sizzle(expr,null,null,elements);};Sizzle.matchesSelector = function(elem,expr){ // Set document vars if needed
if((elem.ownerDocument || elem) !== document){setDocument(elem);} // Make sure that attribute selectors are quoted
expr = expr.replace(rattributeQuotes,"='$1']");if(support.matchesSelector && documentIsHTML && (!rbuggyMatches || !rbuggyMatches.test(expr)) && (!rbuggyQSA || !rbuggyQSA.test(expr))){try{var ret=matches.call(elem,expr); // IE 9's matchesSelector returns false on disconnected nodes
if(ret || support.disconnectedMatch ||  // As well, disconnected nodes are said to be in a document
// fragment in IE 9
elem.document && elem.document.nodeType !== 11){return ret;}}catch(e) {}}return Sizzle(expr,document,null,[elem]).length > 0;};Sizzle.contains = function(context,elem){ // Set document vars if needed
if((context.ownerDocument || context) !== document){setDocument(context);}return contains(context,elem);};Sizzle.attr = function(elem,name){ // Set document vars if needed
if((elem.ownerDocument || elem) !== document){setDocument(elem);}var fn=Expr.attrHandle[name.toLowerCase()], // Don't get fooled by Object.prototype properties (jQuery #13807)
val=fn && hasOwn.call(Expr.attrHandle,name.toLowerCase())?fn(elem,name,!documentIsHTML):undefined;return val !== undefined?val:support.attributes || !documentIsHTML?elem.getAttribute(name):(val = elem.getAttributeNode(name)) && val.specified?val.value:null;};Sizzle.error = function(msg){throw new Error("Syntax error, unrecognized expression: " + msg);}; /**
 * Document sorting and removing duplicates
 * @param {ArrayLike} results
 */Sizzle.uniqueSort = function(results){var elem,duplicates=[],j=0,i=0; // Unless we *know* we can detect duplicates, assume their presence
hasDuplicate = !support.detectDuplicates;sortInput = !support.sortStable && results.slice(0);results.sort(sortOrder);if(hasDuplicate){while(elem = results[i++]) {if(elem === results[i]){j = duplicates.push(i);}}while(j--) {results.splice(duplicates[j],1);}} // Clear input after sorting to release objects
// See https://github.com/jquery/sizzle/pull/225
sortInput = null;return results;}; /**
 * Utility function for retrieving the text value of an array of DOM nodes
 * @param {Array|Element} elem
 */getText = Sizzle.getText = function(elem){var node,ret="",i=0,nodeType=elem.nodeType;if(!nodeType){ // If no nodeType, this is expected to be an array
while(node = elem[i++]) { // Do not traverse comment nodes
ret += getText(node);}}else if(nodeType === 1 || nodeType === 9 || nodeType === 11){ // Use textContent for elements
// innerText usage removed for consistency of new lines (jQuery #11153)
if(typeof elem.textContent === "string"){return elem.textContent;}else { // Traverse its children
for(elem = elem.firstChild;elem;elem = elem.nextSibling) {ret += getText(elem);}}}else if(nodeType === 3 || nodeType === 4){return elem.nodeValue;} // Do not include comment or processing instruction nodes
return ret;};Expr = Sizzle.selectors = { // Can be adjusted by the user
cacheLength:50,createPseudo:markFunction,match:matchExpr,attrHandle:{},find:{},relative:{">":{dir:"parentNode",first:true}," ":{dir:"parentNode"},"+":{dir:"previousSibling",first:true},"~":{dir:"previousSibling"}},preFilter:{"ATTR":function ATTR(match){match[1] = match[1].replace(runescape,funescape); // Move the given value to match[3] whether quoted or unquoted
match[3] = (match[3] || match[4] || match[5] || "").replace(runescape,funescape);if(match[2] === "~="){match[3] = " " + match[3] + " ";}return match.slice(0,4);},"CHILD":function CHILD(match){ /* matches from matchExpr["CHILD"]
				1 type (only|nth|...)
				2 what (child|of-type)
				3 argument (even|odd|\d*|\d*n([+-]\d+)?|...)
				4 xn-component of xn+y argument ([+-]?\d*n|)
				5 sign of xn-component
				6 x of xn-component
				7 sign of y-component
				8 y of y-component
			*/match[1] = match[1].toLowerCase();if(match[1].slice(0,3) === "nth"){ // nth-* requires argument
if(!match[3]){Sizzle.error(match[0]);} // numeric x and y parameters for Expr.filter.CHILD
// remember that false/true cast respectively to 0/1
match[4] = +(match[4]?match[5] + (match[6] || 1):2 * (match[3] === "even" || match[3] === "odd"));match[5] = +(match[7] + match[8] || match[3] === "odd"); // other types prohibit arguments
}else if(match[3]){Sizzle.error(match[0]);}return match;},"PSEUDO":function PSEUDO(match){var excess,unquoted=!match[6] && match[2];if(matchExpr["CHILD"].test(match[0])){return null;} // Accept quoted arguments as-is
if(match[3]){match[2] = match[4] || match[5] || ""; // Strip excess characters from unquoted arguments
}else if(unquoted && rpseudo.test(unquoted) && ( // Get excess from tokenize (recursively)
excess = tokenize(unquoted,true)) && ( // advance to the next closing parenthesis
excess = unquoted.indexOf(")",unquoted.length - excess) - unquoted.length)){ // excess is a negative index
match[0] = match[0].slice(0,excess);match[2] = unquoted.slice(0,excess);} // Return only captures needed by the pseudo filter method (type and argument)
return match.slice(0,3);}},filter:{"TAG":function TAG(nodeNameSelector){var nodeName=nodeNameSelector.replace(runescape,funescape).toLowerCase();return nodeNameSelector === "*"?function(){return true;}:function(elem){return elem.nodeName && elem.nodeName.toLowerCase() === nodeName;};},"CLASS":function CLASS(className){var pattern=classCache[className + " "];return pattern || (pattern = new RegExp("(^|" + whitespace + ")" + className + "(" + whitespace + "|$)")) && classCache(className,function(elem){return pattern.test(typeof elem.className === "string" && elem.className || typeof elem.getAttribute !== "undefined" && elem.getAttribute("class") || "");});},"ATTR":function ATTR(name,operator,check){return function(elem){var result=Sizzle.attr(elem,name);if(result == null){return operator === "!=";}if(!operator){return true;}result += "";return operator === "="?result === check:operator === "!="?result !== check:operator === "^="?check && result.indexOf(check) === 0:operator === "*="?check && result.indexOf(check) > -1:operator === "$="?check && result.slice(-check.length) === check:operator === "~="?(" " + result.replace(rwhitespace," ") + " ").indexOf(check) > -1:operator === "|="?result === check || result.slice(0,check.length + 1) === check + "-":false;};},"CHILD":function CHILD(type,what,argument,first,last){var simple=type.slice(0,3) !== "nth",forward=type.slice(-4) !== "last",ofType=what === "of-type";return first === 1 && last === 0? // Shortcut for :nth-*(n)
function(elem){return !!elem.parentNode;}:function(elem,context,xml){var cache,outerCache,node,diff,nodeIndex,start,dir=simple !== forward?"nextSibling":"previousSibling",parent=elem.parentNode,name=ofType && elem.nodeName.toLowerCase(),useCache=!xml && !ofType;if(parent){ // :(first|last|only)-(child|of-type)
if(simple){while(dir) {node = elem;while(node = node[dir]) {if(ofType?node.nodeName.toLowerCase() === name:node.nodeType === 1){return false;}} // Reverse direction for :only-* (if we haven't yet done so)
start = dir = type === "only" && !start && "nextSibling";}return true;}start = [forward?parent.firstChild:parent.lastChild]; // non-xml :nth-child(...) stores cache data on `parent`
if(forward && useCache){ // Seek `elem` from a previously-cached index
outerCache = parent[expando] || (parent[expando] = {});cache = outerCache[type] || [];nodeIndex = cache[0] === dirruns && cache[1];diff = cache[0] === dirruns && cache[2];node = nodeIndex && parent.childNodes[nodeIndex];while(node = ++nodeIndex && node && node[dir] || ( // Fallback to seeking `elem` from the start
diff = nodeIndex = 0) || start.pop()) { // When found, cache indexes on `parent` and break
if(node.nodeType === 1 && ++diff && node === elem){outerCache[type] = [dirruns,nodeIndex,diff];break;}} // Use previously-cached element index if available
}else if(useCache && (cache = (elem[expando] || (elem[expando] = {}))[type]) && cache[0] === dirruns){diff = cache[1]; // xml :nth-child(...) or :nth-last-child(...) or :nth(-last)?-of-type(...)
}else { // Use the same loop as above to seek `elem` from the start
while(node = ++nodeIndex && node && node[dir] || (diff = nodeIndex = 0) || start.pop()) {if((ofType?node.nodeName.toLowerCase() === name:node.nodeType === 1) && ++diff){ // Cache the index of each encountered element
if(useCache){(node[expando] || (node[expando] = {}))[type] = [dirruns,diff];}if(node === elem){break;}}}} // Incorporate the offset, then check against cycle size
diff -= last;return diff === first || diff % first === 0 && diff / first >= 0;}};},"PSEUDO":function PSEUDO(pseudo,argument){ // pseudo-class names are case-insensitive
// http://www.w3.org/TR/selectors/#pseudo-classes
// Prioritize by case sensitivity in case custom pseudos are added with uppercase letters
// Remember that setFilters inherits from pseudos
var args,fn=Expr.pseudos[pseudo] || Expr.setFilters[pseudo.toLowerCase()] || Sizzle.error("unsupported pseudo: " + pseudo); // The user may use createPseudo to indicate that
// arguments are needed to create the filter function
// just as Sizzle does
if(fn[expando]){return fn(argument);} // But maintain support for old signatures
if(fn.length > 1){args = [pseudo,pseudo,"",argument];return Expr.setFilters.hasOwnProperty(pseudo.toLowerCase())?markFunction(function(seed,matches){var idx,matched=fn(seed,argument),i=matched.length;while(i--) {idx = indexOf(seed,matched[i]);seed[idx] = !(matches[idx] = matched[i]);}}):function(elem){return fn(elem,0,args);};}return fn;}},pseudos:{ // Potentially complex pseudos
"not":markFunction(function(selector){ // Trim the selector passed to compile
// to avoid treating leading and trailing
// spaces as combinators
var input=[],results=[],matcher=compile(selector.replace(rtrim,"$1"));return matcher[expando]?markFunction(function(seed,matches,context,xml){var elem,unmatched=matcher(seed,null,xml,[]),i=seed.length; // Match elements unmatched by `matcher`
while(i--) {if(elem = unmatched[i]){seed[i] = !(matches[i] = elem);}}}):function(elem,context,xml){input[0] = elem;matcher(input,null,xml,results); // Don't keep the element (issue #299)
input[0] = null;return !results.pop();};}),"has":markFunction(function(selector){return function(elem){return Sizzle(selector,elem).length > 0;};}),"contains":markFunction(function(text){text = text.replace(runescape,funescape);return function(elem){return (elem.textContent || elem.innerText || getText(elem)).indexOf(text) > -1;};}), // "Whether an element is represented by a :lang() selector
// is based solely on the element's language value
// being equal to the identifier C,
// or beginning with the identifier C immediately followed by "-".
// The matching of C against the element's language value is performed case-insensitively.
// The identifier C does not have to be a valid language name."
// http://www.w3.org/TR/selectors/#lang-pseudo
"lang":markFunction(function(lang){ // lang value must be a valid identifier
if(!ridentifier.test(lang || "")){Sizzle.error("unsupported lang: " + lang);}lang = lang.replace(runescape,funescape).toLowerCase();return function(elem){var elemLang;do {if(elemLang = documentIsHTML?elem.lang:elem.getAttribute("xml:lang") || elem.getAttribute("lang")){elemLang = elemLang.toLowerCase();return elemLang === lang || elemLang.indexOf(lang + "-") === 0;}}while((elem = elem.parentNode) && elem.nodeType === 1);return false;};}), // Miscellaneous
"target":function target(elem){var hash=window.location && window.location.hash;return hash && hash.slice(1) === elem.id;},"root":function root(elem){return elem === docElem;},"focus":function focus(elem){return elem === document.activeElement && (!document.hasFocus || document.hasFocus()) && !!(elem.type || elem.href || ~elem.tabIndex);}, // Boolean properties
"enabled":function enabled(elem){return elem.disabled === false;},"disabled":function disabled(elem){return elem.disabled === true;},"checked":function checked(elem){ // In CSS3, :checked should return both checked and selected elements
// http://www.w3.org/TR/2011/REC-css3-selectors-20110929/#checked
var nodeName=elem.nodeName.toLowerCase();return nodeName === "input" && !!elem.checked || nodeName === "option" && !!elem.selected;},"selected":function selected(elem){ // Accessing this property makes selected-by-default
// options in Safari work properly
if(elem.parentNode){elem.parentNode.selectedIndex;}return elem.selected === true;}, // Contents
"empty":function empty(elem){ // http://www.w3.org/TR/selectors/#empty-pseudo
// :empty is negated by element (1) or content nodes (text: 3; cdata: 4; entity ref: 5),
//   but not by others (comment: 8; processing instruction: 7; etc.)
// nodeType < 6 works because attributes (2) do not appear as children
for(elem = elem.firstChild;elem;elem = elem.nextSibling) {if(elem.nodeType < 6){return false;}}return true;},"parent":function parent(elem){return !Expr.pseudos["empty"](elem);}, // Element/input types
"header":function header(elem){return rheader.test(elem.nodeName);},"input":function input(elem){return rinputs.test(elem.nodeName);},"button":function button(elem){var name=elem.nodeName.toLowerCase();return name === "input" && elem.type === "button" || name === "button";},"text":function text(elem){var attr;return elem.nodeName.toLowerCase() === "input" && elem.type === "text" && ( // Support: IE<8
// New HTML5 attribute values (e.g., "search") appear with elem.type === "text"
(attr = elem.getAttribute("type")) == null || attr.toLowerCase() === "text");}, // Position-in-collection
"first":createPositionalPseudo(function(){return [0];}),"last":createPositionalPseudo(function(matchIndexes,length){return [length - 1];}),"eq":createPositionalPseudo(function(matchIndexes,length,argument){return [argument < 0?argument + length:argument];}),"even":createPositionalPseudo(function(matchIndexes,length){var i=0;for(;i < length;i += 2) {matchIndexes.push(i);}return matchIndexes;}),"odd":createPositionalPseudo(function(matchIndexes,length){var i=1;for(;i < length;i += 2) {matchIndexes.push(i);}return matchIndexes;}),"lt":createPositionalPseudo(function(matchIndexes,length,argument){var i=argument < 0?argument + length:argument;for(;--i >= 0;) {matchIndexes.push(i);}return matchIndexes;}),"gt":createPositionalPseudo(function(matchIndexes,length,argument){var i=argument < 0?argument + length:argument;for(;++i < length;) {matchIndexes.push(i);}return matchIndexes;})}};Expr.pseudos["nth"] = Expr.pseudos["eq"]; // Add button/input type pseudos
for(i in {radio:true,checkbox:true,file:true,password:true,image:true}) {Expr.pseudos[i] = createInputPseudo(i);}for(i in {submit:true,reset:true}) {Expr.pseudos[i] = createButtonPseudo(i);} // Easy API for creating new setFilters
function setFilters(){}setFilters.prototype = Expr.filters = Expr.pseudos;Expr.setFilters = new setFilters();tokenize = Sizzle.tokenize = function(selector,parseOnly){var matched,match,tokens,type,soFar,groups,preFilters,cached=tokenCache[selector + " "];if(cached){return parseOnly?0:cached.slice(0);}soFar = selector;groups = [];preFilters = Expr.preFilter;while(soFar) { // Comma and first run
if(!matched || (match = rcomma.exec(soFar))){if(match){ // Don't consume trailing commas as valid
soFar = soFar.slice(match[0].length) || soFar;}groups.push(tokens = []);}matched = false; // Combinators
if(match = rcombinators.exec(soFar)){matched = match.shift();tokens.push({value:matched, // Cast descendant combinators to space
type:match[0].replace(rtrim," ")});soFar = soFar.slice(matched.length);} // Filters
for(type in Expr.filter) {if((match = matchExpr[type].exec(soFar)) && (!preFilters[type] || (match = preFilters[type](match)))){matched = match.shift();tokens.push({value:matched,type:type,matches:match});soFar = soFar.slice(matched.length);}}if(!matched){break;}} // Return the length of the invalid excess
// if we're just parsing
// Otherwise, throw an error or return tokens
return parseOnly?soFar.length:soFar?Sizzle.error(selector): // Cache the tokens
tokenCache(selector,groups).slice(0);};function toSelector(tokens){var i=0,len=tokens.length,selector="";for(;i < len;i++) {selector += tokens[i].value;}return selector;}function addCombinator(matcher,combinator,base){var dir=combinator.dir,checkNonElements=base && dir === "parentNode",doneName=done++;return combinator.first? // Check against closest ancestor/preceding element
function(elem,context,xml){while(elem = elem[dir]) {if(elem.nodeType === 1 || checkNonElements){return matcher(elem,context,xml);}}}: // Check against all ancestor/preceding elements
function(elem,context,xml){var oldCache,outerCache,newCache=[dirruns,doneName]; // We can't set arbitrary data on XML nodes, so they don't benefit from dir caching
if(xml){while(elem = elem[dir]) {if(elem.nodeType === 1 || checkNonElements){if(matcher(elem,context,xml)){return true;}}}}else {while(elem = elem[dir]) {if(elem.nodeType === 1 || checkNonElements){outerCache = elem[expando] || (elem[expando] = {});if((oldCache = outerCache[dir]) && oldCache[0] === dirruns && oldCache[1] === doneName){ // Assign to newCache so results back-propagate to previous elements
return newCache[2] = oldCache[2];}else { // Reuse newcache so results back-propagate to previous elements
outerCache[dir] = newCache; // A match means we're done; a fail means we have to keep checking
if(newCache[2] = matcher(elem,context,xml)){return true;}}}}}};}function elementMatcher(matchers){return matchers.length > 1?function(elem,context,xml){var i=matchers.length;while(i--) {if(!matchers[i](elem,context,xml)){return false;}}return true;}:matchers[0];}function multipleContexts(selector,contexts,results){var i=0,len=contexts.length;for(;i < len;i++) {Sizzle(selector,contexts[i],results);}return results;}function condense(unmatched,map,filter,context,xml){var elem,newUnmatched=[],i=0,len=unmatched.length,mapped=map != null;for(;i < len;i++) {if(elem = unmatched[i]){if(!filter || filter(elem,context,xml)){newUnmatched.push(elem);if(mapped){map.push(i);}}}}return newUnmatched;}function setMatcher(preFilter,selector,matcher,postFilter,postFinder,postSelector){if(postFilter && !postFilter[expando]){postFilter = setMatcher(postFilter);}if(postFinder && !postFinder[expando]){postFinder = setMatcher(postFinder,postSelector);}return markFunction(function(seed,results,context,xml){var temp,i,elem,preMap=[],postMap=[],preexisting=results.length, // Get initial elements from seed or context
elems=seed || multipleContexts(selector || "*",context.nodeType?[context]:context,[]), // Prefilter to get matcher input, preserving a map for seed-results synchronization
matcherIn=preFilter && (seed || !selector)?condense(elems,preMap,preFilter,context,xml):elems,matcherOut=matcher? // If we have a postFinder, or filtered seed, or non-seed postFilter or preexisting results,
postFinder || (seed?preFilter:preexisting || postFilter)? // ...intermediate processing is necessary
[]: // ...otherwise use results directly
results:matcherIn; // Find primary matches
if(matcher){matcher(matcherIn,matcherOut,context,xml);} // Apply postFilter
if(postFilter){temp = condense(matcherOut,postMap);postFilter(temp,[],context,xml); // Un-match failing elements by moving them back to matcherIn
i = temp.length;while(i--) {if(elem = temp[i]){matcherOut[postMap[i]] = !(matcherIn[postMap[i]] = elem);}}}if(seed){if(postFinder || preFilter){if(postFinder){ // Get the final matcherOut by condensing this intermediate into postFinder contexts
temp = [];i = matcherOut.length;while(i--) {if(elem = matcherOut[i]){ // Restore matcherIn since elem is not yet a final match
temp.push(matcherIn[i] = elem);}}postFinder(null,matcherOut = [],temp,xml);} // Move matched elements from seed to results to keep them synchronized
i = matcherOut.length;while(i--) {if((elem = matcherOut[i]) && (temp = postFinder?indexOf(seed,elem):preMap[i]) > -1){seed[temp] = !(results[temp] = elem);}}} // Add elements to results, through postFinder if defined
}else {matcherOut = condense(matcherOut === results?matcherOut.splice(preexisting,matcherOut.length):matcherOut);if(postFinder){postFinder(null,results,matcherOut,xml);}else {push.apply(results,matcherOut);}}});}function matcherFromTokens(tokens){var checkContext,matcher,j,len=tokens.length,leadingRelative=Expr.relative[tokens[0].type],implicitRelative=leadingRelative || Expr.relative[" "],i=leadingRelative?1:0, // The foundational matcher ensures that elements are reachable from top-level context(s)
matchContext=addCombinator(function(elem){return elem === checkContext;},implicitRelative,true),matchAnyContext=addCombinator(function(elem){return indexOf(checkContext,elem) > -1;},implicitRelative,true),matchers=[function(elem,context,xml){var ret=!leadingRelative && (xml || context !== outermostContext) || ((checkContext = context).nodeType?matchContext(elem,context,xml):matchAnyContext(elem,context,xml)); // Avoid hanging onto element (issue #299)
checkContext = null;return ret;}];for(;i < len;i++) {if(matcher = Expr.relative[tokens[i].type]){matchers = [addCombinator(elementMatcher(matchers),matcher)];}else {matcher = Expr.filter[tokens[i].type].apply(null,tokens[i].matches); // Return special upon seeing a positional matcher
if(matcher[expando]){ // Find the next relative operator (if any) for proper handling
j = ++i;for(;j < len;j++) {if(Expr.relative[tokens[j].type]){break;}}return setMatcher(i > 1 && elementMatcher(matchers),i > 1 && toSelector( // If the preceding token was a descendant combinator, insert an implicit any-element `*`
tokens.slice(0,i - 1).concat({value:tokens[i - 2].type === " "?"*":""})).replace(rtrim,"$1"),matcher,i < j && matcherFromTokens(tokens.slice(i,j)),j < len && matcherFromTokens(tokens = tokens.slice(j)),j < len && toSelector(tokens));}matchers.push(matcher);}}return elementMatcher(matchers);}function matcherFromGroupMatchers(elementMatchers,setMatchers){var bySet=setMatchers.length > 0,byElement=elementMatchers.length > 0,superMatcher=function superMatcher(seed,context,xml,results,outermost){var elem,j,matcher,matchedCount=0,i="0",unmatched=seed && [],setMatched=[],contextBackup=outermostContext, // We must always have either seed elements or outermost context
elems=seed || byElement && Expr.find["TAG"]("*",outermost), // Use integer dirruns iff this is the outermost matcher
dirrunsUnique=dirruns += contextBackup == null?1:Math.random() || 0.1,len=elems.length;if(outermost){outermostContext = context !== document && context;} // Add elements passing elementMatchers directly to results
// Keep `i` a string if there are no elements so `matchedCount` will be "00" below
// Support: IE<9, Safari
// Tolerate NodeList properties (IE: "length"; Safari: <number>) matching elements by id
for(;i !== len && (elem = elems[i]) != null;i++) {if(byElement && elem){j = 0;while(matcher = elementMatchers[j++]) {if(matcher(elem,context,xml)){results.push(elem);break;}}if(outermost){dirruns = dirrunsUnique;}} // Track unmatched elements for set filters
if(bySet){ // They will have gone through all possible matchers
if(elem = !matcher && elem){matchedCount--;} // Lengthen the array for every element, matched or not
if(seed){unmatched.push(elem);}}} // Apply set filters to unmatched elements
matchedCount += i;if(bySet && i !== matchedCount){j = 0;while(matcher = setMatchers[j++]) {matcher(unmatched,setMatched,context,xml);}if(seed){ // Reintegrate element matches to eliminate the need for sorting
if(matchedCount > 0){while(i--) {if(!(unmatched[i] || setMatched[i])){setMatched[i] = pop.call(results);}}} // Discard index placeholder values to get only actual matches
setMatched = condense(setMatched);} // Add matches to results
push.apply(results,setMatched); // Seedless set matches succeeding multiple successful matchers stipulate sorting
if(outermost && !seed && setMatched.length > 0 && matchedCount + setMatchers.length > 1){Sizzle.uniqueSort(results);}} // Override manipulation of globals by nested matchers
if(outermost){dirruns = dirrunsUnique;outermostContext = contextBackup;}return unmatched;};return bySet?markFunction(superMatcher):superMatcher;}compile = Sizzle.compile = function(selector,match /* Internal Use Only */){var i,setMatchers=[],elementMatchers=[],cached=compilerCache[selector + " "];if(!cached){ // Generate a function of recursive functions that can be used to check each element
if(!match){match = tokenize(selector);}i = match.length;while(i--) {cached = matcherFromTokens(match[i]);if(cached[expando]){setMatchers.push(cached);}else {elementMatchers.push(cached);}} // Cache the compiled function
cached = compilerCache(selector,matcherFromGroupMatchers(elementMatchers,setMatchers)); // Save selector and tokenization
cached.selector = selector;}return cached;}; /**
 * A low-level selection function that works with Sizzle's compiled
 *  selector functions
 * @param {String|Function} selector A selector or a pre-compiled
 *  selector function built with Sizzle.compile
 * @param {Element} context
 * @param {Array} [results]
 * @param {Array} [seed] A set of elements to match against
 */select = Sizzle.select = function(selector,context,results,seed){var i,tokens,token,type,find,compiled=typeof selector === "function" && selector,match=!seed && tokenize(selector = compiled.selector || selector);results = results || []; // Try to minimize operations if there is no seed and only one group
if(match.length === 1){ // Take a shortcut and set the context if the root selector is an ID
tokens = match[0] = match[0].slice(0);if(tokens.length > 2 && (token = tokens[0]).type === "ID" && support.getById && context.nodeType === 9 && documentIsHTML && Expr.relative[tokens[1].type]){context = (Expr.find["ID"](token.matches[0].replace(runescape,funescape),context) || [])[0];if(!context){return results; // Precompiled matchers will still verify ancestry, so step up a level
}else if(compiled){context = context.parentNode;}selector = selector.slice(tokens.shift().value.length);} // Fetch a seed set for right-to-left matching
i = matchExpr["needsContext"].test(selector)?0:tokens.length;while(i--) {token = tokens[i]; // Abort if we hit a combinator
if(Expr.relative[type = token.type]){break;}if(find = Expr.find[type]){ // Search, expanding context for leading sibling combinators
if(seed = find(token.matches[0].replace(runescape,funescape),rsibling.test(tokens[0].type) && testContext(context.parentNode) || context)){ // If seed is empty or no tokens remain, we can return early
tokens.splice(i,1);selector = seed.length && toSelector(tokens);if(!selector){push.apply(results,seed);return results;}break;}}}} // Compile and execute a filtering function if one is not provided
// Provide `match` to avoid retokenization if we modified the selector above
(compiled || compile(selector,match))(seed,context,!documentIsHTML,results,rsibling.test(selector) && testContext(context.parentNode) || context);return results;}; // One-time assignments
// Sort stability
support.sortStable = expando.split("").sort(sortOrder).join("") === expando; // Support: Chrome 14-35+
// Always assume duplicates if they aren't passed to the comparison function
support.detectDuplicates = !!hasDuplicate; // Initialize against the default document
setDocument(); // Support: Webkit<537.32 - Safari 6.0.3/Chrome 25 (fixed in Chrome 27)
// Detached nodes confoundingly follow *each other*
support.sortDetached = assert(function(div1){ // Should return 1, but returns 4 (following)
return div1.compareDocumentPosition(document.createElement("div")) & 1;}); // Support: IE<8
// Prevent attribute/property "interpolation"
// http://msdn.microsoft.com/en-us/library/ms536429%28VS.85%29.aspx
if(!assert(function(div){div.innerHTML = "<a href='#'></a>";return div.firstChild.getAttribute("href") === "#";})){addHandle("type|href|height|width",function(elem,name,isXML){if(!isXML){return elem.getAttribute(name,name.toLowerCase() === "type"?1:2);}});} // Support: IE<9
// Use defaultValue in place of getAttribute("value")
if(!support.attributes || !assert(function(div){div.innerHTML = "<input/>";div.firstChild.setAttribute("value","");return div.firstChild.getAttribute("value") === "";})){addHandle("value",function(elem,name,isXML){if(!isXML && elem.nodeName.toLowerCase() === "input"){return elem.defaultValue;}});} // Support: IE<9
// Use getAttributeNode to fetch booleans when getAttribute lies
if(!assert(function(div){return div.getAttribute("disabled") == null;})){addHandle(booleans,function(elem,name,isXML){var val;if(!isXML){return elem[name] === true?name.toLowerCase():(val = elem.getAttributeNode(name)) && val.specified?val.value:null;}});}return Sizzle;})(window);jQuery.find = Sizzle;jQuery.expr = Sizzle.selectors;jQuery.expr[":"] = jQuery.expr.pseudos;jQuery.unique = Sizzle.uniqueSort;jQuery.text = Sizzle.getText;jQuery.isXMLDoc = Sizzle.isXML;jQuery.contains = Sizzle.contains;var rneedsContext=jQuery.expr.match.needsContext;var rsingleTag=/^<(\w+)\s*\/?>(?:<\/\1>|)$/;var risSimple=/^.[^:#\[\.,]*$/; // Implement the identical functionality for filter and not
function winnow(elements,qualifier,not){if(jQuery.isFunction(qualifier)){return jQuery.grep(elements,function(elem,i){ /* jshint -W018 */return !!qualifier.call(elem,i,elem) !== not;});}if(qualifier.nodeType){return jQuery.grep(elements,function(elem){return elem === qualifier !== not;});}if(typeof qualifier === "string"){if(risSimple.test(qualifier)){return jQuery.filter(qualifier,elements,not);}qualifier = jQuery.filter(qualifier,elements);}return jQuery.grep(elements,function(elem){return indexOf.call(qualifier,elem) >= 0 !== not;});}jQuery.filter = function(expr,elems,not){var elem=elems[0];if(not){expr = ":not(" + expr + ")";}return elems.length === 1 && elem.nodeType === 1?jQuery.find.matchesSelector(elem,expr)?[elem]:[]:jQuery.find.matches(expr,jQuery.grep(elems,function(elem){return elem.nodeType === 1;}));};jQuery.fn.extend({find:function find(selector){var i,len=this.length,ret=[],self=this;if(typeof selector !== "string"){return this.pushStack(jQuery(selector).filter(function(){for(i = 0;i < len;i++) {if(jQuery.contains(self[i],this)){return true;}}}));}for(i = 0;i < len;i++) {jQuery.find(selector,self[i],ret);} // Needed because $( selector, context ) becomes $( context ).find( selector )
ret = this.pushStack(len > 1?jQuery.unique(ret):ret);ret.selector = this.selector?this.selector + " " + selector:selector;return ret;},filter:function filter(selector){return this.pushStack(winnow(this,selector || [],false));},not:function not(selector){return this.pushStack(winnow(this,selector || [],true));},is:function is(selector){return !!winnow(this, // If this is a positional/relative selector, check membership in the returned set
// so $("p:first").is("p:last") won't return true for a doc with two "p".
typeof selector === "string" && rneedsContext.test(selector)?jQuery(selector):selector || [],false).length;}}); // Initialize a jQuery object
// A central reference to the root jQuery(document)
var rootjQuery, // A simple way to check for HTML strings
// Prioritize #id over <tag> to avoid XSS via location.hash (#9521)
// Strict HTML recognition (#11290: must start with <)
rquickExpr=/^(?:\s*(<[\w\W]+>)[^>]*|#([\w-]*))$/,init=jQuery.fn.init = function(selector,context){var match,elem; // HANDLE: $(""), $(null), $(undefined), $(false)
if(!selector){return this;} // Handle HTML strings
if(typeof selector === "string"){if(selector[0] === "<" && selector[selector.length - 1] === ">" && selector.length >= 3){ // Assume that strings that start and end with <> are HTML and skip the regex check
match = [null,selector,null];}else {match = rquickExpr.exec(selector);} // Match html or make sure no context is specified for #id
if(match && (match[1] || !context)){ // HANDLE: $(html) -> $(array)
if(match[1]){context = context instanceof jQuery?context[0]:context; // Option to run scripts is true for back-compat
// Intentionally let the error be thrown if parseHTML is not present
jQuery.merge(this,jQuery.parseHTML(match[1],context && context.nodeType?context.ownerDocument || context:document,true)); // HANDLE: $(html, props)
if(rsingleTag.test(match[1]) && jQuery.isPlainObject(context)){for(match in context) { // Properties of context are called as methods if possible
if(jQuery.isFunction(this[match])){this[match](context[match]); // ...and otherwise set as attributes
}else {this.attr(match,context[match]);}}}return this; // HANDLE: $(#id)
}else {elem = document.getElementById(match[2]); // Support: Blackberry 4.6
// gEBID returns nodes no longer in the document (#6963)
if(elem && elem.parentNode){ // Inject the element directly into the jQuery object
this.length = 1;this[0] = elem;}this.context = document;this.selector = selector;return this;} // HANDLE: $(expr, $(...))
}else if(!context || context.jquery){return (context || rootjQuery).find(selector); // HANDLE: $(expr, context)
// (which is just equivalent to: $(context).find(expr)
}else {return this.constructor(context).find(selector);} // HANDLE: $(DOMElement)
}else if(selector.nodeType){this.context = this[0] = selector;this.length = 1;return this; // HANDLE: $(function)
// Shortcut for document ready
}else if(jQuery.isFunction(selector)){return typeof rootjQuery.ready !== "undefined"?rootjQuery.ready(selector): // Execute immediately if ready is not present
selector(jQuery);}if(selector.selector !== undefined){this.selector = selector.selector;this.context = selector.context;}return jQuery.makeArray(selector,this);}; // Give the init function the jQuery prototype for later instantiation
init.prototype = jQuery.fn; // Initialize central reference
rootjQuery = jQuery(document);var rparentsprev=/^(?:parents|prev(?:Until|All))/, // Methods guaranteed to produce a unique set when starting from a unique set
guaranteedUnique={children:true,contents:true,next:true,prev:true};jQuery.extend({dir:function dir(elem,_dir,until){var matched=[],truncate=until !== undefined;while((elem = elem[_dir]) && elem.nodeType !== 9) {if(elem.nodeType === 1){if(truncate && jQuery(elem).is(until)){break;}matched.push(elem);}}return matched;},sibling:function sibling(n,elem){var matched=[];for(;n;n = n.nextSibling) {if(n.nodeType === 1 && n !== elem){matched.push(n);}}return matched;}});jQuery.fn.extend({has:function has(target){var targets=jQuery(target,this),l=targets.length;return this.filter(function(){var i=0;for(;i < l;i++) {if(jQuery.contains(this,targets[i])){return true;}}});},closest:function closest(selectors,context){var cur,i=0,l=this.length,matched=[],pos=rneedsContext.test(selectors) || typeof selectors !== "string"?jQuery(selectors,context || this.context):0;for(;i < l;i++) {for(cur = this[i];cur && cur !== context;cur = cur.parentNode) { // Always skip document fragments
if(cur.nodeType < 11 && (pos?pos.index(cur) > -1: // Don't pass non-elements to Sizzle
cur.nodeType === 1 && jQuery.find.matchesSelector(cur,selectors))){matched.push(cur);break;}}}return this.pushStack(matched.length > 1?jQuery.unique(matched):matched);}, // Determine the position of an element within the set
index:function index(elem){ // No argument, return index in parent
if(!elem){return this[0] && this[0].parentNode?this.first().prevAll().length:-1;} // Index in selector
if(typeof elem === "string"){return indexOf.call(jQuery(elem),this[0]);} // Locate the position of the desired element
return indexOf.call(this, // If it receives a jQuery object, the first element is used
elem.jquery?elem[0]:elem);},add:function add(selector,context){return this.pushStack(jQuery.unique(jQuery.merge(this.get(),jQuery(selector,context))));},addBack:function addBack(selector){return this.add(selector == null?this.prevObject:this.prevObject.filter(selector));}});function sibling(cur,dir){while((cur = cur[dir]) && cur.nodeType !== 1) {}return cur;}jQuery.each({parent:function parent(elem){var parent=elem.parentNode;return parent && parent.nodeType !== 11?parent:null;},parents:function parents(elem){return jQuery.dir(elem,"parentNode");},parentsUntil:function parentsUntil(elem,i,until){return jQuery.dir(elem,"parentNode",until);},next:function next(elem){return sibling(elem,"nextSibling");},prev:function prev(elem){return sibling(elem,"previousSibling");},nextAll:function nextAll(elem){return jQuery.dir(elem,"nextSibling");},prevAll:function prevAll(elem){return jQuery.dir(elem,"previousSibling");},nextUntil:function nextUntil(elem,i,until){return jQuery.dir(elem,"nextSibling",until);},prevUntil:function prevUntil(elem,i,until){return jQuery.dir(elem,"previousSibling",until);},siblings:function siblings(elem){return jQuery.sibling((elem.parentNode || {}).firstChild,elem);},children:function children(elem){return jQuery.sibling(elem.firstChild);},contents:function contents(elem){return elem.contentDocument || jQuery.merge([],elem.childNodes);}},function(name,fn){jQuery.fn[name] = function(until,selector){var matched=jQuery.map(this,fn,until);if(name.slice(-5) !== "Until"){selector = until;}if(selector && typeof selector === "string"){matched = jQuery.filter(selector,matched);}if(this.length > 1){ // Remove duplicates
if(!guaranteedUnique[name]){jQuery.unique(matched);} // Reverse order for parents* and prev-derivatives
if(rparentsprev.test(name)){matched.reverse();}}return this.pushStack(matched);};});var rnotwhite=/\S+/g; // String to Object options format cache
var optionsCache={}; // Convert String-formatted options into Object-formatted ones and store in cache
function createOptions(options){var object=optionsCache[options] = {};jQuery.each(options.match(rnotwhite) || [],function(_,flag){object[flag] = true;});return object;} /*
 * Create a callback list using the following parameters:
 *
 *	options: an optional list of space-separated options that will change how
 *			the callback list behaves or a more traditional option object
 *
 * By default a callback list will act like an event callback list and can be
 * "fired" multiple times.
 *
 * Possible options:
 *
 *	once:			will ensure the callback list can only be fired once (like a Deferred)
 *
 *	memory:			will keep track of previous values and will call any callback added
 *					after the list has been fired right away with the latest "memorized"
 *					values (like a Deferred)
 *
 *	unique:			will ensure a callback can only be added once (no duplicate in the list)
 *
 *	stopOnFalse:	interrupt callings when a callback returns false
 *
 */jQuery.Callbacks = function(options){ // Convert options from String-formatted to Object-formatted if needed
// (we check in cache first)
options = typeof options === "string"?optionsCache[options] || createOptions(options):jQuery.extend({},options);var  // Last fire value (for non-forgettable lists)
memory, // Flag to know if list was already fired
_fired, // Flag to know if list is currently firing
firing, // First callback to fire (used internally by add and fireWith)
firingStart, // End of the loop when firing
firingLength, // Index of currently firing callback (modified by remove if needed)
firingIndex, // Actual callback list
list=[], // Stack of fire calls for repeatable lists
stack=!options.once && [], // Fire callbacks
fire=function fire(data){memory = options.memory && data;_fired = true;firingIndex = firingStart || 0;firingStart = 0;firingLength = list.length;firing = true;for(;list && firingIndex < firingLength;firingIndex++) {if(list[firingIndex].apply(data[0],data[1]) === false && options.stopOnFalse){memory = false; // To prevent further calls using add
break;}}firing = false;if(list){if(stack){if(stack.length){fire(stack.shift());}}else if(memory){list = [];}else {self.disable();}}}, // Actual Callbacks object
self={ // Add a callback or a collection of callbacks to the list
add:function add(){if(list){ // First, we save the current length
var start=list.length;(function add(args){jQuery.each(args,function(_,arg){var type=jQuery.type(arg);if(type === "function"){if(!options.unique || !self.has(arg)){list.push(arg);}}else if(arg && arg.length && type !== "string"){ // Inspect recursively
add(arg);}});})(arguments); // Do we need to add the callbacks to the
// current firing batch?
if(firing){firingLength = list.length; // With memory, if we're not firing then
// we should call right away
}else if(memory){firingStart = start;fire(memory);}}return this;}, // Remove a callback from the list
remove:function remove(){if(list){jQuery.each(arguments,function(_,arg){var index;while((index = jQuery.inArray(arg,list,index)) > -1) {list.splice(index,1); // Handle firing indexes
if(firing){if(index <= firingLength){firingLength--;}if(index <= firingIndex){firingIndex--;}}}});}return this;}, // Check if a given callback is in the list.
// If no argument is given, return whether or not list has callbacks attached.
has:function has(fn){return fn?jQuery.inArray(fn,list) > -1:!!(list && list.length);}, // Remove all callbacks from the list
empty:function empty(){list = [];firingLength = 0;return this;}, // Have the list do nothing anymore
disable:function disable(){list = stack = memory = undefined;return this;}, // Is it disabled?
disabled:function disabled(){return !list;}, // Lock the list in its current state
lock:function lock(){stack = undefined;if(!memory){self.disable();}return this;}, // Is it locked?
locked:function locked(){return !stack;}, // Call all callbacks with the given context and arguments
fireWith:function fireWith(context,args){if(list && (!_fired || stack)){args = args || [];args = [context,args.slice?args.slice():args];if(firing){stack.push(args);}else {fire(args);}}return this;}, // Call all the callbacks with the given arguments
fire:function fire(){self.fireWith(this,arguments);return this;}, // To know if the callbacks have already been called at least once
fired:function fired(){return !!_fired;}};return self;};jQuery.extend({Deferred:function Deferred(func){var tuples=[ // action, add listener, listener list, final state
["resolve","done",jQuery.Callbacks("once memory"),"resolved"],["reject","fail",jQuery.Callbacks("once memory"),"rejected"],["notify","progress",jQuery.Callbacks("memory")]],_state="pending",_promise={state:function state(){return _state;},always:function always(){deferred.done(arguments).fail(arguments);return this;},then:function then() /* fnDone, fnFail, fnProgress */{var fns=arguments;return jQuery.Deferred(function(newDefer){jQuery.each(tuples,function(i,tuple){var fn=jQuery.isFunction(fns[i]) && fns[i]; // deferred[ done | fail | progress ] for forwarding actions to newDefer
deferred[tuple[1]](function(){var returned=fn && fn.apply(this,arguments);if(returned && jQuery.isFunction(returned.promise)){returned.promise().done(newDefer.resolve).fail(newDefer.reject).progress(newDefer.notify);}else {newDefer[tuple[0] + "With"](this === _promise?newDefer.promise():this,fn?[returned]:arguments);}});});fns = null;}).promise();}, // Get a promise for this deferred
// If obj is provided, the promise aspect is added to the object
promise:function promise(obj){return obj != null?jQuery.extend(obj,_promise):_promise;}},deferred={}; // Keep pipe for back-compat
_promise.pipe = _promise.then; // Add list-specific methods
jQuery.each(tuples,function(i,tuple){var list=tuple[2],stateString=tuple[3]; // promise[ done | fail | progress ] = list.add
_promise[tuple[1]] = list.add; // Handle state
if(stateString){list.add(function(){ // state = [ resolved | rejected ]
_state = stateString; // [ reject_list | resolve_list ].disable; progress_list.lock
},tuples[i ^ 1][2].disable,tuples[2][2].lock);} // deferred[ resolve | reject | notify ]
deferred[tuple[0]] = function(){deferred[tuple[0] + "With"](this === deferred?_promise:this,arguments);return this;};deferred[tuple[0] + "With"] = list.fireWith;}); // Make the deferred a promise
_promise.promise(deferred); // Call given func if any
if(func){func.call(deferred,deferred);} // All done!
return deferred;}, // Deferred helper
when:function when(subordinate /* , ..., subordinateN */){var i=0,resolveValues=_slice.call(arguments),length=resolveValues.length, // the count of uncompleted subordinates
remaining=length !== 1 || subordinate && jQuery.isFunction(subordinate.promise)?length:0, // the master Deferred. If resolveValues consist of only a single Deferred, just use that.
deferred=remaining === 1?subordinate:jQuery.Deferred(), // Update function for both resolve and progress values
updateFunc=function updateFunc(i,contexts,values){return function(value){contexts[i] = this;values[i] = arguments.length > 1?_slice.call(arguments):value;if(values === progressValues){deferred.notifyWith(contexts,values);}else if(! --remaining){deferred.resolveWith(contexts,values);}};},progressValues,progressContexts,resolveContexts; // Add listeners to Deferred subordinates; treat others as resolved
if(length > 1){progressValues = new Array(length);progressContexts = new Array(length);resolveContexts = new Array(length);for(;i < length;i++) {if(resolveValues[i] && jQuery.isFunction(resolveValues[i].promise)){resolveValues[i].promise().done(updateFunc(i,resolveContexts,resolveValues)).fail(deferred.reject).progress(updateFunc(i,progressContexts,progressValues));}else {--remaining;}}} // If we're not waiting on anything, resolve the master
if(!remaining){deferred.resolveWith(resolveContexts,resolveValues);}return deferred.promise();}}); // The deferred used on DOM ready
var readyList;jQuery.fn.ready = function(fn){ // Add the callback
jQuery.ready.promise().done(fn);return this;};jQuery.extend({ // Is the DOM ready to be used? Set to true once it occurs.
isReady:false, // A counter to track how many items to wait for before
// the ready event fires. See #6781
readyWait:1, // Hold (or release) the ready event
holdReady:function holdReady(hold){if(hold){jQuery.readyWait++;}else {jQuery.ready(true);}}, // Handle when the DOM is ready
ready:function ready(wait){ // Abort if there are pending holds or we're already ready
if(wait === true?--jQuery.readyWait:jQuery.isReady){return;} // Remember that the DOM is ready
jQuery.isReady = true; // If a normal DOM Ready event fired, decrement, and wait if need be
if(wait !== true && --jQuery.readyWait > 0){return;} // If there are functions bound, to execute
readyList.resolveWith(document,[jQuery]); // Trigger any bound ready events
if(jQuery.fn.triggerHandler){jQuery(document).triggerHandler("ready");jQuery(document).off("ready");}}}); /**
 * The ready event handler and self cleanup method
 */function completed(){document.removeEventListener("DOMContentLoaded",completed,false);window.removeEventListener("load",completed,false);jQuery.ready();}jQuery.ready.promise = function(obj){if(!readyList){readyList = jQuery.Deferred(); // Catch cases where $(document).ready() is called after the browser event has already occurred.
// We once tried to use readyState "interactive" here, but it caused issues like the one
// discovered by ChrisS here: http://bugs.jquery.com/ticket/12282#comment:15
if(document.readyState === "complete"){ // Handle it asynchronously to allow scripts the opportunity to delay ready
setTimeout(jQuery.ready);}else { // Use the handy event callback
document.addEventListener("DOMContentLoaded",completed,false); // A fallback to window.onload, that will always work
window.addEventListener("load",completed,false);}}return readyList.promise(obj);}; // Kick off the DOM ready check even if the user does not
jQuery.ready.promise(); // Multifunctional method to get and set values of a collection
// The value/s can optionally be executed if it's a function
var access=jQuery.access = function(elems,fn,key,value,chainable,emptyGet,raw){var i=0,len=elems.length,bulk=key == null; // Sets many values
if(jQuery.type(key) === "object"){chainable = true;for(i in key) {jQuery.access(elems,fn,i,key[i],true,emptyGet,raw);} // Sets one value
}else if(value !== undefined){chainable = true;if(!jQuery.isFunction(value)){raw = true;}if(bulk){ // Bulk operations run against the entire set
if(raw){fn.call(elems,value);fn = null; // ...except when executing function values
}else {bulk = fn;fn = function(elem,key,value){return bulk.call(jQuery(elem),value);};}}if(fn){for(;i < len;i++) {fn(elems[i],key,raw?value:value.call(elems[i],i,fn(elems[i],key)));}}}return chainable?elems: // Gets
bulk?fn.call(elems):len?fn(elems[0],key):emptyGet;}; /**
 * Determines whether an object can have data
 */jQuery.acceptData = function(owner){ // Accepts only:
//  - Node
//    - Node.ELEMENT_NODE
//    - Node.DOCUMENT_NODE
//  - Object
//    - Any
/* jshint -W018 */return owner.nodeType === 1 || owner.nodeType === 9 || ! +owner.nodeType;};function Data(){ // Support: Android<4,
// Old WebKit does not have Object.preventExtensions/freeze method,
// return new empty object instead with no [[set]] accessor
Object.defineProperty(this.cache = {},0,{get:function get(){return {};}});this.expando = jQuery.expando + Data.uid++;}Data.uid = 1;Data.accepts = jQuery.acceptData;Data.prototype = {key:function key(owner){ // We can accept data for non-element nodes in modern browsers,
// but we should not, see #8335.
// Always return the key for a frozen object.
if(!Data.accepts(owner)){return 0;}var descriptor={}, // Check if the owner object already has a cache key
unlock=owner[this.expando]; // If not, create one
if(!unlock){unlock = Data.uid++; // Secure it in a non-enumerable, non-writable property
try{descriptor[this.expando] = {value:unlock};Object.defineProperties(owner,descriptor); // Support: Android<4
// Fallback to a less secure definition
}catch(e) {descriptor[this.expando] = unlock;jQuery.extend(owner,descriptor);}} // Ensure the cache object
if(!this.cache[unlock]){this.cache[unlock] = {};}return unlock;},set:function set(owner,data,value){var prop, // There may be an unlock assigned to this node,
// if there is no entry for this "owner", create one inline
// and set the unlock as though an owner entry had always existed
unlock=this.key(owner),cache=this.cache[unlock]; // Handle: [ owner, key, value ] args
if(typeof data === "string"){cache[data] = value; // Handle: [ owner, { properties } ] args
}else { // Fresh assignments by object are shallow copied
if(jQuery.isEmptyObject(cache)){jQuery.extend(this.cache[unlock],data); // Otherwise, copy the properties one-by-one to the cache object
}else {for(prop in data) {cache[prop] = data[prop];}}}return cache;},get:function get(owner,key){ // Either a valid cache is found, or will be created.
// New caches will be created and the unlock returned,
// allowing direct access to the newly created
// empty data object. A valid owner object must be provided.
var cache=this.cache[this.key(owner)];return key === undefined?cache:cache[key];},access:function access(owner,key,value){var stored; // In cases where either:
//
//   1. No key was specified
//   2. A string key was specified, but no value provided
//
// Take the "read" path and allow the get method to determine
// which value to return, respectively either:
//
//   1. The entire cache object
//   2. The data stored at the key
//
if(key === undefined || key && typeof key === "string" && value === undefined){stored = this.get(owner,key);return stored !== undefined?stored:this.get(owner,jQuery.camelCase(key));} // [*]When the key is not a string, or both a key and value
// are specified, set or extend (existing objects) with either:
//
//   1. An object of properties
//   2. A key and value
//
this.set(owner,key,value); // Since the "set" path can have two possible entry points
// return the expected data based on which path was taken[*]
return value !== undefined?value:key;},remove:function remove(owner,key){var i,name,camel,unlock=this.key(owner),cache=this.cache[unlock];if(key === undefined){this.cache[unlock] = {};}else { // Support array or space separated string of keys
if(jQuery.isArray(key)){ // If "name" is an array of keys...
// When data is initially created, via ("key", "val") signature,
// keys will be converted to camelCase.
// Since there is no way to tell _how_ a key was added, remove
// both plain key and camelCase key. #12786
// This will only penalize the array argument path.
name = key.concat(key.map(jQuery.camelCase));}else {camel = jQuery.camelCase(key); // Try the string as a key before any manipulation
if(key in cache){name = [key,camel];}else { // If a key with the spaces exists, use it.
// Otherwise, create an array by matching non-whitespace
name = camel;name = name in cache?[name]:name.match(rnotwhite) || [];}}i = name.length;while(i--) {delete cache[name[i]];}}},hasData:function hasData(owner){return !jQuery.isEmptyObject(this.cache[owner[this.expando]] || {});},discard:function discard(owner){if(owner[this.expando]){delete this.cache[owner[this.expando]];}}};var data_priv=new Data();var data_user=new Data(); //	Implementation Summary
//
//	1. Enforce API surface and semantic compatibility with 1.9.x branch
//	2. Improve the module's maintainability by reducing the storage
//		paths to a single mechanism.
//	3. Use the same single mechanism to support "private" and "user" data.
//	4. _Never_ expose "private" data to user code (TODO: Drop _data, _removeData)
//	5. Avoid exposing implementation details on user objects (eg. expando properties)
//	6. Provide a clear path for implementation upgrade to WeakMap in 2014
var rbrace=/^(?:\{[\w\W]*\}|\[[\w\W]*\])$/,rmultiDash=/([A-Z])/g;function dataAttr(elem,key,data){var name; // If nothing was found internally, try to fetch any
// data from the HTML5 data-* attribute
if(data === undefined && elem.nodeType === 1){name = "data-" + key.replace(rmultiDash,"-$1").toLowerCase();data = elem.getAttribute(name);if(typeof data === "string"){try{data = data === "true"?true:data === "false"?false:data === "null"?null: // Only convert to a number if it doesn't change the string
+data + "" === data?+data:rbrace.test(data)?jQuery.parseJSON(data):data;}catch(e) {} // Make sure we set the data so it isn't changed later
data_user.set(elem,key,data);}else {data = undefined;}}return data;}jQuery.extend({hasData:function hasData(elem){return data_user.hasData(elem) || data_priv.hasData(elem);},data:function data(elem,name,_data){return data_user.access(elem,name,_data);},removeData:function removeData(elem,name){data_user.remove(elem,name);}, // TODO: Now that all calls to _data and _removeData have been replaced
// with direct calls to data_priv methods, these can be deprecated.
_data:function _data(elem,name,data){return data_priv.access(elem,name,data);},_removeData:function _removeData(elem,name){data_priv.remove(elem,name);}});jQuery.fn.extend({data:function data(key,value){var i,name,data,elem=this[0],attrs=elem && elem.attributes; // Gets all values
if(key === undefined){if(this.length){data = data_user.get(elem);if(elem.nodeType === 1 && !data_priv.get(elem,"hasDataAttrs")){i = attrs.length;while(i--) { // Support: IE11+
// The attrs elements can be null (#14894)
if(attrs[i]){name = attrs[i].name;if(name.indexOf("data-") === 0){name = jQuery.camelCase(name.slice(5));dataAttr(elem,name,data[name]);}}}data_priv.set(elem,"hasDataAttrs",true);}}return data;} // Sets multiple values
if(typeof key === "object"){return this.each(function(){data_user.set(this,key);});}return access(this,function(value){var data,camelKey=jQuery.camelCase(key); // The calling jQuery object (element matches) is not empty
// (and therefore has an element appears at this[ 0 ]) and the
// `value` parameter was not undefined. An empty jQuery object
// will result in `undefined` for elem = this[ 0 ] which will
// throw an exception if an attempt to read a data cache is made.
if(elem && value === undefined){ // Attempt to get data from the cache
// with the key as-is
data = data_user.get(elem,key);if(data !== undefined){return data;} // Attempt to get data from the cache
// with the key camelized
data = data_user.get(elem,camelKey);if(data !== undefined){return data;} // Attempt to "discover" the data in
// HTML5 custom data-* attrs
data = dataAttr(elem,camelKey,undefined);if(data !== undefined){return data;} // We tried really hard, but the data doesn't exist.
return;} // Set the data...
this.each(function(){ // First, attempt to store a copy or reference of any
// data that might've been store with a camelCased key.
var data=data_user.get(this,camelKey); // For HTML5 data-* attribute interop, we have to
// store property names with dashes in a camelCase form.
// This might not apply to all properties...*
data_user.set(this,camelKey,value); // *... In the case of properties that might _actually_
// have dashes, we need to also store a copy of that
// unchanged property.
if(key.indexOf("-") !== -1 && data !== undefined){data_user.set(this,key,value);}});},null,value,arguments.length > 1,null,true);},removeData:function removeData(key){return this.each(function(){data_user.remove(this,key);});}});jQuery.extend({queue:function queue(elem,type,data){var queue;if(elem){type = (type || "fx") + "queue";queue = data_priv.get(elem,type); // Speed up dequeue by getting out quickly if this is just a lookup
if(data){if(!queue || jQuery.isArray(data)){queue = data_priv.access(elem,type,jQuery.makeArray(data));}else {queue.push(data);}}return queue || [];}},dequeue:function dequeue(elem,type){type = type || "fx";var queue=jQuery.queue(elem,type),startLength=queue.length,fn=queue.shift(),hooks=jQuery._queueHooks(elem,type),next=function next(){jQuery.dequeue(elem,type);}; // If the fx queue is dequeued, always remove the progress sentinel
if(fn === "inprogress"){fn = queue.shift();startLength--;}if(fn){ // Add a progress sentinel to prevent the fx queue from being
// automatically dequeued
if(type === "fx"){queue.unshift("inprogress");} // Clear up the last queue stop function
delete hooks.stop;fn.call(elem,next,hooks);}if(!startLength && hooks){hooks.empty.fire();}}, // Not public - generate a queueHooks object, or return the current one
_queueHooks:function _queueHooks(elem,type){var key=type + "queueHooks";return data_priv.get(elem,key) || data_priv.access(elem,key,{empty:jQuery.Callbacks("once memory").add(function(){data_priv.remove(elem,[type + "queue",key]);})});}});jQuery.fn.extend({queue:function queue(type,data){var setter=2;if(typeof type !== "string"){data = type;type = "fx";setter--;}if(arguments.length < setter){return jQuery.queue(this[0],type);}return data === undefined?this:this.each(function(){var queue=jQuery.queue(this,type,data); // Ensure a hooks for this queue
jQuery._queueHooks(this,type);if(type === "fx" && queue[0] !== "inprogress"){jQuery.dequeue(this,type);}});},dequeue:function dequeue(type){return this.each(function(){jQuery.dequeue(this,type);});},clearQueue:function clearQueue(type){return this.queue(type || "fx",[]);}, // Get a promise resolved when queues of a certain type
// are emptied (fx is the type by default)
promise:function promise(type,obj){var tmp,count=1,defer=jQuery.Deferred(),elements=this,i=this.length,resolve=function resolve(){if(! --count){defer.resolveWith(elements,[elements]);}};if(typeof type !== "string"){obj = type;type = undefined;}type = type || "fx";while(i--) {tmp = data_priv.get(elements[i],type + "queueHooks");if(tmp && tmp.empty){count++;tmp.empty.add(resolve);}}resolve();return defer.promise(obj);}});var pnum=/[+-]?(?:\d*\.|)\d+(?:[eE][+-]?\d+|)/.source;var cssExpand=["Top","Right","Bottom","Left"];var isHidden=function isHidden(elem,el){ // isHidden might be called from jQuery#filter function;
// in that case, element will be second argument
elem = el || elem;return jQuery.css(elem,"display") === "none" || !jQuery.contains(elem.ownerDocument,elem);};var rcheckableType=/^(?:checkbox|radio)$/i;(function(){var fragment=document.createDocumentFragment(),div=fragment.appendChild(document.createElement("div")),input=document.createElement("input"); // Support: Safari<=5.1
// Check state lost if the name is set (#11217)
// Support: Windows Web Apps (WWA)
// `name` and `type` must use .setAttribute for WWA (#14901)
input.setAttribute("type","radio");input.setAttribute("checked","checked");input.setAttribute("name","t");div.appendChild(input); // Support: Safari<=5.1, Android<4.2
// Older WebKit doesn't clone checked state correctly in fragments
support.checkClone = div.cloneNode(true).cloneNode(true).lastChild.checked; // Support: IE<=11+
// Make sure textarea (and checkbox) defaultValue is properly cloned
div.innerHTML = "<textarea>x</textarea>";support.noCloneChecked = !!div.cloneNode(true).lastChild.defaultValue;})();var strundefined=typeof undefined;support.focusinBubbles = "onfocusin" in window;var rkeyEvent=/^key/,rmouseEvent=/^(?:mouse|pointer|contextmenu)|click/,rfocusMorph=/^(?:focusinfocus|focusoutblur)$/,rtypenamespace=/^([^.]*)(?:\.(.+)|)$/;function returnTrue(){return true;}function returnFalse(){return false;}function safeActiveElement(){try{return document.activeElement;}catch(err) {}} /*
 * Helper functions for managing events -- not part of the public interface.
 * Props to Dean Edwards' addEvent library for many of the ideas.
 */jQuery.event = {global:{},add:function add(elem,types,handler,data,selector){var handleObjIn,eventHandle,tmp,events,t,handleObj,special,handlers,type,namespaces,origType,elemData=data_priv.get(elem); // Don't attach events to noData or text/comment nodes (but allow plain objects)
if(!elemData){return;} // Caller can pass in an object of custom data in lieu of the handler
if(handler.handler){handleObjIn = handler;handler = handleObjIn.handler;selector = handleObjIn.selector;} // Make sure that the handler has a unique ID, used to find/remove it later
if(!handler.guid){handler.guid = jQuery.guid++;} // Init the element's event structure and main handler, if this is the first
if(!(events = elemData.events)){events = elemData.events = {};}if(!(eventHandle = elemData.handle)){eventHandle = elemData.handle = function(e){ // Discard the second event of a jQuery.event.trigger() and
// when an event is called after a page has unloaded
return typeof jQuery !== strundefined && jQuery.event.triggered !== e.type?jQuery.event.dispatch.apply(elem,arguments):undefined;};} // Handle multiple events separated by a space
types = (types || "").match(rnotwhite) || [""];t = types.length;while(t--) {tmp = rtypenamespace.exec(types[t]) || [];type = origType = tmp[1];namespaces = (tmp[2] || "").split(".").sort(); // There *must* be a type, no attaching namespace-only handlers
if(!type){continue;} // If event changes its type, use the special event handlers for the changed type
special = jQuery.event.special[type] || {}; // If selector defined, determine special event api type, otherwise given type
type = (selector?special.delegateType:special.bindType) || type; // Update special based on newly reset type
special = jQuery.event.special[type] || {}; // handleObj is passed to all event handlers
handleObj = jQuery.extend({type:type,origType:origType,data:data,handler:handler,guid:handler.guid,selector:selector,needsContext:selector && jQuery.expr.match.needsContext.test(selector),namespace:namespaces.join(".")},handleObjIn); // Init the event handler queue if we're the first
if(!(handlers = events[type])){handlers = events[type] = [];handlers.delegateCount = 0; // Only use addEventListener if the special events handler returns false
if(!special.setup || special.setup.call(elem,data,namespaces,eventHandle) === false){if(elem.addEventListener){elem.addEventListener(type,eventHandle,false);}}}if(special.add){special.add.call(elem,handleObj);if(!handleObj.handler.guid){handleObj.handler.guid = handler.guid;}} // Add to the element's handler list, delegates in front
if(selector){handlers.splice(handlers.delegateCount++,0,handleObj);}else {handlers.push(handleObj);} // Keep track of which events have ever been used, for event optimization
jQuery.event.global[type] = true;}}, // Detach an event or set of events from an element
remove:function remove(elem,types,handler,selector,mappedTypes){var j,origCount,tmp,events,t,handleObj,special,handlers,type,namespaces,origType,elemData=data_priv.hasData(elem) && data_priv.get(elem);if(!elemData || !(events = elemData.events)){return;} // Once for each type.namespace in types; type may be omitted
types = (types || "").match(rnotwhite) || [""];t = types.length;while(t--) {tmp = rtypenamespace.exec(types[t]) || [];type = origType = tmp[1];namespaces = (tmp[2] || "").split(".").sort(); // Unbind all events (on this namespace, if provided) for the element
if(!type){for(type in events) {jQuery.event.remove(elem,type + types[t],handler,selector,true);}continue;}special = jQuery.event.special[type] || {};type = (selector?special.delegateType:special.bindType) || type;handlers = events[type] || [];tmp = tmp[2] && new RegExp("(^|\\.)" + namespaces.join("\\.(?:.*\\.|)") + "(\\.|$)"); // Remove matching events
origCount = j = handlers.length;while(j--) {handleObj = handlers[j];if((mappedTypes || origType === handleObj.origType) && (!handler || handler.guid === handleObj.guid) && (!tmp || tmp.test(handleObj.namespace)) && (!selector || selector === handleObj.selector || selector === "**" && handleObj.selector)){handlers.splice(j,1);if(handleObj.selector){handlers.delegateCount--;}if(special.remove){special.remove.call(elem,handleObj);}}} // Remove generic event handler if we removed something and no more handlers exist
// (avoids potential for endless recursion during removal of special event handlers)
if(origCount && !handlers.length){if(!special.teardown || special.teardown.call(elem,namespaces,elemData.handle) === false){jQuery.removeEvent(elem,type,elemData.handle);}delete events[type];}} // Remove the expando if it's no longer used
if(jQuery.isEmptyObject(events)){delete elemData.handle;data_priv.remove(elem,"events");}},trigger:function trigger(event,data,elem,onlyHandlers){var i,cur,tmp,bubbleType,ontype,handle,special,eventPath=[elem || document],type=hasOwn.call(event,"type")?event.type:event,namespaces=hasOwn.call(event,"namespace")?event.namespace.split("."):[];cur = tmp = elem = elem || document; // Don't do events on text and comment nodes
if(elem.nodeType === 3 || elem.nodeType === 8){return;} // focus/blur morphs to focusin/out; ensure we're not firing them right now
if(rfocusMorph.test(type + jQuery.event.triggered)){return;}if(type.indexOf(".") >= 0){ // Namespaced trigger; create a regexp to match event type in handle()
namespaces = type.split(".");type = namespaces.shift();namespaces.sort();}ontype = type.indexOf(":") < 0 && "on" + type; // Caller can pass in a jQuery.Event object, Object, or just an event type string
event = event[jQuery.expando]?event:new jQuery.Event(type,typeof event === "object" && event); // Trigger bitmask: & 1 for native handlers; & 2 for jQuery (always true)
event.isTrigger = onlyHandlers?2:3;event.namespace = namespaces.join(".");event.namespace_re = event.namespace?new RegExp("(^|\\.)" + namespaces.join("\\.(?:.*\\.|)") + "(\\.|$)"):null; // Clean up the event in case it is being reused
event.result = undefined;if(!event.target){event.target = elem;} // Clone any incoming data and prepend the event, creating the handler arg list
data = data == null?[event]:jQuery.makeArray(data,[event]); // Allow special events to draw outside the lines
special = jQuery.event.special[type] || {};if(!onlyHandlers && special.trigger && special.trigger.apply(elem,data) === false){return;} // Determine event propagation path in advance, per W3C events spec (#9951)
// Bubble up to document, then to window; watch for a global ownerDocument var (#9724)
if(!onlyHandlers && !special.noBubble && !jQuery.isWindow(elem)){bubbleType = special.delegateType || type;if(!rfocusMorph.test(bubbleType + type)){cur = cur.parentNode;}for(;cur;cur = cur.parentNode) {eventPath.push(cur);tmp = cur;} // Only add window if we got to document (e.g., not plain obj or detached DOM)
if(tmp === (elem.ownerDocument || document)){eventPath.push(tmp.defaultView || tmp.parentWindow || window);}} // Fire handlers on the event path
i = 0;while((cur = eventPath[i++]) && !event.isPropagationStopped()) {event.type = i > 1?bubbleType:special.bindType || type; // jQuery handler
handle = (data_priv.get(cur,"events") || {})[event.type] && data_priv.get(cur,"handle");if(handle){handle.apply(cur,data);} // Native handler
handle = ontype && cur[ontype];if(handle && handle.apply && jQuery.acceptData(cur)){event.result = handle.apply(cur,data);if(event.result === false){event.preventDefault();}}}event.type = type; // If nobody prevented the default action, do it now
if(!onlyHandlers && !event.isDefaultPrevented()){if((!special._default || special._default.apply(eventPath.pop(),data) === false) && jQuery.acceptData(elem)){ // Call a native DOM method on the target with the same name name as the event.
// Don't do default actions on window, that's where global variables be (#6170)
if(ontype && jQuery.isFunction(elem[type]) && !jQuery.isWindow(elem)){ // Don't re-trigger an onFOO event when we call its FOO() method
tmp = elem[ontype];if(tmp){elem[ontype] = null;} // Prevent re-triggering of the same event, since we already bubbled it above
jQuery.event.triggered = type;elem[type]();jQuery.event.triggered = undefined;if(tmp){elem[ontype] = tmp;}}}}return event.result;},dispatch:function dispatch(event){ // Make a writable jQuery.Event from the native event object
event = jQuery.event.fix(event);var i,j,ret,matched,handleObj,handlerQueue=[],args=_slice.call(arguments),handlers=(data_priv.get(this,"events") || {})[event.type] || [],special=jQuery.event.special[event.type] || {}; // Use the fix-ed jQuery.Event rather than the (read-only) native event
args[0] = event;event.delegateTarget = this; // Call the preDispatch hook for the mapped type, and let it bail if desired
if(special.preDispatch && special.preDispatch.call(this,event) === false){return;} // Determine handlers
handlerQueue = jQuery.event.handlers.call(this,event,handlers); // Run delegates first; they may want to stop propagation beneath us
i = 0;while((matched = handlerQueue[i++]) && !event.isPropagationStopped()) {event.currentTarget = matched.elem;j = 0;while((handleObj = matched.handlers[j++]) && !event.isImmediatePropagationStopped()) { // Triggered event must either 1) have no namespace, or 2) have namespace(s)
// a subset or equal to those in the bound event (both can have no namespace).
if(!event.namespace_re || event.namespace_re.test(handleObj.namespace)){event.handleObj = handleObj;event.data = handleObj.data;ret = ((jQuery.event.special[handleObj.origType] || {}).handle || handleObj.handler).apply(matched.elem,args);if(ret !== undefined){if((event.result = ret) === false){event.preventDefault();event.stopPropagation();}}}}} // Call the postDispatch hook for the mapped type
if(special.postDispatch){special.postDispatch.call(this,event);}return event.result;},handlers:function handlers(event,_handlers){var i,matches,sel,handleObj,handlerQueue=[],delegateCount=_handlers.delegateCount,cur=event.target; // Find delegate handlers
// Black-hole SVG <use> instance trees (#13180)
// Avoid non-left-click bubbling in Firefox (#3861)
if(delegateCount && cur.nodeType && (!event.button || event.type !== "click")){for(;cur !== this;cur = cur.parentNode || this) { // Don't process clicks on disabled elements (#6911, #8165, #11382, #11764)
if(cur.disabled !== true || event.type !== "click"){matches = [];for(i = 0;i < delegateCount;i++) {handleObj = _handlers[i]; // Don't conflict with Object.prototype properties (#13203)
sel = handleObj.selector + " ";if(matches[sel] === undefined){matches[sel] = handleObj.needsContext?jQuery(sel,this).index(cur) >= 0:jQuery.find(sel,this,null,[cur]).length;}if(matches[sel]){matches.push(handleObj);}}if(matches.length){handlerQueue.push({elem:cur,handlers:matches});}}}} // Add the remaining (directly-bound) handlers
if(delegateCount < _handlers.length){handlerQueue.push({elem:this,handlers:_handlers.slice(delegateCount)});}return handlerQueue;}, // Includes some event props shared by KeyEvent and MouseEvent
props:"altKey bubbles cancelable ctrlKey currentTarget eventPhase metaKey relatedTarget shiftKey target timeStamp view which".split(" "),fixHooks:{},keyHooks:{props:"char charCode key keyCode".split(" "),filter:function filter(event,original){ // Add which for key events
if(event.which == null){event.which = original.charCode != null?original.charCode:original.keyCode;}return event;}},mouseHooks:{props:"button buttons clientX clientY offsetX offsetY pageX pageY screenX screenY toElement".split(" "),filter:function filter(event,original){var eventDoc,doc,body,button=original.button; // Calculate pageX/Y if missing and clientX/Y available
if(event.pageX == null && original.clientX != null){eventDoc = event.target.ownerDocument || document;doc = eventDoc.documentElement;body = eventDoc.body;event.pageX = original.clientX + (doc && doc.scrollLeft || body && body.scrollLeft || 0) - (doc && doc.clientLeft || body && body.clientLeft || 0);event.pageY = original.clientY + (doc && doc.scrollTop || body && body.scrollTop || 0) - (doc && doc.clientTop || body && body.clientTop || 0);} // Add which for click: 1 === left; 2 === middle; 3 === right
// Note: button is not normalized, so don't use it
if(!event.which && button !== undefined){event.which = button & 1?1:button & 2?3:button & 4?2:0;}return event;}},fix:function fix(event){if(event[jQuery.expando]){return event;} // Create a writable copy of the event object and normalize some properties
var i,prop,copy,type=event.type,originalEvent=event,fixHook=this.fixHooks[type];if(!fixHook){this.fixHooks[type] = fixHook = rmouseEvent.test(type)?this.mouseHooks:rkeyEvent.test(type)?this.keyHooks:{};}copy = fixHook.props?this.props.concat(fixHook.props):this.props;event = new jQuery.Event(originalEvent);i = copy.length;while(i--) {prop = copy[i];event[prop] = originalEvent[prop];} // Support: Cordova 2.5 (WebKit) (#13255)
// All events should have a target; Cordova deviceready doesn't
if(!event.target){event.target = document;} // Support: Safari 6.0+, Chrome<28
// Target should not be a text node (#504, #13143)
if(event.target.nodeType === 3){event.target = event.target.parentNode;}return fixHook.filter?fixHook.filter(event,originalEvent):event;},special:{load:{ // Prevent triggered image.load events from bubbling to window.load
noBubble:true},focus:{ // Fire native event if possible so blur/focus sequence is correct
trigger:function trigger(){if(this !== safeActiveElement() && this.focus){this.focus();return false;}},delegateType:"focusin"},blur:{trigger:function trigger(){if(this === safeActiveElement() && this.blur){this.blur();return false;}},delegateType:"focusout"},click:{ // For checkbox, fire native event so checked state will be right
trigger:function trigger(){if(this.type === "checkbox" && this.click && jQuery.nodeName(this,"input")){this.click();return false;}}, // For cross-browser consistency, don't fire native .click() on links
_default:function _default(event){return jQuery.nodeName(event.target,"a");}},beforeunload:{postDispatch:function postDispatch(event){ // Support: Firefox 20+
// Firefox doesn't alert if the returnValue field is not set.
if(event.result !== undefined && event.originalEvent){event.originalEvent.returnValue = event.result;}}}},simulate:function simulate(type,elem,event,bubble){ // Piggyback on a donor event to simulate a different one.
// Fake originalEvent to avoid donor's stopPropagation, but if the
// simulated event prevents default then we do the same on the donor.
var e=jQuery.extend(new jQuery.Event(),event,{type:type,isSimulated:true,originalEvent:{}});if(bubble){jQuery.event.trigger(e,null,elem);}else {jQuery.event.dispatch.call(elem,e);}if(e.isDefaultPrevented()){event.preventDefault();}}};jQuery.removeEvent = function(elem,type,handle){if(elem.removeEventListener){elem.removeEventListener(type,handle,false);}};jQuery.Event = function(src,props){ // Allow instantiation without the 'new' keyword
if(!(this instanceof jQuery.Event)){return new jQuery.Event(src,props);} // Event object
if(src && src.type){this.originalEvent = src;this.type = src.type; // Events bubbling up the document may have been marked as prevented
// by a handler lower down the tree; reflect the correct value.
this.isDefaultPrevented = src.defaultPrevented || src.defaultPrevented === undefined &&  // Support: Android<4.0
src.returnValue === false?returnTrue:returnFalse; // Event type
}else {this.type = src;} // Put explicitly provided properties onto the event object
if(props){jQuery.extend(this,props);} // Create a timestamp if incoming event doesn't have one
this.timeStamp = src && src.timeStamp || jQuery.now(); // Mark it as fixed
this[jQuery.expando] = true;}; // jQuery.Event is based on DOM3 Events as specified by the ECMAScript Language Binding
// http://www.w3.org/TR/2003/WD-DOM-Level-3-Events-20030331/ecma-script-binding.html
jQuery.Event.prototype = {isDefaultPrevented:returnFalse,isPropagationStopped:returnFalse,isImmediatePropagationStopped:returnFalse,preventDefault:function preventDefault(){var e=this.originalEvent;this.isDefaultPrevented = returnTrue;if(e && e.preventDefault){e.preventDefault();}},stopPropagation:function stopPropagation(){var e=this.originalEvent;this.isPropagationStopped = returnTrue;if(e && e.stopPropagation){e.stopPropagation();}},stopImmediatePropagation:function stopImmediatePropagation(){var e=this.originalEvent;this.isImmediatePropagationStopped = returnTrue;if(e && e.stopImmediatePropagation){e.stopImmediatePropagation();}this.stopPropagation();}}; // Create mouseenter/leave events using mouseover/out and event-time checks
// Support: Chrome 15+
jQuery.each({mouseenter:"mouseover",mouseleave:"mouseout",pointerenter:"pointerover",pointerleave:"pointerout"},function(orig,fix){jQuery.event.special[orig] = {delegateType:fix,bindType:fix,handle:function handle(event){var ret,target=this,related=event.relatedTarget,handleObj=event.handleObj; // For mousenter/leave call the handler if related is outside the target.
// NB: No relatedTarget if the mouse left/entered the browser window
if(!related || related !== target && !jQuery.contains(target,related)){event.type = handleObj.origType;ret = handleObj.handler.apply(this,arguments);event.type = fix;}return ret;}};}); // Support: Firefox, Chrome, Safari
// Create "bubbling" focus and blur events
if(!support.focusinBubbles){jQuery.each({focus:"focusin",blur:"focusout"},function(orig,fix){ // Attach a single capturing handler on the document while someone wants focusin/focusout
var handler=function handler(event){jQuery.event.simulate(fix,event.target,jQuery.event.fix(event),true);};jQuery.event.special[fix] = {setup:function setup(){var doc=this.ownerDocument || this,attaches=data_priv.access(doc,fix);if(!attaches){doc.addEventListener(orig,handler,true);}data_priv.access(doc,fix,(attaches || 0) + 1);},teardown:function teardown(){var doc=this.ownerDocument || this,attaches=data_priv.access(doc,fix) - 1;if(!attaches){doc.removeEventListener(orig,handler,true);data_priv.remove(doc,fix);}else {data_priv.access(doc,fix,attaches);}}};});}jQuery.fn.extend({on:function on(types,selector,data,fn, /*INTERNAL*/one){var origFn,type; // Types can be a map of types/handlers
if(typeof types === "object"){ // ( types-Object, selector, data )
if(typeof selector !== "string"){ // ( types-Object, data )
data = data || selector;selector = undefined;}for(type in types) {this.on(type,selector,data,types[type],one);}return this;}if(data == null && fn == null){ // ( types, fn )
fn = selector;data = selector = undefined;}else if(fn == null){if(typeof selector === "string"){ // ( types, selector, fn )
fn = data;data = undefined;}else { // ( types, data, fn )
fn = data;data = selector;selector = undefined;}}if(fn === false){fn = returnFalse;}else if(!fn){return this;}if(one === 1){origFn = fn;fn = function(event){ // Can use an empty set, since event contains the info
jQuery().off(event);return origFn.apply(this,arguments);}; // Use same guid so caller can remove using origFn
fn.guid = origFn.guid || (origFn.guid = jQuery.guid++);}return this.each(function(){jQuery.event.add(this,types,fn,data,selector);});},one:function one(types,selector,data,fn){return this.on(types,selector,data,fn,1);},off:function off(types,selector,fn){var handleObj,type;if(types && types.preventDefault && types.handleObj){ // ( event )  dispatched jQuery.Event
handleObj = types.handleObj;jQuery(types.delegateTarget).off(handleObj.namespace?handleObj.origType + "." + handleObj.namespace:handleObj.origType,handleObj.selector,handleObj.handler);return this;}if(typeof types === "object"){ // ( types-object [, selector] )
for(type in types) {this.off(type,selector,types[type]);}return this;}if(selector === false || typeof selector === "function"){ // ( types [, fn] )
fn = selector;selector = undefined;}if(fn === false){fn = returnFalse;}return this.each(function(){jQuery.event.remove(this,types,fn,selector);});},trigger:function trigger(type,data){return this.each(function(){jQuery.event.trigger(type,data,this);});},triggerHandler:function triggerHandler(type,data){var elem=this[0];if(elem){return jQuery.event.trigger(type,data,elem,true);}}});var rxhtmlTag=/<(?!area|br|col|embed|hr|img|input|link|meta|param)(([\w:]+)[^>]*)\/>/gi,rtagName=/<([\w:]+)/,rhtml=/<|&#?\w+;/,rnoInnerhtml=/<(?:script|style|link)/i, // checked="checked" or checked
rchecked=/checked\s*(?:[^=]|=\s*.checked.)/i,rscriptType=/^$|\/(?:java|ecma)script/i,rscriptTypeMasked=/^true\/(.*)/,rcleanScript=/^\s*<!(?:\[CDATA\[|--)|(?:\]\]|--)>\s*$/g, // We have to close these tags to support XHTML (#13200)
wrapMap={ // Support: IE9
option:[1,"<select multiple='multiple'>","</select>"],thead:[1,"<table>","</table>"],col:[2,"<table><colgroup>","</colgroup></table>"],tr:[2,"<table><tbody>","</tbody></table>"],td:[3,"<table><tbody><tr>","</tr></tbody></table>"],_default:[0,"",""]}; // Support: IE9
wrapMap.optgroup = wrapMap.option;wrapMap.tbody = wrapMap.tfoot = wrapMap.colgroup = wrapMap.caption = wrapMap.thead;wrapMap.th = wrapMap.td; // Support: 1.x compatibility
// Manipulating tables requires a tbody
function manipulationTarget(elem,content){return jQuery.nodeName(elem,"table") && jQuery.nodeName(content.nodeType !== 11?content:content.firstChild,"tr")?elem.getElementsByTagName("tbody")[0] || elem.appendChild(elem.ownerDocument.createElement("tbody")):elem;} // Replace/restore the type attribute of script elements for safe DOM manipulation
function disableScript(elem){elem.type = (elem.getAttribute("type") !== null) + "/" + elem.type;return elem;}function restoreScript(elem){var match=rscriptTypeMasked.exec(elem.type);if(match){elem.type = match[1];}else {elem.removeAttribute("type");}return elem;} // Mark scripts as having already been evaluated
function setGlobalEval(elems,refElements){var i=0,l=elems.length;for(;i < l;i++) {data_priv.set(elems[i],"globalEval",!refElements || data_priv.get(refElements[i],"globalEval"));}}function cloneCopyEvent(src,dest){var i,l,type,pdataOld,pdataCur,udataOld,udataCur,events;if(dest.nodeType !== 1){return;} // 1. Copy private data: events, handlers, etc.
if(data_priv.hasData(src)){pdataOld = data_priv.access(src);pdataCur = data_priv.set(dest,pdataOld);events = pdataOld.events;if(events){delete pdataCur.handle;pdataCur.events = {};for(type in events) {for(i = 0,l = events[type].length;i < l;i++) {jQuery.event.add(dest,type,events[type][i]);}}}} // 2. Copy user data
if(data_user.hasData(src)){udataOld = data_user.access(src);udataCur = jQuery.extend({},udataOld);data_user.set(dest,udataCur);}}function getAll(context,tag){var ret=context.getElementsByTagName?context.getElementsByTagName(tag || "*"):context.querySelectorAll?context.querySelectorAll(tag || "*"):[];return tag === undefined || tag && jQuery.nodeName(context,tag)?jQuery.merge([context],ret):ret;} // Fix IE bugs, see support tests
function fixInput(src,dest){var nodeName=dest.nodeName.toLowerCase(); // Fails to persist the checked state of a cloned checkbox or radio button.
if(nodeName === "input" && rcheckableType.test(src.type)){dest.checked = src.checked; // Fails to return the selected option to the default selected state when cloning options
}else if(nodeName === "input" || nodeName === "textarea"){dest.defaultValue = src.defaultValue;}}jQuery.extend({clone:function clone(elem,dataAndEvents,deepDataAndEvents){var i,l,srcElements,destElements,clone=elem.cloneNode(true),inPage=jQuery.contains(elem.ownerDocument,elem); // Fix IE cloning issues
if(!support.noCloneChecked && (elem.nodeType === 1 || elem.nodeType === 11) && !jQuery.isXMLDoc(elem)){ // We eschew Sizzle here for performance reasons: http://jsperf.com/getall-vs-sizzle/2
destElements = getAll(clone);srcElements = getAll(elem);for(i = 0,l = srcElements.length;i < l;i++) {fixInput(srcElements[i],destElements[i]);}} // Copy the events from the original to the clone
if(dataAndEvents){if(deepDataAndEvents){srcElements = srcElements || getAll(elem);destElements = destElements || getAll(clone);for(i = 0,l = srcElements.length;i < l;i++) {cloneCopyEvent(srcElements[i],destElements[i]);}}else {cloneCopyEvent(elem,clone);}} // Preserve script evaluation history
destElements = getAll(clone,"script");if(destElements.length > 0){setGlobalEval(destElements,!inPage && getAll(elem,"script"));} // Return the cloned set
return clone;},buildFragment:function buildFragment(elems,context,scripts,selection){var elem,tmp,tag,wrap,contains,j,fragment=context.createDocumentFragment(),nodes=[],i=0,l=elems.length;for(;i < l;i++) {elem = elems[i];if(elem || elem === 0){ // Add nodes directly
if(jQuery.type(elem) === "object"){ // Support: QtWebKit, PhantomJS
// push.apply(_, arraylike) throws on ancient WebKit
jQuery.merge(nodes,elem.nodeType?[elem]:elem); // Convert non-html into a text node
}else if(!rhtml.test(elem)){nodes.push(context.createTextNode(elem)); // Convert html into DOM nodes
}else {tmp = tmp || fragment.appendChild(context.createElement("div")); // Deserialize a standard representation
tag = (rtagName.exec(elem) || ["",""])[1].toLowerCase();wrap = wrapMap[tag] || wrapMap._default;tmp.innerHTML = wrap[1] + elem.replace(rxhtmlTag,"<$1></$2>") + wrap[2]; // Descend through wrappers to the right content
j = wrap[0];while(j--) {tmp = tmp.lastChild;} // Support: QtWebKit, PhantomJS
// push.apply(_, arraylike) throws on ancient WebKit
jQuery.merge(nodes,tmp.childNodes); // Remember the top-level container
tmp = fragment.firstChild; // Ensure the created nodes are orphaned (#12392)
tmp.textContent = "";}}} // Remove wrapper from fragment
fragment.textContent = "";i = 0;while(elem = nodes[i++]) { // #4087 - If origin and destination elements are the same, and this is
// that element, do not do anything
if(selection && jQuery.inArray(elem,selection) !== -1){continue;}contains = jQuery.contains(elem.ownerDocument,elem); // Append to fragment
tmp = getAll(fragment.appendChild(elem),"script"); // Preserve script evaluation history
if(contains){setGlobalEval(tmp);} // Capture executables
if(scripts){j = 0;while(elem = tmp[j++]) {if(rscriptType.test(elem.type || "")){scripts.push(elem);}}}}return fragment;},cleanData:function cleanData(elems){var data,elem,type,key,special=jQuery.event.special,i=0;for(;(elem = elems[i]) !== undefined;i++) {if(jQuery.acceptData(elem)){key = elem[data_priv.expando];if(key && (data = data_priv.cache[key])){if(data.events){for(type in data.events) {if(special[type]){jQuery.event.remove(elem,type); // This is a shortcut to avoid jQuery.event.remove's overhead
}else {jQuery.removeEvent(elem,type,data.handle);}}}if(data_priv.cache[key]){ // Discard any remaining `private` data
delete data_priv.cache[key];}}} // Discard any remaining `user` data
delete data_user.cache[elem[data_user.expando]];}}});jQuery.fn.extend({text:function text(value){return access(this,function(value){return value === undefined?jQuery.text(this):this.empty().each(function(){if(this.nodeType === 1 || this.nodeType === 11 || this.nodeType === 9){this.textContent = value;}});},null,value,arguments.length);},append:function append(){return this.domManip(arguments,function(elem){if(this.nodeType === 1 || this.nodeType === 11 || this.nodeType === 9){var target=manipulationTarget(this,elem);target.appendChild(elem);}});},prepend:function prepend(){return this.domManip(arguments,function(elem){if(this.nodeType === 1 || this.nodeType === 11 || this.nodeType === 9){var target=manipulationTarget(this,elem);target.insertBefore(elem,target.firstChild);}});},before:function before(){return this.domManip(arguments,function(elem){if(this.parentNode){this.parentNode.insertBefore(elem,this);}});},after:function after(){return this.domManip(arguments,function(elem){if(this.parentNode){this.parentNode.insertBefore(elem,this.nextSibling);}});},remove:function remove(selector,keepData /* Internal Use Only */){var elem,elems=selector?jQuery.filter(selector,this):this,i=0;for(;(elem = elems[i]) != null;i++) {if(!keepData && elem.nodeType === 1){jQuery.cleanData(getAll(elem));}if(elem.parentNode){if(keepData && jQuery.contains(elem.ownerDocument,elem)){setGlobalEval(getAll(elem,"script"));}elem.parentNode.removeChild(elem);}}return this;},empty:function empty(){var elem,i=0;for(;(elem = this[i]) != null;i++) {if(elem.nodeType === 1){ // Prevent memory leaks
jQuery.cleanData(getAll(elem,false)); // Remove any remaining nodes
elem.textContent = "";}}return this;},clone:function clone(dataAndEvents,deepDataAndEvents){dataAndEvents = dataAndEvents == null?false:dataAndEvents;deepDataAndEvents = deepDataAndEvents == null?dataAndEvents:deepDataAndEvents;return this.map(function(){return jQuery.clone(this,dataAndEvents,deepDataAndEvents);});},html:function html(value){return access(this,function(value){var elem=this[0] || {},i=0,l=this.length;if(value === undefined && elem.nodeType === 1){return elem.innerHTML;} // See if we can take a shortcut and just use innerHTML
if(typeof value === "string" && !rnoInnerhtml.test(value) && !wrapMap[(rtagName.exec(value) || ["",""])[1].toLowerCase()]){value = value.replace(rxhtmlTag,"<$1></$2>");try{for(;i < l;i++) {elem = this[i] || {}; // Remove element nodes and prevent memory leaks
if(elem.nodeType === 1){jQuery.cleanData(getAll(elem,false));elem.innerHTML = value;}}elem = 0; // If using innerHTML throws an exception, use the fallback method
}catch(e) {}}if(elem){this.empty().append(value);}},null,value,arguments.length);},replaceWith:function replaceWith(){var arg=arguments[0]; // Make the changes, replacing each context element with the new content
this.domManip(arguments,function(elem){arg = this.parentNode;jQuery.cleanData(getAll(this));if(arg){arg.replaceChild(elem,this);}}); // Force removal if there was no new content (e.g., from empty arguments)
return arg && (arg.length || arg.nodeType)?this:this.remove();},detach:function detach(selector){return this.remove(selector,true);},domManip:function domManip(args,callback){ // Flatten any nested arrays
args = concat.apply([],args);var fragment,first,scripts,hasScripts,node,doc,i=0,l=this.length,set=this,iNoClone=l - 1,value=args[0],isFunction=jQuery.isFunction(value); // We can't cloneNode fragments that contain checked, in WebKit
if(isFunction || l > 1 && typeof value === "string" && !support.checkClone && rchecked.test(value)){return this.each(function(index){var self=set.eq(index);if(isFunction){args[0] = value.call(this,index,self.html());}self.domManip(args,callback);});}if(l){fragment = jQuery.buildFragment(args,this[0].ownerDocument,false,this);first = fragment.firstChild;if(fragment.childNodes.length === 1){fragment = first;}if(first){scripts = jQuery.map(getAll(fragment,"script"),disableScript);hasScripts = scripts.length; // Use the original fragment for the last item instead of the first because it can end up
// being emptied incorrectly in certain situations (#8070).
for(;i < l;i++) {node = fragment;if(i !== iNoClone){node = jQuery.clone(node,true,true); // Keep references to cloned scripts for later restoration
if(hasScripts){ // Support: QtWebKit
// jQuery.merge because push.apply(_, arraylike) throws
jQuery.merge(scripts,getAll(node,"script"));}}callback.call(this[i],node,i);}if(hasScripts){doc = scripts[scripts.length - 1].ownerDocument; // Reenable scripts
jQuery.map(scripts,restoreScript); // Evaluate executable scripts on first document insertion
for(i = 0;i < hasScripts;i++) {node = scripts[i];if(rscriptType.test(node.type || "") && !data_priv.access(node,"globalEval") && jQuery.contains(doc,node)){if(node.src){ // Optional AJAX dependency, but won't run scripts if not present
if(jQuery._evalUrl){jQuery._evalUrl(node.src);}}else {jQuery.globalEval(node.textContent.replace(rcleanScript,""));}}}}}}return this;}});jQuery.each({appendTo:"append",prependTo:"prepend",insertBefore:"before",insertAfter:"after",replaceAll:"replaceWith"},function(name,original){jQuery.fn[name] = function(selector){var elems,ret=[],insert=jQuery(selector),last=insert.length - 1,i=0;for(;i <= last;i++) {elems = i === last?this:this.clone(true);jQuery(insert[i])[original](elems); // Support: QtWebKit
// .get() because push.apply(_, arraylike) throws
push.apply(ret,elems.get());}return this.pushStack(ret);};});var iframe,elemdisplay={}; /**
 * Retrieve the actual display of a element
 * @param {String} name nodeName of the element
 * @param {Object} doc Document object
 */ // Called only from within defaultDisplay
function actualDisplay(name,doc){var style,elem=jQuery(doc.createElement(name)).appendTo(doc.body), // getDefaultComputedStyle might be reliably used only on attached element
display=window.getDefaultComputedStyle && (style = window.getDefaultComputedStyle(elem[0]))? // Use of this method is a temporary fix (more like optimization) until something better comes along,
// since it was removed from specification and supported only in FF
style.display:jQuery.css(elem[0],"display"); // We don't have any data stored on the element,
// so use "detach" method as fast way to get rid of the element
elem.detach();return display;} /**
 * Try to determine the default display value of an element
 * @param {String} nodeName
 */function defaultDisplay(nodeName){var doc=document,display=elemdisplay[nodeName];if(!display){display = actualDisplay(nodeName,doc); // If the simple way fails, read from inside an iframe
if(display === "none" || !display){ // Use the already-created iframe if possible
iframe = (iframe || jQuery("<iframe frameborder='0' width='0' height='0'/>")).appendTo(doc.documentElement); // Always write a new HTML skeleton so Webkit and Firefox don't choke on reuse
doc = iframe[0].contentDocument; // Support: IE
doc.write();doc.close();display = actualDisplay(nodeName,doc);iframe.detach();} // Store the correct default display
elemdisplay[nodeName] = display;}return display;}var rmargin=/^margin/;var rnumnonpx=new RegExp("^(" + pnum + ")(?!px)[a-z%]+$","i");var getStyles=function getStyles(elem){ // Support: IE<=11+, Firefox<=30+ (#15098, #14150)
// IE throws on elements created in popups
// FF meanwhile throws on frame elements through "defaultView.getComputedStyle"
if(elem.ownerDocument.defaultView.opener){return elem.ownerDocument.defaultView.getComputedStyle(elem,null);}return window.getComputedStyle(elem,null);};function curCSS(elem,name,computed){var width,minWidth,maxWidth,ret,style=elem.style;computed = computed || getStyles(elem); // Support: IE9
// getPropertyValue is only needed for .css('filter') (#12537)
if(computed){ret = computed.getPropertyValue(name) || computed[name];}if(computed){if(ret === "" && !jQuery.contains(elem.ownerDocument,elem)){ret = jQuery.style(elem,name);} // Support: iOS < 6
// A tribute to the "awesome hack by Dean Edwards"
// iOS < 6 (at least) returns percentage for a larger set of values, but width seems to be reliably pixels
// this is against the CSSOM draft spec: http://dev.w3.org/csswg/cssom/#resolved-values
if(rnumnonpx.test(ret) && rmargin.test(name)){ // Remember the original values
width = style.width;minWidth = style.minWidth;maxWidth = style.maxWidth; // Put in the new values to get a computed value out
style.minWidth = style.maxWidth = style.width = ret;ret = computed.width; // Revert the changed values
style.width = width;style.minWidth = minWidth;style.maxWidth = maxWidth;}}return ret !== undefined? // Support: IE
// IE returns zIndex value as an integer.
ret + "":ret;}function addGetHookIf(conditionFn,hookFn){ // Define the hook, we'll check on the first run if it's really needed.
return {get:function get(){if(conditionFn()){ // Hook not needed (or it's not possible to use it due
// to missing dependency), remove it.
delete this.get;return;} // Hook needed; redefine it so that the support test is not executed again.
return (this.get = hookFn).apply(this,arguments);}};}(function(){var pixelPositionVal,boxSizingReliableVal,docElem=document.documentElement,container=document.createElement("div"),div=document.createElement("div");if(!div.style){return;} // Support: IE9-11+
// Style of cloned element affects source element cloned (#8908)
div.style.backgroundClip = "content-box";div.cloneNode(true).style.backgroundClip = "";support.clearCloneStyle = div.style.backgroundClip === "content-box";container.style.cssText = "border:0;width:0;height:0;top:0;left:-9999px;margin-top:1px;" + "position:absolute";container.appendChild(div); // Executing both pixelPosition & boxSizingReliable tests require only one layout
// so they're executed at the same time to save the second computation.
function computePixelPositionAndBoxSizingReliable(){div.style.cssText =  // Support: Firefox<29, Android 2.3
// Vendor-prefix box-sizing
"-webkit-box-sizing:border-box;-moz-box-sizing:border-box;" + "box-sizing:border-box;display:block;margin-top:1%;top:1%;" + "border:1px;padding:1px;width:4px;position:absolute";div.innerHTML = "";docElem.appendChild(container);var divStyle=window.getComputedStyle(div,null);pixelPositionVal = divStyle.top !== "1%";boxSizingReliableVal = divStyle.width === "4px";docElem.removeChild(container);} // Support: node.js jsdom
// Don't assume that getComputedStyle is a property of the global object
if(window.getComputedStyle){jQuery.extend(support,{pixelPosition:function pixelPosition(){ // This test is executed only once but we still do memoizing
// since we can use the boxSizingReliable pre-computing.
// No need to check if the test was already performed, though.
computePixelPositionAndBoxSizingReliable();return pixelPositionVal;},boxSizingReliable:function boxSizingReliable(){if(boxSizingReliableVal == null){computePixelPositionAndBoxSizingReliable();}return boxSizingReliableVal;},reliableMarginRight:function reliableMarginRight(){ // Support: Android 2.3
// Check if div with explicit width and no margin-right incorrectly
// gets computed margin-right based on width of container. (#3333)
// WebKit Bug 13343 - getComputedStyle returns wrong value for margin-right
// This support function is only executed once so no memoizing is needed.
var ret,marginDiv=div.appendChild(document.createElement("div")); // Reset CSS: box-sizing; display; margin; border; padding
marginDiv.style.cssText = div.style.cssText =  // Support: Firefox<29, Android 2.3
// Vendor-prefix box-sizing
"-webkit-box-sizing:content-box;-moz-box-sizing:content-box;" + "box-sizing:content-box;display:block;margin:0;border:0;padding:0";marginDiv.style.marginRight = marginDiv.style.width = "0";div.style.width = "1px";docElem.appendChild(container);ret = !parseFloat(window.getComputedStyle(marginDiv,null).marginRight);docElem.removeChild(container);div.removeChild(marginDiv);return ret;}});}})(); // A method for quickly swapping in/out CSS properties to get correct calculations.
jQuery.swap = function(elem,options,callback,args){var ret,name,old={}; // Remember the old values, and insert the new ones
for(name in options) {old[name] = elem.style[name];elem.style[name] = options[name];}ret = callback.apply(elem,args || []); // Revert the old values
for(name in options) {elem.style[name] = old[name];}return ret;};var  // Swappable if display is none or starts with table except "table", "table-cell", or "table-caption"
// See here for display values: https://developer.mozilla.org/en-US/docs/CSS/display
rdisplayswap=/^(none|table(?!-c[ea]).+)/,rnumsplit=new RegExp("^(" + pnum + ")(.*)$","i"),rrelNum=new RegExp("^([+-])=(" + pnum + ")","i"),cssShow={position:"absolute",visibility:"hidden",display:"block"},cssNormalTransform={letterSpacing:"0",fontWeight:"400"},cssPrefixes=["Webkit","O","Moz","ms"]; // Return a css property mapped to a potentially vendor prefixed property
function vendorPropName(style,name){ // Shortcut for names that are not vendor prefixed
if(name in style){return name;} // Check for vendor prefixed names
var capName=name[0].toUpperCase() + name.slice(1),origName=name,i=cssPrefixes.length;while(i--) {name = cssPrefixes[i] + capName;if(name in style){return name;}}return origName;}function setPositiveNumber(elem,value,subtract){var matches=rnumsplit.exec(value);return matches? // Guard against undefined "subtract", e.g., when used as in cssHooks
Math.max(0,matches[1] - (subtract || 0)) + (matches[2] || "px"):value;}function augmentWidthOrHeight(elem,name,extra,isBorderBox,styles){var i=extra === (isBorderBox?"border":"content")? // If we already have the right measurement, avoid augmentation
4: // Otherwise initialize for horizontal or vertical properties
name === "width"?1:0,val=0;for(;i < 4;i += 2) { // Both box models exclude margin, so add it if we want it
if(extra === "margin"){val += jQuery.css(elem,extra + cssExpand[i],true,styles);}if(isBorderBox){ // border-box includes padding, so remove it if we want content
if(extra === "content"){val -= jQuery.css(elem,"padding" + cssExpand[i],true,styles);} // At this point, extra isn't border nor margin, so remove border
if(extra !== "margin"){val -= jQuery.css(elem,"border" + cssExpand[i] + "Width",true,styles);}}else { // At this point, extra isn't content, so add padding
val += jQuery.css(elem,"padding" + cssExpand[i],true,styles); // At this point, extra isn't content nor padding, so add border
if(extra !== "padding"){val += jQuery.css(elem,"border" + cssExpand[i] + "Width",true,styles);}}}return val;}function getWidthOrHeight(elem,name,extra){ // Start with offset property, which is equivalent to the border-box value
var valueIsBorderBox=true,val=name === "width"?elem.offsetWidth:elem.offsetHeight,styles=getStyles(elem),isBorderBox=jQuery.css(elem,"boxSizing",false,styles) === "border-box"; // Some non-html elements return undefined for offsetWidth, so check for null/undefined
// svg - https://bugzilla.mozilla.org/show_bug.cgi?id=649285
// MathML - https://bugzilla.mozilla.org/show_bug.cgi?id=491668
if(val <= 0 || val == null){ // Fall back to computed then uncomputed css if necessary
val = curCSS(elem,name,styles);if(val < 0 || val == null){val = elem.style[name];} // Computed unit is not pixels. Stop here and return.
if(rnumnonpx.test(val)){return val;} // Check for style in case a browser which returns unreliable values
// for getComputedStyle silently falls back to the reliable elem.style
valueIsBorderBox = isBorderBox && (support.boxSizingReliable() || val === elem.style[name]); // Normalize "", auto, and prepare for extra
val = parseFloat(val) || 0;} // Use the active box-sizing model to add/subtract irrelevant styles
return val + augmentWidthOrHeight(elem,name,extra || (isBorderBox?"border":"content"),valueIsBorderBox,styles) + "px";}function showHide(elements,show){var display,elem,hidden,values=[],index=0,length=elements.length;for(;index < length;index++) {elem = elements[index];if(!elem.style){continue;}values[index] = data_priv.get(elem,"olddisplay");display = elem.style.display;if(show){ // Reset the inline display of this element to learn if it is
// being hidden by cascaded rules or not
if(!values[index] && display === "none"){elem.style.display = "";} // Set elements which have been overridden with display: none
// in a stylesheet to whatever the default browser style is
// for such an element
if(elem.style.display === "" && isHidden(elem)){values[index] = data_priv.access(elem,"olddisplay",defaultDisplay(elem.nodeName));}}else {hidden = isHidden(elem);if(display !== "none" || !hidden){data_priv.set(elem,"olddisplay",hidden?display:jQuery.css(elem,"display"));}}} // Set the display of most of the elements in a second loop
// to avoid the constant reflow
for(index = 0;index < length;index++) {elem = elements[index];if(!elem.style){continue;}if(!show || elem.style.display === "none" || elem.style.display === ""){elem.style.display = show?values[index] || "":"none";}}return elements;}jQuery.extend({ // Add in style property hooks for overriding the default
// behavior of getting and setting a style property
cssHooks:{opacity:{get:function get(elem,computed){if(computed){ // We should always get a number back from opacity
var ret=curCSS(elem,"opacity");return ret === ""?"1":ret;}}}}, // Don't automatically add "px" to these possibly-unitless properties
cssNumber:{"columnCount":true,"fillOpacity":true,"flexGrow":true,"flexShrink":true,"fontWeight":true,"lineHeight":true,"opacity":true,"order":true,"orphans":true,"widows":true,"zIndex":true,"zoom":true}, // Add in properties whose names you wish to fix before
// setting or getting the value
cssProps:{"float":"cssFloat"}, // Get and set the style property on a DOM Node
style:function style(elem,name,value,extra){ // Don't set styles on text and comment nodes
if(!elem || elem.nodeType === 3 || elem.nodeType === 8 || !elem.style){return;} // Make sure that we're working with the right name
var ret,type,hooks,origName=jQuery.camelCase(name),style=elem.style;name = jQuery.cssProps[origName] || (jQuery.cssProps[origName] = vendorPropName(style,origName)); // Gets hook for the prefixed version, then unprefixed version
hooks = jQuery.cssHooks[name] || jQuery.cssHooks[origName]; // Check if we're setting a value
if(value !== undefined){type = typeof value; // Convert "+=" or "-=" to relative numbers (#7345)
if(type === "string" && (ret = rrelNum.exec(value))){value = (ret[1] + 1) * ret[2] + parseFloat(jQuery.css(elem,name)); // Fixes bug #9237
type = "number";} // Make sure that null and NaN values aren't set (#7116)
if(value == null || value !== value){return;} // If a number, add 'px' to the (except for certain CSS properties)
if(type === "number" && !jQuery.cssNumber[origName]){value += "px";} // Support: IE9-11+
// background-* props affect original clone's values
if(!support.clearCloneStyle && value === "" && name.indexOf("background") === 0){style[name] = "inherit";} // If a hook was provided, use that value, otherwise just set the specified value
if(!hooks || !("set" in hooks) || (value = hooks.set(elem,value,extra)) !== undefined){style[name] = value;}}else { // If a hook was provided get the non-computed value from there
if(hooks && "get" in hooks && (ret = hooks.get(elem,false,extra)) !== undefined){return ret;} // Otherwise just get the value from the style object
return style[name];}},css:function css(elem,name,extra,styles){var val,num,hooks,origName=jQuery.camelCase(name); // Make sure that we're working with the right name
name = jQuery.cssProps[origName] || (jQuery.cssProps[origName] = vendorPropName(elem.style,origName)); // Try prefixed name followed by the unprefixed name
hooks = jQuery.cssHooks[name] || jQuery.cssHooks[origName]; // If a hook was provided get the computed value from there
if(hooks && "get" in hooks){val = hooks.get(elem,true,extra);} // Otherwise, if a way to get the computed value exists, use that
if(val === undefined){val = curCSS(elem,name,styles);} // Convert "normal" to computed value
if(val === "normal" && name in cssNormalTransform){val = cssNormalTransform[name];} // Make numeric if forced or a qualifier was provided and val looks numeric
if(extra === "" || extra){num = parseFloat(val);return extra === true || jQuery.isNumeric(num)?num || 0:val;}return val;}});jQuery.each(["height","width"],function(i,name){jQuery.cssHooks[name] = {get:function get(elem,computed,extra){if(computed){ // Certain elements can have dimension info if we invisibly show them
// but it must have a current display style that would benefit
return rdisplayswap.test(jQuery.css(elem,"display")) && elem.offsetWidth === 0?jQuery.swap(elem,cssShow,function(){return getWidthOrHeight(elem,name,extra);}):getWidthOrHeight(elem,name,extra);}},set:function set(elem,value,extra){var styles=extra && getStyles(elem);return setPositiveNumber(elem,value,extra?augmentWidthOrHeight(elem,name,extra,jQuery.css(elem,"boxSizing",false,styles) === "border-box",styles):0);}};}); // Support: Android 2.3
jQuery.cssHooks.marginRight = addGetHookIf(support.reliableMarginRight,function(elem,computed){if(computed){return jQuery.swap(elem,{"display":"inline-block"},curCSS,[elem,"marginRight"]);}}); // These hooks are used by animate to expand properties
jQuery.each({margin:"",padding:"",border:"Width"},function(prefix,suffix){jQuery.cssHooks[prefix + suffix] = {expand:function expand(value){var i=0,expanded={}, // Assumes a single number if not a string
parts=typeof value === "string"?value.split(" "):[value];for(;i < 4;i++) {expanded[prefix + cssExpand[i] + suffix] = parts[i] || parts[i - 2] || parts[0];}return expanded;}};if(!rmargin.test(prefix)){jQuery.cssHooks[prefix + suffix].set = setPositiveNumber;}});jQuery.fn.extend({css:function css(name,value){return access(this,function(elem,name,value){var styles,len,map={},i=0;if(jQuery.isArray(name)){styles = getStyles(elem);len = name.length;for(;i < len;i++) {map[name[i]] = jQuery.css(elem,name[i],false,styles);}return map;}return value !== undefined?jQuery.style(elem,name,value):jQuery.css(elem,name);},name,value,arguments.length > 1);},show:function show(){return showHide(this,true);},hide:function hide(){return showHide(this);},toggle:function toggle(state){if(typeof state === "boolean"){return state?this.show():this.hide();}return this.each(function(){if(isHidden(this)){jQuery(this).show();}else {jQuery(this).hide();}});}});function Tween(elem,options,prop,end,easing){return new Tween.prototype.init(elem,options,prop,end,easing);}jQuery.Tween = Tween;Tween.prototype = {constructor:Tween,init:function init(elem,options,prop,end,easing,unit){this.elem = elem;this.prop = prop;this.easing = easing || "swing";this.options = options;this.start = this.now = this.cur();this.end = end;this.unit = unit || (jQuery.cssNumber[prop]?"":"px");},cur:function cur(){var hooks=Tween.propHooks[this.prop];return hooks && hooks.get?hooks.get(this):Tween.propHooks._default.get(this);},run:function run(percent){var eased,hooks=Tween.propHooks[this.prop];if(this.options.duration){this.pos = eased = jQuery.easing[this.easing](percent,this.options.duration * percent,0,1,this.options.duration);}else {this.pos = eased = percent;}this.now = (this.end - this.start) * eased + this.start;if(this.options.step){this.options.step.call(this.elem,this.now,this);}if(hooks && hooks.set){hooks.set(this);}else {Tween.propHooks._default.set(this);}return this;}};Tween.prototype.init.prototype = Tween.prototype;Tween.propHooks = {_default:{get:function get(tween){var result;if(tween.elem[tween.prop] != null && (!tween.elem.style || tween.elem.style[tween.prop] == null)){return tween.elem[tween.prop];} // Passing an empty string as a 3rd parameter to .css will automatically
// attempt a parseFloat and fallback to a string if the parse fails.
// Simple values such as "10px" are parsed to Float;
// complex values such as "rotate(1rad)" are returned as-is.
result = jQuery.css(tween.elem,tween.prop,""); // Empty strings, null, undefined and "auto" are converted to 0.
return !result || result === "auto"?0:result;},set:function set(tween){ // Use step hook for back compat.
// Use cssHook if its there.
// Use .style if available and use plain properties where available.
if(jQuery.fx.step[tween.prop]){jQuery.fx.step[tween.prop](tween);}else if(tween.elem.style && (tween.elem.style[jQuery.cssProps[tween.prop]] != null || jQuery.cssHooks[tween.prop])){jQuery.style(tween.elem,tween.prop,tween.now + tween.unit);}else {tween.elem[tween.prop] = tween.now;}}}}; // Support: IE9
// Panic based approach to setting things on disconnected nodes
Tween.propHooks.scrollTop = Tween.propHooks.scrollLeft = {set:function set(tween){if(tween.elem.nodeType && tween.elem.parentNode){tween.elem[tween.prop] = tween.now;}}};jQuery.easing = {linear:function linear(p){return p;},swing:function swing(p){return 0.5 - Math.cos(p * Math.PI) / 2;}};jQuery.fx = Tween.prototype.init; // Back Compat <1.8 extension point
jQuery.fx.step = {};var fxNow,timerId,rfxtypes=/^(?:toggle|show|hide)$/,rfxnum=new RegExp("^(?:([+-])=|)(" + pnum + ")([a-z%]*)$","i"),rrun=/queueHooks$/,animationPrefilters=[defaultPrefilter],tweeners={"*":[function(prop,value){var tween=this.createTween(prop,value),target=tween.cur(),parts=rfxnum.exec(value),unit=parts && parts[3] || (jQuery.cssNumber[prop]?"":"px"), // Starting value computation is required for potential unit mismatches
start=(jQuery.cssNumber[prop] || unit !== "px" && +target) && rfxnum.exec(jQuery.css(tween.elem,prop)),scale=1,maxIterations=20;if(start && start[3] !== unit){ // Trust units reported by jQuery.css
unit = unit || start[3]; // Make sure we update the tween properties later on
parts = parts || []; // Iteratively approximate from a nonzero starting point
start = +target || 1;do { // If previous iteration zeroed out, double until we get *something*.
// Use string for doubling so we don't accidentally see scale as unchanged below
scale = scale || ".5"; // Adjust and apply
start = start / scale;jQuery.style(tween.elem,prop,start + unit); // Update scale, tolerating zero or NaN from tween.cur(),
// break the loop if scale is unchanged or perfect, or if we've just had enough
}while(scale !== (scale = tween.cur() / target) && scale !== 1 && --maxIterations);} // Update tween properties
if(parts){start = tween.start = +start || +target || 0;tween.unit = unit; // If a +=/-= token was provided, we're doing a relative animation
tween.end = parts[1]?start + (parts[1] + 1) * parts[2]:+parts[2];}return tween;}]}; // Animations created synchronously will run synchronously
function createFxNow(){setTimeout(function(){fxNow = undefined;});return fxNow = jQuery.now();} // Generate parameters to create a standard animation
function genFx(type,includeWidth){var which,i=0,attrs={height:type}; // If we include width, step value is 1 to do all cssExpand values,
// otherwise step value is 2 to skip over Left and Right
includeWidth = includeWidth?1:0;for(;i < 4;i += 2 - includeWidth) {which = cssExpand[i];attrs["margin" + which] = attrs["padding" + which] = type;}if(includeWidth){attrs.opacity = attrs.width = type;}return attrs;}function createTween(value,prop,animation){var tween,collection=(tweeners[prop] || []).concat(tweeners["*"]),index=0,length=collection.length;for(;index < length;index++) {if(tween = collection[index].call(animation,prop,value)){ // We're done with this property
return tween;}}}function defaultPrefilter(elem,props,opts){ /* jshint validthis: true */var prop,value,toggle,tween,hooks,oldfire,display,checkDisplay,anim=this,orig={},style=elem.style,hidden=elem.nodeType && isHidden(elem),dataShow=data_priv.get(elem,"fxshow"); // Handle queue: false promises
if(!opts.queue){hooks = jQuery._queueHooks(elem,"fx");if(hooks.unqueued == null){hooks.unqueued = 0;oldfire = hooks.empty.fire;hooks.empty.fire = function(){if(!hooks.unqueued){oldfire();}};}hooks.unqueued++;anim.always(function(){ // Ensure the complete handler is called before this completes
anim.always(function(){hooks.unqueued--;if(!jQuery.queue(elem,"fx").length){hooks.empty.fire();}});});} // Height/width overflow pass
if(elem.nodeType === 1 && ("height" in props || "width" in props)){ // Make sure that nothing sneaks out
// Record all 3 overflow attributes because IE9-10 do not
// change the overflow attribute when overflowX and
// overflowY are set to the same value
opts.overflow = [style.overflow,style.overflowX,style.overflowY]; // Set display property to inline-block for height/width
// animations on inline elements that are having width/height animated
display = jQuery.css(elem,"display"); // Test default display if display is currently "none"
checkDisplay = display === "none"?data_priv.get(elem,"olddisplay") || defaultDisplay(elem.nodeName):display;if(checkDisplay === "inline" && jQuery.css(elem,"float") === "none"){style.display = "inline-block";}}if(opts.overflow){style.overflow = "hidden";anim.always(function(){style.overflow = opts.overflow[0];style.overflowX = opts.overflow[1];style.overflowY = opts.overflow[2];});} // show/hide pass
for(prop in props) {value = props[prop];if(rfxtypes.exec(value)){delete props[prop];toggle = toggle || value === "toggle";if(value === (hidden?"hide":"show")){ // If there is dataShow left over from a stopped hide or show and we are going to proceed with show, we should pretend to be hidden
if(value === "show" && dataShow && dataShow[prop] !== undefined){hidden = true;}else {continue;}}orig[prop] = dataShow && dataShow[prop] || jQuery.style(elem,prop); // Any non-fx value stops us from restoring the original display value
}else {display = undefined;}}if(!jQuery.isEmptyObject(orig)){if(dataShow){if("hidden" in dataShow){hidden = dataShow.hidden;}}else {dataShow = data_priv.access(elem,"fxshow",{});} // Store state if its toggle - enables .stop().toggle() to "reverse"
if(toggle){dataShow.hidden = !hidden;}if(hidden){jQuery(elem).show();}else {anim.done(function(){jQuery(elem).hide();});}anim.done(function(){var prop;data_priv.remove(elem,"fxshow");for(prop in orig) {jQuery.style(elem,prop,orig[prop]);}});for(prop in orig) {tween = createTween(hidden?dataShow[prop]:0,prop,anim);if(!(prop in dataShow)){dataShow[prop] = tween.start;if(hidden){tween.end = tween.start;tween.start = prop === "width" || prop === "height"?1:0;}}} // If this is a noop like .hide().hide(), restore an overwritten display value
}else if((display === "none"?defaultDisplay(elem.nodeName):display) === "inline"){style.display = display;}}function propFilter(props,specialEasing){var index,name,easing,value,hooks; // camelCase, specialEasing and expand cssHook pass
for(index in props) {name = jQuery.camelCase(index);easing = specialEasing[name];value = props[index];if(jQuery.isArray(value)){easing = value[1];value = props[index] = value[0];}if(index !== name){props[name] = value;delete props[index];}hooks = jQuery.cssHooks[name];if(hooks && "expand" in hooks){value = hooks.expand(value);delete props[name]; // Not quite $.extend, this won't overwrite existing keys.
// Reusing 'index' because we have the correct "name"
for(index in value) {if(!(index in props)){props[index] = value[index];specialEasing[index] = easing;}}}else {specialEasing[name] = easing;}}}function Animation(elem,properties,options){var result,stopped,index=0,length=animationPrefilters.length,deferred=jQuery.Deferred().always(function(){ // Don't match elem in the :animated selector
delete tick.elem;}),tick=function tick(){if(stopped){return false;}var currentTime=fxNow || createFxNow(),remaining=Math.max(0,animation.startTime + animation.duration - currentTime), // Support: Android 2.3
// Archaic crash bug won't allow us to use `1 - ( 0.5 || 0 )` (#12497)
temp=remaining / animation.duration || 0,percent=1 - temp,index=0,length=animation.tweens.length;for(;index < length;index++) {animation.tweens[index].run(percent);}deferred.notifyWith(elem,[animation,percent,remaining]);if(percent < 1 && length){return remaining;}else {deferred.resolveWith(elem,[animation]);return false;}},animation=deferred.promise({elem:elem,props:jQuery.extend({},properties),opts:jQuery.extend(true,{specialEasing:{}},options),originalProperties:properties,originalOptions:options,startTime:fxNow || createFxNow(),duration:options.duration,tweens:[],createTween:function createTween(prop,end){var tween=jQuery.Tween(elem,animation.opts,prop,end,animation.opts.specialEasing[prop] || animation.opts.easing);animation.tweens.push(tween);return tween;},stop:function stop(gotoEnd){var index=0, // If we are going to the end, we want to run all the tweens
// otherwise we skip this part
length=gotoEnd?animation.tweens.length:0;if(stopped){return this;}stopped = true;for(;index < length;index++) {animation.tweens[index].run(1);} // Resolve when we played the last frame; otherwise, reject
if(gotoEnd){deferred.resolveWith(elem,[animation,gotoEnd]);}else {deferred.rejectWith(elem,[animation,gotoEnd]);}return this;}}),props=animation.props;propFilter(props,animation.opts.specialEasing);for(;index < length;index++) {result = animationPrefilters[index].call(animation,elem,props,animation.opts);if(result){return result;}}jQuery.map(props,createTween,animation);if(jQuery.isFunction(animation.opts.start)){animation.opts.start.call(elem,animation);}jQuery.fx.timer(jQuery.extend(tick,{elem:elem,anim:animation,queue:animation.opts.queue})); // attach callbacks from options
return animation.progress(animation.opts.progress).done(animation.opts.done,animation.opts.complete).fail(animation.opts.fail).always(animation.opts.always);}jQuery.Animation = jQuery.extend(Animation,{tweener:function tweener(props,callback){if(jQuery.isFunction(props)){callback = props;props = ["*"];}else {props = props.split(" ");}var prop,index=0,length=props.length;for(;index < length;index++) {prop = props[index];tweeners[prop] = tweeners[prop] || [];tweeners[prop].unshift(callback);}},prefilter:function prefilter(callback,prepend){if(prepend){animationPrefilters.unshift(callback);}else {animationPrefilters.push(callback);}}});jQuery.speed = function(speed,easing,fn){var opt=speed && typeof speed === "object"?jQuery.extend({},speed):{complete:fn || !fn && easing || jQuery.isFunction(speed) && speed,duration:speed,easing:fn && easing || easing && !jQuery.isFunction(easing) && easing};opt.duration = jQuery.fx.off?0:typeof opt.duration === "number"?opt.duration:opt.duration in jQuery.fx.speeds?jQuery.fx.speeds[opt.duration]:jQuery.fx.speeds._default; // Normalize opt.queue - true/undefined/null -> "fx"
if(opt.queue == null || opt.queue === true){opt.queue = "fx";} // Queueing
opt.old = opt.complete;opt.complete = function(){if(jQuery.isFunction(opt.old)){opt.old.call(this);}if(opt.queue){jQuery.dequeue(this,opt.queue);}};return opt;};jQuery.fn.extend({fadeTo:function fadeTo(speed,to,easing,callback){ // Show any hidden elements after setting opacity to 0
return this.filter(isHidden).css("opacity",0).show() // Animate to the value specified
.end().animate({opacity:to},speed,easing,callback);},animate:function animate(prop,speed,easing,callback){var empty=jQuery.isEmptyObject(prop),optall=jQuery.speed(speed,easing,callback),doAnimation=function doAnimation(){ // Operate on a copy of prop so per-property easing won't be lost
var anim=Animation(this,jQuery.extend({},prop),optall); // Empty animations, or finishing resolves immediately
if(empty || data_priv.get(this,"finish")){anim.stop(true);}};doAnimation.finish = doAnimation;return empty || optall.queue === false?this.each(doAnimation):this.queue(optall.queue,doAnimation);},stop:function stop(type,clearQueue,gotoEnd){var stopQueue=function stopQueue(hooks){var stop=hooks.stop;delete hooks.stop;stop(gotoEnd);};if(typeof type !== "string"){gotoEnd = clearQueue;clearQueue = type;type = undefined;}if(clearQueue && type !== false){this.queue(type || "fx",[]);}return this.each(function(){var dequeue=true,index=type != null && type + "queueHooks",timers=jQuery.timers,data=data_priv.get(this);if(index){if(data[index] && data[index].stop){stopQueue(data[index]);}}else {for(index in data) {if(data[index] && data[index].stop && rrun.test(index)){stopQueue(data[index]);}}}for(index = timers.length;index--;) {if(timers[index].elem === this && (type == null || timers[index].queue === type)){timers[index].anim.stop(gotoEnd);dequeue = false;timers.splice(index,1);}} // Start the next in the queue if the last step wasn't forced.
// Timers currently will call their complete callbacks, which
// will dequeue but only if they were gotoEnd.
if(dequeue || !gotoEnd){jQuery.dequeue(this,type);}});},finish:function finish(type){if(type !== false){type = type || "fx";}return this.each(function(){var index,data=data_priv.get(this),queue=data[type + "queue"],hooks=data[type + "queueHooks"],timers=jQuery.timers,length=queue?queue.length:0; // Enable finishing flag on private data
data.finish = true; // Empty the queue first
jQuery.queue(this,type,[]);if(hooks && hooks.stop){hooks.stop.call(this,true);} // Look for any active animations, and finish them
for(index = timers.length;index--;) {if(timers[index].elem === this && timers[index].queue === type){timers[index].anim.stop(true);timers.splice(index,1);}} // Look for any animations in the old queue and finish them
for(index = 0;index < length;index++) {if(queue[index] && queue[index].finish){queue[index].finish.call(this);}} // Turn off finishing flag
delete data.finish;});}});jQuery.each(["toggle","show","hide"],function(i,name){var cssFn=jQuery.fn[name];jQuery.fn[name] = function(speed,easing,callback){return speed == null || typeof speed === "boolean"?cssFn.apply(this,arguments):this.animate(genFx(name,true),speed,easing,callback);};}); // Generate shortcuts for custom animations
jQuery.each({slideDown:genFx("show"),slideUp:genFx("hide"),slideToggle:genFx("toggle"),fadeIn:{opacity:"show"},fadeOut:{opacity:"hide"},fadeToggle:{opacity:"toggle"}},function(name,props){jQuery.fn[name] = function(speed,easing,callback){return this.animate(props,speed,easing,callback);};});jQuery.timers = [];jQuery.fx.tick = function(){var timer,i=0,timers=jQuery.timers;fxNow = jQuery.now();for(;i < timers.length;i++) {timer = timers[i]; // Checks the timer has not already been removed
if(!timer() && timers[i] === timer){timers.splice(i--,1);}}if(!timers.length){jQuery.fx.stop();}fxNow = undefined;};jQuery.fx.timer = function(timer){jQuery.timers.push(timer);if(timer()){jQuery.fx.start();}else {jQuery.timers.pop();}};jQuery.fx.interval = 13;jQuery.fx.start = function(){if(!timerId){timerId = setInterval(jQuery.fx.tick,jQuery.fx.interval);}};jQuery.fx.stop = function(){clearInterval(timerId);timerId = null;};jQuery.fx.speeds = {slow:600,fast:200, // Default speed
_default:400}; // Based off of the plugin by Clint Helfers, with permission.
// http://blindsignals.com/index.php/2009/07/jquery-delay/
jQuery.fn.delay = function(time,type){time = jQuery.fx?jQuery.fx.speeds[time] || time:time;type = type || "fx";return this.queue(type,function(next,hooks){var timeout=setTimeout(next,time);hooks.stop = function(){clearTimeout(timeout);};});};(function(){var input=document.createElement("input"),select=document.createElement("select"),opt=select.appendChild(document.createElement("option"));input.type = "checkbox"; // Support: iOS<=5.1, Android<=4.2+
// Default value for a checkbox should be "on"
support.checkOn = input.value !== ""; // Support: IE<=11+
// Must access selectedIndex to make default options select
support.optSelected = opt.selected; // Support: Android<=2.3
// Options inside disabled selects are incorrectly marked as disabled
select.disabled = true;support.optDisabled = !opt.disabled; // Support: IE<=11+
// An input loses its value after becoming a radio
input = document.createElement("input");input.value = "t";input.type = "radio";support.radioValue = input.value === "t";})();var nodeHook,boolHook,attrHandle=jQuery.expr.attrHandle;jQuery.fn.extend({attr:function attr(name,value){return access(this,jQuery.attr,name,value,arguments.length > 1);},removeAttr:function removeAttr(name){return this.each(function(){jQuery.removeAttr(this,name);});}});jQuery.extend({attr:function attr(elem,name,value){var hooks,ret,nType=elem.nodeType; // don't get/set attributes on text, comment and attribute nodes
if(!elem || nType === 3 || nType === 8 || nType === 2){return;} // Fallback to prop when attributes are not supported
if(typeof elem.getAttribute === strundefined){return jQuery.prop(elem,name,value);} // All attributes are lowercase
// Grab necessary hook if one is defined
if(nType !== 1 || !jQuery.isXMLDoc(elem)){name = name.toLowerCase();hooks = jQuery.attrHooks[name] || (jQuery.expr.match.bool.test(name)?boolHook:nodeHook);}if(value !== undefined){if(value === null){jQuery.removeAttr(elem,name);}else if(hooks && "set" in hooks && (ret = hooks.set(elem,value,name)) !== undefined){return ret;}else {elem.setAttribute(name,value + "");return value;}}else if(hooks && "get" in hooks && (ret = hooks.get(elem,name)) !== null){return ret;}else {ret = jQuery.find.attr(elem,name); // Non-existent attributes return null, we normalize to undefined
return ret == null?undefined:ret;}},removeAttr:function removeAttr(elem,value){var name,propName,i=0,attrNames=value && value.match(rnotwhite);if(attrNames && elem.nodeType === 1){while(name = attrNames[i++]) {propName = jQuery.propFix[name] || name; // Boolean attributes get special treatment (#10870)
if(jQuery.expr.match.bool.test(name)){ // Set corresponding property to false
elem[propName] = false;}elem.removeAttribute(name);}}},attrHooks:{type:{set:function set(elem,value){if(!support.radioValue && value === "radio" && jQuery.nodeName(elem,"input")){var val=elem.value;elem.setAttribute("type",value);if(val){elem.value = val;}return value;}}}}}); // Hooks for boolean attributes
boolHook = {set:function set(elem,value,name){if(value === false){ // Remove boolean attributes when set to false
jQuery.removeAttr(elem,name);}else {elem.setAttribute(name,name);}return name;}};jQuery.each(jQuery.expr.match.bool.source.match(/\w+/g),function(i,name){var getter=attrHandle[name] || jQuery.find.attr;attrHandle[name] = function(elem,name,isXML){var ret,handle;if(!isXML){ // Avoid an infinite loop by temporarily removing this function from the getter
handle = attrHandle[name];attrHandle[name] = ret;ret = getter(elem,name,isXML) != null?name.toLowerCase():null;attrHandle[name] = handle;}return ret;};});var rfocusable=/^(?:input|select|textarea|button)$/i;jQuery.fn.extend({prop:function prop(name,value){return access(this,jQuery.prop,name,value,arguments.length > 1);},removeProp:function removeProp(name){return this.each(function(){delete this[jQuery.propFix[name] || name];});}});jQuery.extend({propFix:{"for":"htmlFor","class":"className"},prop:function prop(elem,name,value){var ret,hooks,notxml,nType=elem.nodeType; // Don't get/set properties on text, comment and attribute nodes
if(!elem || nType === 3 || nType === 8 || nType === 2){return;}notxml = nType !== 1 || !jQuery.isXMLDoc(elem);if(notxml){ // Fix name and attach hooks
name = jQuery.propFix[name] || name;hooks = jQuery.propHooks[name];}if(value !== undefined){return hooks && "set" in hooks && (ret = hooks.set(elem,value,name)) !== undefined?ret:elem[name] = value;}else {return hooks && "get" in hooks && (ret = hooks.get(elem,name)) !== null?ret:elem[name];}},propHooks:{tabIndex:{get:function get(elem){return elem.hasAttribute("tabindex") || rfocusable.test(elem.nodeName) || elem.href?elem.tabIndex:-1;}}}});if(!support.optSelected){jQuery.propHooks.selected = {get:function get(elem){var parent=elem.parentNode;if(parent && parent.parentNode){parent.parentNode.selectedIndex;}return null;}};}jQuery.each(["tabIndex","readOnly","maxLength","cellSpacing","cellPadding","rowSpan","colSpan","useMap","frameBorder","contentEditable"],function(){jQuery.propFix[this.toLowerCase()] = this;});var rclass=/[\t\r\n\f]/g;jQuery.fn.extend({addClass:function addClass(value){var classes,elem,cur,clazz,j,finalValue,proceed=typeof value === "string" && value,i=0,len=this.length;if(jQuery.isFunction(value)){return this.each(function(j){jQuery(this).addClass(value.call(this,j,this.className));});}if(proceed){ // The disjunction here is for better compressibility (see removeClass)
classes = (value || "").match(rnotwhite) || [];for(;i < len;i++) {elem = this[i];cur = elem.nodeType === 1 && (elem.className?(" " + elem.className + " ").replace(rclass," "):" ");if(cur){j = 0;while(clazz = classes[j++]) {if(cur.indexOf(" " + clazz + " ") < 0){cur += clazz + " ";}} // only assign if different to avoid unneeded rendering.
finalValue = jQuery.trim(cur);if(elem.className !== finalValue){elem.className = finalValue;}}}}return this;},removeClass:function removeClass(value){var classes,elem,cur,clazz,j,finalValue,proceed=arguments.length === 0 || typeof value === "string" && value,i=0,len=this.length;if(jQuery.isFunction(value)){return this.each(function(j){jQuery(this).removeClass(value.call(this,j,this.className));});}if(proceed){classes = (value || "").match(rnotwhite) || [];for(;i < len;i++) {elem = this[i]; // This expression is here for better compressibility (see addClass)
cur = elem.nodeType === 1 && (elem.className?(" " + elem.className + " ").replace(rclass," "):"");if(cur){j = 0;while(clazz = classes[j++]) { // Remove *all* instances
while(cur.indexOf(" " + clazz + " ") >= 0) {cur = cur.replace(" " + clazz + " "," ");}} // Only assign if different to avoid unneeded rendering.
finalValue = value?jQuery.trim(cur):"";if(elem.className !== finalValue){elem.className = finalValue;}}}}return this;},toggleClass:function toggleClass(value,stateVal){var type=typeof value;if(typeof stateVal === "boolean" && type === "string"){return stateVal?this.addClass(value):this.removeClass(value);}if(jQuery.isFunction(value)){return this.each(function(i){jQuery(this).toggleClass(value.call(this,i,this.className,stateVal),stateVal);});}return this.each(function(){if(type === "string"){ // Toggle individual class names
var className,i=0,self=jQuery(this),classNames=value.match(rnotwhite) || [];while(className = classNames[i++]) { // Check each className given, space separated list
if(self.hasClass(className)){self.removeClass(className);}else {self.addClass(className);}} // Toggle whole class name
}else if(type === strundefined || type === "boolean"){if(this.className){ // store className if set
data_priv.set(this,"__className__",this.className);} // If the element has a class name or if we're passed `false`,
// then remove the whole classname (if there was one, the above saved it).
// Otherwise bring back whatever was previously saved (if anything),
// falling back to the empty string if nothing was stored.
this.className = this.className || value === false?"":data_priv.get(this,"__className__") || "";}});},hasClass:function hasClass(selector){var className=" " + selector + " ",i=0,l=this.length;for(;i < l;i++) {if(this[i].nodeType === 1 && (" " + this[i].className + " ").replace(rclass," ").indexOf(className) >= 0){return true;}}return false;}});var rreturn=/\r/g;jQuery.fn.extend({val:function val(value){var hooks,ret,isFunction,elem=this[0];if(!arguments.length){if(elem){hooks = jQuery.valHooks[elem.type] || jQuery.valHooks[elem.nodeName.toLowerCase()];if(hooks && "get" in hooks && (ret = hooks.get(elem,"value")) !== undefined){return ret;}ret = elem.value;return typeof ret === "string"? // Handle most common string cases
ret.replace(rreturn,""): // Handle cases where value is null/undef or number
ret == null?"":ret;}return;}isFunction = jQuery.isFunction(value);return this.each(function(i){var val;if(this.nodeType !== 1){return;}if(isFunction){val = value.call(this,i,jQuery(this).val());}else {val = value;} // Treat null/undefined as ""; convert numbers to string
if(val == null){val = "";}else if(typeof val === "number"){val += "";}else if(jQuery.isArray(val)){val = jQuery.map(val,function(value){return value == null?"":value + "";});}hooks = jQuery.valHooks[this.type] || jQuery.valHooks[this.nodeName.toLowerCase()]; // If set returns undefined, fall back to normal setting
if(!hooks || !("set" in hooks) || hooks.set(this,val,"value") === undefined){this.value = val;}});}});jQuery.extend({valHooks:{option:{get:function get(elem){var val=jQuery.find.attr(elem,"value");return val != null?val: // Support: IE10-11+
// option.text throws exceptions (#14686, #14858)
jQuery.trim(jQuery.text(elem));}},select:{get:function get(elem){var value,option,options=elem.options,index=elem.selectedIndex,one=elem.type === "select-one" || index < 0,values=one?null:[],max=one?index + 1:options.length,i=index < 0?max:one?index:0; // Loop through all the selected options
for(;i < max;i++) {option = options[i]; // IE6-9 doesn't update selected after form reset (#2551)
if((option.selected || i === index) && ( // Don't return options that are disabled or in a disabled optgroup
support.optDisabled?!option.disabled:option.getAttribute("disabled") === null) && (!option.parentNode.disabled || !jQuery.nodeName(option.parentNode,"optgroup"))){ // Get the specific value for the option
value = jQuery(option).val(); // We don't need an array for one selects
if(one){return value;} // Multi-Selects return an array
values.push(value);}}return values;},set:function set(elem,value){var optionSet,option,options=elem.options,values=jQuery.makeArray(value),i=options.length;while(i--) {option = options[i];if(option.selected = jQuery.inArray(option.value,values) >= 0){optionSet = true;}} // Force browsers to behave consistently when non-matching value is set
if(!optionSet){elem.selectedIndex = -1;}return values;}}}}); // Radios and checkboxes getter/setter
jQuery.each(["radio","checkbox"],function(){jQuery.valHooks[this] = {set:function set(elem,value){if(jQuery.isArray(value)){return elem.checked = jQuery.inArray(jQuery(elem).val(),value) >= 0;}}};if(!support.checkOn){jQuery.valHooks[this].get = function(elem){return elem.getAttribute("value") === null?"on":elem.value;};}}); // Return jQuery for attributes-only inclusion
jQuery.each(("blur focus focusin focusout load resize scroll unload click dblclick " + "mousedown mouseup mousemove mouseover mouseout mouseenter mouseleave " + "change select submit keydown keypress keyup error contextmenu").split(" "),function(i,name){ // Handle event binding
jQuery.fn[name] = function(data,fn){return arguments.length > 0?this.on(name,null,data,fn):this.trigger(name);};});jQuery.fn.extend({hover:function hover(fnOver,fnOut){return this.mouseenter(fnOver).mouseleave(fnOut || fnOver);},bind:function bind(types,data,fn){return this.on(types,null,data,fn);},unbind:function unbind(types,fn){return this.off(types,null,fn);},delegate:function delegate(selector,types,data,fn){return this.on(types,selector,data,fn);},undelegate:function undelegate(selector,types,fn){ // ( namespace ) or ( selector, types [, fn] )
return arguments.length === 1?this.off(selector,"**"):this.off(types,selector || "**",fn);}});var nonce=jQuery.now();var rquery=/\?/; // Support: Android 2.3
// Workaround failure to string-cast null input
jQuery.parseJSON = function(data){return JSON.parse(data + "");}; // Cross-browser xml parsing
jQuery.parseXML = function(data){var xml,tmp;if(!data || typeof data !== "string"){return null;} // Support: IE9
try{tmp = new DOMParser();xml = tmp.parseFromString(data,"text/xml");}catch(e) {xml = undefined;}if(!xml || xml.getElementsByTagName("parsererror").length){jQuery.error("Invalid XML: " + data);}return xml;};var rhash=/#.*$/,rts=/([?&])_=[^&]*/,rheaders=/^(.*?):[ \t]*([^\r\n]*)$/mg, // #7653, #8125, #8152: local protocol detection
rlocalProtocol=/^(?:about|app|app-storage|.+-extension|file|res|widget):$/,rnoContent=/^(?:GET|HEAD)$/,rprotocol=/^\/\//,rurl=/^([\w.+-]+:)(?:\/\/(?:[^\/?#]*@|)([^\/?#:]*)(?::(\d+)|)|)/, /* Prefilters
	 * 1) They are useful to introduce custom dataTypes (see ajax/jsonp.js for an example)
	 * 2) These are called:
	 *    - BEFORE asking for a transport
	 *    - AFTER param serialization (s.data is a string if s.processData is true)
	 * 3) key is the dataType
	 * 4) the catchall symbol "*" can be used
	 * 5) execution will start with transport dataType and THEN continue down to "*" if needed
	 */prefilters={}, /* Transports bindings
	 * 1) key is the dataType
	 * 2) the catchall symbol "*" can be used
	 * 3) selection will start with transport dataType and THEN go to "*" if needed
	 */transports={}, // Avoid comment-prolog char sequence (#10098); must appease lint and evade compression
allTypes="*/".concat("*"), // Document location
ajaxLocation=window.location.href, // Segment location into parts
ajaxLocParts=rurl.exec(ajaxLocation.toLowerCase()) || []; // Base "constructor" for jQuery.ajaxPrefilter and jQuery.ajaxTransport
function addToPrefiltersOrTransports(structure){ // dataTypeExpression is optional and defaults to "*"
return function(dataTypeExpression,func){if(typeof dataTypeExpression !== "string"){func = dataTypeExpression;dataTypeExpression = "*";}var dataType,i=0,dataTypes=dataTypeExpression.toLowerCase().match(rnotwhite) || [];if(jQuery.isFunction(func)){ // For each dataType in the dataTypeExpression
while(dataType = dataTypes[i++]) { // Prepend if requested
if(dataType[0] === "+"){dataType = dataType.slice(1) || "*";(structure[dataType] = structure[dataType] || []).unshift(func); // Otherwise append
}else {(structure[dataType] = structure[dataType] || []).push(func);}}}};} // Base inspection function for prefilters and transports
function inspectPrefiltersOrTransports(structure,options,originalOptions,jqXHR){var inspected={},seekingTransport=structure === transports;function inspect(dataType){var selected;inspected[dataType] = true;jQuery.each(structure[dataType] || [],function(_,prefilterOrFactory){var dataTypeOrTransport=prefilterOrFactory(options,originalOptions,jqXHR);if(typeof dataTypeOrTransport === "string" && !seekingTransport && !inspected[dataTypeOrTransport]){options.dataTypes.unshift(dataTypeOrTransport);inspect(dataTypeOrTransport);return false;}else if(seekingTransport){return !(selected = dataTypeOrTransport);}});return selected;}return inspect(options.dataTypes[0]) || !inspected["*"] && inspect("*");} // A special extend for ajax options
// that takes "flat" options (not to be deep extended)
// Fixes #9887
function ajaxExtend(target,src){var key,deep,flatOptions=jQuery.ajaxSettings.flatOptions || {};for(key in src) {if(src[key] !== undefined){(flatOptions[key]?target:deep || (deep = {}))[key] = src[key];}}if(deep){jQuery.extend(true,target,deep);}return target;} /* Handles responses to an ajax request:
 * - finds the right dataType (mediates between content-type and expected dataType)
 * - returns the corresponding response
 */function ajaxHandleResponses(s,jqXHR,responses){var ct,type,finalDataType,firstDataType,contents=s.contents,dataTypes=s.dataTypes; // Remove auto dataType and get content-type in the process
while(dataTypes[0] === "*") {dataTypes.shift();if(ct === undefined){ct = s.mimeType || jqXHR.getResponseHeader("Content-Type");}} // Check if we're dealing with a known content-type
if(ct){for(type in contents) {if(contents[type] && contents[type].test(ct)){dataTypes.unshift(type);break;}}} // Check to see if we have a response for the expected dataType
if(dataTypes[0] in responses){finalDataType = dataTypes[0];}else { // Try convertible dataTypes
for(type in responses) {if(!dataTypes[0] || s.converters[type + " " + dataTypes[0]]){finalDataType = type;break;}if(!firstDataType){firstDataType = type;}} // Or just use first one
finalDataType = finalDataType || firstDataType;} // If we found a dataType
// We add the dataType to the list if needed
// and return the corresponding response
if(finalDataType){if(finalDataType !== dataTypes[0]){dataTypes.unshift(finalDataType);}return responses[finalDataType];}} /* Chain conversions given the request and the original response
 * Also sets the responseXXX fields on the jqXHR instance
 */function ajaxConvert(s,response,jqXHR,isSuccess){var conv2,current,conv,tmp,prev,converters={}, // Work with a copy of dataTypes in case we need to modify it for conversion
dataTypes=s.dataTypes.slice(); // Create converters map with lowercased keys
if(dataTypes[1]){for(conv in s.converters) {converters[conv.toLowerCase()] = s.converters[conv];}}current = dataTypes.shift(); // Convert to each sequential dataType
while(current) {if(s.responseFields[current]){jqXHR[s.responseFields[current]] = response;} // Apply the dataFilter if provided
if(!prev && isSuccess && s.dataFilter){response = s.dataFilter(response,s.dataType);}prev = current;current = dataTypes.shift();if(current){ // There's only work to do if current dataType is non-auto
if(current === "*"){current = prev; // Convert response if prev dataType is non-auto and differs from current
}else if(prev !== "*" && prev !== current){ // Seek a direct converter
conv = converters[prev + " " + current] || converters["* " + current]; // If none found, seek a pair
if(!conv){for(conv2 in converters) { // If conv2 outputs current
tmp = conv2.split(" ");if(tmp[1] === current){ // If prev can be converted to accepted input
conv = converters[prev + " " + tmp[0]] || converters["* " + tmp[0]];if(conv){ // Condense equivalence converters
if(conv === true){conv = converters[conv2]; // Otherwise, insert the intermediate dataType
}else if(converters[conv2] !== true){current = tmp[0];dataTypes.unshift(tmp[1]);}break;}}}} // Apply converter (if not an equivalence)
if(conv !== true){ // Unless errors are allowed to bubble, catch and return them
if(conv && s["throws"]){response = conv(response);}else {try{response = conv(response);}catch(e) {return {state:"parsererror",error:conv?e:"No conversion from " + prev + " to " + current};}}}}}}return {state:"success",data:response};}jQuery.extend({ // Counter for holding the number of active queries
active:0, // Last-Modified header cache for next request
lastModified:{},etag:{},ajaxSettings:{url:ajaxLocation,type:"GET",isLocal:rlocalProtocol.test(ajaxLocParts[1]),global:true,processData:true,async:true,contentType:"application/x-www-form-urlencoded; charset=UTF-8", /*
		timeout: 0,
		data: null,
		dataType: null,
		username: null,
		password: null,
		cache: null,
		throws: false,
		traditional: false,
		headers: {},
		*/accepts:{"*":allTypes,text:"text/plain",html:"text/html",xml:"application/xml, text/xml",json:"application/json, text/javascript"},contents:{xml:/xml/,html:/html/,json:/json/},responseFields:{xml:"responseXML",text:"responseText",json:"responseJSON"}, // Data converters
// Keys separate source (or catchall "*") and destination types with a single space
converters:{ // Convert anything to text
"* text":String, // Text to html (true = no transformation)
"text html":true, // Evaluate text as a json expression
"text json":jQuery.parseJSON, // Parse text as xml
"text xml":jQuery.parseXML}, // For options that shouldn't be deep extended:
// you can add your own custom options here if
// and when you create one that shouldn't be
// deep extended (see ajaxExtend)
flatOptions:{url:true,context:true}}, // Creates a full fledged settings object into target
// with both ajaxSettings and settings fields.
// If target is omitted, writes into ajaxSettings.
ajaxSetup:function ajaxSetup(target,settings){return settings? // Building a settings object
ajaxExtend(ajaxExtend(target,jQuery.ajaxSettings),settings): // Extending ajaxSettings
ajaxExtend(jQuery.ajaxSettings,target);},ajaxPrefilter:addToPrefiltersOrTransports(prefilters),ajaxTransport:addToPrefiltersOrTransports(transports), // Main method
ajax:function ajax(url,options){ // If url is an object, simulate pre-1.5 signature
if(typeof url === "object"){options = url;url = undefined;} // Force options to be an object
options = options || {};var transport, // URL without anti-cache param
cacheURL, // Response headers
responseHeadersString,responseHeaders, // timeout handle
timeoutTimer, // Cross-domain detection vars
parts, // To know if global events are to be dispatched
fireGlobals, // Loop variable
i, // Create the final options object
s=jQuery.ajaxSetup({},options), // Callbacks context
callbackContext=s.context || s, // Context for global events is callbackContext if it is a DOM node or jQuery collection
globalEventContext=s.context && (callbackContext.nodeType || callbackContext.jquery)?jQuery(callbackContext):jQuery.event, // Deferreds
deferred=jQuery.Deferred(),completeDeferred=jQuery.Callbacks("once memory"), // Status-dependent callbacks
_statusCode=s.statusCode || {}, // Headers (they are sent all at once)
requestHeaders={},requestHeadersNames={}, // The jqXHR state
state=0, // Default abort message
strAbort="canceled", // Fake xhr
jqXHR={readyState:0, // Builds headers hashtable if needed
getResponseHeader:function getResponseHeader(key){var match;if(state === 2){if(!responseHeaders){responseHeaders = {};while(match = rheaders.exec(responseHeadersString)) {responseHeaders[match[1].toLowerCase()] = match[2];}}match = responseHeaders[key.toLowerCase()];}return match == null?null:match;}, // Raw string
getAllResponseHeaders:function getAllResponseHeaders(){return state === 2?responseHeadersString:null;}, // Caches the header
setRequestHeader:function setRequestHeader(name,value){var lname=name.toLowerCase();if(!state){name = requestHeadersNames[lname] = requestHeadersNames[lname] || name;requestHeaders[name] = value;}return this;}, // Overrides response content-type header
overrideMimeType:function overrideMimeType(type){if(!state){s.mimeType = type;}return this;}, // Status-dependent callbacks
statusCode:function statusCode(map){var code;if(map){if(state < 2){for(code in map) { // Lazy-add the new callback in a way that preserves old ones
_statusCode[code] = [_statusCode[code],map[code]];}}else { // Execute the appropriate callbacks
jqXHR.always(map[jqXHR.status]);}}return this;}, // Cancel the request
abort:function abort(statusText){var finalText=statusText || strAbort;if(transport){transport.abort(finalText);}done(0,finalText);return this;}}; // Attach deferreds
deferred.promise(jqXHR).complete = completeDeferred.add;jqXHR.success = jqXHR.done;jqXHR.error = jqXHR.fail; // Remove hash character (#7531: and string promotion)
// Add protocol if not provided (prefilters might expect it)
// Handle falsy url in the settings object (#10093: consistency with old signature)
// We also use the url parameter if available
s.url = ((url || s.url || ajaxLocation) + "").replace(rhash,"").replace(rprotocol,ajaxLocParts[1] + "//"); // Alias method option to type as per ticket #12004
s.type = options.method || options.type || s.method || s.type; // Extract dataTypes list
s.dataTypes = jQuery.trim(s.dataType || "*").toLowerCase().match(rnotwhite) || [""]; // A cross-domain request is in order when we have a protocol:host:port mismatch
if(s.crossDomain == null){parts = rurl.exec(s.url.toLowerCase());s.crossDomain = !!(parts && (parts[1] !== ajaxLocParts[1] || parts[2] !== ajaxLocParts[2] || (parts[3] || (parts[1] === "http:"?"80":"443")) !== (ajaxLocParts[3] || (ajaxLocParts[1] === "http:"?"80":"443"))));} // Convert data if not already a string
if(s.data && s.processData && typeof s.data !== "string"){s.data = jQuery.param(s.data,s.traditional);} // Apply prefilters
inspectPrefiltersOrTransports(prefilters,s,options,jqXHR); // If request was aborted inside a prefilter, stop there
if(state === 2){return jqXHR;} // We can fire global events as of now if asked to
// Don't fire events if jQuery.event is undefined in an AMD-usage scenario (#15118)
fireGlobals = jQuery.event && s.global; // Watch for a new set of requests
if(fireGlobals && jQuery.active++ === 0){jQuery.event.trigger("ajaxStart");} // Uppercase the type
s.type = s.type.toUpperCase(); // Determine if request has content
s.hasContent = !rnoContent.test(s.type); // Save the URL in case we're toying with the If-Modified-Since
// and/or If-None-Match header later on
cacheURL = s.url; // More options handling for requests with no content
if(!s.hasContent){ // If data is available, append data to url
if(s.data){cacheURL = s.url += (rquery.test(cacheURL)?"&":"?") + s.data; // #9682: remove data so that it's not used in an eventual retry
delete s.data;} // Add anti-cache in url if needed
if(s.cache === false){s.url = rts.test(cacheURL)? // If there is already a '_' parameter, set its value
cacheURL.replace(rts,"$1_=" + nonce++): // Otherwise add one to the end
cacheURL + (rquery.test(cacheURL)?"&":"?") + "_=" + nonce++;}} // Set the If-Modified-Since and/or If-None-Match header, if in ifModified mode.
if(s.ifModified){if(jQuery.lastModified[cacheURL]){jqXHR.setRequestHeader("If-Modified-Since",jQuery.lastModified[cacheURL]);}if(jQuery.etag[cacheURL]){jqXHR.setRequestHeader("If-None-Match",jQuery.etag[cacheURL]);}} // Set the correct header, if data is being sent
if(s.data && s.hasContent && s.contentType !== false || options.contentType){jqXHR.setRequestHeader("Content-Type",s.contentType);} // Set the Accepts header for the server, depending on the dataType
jqXHR.setRequestHeader("Accept",s.dataTypes[0] && s.accepts[s.dataTypes[0]]?s.accepts[s.dataTypes[0]] + (s.dataTypes[0] !== "*"?", " + allTypes + "; q=0.01":""):s.accepts["*"]); // Check for headers option
for(i in s.headers) {jqXHR.setRequestHeader(i,s.headers[i]);} // Allow custom headers/mimetypes and early abort
if(s.beforeSend && (s.beforeSend.call(callbackContext,jqXHR,s) === false || state === 2)){ // Abort if not done already and return
return jqXHR.abort();} // Aborting is no longer a cancellation
strAbort = "abort"; // Install callbacks on deferreds
for(i in {success:1,error:1,complete:1}) {jqXHR[i](s[i]);} // Get transport
transport = inspectPrefiltersOrTransports(transports,s,options,jqXHR); // If no transport, we auto-abort
if(!transport){done(-1,"No Transport");}else {jqXHR.readyState = 1; // Send global event
if(fireGlobals){globalEventContext.trigger("ajaxSend",[jqXHR,s]);} // Timeout
if(s.async && s.timeout > 0){timeoutTimer = setTimeout(function(){jqXHR.abort("timeout");},s.timeout);}try{state = 1;transport.send(requestHeaders,done);}catch(e) { // Propagate exception as error if not done
if(state < 2){done(-1,e); // Simply rethrow otherwise
}else {throw e;}}} // Callback for when everything is done
function done(status,nativeStatusText,responses,headers){var isSuccess,success,error,response,modified,statusText=nativeStatusText; // Called once
if(state === 2){return;} // State is "done" now
state = 2; // Clear timeout if it exists
if(timeoutTimer){clearTimeout(timeoutTimer);} // Dereference transport for early garbage collection
// (no matter how long the jqXHR object will be used)
transport = undefined; // Cache response headers
responseHeadersString = headers || ""; // Set readyState
jqXHR.readyState = status > 0?4:0; // Determine if successful
isSuccess = status >= 200 && status < 300 || status === 304; // Get response data
if(responses){response = ajaxHandleResponses(s,jqXHR,responses);} // Convert no matter what (that way responseXXX fields are always set)
response = ajaxConvert(s,response,jqXHR,isSuccess); // If successful, handle type chaining
if(isSuccess){ // Set the If-Modified-Since and/or If-None-Match header, if in ifModified mode.
if(s.ifModified){modified = jqXHR.getResponseHeader("Last-Modified");if(modified){jQuery.lastModified[cacheURL] = modified;}modified = jqXHR.getResponseHeader("etag");if(modified){jQuery.etag[cacheURL] = modified;}} // if no content
if(status === 204 || s.type === "HEAD"){statusText = "nocontent"; // if not modified
}else if(status === 304){statusText = "notmodified"; // If we have data, let's convert it
}else {statusText = response.state;success = response.data;error = response.error;isSuccess = !error;}}else { // Extract error from statusText and normalize for non-aborts
error = statusText;if(status || !statusText){statusText = "error";if(status < 0){status = 0;}}} // Set data for the fake xhr object
jqXHR.status = status;jqXHR.statusText = (nativeStatusText || statusText) + ""; // Success/Error
if(isSuccess){deferred.resolveWith(callbackContext,[success,statusText,jqXHR]);}else {deferred.rejectWith(callbackContext,[jqXHR,statusText,error]);} // Status-dependent callbacks
jqXHR.statusCode(_statusCode);_statusCode = undefined;if(fireGlobals){globalEventContext.trigger(isSuccess?"ajaxSuccess":"ajaxError",[jqXHR,s,isSuccess?success:error]);} // Complete
completeDeferred.fireWith(callbackContext,[jqXHR,statusText]);if(fireGlobals){globalEventContext.trigger("ajaxComplete",[jqXHR,s]); // Handle the global AJAX counter
if(! --jQuery.active){jQuery.event.trigger("ajaxStop");}}}return jqXHR;},getJSON:function getJSON(url,data,callback){return jQuery.get(url,data,callback,"json");},getScript:function getScript(url,callback){return jQuery.get(url,undefined,callback,"script");}});jQuery.each(["get","post"],function(i,method){jQuery[method] = function(url,data,callback,type){ // Shift arguments if data argument was omitted
if(jQuery.isFunction(data)){type = type || callback;callback = data;data = undefined;}return jQuery.ajax({url:url,type:method,dataType:type,data:data,success:callback});};});jQuery._evalUrl = function(url){return jQuery.ajax({url:url,type:"GET",dataType:"script",async:false,global:false,"throws":true});};jQuery.fn.extend({wrapAll:function wrapAll(html){var wrap;if(jQuery.isFunction(html)){return this.each(function(i){jQuery(this).wrapAll(html.call(this,i));});}if(this[0]){ // The elements to wrap the target around
wrap = jQuery(html,this[0].ownerDocument).eq(0).clone(true);if(this[0].parentNode){wrap.insertBefore(this[0]);}wrap.map(function(){var elem=this;while(elem.firstElementChild) {elem = elem.firstElementChild;}return elem;}).append(this);}return this;},wrapInner:function wrapInner(html){if(jQuery.isFunction(html)){return this.each(function(i){jQuery(this).wrapInner(html.call(this,i));});}return this.each(function(){var self=jQuery(this),contents=self.contents();if(contents.length){contents.wrapAll(html);}else {self.append(html);}});},wrap:function wrap(html){var isFunction=jQuery.isFunction(html);return this.each(function(i){jQuery(this).wrapAll(isFunction?html.call(this,i):html);});},unwrap:function unwrap(){return this.parent().each(function(){if(!jQuery.nodeName(this,"body")){jQuery(this).replaceWith(this.childNodes);}}).end();}});jQuery.expr.filters.hidden = function(elem){ // Support: Opera <= 12.12
// Opera reports offsetWidths and offsetHeights less than zero on some elements
return elem.offsetWidth <= 0 && elem.offsetHeight <= 0;};jQuery.expr.filters.visible = function(elem){return !jQuery.expr.filters.hidden(elem);};var r20=/%20/g,rbracket=/\[\]$/,rCRLF=/\r?\n/g,rsubmitterTypes=/^(?:submit|button|image|reset|file)$/i,rsubmittable=/^(?:input|select|textarea|keygen)/i;function buildParams(prefix,obj,traditional,add){var name;if(jQuery.isArray(obj)){ // Serialize array item.
jQuery.each(obj,function(i,v){if(traditional || rbracket.test(prefix)){ // Treat each array item as a scalar.
add(prefix,v);}else { // Item is non-scalar (array or object), encode its numeric index.
buildParams(prefix + "[" + (typeof v === "object"?i:"") + "]",v,traditional,add);}});}else if(!traditional && jQuery.type(obj) === "object"){ // Serialize object item.
for(name in obj) {buildParams(prefix + "[" + name + "]",obj[name],traditional,add);}}else { // Serialize scalar item.
add(prefix,obj);}} // Serialize an array of form elements or a set of
// key/values into a query string
jQuery.param = function(a,traditional){var prefix,s=[],add=function add(key,value){ // If value is a function, invoke it and return its value
value = jQuery.isFunction(value)?value():value == null?"":value;s[s.length] = encodeURIComponent(key) + "=" + encodeURIComponent(value);}; // Set traditional to true for jQuery <= 1.3.2 behavior.
if(traditional === undefined){traditional = jQuery.ajaxSettings && jQuery.ajaxSettings.traditional;} // If an array was passed in, assume that it is an array of form elements.
if(jQuery.isArray(a) || a.jquery && !jQuery.isPlainObject(a)){ // Serialize the form elements
jQuery.each(a,function(){add(this.name,this.value);});}else { // If traditional, encode the "old" way (the way 1.3.2 or older
// did it), otherwise encode params recursively.
for(prefix in a) {buildParams(prefix,a[prefix],traditional,add);}} // Return the resulting serialization
return s.join("&").replace(r20,"+");};jQuery.fn.extend({serialize:function serialize(){return jQuery.param(this.serializeArray());},serializeArray:function serializeArray(){return this.map(function(){ // Can add propHook for "elements" to filter or add form elements
var elements=jQuery.prop(this,"elements");return elements?jQuery.makeArray(elements):this;}).filter(function(){var type=this.type; // Use .is( ":disabled" ) so that fieldset[disabled] works
return this.name && !jQuery(this).is(":disabled") && rsubmittable.test(this.nodeName) && !rsubmitterTypes.test(type) && (this.checked || !rcheckableType.test(type));}).map(function(i,elem){var val=jQuery(this).val();return val == null?null:jQuery.isArray(val)?jQuery.map(val,function(val){return {name:elem.name,value:val.replace(rCRLF,"\r\n")};}):{name:elem.name,value:val.replace(rCRLF,"\r\n")};}).get();}});jQuery.ajaxSettings.xhr = function(){try{return new XMLHttpRequest();}catch(e) {}};var xhrId=0,xhrCallbacks={},xhrSuccessStatus={ // file protocol always yields status code 0, assume 200
0:200, // Support: IE9
// #1450: sometimes IE returns 1223 when it should be 204
1223:204},xhrSupported=jQuery.ajaxSettings.xhr(); // Support: IE9
// Open requests must be manually aborted on unload (#5280)
// See https://support.microsoft.com/kb/2856746 for more info
if(window.attachEvent){window.attachEvent("onunload",function(){for(var key in xhrCallbacks) {xhrCallbacks[key]();}});}support.cors = !!xhrSupported && "withCredentials" in xhrSupported;support.ajax = xhrSupported = !!xhrSupported;jQuery.ajaxTransport(function(options){var callback; // Cross domain only allowed if supported through XMLHttpRequest
if(support.cors || xhrSupported && !options.crossDomain){return {send:function send(headers,complete){var i,xhr=options.xhr(),id=++xhrId;xhr.open(options.type,options.url,options.async,options.username,options.password); // Apply custom fields if provided
if(options.xhrFields){for(i in options.xhrFields) {xhr[i] = options.xhrFields[i];}} // Override mime type if needed
if(options.mimeType && xhr.overrideMimeType){xhr.overrideMimeType(options.mimeType);} // X-Requested-With header
// For cross-domain requests, seeing as conditions for a preflight are
// akin to a jigsaw puzzle, we simply never set it to be sure.
// (it can always be set on a per-request basis or even using ajaxSetup)
// For same-domain requests, won't change header if already provided.
if(!options.crossDomain && !headers["X-Requested-With"]){headers["X-Requested-With"] = "XMLHttpRequest";} // Set headers
for(i in headers) {xhr.setRequestHeader(i,headers[i]);} // Callback
callback = function(type){return function(){if(callback){delete xhrCallbacks[id];callback = xhr.onload = xhr.onerror = null;if(type === "abort"){xhr.abort();}else if(type === "error"){complete( // file: protocol always yields status 0; see #8605, #14207
xhr.status,xhr.statusText);}else {complete(xhrSuccessStatus[xhr.status] || xhr.status,xhr.statusText, // Support: IE9
// Accessing binary-data responseText throws an exception
// (#11426)
typeof xhr.responseText === "string"?{text:xhr.responseText}:undefined,xhr.getAllResponseHeaders());}}};}; // Listen to events
xhr.onload = callback();xhr.onerror = callback("error"); // Create the abort callback
callback = xhrCallbacks[id] = callback("abort");try{ // Do send the request (this may raise an exception)
xhr.send(options.hasContent && options.data || null);}catch(e) { // #14683: Only rethrow if this hasn't been notified as an error yet
if(callback){throw e;}}},abort:function abort(){if(callback){callback();}}};}}); // Install script dataType
jQuery.ajaxSetup({accepts:{script:"text/javascript, application/javascript, application/ecmascript, application/x-ecmascript"},contents:{script:/(?:java|ecma)script/},converters:{"text script":function textScript(text){jQuery.globalEval(text);return text;}}}); // Handle cache's special case and crossDomain
jQuery.ajaxPrefilter("script",function(s){if(s.cache === undefined){s.cache = false;}if(s.crossDomain){s.type = "GET";}}); // Bind script tag hack transport
jQuery.ajaxTransport("script",function(s){ // This transport only deals with cross domain requests
if(s.crossDomain){var script,callback;return {send:function send(_,complete){script = jQuery("<script>").prop({async:true,charset:s.scriptCharset,src:s.url}).on("load error",callback = function(evt){script.remove();callback = null;if(evt){complete(evt.type === "error"?404:200,evt.type);}});document.head.appendChild(script[0]);},abort:function abort(){if(callback){callback();}}};}});var oldCallbacks=[],rjsonp=/(=)\?(?=&|$)|\?\?/; // Default jsonp settings
jQuery.ajaxSetup({jsonp:"callback",jsonpCallback:function jsonpCallback(){var callback=oldCallbacks.pop() || jQuery.expando + "_" + nonce++;this[callback] = true;return callback;}}); // Detect, normalize options and install callbacks for jsonp requests
jQuery.ajaxPrefilter("json jsonp",function(s,originalSettings,jqXHR){var callbackName,overwritten,responseContainer,jsonProp=s.jsonp !== false && (rjsonp.test(s.url)?"url":typeof s.data === "string" && !(s.contentType || "").indexOf("application/x-www-form-urlencoded") && rjsonp.test(s.data) && "data"); // Handle iff the expected data type is "jsonp" or we have a parameter to set
if(jsonProp || s.dataTypes[0] === "jsonp"){ // Get callback name, remembering preexisting value associated with it
callbackName = s.jsonpCallback = jQuery.isFunction(s.jsonpCallback)?s.jsonpCallback():s.jsonpCallback; // Insert callback into url or form data
if(jsonProp){s[jsonProp] = s[jsonProp].replace(rjsonp,"$1" + callbackName);}else if(s.jsonp !== false){s.url += (rquery.test(s.url)?"&":"?") + s.jsonp + "=" + callbackName;} // Use data converter to retrieve json after script execution
s.converters["script json"] = function(){if(!responseContainer){jQuery.error(callbackName + " was not called");}return responseContainer[0];}; // force json dataType
s.dataTypes[0] = "json"; // Install callback
overwritten = window[callbackName];window[callbackName] = function(){responseContainer = arguments;}; // Clean-up function (fires after converters)
jqXHR.always(function(){ // Restore preexisting value
window[callbackName] = overwritten; // Save back as free
if(s[callbackName]){ // make sure that re-using the options doesn't screw things around
s.jsonpCallback = originalSettings.jsonpCallback; // save the callback name for future use
oldCallbacks.push(callbackName);} // Call if it was a function and we have a response
if(responseContainer && jQuery.isFunction(overwritten)){overwritten(responseContainer[0]);}responseContainer = overwritten = undefined;}); // Delegate to script
return "script";}}); // data: string of html
// context (optional): If specified, the fragment will be created in this context, defaults to document
// keepScripts (optional): If true, will include scripts passed in the html string
jQuery.parseHTML = function(data,context,keepScripts){if(!data || typeof data !== "string"){return null;}if(typeof context === "boolean"){keepScripts = context;context = false;}context = context || document;var parsed=rsingleTag.exec(data),scripts=!keepScripts && []; // Single tag
if(parsed){return [context.createElement(parsed[1])];}parsed = jQuery.buildFragment([data],context,scripts);if(scripts && scripts.length){jQuery(scripts).remove();}return jQuery.merge([],parsed.childNodes);}; // Keep a copy of the old load method
var _load=jQuery.fn.load; /**
 * Load a url into a page
 */jQuery.fn.load = function(url,params,callback){if(typeof url !== "string" && _load){return _load.apply(this,arguments);}var selector,type,response,self=this,off=url.indexOf(" ");if(off >= 0){selector = jQuery.trim(url.slice(off));url = url.slice(0,off);} // If it's a function
if(jQuery.isFunction(params)){ // We assume that it's the callback
callback = params;params = undefined; // Otherwise, build a param string
}else if(params && typeof params === "object"){type = "POST";} // If we have elements to modify, make the request
if(self.length > 0){jQuery.ajax({url:url, // if "type" variable is undefined, then "GET" method will be used
type:type,dataType:"html",data:params}).done(function(responseText){ // Save response for use in complete callback
response = arguments;self.html(selector? // If a selector was specified, locate the right elements in a dummy div
// Exclude scripts to avoid IE 'Permission Denied' errors
jQuery("<div>").append(jQuery.parseHTML(responseText)).find(selector): // Otherwise use the full result
responseText);}).complete(callback && function(jqXHR,status){self.each(callback,response || [jqXHR.responseText,status,jqXHR]);});}return this;}; // Attach a bunch of functions for handling common AJAX events
jQuery.each(["ajaxStart","ajaxStop","ajaxComplete","ajaxError","ajaxSuccess","ajaxSend"],function(i,type){jQuery.fn[type] = function(fn){return this.on(type,fn);};});jQuery.expr.filters.animated = function(elem){return jQuery.grep(jQuery.timers,function(fn){return elem === fn.elem;}).length;};var docElem=window.document.documentElement; /**
 * Gets a window from an element
 */function getWindow(elem){return jQuery.isWindow(elem)?elem:elem.nodeType === 9 && elem.defaultView;}jQuery.offset = {setOffset:function setOffset(elem,options,i){var curPosition,curLeft,curCSSTop,curTop,curOffset,curCSSLeft,calculatePosition,position=jQuery.css(elem,"position"),curElem=jQuery(elem),props={}; // Set position first, in-case top/left are set even on static elem
if(position === "static"){elem.style.position = "relative";}curOffset = curElem.offset();curCSSTop = jQuery.css(elem,"top");curCSSLeft = jQuery.css(elem,"left");calculatePosition = (position === "absolute" || position === "fixed") && (curCSSTop + curCSSLeft).indexOf("auto") > -1; // Need to be able to calculate position if either
// top or left is auto and position is either absolute or fixed
if(calculatePosition){curPosition = curElem.position();curTop = curPosition.top;curLeft = curPosition.left;}else {curTop = parseFloat(curCSSTop) || 0;curLeft = parseFloat(curCSSLeft) || 0;}if(jQuery.isFunction(options)){options = options.call(elem,i,curOffset);}if(options.top != null){props.top = options.top - curOffset.top + curTop;}if(options.left != null){props.left = options.left - curOffset.left + curLeft;}if("using" in options){options.using.call(elem,props);}else {curElem.css(props);}}};jQuery.fn.extend({offset:function offset(options){if(arguments.length){return options === undefined?this:this.each(function(i){jQuery.offset.setOffset(this,options,i);});}var docElem,win,elem=this[0],box={top:0,left:0},doc=elem && elem.ownerDocument;if(!doc){return;}docElem = doc.documentElement; // Make sure it's not a disconnected DOM node
if(!jQuery.contains(docElem,elem)){return box;} // Support: BlackBerry 5, iOS 3 (original iPhone)
// If we don't have gBCR, just use 0,0 rather than error
if(typeof elem.getBoundingClientRect !== strundefined){box = elem.getBoundingClientRect();}win = getWindow(doc);return {top:box.top + win.pageYOffset - docElem.clientTop,left:box.left + win.pageXOffset - docElem.clientLeft};},position:function position(){if(!this[0]){return;}var offsetParent,offset,elem=this[0],parentOffset={top:0,left:0}; // Fixed elements are offset from window (parentOffset = {top:0, left: 0}, because it is its only offset parent
if(jQuery.css(elem,"position") === "fixed"){ // Assume getBoundingClientRect is there when computed position is fixed
offset = elem.getBoundingClientRect();}else { // Get *real* offsetParent
offsetParent = this.offsetParent(); // Get correct offsets
offset = this.offset();if(!jQuery.nodeName(offsetParent[0],"html")){parentOffset = offsetParent.offset();} // Add offsetParent borders
parentOffset.top += jQuery.css(offsetParent[0],"borderTopWidth",true);parentOffset.left += jQuery.css(offsetParent[0],"borderLeftWidth",true);} // Subtract parent offsets and element margins
return {top:offset.top - parentOffset.top - jQuery.css(elem,"marginTop",true),left:offset.left - parentOffset.left - jQuery.css(elem,"marginLeft",true)};},offsetParent:function offsetParent(){return this.map(function(){var offsetParent=this.offsetParent || docElem;while(offsetParent && (!jQuery.nodeName(offsetParent,"html") && jQuery.css(offsetParent,"position") === "static")) {offsetParent = offsetParent.offsetParent;}return offsetParent || docElem;});}}); // Create scrollLeft and scrollTop methods
jQuery.each({scrollLeft:"pageXOffset",scrollTop:"pageYOffset"},function(method,prop){var top="pageYOffset" === prop;jQuery.fn[method] = function(val){return access(this,function(elem,method,val){var win=getWindow(elem);if(val === undefined){return win?win[prop]:elem[method];}if(win){win.scrollTo(!top?val:window.pageXOffset,top?val:window.pageYOffset);}else {elem[method] = val;}},method,val,arguments.length,null);};}); // Support: Safari<7+, Chrome<37+
// Add the top/left cssHooks using jQuery.fn.position
// Webkit bug: https://bugs.webkit.org/show_bug.cgi?id=29084
// Blink bug: https://code.google.com/p/chromium/issues/detail?id=229280
// getComputedStyle returns percent when specified for top/left/bottom/right;
// rather than make the css module depend on the offset module, just check for it here
jQuery.each(["top","left"],function(i,prop){jQuery.cssHooks[prop] = addGetHookIf(support.pixelPosition,function(elem,computed){if(computed){computed = curCSS(elem,prop); // If curCSS returns percentage, fallback to offset
return rnumnonpx.test(computed)?jQuery(elem).position()[prop] + "px":computed;}});}); // Create innerHeight, innerWidth, height, width, outerHeight and outerWidth methods
jQuery.each({Height:"height",Width:"width"},function(name,type){jQuery.each({padding:"inner" + name,content:type,"":"outer" + name},function(defaultExtra,funcName){ // Margin is only for outerHeight, outerWidth
jQuery.fn[funcName] = function(margin,value){var chainable=arguments.length && (defaultExtra || typeof margin !== "boolean"),extra=defaultExtra || (margin === true || value === true?"margin":"border");return access(this,function(elem,type,value){var doc;if(jQuery.isWindow(elem)){ // As of 5/8/2012 this will yield incorrect results for Mobile Safari, but there
// isn't a whole lot we can do. See pull request at this URL for discussion:
// https://github.com/jquery/jquery/pull/764
return elem.document.documentElement["client" + name];} // Get document width or height
if(elem.nodeType === 9){doc = elem.documentElement; // Either scroll[Width/Height] or offset[Width/Height] or client[Width/Height],
// whichever is greatest
return Math.max(elem.body["scroll" + name],doc["scroll" + name],elem.body["offset" + name],doc["offset" + name],doc["client" + name]);}return value === undefined? // Get width or height on the element, requesting but not forcing parseFloat
jQuery.css(elem,type,extra): // Set width or height on the element
jQuery.style(elem,type,value,extra);},type,chainable?margin:undefined,chainable,null);};});}); // The number of elements contained in the matched element set
jQuery.fn.size = function(){return this.length;};jQuery.fn.andSelf = jQuery.fn.addBack; // Register as a named AMD module, since jQuery can be concatenated with other
// files that may use define, but not via a proper concatenation script that
// understands anonymous AMD modules. A named AMD is safest and most robust
// way to register. Lowercase jquery is used because AMD module names are
// derived from file names, and jQuery is normally delivered in a lowercase
// file name. Do this after creating the global so that if an AMD module wants
// to call noConflict to hide this version of jQuery, it will work.
// Note that for maximum portability, libraries that are not jQuery should
// declare themselves as anonymous modules, and avoid setting a global if an
// AMD loader is present. jQuery is a special case. For more information, see
// https://github.com/jrburke/requirejs/wiki/Updating-existing-libraries#wiki-anon
if(typeof define === "function" && define.amd){define("jquery",[],function(){return jQuery;});}var  // Map over jQuery in case of overwrite
_jQuery=window.jQuery, // Map over the $ in case of overwrite
_$=window.$;jQuery.noConflict = function(deep){if(window.$ === jQuery){window.$ = _$;}if(deep && window.jQuery === jQuery){window.jQuery = _jQuery;}return jQuery;}; // Expose jQuery and $ identifiers, even in AMD
// (#7102#comment:10, https://github.com/jquery/jquery/pull/557)
// and CommonJS for browser emulators (#13566)
if(typeof noGlobal === strundefined){window.jQuery = window.$ = jQuery;}return jQuery;}); // Otherwise append directly
}, {}],
11: [function(require, module, exports) {
/*globals jQuery, define, module, exports, require, window, document, postMessage */'use strict';(function(factory){"use strict";if(typeof define === 'function' && define.amd){define(['jquery'],factory);}else if(typeof module !== 'undefined' && module.exports){module.exports = factory(require('jquery'));}else {factory(jQuery);}})(function($,undefined){"use strict"; /*!
 * jsTree 3.2.1
 * http://jstree.com/
 *
 * Copyright (c) 2014 Ivan Bozhanov (http://vakata.com)
 *
 * Licensed same as jquery - under the terms of the MIT License
 *   http://www.opensource.org/licenses/mit-license.php
 */ /*!
 * if using jslint please allow for the jQuery global and use following options:
 * jslint: browser: true, ass: true, bitwise: true, continue: true, nomen: true, plusplus: true, regexp: true, unparam: true, todo: true, white: true
 */ // prevent another load? maybe there is a better way?
if($.jstree){return;} /**
	 * ### jsTree core functionality
	 */ // internal variables
var instance_counter=0,ccp_node=false,ccp_mode=false,ccp_inst=false,themes_loaded=[],src=$('script:last').attr('src'),document=window.document, // local variable is always faster to access then a global
_node=document.createElement('LI'),_temp1,_temp2;_node.setAttribute('role','treeitem');_temp1 = document.createElement('I');_temp1.className = 'jstree-icon jstree-ocl';_temp1.setAttribute('role','presentation');_node.appendChild(_temp1);_temp1 = document.createElement('A');_temp1.className = 'jstree-anchor';_temp1.setAttribute('href','#');_temp1.setAttribute('tabindex','-1');_temp2 = document.createElement('I');_temp2.className = 'jstree-icon jstree-themeicon';_temp2.setAttribute('role','presentation');_temp1.appendChild(_temp2);_node.appendChild(_temp1);_temp1 = _temp2 = null; /**
	 * holds all jstree related functions and variables, including the actual class and methods to create, access and manipulate instances.
	 * @name $.jstree
	 */$.jstree = { /**
		 * specifies the jstree version in use
		 * @name $.jstree.version
		 */version:'3.2.1', /**
		 * holds all the default options used when creating new instances
		 * @name $.jstree.defaults
		 */defaults:{ /**
			 * configure which plugins will be active on an instance. Should be an array of strings, where each element is a plugin name. The default is `[]`
			 * @name $.jstree.defaults.plugins
			 */plugins:[]}, /**
		 * stores all loaded jstree plugins (used internally)
		 * @name $.jstree.plugins
		 */plugins:{},path:src && src.indexOf('/') !== -1?src.replace(/\/[^\/]+$/,''):'',idregex:/[\\:&!^|()\[\]<>@*'+~#";.,=\- \/${}%?`]/g,root:'#'}; /**
	 * creates a jstree instance
	 * @name $.jstree.create(el [, options])
	 * @param {DOMElement|jQuery|String} el the element to create the instance on, can be jQuery extended or a selector
	 * @param {Object} options options for this instance (extends `$.jstree.defaults`)
	 * @return {jsTree} the new instance
	 */$.jstree.create = function(el,options){var tmp=new $.jstree.core(++instance_counter),opt=options;options = $.extend(true,{},$.jstree.defaults,options);if(opt && opt.plugins){options.plugins = opt.plugins;}$.each(options.plugins,function(i,k){if(i !== 'core'){tmp = tmp.plugin(k,options[k]);}});$(el).data('jstree',tmp);tmp.init(el,options);return tmp;}; /**
	 * remove all traces of jstree from the DOM and destroy all instances
	 * @name $.jstree.destroy()
	 */$.jstree.destroy = function(){$('.jstree:jstree').jstree('destroy');$(document).off('.jstree');}; /**
	 * the jstree class constructor, used only internally
	 * @private
	 * @name $.jstree.core(id)
	 * @param {Number} id this instance's index
	 */$.jstree.core = function(id){this._id = id;this._cnt = 0;this._wrk = null;this._data = {core:{themes:{name:false,dots:false,icons:false},selected:[],last_error:{},working:false,worker_queue:[],focused:null}};}; /**
	 * get a reference to an existing instance
	 *
	 * __Examples__
	 *
	 *	// provided a container with an ID of "tree", and a nested node with an ID of "branch"
	 *	// all of there will return the same instance
	 *	$.jstree.reference('tree');
	 *	$.jstree.reference('#tree');
	 *	$.jstree.reference($('#tree'));
	 *	$.jstree.reference(document.getElementByID('tree'));
	 *	$.jstree.reference('branch');
	 *	$.jstree.reference('#branch');
	 *	$.jstree.reference($('#branch'));
	 *	$.jstree.reference(document.getElementByID('branch'));
	 *
	 * @name $.jstree.reference(needle)
	 * @param {DOMElement|jQuery|String} needle
	 * @return {jsTree|null} the instance or `null` if not found
	 */$.jstree.reference = function(needle){var tmp=null,obj=null;if(needle && needle.id && (!needle.tagName || !needle.nodeType)){needle = needle.id;}if(!obj || !obj.length){try{obj = $(needle);}catch(ignore) {}}if(!obj || !obj.length){try{obj = $('#' + needle.replace($.jstree.idregex,'\\$&'));}catch(ignore) {}}if(obj && obj.length && (obj = obj.closest('.jstree')).length && (obj = obj.data('jstree'))){tmp = obj;}else {$('.jstree').each(function(){var inst=$(this).data('jstree');if(inst && inst._model.data[needle]){tmp = inst;return false;}});}return tmp;}; /**
	 * Create an instance, get an instance or invoke a command on a instance.
	 *
	 * If there is no instance associated with the current node a new one is created and `arg` is used to extend `$.jstree.defaults` for this new instance. There would be no return value (chaining is not broken).
	 *
	 * If there is an existing instance and `arg` is a string the command specified by `arg` is executed on the instance, with any additional arguments passed to the function. If the function returns a value it will be returned (chaining could break depending on function).
	 *
	 * If there is an existing instance and `arg` is not a string the instance itself is returned (similar to `$.jstree.reference`).
	 *
	 * In any other case - nothing is returned and chaining is not broken.
	 *
	 * __Examples__
	 *
	 *	$('#tree1').jstree(); // creates an instance
	 *	$('#tree2').jstree({ plugins : [] }); // create an instance with some options
	 *	$('#tree1').jstree('open_node', '#branch_1'); // call a method on an existing instance, passing additional arguments
	 *	$('#tree2').jstree(); // get an existing instance (or create an instance)
	 *	$('#tree2').jstree(true); // get an existing instance (will not create new instance)
	 *	$('#branch_1').jstree().select_node('#branch_1'); // get an instance (using a nested element and call a method)
	 *
	 * @name $().jstree([arg])
	 * @param {String|Object} arg
	 * @return {Mixed}
	 */$.fn.jstree = function(arg){ // check for string argument
var is_method=typeof arg === 'string',args=Array.prototype.slice.call(arguments,1),result=null;if(arg === true && !this.length){return false;}this.each(function(){ // get the instance (if there is one) and method (if it exists)
var instance=$.jstree.reference(this),method=is_method && instance?instance[arg]:null; // if calling a method, and method is available - execute on the instance
result = is_method && method?method.apply(instance,args):null; // if there is no instance and no method is being called - create one
if(!instance && !is_method && (arg === undefined || $.isPlainObject(arg))){$.jstree.create(this,arg);} // if there is an instance and no method is called - return the instance
if(instance && !is_method || arg === true){result = instance || false;} // if there was a method call which returned a result - break and return the value
if(result !== null && result !== undefined){return false;}}); // if there was a method call with a valid return value - return that, otherwise continue the chain
return result !== null && result !== undefined?result:this;}; /**
	 * used to find elements containing an instance
	 *
	 * __Examples__
	 *
	 *	$('div:jstree').each(function () {
	 *		$(this).jstree('destroy');
	 *	});
	 *
	 * @name $(':jstree')
	 * @return {jQuery}
	 */$.expr[':'].jstree = $.expr.createPseudo(function(search){return function(a){return $(a).hasClass('jstree') && $(a).data('jstree') !== undefined;};}); /**
	 * stores all defaults for the core
	 * @name $.jstree.defaults.core
	 */$.jstree.defaults.core = { /**
		 * data configuration
		 *
		 * If left as `false` the HTML inside the jstree container element is used to populate the tree (that should be an unordered list with list items).
		 *
		 * You can also pass in a HTML string or a JSON array here.
		 *
		 * It is possible to pass in a standard jQuery-like AJAX config and jstree will automatically determine if the response is JSON or HTML and use that to populate the tree.
		 * In addition to the standard jQuery ajax options here you can suppy functions for `data` and `url`, the functions will be run in the current instance's scope and a param will be passed indicating which node is being loaded, the return value of those functions will be used.
		 *
		 * The last option is to specify a function, that function will receive the node being loaded as argument and a second param which is a function which should be called with the result.
		 *
		 * __Examples__
		 *
		 *	// AJAX
		 *	$('#tree').jstree({
		 *		'core' : {
		 *			'data' : {
		 *				'url' : '/get/children/',
		 *				'data' : function (node) {
		 *					return { 'id' : node.id };
		 *				}
		 *			}
		 *		});
		 *
		 *	// direct data
		 *	$('#tree').jstree({
		 *		'core' : {
		 *			'data' : [
		 *				'Simple root node',
		 *				{
		 *					'id' : 'node_2',
		 *					'text' : 'Root node with options',
		 *					'state' : { 'opened' : true, 'selected' : true },
		 *					'children' : [ { 'text' : 'Child 1' }, 'Child 2']
		 *				}
		 *			]
		 *		});
		 *
		 *	// function
		 *	$('#tree').jstree({
		 *		'core' : {
		 *			'data' : function (obj, callback) {
		 *				callback.call(this, ['Root 1', 'Root 2']);
		 *			}
		 *		});
		 *
		 * @name $.jstree.defaults.core.data
		 */data:false, /**
		 * configure the various strings used throughout the tree
		 *
		 * You can use an object where the key is the string you need to replace and the value is your replacement.
		 * Another option is to specify a function which will be called with an argument of the needed string and should return the replacement.
		 * If left as `false` no replacement is made.
		 *
		 * __Examples__
		 *
		 *	$('#tree').jstree({
		 *		'core' : {
		 *			'strings' : {
		 *				'Loading ...' : 'Please wait ...'
		 *			}
		 *		}
		 *	});
		 *
		 * @name $.jstree.defaults.core.strings
		 */strings:false, /**
		 * determines what happens when a user tries to modify the structure of the tree
		 * If left as `false` all operations like create, rename, delete, move or copy are prevented.
		 * You can set this to `true` to allow all interactions or use a function to have better control.
		 *
		 * __Examples__
		 *
		 *	$('#tree').jstree({
		 *		'core' : {
		 *			'check_callback' : function (operation, node, node_parent, node_position, more) {
		 *				// operation can be 'create_node', 'rename_node', 'delete_node', 'move_node' or 'copy_node'
		 *				// in case of 'rename_node' node_position is filled with the new node name
		 *				return operation === 'rename_node' ? true : false;
		 *			}
		 *		}
		 *	});
		 *
		 * @name $.jstree.defaults.core.check_callback
		 */check_callback:false, /**
		 * a callback called with a single object parameter in the instance's scope when something goes wrong (operation prevented, ajax failed, etc)
		 * @name $.jstree.defaults.core.error
		 */error:$.noop, /**
		 * the open / close animation duration in milliseconds - set this to `false` to disable the animation (default is `200`)
		 * @name $.jstree.defaults.core.animation
		 */animation:200, /**
		 * a boolean indicating if multiple nodes can be selected
		 * @name $.jstree.defaults.core.multiple
		 */multiple:true, /**
		 * theme configuration object
		 * @name $.jstree.defaults.core.themes
		 */themes:{ /**
			 * the name of the theme to use (if left as `false` the default theme is used)
			 * @name $.jstree.defaults.core.themes.name
			 */name:false, /**
			 * the URL of the theme's CSS file, leave this as `false` if you have manually included the theme CSS (recommended). You can set this to `true` too which will try to autoload the theme.
			 * @name $.jstree.defaults.core.themes.url
			 */url:false, /**
			 * the location of all jstree themes - only used if `url` is set to `true`
			 * @name $.jstree.defaults.core.themes.dir
			 */dir:false, /**
			 * a boolean indicating if connecting dots are shown
			 * @name $.jstree.defaults.core.themes.dots
			 */dots:true, /**
			 * a boolean indicating if node icons are shown
			 * @name $.jstree.defaults.core.themes.icons
			 */icons:true, /**
			 * a boolean indicating if the tree background is striped
			 * @name $.jstree.defaults.core.themes.stripes
			 */stripes:false, /**
			 * a string (or boolean `false`) specifying the theme variant to use (if the theme supports variants)
			 * @name $.jstree.defaults.core.themes.variant
			 */variant:false, /**
			 * a boolean specifying if a reponsive version of the theme should kick in on smaller screens (if the theme supports it). Defaults to `false`.
			 * @name $.jstree.defaults.core.themes.responsive
			 */responsive:false}, /**
		 * if left as `true` all parents of all selected nodes will be opened once the tree loads (so that all selected nodes are visible to the user)
		 * @name $.jstree.defaults.core.expand_selected_onload
		 */expand_selected_onload:true, /**
		 * if left as `true` web workers will be used to parse incoming JSON data where possible, so that the UI will not be blocked by large requests. Workers are however about 30% slower. Defaults to `true`
		 * @name $.jstree.defaults.core.worker
		 */worker:true, /**
		 * Force node text to plain text (and escape HTML). Defaults to `false`
		 * @name $.jstree.defaults.core.force_text
		 */force_text:false, /**
		 * Should the node should be toggled if the text is double clicked . Defaults to `true`
		 * @name $.jstree.defaults.core.dblclick_toggle
		 */dblclick_toggle:true};$.jstree.core.prototype = { /**
		 * used to decorate an instance with a plugin. Used internally.
		 * @private
		 * @name plugin(deco [, opts])
		 * @param  {String} deco the plugin to decorate with
		 * @param  {Object} opts options for the plugin
		 * @return {jsTree}
		 */plugin:function plugin(deco,opts){var Child=$.jstree.plugins[deco];if(Child){this._data[deco] = {};Child.prototype = this;return new Child(opts,this);}return this;}, /**
		 * initialize the instance. Used internally.
		 * @private
		 * @name init(el, optons)
		 * @param {DOMElement|jQuery|String} el the element we are transforming
		 * @param {Object} options options for this instance
		 * @trigger init.jstree, loading.jstree, loaded.jstree, ready.jstree, changed.jstree
		 */init:function init(el,options){this._model = {data:{},changed:[],force_full_redraw:false,redraw_timeout:false,default_state:{loaded:true,opened:false,selected:false,disabled:false}};this._model.data[$.jstree.root] = {id:$.jstree.root,parent:null,parents:[],children:[],children_d:[],state:{loaded:false}};this.element = $(el).addClass('jstree jstree-' + this._id);this.settings = options;this._data.core.ready = false;this._data.core.loaded = false;this._data.core.rtl = this.element.css("direction") === "rtl";this.element[this._data.core.rtl?'addClass':'removeClass']("jstree-rtl");this.element.attr('role','tree');if(this.settings.core.multiple){this.element.attr('aria-multiselectable',true);}if(!this.element.attr('tabindex')){this.element.attr('tabindex','0');}this.bind(); /**
			 * triggered after all events are bound
			 * @event
			 * @name init.jstree
			 */this.trigger("init");this._data.core.original_container_html = this.element.find(" > ul > li").clone(true);this._data.core.original_container_html.find("li").addBack().contents().filter(function(){return this.nodeType === 3 && (!this.nodeValue || /^\s+$/.test(this.nodeValue));}).remove();this.element.html("<" + "ul class='jstree-container-ul jstree-children' role='group'><" + "li id='j" + this._id + "_loading' class='jstree-initial-node jstree-loading jstree-leaf jstree-last' role='tree-item'><i class='jstree-icon jstree-ocl'></i><" + "a class='jstree-anchor' href='#'><i class='jstree-icon jstree-themeicon-hidden'></i>" + this.get_string("Loading ...") + "</a></li></ul>");this.element.attr('aria-activedescendant','j' + this._id + '_loading');this._data.core.li_height = this.get_container_ul().children("li").first().height() || 24; /**
			 * triggered after the loading text is shown and before loading starts
			 * @event
			 * @name loading.jstree
			 */this.trigger("loading");this.load_node($.jstree.root);}, /**
		 * destroy an instance
		 * @name destroy()
		 * @param  {Boolean} keep_html if not set to `true` the container will be emptied, otherwise the current DOM elements will be kept intact
		 */destroy:function destroy(keep_html){if(this._wrk){try{window.URL.revokeObjectURL(this._wrk);this._wrk = null;}catch(ignore) {}}if(!keep_html){this.element.empty();}this.teardown();}, /**
		 * part of the destroying of an instance. Used internally.
		 * @private
		 * @name teardown()
		 */teardown:function teardown(){this.unbind();this.element.removeClass('jstree').removeData('jstree').find("[class^='jstree']").addBack().attr("class",function(){return this.className.replace(/jstree[^ ]*|$/ig,'');});this.element = null;}, /**
		 * bind all events. Used internally.
		 * @private
		 * @name bind()
		 */bind:function bind(){var word='',tout=null,was_click=0;this.element.on("dblclick.jstree",function(e){if(e.target.tagName && e.target.tagName.toLowerCase() === "input"){return true;}if(document.selection && document.selection.empty){document.selection.empty();}else {if(window.getSelection){var sel=window.getSelection();try{sel.removeAllRanges();sel.collapse();}catch(ignore) {}}}}).on("mousedown.jstree",$.proxy(function(e){if(e.target === this.element[0]){e.preventDefault(); // prevent losing focus when clicking scroll arrows (FF, Chrome)
was_click = +new Date(); // ie does not allow to prevent losing focus
}},this)).on("mousedown.jstree",".jstree-ocl",function(e){e.preventDefault(); // prevent any node inside from losing focus when clicking the open/close icon
}).on("click.jstree",".jstree-ocl",$.proxy(function(e){this.toggle_node(e.target);},this)).on("dblclick.jstree",".jstree-anchor",$.proxy(function(e){if(e.target.tagName && e.target.tagName.toLowerCase() === "input"){return true;}if(this.settings.core.dblclick_toggle){this.toggle_node(e.target);}},this)).on("click.jstree",".jstree-anchor",$.proxy(function(e){e.preventDefault();if(e.currentTarget !== document.activeElement){$(e.currentTarget).focus();}this.activate_node(e.currentTarget,e);},this)).on('keydown.jstree','.jstree-anchor',$.proxy(function(e){if(e.target.tagName && e.target.tagName.toLowerCase() === "input"){return true;}if(e.which !== 32 && e.which !== 13 && (e.shiftKey || e.ctrlKey || e.altKey || e.metaKey)){return true;}var o=null;if(this._data.core.rtl){if(e.which === 37){e.which = 39;}else if(e.which === 39){e.which = 37;}}switch(e.which){case 32: // aria defines space only with Ctrl
if(e.ctrlKey){e.type = "click";$(e.currentTarget).trigger(e);}break;case 13: // enter
e.type = "click";$(e.currentTarget).trigger(e);break;case 37: // right
e.preventDefault();if(this.is_open(e.currentTarget)){this.close_node(e.currentTarget);}else {o = this.get_parent(e.currentTarget);if(o && o.id !== $.jstree.root){this.get_node(o,true).children('.jstree-anchor').focus();}}break;case 38: // up
e.preventDefault();o = this.get_prev_dom(e.currentTarget);if(o && o.length){o.children('.jstree-anchor').focus();}break;case 39: // left
e.preventDefault();if(this.is_closed(e.currentTarget)){this.open_node(e.currentTarget,function(o){this.get_node(o,true).children('.jstree-anchor').focus();});}else if(this.is_open(e.currentTarget)){o = this.get_node(e.currentTarget,true).children('.jstree-children')[0];if(o){$(this._firstChild(o)).children('.jstree-anchor').focus();}}break;case 40: // down
e.preventDefault();o = this.get_next_dom(e.currentTarget);if(o && o.length){o.children('.jstree-anchor').focus();}break;case 106: // aria defines * on numpad as open_all - not very common
this.open_all();break;case 36: // home
e.preventDefault();o = this._firstChild(this.get_container_ul()[0]);if(o){$(o).children('.jstree-anchor').filter(':visible').focus();}break;case 35: // end
e.preventDefault();this.element.find('.jstree-anchor').filter(':visible').last().focus();break; /*!
							// delete
							case 46:
								e.preventDefault();
								o = this.get_node(e.currentTarget);
								if(o && o.id && o.id !== $.jstree.root) {
									o = this.is_selected(o) ? this.get_selected() : o;
									this.delete_node(o);
								}
								break;
							// f2
							case 113:
								e.preventDefault();
								o = this.get_node(e.currentTarget);
								if(o && o.id && o.id !== $.jstree.root) {
									// this.edit(o);
								}
								break;
							default:
								// console.log(e.which);
								break;
							*/}},this)).on("load_node.jstree",$.proxy(function(e,data){if(data.status){if(data.node.id === $.jstree.root && !this._data.core.loaded){this._data.core.loaded = true;if(this._firstChild(this.get_container_ul()[0])){this.element.attr('aria-activedescendant',this._firstChild(this.get_container_ul()[0]).id);} /**
								 * triggered after the root node is loaded for the first time
								 * @event
								 * @name loaded.jstree
								 */this.trigger("loaded");}if(!this._data.core.ready){setTimeout($.proxy(function(){if(this.element && !this.get_container_ul().find('.jstree-loading').length){this._data.core.ready = true;if(this._data.core.selected.length){if(this.settings.core.expand_selected_onload){var tmp=[],i,j;for(i = 0,j = this._data.core.selected.length;i < j;i++) {tmp = tmp.concat(this._model.data[this._data.core.selected[i]].parents);}tmp = $.vakata.array_unique(tmp);for(i = 0,j = tmp.length;i < j;i++) {this.open_node(tmp[i],false,0);}}this.trigger('changed',{'action':'ready','selected':this._data.core.selected});} /**
										 * triggered after all nodes are finished loading
										 * @event
										 * @name ready.jstree
										 */this.trigger("ready");}},this),0);}}},this)) // quick searching when the tree is focused
.on('keypress.jstree',$.proxy(function(e){if(e.target.tagName && e.target.tagName.toLowerCase() === "input"){return true;}if(tout){clearTimeout(tout);}tout = setTimeout(function(){word = '';},500);var chr=String.fromCharCode(e.which).toLowerCase(),col=this.element.find('.jstree-anchor').filter(':visible'),ind=col.index(document.activeElement) || 0,end=false;word += chr; // match for whole word from current node down (including the current node)
if(word.length > 1){col.slice(ind).each($.proxy(function(i,v){if($(v).text().toLowerCase().indexOf(word) === 0){$(v).focus();end = true;return false;}},this));if(end){return;} // match for whole word from the beginning of the tree
col.slice(0,ind).each($.proxy(function(i,v){if($(v).text().toLowerCase().indexOf(word) === 0){$(v).focus();end = true;return false;}},this));if(end){return;}} // list nodes that start with that letter (only if word consists of a single char)
if(new RegExp('^' + chr.replace(/[-\/\\^$*+?.()|[\]{}]/g,'\\$&') + '+$').test(word)){ // search for the next node starting with that letter
col.slice(ind + 1).each($.proxy(function(i,v){if($(v).text().toLowerCase().charAt(0) === chr){$(v).focus();end = true;return false;}},this));if(end){return;} // search from the beginning
col.slice(0,ind + 1).each($.proxy(function(i,v){if($(v).text().toLowerCase().charAt(0) === chr){$(v).focus();end = true;return false;}},this));if(end){return;}}},this)) // THEME RELATED
.on("init.jstree",$.proxy(function(){var s=this.settings.core.themes;this._data.core.themes.dots = s.dots;this._data.core.themes.stripes = s.stripes;this._data.core.themes.icons = s.icons;this.set_theme(s.name || "default",s.url);this.set_theme_variant(s.variant);},this)).on("loading.jstree",$.proxy(function(){this[this._data.core.themes.dots?"show_dots":"hide_dots"]();this[this._data.core.themes.icons?"show_icons":"hide_icons"]();this[this._data.core.themes.stripes?"show_stripes":"hide_stripes"]();},this)).on('blur.jstree','.jstree-anchor',$.proxy(function(e){this._data.core.focused = null;$(e.currentTarget).filter('.jstree-hovered').mouseleave();this.element.attr('tabindex','0');},this)).on('focus.jstree','.jstree-anchor',$.proxy(function(e){var tmp=this.get_node(e.currentTarget);if(tmp && tmp.id){this._data.core.focused = tmp.id;}this.element.find('.jstree-hovered').not(e.currentTarget).mouseleave();$(e.currentTarget).mouseenter();this.element.attr('tabindex','-1');},this)).on('focus.jstree',$.proxy(function(){if(+new Date() - was_click > 500 && !this._data.core.focused){was_click = 0;var act=this.get_node(this.element.attr('aria-activedescendant'),true);if(act){act.find('> .jstree-anchor').focus();}}},this)).on('mouseenter.jstree','.jstree-anchor',$.proxy(function(e){this.hover_node(e.currentTarget);},this)).on('mouseleave.jstree','.jstree-anchor',$.proxy(function(e){this.dehover_node(e.currentTarget);},this));}, /**
		 * part of the destroying of an instance. Used internally.
		 * @private
		 * @name unbind()
		 */unbind:function unbind(){this.element.off('.jstree');$(document).off('.jstree-' + this._id);}, /**
		 * trigger an event. Used internally.
		 * @private
		 * @name trigger(ev [, data])
		 * @param  {String} ev the name of the event to trigger
		 * @param  {Object} data additional data to pass with the event
		 */trigger:function trigger(ev,data){if(!data){data = {};}data.instance = this;this.element.triggerHandler(ev.replace('.jstree','') + '.jstree',data);}, /**
		 * returns the jQuery extended instance container
		 * @name get_container()
		 * @return {jQuery}
		 */get_container:function get_container(){return this.element;}, /**
		 * returns the jQuery extended main UL node inside the instance container. Used internally.
		 * @private
		 * @name get_container_ul()
		 * @return {jQuery}
		 */get_container_ul:function get_container_ul(){return this.element.children(".jstree-children").first();}, /**
		 * gets string replacements (localization). Used internally.
		 * @private
		 * @name get_string(key)
		 * @param  {String} key
		 * @return {String}
		 */get_string:function get_string(key){var a=this.settings.core.strings;if($.isFunction(a)){return a.call(this,key);}if(a && a[key]){return a[key];}return key;}, /**
		 * gets the first child of a DOM node. Used internally.
		 * @private
		 * @name _firstChild(dom)
		 * @param  {DOMElement} dom
		 * @return {DOMElement}
		 */_firstChild:function _firstChild(dom){dom = dom?dom.firstChild:null;while(dom !== null && dom.nodeType !== 1) {dom = dom.nextSibling;}return dom;}, /**
		 * gets the next sibling of a DOM node. Used internally.
		 * @private
		 * @name _nextSibling(dom)
		 * @param  {DOMElement} dom
		 * @return {DOMElement}
		 */_nextSibling:function _nextSibling(dom){dom = dom?dom.nextSibling:null;while(dom !== null && dom.nodeType !== 1) {dom = dom.nextSibling;}return dom;}, /**
		 * gets the previous sibling of a DOM node. Used internally.
		 * @private
		 * @name _previousSibling(dom)
		 * @param  {DOMElement} dom
		 * @return {DOMElement}
		 */_previousSibling:function _previousSibling(dom){dom = dom?dom.previousSibling:null;while(dom !== null && dom.nodeType !== 1) {dom = dom.previousSibling;}return dom;}, /**
		 * get the JSON representation of a node (or the actual jQuery extended DOM node) by using any input (child DOM element, ID string, selector, etc)
		 * @name get_node(obj [, as_dom])
		 * @param  {mixed} obj
		 * @param  {Boolean} as_dom
		 * @return {Object|jQuery}
		 */get_node:function get_node(obj,as_dom){if(obj && obj.id){obj = obj.id;}var dom;try{if(this._model.data[obj]){obj = this._model.data[obj];}else if(typeof obj === "string" && this._model.data[obj.replace(/^#/,'')]){obj = this._model.data[obj.replace(/^#/,'')];}else if(typeof obj === "string" && (dom = $('#' + obj.replace($.jstree.idregex,'\\$&'),this.element)).length && this._model.data[dom.closest('.jstree-node').attr('id')]){obj = this._model.data[dom.closest('.jstree-node').attr('id')];}else if((dom = $(obj,this.element)).length && this._model.data[dom.closest('.jstree-node').attr('id')]){obj = this._model.data[dom.closest('.jstree-node').attr('id')];}else if((dom = $(obj,this.element)).length && dom.hasClass('jstree')){obj = this._model.data[$.jstree.root];}else {return false;}if(as_dom){obj = obj.id === $.jstree.root?this.element:$('#' + obj.id.replace($.jstree.idregex,'\\$&'),this.element);}return obj;}catch(ex) {return false;}}, /**
		 * get the path to a node, either consisting of node texts, or of node IDs, optionally glued together (otherwise an array)
		 * @name get_path(obj [, glue, ids])
		 * @param  {mixed} obj the node
		 * @param  {String} glue if you want the path as a string - pass the glue here (for example '/'), if a falsy value is supplied here, an array is returned
		 * @param  {Boolean} ids if set to true build the path using ID, otherwise node text is used
		 * @return {mixed}
		 */get_path:function get_path(obj,glue,ids){obj = obj.parents?obj:this.get_node(obj);if(!obj || obj.id === $.jstree.root || !obj.parents){return false;}var i,j,p=[];p.push(ids?obj.id:obj.text);for(i = 0,j = obj.parents.length;i < j;i++) {p.push(ids?obj.parents[i]:this.get_text(obj.parents[i]));}p = p.reverse().slice(1);return glue?p.join(glue):p;}, /**
		 * get the next visible node that is below the `obj` node. If `strict` is set to `true` only sibling nodes are returned.
		 * @name get_next_dom(obj [, strict])
		 * @param  {mixed} obj
		 * @param  {Boolean} strict
		 * @return {jQuery}
		 */get_next_dom:function get_next_dom(obj,strict){var tmp;obj = this.get_node(obj,true);if(obj[0] === this.element[0]){tmp = this._firstChild(this.get_container_ul()[0]);while(tmp && tmp.offsetHeight === 0) {tmp = this._nextSibling(tmp);}return tmp?$(tmp):false;}if(!obj || !obj.length){return false;}if(strict){tmp = obj[0];do {tmp = this._nextSibling(tmp);}while(tmp && tmp.offsetHeight === 0);return tmp?$(tmp):false;}if(obj.hasClass("jstree-open")){tmp = this._firstChild(obj.children('.jstree-children')[0]);while(tmp && tmp.offsetHeight === 0) {tmp = this._nextSibling(tmp);}if(tmp !== null){return $(tmp);}}tmp = obj[0];do {tmp = this._nextSibling(tmp);}while(tmp && tmp.offsetHeight === 0);if(tmp !== null){return $(tmp);}return obj.parentsUntil(".jstree",".jstree-node").nextAll(".jstree-node:visible").first();}, /**
		 * get the previous visible node that is above the `obj` node. If `strict` is set to `true` only sibling nodes are returned.
		 * @name get_prev_dom(obj [, strict])
		 * @param  {mixed} obj
		 * @param  {Boolean} strict
		 * @return {jQuery}
		 */get_prev_dom:function get_prev_dom(obj,strict){var tmp;obj = this.get_node(obj,true);if(obj[0] === this.element[0]){tmp = this.get_container_ul()[0].lastChild;while(tmp && tmp.offsetHeight === 0) {tmp = this._previousSibling(tmp);}return tmp?$(tmp):false;}if(!obj || !obj.length){return false;}if(strict){tmp = obj[0];do {tmp = this._previousSibling(tmp);}while(tmp && tmp.offsetHeight === 0);return tmp?$(tmp):false;}tmp = obj[0];do {tmp = this._previousSibling(tmp);}while(tmp && tmp.offsetHeight === 0);if(tmp !== null){obj = $(tmp);while(obj.hasClass("jstree-open")) {obj = obj.children(".jstree-children").first().children(".jstree-node:visible:last");}return obj;}tmp = obj[0].parentNode.parentNode;return tmp && tmp.className && tmp.className.indexOf('jstree-node') !== -1?$(tmp):false;}, /**
		 * get the parent ID of a node
		 * @name get_parent(obj)
		 * @param  {mixed} obj
		 * @return {String}
		 */get_parent:function get_parent(obj){obj = this.get_node(obj);if(!obj || obj.id === $.jstree.root){return false;}return obj.parent;}, /**
		 * get a jQuery collection of all the children of a node (node must be rendered)
		 * @name get_children_dom(obj)
		 * @param  {mixed} obj
		 * @return {jQuery}
		 */get_children_dom:function get_children_dom(obj){obj = this.get_node(obj,true);if(obj[0] === this.element[0]){return this.get_container_ul().children(".jstree-node");}if(!obj || !obj.length){return false;}return obj.children(".jstree-children").children(".jstree-node");}, /**
		 * checks if a node has children
		 * @name is_parent(obj)
		 * @param  {mixed} obj
		 * @return {Boolean}
		 */is_parent:function is_parent(obj){obj = this.get_node(obj);return obj && (obj.state.loaded === false || obj.children.length > 0);}, /**
		 * checks if a node is loaded (its children are available)
		 * @name is_loaded(obj)
		 * @param  {mixed} obj
		 * @return {Boolean}
		 */is_loaded:function is_loaded(obj){obj = this.get_node(obj);return obj && obj.state.loaded;}, /**
		 * check if a node is currently loading (fetching children)
		 * @name is_loading(obj)
		 * @param  {mixed} obj
		 * @return {Boolean}
		 */is_loading:function is_loading(obj){obj = this.get_node(obj);return obj && obj.state && obj.state.loading;}, /**
		 * check if a node is opened
		 * @name is_open(obj)
		 * @param  {mixed} obj
		 * @return {Boolean}
		 */is_open:function is_open(obj){obj = this.get_node(obj);return obj && obj.state.opened;}, /**
		 * check if a node is in a closed state
		 * @name is_closed(obj)
		 * @param  {mixed} obj
		 * @return {Boolean}
		 */is_closed:function is_closed(obj){obj = this.get_node(obj);return obj && this.is_parent(obj) && !obj.state.opened;}, /**
		 * check if a node has no children
		 * @name is_leaf(obj)
		 * @param  {mixed} obj
		 * @return {Boolean}
		 */is_leaf:function is_leaf(obj){return !this.is_parent(obj);}, /**
		 * loads a node (fetches its children using the `core.data` setting). Multiple nodes can be passed to by using an array.
		 * @name load_node(obj [, callback])
		 * @param  {mixed} obj
		 * @param  {function} callback a function to be executed once loading is complete, the function is executed in the instance's scope and receives two arguments - the node and a boolean status
		 * @return {Boolean}
		 * @trigger load_node.jstree
		 */load_node:function load_node(obj,callback){var k,l,i,j,c;if($.isArray(obj)){this._load_nodes(obj.slice(),callback);return true;}obj = this.get_node(obj);if(!obj){if(callback){callback.call(this,obj,false);}return false;} // if(obj.state.loading) { } // the node is already loading - just wait for it to load and invoke callback? but if called implicitly it should be loaded again?
if(obj.state.loaded){obj.state.loaded = false;for(k = 0,l = obj.children_d.length;k < l;k++) {for(i = 0,j = obj.parents.length;i < j;i++) {this._model.data[obj.parents[i]].children_d = $.vakata.array_remove_item(this._model.data[obj.parents[i]].children_d,obj.children_d[k]);}if(this._model.data[obj.children_d[k]].state.selected){c = true;this._data.core.selected = $.vakata.array_remove_item(this._data.core.selected,obj.children_d[k]);}delete this._model.data[obj.children_d[k]];}obj.children = [];obj.children_d = [];if(c){this.trigger('changed',{'action':'load_node','node':obj,'selected':this._data.core.selected});}}obj.state.failed = false;obj.state.loading = true;this.get_node(obj,true).addClass("jstree-loading").attr('aria-busy',true);this._load_node(obj,$.proxy(function(status){obj = this._model.data[obj.id];obj.state.loading = false;obj.state.loaded = status;obj.state.failed = !obj.state.loaded;var dom=this.get_node(obj,true),i=0,j=0,m=this._model.data,has_children=false;for(i = 0,j = obj.children.length;i < j;i++) {if(m[obj.children[i]] && !m[obj.children[i]].state.hidden){has_children = true;break;}}if(obj.state.loaded && !has_children && dom && dom.length && !dom.hasClass('jstree-leaf')){dom.removeClass('jstree-closed jstree-open').addClass('jstree-leaf');}dom.removeClass("jstree-loading").attr('aria-busy',false); /**
				 * triggered after a node is loaded
				 * @event
				 * @name load_node.jstree
				 * @param {Object} node the node that was loading
				 * @param {Boolean} status was the node loaded successfully
				 */this.trigger('load_node',{"node":obj,"status":status});if(callback){callback.call(this,obj,status);}},this));return true;}, /**
		 * load an array of nodes (will also load unavailable nodes as soon as the appear in the structure). Used internally.
		 * @private
		 * @name _load_nodes(nodes [, callback])
		 * @param  {array} nodes
		 * @param  {function} callback a function to be executed once loading is complete, the function is executed in the instance's scope and receives one argument - the array passed to _load_nodes
		 */_load_nodes:function _load_nodes(nodes,callback,is_callback){var r=true,c=function c(){this._load_nodes(nodes,callback,true);},m=this._model.data,i,j,tmp=[];for(i = 0,j = nodes.length;i < j;i++) {if(m[nodes[i]] && (!m[nodes[i]].state.loaded && !m[nodes[i]].state.failed || !is_callback)){if(!this.is_loading(nodes[i])){this.load_node(nodes[i],c);}r = false;}}if(r){for(i = 0,j = nodes.length;i < j;i++) {if(m[nodes[i]] && m[nodes[i]].state.loaded){tmp.push(nodes[i]);}}if(callback && !callback.done){callback.call(this,tmp);callback.done = true;}}}, /**
		 * loads all unloaded nodes
		 * @name load_all([obj, callback])
		 * @param {mixed} obj the node to load recursively, omit to load all nodes in the tree
		 * @param {function} callback a function to be executed once loading all the nodes is complete,
		 * @trigger load_all.jstree
		 */load_all:function load_all(obj,callback){if(!obj){obj = $.jstree.root;}obj = this.get_node(obj);if(!obj){return false;}var to_load=[],m=this._model.data,c=m[obj.id].children_d,i,j;if(obj.state && !obj.state.loaded){to_load.push(obj.id);}for(i = 0,j = c.length;i < j;i++) {if(m[c[i]] && m[c[i]].state && !m[c[i]].state.loaded){to_load.push(c[i]);}}if(to_load.length){this._load_nodes(to_load,function(){this.load_all(obj,callback);});}else { /**
				 * triggered after a load_all call completes
				 * @event
				 * @name load_all.jstree
				 * @param {Object} node the recursively loaded node
				 */if(callback){callback.call(this,obj);}this.trigger('load_all',{"node":obj});}}, /**
		 * handles the actual loading of a node. Used only internally.
		 * @private
		 * @name _load_node(obj [, callback])
		 * @param  {mixed} obj
		 * @param  {function} callback a function to be executed once loading is complete, the function is executed in the instance's scope and receives one argument - a boolean status
		 * @return {Boolean}
		 */_load_node:function _load_node(obj,callback){var s=this.settings.core.data,t; // use original HTML
if(!s){if(obj.id === $.jstree.root){return this._append_html_data(obj,this._data.core.original_container_html.clone(true),function(status){callback.call(this,status);});}else {return callback.call(this,false);} // return callback.call(this, obj.id === $.jstree.root ? this._append_html_data(obj, this._data.core.original_container_html.clone(true)) : false);
}if($.isFunction(s)){return s.call(this,obj,$.proxy(function(d){if(d === false){callback.call(this,false);}this[typeof d === 'string'?'_append_html_data':'_append_json_data'](obj,typeof d === 'string'?$($.parseHTML(d)).filter(function(){return this.nodeType !== 3;}):d,function(status){callback.call(this,status);}); // return d === false ? callback.call(this, false) : callback.call(this, this[typeof d === 'string' ? '_append_html_data' : '_append_json_data'](obj, typeof d === 'string' ? $(d) : d));
},this));}if(typeof s === 'object'){if(s.url){s = $.extend(true,{},s);if($.isFunction(s.url)){s.url = s.url.call(this,obj);}if($.isFunction(s.data)){s.data = s.data.call(this,obj);}return $.ajax(s).done($.proxy(function(d,t,x){var type=x.getResponseHeader('Content-Type');if(type && type.indexOf('json') !== -1 || typeof d === "object"){return this._append_json_data(obj,d,function(status){callback.call(this,status);}); //return callback.call(this, this._append_json_data(obj, d));
}if(type && type.indexOf('html') !== -1 || typeof d === "string"){return this._append_html_data(obj,$($.parseHTML(d)).filter(function(){return this.nodeType !== 3;}),function(status){callback.call(this,status);}); // return callback.call(this, this._append_html_data(obj, $(d)));
}this._data.core.last_error = {'error':'ajax','plugin':'core','id':'core_04','reason':'Could not load node','data':JSON.stringify({'id':obj.id,'xhr':x})};this.settings.core.error.call(this,this._data.core.last_error);return callback.call(this,false);},this)).fail($.proxy(function(f){callback.call(this,false);this._data.core.last_error = {'error':'ajax','plugin':'core','id':'core_04','reason':'Could not load node','data':JSON.stringify({'id':obj.id,'xhr':f})};this.settings.core.error.call(this,this._data.core.last_error);},this));}t = $.isArray(s) || $.isPlainObject(s)?JSON.parse(JSON.stringify(s)):s;if(obj.id === $.jstree.root){return this._append_json_data(obj,t,function(status){callback.call(this,status);});}else {this._data.core.last_error = {'error':'nodata','plugin':'core','id':'core_05','reason':'Could not load node','data':JSON.stringify({'id':obj.id})};this.settings.core.error.call(this,this._data.core.last_error);return callback.call(this,false);} //return callback.call(this, (obj.id === $.jstree.root ? this._append_json_data(obj, t) : false) );
}if(typeof s === 'string'){if(obj.id === $.jstree.root){return this._append_html_data(obj,$($.parseHTML(s)).filter(function(){return this.nodeType !== 3;}),function(status){callback.call(this,status);});}else {this._data.core.last_error = {'error':'nodata','plugin':'core','id':'core_06','reason':'Could not load node','data':JSON.stringify({'id':obj.id})};this.settings.core.error.call(this,this._data.core.last_error);return callback.call(this,false);} //return callback.call(this, (obj.id === $.jstree.root ? this._append_html_data(obj, $(s)) : false) );
}return callback.call(this,false);}, /**
		 * adds a node to the list of nodes to redraw. Used only internally.
		 * @private
		 * @name _node_changed(obj [, callback])
		 * @param  {mixed} obj
		 */_node_changed:function _node_changed(obj){obj = this.get_node(obj);if(obj){this._model.changed.push(obj.id);}}, /**
		 * appends HTML content to the tree. Used internally.
		 * @private
		 * @name _append_html_data(obj, data)
		 * @param  {mixed} obj the node to append to
		 * @param  {String} data the HTML string to parse and append
		 * @trigger model.jstree, changed.jstree
		 */_append_html_data:function _append_html_data(dom,data,cb){dom = this.get_node(dom);dom.children = [];dom.children_d = [];var dat=data.is('ul')?data.children():data,par=dom.id,chd=[],dpc=[],m=this._model.data,p=m[par],s=this._data.core.selected.length,tmp,i,j;dat.each($.proxy(function(i,v){tmp = this._parse_model_from_html($(v),par,p.parents.concat());if(tmp){chd.push(tmp);dpc.push(tmp);if(m[tmp].children_d.length){dpc = dpc.concat(m[tmp].children_d);}}},this));p.children = chd;p.children_d = dpc;for(i = 0,j = p.parents.length;i < j;i++) {m[p.parents[i]].children_d = m[p.parents[i]].children_d.concat(dpc);} /**
			 * triggered when new data is inserted to the tree model
			 * @event
			 * @name model.jstree
			 * @param {Array} nodes an array of node IDs
			 * @param {String} parent the parent ID of the nodes
			 */this.trigger('model',{"nodes":dpc,'parent':par});if(par !== $.jstree.root){this._node_changed(par);this.redraw();}else {this.get_container_ul().children('.jstree-initial-node').remove();this.redraw(true);}if(this._data.core.selected.length !== s){this.trigger('changed',{'action':'model','selected':this._data.core.selected});}cb.call(this,true);}, /**
		 * appends JSON content to the tree. Used internally.
		 * @private
		 * @name _append_json_data(obj, data)
		 * @param  {mixed} obj the node to append to
		 * @param  {String} data the JSON object to parse and append
		 * @param  {Boolean} force_processing internal param - do not set
		 * @trigger model.jstree, changed.jstree
		 */_append_json_data:function _append_json_data(dom,data,cb,force_processing){if(this.element === null){return;}dom = this.get_node(dom);dom.children = [];dom.children_d = []; // *%$@!!!
if(data.d){data = data.d;if(typeof data === "string"){data = JSON.parse(data);}}if(!$.isArray(data)){data = [data];}var w=null,args={'df':this._model.default_state,'dat':data,'par':dom.id,'m':this._model.data,'t_id':this._id,'t_cnt':this._cnt,'sel':this._data.core.selected},func=function func(data,undefined){if(data.data){data = data.data;}var dat=data.dat,par=data.par,chd=[],dpc=[],add=[],df=data.df,t_id=data.t_id,t_cnt=data.t_cnt,m=data.m,p=m[par],sel=data.sel,tmp,i,j,rslt,parse_flat=function parse_flat(d,p,ps){if(!ps){ps = [];}else {ps = ps.concat();}if(p){ps.unshift(p);}var tid=d.id.toString(),i,j,c,e,tmp={id:tid,text:d.text || '',icon:d.icon !== undefined?d.icon:true,parent:p,parents:ps,children:d.children || [],children_d:d.children_d || [],data:d.data,state:{},li_attr:{id:false},a_attr:{href:'#'},original:false};for(i in df) {if(df.hasOwnProperty(i)){tmp.state[i] = df[i];}}if(d && d.data && d.data.jstree && d.data.jstree.icon){tmp.icon = d.data.jstree.icon;}if(tmp.icon === undefined || tmp.icon === null || tmp.icon === ""){tmp.icon = true;}if(d && d.data){tmp.data = d.data;if(d.data.jstree){for(i in d.data.jstree) {if(d.data.jstree.hasOwnProperty(i)){tmp.state[i] = d.data.jstree[i];}}}}if(d && typeof d.state === 'object'){for(i in d.state) {if(d.state.hasOwnProperty(i)){tmp.state[i] = d.state[i];}}}if(d && typeof d.li_attr === 'object'){for(i in d.li_attr) {if(d.li_attr.hasOwnProperty(i)){tmp.li_attr[i] = d.li_attr[i];}}}if(!tmp.li_attr.id){tmp.li_attr.id = tid;}if(d && typeof d.a_attr === 'object'){for(i in d.a_attr) {if(d.a_attr.hasOwnProperty(i)){tmp.a_attr[i] = d.a_attr[i];}}}if(d && d.children && d.children === true){tmp.state.loaded = false;tmp.children = [];tmp.children_d = [];}m[tmp.id] = tmp;for(i = 0,j = tmp.children.length;i < j;i++) {c = parse_flat(m[tmp.children[i]],tmp.id,ps);e = m[c];tmp.children_d.push(c);if(e.children_d.length){tmp.children_d = tmp.children_d.concat(e.children_d);}}delete d.data;delete d.children;m[tmp.id].original = d;if(tmp.state.selected){add.push(tmp.id);}return tmp.id;},parse_nest=function parse_nest(d,p,ps){if(!ps){ps = [];}else {ps = ps.concat();}if(p){ps.unshift(p);}var tid=false,i,j,c,e,tmp;do {tid = 'j' + t_id + '_' + ++t_cnt;}while(m[tid]);tmp = {id:false,text:typeof d === 'string'?d:'',icon:typeof d === 'object' && d.icon !== undefined?d.icon:true,parent:p,parents:ps,children:[],children_d:[],data:null,state:{},li_attr:{id:false},a_attr:{href:'#'},original:false};for(i in df) {if(df.hasOwnProperty(i)){tmp.state[i] = df[i];}}if(d && d.id){tmp.id = d.id.toString();}if(d && d.text){tmp.text = d.text;}if(d && d.data && d.data.jstree && d.data.jstree.icon){tmp.icon = d.data.jstree.icon;}if(tmp.icon === undefined || tmp.icon === null || tmp.icon === ""){tmp.icon = true;}if(d && d.data){tmp.data = d.data;if(d.data.jstree){for(i in d.data.jstree) {if(d.data.jstree.hasOwnProperty(i)){tmp.state[i] = d.data.jstree[i];}}}}if(d && typeof d.state === 'object'){for(i in d.state) {if(d.state.hasOwnProperty(i)){tmp.state[i] = d.state[i];}}}if(d && typeof d.li_attr === 'object'){for(i in d.li_attr) {if(d.li_attr.hasOwnProperty(i)){tmp.li_attr[i] = d.li_attr[i];}}}if(tmp.li_attr.id && !tmp.id){tmp.id = tmp.li_attr.id.toString();}if(!tmp.id){tmp.id = tid;}if(!tmp.li_attr.id){tmp.li_attr.id = tmp.id;}if(d && typeof d.a_attr === 'object'){for(i in d.a_attr) {if(d.a_attr.hasOwnProperty(i)){tmp.a_attr[i] = d.a_attr[i];}}}if(d && d.children && d.children.length){for(i = 0,j = d.children.length;i < j;i++) {c = parse_nest(d.children[i],tmp.id,ps);e = m[c];tmp.children.push(c);if(e.children_d.length){tmp.children_d = tmp.children_d.concat(e.children_d);}}tmp.children_d = tmp.children_d.concat(tmp.children);}if(d && d.children && d.children === true){tmp.state.loaded = false;tmp.children = [];tmp.children_d = [];}delete d.data;delete d.children;tmp.original = d;m[tmp.id] = tmp;if(tmp.state.selected){add.push(tmp.id);}return tmp.id;};if(dat.length && dat[0].id !== undefined && dat[0].parent !== undefined){ // Flat JSON support (for easy import from DB):
// 1) convert to object (foreach)
for(i = 0,j = dat.length;i < j;i++) {if(!dat[i].children){dat[i].children = [];}m[dat[i].id.toString()] = dat[i];} // 2) populate children (foreach)
for(i = 0,j = dat.length;i < j;i++) {m[dat[i].parent.toString()].children.push(dat[i].id.toString()); // populate parent.children_d
p.children_d.push(dat[i].id.toString());} // 3) normalize && populate parents and children_d with recursion
for(i = 0,j = p.children.length;i < j;i++) {tmp = parse_flat(m[p.children[i]],par,p.parents.concat());dpc.push(tmp);if(m[tmp].children_d.length){dpc = dpc.concat(m[tmp].children_d);}}for(i = 0,j = p.parents.length;i < j;i++) {m[p.parents[i]].children_d = m[p.parents[i]].children_d.concat(dpc);} // ?) three_state selection - p.state.selected && t - (if three_state foreach(dat => ch) -> foreach(parents) if(parent.selected) child.selected = true;
rslt = {'cnt':t_cnt,'mod':m,'sel':sel,'par':par,'dpc':dpc,'add':add};}else {for(i = 0,j = dat.length;i < j;i++) {tmp = parse_nest(dat[i],par,p.parents.concat());if(tmp){chd.push(tmp);dpc.push(tmp);if(m[tmp].children_d.length){dpc = dpc.concat(m[tmp].children_d);}}}p.children = chd;p.children_d = dpc;for(i = 0,j = p.parents.length;i < j;i++) {m[p.parents[i]].children_d = m[p.parents[i]].children_d.concat(dpc);}rslt = {'cnt':t_cnt,'mod':m,'sel':sel,'par':par,'dpc':dpc,'add':add};}if(typeof window === 'undefined' || typeof window.document === 'undefined'){postMessage(rslt);}else {return rslt;}},rslt=function rslt(_rslt,worker){if(this.element === null){return;}this._cnt = _rslt.cnt;this._model.data = _rslt.mod; // breaks the reference in load_node - careful
if(worker){var i,j,a=_rslt.add,r=_rslt.sel,s=this._data.core.selected.slice(),m=this._model.data; // if selection was changed while calculating in worker
if(r.length !== s.length || $.vakata.array_unique(r.concat(s)).length !== r.length){ // deselect nodes that are no longer selected
for(i = 0,j = r.length;i < j;i++) {if($.inArray(r[i],a) === -1 && $.inArray(r[i],s) === -1){m[r[i]].state.selected = false;}} // select nodes that were selected in the mean time
for(i = 0,j = s.length;i < j;i++) {if($.inArray(s[i],r) === -1){m[s[i]].state.selected = true;}}}}if(_rslt.add.length){this._data.core.selected = this._data.core.selected.concat(_rslt.add);}this.trigger('model',{"nodes":_rslt.dpc,'parent':_rslt.par});if(_rslt.par !== $.jstree.root){this._node_changed(_rslt.par);this.redraw();}else { // this.get_container_ul().children('.jstree-initial-node').remove();
this.redraw(true);}if(_rslt.add.length){this.trigger('changed',{'action':'model','selected':this._data.core.selected});}cb.call(this,true);};if(this.settings.core.worker && window.Blob && window.URL && window.Worker){try{if(this._wrk === null){this._wrk = window.URL.createObjectURL(new window.Blob(['self.onmessage = ' + func.toString()],{type:"text/javascript"}));}if(!this._data.core.working || force_processing){this._data.core.working = true;w = new window.Worker(this._wrk);w.onmessage = $.proxy(function(e){rslt.call(this,e.data,true);try{w.terminate();w = null;}catch(ignore) {}if(this._data.core.worker_queue.length){this._append_json_data.apply(this,this._data.core.worker_queue.shift());}else {this._data.core.working = false;}},this);if(!args.par){if(this._data.core.worker_queue.length){this._append_json_data.apply(this,this._data.core.worker_queue.shift());}else {this._data.core.working = false;}}else {w.postMessage(args);}}else {this._data.core.worker_queue.push([dom,data,cb,true]);}}catch(e) {rslt.call(this,func(args),false);if(this._data.core.worker_queue.length){this._append_json_data.apply(this,this._data.core.worker_queue.shift());}else {this._data.core.working = false;}}}else {rslt.call(this,func(args),false);}}, /**
		 * parses a node from a jQuery object and appends them to the in memory tree model. Used internally.
		 * @private
		 * @name _parse_model_from_html(d [, p, ps])
		 * @param  {jQuery} d the jQuery object to parse
		 * @param  {String} p the parent ID
		 * @param  {Array} ps list of all parents
		 * @return {String} the ID of the object added to the model
		 */_parse_model_from_html:function _parse_model_from_html(d,p,ps){if(!ps){ps = [];}else {ps = [].concat(ps);}if(p){ps.unshift(p);}var c,e,m=this._model.data,data={id:false,text:false,icon:true,parent:p,parents:ps,children:[],children_d:[],data:null,state:{},li_attr:{id:false},a_attr:{href:'#'},original:false},i,tmp,tid;for(i in this._model.default_state) {if(this._model.default_state.hasOwnProperty(i)){data.state[i] = this._model.default_state[i];}}tmp = $.vakata.attributes(d,true);$.each(tmp,function(i,v){v = $.trim(v);if(!v.length){return true;}data.li_attr[i] = v;if(i === 'id'){data.id = v.toString();}});tmp = d.children('a').first();if(tmp.length){tmp = $.vakata.attributes(tmp,true);$.each(tmp,function(i,v){v = $.trim(v);if(v.length){data.a_attr[i] = v;}});}tmp = d.children("a").first().length?d.children("a").first().clone():d.clone();tmp.children("ins, i, ul").remove();tmp = tmp.html();tmp = $('<div />').html(tmp);data.text = this.settings.core.force_text?tmp.text():tmp.html();tmp = d.data();data.data = tmp?$.extend(true,{},tmp):null;data.state.opened = d.hasClass('jstree-open');data.state.selected = d.children('a').hasClass('jstree-clicked');data.state.disabled = d.children('a').hasClass('jstree-disabled');if(data.data && data.data.jstree){for(i in data.data.jstree) {if(data.data.jstree.hasOwnProperty(i)){data.state[i] = data.data.jstree[i];}}}tmp = d.children("a").children(".jstree-themeicon");if(tmp.length){data.icon = tmp.hasClass('jstree-themeicon-hidden')?false:tmp.attr('rel');}if(data.state.icon !== undefined){data.icon = data.state.icon;}if(data.icon === undefined || data.icon === null || data.icon === ""){data.icon = true;}tmp = d.children("ul").children("li");do {tid = 'j' + this._id + '_' + ++this._cnt;}while(m[tid]);data.id = data.li_attr.id?data.li_attr.id.toString():tid;if(tmp.length){tmp.each($.proxy(function(i,v){c = this._parse_model_from_html($(v),data.id,ps);e = this._model.data[c];data.children.push(c);if(e.children_d.length){data.children_d = data.children_d.concat(e.children_d);}},this));data.children_d = data.children_d.concat(data.children);}else {if(d.hasClass('jstree-closed')){data.state.loaded = false;}}if(data.li_attr['class']){data.li_attr['class'] = data.li_attr['class'].replace('jstree-closed','').replace('jstree-open','');}if(data.a_attr['class']){data.a_attr['class'] = data.a_attr['class'].replace('jstree-clicked','').replace('jstree-disabled','');}m[data.id] = data;if(data.state.selected){this._data.core.selected.push(data.id);}return data.id;}, /**
		 * parses a node from a JSON object (used when dealing with flat data, which has no nesting of children, but has id and parent properties) and appends it to the in memory tree model. Used internally.
		 * @private
		 * @name _parse_model_from_flat_json(d [, p, ps])
		 * @param  {Object} d the JSON object to parse
		 * @param  {String} p the parent ID
		 * @param  {Array} ps list of all parents
		 * @return {String} the ID of the object added to the model
		 */_parse_model_from_flat_json:function _parse_model_from_flat_json(d,p,ps){if(!ps){ps = [];}else {ps = ps.concat();}if(p){ps.unshift(p);}var tid=d.id.toString(),m=this._model.data,df=this._model.default_state,i,j,c,e,tmp={id:tid,text:d.text || '',icon:d.icon !== undefined?d.icon:true,parent:p,parents:ps,children:d.children || [],children_d:d.children_d || [],data:d.data,state:{},li_attr:{id:false},a_attr:{href:'#'},original:false};for(i in df) {if(df.hasOwnProperty(i)){tmp.state[i] = df[i];}}if(d && d.data && d.data.jstree && d.data.jstree.icon){tmp.icon = d.data.jstree.icon;}if(tmp.icon === undefined || tmp.icon === null || tmp.icon === ""){tmp.icon = true;}if(d && d.data){tmp.data = d.data;if(d.data.jstree){for(i in d.data.jstree) {if(d.data.jstree.hasOwnProperty(i)){tmp.state[i] = d.data.jstree[i];}}}}if(d && typeof d.state === 'object'){for(i in d.state) {if(d.state.hasOwnProperty(i)){tmp.state[i] = d.state[i];}}}if(d && typeof d.li_attr === 'object'){for(i in d.li_attr) {if(d.li_attr.hasOwnProperty(i)){tmp.li_attr[i] = d.li_attr[i];}}}if(!tmp.li_attr.id){tmp.li_attr.id = tid;}if(d && typeof d.a_attr === 'object'){for(i in d.a_attr) {if(d.a_attr.hasOwnProperty(i)){tmp.a_attr[i] = d.a_attr[i];}}}if(d && d.children && d.children === true){tmp.state.loaded = false;tmp.children = [];tmp.children_d = [];}m[tmp.id] = tmp;for(i = 0,j = tmp.children.length;i < j;i++) {c = this._parse_model_from_flat_json(m[tmp.children[i]],tmp.id,ps);e = m[c];tmp.children_d.push(c);if(e.children_d.length){tmp.children_d = tmp.children_d.concat(e.children_d);}}delete d.data;delete d.children;m[tmp.id].original = d;if(tmp.state.selected){this._data.core.selected.push(tmp.id);}return tmp.id;}, /**
		 * parses a node from a JSON object and appends it to the in memory tree model. Used internally.
		 * @private
		 * @name _parse_model_from_json(d [, p, ps])
		 * @param  {Object} d the JSON object to parse
		 * @param  {String} p the parent ID
		 * @param  {Array} ps list of all parents
		 * @return {String} the ID of the object added to the model
		 */_parse_model_from_json:function _parse_model_from_json(d,p,ps){if(!ps){ps = [];}else {ps = ps.concat();}if(p){ps.unshift(p);}var tid=false,i,j,c,e,m=this._model.data,df=this._model.default_state,tmp;do {tid = 'j' + this._id + '_' + ++this._cnt;}while(m[tid]);tmp = {id:false,text:typeof d === 'string'?d:'',icon:typeof d === 'object' && d.icon !== undefined?d.icon:true,parent:p,parents:ps,children:[],children_d:[],data:null,state:{},li_attr:{id:false},a_attr:{href:'#'},original:false};for(i in df) {if(df.hasOwnProperty(i)){tmp.state[i] = df[i];}}if(d && d.id){tmp.id = d.id.toString();}if(d && d.text){tmp.text = d.text;}if(d && d.data && d.data.jstree && d.data.jstree.icon){tmp.icon = d.data.jstree.icon;}if(tmp.icon === undefined || tmp.icon === null || tmp.icon === ""){tmp.icon = true;}if(d && d.data){tmp.data = d.data;if(d.data.jstree){for(i in d.data.jstree) {if(d.data.jstree.hasOwnProperty(i)){tmp.state[i] = d.data.jstree[i];}}}}if(d && typeof d.state === 'object'){for(i in d.state) {if(d.state.hasOwnProperty(i)){tmp.state[i] = d.state[i];}}}if(d && typeof d.li_attr === 'object'){for(i in d.li_attr) {if(d.li_attr.hasOwnProperty(i)){tmp.li_attr[i] = d.li_attr[i];}}}if(tmp.li_attr.id && !tmp.id){tmp.id = tmp.li_attr.id.toString();}if(!tmp.id){tmp.id = tid;}if(!tmp.li_attr.id){tmp.li_attr.id = tmp.id;}if(d && typeof d.a_attr === 'object'){for(i in d.a_attr) {if(d.a_attr.hasOwnProperty(i)){tmp.a_attr[i] = d.a_attr[i];}}}if(d && d.children && d.children.length){for(i = 0,j = d.children.length;i < j;i++) {c = this._parse_model_from_json(d.children[i],tmp.id,ps);e = m[c];tmp.children.push(c);if(e.children_d.length){tmp.children_d = tmp.children_d.concat(e.children_d);}}tmp.children_d = tmp.children_d.concat(tmp.children);}if(d && d.children && d.children === true){tmp.state.loaded = false;tmp.children = [];tmp.children_d = [];}delete d.data;delete d.children;tmp.original = d;m[tmp.id] = tmp;if(tmp.state.selected){this._data.core.selected.push(tmp.id);}return tmp.id;}, /**
		 * redraws all nodes that need to be redrawn. Used internally.
		 * @private
		 * @name _redraw()
		 * @trigger redraw.jstree
		 */_redraw:function _redraw(){var nodes=this._model.force_full_redraw?this._model.data[$.jstree.root].children.concat([]):this._model.changed.concat([]),f=document.createElement('UL'),tmp,i,j,fe=this._data.core.focused;for(i = 0,j = nodes.length;i < j;i++) {tmp = this.redraw_node(nodes[i],true,this._model.force_full_redraw);if(tmp && this._model.force_full_redraw){f.appendChild(tmp);}}if(this._model.force_full_redraw){f.className = this.get_container_ul()[0].className;f.setAttribute('role','group');this.element.empty().append(f); //this.get_container_ul()[0].appendChild(f);
}if(fe !== null){tmp = this.get_node(fe,true);if(tmp && tmp.length && tmp.children('.jstree-anchor')[0] !== document.activeElement){tmp.children('.jstree-anchor').focus();}else {this._data.core.focused = null;}}this._model.force_full_redraw = false;this._model.changed = []; /**
			 * triggered after nodes are redrawn
			 * @event
			 * @name redraw.jstree
			 * @param {array} nodes the redrawn nodes
			 */this.trigger('redraw',{"nodes":nodes});}, /**
		 * redraws all nodes that need to be redrawn or optionally - the whole tree
		 * @name redraw([full])
		 * @param {Boolean} full if set to `true` all nodes are redrawn.
		 */redraw:function redraw(full){if(full){this._model.force_full_redraw = true;} //if(this._model.redraw_timeout) {
//	clearTimeout(this._model.redraw_timeout);
//}
//this._model.redraw_timeout = setTimeout($.proxy(this._redraw, this),0);
this._redraw();}, /**
		 * redraws a single node's children. Used internally.
		 * @private
		 * @name draw_children(node)
		 * @param {mixed} node the node whose children will be redrawn
		 */draw_children:function draw_children(node){var obj=this.get_node(node),i=false,j=false,k=false,d=document;if(!obj){return false;}if(obj.id === $.jstree.root){return this.redraw(true);}node = this.get_node(node,true);if(!node || !node.length){return false;} // TODO: quick toggle
node.children('.jstree-children').remove();node = node[0];if(obj.children.length && obj.state.loaded){k = d.createElement('UL');k.setAttribute('role','group');k.className = 'jstree-children';for(i = 0,j = obj.children.length;i < j;i++) {k.appendChild(this.redraw_node(obj.children[i],true,true));}node.appendChild(k);}}, /**
		 * redraws a single node. Used internally.
		 * @private
		 * @name redraw_node(node, deep, is_callback, force_render)
		 * @param {mixed} node the node to redraw
		 * @param {Boolean} deep should child nodes be redrawn too
		 * @param {Boolean} is_callback is this a recursion call
		 * @param {Boolean} force_render should children of closed parents be drawn anyway
		 */redraw_node:function redraw_node(node,deep,is_callback,force_render){var obj=this.get_node(node),par=false,ind=false,old=false,i=false,j=false,k=false,c='',d=document,m=this._model.data,f=false,s=false,tmp=null,t=0,l=0,has_children=false,last_sibling=false;if(!obj){return false;}if(obj.id === $.jstree.root){return this.redraw(true);}deep = deep || obj.children.length === 0;node = !document.querySelector?document.getElementById(obj.id):this.element[0].querySelector('#' + ("0123456789".indexOf(obj.id[0]) !== -1?'\\3' + obj.id[0] + ' ' + obj.id.substr(1).replace($.jstree.idregex,'\\$&'):obj.id.replace($.jstree.idregex,'\\$&'))); //, this.element);
if(!node){deep = true; //node = d.createElement('LI');
if(!is_callback){par = obj.parent !== $.jstree.root?$('#' + obj.parent.replace($.jstree.idregex,'\\$&'),this.element)[0]:null;if(par !== null && (!par || !m[obj.parent].state.opened)){return false;}ind = $.inArray(obj.id,par === null?m[$.jstree.root].children:m[obj.parent].children);}}else {node = $(node);if(!is_callback){par = node.parent().parent()[0];if(par === this.element[0]){par = null;}ind = node.index();} // m[obj.id].data = node.data(); // use only node's data, no need to touch jquery storage
if(!deep && obj.children.length && !node.children('.jstree-children').length){deep = true;}if(!deep){old = node.children('.jstree-children')[0];}f = node.children('.jstree-anchor')[0] === document.activeElement;node.remove(); //node = d.createElement('LI');
//node = node[0];
}node = _node.cloneNode(true); // node is DOM, deep is boolean
c = 'jstree-node ';for(i in obj.li_attr) {if(obj.li_attr.hasOwnProperty(i)){if(i === 'id'){continue;}if(i !== 'class'){node.setAttribute(i,obj.li_attr[i]);}else {c += obj.li_attr[i];}}}if(!obj.a_attr.id){obj.a_attr.id = obj.id + '_anchor';}node.setAttribute('aria-selected',!!obj.state.selected);node.setAttribute('aria-level',obj.parents.length);node.setAttribute('aria-labelledby',obj.a_attr.id);if(obj.state.disabled){node.setAttribute('aria-disabled',true);}for(i = 0,j = obj.children.length;i < j;i++) {if(!m[obj.children[i]].state.hidden){has_children = true;break;}}if(obj.parent !== null && m[obj.parent] && !obj.state.hidden){i = $.inArray(obj.id,m[obj.parent].children);last_sibling = obj.id;if(i !== -1){i++;for(j = m[obj.parent].children.length;i < j;i++) {if(!m[m[obj.parent].children[i]].state.hidden){last_sibling = m[obj.parent].children[i];}if(last_sibling !== obj.id){break;}}}}if(obj.state.hidden){c += ' jstree-hidden';}if(obj.state.loaded && !has_children){c += ' jstree-leaf';}else {c += obj.state.opened && obj.state.loaded?' jstree-open':' jstree-closed';node.setAttribute('aria-expanded',obj.state.opened && obj.state.loaded);}if(last_sibling === obj.id){c += ' jstree-last';}node.id = obj.id;node.className = c;c = (obj.state.selected?' jstree-clicked':'') + (obj.state.disabled?' jstree-disabled':'');for(j in obj.a_attr) {if(obj.a_attr.hasOwnProperty(j)){if(j === 'href' && obj.a_attr[j] === '#'){continue;}if(j !== 'class'){node.childNodes[1].setAttribute(j,obj.a_attr[j]);}else {c += ' ' + obj.a_attr[j];}}}if(c.length){node.childNodes[1].className = 'jstree-anchor ' + c;}if(obj.icon && obj.icon !== true || obj.icon === false){if(obj.icon === false){node.childNodes[1].childNodes[0].className += ' jstree-themeicon-hidden';}else if(obj.icon.indexOf('/') === -1 && obj.icon.indexOf('.') === -1){node.childNodes[1].childNodes[0].className += ' ' + obj.icon + ' jstree-themeicon-custom';}else {node.childNodes[1].childNodes[0].style.backgroundImage = 'url(' + obj.icon + ')';node.childNodes[1].childNodes[0].style.backgroundPosition = 'center center';node.childNodes[1].childNodes[0].style.backgroundSize = 'auto';node.childNodes[1].childNodes[0].className += ' jstree-themeicon-custom';}}if(this.settings.core.force_text){node.childNodes[1].appendChild(d.createTextNode(obj.text));}else {node.childNodes[1].innerHTML += obj.text;}if(deep && obj.children.length && (obj.state.opened || force_render) && obj.state.loaded){k = d.createElement('UL');k.setAttribute('role','group');k.className = 'jstree-children';for(i = 0,j = obj.children.length;i < j;i++) {k.appendChild(this.redraw_node(obj.children[i],deep,true));}node.appendChild(k);}if(old){node.appendChild(old);}if(!is_callback){ // append back using par / ind
if(!par){par = this.element[0];}for(i = 0,j = par.childNodes.length;i < j;i++) {if(par.childNodes[i] && par.childNodes[i].className && par.childNodes[i].className.indexOf('jstree-children') !== -1){tmp = par.childNodes[i];break;}}if(!tmp){tmp = d.createElement('UL');tmp.setAttribute('role','group');tmp.className = 'jstree-children';par.appendChild(tmp);}par = tmp;if(ind < par.childNodes.length){par.insertBefore(node,par.childNodes[ind]);}else {par.appendChild(node);}if(f){t = this.element[0].scrollTop;l = this.element[0].scrollLeft;node.childNodes[1].focus();this.element[0].scrollTop = t;this.element[0].scrollLeft = l;}}if(obj.state.opened && !obj.state.loaded){obj.state.opened = false;setTimeout($.proxy(function(){this.open_node(obj.id,false,0);},this),0);}return node;}, /**
		 * opens a node, revaling its children. If the node is not loaded it will be loaded and opened once ready.
		 * @name open_node(obj [, callback, animation])
		 * @param {mixed} obj the node to open
		 * @param {Function} callback a function to execute once the node is opened
		 * @param {Number} animation the animation duration in milliseconds when opening the node (overrides the `core.animation` setting). Use `false` for no animation.
		 * @trigger open_node.jstree, after_open.jstree, before_open.jstree
		 */open_node:function open_node(obj,callback,animation){var t1,t2,d,t;if($.isArray(obj)){obj = obj.slice();for(t1 = 0,t2 = obj.length;t1 < t2;t1++) {this.open_node(obj[t1],callback,animation);}return true;}obj = this.get_node(obj);if(!obj || obj.id === $.jstree.root){return false;}animation = animation === undefined?this.settings.core.animation:animation;if(!this.is_closed(obj)){if(callback){callback.call(this,obj,false);}return false;}if(!this.is_loaded(obj)){if(this.is_loading(obj)){return setTimeout($.proxy(function(){this.open_node(obj,callback,animation);},this),500);}this.load_node(obj,function(o,ok){return ok?this.open_node(o,callback,animation):callback?callback.call(this,o,false):false;});}else {d = this.get_node(obj,true);t = this;if(d.length){if(animation && d.children(".jstree-children").length){d.children(".jstree-children").stop(true,true);}if(obj.children.length && !this._firstChild(d.children('.jstree-children')[0])){this.draw_children(obj); //d = this.get_node(obj, true);
}if(!animation){this.trigger('before_open',{"node":obj});d[0].className = d[0].className.replace('jstree-closed','jstree-open');d[0].setAttribute("aria-expanded",true);}else {this.trigger('before_open',{"node":obj});d.children(".jstree-children").css("display","none").end().removeClass("jstree-closed").addClass("jstree-open").attr("aria-expanded",true).children(".jstree-children").stop(true,true).slideDown(animation,function(){this.style.display = "";t.trigger("after_open",{"node":obj});});}}obj.state.opened = true;if(callback){callback.call(this,obj,true);}if(!d.length){ /**
					 * triggered when a node is about to be opened (if the node is supposed to be in the DOM, it will be, but it won't be visible yet)
					 * @event
					 * @name before_open.jstree
					 * @param {Object} node the opened node
					 */this.trigger('before_open',{"node":obj});} /**
				 * triggered when a node is opened (if there is an animation it will not be completed yet)
				 * @event
				 * @name open_node.jstree
				 * @param {Object} node the opened node
				 */this.trigger('open_node',{"node":obj});if(!animation || !d.length){ /**
					 * triggered when a node is opened and the animation is complete
					 * @event
					 * @name after_open.jstree
					 * @param {Object} node the opened node
					 */this.trigger("after_open",{"node":obj});}return true;}}, /**
		 * opens every parent of a node (node should be loaded)
		 * @name _open_to(obj)
		 * @param {mixed} obj the node to reveal
		 * @private
		 */_open_to:function _open_to(obj){obj = this.get_node(obj);if(!obj || obj.id === $.jstree.root){return false;}var i,j,p=obj.parents;for(i = 0,j = p.length;i < j;i += 1) {if(i !== $.jstree.root){this.open_node(p[i],false,0);}}return $('#' + obj.id.replace($.jstree.idregex,'\\$&'),this.element);}, /**
		 * closes a node, hiding its children
		 * @name close_node(obj [, animation])
		 * @param {mixed} obj the node to close
		 * @param {Number} animation the animation duration in milliseconds when closing the node (overrides the `core.animation` setting). Use `false` for no animation.
		 * @trigger close_node.jstree, after_close.jstree
		 */close_node:function close_node(obj,animation){var t1,t2,t,d;if($.isArray(obj)){obj = obj.slice();for(t1 = 0,t2 = obj.length;t1 < t2;t1++) {this.close_node(obj[t1],animation);}return true;}obj = this.get_node(obj);if(!obj || obj.id === $.jstree.root){return false;}if(this.is_closed(obj)){return false;}animation = animation === undefined?this.settings.core.animation:animation;t = this;d = this.get_node(obj,true);if(d.length){if(!animation){d[0].className = d[0].className.replace('jstree-open','jstree-closed');d.attr("aria-expanded",false).children('.jstree-children').remove();}else {d.children(".jstree-children").attr("style","display:block !important").end().removeClass("jstree-open").addClass("jstree-closed").attr("aria-expanded",false).children(".jstree-children").stop(true,true).slideUp(animation,function(){this.style.display = "";d.children('.jstree-children').remove();t.trigger("after_close",{"node":obj});});}}obj.state.opened = false; /**
			 * triggered when a node is closed (if there is an animation it will not be complete yet)
			 * @event
			 * @name close_node.jstree
			 * @param {Object} node the closed node
			 */this.trigger('close_node',{"node":obj});if(!animation || !d.length){ /**
				 * triggered when a node is closed and the animation is complete
				 * @event
				 * @name after_close.jstree
				 * @param {Object} node the closed node
				 */this.trigger("after_close",{"node":obj});}}, /**
		 * toggles a node - closing it if it is open, opening it if it is closed
		 * @name toggle_node(obj)
		 * @param {mixed} obj the node to toggle
		 */toggle_node:function toggle_node(obj){var t1,t2;if($.isArray(obj)){obj = obj.slice();for(t1 = 0,t2 = obj.length;t1 < t2;t1++) {this.toggle_node(obj[t1]);}return true;}if(this.is_closed(obj)){return this.open_node(obj);}if(this.is_open(obj)){return this.close_node(obj);}}, /**
		 * opens all nodes within a node (or the tree), revaling their children. If the node is not loaded it will be loaded and opened once ready.
		 * @name open_all([obj, animation, original_obj])
		 * @param {mixed} obj the node to open recursively, omit to open all nodes in the tree
		 * @param {Number} animation the animation duration in milliseconds when opening the nodes, the default is no animation
		 * @param {jQuery} reference to the node that started the process (internal use)
		 * @trigger open_all.jstree
		 */open_all:function open_all(obj,animation,original_obj){if(!obj){obj = $.jstree.root;}obj = this.get_node(obj);if(!obj){return false;}var dom=obj.id === $.jstree.root?this.get_container_ul():this.get_node(obj,true),i,j,_this;if(!dom.length){for(i = 0,j = obj.children_d.length;i < j;i++) {if(this.is_closed(this._model.data[obj.children_d[i]])){this._model.data[obj.children_d[i]].state.opened = true;}}return this.trigger('open_all',{"node":obj});}original_obj = original_obj || dom;_this = this;dom = this.is_closed(obj)?dom.find('.jstree-closed').addBack():dom.find('.jstree-closed');dom.each(function(){_this.open_node(this,function(node,status){if(status && this.is_parent(node)){this.open_all(node,animation,original_obj);}},animation || 0);});if(original_obj.find('.jstree-closed').length === 0){ /**
				 * triggered when an `open_all` call completes
				 * @event
				 * @name open_all.jstree
				 * @param {Object} node the opened node
				 */this.trigger('open_all',{"node":this.get_node(original_obj)});}}, /**
		 * closes all nodes within a node (or the tree), revaling their children
		 * @name close_all([obj, animation])
		 * @param {mixed} obj the node to close recursively, omit to close all nodes in the tree
		 * @param {Number} animation the animation duration in milliseconds when closing the nodes, the default is no animation
		 * @trigger close_all.jstree
		 */close_all:function close_all(obj,animation){if(!obj){obj = $.jstree.root;}obj = this.get_node(obj);if(!obj){return false;}var dom=obj.id === $.jstree.root?this.get_container_ul():this.get_node(obj,true),_this=this,i,j;if(dom.length){dom = this.is_open(obj)?dom.find('.jstree-open').addBack():dom.find('.jstree-open');$(dom.get().reverse()).each(function(){_this.close_node(this,animation || 0);});}for(i = 0,j = obj.children_d.length;i < j;i++) {this._model.data[obj.children_d[i]].state.opened = false;} /**
			 * triggered when an `close_all` call completes
			 * @event
			 * @name close_all.jstree
			 * @param {Object} node the closed node
			 */this.trigger('close_all',{"node":obj});}, /**
		 * checks if a node is disabled (not selectable)
		 * @name is_disabled(obj)
		 * @param  {mixed} obj
		 * @return {Boolean}
		 */is_disabled:function is_disabled(obj){obj = this.get_node(obj);return obj && obj.state && obj.state.disabled;}, /**
		 * enables a node - so that it can be selected
		 * @name enable_node(obj)
		 * @param {mixed} obj the node to enable
		 * @trigger enable_node.jstree
		 */enable_node:function enable_node(obj){var t1,t2;if($.isArray(obj)){obj = obj.slice();for(t1 = 0,t2 = obj.length;t1 < t2;t1++) {this.enable_node(obj[t1]);}return true;}obj = this.get_node(obj);if(!obj || obj.id === $.jstree.root){return false;}obj.state.disabled = false;this.get_node(obj,true).children('.jstree-anchor').removeClass('jstree-disabled').attr('aria-disabled',false); /**
			 * triggered when an node is enabled
			 * @event
			 * @name enable_node.jstree
			 * @param {Object} node the enabled node
			 */this.trigger('enable_node',{'node':obj});}, /**
		 * disables a node - so that it can not be selected
		 * @name disable_node(obj)
		 * @param {mixed} obj the node to disable
		 * @trigger disable_node.jstree
		 */disable_node:function disable_node(obj){var t1,t2;if($.isArray(obj)){obj = obj.slice();for(t1 = 0,t2 = obj.length;t1 < t2;t1++) {this.disable_node(obj[t1]);}return true;}obj = this.get_node(obj);if(!obj || obj.id === $.jstree.root){return false;}obj.state.disabled = true;this.get_node(obj,true).children('.jstree-anchor').addClass('jstree-disabled').attr('aria-disabled',true); /**
			 * triggered when an node is disabled
			 * @event
			 * @name disable_node.jstree
			 * @param {Object} node the disabled node
			 */this.trigger('disable_node',{'node':obj});}, /**
		 * hides a node - it is still in the structure but will not be visible
		 * @name hide_node(obj)
		 * @param {mixed} obj the node to hide
		 * @param {Boolean} redraw internal parameter controlling if redraw is called
		 * @trigger hide_node.jstree
		 */hide_node:function hide_node(obj,skip_redraw){var t1,t2;if($.isArray(obj)){obj = obj.slice();for(t1 = 0,t2 = obj.length;t1 < t2;t1++) {this.hide_node(obj[t1],true);}this.redraw();return true;}obj = this.get_node(obj);if(!obj || obj.id === $.jstree.root){return false;}if(!obj.state.hidden){obj.state.hidden = true;this._node_changed(obj.parent);if(!skip_redraw){this.redraw();} /**
				 * triggered when an node is hidden
				 * @event
				 * @name hide_node.jstree
				 * @param {Object} node the hidden node
				 */this.trigger('hide_node',{'node':obj});}}, /**
		 * shows a node
		 * @name show_node(obj)
		 * @param {mixed} obj the node to show
		 * @param {Boolean} skip_redraw internal parameter controlling if redraw is called
		 * @trigger show_node.jstree
		 */show_node:function show_node(obj,skip_redraw){var t1,t2;if($.isArray(obj)){obj = obj.slice();for(t1 = 0,t2 = obj.length;t1 < t2;t1++) {this.show_node(obj[t1],true);}this.redraw();return true;}obj = this.get_node(obj);if(!obj || obj.id === $.jstree.root){return false;}if(obj.state.hidden){obj.state.hidden = false;this._node_changed(obj.parent);if(!skip_redraw){this.redraw();} /**
				 * triggered when an node is shown
				 * @event
				 * @name show_node.jstree
				 * @param {Object} node the shown node
				 */this.trigger('show_node',{'node':obj});}}, /**
		 * hides all nodes
		 * @name hide_all()
		 * @trigger hide_all.jstree
		 */hide_all:function hide_all(skip_redraw){var i,m=this._model.data,ids=[];for(i in m) {if(m.hasOwnProperty(i) && i !== $.jstree.root && !m[i].state.hidden){m[i].state.hidden = true;ids.push(i);}}this._model.force_full_redraw = true;if(!skip_redraw){this.redraw();} /**
			 * triggered when all nodes are hidden
			 * @event
			 * @name hide_all.jstree
			 * @param {Array} nodes the IDs of all hidden nodes
			 */this.trigger('hide_all',{'nodes':ids});return ids;}, /**
		 * shows all nodes
		 * @name show_all()
		 * @trigger show_all.jstree
		 */show_all:function show_all(skip_redraw){var i,m=this._model.data,ids=[];for(i in m) {if(m.hasOwnProperty(i) && i !== $.jstree.root && m[i].state.hidden){m[i].state.hidden = false;ids.push(i);}}this._model.force_full_redraw = true;if(!skip_redraw){this.redraw();} /**
			 * triggered when all nodes are shown
			 * @event
			 * @name show_all.jstree
			 * @param {Array} nodes the IDs of all shown nodes
			 */this.trigger('show_all',{'nodes':ids});return ids;}, /**
		 * called when a node is selected by the user. Used internally.
		 * @private
		 * @name activate_node(obj, e)
		 * @param {mixed} obj the node
		 * @param {Object} e the related event
		 * @trigger activate_node.jstree, changed.jstree
		 */activate_node:function activate_node(obj,e){if(this.is_disabled(obj)){return false;}if(!e || typeof e !== 'object'){e = {};} // ensure last_clicked is still in the DOM, make it fresh (maybe it was moved?) and make sure it is still selected, if not - make last_clicked the last selected node
this._data.core.last_clicked = this._data.core.last_clicked && this._data.core.last_clicked.id !== undefined?this.get_node(this._data.core.last_clicked.id):null;if(this._data.core.last_clicked && !this._data.core.last_clicked.state.selected){this._data.core.last_clicked = null;}if(!this._data.core.last_clicked && this._data.core.selected.length){this._data.core.last_clicked = this.get_node(this._data.core.selected[this._data.core.selected.length - 1]);}if(!this.settings.core.multiple || !e.metaKey && !e.ctrlKey && !e.shiftKey || e.shiftKey && (!this._data.core.last_clicked || !this.get_parent(obj) || this.get_parent(obj) !== this._data.core.last_clicked.parent)){if(!this.settings.core.multiple && (e.metaKey || e.ctrlKey || e.shiftKey) && this.is_selected(obj)){this.deselect_node(obj,false,e);}else {this.deselect_all(true);this.select_node(obj,false,false,e);this._data.core.last_clicked = this.get_node(obj);}}else {if(e.shiftKey){var o=this.get_node(obj).id,l=this._data.core.last_clicked.id,p=this.get_node(this._data.core.last_clicked.parent).children,c=false,i,j;for(i = 0,j = p.length;i < j;i += 1) { // separate IFs work whem o and l are the same
if(p[i] === o){c = !c;}if(p[i] === l){c = !c;}if(!this.is_disabled(p[i]) && (c || p[i] === o || p[i] === l)){this.select_node(p[i],true,false,e);}else {this.deselect_node(p[i],true,e);}}this.trigger('changed',{'action':'select_node','node':this.get_node(obj),'selected':this._data.core.selected,'event':e});}else {if(!this.is_selected(obj)){this.select_node(obj,false,false,e);}else {this.deselect_node(obj,false,e);}}} /**
			 * triggered when an node is clicked or intercated with by the user
			 * @event
			 * @name activate_node.jstree
			 * @param {Object} node
			 * @param {Object} event the ooriginal event (if any) which triggered the call (may be an empty object)
			 */this.trigger('activate_node',{'node':this.get_node(obj),'event':e});}, /**
		 * applies the hover state on a node, called when a node is hovered by the user. Used internally.
		 * @private
		 * @name hover_node(obj)
		 * @param {mixed} obj
		 * @trigger hover_node.jstree
		 */hover_node:function hover_node(obj){obj = this.get_node(obj,true);if(!obj || !obj.length || obj.children('.jstree-hovered').length){return false;}var o=this.element.find('.jstree-hovered'),t=this.element;if(o && o.length){this.dehover_node(o);}obj.children('.jstree-anchor').addClass('jstree-hovered'); /**
			 * triggered when an node is hovered
			 * @event
			 * @name hover_node.jstree
			 * @param {Object} node
			 */this.trigger('hover_node',{'node':this.get_node(obj)});setTimeout(function(){t.attr('aria-activedescendant',obj[0].id);},0);}, /**
		 * removes the hover state from a nodecalled when a node is no longer hovered by the user. Used internally.
		 * @private
		 * @name dehover_node(obj)
		 * @param {mixed} obj
		 * @trigger dehover_node.jstree
		 */dehover_node:function dehover_node(obj){obj = this.get_node(obj,true);if(!obj || !obj.length || !obj.children('.jstree-hovered').length){return false;}obj.children('.jstree-anchor').removeClass('jstree-hovered'); /**
			 * triggered when an node is no longer hovered
			 * @event
			 * @name dehover_node.jstree
			 * @param {Object} node
			 */this.trigger('dehover_node',{'node':this.get_node(obj)});}, /**
		 * select a node
		 * @name select_node(obj [, supress_event, prevent_open])
		 * @param {mixed} obj an array can be used to select multiple nodes
		 * @param {Boolean} supress_event if set to `true` the `changed.jstree` event won't be triggered
		 * @param {Boolean} prevent_open if set to `true` parents of the selected node won't be opened
		 * @trigger select_node.jstree, changed.jstree
		 */select_node:function select_node(obj,supress_event,prevent_open,e){var dom,t1,t2,th;if($.isArray(obj)){obj = obj.slice();for(t1 = 0,t2 = obj.length;t1 < t2;t1++) {this.select_node(obj[t1],supress_event,prevent_open,e);}return true;}obj = this.get_node(obj);if(!obj || obj.id === $.jstree.root){return false;}dom = this.get_node(obj,true);if(!obj.state.selected){obj.state.selected = true;this._data.core.selected.push(obj.id);if(!prevent_open){dom = this._open_to(obj);}if(dom && dom.length){dom.attr('aria-selected',true).children('.jstree-anchor').addClass('jstree-clicked');} /**
				 * triggered when an node is selected
				 * @event
				 * @name select_node.jstree
				 * @param {Object} node
				 * @param {Array} selected the current selection
				 * @param {Object} event the event (if any) that triggered this select_node
				 */this.trigger('select_node',{'node':obj,'selected':this._data.core.selected,'event':e});if(!supress_event){ /**
					 * triggered when selection changes
					 * @event
					 * @name changed.jstree
					 * @param {Object} node
					 * @param {Object} action the action that caused the selection to change
					 * @param {Array} selected the current selection
					 * @param {Object} event the event (if any) that triggered this changed event
					 */this.trigger('changed',{'action':'select_node','node':obj,'selected':this._data.core.selected,'event':e});}}}, /**
		 * deselect a node
		 * @name deselect_node(obj [, supress_event])
		 * @param {mixed} obj an array can be used to deselect multiple nodes
		 * @param {Boolean} supress_event if set to `true` the `changed.jstree` event won't be triggered
		 * @trigger deselect_node.jstree, changed.jstree
		 */deselect_node:function deselect_node(obj,supress_event,e){var t1,t2,dom;if($.isArray(obj)){obj = obj.slice();for(t1 = 0,t2 = obj.length;t1 < t2;t1++) {this.deselect_node(obj[t1],supress_event,e);}return true;}obj = this.get_node(obj);if(!obj || obj.id === $.jstree.root){return false;}dom = this.get_node(obj,true);if(obj.state.selected){obj.state.selected = false;this._data.core.selected = $.vakata.array_remove_item(this._data.core.selected,obj.id);if(dom.length){dom.attr('aria-selected',false).children('.jstree-anchor').removeClass('jstree-clicked');} /**
				 * triggered when an node is deselected
				 * @event
				 * @name deselect_node.jstree
				 * @param {Object} node
				 * @param {Array} selected the current selection
				 * @param {Object} event the event (if any) that triggered this deselect_node
				 */this.trigger('deselect_node',{'node':obj,'selected':this._data.core.selected,'event':e});if(!supress_event){this.trigger('changed',{'action':'deselect_node','node':obj,'selected':this._data.core.selected,'event':e});}}}, /**
		 * select all nodes in the tree
		 * @name select_all([supress_event])
		 * @param {Boolean} supress_event if set to `true` the `changed.jstree` event won't be triggered
		 * @trigger select_all.jstree, changed.jstree
		 */select_all:function select_all(supress_event){var tmp=this._data.core.selected.concat([]),i,j;this._data.core.selected = this._model.data[$.jstree.root].children_d.concat();for(i = 0,j = this._data.core.selected.length;i < j;i++) {if(this._model.data[this._data.core.selected[i]]){this._model.data[this._data.core.selected[i]].state.selected = true;}}this.redraw(true); /**
			 * triggered when all nodes are selected
			 * @event
			 * @name select_all.jstree
			 * @param {Array} selected the current selection
			 */this.trigger('select_all',{'selected':this._data.core.selected});if(!supress_event){this.trigger('changed',{'action':'select_all','selected':this._data.core.selected,'old_selection':tmp});}}, /**
		 * deselect all selected nodes
		 * @name deselect_all([supress_event])
		 * @param {Boolean} supress_event if set to `true` the `changed.jstree` event won't be triggered
		 * @trigger deselect_all.jstree, changed.jstree
		 */deselect_all:function deselect_all(supress_event){var tmp=this._data.core.selected.concat([]),i,j;for(i = 0,j = this._data.core.selected.length;i < j;i++) {if(this._model.data[this._data.core.selected[i]]){this._model.data[this._data.core.selected[i]].state.selected = false;}}this._data.core.selected = [];this.element.find('.jstree-clicked').removeClass('jstree-clicked').parent().attr('aria-selected',false); /**
			 * triggered when all nodes are deselected
			 * @event
			 * @name deselect_all.jstree
			 * @param {Object} node the previous selection
			 * @param {Array} selected the current selection
			 */this.trigger('deselect_all',{'selected':this._data.core.selected,'node':tmp});if(!supress_event){this.trigger('changed',{'action':'deselect_all','selected':this._data.core.selected,'old_selection':tmp});}}, /**
		 * checks if a node is selected
		 * @name is_selected(obj)
		 * @param  {mixed}  obj
		 * @return {Boolean}
		 */is_selected:function is_selected(obj){obj = this.get_node(obj);if(!obj || obj.id === $.jstree.root){return false;}return obj.state.selected;}, /**
		 * get an array of all selected nodes
		 * @name get_selected([full])
		 * @param  {mixed}  full if set to `true` the returned array will consist of the full node objects, otherwise - only IDs will be returned
		 * @return {Array}
		 */get_selected:function get_selected(full){return full?$.map(this._data.core.selected,$.proxy(function(i){return this.get_node(i);},this)):this._data.core.selected.slice();}, /**
		 * get an array of all top level selected nodes (ignoring children of selected nodes)
		 * @name get_top_selected([full])
		 * @param  {mixed}  full if set to `true` the returned array will consist of the full node objects, otherwise - only IDs will be returned
		 * @return {Array}
		 */get_top_selected:function get_top_selected(full){var tmp=this.get_selected(true),obj={},i,j,k,l;for(i = 0,j = tmp.length;i < j;i++) {obj[tmp[i].id] = tmp[i];}for(i = 0,j = tmp.length;i < j;i++) {for(k = 0,l = tmp[i].children_d.length;k < l;k++) {if(obj[tmp[i].children_d[k]]){delete obj[tmp[i].children_d[k]];}}}tmp = [];for(i in obj) {if(obj.hasOwnProperty(i)){tmp.push(i);}}return full?$.map(tmp,$.proxy(function(i){return this.get_node(i);},this)):tmp;}, /**
		 * get an array of all bottom level selected nodes (ignoring selected parents)
		 * @name get_bottom_selected([full])
		 * @param  {mixed}  full if set to `true` the returned array will consist of the full node objects, otherwise - only IDs will be returned
		 * @return {Array}
		 */get_bottom_selected:function get_bottom_selected(full){var tmp=this.get_selected(true),obj=[],i,j;for(i = 0,j = tmp.length;i < j;i++) {if(!tmp[i].children.length){obj.push(tmp[i].id);}}return full?$.map(obj,$.proxy(function(i){return this.get_node(i);},this)):obj;}, /**
		 * gets the current state of the tree so that it can be restored later with `set_state(state)`. Used internally.
		 * @name get_state()
		 * @private
		 * @return {Object}
		 */get_state:function get_state(){var state={'core':{'open':[],'scroll':{'left':this.element.scrollLeft(),'top':this.element.scrollTop()}, /*!
					'themes' : {
						'name' : this.get_theme(),
						'icons' : this._data.core.themes.icons,
						'dots' : this._data.core.themes.dots
					},
					*/'selected':[]}},i;for(i in this._model.data) {if(this._model.data.hasOwnProperty(i)){if(i !== $.jstree.root){if(this._model.data[i].state.opened){state.core.open.push(i);}if(this._model.data[i].state.selected){state.core.selected.push(i);}}}}return state;}, /**
		 * sets the state of the tree. Used internally.
		 * @name set_state(state [, callback])
		 * @private
		 * @param {Object} state the state to restore. Keep in mind this object is passed by reference and jstree will modify it.
		 * @param {Function} callback an optional function to execute once the state is restored.
		 * @trigger set_state.jstree
		 */set_state:function set_state(state,callback){if(state){if(state.core){var res,n,t,_this,i;if(state.core.open){if(!$.isArray(state.core.open) || !state.core.open.length){delete state.core.open;this.set_state(state,callback);}else {this._load_nodes(state.core.open,function(nodes){this.open_node(nodes,false,0);delete state.core.open;this.set_state(state,callback);},true);}return false;}if(state.core.scroll){if(state.core.scroll && state.core.scroll.left !== undefined){this.element.scrollLeft(state.core.scroll.left);}if(state.core.scroll && state.core.scroll.top !== undefined){this.element.scrollTop(state.core.scroll.top);}delete state.core.scroll;this.set_state(state,callback);return false;}if(state.core.selected){_this = this;this.deselect_all();$.each(state.core.selected,function(i,v){_this.select_node(v,false,true);});delete state.core.selected;this.set_state(state,callback);return false;}for(i in state) {if(state.hasOwnProperty(i) && i !== "core" && $.inArray(i,this.settings.plugins) === -1){delete state[i];}}if($.isEmptyObject(state.core)){delete state.core;this.set_state(state,callback);return false;}}if($.isEmptyObject(state)){state = null;if(callback){callback.call(this);} /**
					 * triggered when a `set_state` call completes
					 * @event
					 * @name set_state.jstree
					 */this.trigger('set_state');return false;}return true;}return false;}, /**
		 * refreshes the tree - all nodes are reloaded with calls to `load_node`.
		 * @name refresh()
		 * @param {Boolean} skip_loading an option to skip showing the loading indicator
		 * @param {Mixed} forget_state if set to `true` state will not be reapplied, if set to a function (receiving the current state as argument) the result of that function will be used as state
		 * @trigger refresh.jstree
		 */refresh:function refresh(skip_loading,forget_state){this._data.core.state = forget_state === true?{}:this.get_state();if(forget_state && $.isFunction(forget_state)){this._data.core.state = forget_state.call(this,this._data.core.state);}this._cnt = 0;this._model.data = {};this._model.data[$.jstree.root] = {id:$.jstree.root,parent:null,parents:[],children:[],children_d:[],state:{loaded:false}};this._data.core.selected = [];this._data.core.last_clicked = null;this._data.core.focused = null;var c=this.get_container_ul()[0].className;if(!skip_loading){this.element.html("<" + "ul class='" + c + "' role='group'><" + "li class='jstree-initial-node jstree-loading jstree-leaf jstree-last' role='treeitem' id='j" + this._id + "_loading'><i class='jstree-icon jstree-ocl'></i><" + "a class='jstree-anchor' href='#'><i class='jstree-icon jstree-themeicon-hidden'></i>" + this.get_string("Loading ...") + "</a></li></ul>");this.element.attr('aria-activedescendant','j' + this._id + '_loading');}this.load_node($.jstree.root,function(o,s){if(s){this.get_container_ul()[0].className = c;if(this._firstChild(this.get_container_ul()[0])){this.element.attr('aria-activedescendant',this._firstChild(this.get_container_ul()[0]).id);}this.set_state($.extend(true,{},this._data.core.state),function(){ /**
						 * triggered when a `refresh` call completes
						 * @event
						 * @name refresh.jstree
						 */this.trigger('refresh');});}this._data.core.state = null;});}, /**
		 * refreshes a node in the tree (reload its children) all opened nodes inside that node are reloaded with calls to `load_node`.
		 * @name refresh_node(obj)
		 * @param  {mixed} obj the node
		 * @trigger refresh_node.jstree
		 */refresh_node:function refresh_node(obj){obj = this.get_node(obj);if(!obj || obj.id === $.jstree.root){return false;}var opened=[],to_load=[],s=this._data.core.selected.concat([]);to_load.push(obj.id);if(obj.state.opened === true){opened.push(obj.id);}this.get_node(obj,true).find('.jstree-open').each(function(){opened.push(this.id);});this._load_nodes(to_load,$.proxy(function(nodes){this.open_node(opened,false,0);this.select_node(this._data.core.selected); /**
				 * triggered when a node is refreshed
				 * @event
				 * @name refresh_node.jstree
				 * @param {Object} node - the refreshed node
				 * @param {Array} nodes - an array of the IDs of the nodes that were reloaded
				 */this.trigger('refresh_node',{'node':obj,'nodes':nodes});},this));}, /**
		 * set (change) the ID of a node
		 * @name set_id(obj, id)
		 * @param  {mixed} obj the node
		 * @param  {String} id the new ID
		 * @return {Boolean}
		 */set_id:function set_id(obj,id){obj = this.get_node(obj);if(!obj || obj.id === $.jstree.root){return false;}var i,j,m=this._model.data;id = id.toString(); // update parents (replace current ID with new one in children and children_d)
m[obj.parent].children[$.inArray(obj.id,m[obj.parent].children)] = id;for(i = 0,j = obj.parents.length;i < j;i++) {m[obj.parents[i]].children_d[$.inArray(obj.id,m[obj.parents[i]].children_d)] = id;} // update children (replace current ID with new one in parent and parents)
for(i = 0,j = obj.children.length;i < j;i++) {m[obj.children[i]].parent = id;}for(i = 0,j = obj.children_d.length;i < j;i++) {m[obj.children_d[i]].parents[$.inArray(obj.id,m[obj.children_d[i]].parents)] = id;}i = $.inArray(obj.id,this._data.core.selected);if(i !== -1){this._data.core.selected[i] = id;} // update model and obj itself (obj.id, this._model.data[KEY])
i = this.get_node(obj.id,true);if(i){i.attr('id',id).children('.jstree-anchor').attr('id',id + '_anchor').end().attr('aria-labelledby',id + '_anchor');if(this.element.attr('aria-activedescendant') === obj.id){this.element.attr('aria-activedescendant',id);}}delete m[obj.id];obj.id = id;obj.li_attr.id = id;m[id] = obj;return true;}, /**
		 * get the text value of a node
		 * @name get_text(obj)
		 * @param  {mixed} obj the node
		 * @return {String}
		 */get_text:function get_text(obj){obj = this.get_node(obj);return !obj || obj.id === $.jstree.root?false:obj.text;}, /**
		 * set the text value of a node. Used internally, please use `rename_node(obj, val)`.
		 * @private
		 * @name set_text(obj, val)
		 * @param  {mixed} obj the node, you can pass an array to set the text on multiple nodes
		 * @param  {String} val the new text value
		 * @return {Boolean}
		 * @trigger set_text.jstree
		 */set_text:function set_text(obj,val){var t1,t2;if($.isArray(obj)){obj = obj.slice();for(t1 = 0,t2 = obj.length;t1 < t2;t1++) {this.set_text(obj[t1],val);}return true;}obj = this.get_node(obj);if(!obj || obj.id === $.jstree.root){return false;}obj.text = val;if(this.get_node(obj,true).length){this.redraw_node(obj.id);} /**
			 * triggered when a node text value is changed
			 * @event
			 * @name set_text.jstree
			 * @param {Object} obj
			 * @param {String} text the new value
			 */this.trigger('set_text',{"obj":obj,"text":val});return true;}, /**
		 * gets a JSON representation of a node (or the whole tree)
		 * @name get_json([obj, options])
		 * @param  {mixed} obj
		 * @param  {Object} options
		 * @param  {Boolean} options.no_state do not return state information
		 * @param  {Boolean} options.no_id do not return ID
		 * @param  {Boolean} options.no_children do not include children
		 * @param  {Boolean} options.no_data do not include node data
		 * @param  {Boolean} options.flat return flat JSON instead of nested
		 * @return {Object}
		 */get_json:function get_json(obj,options,flat){obj = this.get_node(obj || $.jstree.root);if(!obj){return false;}if(options && options.flat && !flat){flat = [];}var tmp={'id':obj.id,'text':obj.text,'icon':this.get_icon(obj),'li_attr':$.extend(true,{},obj.li_attr),'a_attr':$.extend(true,{},obj.a_attr),'state':{},'data':options && options.no_data?false:$.extend(true,{},obj.data) //( this.get_node(obj, true).length ? this.get_node(obj, true).data() : obj.data ),
},i,j;if(options && options.flat){tmp.parent = obj.parent;}else {tmp.children = [];}if(!options || !options.no_state){for(i in obj.state) {if(obj.state.hasOwnProperty(i)){tmp.state[i] = obj.state[i];}}}if(options && options.no_id){delete tmp.id;if(tmp.li_attr && tmp.li_attr.id){delete tmp.li_attr.id;}if(tmp.a_attr && tmp.a_attr.id){delete tmp.a_attr.id;}}if(options && options.flat && obj.id !== $.jstree.root){flat.push(tmp);}if(!options || !options.no_children){for(i = 0,j = obj.children.length;i < j;i++) {if(options && options.flat){this.get_json(obj.children[i],options,flat);}else {tmp.children.push(this.get_json(obj.children[i],options));}}}return options && options.flat?flat:obj.id === $.jstree.root?tmp.children:tmp;}, /**
		 * create a new node (do not confuse with load_node)
		 * @name create_node([obj, node, pos, callback, is_loaded])
		 * @param  {mixed}   par       the parent node (to create a root node use either "#" (string) or `null`)
		 * @param  {mixed}   node      the data for the new node (a valid JSON object, or a simple string with the name)
		 * @param  {mixed}   pos       the index at which to insert the node, "first" and "last" are also supported, default is "last"
		 * @param  {Function} callback a function to be called once the node is created
		 * @param  {Boolean} is_loaded internal argument indicating if the parent node was succesfully loaded
		 * @return {String}            the ID of the newly create node
		 * @trigger model.jstree, create_node.jstree
		 */create_node:function create_node(par,node,pos,callback,is_loaded){if(par === null){par = $.jstree.root;}par = this.get_node(par);if(!par){return false;}pos = pos === undefined?"last":pos;if(!pos.toString().match(/^(before|after)$/) && !is_loaded && !this.is_loaded(par)){return this.load_node(par,function(){this.create_node(par,node,pos,callback,true);});}if(!node){node = {"text":this.get_string('New node')};}if(typeof node === "string"){node = {"text":node};}if(node.text === undefined){node.text = this.get_string('New node');}var tmp,dpc,i,j;if(par.id === $.jstree.root){if(pos === "before"){pos = "first";}if(pos === "after"){pos = "last";}}switch(pos){case "before":tmp = this.get_node(par.parent);pos = $.inArray(par.id,tmp.children);par = tmp;break;case "after":tmp = this.get_node(par.parent);pos = $.inArray(par.id,tmp.children) + 1;par = tmp;break;case "inside":case "first":pos = 0;break;case "last":pos = par.children.length;break;default:if(!pos){pos = 0;}break;}if(pos > par.children.length){pos = par.children.length;}if(!node.id){node.id = true;}if(!this.check("create_node",node,par,pos)){this.settings.core.error.call(this,this._data.core.last_error);return false;}if(node.id === true){delete node.id;}node = this._parse_model_from_json(node,par.id,par.parents.concat());if(!node){return false;}tmp = this.get_node(node);dpc = [];dpc.push(node);dpc = dpc.concat(tmp.children_d);this.trigger('model',{"nodes":dpc,"parent":par.id});par.children_d = par.children_d.concat(dpc);for(i = 0,j = par.parents.length;i < j;i++) {this._model.data[par.parents[i]].children_d = this._model.data[par.parents[i]].children_d.concat(dpc);}node = tmp;tmp = [];for(i = 0,j = par.children.length;i < j;i++) {tmp[i >= pos?i + 1:i] = par.children[i];}tmp[pos] = node.id;par.children = tmp;this.redraw_node(par,true);if(callback){callback.call(this,this.get_node(node));} /**
			 * triggered when a node is created
			 * @event
			 * @name create_node.jstree
			 * @param {Object} node
			 * @param {String} parent the parent's ID
			 * @param {Number} position the position of the new node among the parent's children
			 */this.trigger('create_node',{"node":this.get_node(node),"parent":par.id,"position":pos});return node.id;}, /**
		 * set the text value of a node
		 * @name rename_node(obj, val)
		 * @param  {mixed} obj the node, you can pass an array to rename multiple nodes to the same name
		 * @param  {String} val the new text value
		 * @return {Boolean}
		 * @trigger rename_node.jstree
		 */rename_node:function rename_node(obj,val){var t1,t2,old;if($.isArray(obj)){obj = obj.slice();for(t1 = 0,t2 = obj.length;t1 < t2;t1++) {this.rename_node(obj[t1],val);}return true;}obj = this.get_node(obj);if(!obj || obj.id === $.jstree.root){return false;}old = obj.text;if(!this.check("rename_node",obj,this.get_parent(obj),val)){this.settings.core.error.call(this,this._data.core.last_error);return false;}this.set_text(obj,val); // .apply(this, Array.prototype.slice.call(arguments))
/**
			 * triggered when a node is renamed
			 * @event
			 * @name rename_node.jstree
			 * @param {Object} node
			 * @param {String} text the new value
			 * @param {String} old the old value
			 */this.trigger('rename_node',{"node":obj,"text":val,"old":old});return true;}, /**
		 * remove a node
		 * @name delete_node(obj)
		 * @param  {mixed} obj the node, you can pass an array to delete multiple nodes
		 * @return {Boolean}
		 * @trigger delete_node.jstree, changed.jstree
		 */delete_node:function delete_node(obj){var t1,t2,par,pos,tmp,i,j,k,l,c,top,lft;if($.isArray(obj)){obj = obj.slice();for(t1 = 0,t2 = obj.length;t1 < t2;t1++) {this.delete_node(obj[t1]);}return true;}obj = this.get_node(obj);if(!obj || obj.id === $.jstree.root){return false;}par = this.get_node(obj.parent);pos = $.inArray(obj.id,par.children);c = false;if(!this.check("delete_node",obj,par,pos)){this.settings.core.error.call(this,this._data.core.last_error);return false;}if(pos !== -1){par.children = $.vakata.array_remove(par.children,pos);}tmp = obj.children_d.concat([]);tmp.push(obj.id);for(k = 0,l = tmp.length;k < l;k++) {for(i = 0,j = obj.parents.length;i < j;i++) {pos = $.inArray(tmp[k],this._model.data[obj.parents[i]].children_d);if(pos !== -1){this._model.data[obj.parents[i]].children_d = $.vakata.array_remove(this._model.data[obj.parents[i]].children_d,pos);}}if(this._model.data[tmp[k]].state.selected){c = true;pos = $.inArray(tmp[k],this._data.core.selected);if(pos !== -1){this._data.core.selected = $.vakata.array_remove(this._data.core.selected,pos);}}} /**
			 * triggered when a node is deleted
			 * @event
			 * @name delete_node.jstree
			 * @param {Object} node
			 * @param {String} parent the parent's ID
			 */this.trigger('delete_node',{"node":obj,"parent":par.id});if(c){this.trigger('changed',{'action':'delete_node','node':obj,'selected':this._data.core.selected,'parent':par.id});}for(k = 0,l = tmp.length;k < l;k++) {delete this._model.data[tmp[k]];}if($.inArray(this._data.core.focused,tmp) !== -1){this._data.core.focused = null;top = this.element[0].scrollTop;lft = this.element[0].scrollLeft;if(par.id === $.jstree.root){this.get_node(this._model.data[$.jstree.root].children[0],true).children('.jstree-anchor').focus();}else {this.get_node(par,true).children('.jstree-anchor').focus();}this.element[0].scrollTop = top;this.element[0].scrollLeft = lft;}this.redraw_node(par,true);return true;}, /**
		 * check if an operation is premitted on the tree. Used internally.
		 * @private
		 * @name check(chk, obj, par, pos)
		 * @param  {String} chk the operation to check, can be "create_node", "rename_node", "delete_node", "copy_node" or "move_node"
		 * @param  {mixed} obj the node
		 * @param  {mixed} par the parent
		 * @param  {mixed} pos the position to insert at, or if "rename_node" - the new name
		 * @param  {mixed} more some various additional information, for example if a "move_node" operations is triggered by DND this will be the hovered node
		 * @return {Boolean}
		 */check:function check(chk,obj,par,pos,more){obj = obj && obj.id?obj:this.get_node(obj);par = par && par.id?par:this.get_node(par);var tmp=chk.match(/^move_node|copy_node|create_node$/i)?par:obj,chc=this.settings.core.check_callback;if(chk === "move_node" || chk === "copy_node"){if((!more || !more.is_multi) && (obj.id === par.id || $.inArray(obj.id,par.children) === pos || $.inArray(par.id,obj.children_d) !== -1)){this._data.core.last_error = {'error':'check','plugin':'core','id':'core_01','reason':'Moving parent inside child','data':JSON.stringify({'chk':chk,'pos':pos,'obj':obj && obj.id?obj.id:false,'par':par && par.id?par.id:false})};return false;}}if(tmp && tmp.data){tmp = tmp.data;}if(tmp && tmp.functions && (tmp.functions[chk] === false || tmp.functions[chk] === true)){if(tmp.functions[chk] === false){this._data.core.last_error = {'error':'check','plugin':'core','id':'core_02','reason':'Node data prevents function: ' + chk,'data':JSON.stringify({'chk':chk,'pos':pos,'obj':obj && obj.id?obj.id:false,'par':par && par.id?par.id:false})};}return tmp.functions[chk];}if(chc === false || $.isFunction(chc) && chc.call(this,chk,obj,par,pos,more) === false || chc && chc[chk] === false){this._data.core.last_error = {'error':'check','plugin':'core','id':'core_03','reason':'User config for core.check_callback prevents function: ' + chk,'data':JSON.stringify({'chk':chk,'pos':pos,'obj':obj && obj.id?obj.id:false,'par':par && par.id?par.id:false})};return false;}return true;}, /**
		 * get the last error
		 * @name last_error()
		 * @return {Object}
		 */last_error:function last_error(){return this._data.core.last_error;}, /**
		 * move a node to a new parent
		 * @name move_node(obj, par [, pos, callback, is_loaded])
		 * @param  {mixed} obj the node to move, pass an array to move multiple nodes
		 * @param  {mixed} par the new parent
		 * @param  {mixed} pos the position to insert at (besides integer values, "first" and "last" are supported, as well as "before" and "after"), defaults to integer `0`
		 * @param  {function} callback a function to call once the move is completed, receives 3 arguments - the node, the new parent and the position
		 * @param  {Boolean} is_loaded internal parameter indicating if the parent node has been loaded
		 * @param  {Boolean} skip_redraw internal parameter indicating if the tree should be redrawn
		 * @param  {Boolean} instance internal parameter indicating if the node comes from another instance
		 * @trigger move_node.jstree
		 */move_node:function move_node(obj,par,pos,callback,is_loaded,skip_redraw,origin){var t1,t2,old_par,old_pos,new_par,old_ins,is_multi,dpc,tmp,i,j,k,l,p;par = this.get_node(par);pos = pos === undefined?0:pos;if(!par){return false;}if(!pos.toString().match(/^(before|after)$/) && !is_loaded && !this.is_loaded(par)){return this.load_node(par,function(){this.move_node(obj,par,pos,callback,true,false,origin);});}if($.isArray(obj)){if(obj.length === 1){obj = obj[0];}else { //obj = obj.slice();
for(t1 = 0,t2 = obj.length;t1 < t2;t1++) {if(tmp = this.move_node(obj[t1],par,pos,callback,is_loaded,false,origin)){par = tmp;pos = "after";}}this.redraw();return true;}}obj = obj && obj.id?obj:this.get_node(obj);if(!obj || obj.id === $.jstree.root){return false;}old_par = (obj.parent || $.jstree.root).toString();new_par = !pos.toString().match(/^(before|after)$/) || par.id === $.jstree.root?par:this.get_node(par.parent);old_ins = origin?origin:this._model.data[obj.id]?this:$.jstree.reference(obj.id);is_multi = !old_ins || !old_ins._id || this._id !== old_ins._id;old_pos = old_ins && old_ins._id && old_par && old_ins._model.data[old_par] && old_ins._model.data[old_par].children?$.inArray(obj.id,old_ins._model.data[old_par].children):-1;if(old_ins && old_ins._id){obj = old_ins._model.data[obj.id];}if(is_multi){if(tmp = this.copy_node(obj,par,pos,callback,is_loaded,false,origin)){if(old_ins){old_ins.delete_node(obj);}return tmp;}return false;} //var m = this._model.data;
if(par.id === $.jstree.root){if(pos === "before"){pos = "first";}if(pos === "after"){pos = "last";}}switch(pos){case "before":pos = $.inArray(par.id,new_par.children);break;case "after":pos = $.inArray(par.id,new_par.children) + 1;break;case "inside":case "first":pos = 0;break;case "last":pos = new_par.children.length;break;default:if(!pos){pos = 0;}break;}if(pos > new_par.children.length){pos = new_par.children.length;}if(!this.check("move_node",obj,new_par,pos,{'core':true,'origin':origin,'is_multi':old_ins && old_ins._id && old_ins._id !== this._id,'is_foreign':!old_ins || !old_ins._id})){this.settings.core.error.call(this,this._data.core.last_error);return false;}if(obj.parent === new_par.id){dpc = new_par.children.concat();tmp = $.inArray(obj.id,dpc);if(tmp !== -1){dpc = $.vakata.array_remove(dpc,tmp);if(pos > tmp){pos--;}}tmp = [];for(i = 0,j = dpc.length;i < j;i++) {tmp[i >= pos?i + 1:i] = dpc[i];}tmp[pos] = obj.id;new_par.children = tmp;this._node_changed(new_par.id);this.redraw(new_par.id === $.jstree.root);}else { // clean old parent and up
tmp = obj.children_d.concat();tmp.push(obj.id);for(i = 0,j = obj.parents.length;i < j;i++) {dpc = [];p = old_ins._model.data[obj.parents[i]].children_d;for(k = 0,l = p.length;k < l;k++) {if($.inArray(p[k],tmp) === -1){dpc.push(p[k]);}}old_ins._model.data[obj.parents[i]].children_d = dpc;}old_ins._model.data[old_par].children = $.vakata.array_remove_item(old_ins._model.data[old_par].children,obj.id); // insert into new parent and up
for(i = 0,j = new_par.parents.length;i < j;i++) {this._model.data[new_par.parents[i]].children_d = this._model.data[new_par.parents[i]].children_d.concat(tmp);}dpc = [];for(i = 0,j = new_par.children.length;i < j;i++) {dpc[i >= pos?i + 1:i] = new_par.children[i];}dpc[pos] = obj.id;new_par.children = dpc;new_par.children_d.push(obj.id);new_par.children_d = new_par.children_d.concat(obj.children_d); // update object
obj.parent = new_par.id;tmp = new_par.parents.concat();tmp.unshift(new_par.id);p = obj.parents.length;obj.parents = tmp; // update object children
tmp = tmp.concat();for(i = 0,j = obj.children_d.length;i < j;i++) {this._model.data[obj.children_d[i]].parents = this._model.data[obj.children_d[i]].parents.slice(0,p * -1);Array.prototype.push.apply(this._model.data[obj.children_d[i]].parents,tmp);}if(old_par === $.jstree.root || new_par.id === $.jstree.root){this._model.force_full_redraw = true;}if(!this._model.force_full_redraw){this._node_changed(old_par);this._node_changed(new_par.id);}if(!skip_redraw){this.redraw();}}if(callback){callback.call(this,obj,new_par,pos);} /**
			 * triggered when a node is moved
			 * @event
			 * @name move_node.jstree
			 * @param {Object} node
			 * @param {String} parent the parent's ID
			 * @param {Number} position the position of the node among the parent's children
			 * @param {String} old_parent the old parent of the node
			 * @param {Number} old_position the old position of the node
			 * @param {Boolean} is_multi do the node and new parent belong to different instances
			 * @param {jsTree} old_instance the instance the node came from
			 * @param {jsTree} new_instance the instance of the new parent
			 */this.trigger('move_node',{"node":obj,"parent":new_par.id,"position":pos,"old_parent":old_par,"old_position":old_pos,'is_multi':old_ins && old_ins._id && old_ins._id !== this._id,'is_foreign':!old_ins || !old_ins._id,'old_instance':old_ins,'new_instance':this});return obj.id;}, /**
		 * copy a node to a new parent
		 * @name copy_node(obj, par [, pos, callback, is_loaded])
		 * @param  {mixed} obj the node to copy, pass an array to copy multiple nodes
		 * @param  {mixed} par the new parent
		 * @param  {mixed} pos the position to insert at (besides integer values, "first" and "last" are supported, as well as "before" and "after"), defaults to integer `0`
		 * @param  {function} callback a function to call once the move is completed, receives 3 arguments - the node, the new parent and the position
		 * @param  {Boolean} is_loaded internal parameter indicating if the parent node has been loaded
		 * @param  {Boolean} skip_redraw internal parameter indicating if the tree should be redrawn
		 * @param  {Boolean} instance internal parameter indicating if the node comes from another instance
		 * @trigger model.jstree copy_node.jstree
		 */copy_node:function copy_node(obj,par,pos,callback,is_loaded,skip_redraw,origin){var t1,t2,dpc,tmp,i,j,node,old_par,new_par,old_ins,is_multi;par = this.get_node(par);pos = pos === undefined?0:pos;if(!par){return false;}if(!pos.toString().match(/^(before|after)$/) && !is_loaded && !this.is_loaded(par)){return this.load_node(par,function(){this.copy_node(obj,par,pos,callback,true,false,origin);});}if($.isArray(obj)){if(obj.length === 1){obj = obj[0];}else { //obj = obj.slice();
for(t1 = 0,t2 = obj.length;t1 < t2;t1++) {if(tmp = this.copy_node(obj[t1],par,pos,callback,is_loaded,true,origin)){par = tmp;pos = "after";}}this.redraw();return true;}}obj = obj && obj.id?obj:this.get_node(obj);if(!obj || obj.id === $.jstree.root){return false;}old_par = (obj.parent || $.jstree.root).toString();new_par = !pos.toString().match(/^(before|after)$/) || par.id === $.jstree.root?par:this.get_node(par.parent);old_ins = origin?origin:this._model.data[obj.id]?this:$.jstree.reference(obj.id);is_multi = !old_ins || !old_ins._id || this._id !== old_ins._id;if(old_ins && old_ins._id){obj = old_ins._model.data[obj.id];}if(par.id === $.jstree.root){if(pos === "before"){pos = "first";}if(pos === "after"){pos = "last";}}switch(pos){case "before":pos = $.inArray(par.id,new_par.children);break;case "after":pos = $.inArray(par.id,new_par.children) + 1;break;case "inside":case "first":pos = 0;break;case "last":pos = new_par.children.length;break;default:if(!pos){pos = 0;}break;}if(pos > new_par.children.length){pos = new_par.children.length;}if(!this.check("copy_node",obj,new_par,pos,{'core':true,'origin':origin,'is_multi':old_ins && old_ins._id && old_ins._id !== this._id,'is_foreign':!old_ins || !old_ins._id})){this.settings.core.error.call(this,this._data.core.last_error);return false;}node = old_ins?old_ins.get_json(obj,{no_id:true,no_data:true,no_state:true}):obj;if(!node){return false;}if(node.id === true){delete node.id;}node = this._parse_model_from_json(node,new_par.id,new_par.parents.concat());if(!node){return false;}tmp = this.get_node(node);if(obj && obj.state && obj.state.loaded === false){tmp.state.loaded = false;}dpc = [];dpc.push(node);dpc = dpc.concat(tmp.children_d);this.trigger('model',{"nodes":dpc,"parent":new_par.id}); // insert into new parent and up
for(i = 0,j = new_par.parents.length;i < j;i++) {this._model.data[new_par.parents[i]].children_d = this._model.data[new_par.parents[i]].children_d.concat(dpc);}dpc = [];for(i = 0,j = new_par.children.length;i < j;i++) {dpc[i >= pos?i + 1:i] = new_par.children[i];}dpc[pos] = tmp.id;new_par.children = dpc;new_par.children_d.push(tmp.id);new_par.children_d = new_par.children_d.concat(tmp.children_d);if(new_par.id === $.jstree.root){this._model.force_full_redraw = true;}if(!this._model.force_full_redraw){this._node_changed(new_par.id);}if(!skip_redraw){this.redraw(new_par.id === $.jstree.root);}if(callback){callback.call(this,tmp,new_par,pos);} /**
			 * triggered when a node is copied
			 * @event
			 * @name copy_node.jstree
			 * @param {Object} node the copied node
			 * @param {Object} original the original node
			 * @param {String} parent the parent's ID
			 * @param {Number} position the position of the node among the parent's children
			 * @param {String} old_parent the old parent of the node
			 * @param {Number} old_position the position of the original node
			 * @param {Boolean} is_multi do the node and new parent belong to different instances
			 * @param {jsTree} old_instance the instance the node came from
			 * @param {jsTree} new_instance the instance of the new parent
			 */this.trigger('copy_node',{"node":tmp,"original":obj,"parent":new_par.id,"position":pos,"old_parent":old_par,"old_position":old_ins && old_ins._id && old_par && old_ins._model.data[old_par] && old_ins._model.data[old_par].children?$.inArray(obj.id,old_ins._model.data[old_par].children):-1,'is_multi':old_ins && old_ins._id && old_ins._id !== this._id,'is_foreign':!old_ins || !old_ins._id,'old_instance':old_ins,'new_instance':this});return tmp.id;}, /**
		 * cut a node (a later call to `paste(obj)` would move the node)
		 * @name cut(obj)
		 * @param  {mixed} obj multiple objects can be passed using an array
		 * @trigger cut.jstree
		 */cut:function cut(obj){if(!obj){obj = this._data.core.selected.concat();}if(!$.isArray(obj)){obj = [obj];}if(!obj.length){return false;}var tmp=[],o,t1,t2;for(t1 = 0,t2 = obj.length;t1 < t2;t1++) {o = this.get_node(obj[t1]);if(o && o.id && o.id !== $.jstree.root){tmp.push(o);}}if(!tmp.length){return false;}ccp_node = tmp;ccp_inst = this;ccp_mode = 'move_node'; /**
			 * triggered when nodes are added to the buffer for moving
			 * @event
			 * @name cut.jstree
			 * @param {Array} node
			 */this.trigger('cut',{"node":obj});}, /**
		 * copy a node (a later call to `paste(obj)` would copy the node)
		 * @name copy(obj)
		 * @param  {mixed} obj multiple objects can be passed using an array
		 * @trigger copy.jstree
		 */copy:function copy(obj){if(!obj){obj = this._data.core.selected.concat();}if(!$.isArray(obj)){obj = [obj];}if(!obj.length){return false;}var tmp=[],o,t1,t2;for(t1 = 0,t2 = obj.length;t1 < t2;t1++) {o = this.get_node(obj[t1]);if(o && o.id && o.id !== $.jstree.root){tmp.push(o);}}if(!tmp.length){return false;}ccp_node = tmp;ccp_inst = this;ccp_mode = 'copy_node'; /**
			 * triggered when nodes are added to the buffer for copying
			 * @event
			 * @name copy.jstree
			 * @param {Array} node
			 */this.trigger('copy',{"node":obj});}, /**
		 * get the current buffer (any nodes that are waiting for a paste operation)
		 * @name get_buffer()
		 * @return {Object} an object consisting of `mode` ("copy_node" or "move_node"), `node` (an array of objects) and `inst` (the instance)
		 */get_buffer:function get_buffer(){return {'mode':ccp_mode,'node':ccp_node,'inst':ccp_inst};}, /**
		 * check if there is something in the buffer to paste
		 * @name can_paste()
		 * @return {Boolean}
		 */can_paste:function can_paste(){return ccp_mode !== false && ccp_node !== false; // && ccp_inst._model.data[ccp_node];
}, /**
		 * copy or move the previously cut or copied nodes to a new parent
		 * @name paste(obj [, pos])
		 * @param  {mixed} obj the new parent
		 * @param  {mixed} pos the position to insert at (besides integer, "first" and "last" are supported), defaults to integer `0`
		 * @trigger paste.jstree
		 */paste:function paste(obj,pos){obj = this.get_node(obj);if(!obj || !ccp_mode || !ccp_mode.match(/^(copy_node|move_node)$/) || !ccp_node){return false;}if(this[ccp_mode](ccp_node,obj,pos,false,false,false,ccp_inst)){ /**
				 * triggered when paste is invoked
				 * @event
				 * @name paste.jstree
				 * @param {String} parent the ID of the receiving node
				 * @param {Array} node the nodes in the buffer
				 * @param {String} mode the performed operation - "copy_node" or "move_node"
				 */this.trigger('paste',{"parent":obj.id,"node":ccp_node,"mode":ccp_mode});}ccp_node = false;ccp_mode = false;ccp_inst = false;}, /**
		 * clear the buffer of previously copied or cut nodes
		 * @name clear_buffer()
		 * @trigger clear_buffer.jstree
		 */clear_buffer:function clear_buffer(){ccp_node = false;ccp_mode = false;ccp_inst = false; /**
			 * triggered when the copy / cut buffer is cleared
			 * @event
			 * @name clear_buffer.jstree
			 */this.trigger('clear_buffer');}, /**
		 * put a node in edit mode (input field to rename the node)
		 * @name edit(obj [, default_text, callback])
		 * @param  {mixed} obj
		 * @param  {String} default_text the text to populate the input with (if omitted or set to a non-string value the node's text value is used)
		 * @param  {Function} callback a function to be called once the text box is blurred, it is called in the instance's scope and receives the node, a status parameter (true if the rename is successful, false otherwise) and a boolean indicating if the user cancelled the edit. You can access the node's title using .text
		 */edit:function edit(obj,default_text,callback){var rtl,w,a,s,t,h1,h2,fn,tmp,cancel=false;obj = this.get_node(obj);if(!obj){return false;}if(this.settings.core.check_callback === false){this._data.core.last_error = {'error':'check','plugin':'core','id':'core_07','reason':'Could not edit node because of check_callback'};this.settings.core.error.call(this,this._data.core.last_error);return false;}tmp = obj;default_text = typeof default_text === 'string'?default_text:obj.text;this.set_text(obj,"");obj = this._open_to(obj);tmp.text = default_text;rtl = this._data.core.rtl;w = this.element.width();this._data.core.focused = tmp.id;a = obj.children('.jstree-anchor').focus();s = $('<span>'); /*!
			oi = obj.children("i:visible"),
			ai = a.children("i:visible"),
			w1 = oi.width() * oi.length,
			w2 = ai.width() * ai.length,
			*/t = default_text;h1 = $("<" + "div />",{css:{"position":"absolute","top":"-200px","left":rtl?"0px":"-1000px","visibility":"hidden"}}).appendTo("body");h2 = $("<" + "input />",{"value":t,"class":"jstree-rename-input", // "size" : t.length,
"css":{"padding":"0","border":"1px solid silver","box-sizing":"border-box","display":"inline-block","height":this._data.core.li_height + "px","lineHeight":this._data.core.li_height + "px","width":"150px" // will be set a bit further down
},"blur":$.proxy(function(e){e.stopImmediatePropagation();e.preventDefault();var i=s.children(".jstree-rename-input"),v=i.val(),f=this.settings.core.force_text,nv;if(v === ""){v = t;}h1.remove();s.replaceWith(a);s.remove();t = f?t:$('<div></div>').append($.parseHTML(t)).html();this.set_text(obj,t);nv = !!this.rename_node(obj,f?$('<div></div>').text(v).text():$('<div></div>').append($.parseHTML(v)).html());if(!nv){this.set_text(obj,t); // move this up? and fix #483
}this._data.core.focused = tmp.id;setTimeout($.proxy(function(){var node=this.get_node(tmp.id,true);if(node.length){this._data.core.focused = tmp.id;node.children('.jstree-anchor').focus();}},this),0);if(callback){callback.call(this,tmp,nv,cancel);}},this),"keydown":function keydown(e){var key=e.which;if(key === 27){cancel = true;this.value = t;}if(key === 27 || key === 13 || key === 37 || key === 38 || key === 39 || key === 40 || key === 32){e.stopImmediatePropagation();}if(key === 27 || key === 13){e.preventDefault();this.blur();}},"click":function click(e){e.stopImmediatePropagation();},"mousedown":function mousedown(e){e.stopImmediatePropagation();},"keyup":function keyup(e){h2.width(Math.min(h1.text("pW" + this.value).width(),w));},"keypress":function keypress(e){if(e.which === 13){return false;}}});fn = {fontFamily:a.css('fontFamily') || '',fontSize:a.css('fontSize') || '',fontWeight:a.css('fontWeight') || '',fontStyle:a.css('fontStyle') || '',fontStretch:a.css('fontStretch') || '',fontVariant:a.css('fontVariant') || '',letterSpacing:a.css('letterSpacing') || '',wordSpacing:a.css('wordSpacing') || ''};s.attr('class',a.attr('class')).append(a.contents().clone()).append(h2);a.replaceWith(s);h1.css(fn);h2.css(fn).width(Math.min(h1.text("pW" + h2[0].value).width(),w))[0].select();}, /**
		 * changes the theme
		 * @name set_theme(theme_name [, theme_url])
		 * @param {String} theme_name the name of the new theme to apply
		 * @param {mixed} theme_url  the location of the CSS file for this theme. Omit or set to `false` if you manually included the file. Set to `true` to autoload from the `core.themes.dir` directory.
		 * @trigger set_theme.jstree
		 */set_theme:function set_theme(theme_name,theme_url){if(!theme_name){return false;}if(theme_url === true){var dir=this.settings.core.themes.dir;if(!dir){dir = $.jstree.path + '/themes';}theme_url = dir + '/' + theme_name + '/style.css';}if(theme_url && $.inArray(theme_url,themes_loaded) === -1){$('head').append('<' + 'link rel="stylesheet" href="' + theme_url + '" type="text/css" />');themes_loaded.push(theme_url);}if(this._data.core.themes.name){this.element.removeClass('jstree-' + this._data.core.themes.name);}this._data.core.themes.name = theme_name;this.element.addClass('jstree-' + theme_name);this.element[this.settings.core.themes.responsive?'addClass':'removeClass']('jstree-' + theme_name + '-responsive'); /**
			 * triggered when a theme is set
			 * @event
			 * @name set_theme.jstree
			 * @param {String} theme the new theme
			 */this.trigger('set_theme',{'theme':theme_name});}, /**
		 * gets the name of the currently applied theme name
		 * @name get_theme()
		 * @return {String}
		 */get_theme:function get_theme(){return this._data.core.themes.name;}, /**
		 * changes the theme variant (if the theme has variants)
		 * @name set_theme_variant(variant_name)
		 * @param {String|Boolean} variant_name the variant to apply (if `false` is used the current variant is removed)
		 */set_theme_variant:function set_theme_variant(variant_name){if(this._data.core.themes.variant){this.element.removeClass('jstree-' + this._data.core.themes.name + '-' + this._data.core.themes.variant);}this._data.core.themes.variant = variant_name;if(variant_name){this.element.addClass('jstree-' + this._data.core.themes.name + '-' + this._data.core.themes.variant);}}, /**
		 * gets the name of the currently applied theme variant
		 * @name get_theme()
		 * @return {String}
		 */get_theme_variant:function get_theme_variant(){return this._data.core.themes.variant;}, /**
		 * shows a striped background on the container (if the theme supports it)
		 * @name show_stripes()
		 */show_stripes:function show_stripes(){this._data.core.themes.stripes = true;this.get_container_ul().addClass("jstree-striped");}, /**
		 * hides the striped background on the container
		 * @name hide_stripes()
		 */hide_stripes:function hide_stripes(){this._data.core.themes.stripes = false;this.get_container_ul().removeClass("jstree-striped");}, /**
		 * toggles the striped background on the container
		 * @name toggle_stripes()
		 */toggle_stripes:function toggle_stripes(){if(this._data.core.themes.stripes){this.hide_stripes();}else {this.show_stripes();}}, /**
		 * shows the connecting dots (if the theme supports it)
		 * @name show_dots()
		 */show_dots:function show_dots(){this._data.core.themes.dots = true;this.get_container_ul().removeClass("jstree-no-dots");}, /**
		 * hides the connecting dots
		 * @name hide_dots()
		 */hide_dots:function hide_dots(){this._data.core.themes.dots = false;this.get_container_ul().addClass("jstree-no-dots");}, /**
		 * toggles the connecting dots
		 * @name toggle_dots()
		 */toggle_dots:function toggle_dots(){if(this._data.core.themes.dots){this.hide_dots();}else {this.show_dots();}}, /**
		 * show the node icons
		 * @name show_icons()
		 */show_icons:function show_icons(){this._data.core.themes.icons = true;this.get_container_ul().removeClass("jstree-no-icons");}, /**
		 * hide the node icons
		 * @name hide_icons()
		 */hide_icons:function hide_icons(){this._data.core.themes.icons = false;this.get_container_ul().addClass("jstree-no-icons");}, /**
		 * toggle the node icons
		 * @name toggle_icons()
		 */toggle_icons:function toggle_icons(){if(this._data.core.themes.icons){this.hide_icons();}else {this.show_icons();}}, /**
		 * set the node icon for a node
		 * @name set_icon(obj, icon)
		 * @param {mixed} obj
		 * @param {String} icon the new icon - can be a path to an icon or a className, if using an image that is in the current directory use a `./` prefix, otherwise it will be detected as a class
		 */set_icon:function set_icon(obj,icon){var t1,t2,dom,old;if($.isArray(obj)){obj = obj.slice();for(t1 = 0,t2 = obj.length;t1 < t2;t1++) {this.set_icon(obj[t1],icon);}return true;}obj = this.get_node(obj);if(!obj || obj.id === $.jstree.root){return false;}old = obj.icon;obj.icon = icon === true || icon === null || icon === undefined || icon === ''?true:icon;dom = this.get_node(obj,true).children(".jstree-anchor").children(".jstree-themeicon");if(icon === false){this.hide_icon(obj);}else if(icon === true || icon === null || icon === undefined || icon === ''){dom.removeClass('jstree-themeicon-custom ' + old).css("background","").removeAttr("rel");if(old === false){this.show_icon(obj);}}else if(icon.indexOf("/") === -1 && icon.indexOf(".") === -1){dom.removeClass(old).css("background","");dom.addClass(icon + ' jstree-themeicon-custom').attr("rel",icon);if(old === false){this.show_icon(obj);}}else {dom.removeClass(old).css("background","");dom.addClass('jstree-themeicon-custom').css("background","url('" + icon + "') center center no-repeat").attr("rel",icon);if(old === false){this.show_icon(obj);}}return true;}, /**
		 * get the node icon for a node
		 * @name get_icon(obj)
		 * @param {mixed} obj
		 * @return {String}
		 */get_icon:function get_icon(obj){obj = this.get_node(obj);return !obj || obj.id === $.jstree.root?false:obj.icon;}, /**
		 * hide the icon on an individual node
		 * @name hide_icon(obj)
		 * @param {mixed} obj
		 */hide_icon:function hide_icon(obj){var t1,t2;if($.isArray(obj)){obj = obj.slice();for(t1 = 0,t2 = obj.length;t1 < t2;t1++) {this.hide_icon(obj[t1]);}return true;}obj = this.get_node(obj);if(!obj || obj === $.jstree.root){return false;}obj.icon = false;this.get_node(obj,true).children(".jstree-anchor").children(".jstree-themeicon").addClass('jstree-themeicon-hidden');return true;}, /**
		 * show the icon on an individual node
		 * @name show_icon(obj)
		 * @param {mixed} obj
		 */show_icon:function show_icon(obj){var t1,t2,dom;if($.isArray(obj)){obj = obj.slice();for(t1 = 0,t2 = obj.length;t1 < t2;t1++) {this.show_icon(obj[t1]);}return true;}obj = this.get_node(obj);if(!obj || obj === $.jstree.root){return false;}dom = this.get_node(obj,true);obj.icon = dom.length?dom.children(".jstree-anchor").children(".jstree-themeicon").attr('rel'):true;if(!obj.icon){obj.icon = true;}dom.children(".jstree-anchor").children(".jstree-themeicon").removeClass('jstree-themeicon-hidden');return true;}}; // helpers
$.vakata = {}; // collect attributes
$.vakata.attributes = function(node,with_values){node = $(node)[0];var attr=with_values?{}:[];if(node && node.attributes){$.each(node.attributes,function(i,v){if($.inArray(v.name.toLowerCase(),['style','contenteditable','hasfocus','tabindex']) !== -1){return;}if(v.value !== null && $.trim(v.value) !== ''){if(with_values){attr[v.name] = v.value;}else {attr.push(v.name);}}});}return attr;};$.vakata.array_unique = function(array){var a=[],i,j,l,o={};for(i = 0,l = array.length;i < l;i++) {if(o[array[i]] === undefined){a.push(array[i]);o[array[i]] = true;}}return a;}; // remove item from array
$.vakata.array_remove = function(array,from,to){var rest=array.slice((to || from) + 1 || array.length);array.length = from < 0?array.length + from:from;array.push.apply(array,rest);return array;}; // remove item from array
$.vakata.array_remove_item = function(array,item){var tmp=$.inArray(item,array);return tmp !== -1?$.vakata.array_remove(array,tmp):array;}; /**
 * ### Changed plugin
 *
 * This plugin adds more information to the `changed.jstree` event. The new data is contained in the `changed` event data property, and contains a lists of `selected` and `deselected` nodes.
 */$.jstree.plugins.changed = function(options,parent){var last=[];this.trigger = function(ev,data){var i,j;if(!data){data = {};}if(ev.replace('.jstree','') === 'changed'){data.changed = {selected:[],deselected:[]};var tmp={};for(i = 0,j = last.length;i < j;i++) {tmp[last[i]] = 1;}for(i = 0,j = data.selected.length;i < j;i++) {if(!tmp[data.selected[i]]){data.changed.selected.push(data.selected[i]);}else {tmp[data.selected[i]] = 2;}}for(i = 0,j = last.length;i < j;i++) {if(tmp[last[i]] === 1){data.changed.deselected.push(last[i]);}}last = data.selected.slice();} /**
			 * triggered when selection changes (the "changed" plugin enhances the original event with more data)
			 * @event
			 * @name changed.jstree
			 * @param {Object} node
			 * @param {Object} action the action that caused the selection to change
			 * @param {Array} selected the current selection
			 * @param {Object} changed an object containing two properties `selected` and `deselected` - both arrays of node IDs, which were selected or deselected since the last changed event
			 * @param {Object} event the event (if any) that triggered this changed event
			 * @plugin changed
			 */parent.trigger.call(this,ev,data);};this.refresh = function(skip_loading,forget_state){last = [];return parent.refresh.apply(this,arguments);};}; /**
 * ### Checkbox plugin
 *
 * This plugin renders checkbox icons in front of each node, making multiple selection much easier.
 * It also supports tri-state behavior, meaning that if a node has a few of its children checked it will be rendered as undetermined, and state will be propagated up.
 */var _i=document.createElement('I');_i.className = 'jstree-icon jstree-checkbox';_i.setAttribute('role','presentation'); /**
	 * stores all defaults for the checkbox plugin
	 * @name $.jstree.defaults.checkbox
	 * @plugin checkbox
	 */$.jstree.defaults.checkbox = { /**
		 * a boolean indicating if checkboxes should be visible (can be changed at a later time using `show_checkboxes()` and `hide_checkboxes`). Defaults to `true`.
		 * @name $.jstree.defaults.checkbox.visible
		 * @plugin checkbox
		 */visible:true, /**
		 * a boolean indicating if checkboxes should cascade down and have an undetermined state. Defaults to `true`.
		 * @name $.jstree.defaults.checkbox.three_state
		 * @plugin checkbox
		 */three_state:true, /**
		 * a boolean indicating if clicking anywhere on the node should act as clicking on the checkbox. Defaults to `true`.
		 * @name $.jstree.defaults.checkbox.whole_node
		 * @plugin checkbox
		 */whole_node:true, /**
		 * a boolean indicating if the selected style of a node should be kept, or removed. Defaults to `true`.
		 * @name $.jstree.defaults.checkbox.keep_selected_style
		 * @plugin checkbox
		 */keep_selected_style:true, /**
		 * This setting controls how cascading and undetermined nodes are applied.
		 * If 'up' is in the string - cascading up is enabled, if 'down' is in the string - cascading down is enabled, if 'undetermined' is in the string - undetermined nodes will be used.
		 * If `three_state` is set to `true` this setting is automatically set to 'up+down+undetermined'. Defaults to ''.
		 * @name $.jstree.defaults.checkbox.cascade
		 * @plugin checkbox
		 */cascade:'', /**
		 * This setting controls if checkbox are bound to the general tree selection or to an internal array maintained by the checkbox plugin. Defaults to `true`, only set to `false` if you know exactly what you are doing.
		 * @name $.jstree.defaults.checkbox.tie_selection
		 * @plugin checkbox
		 */tie_selection:true};$.jstree.plugins.checkbox = function(options,parent){this.bind = function(){parent.bind.call(this);this._data.checkbox.uto = false;this._data.checkbox.selected = [];if(this.settings.checkbox.three_state){this.settings.checkbox.cascade = 'up+down+undetermined';}this.element.on("init.jstree",$.proxy(function(){this._data.checkbox.visible = this.settings.checkbox.visible;if(!this.settings.checkbox.keep_selected_style){this.element.addClass('jstree-checkbox-no-clicked');}if(this.settings.checkbox.tie_selection){this.element.addClass('jstree-checkbox-selection');}},this)).on("loading.jstree",$.proxy(function(){this[this._data.checkbox.visible?'show_checkboxes':'hide_checkboxes']();},this));if(this.settings.checkbox.cascade.indexOf('undetermined') !== -1){this.element.on('changed.jstree uncheck_node.jstree check_node.jstree uncheck_all.jstree check_all.jstree move_node.jstree copy_node.jstree redraw.jstree open_node.jstree',$.proxy(function(){ // only if undetermined is in setting
if(this._data.checkbox.uto){clearTimeout(this._data.checkbox.uto);}this._data.checkbox.uto = setTimeout($.proxy(this._undetermined,this),50);},this));}if(!this.settings.checkbox.tie_selection){this.element.on('model.jstree',$.proxy(function(e,data){var m=this._model.data,p=m[data.parent],dpc=data.nodes,i,j;for(i = 0,j = dpc.length;i < j;i++) {m[dpc[i]].state.checked = m[dpc[i]].state.checked || m[dpc[i]].original && m[dpc[i]].original.state && m[dpc[i]].original.state.checked;if(m[dpc[i]].state.checked){this._data.checkbox.selected.push(dpc[i]);}}},this));}if(this.settings.checkbox.cascade.indexOf('up') !== -1 || this.settings.checkbox.cascade.indexOf('down') !== -1){this.element.on('model.jstree',$.proxy(function(e,data){var m=this._model.data,p=m[data.parent],dpc=data.nodes,chd=[],c,i,j,k,l,tmp,s=this.settings.checkbox.cascade,t=this.settings.checkbox.tie_selection;if(s.indexOf('down') !== -1){ // apply down
if(p.state[t?'selected':'checked']){for(i = 0,j = dpc.length;i < j;i++) {m[dpc[i]].state[t?'selected':'checked'] = true;}this._data[t?'core':'checkbox'].selected = this._data[t?'core':'checkbox'].selected.concat(dpc);}else {for(i = 0,j = dpc.length;i < j;i++) {if(m[dpc[i]].state[t?'selected':'checked']){for(k = 0,l = m[dpc[i]].children_d.length;k < l;k++) {m[m[dpc[i]].children_d[k]].state[t?'selected':'checked'] = true;}this._data[t?'core':'checkbox'].selected = this._data[t?'core':'checkbox'].selected.concat(m[dpc[i]].children_d);}}}}if(s.indexOf('up') !== -1){ // apply up
for(i = 0,j = p.children_d.length;i < j;i++) {if(!m[p.children_d[i]].children.length){chd.push(m[p.children_d[i]].parent);}}chd = $.vakata.array_unique(chd);for(k = 0,l = chd.length;k < l;k++) {p = m[chd[k]];while(p && p.id !== $.jstree.root) {c = 0;for(i = 0,j = p.children.length;i < j;i++) {c += m[p.children[i]].state[t?'selected':'checked'];}if(c === j){p.state[t?'selected':'checked'] = true;this._data[t?'core':'checkbox'].selected.push(p.id);tmp = this.get_node(p,true);if(tmp && tmp.length){tmp.attr('aria-selected',true).children('.jstree-anchor').addClass(t?'jstree-clicked':'jstree-checked');}}else {break;}p = this.get_node(p.parent);}}}this._data[t?'core':'checkbox'].selected = $.vakata.array_unique(this._data[t?'core':'checkbox'].selected);},this)).on(this.settings.checkbox.tie_selection?'select_node.jstree':'check_node.jstree',$.proxy(function(e,data){var obj=data.node,m=this._model.data,par=this.get_node(obj.parent),dom=this.get_node(obj,true),i,j,c,tmp,s=this.settings.checkbox.cascade,t=this.settings.checkbox.tie_selection; // apply down
if(s.indexOf('down') !== -1){this._data[t?'core':'checkbox'].selected = $.vakata.array_unique(this._data[t?'core':'checkbox'].selected.concat(obj.children_d));for(i = 0,j = obj.children_d.length;i < j;i++) {tmp = m[obj.children_d[i]];tmp.state[t?'selected':'checked'] = true;if(tmp && tmp.original && tmp.original.state && tmp.original.state.undetermined){tmp.original.state.undetermined = false;}}} // apply up
if(s.indexOf('up') !== -1){while(par && par.id !== $.jstree.root) {c = 0;for(i = 0,j = par.children.length;i < j;i++) {c += m[par.children[i]].state[t?'selected':'checked'];}if(c === j){par.state[t?'selected':'checked'] = true;this._data[t?'core':'checkbox'].selected.push(par.id);tmp = this.get_node(par,true);if(tmp && tmp.length){tmp.attr('aria-selected',true).children('.jstree-anchor').addClass(t?'jstree-clicked':'jstree-checked');}}else {break;}par = this.get_node(par.parent);}} // apply down (process .children separately?)
if(s.indexOf('down') !== -1 && dom.length){dom.find('.jstree-anchor').addClass(t?'jstree-clicked':'jstree-checked').parent().attr('aria-selected',true);}},this)).on(this.settings.checkbox.tie_selection?'deselect_all.jstree':'uncheck_all.jstree',$.proxy(function(e,data){var obj=this.get_node($.jstree.root),m=this._model.data,i,j,tmp;for(i = 0,j = obj.children_d.length;i < j;i++) {tmp = m[obj.children_d[i]];if(tmp && tmp.original && tmp.original.state && tmp.original.state.undetermined){tmp.original.state.undetermined = false;}}},this)).on(this.settings.checkbox.tie_selection?'deselect_node.jstree':'uncheck_node.jstree',$.proxy(function(e,data){var obj=data.node,dom=this.get_node(obj,true),i,j,tmp,s=this.settings.checkbox.cascade,t=this.settings.checkbox.tie_selection;if(obj && obj.original && obj.original.state && obj.original.state.undetermined){obj.original.state.undetermined = false;} // apply down
if(s.indexOf('down') !== -1){for(i = 0,j = obj.children_d.length;i < j;i++) {tmp = this._model.data[obj.children_d[i]];tmp.state[t?'selected':'checked'] = false;if(tmp && tmp.original && tmp.original.state && tmp.original.state.undetermined){tmp.original.state.undetermined = false;}}} // apply up
if(s.indexOf('up') !== -1){for(i = 0,j = obj.parents.length;i < j;i++) {tmp = this._model.data[obj.parents[i]];tmp.state[t?'selected':'checked'] = false;if(tmp && tmp.original && tmp.original.state && tmp.original.state.undetermined){tmp.original.state.undetermined = false;}tmp = this.get_node(obj.parents[i],true);if(tmp && tmp.length){tmp.attr('aria-selected',false).children('.jstree-anchor').removeClass(t?'jstree-clicked':'jstree-checked');}}}tmp = [];for(i = 0,j = this._data[t?'core':'checkbox'].selected.length;i < j;i++) { // apply down + apply up
if((s.indexOf('down') === -1 || $.inArray(this._data[t?'core':'checkbox'].selected[i],obj.children_d) === -1) && (s.indexOf('up') === -1 || $.inArray(this._data[t?'core':'checkbox'].selected[i],obj.parents) === -1)){tmp.push(this._data[t?'core':'checkbox'].selected[i]);}}this._data[t?'core':'checkbox'].selected = $.vakata.array_unique(tmp); // apply down (process .children separately?)
if(s.indexOf('down') !== -1 && dom.length){dom.find('.jstree-anchor').removeClass(t?'jstree-clicked':'jstree-checked').parent().attr('aria-selected',false);}},this));}if(this.settings.checkbox.cascade.indexOf('up') !== -1){this.element.on('delete_node.jstree',$.proxy(function(e,data){ // apply up (whole handler)
var p=this.get_node(data.parent),m=this._model.data,i,j,c,tmp,t=this.settings.checkbox.tie_selection;while(p && p.id !== $.jstree.root && !p.state[t?'selected':'checked']) {c = 0;for(i = 0,j = p.children.length;i < j;i++) {c += m[p.children[i]].state[t?'selected':'checked'];}if(j > 0 && c === j){p.state[t?'selected':'checked'] = true;this._data[t?'core':'checkbox'].selected.push(p.id);tmp = this.get_node(p,true);if(tmp && tmp.length){tmp.attr('aria-selected',true).children('.jstree-anchor').addClass(t?'jstree-clicked':'jstree-checked');}}else {break;}p = this.get_node(p.parent);}},this)).on('move_node.jstree',$.proxy(function(e,data){ // apply up (whole handler)
var is_multi=data.is_multi,old_par=data.old_parent,new_par=this.get_node(data.parent),m=this._model.data,p,c,i,j,tmp,t=this.settings.checkbox.tie_selection;if(!is_multi){p = this.get_node(old_par);while(p && p.id !== $.jstree.root && !p.state[t?'selected':'checked']) {c = 0;for(i = 0,j = p.children.length;i < j;i++) {c += m[p.children[i]].state[t?'selected':'checked'];}if(j > 0 && c === j){p.state[t?'selected':'checked'] = true;this._data[t?'core':'checkbox'].selected.push(p.id);tmp = this.get_node(p,true);if(tmp && tmp.length){tmp.attr('aria-selected',true).children('.jstree-anchor').addClass(t?'jstree-clicked':'jstree-checked');}}else {break;}p = this.get_node(p.parent);}}p = new_par;while(p && p.id !== $.jstree.root) {c = 0;for(i = 0,j = p.children.length;i < j;i++) {c += m[p.children[i]].state[t?'selected':'checked'];}if(c === j){if(!p.state[t?'selected':'checked']){p.state[t?'selected':'checked'] = true;this._data[t?'core':'checkbox'].selected.push(p.id);tmp = this.get_node(p,true);if(tmp && tmp.length){tmp.attr('aria-selected',true).children('.jstree-anchor').addClass(t?'jstree-clicked':'jstree-checked');}}}else {if(p.state[t?'selected':'checked']){p.state[t?'selected':'checked'] = false;this._data[t?'core':'checkbox'].selected = $.vakata.array_remove_item(this._data[t?'core':'checkbox'].selected,p.id);tmp = this.get_node(p,true);if(tmp && tmp.length){tmp.attr('aria-selected',false).children('.jstree-anchor').removeClass(t?'jstree-clicked':'jstree-checked');}}else {break;}}p = this.get_node(p.parent);}},this));}}; /**
		 * set the undetermined state where and if necessary. Used internally.
		 * @private
		 * @name _undetermined()
		 * @plugin checkbox
		 */this._undetermined = function(){if(this.element === null){return;}var i,j,k,l,o={},m=this._model.data,t=this.settings.checkbox.tie_selection,s=this._data[t?'core':'checkbox'].selected,p=[],tt=this;for(i = 0,j = s.length;i < j;i++) {if(m[s[i]] && m[s[i]].parents){for(k = 0,l = m[s[i]].parents.length;k < l;k++) {if(o[m[s[i]].parents[k]] === undefined && m[s[i]].parents[k] !== $.jstree.root){o[m[s[i]].parents[k]] = true;p.push(m[s[i]].parents[k]);}}}} // attempt for server side undetermined state
this.element.find('.jstree-closed').not(':has(.jstree-children)').each(function(){var tmp=tt.get_node(this),tmp2;if(!tmp.state.loaded){if(tmp.original && tmp.original.state && tmp.original.state.undetermined && tmp.original.state.undetermined === true){if(o[tmp.id] === undefined && tmp.id !== $.jstree.root){o[tmp.id] = true;p.push(tmp.id);}for(k = 0,l = tmp.parents.length;k < l;k++) {if(o[tmp.parents[k]] === undefined && tmp.parents[k] !== $.jstree.root){o[tmp.parents[k]] = true;p.push(tmp.parents[k]);}}}}else {for(i = 0,j = tmp.children_d.length;i < j;i++) {tmp2 = m[tmp.children_d[i]];if(!tmp2.state.loaded && tmp2.original && tmp2.original.state && tmp2.original.state.undetermined && tmp2.original.state.undetermined === true){if(o[tmp2.id] === undefined && tmp2.id !== $.jstree.root){o[tmp2.id] = true;p.push(tmp2.id);}for(k = 0,l = tmp2.parents.length;k < l;k++) {if(o[tmp2.parents[k]] === undefined && tmp2.parents[k] !== $.jstree.root){o[tmp2.parents[k]] = true;p.push(tmp2.parents[k]);}}}}}});this.element.find('.jstree-undetermined').removeClass('jstree-undetermined');for(i = 0,j = p.length;i < j;i++) {if(!m[p[i]].state[t?'selected':'checked']){s = this.get_node(p[i],true);if(s && s.length){s.children('.jstree-anchor').children('.jstree-checkbox').addClass('jstree-undetermined');}}}};this.redraw_node = function(obj,deep,is_callback,force_render){obj = parent.redraw_node.apply(this,arguments);if(obj){var i,j,tmp=null,icon=null;for(i = 0,j = obj.childNodes.length;i < j;i++) {if(obj.childNodes[i] && obj.childNodes[i].className && obj.childNodes[i].className.indexOf("jstree-anchor") !== -1){tmp = obj.childNodes[i];break;}}if(tmp){if(!this.settings.checkbox.tie_selection && this._model.data[obj.id].state.checked){tmp.className += ' jstree-checked';}icon = _i.cloneNode(false);if(this._model.data[obj.id].state.checkbox_disabled){icon.className += ' jstree-checkbox-disabled';}tmp.insertBefore(icon,tmp.childNodes[0]);}}if(!is_callback && this.settings.checkbox.cascade.indexOf('undetermined') !== -1){if(this._data.checkbox.uto){clearTimeout(this._data.checkbox.uto);}this._data.checkbox.uto = setTimeout($.proxy(this._undetermined,this),50);}return obj;}; /**
		 * show the node checkbox icons
		 * @name show_checkboxes()
		 * @plugin checkbox
		 */this.show_checkboxes = function(){this._data.core.themes.checkboxes = true;this.get_container_ul().removeClass("jstree-no-checkboxes");}; /**
		 * hide the node checkbox icons
		 * @name hide_checkboxes()
		 * @plugin checkbox
		 */this.hide_checkboxes = function(){this._data.core.themes.checkboxes = false;this.get_container_ul().addClass("jstree-no-checkboxes");}; /**
		 * toggle the node icons
		 * @name toggle_checkboxes()
		 * @plugin checkbox
		 */this.toggle_checkboxes = function(){if(this._data.core.themes.checkboxes){this.hide_checkboxes();}else {this.show_checkboxes();}}; /**
		 * checks if a node is in an undetermined state
		 * @name is_undetermined(obj)
		 * @param  {mixed} obj
		 * @return {Boolean}
		 */this.is_undetermined = function(obj){obj = this.get_node(obj);var s=this.settings.checkbox.cascade,i,j,t=this.settings.checkbox.tie_selection,d=this._data[t?'core':'checkbox'].selected,m=this._model.data;if(!obj || obj.state[t?'selected':'checked'] === true || s.indexOf('undetermined') === -1 || s.indexOf('down') === -1 && s.indexOf('up') === -1){return false;}if(!obj.state.loaded && obj.original.state.undetermined === true){return true;}for(i = 0,j = obj.children_d.length;i < j;i++) {if($.inArray(obj.children_d[i],d) !== -1 || !m[obj.children_d[i]].state.loaded && m[obj.children_d[i]].original.state.undetermined){return true;}}return false;}; /**
		 * disable a node's checkbox
		 * @name disable_checkbox(obj)
		 * @param {mixed} obj an array can be used too
		 * @trigger disable_checkbox.jstree
		 * @plugin checkbox
		 */this.disable_checkbox = function(obj){var t1,t2,dom;if($.isArray(obj)){obj = obj.slice();for(t1 = 0,t2 = obj.length;t1 < t2;t1++) {this.disable_checkbox(obj[t1]);}return true;}obj = this.get_node(obj);if(!obj || obj.id === $.jstree.root){return false;}dom = this.get_node(obj,true);if(!obj.state.checkbox_disabled){obj.state.checkbox_disabled = true;if(dom && dom.length){dom.children('.jstree-anchor').children('.jstree-checkbox').addClass('jstree-checkbox-disabled');} /**
				 * triggered when an node's checkbox is disabled
				 * @event
				 * @name disable_checkbox.jstree
				 * @param {Object} node
				 * @plugin checkbox
				 */this.trigger('disable_checkbox',{'node':obj});}}; /**
		 * enable a node's checkbox
		 * @name disable_checkbox(obj)
		 * @param {mixed} obj an array can be used too
		 * @trigger enable_checkbox.jstree
		 * @plugin checkbox
		 */this.enable_checkbox = function(obj){var t1,t2,dom;if($.isArray(obj)){obj = obj.slice();for(t1 = 0,t2 = obj.length;t1 < t2;t1++) {this.enable_checkbox(obj[t1]);}return true;}obj = this.get_node(obj);if(!obj || obj.id === $.jstree.root){return false;}dom = this.get_node(obj,true);if(obj.state.checkbox_disabled){obj.state.checkbox_disabled = false;if(dom && dom.length){dom.children('.jstree-anchor').children('.jstree-checkbox').removeClass('jstree-checkbox-disabled');} /**
				 * triggered when an node's checkbox is enabled
				 * @event
				 * @name enable_checkbox.jstree
				 * @param {Object} node
				 * @plugin checkbox
				 */this.trigger('enable_checkbox',{'node':obj});}};this.activate_node = function(obj,e){if($(e.target).hasClass('jstree-checkbox-disabled')){return false;}if(this.settings.checkbox.tie_selection && (this.settings.checkbox.whole_node || $(e.target).hasClass('jstree-checkbox'))){e.ctrlKey = true;}if(this.settings.checkbox.tie_selection || !this.settings.checkbox.whole_node && !$(e.target).hasClass('jstree-checkbox')){return parent.activate_node.call(this,obj,e);}if(this.is_disabled(obj)){return false;}if(this.is_checked(obj)){this.uncheck_node(obj,e);}else {this.check_node(obj,e);}this.trigger('activate_node',{'node':this.get_node(obj)});}; /**
		 * check a node (only if tie_selection in checkbox settings is false, otherwise select_node will be called internally)
		 * @name check_node(obj)
		 * @param {mixed} obj an array can be used to check multiple nodes
		 * @trigger check_node.jstree
		 * @plugin checkbox
		 */this.check_node = function(obj,e){if(this.settings.checkbox.tie_selection){return this.select_node(obj,false,true,e);}var dom,t1,t2,th;if($.isArray(obj)){obj = obj.slice();for(t1 = 0,t2 = obj.length;t1 < t2;t1++) {this.check_node(obj[t1],e);}return true;}obj = this.get_node(obj);if(!obj || obj.id === $.jstree.root){return false;}dom = this.get_node(obj,true);if(!obj.state.checked){obj.state.checked = true;this._data.checkbox.selected.push(obj.id);if(dom && dom.length){dom.children('.jstree-anchor').addClass('jstree-checked');} /**
				 * triggered when an node is checked (only if tie_selection in checkbox settings is false)
				 * @event
				 * @name check_node.jstree
				 * @param {Object} node
				 * @param {Array} selected the current selection
				 * @param {Object} event the event (if any) that triggered this check_node
				 * @plugin checkbox
				 */this.trigger('check_node',{'node':obj,'selected':this._data.checkbox.selected,'event':e});}}; /**
		 * uncheck a node (only if tie_selection in checkbox settings is false, otherwise deselect_node will be called internally)
		 * @name uncheck_node(obj)
		 * @param {mixed} obj an array can be used to uncheck multiple nodes
		 * @trigger uncheck_node.jstree
		 * @plugin checkbox
		 */this.uncheck_node = function(obj,e){if(this.settings.checkbox.tie_selection){return this.deselect_node(obj,false,e);}var t1,t2,dom;if($.isArray(obj)){obj = obj.slice();for(t1 = 0,t2 = obj.length;t1 < t2;t1++) {this.uncheck_node(obj[t1],e);}return true;}obj = this.get_node(obj);if(!obj || obj.id === $.jstree.root){return false;}dom = this.get_node(obj,true);if(obj.state.checked){obj.state.checked = false;this._data.checkbox.selected = $.vakata.array_remove_item(this._data.checkbox.selected,obj.id);if(dom.length){dom.children('.jstree-anchor').removeClass('jstree-checked');} /**
				 * triggered when an node is unchecked (only if tie_selection in checkbox settings is false)
				 * @event
				 * @name uncheck_node.jstree
				 * @param {Object} node
				 * @param {Array} selected the current selection
				 * @param {Object} event the event (if any) that triggered this uncheck_node
				 * @plugin checkbox
				 */this.trigger('uncheck_node',{'node':obj,'selected':this._data.checkbox.selected,'event':e});}}; /**
		 * checks all nodes in the tree (only if tie_selection in checkbox settings is false, otherwise select_all will be called internally)
		 * @name check_all()
		 * @trigger check_all.jstree, changed.jstree
		 * @plugin checkbox
		 */this.check_all = function(){if(this.settings.checkbox.tie_selection){return this.select_all();}var tmp=this._data.checkbox.selected.concat([]),i,j;this._data.checkbox.selected = this._model.data[$.jstree.root].children_d.concat();for(i = 0,j = this._data.checkbox.selected.length;i < j;i++) {if(this._model.data[this._data.checkbox.selected[i]]){this._model.data[this._data.checkbox.selected[i]].state.checked = true;}}this.redraw(true); /**
			 * triggered when all nodes are checked (only if tie_selection in checkbox settings is false)
			 * @event
			 * @name check_all.jstree
			 * @param {Array} selected the current selection
			 * @plugin checkbox
			 */this.trigger('check_all',{'selected':this._data.checkbox.selected});}; /**
		 * uncheck all checked nodes (only if tie_selection in checkbox settings is false, otherwise deselect_all will be called internally)
		 * @name uncheck_all()
		 * @trigger uncheck_all.jstree
		 * @plugin checkbox
		 */this.uncheck_all = function(){if(this.settings.checkbox.tie_selection){return this.deselect_all();}var tmp=this._data.checkbox.selected.concat([]),i,j;for(i = 0,j = this._data.checkbox.selected.length;i < j;i++) {if(this._model.data[this._data.checkbox.selected[i]]){this._model.data[this._data.checkbox.selected[i]].state.checked = false;}}this._data.checkbox.selected = [];this.element.find('.jstree-checked').removeClass('jstree-checked'); /**
			 * triggered when all nodes are unchecked (only if tie_selection in checkbox settings is false)
			 * @event
			 * @name uncheck_all.jstree
			 * @param {Object} node the previous selection
			 * @param {Array} selected the current selection
			 * @plugin checkbox
			 */this.trigger('uncheck_all',{'selected':this._data.checkbox.selected,'node':tmp});}; /**
		 * checks if a node is checked (if tie_selection is on in the settings this function will return the same as is_selected)
		 * @name is_checked(obj)
		 * @param  {mixed}  obj
		 * @return {Boolean}
		 * @plugin checkbox
		 */this.is_checked = function(obj){if(this.settings.checkbox.tie_selection){return this.is_selected(obj);}obj = this.get_node(obj);if(!obj || obj.id === $.jstree.root){return false;}return obj.state.checked;}; /**
		 * get an array of all checked nodes (if tie_selection is on in the settings this function will return the same as get_selected)
		 * @name get_checked([full])
		 * @param  {mixed}  full if set to `true` the returned array will consist of the full node objects, otherwise - only IDs will be returned
		 * @return {Array}
		 * @plugin checkbox
		 */this.get_checked = function(full){if(this.settings.checkbox.tie_selection){return this.get_selected(full);}return full?$.map(this._data.checkbox.selected,$.proxy(function(i){return this.get_node(i);},this)):this._data.checkbox.selected;}; /**
		 * get an array of all top level checked nodes (ignoring children of checked nodes) (if tie_selection is on in the settings this function will return the same as get_top_selected)
		 * @name get_top_checked([full])
		 * @param  {mixed}  full if set to `true` the returned array will consist of the full node objects, otherwise - only IDs will be returned
		 * @return {Array}
		 * @plugin checkbox
		 */this.get_top_checked = function(full){if(this.settings.checkbox.tie_selection){return this.get_top_selected(full);}var tmp=this.get_checked(true),obj={},i,j,k,l;for(i = 0,j = tmp.length;i < j;i++) {obj[tmp[i].id] = tmp[i];}for(i = 0,j = tmp.length;i < j;i++) {for(k = 0,l = tmp[i].children_d.length;k < l;k++) {if(obj[tmp[i].children_d[k]]){delete obj[tmp[i].children_d[k]];}}}tmp = [];for(i in obj) {if(obj.hasOwnProperty(i)){tmp.push(i);}}return full?$.map(tmp,$.proxy(function(i){return this.get_node(i);},this)):tmp;}; /**
		 * get an array of all bottom level checked nodes (ignoring selected parents) (if tie_selection is on in the settings this function will return the same as get_bottom_selected)
		 * @name get_bottom_checked([full])
		 * @param  {mixed}  full if set to `true` the returned array will consist of the full node objects, otherwise - only IDs will be returned
		 * @return {Array}
		 * @plugin checkbox
		 */this.get_bottom_checked = function(full){if(this.settings.checkbox.tie_selection){return this.get_bottom_selected(full);}var tmp=this.get_checked(true),obj=[],i,j;for(i = 0,j = tmp.length;i < j;i++) {if(!tmp[i].children.length){obj.push(tmp[i].id);}}return full?$.map(obj,$.proxy(function(i){return this.get_node(i);},this)):obj;};this.load_node = function(obj,callback){var k,l,i,j,c,tmp;if(!$.isArray(obj) && !this.settings.checkbox.tie_selection){tmp = this.get_node(obj);if(tmp && tmp.state.loaded){for(k = 0,l = tmp.children_d.length;k < l;k++) {if(this._model.data[tmp.children_d[k]].state.checked){c = true;this._data.checkbox.selected = $.vakata.array_remove_item(this._data.checkbox.selected,tmp.children_d[k]);}}}}return parent.load_node.apply(this,arguments);};this.get_state = function(){var state=parent.get_state.apply(this,arguments);if(this.settings.checkbox.tie_selection){return state;}state.checkbox = this._data.checkbox.selected.slice();return state;};this.set_state = function(state,callback){var res=parent.set_state.apply(this,arguments);if(res && state.checkbox){if(!this.settings.checkbox.tie_selection){this.uncheck_all();var _this=this;$.each(state.checkbox,function(i,v){_this.check_node(v);});}delete state.checkbox;this.set_state(state,callback);return false;}return res;};this.refresh = function(skip_loading,forget_state){if(!this.settings.checkbox.tie_selection){this._data.checkbox.selected = [];}return parent.refresh.apply(this,arguments);};}; // include the checkbox plugin by default
// $.jstree.defaults.plugins.push("checkbox");
/**
 * ### Conditionalselect plugin
 *
 * This plugin allows defining a callback to allow or deny node selection by user input (activate node method).
 */ /**
	 * a callback (function) which is invoked in the instance's scope and receives two arguments - the node and the event that triggered the `activate_node` call. Returning false prevents working with the node, returning true allows invoking activate_node. Defaults to returning `true`.
	 * @name $.jstree.defaults.checkbox.visible
	 * @plugin checkbox
	 */$.jstree.defaults.conditionalselect = function(){return true;};$.jstree.plugins.conditionalselect = function(options,parent){ // own function
this.activate_node = function(obj,e){if(this.settings.conditionalselect.call(this,this.get_node(obj),e)){parent.activate_node.call(this,obj,e);}};}; /**
 * ### Contextmenu plugin
 *
 * Shows a context menu when a node is right-clicked.
 */ /**
	 * stores all defaults for the contextmenu plugin
	 * @name $.jstree.defaults.contextmenu
	 * @plugin contextmenu
	 */$.jstree.defaults.contextmenu = { /**
		 * a boolean indicating if the node should be selected when the context menu is invoked on it. Defaults to `true`.
		 * @name $.jstree.defaults.contextmenu.select_node
		 * @plugin contextmenu
		 */select_node:true, /**
		 * a boolean indicating if the menu should be shown aligned with the node. Defaults to `true`, otherwise the mouse coordinates are used.
		 * @name $.jstree.defaults.contextmenu.show_at_node
		 * @plugin contextmenu
		 */show_at_node:true, /**
		 * an object of actions, or a function that accepts a node and a callback function and calls the callback function with an object of actions available for that node (you can also return the items too).
		 *
		 * Each action consists of a key (a unique name) and a value which is an object with the following properties (only label and action are required):
		 *
		 * * `separator_before` - a boolean indicating if there should be a separator before this item
		 * * `separator_after` - a boolean indicating if there should be a separator after this item
		 * * `_disabled` - a boolean indicating if this action should be disabled
		 * * `label` - a string - the name of the action (could be a function returning a string)
		 * * `action` - a function to be executed if this item is chosen
		 * * `icon` - a string, can be a path to an icon or a className, if using an image that is in the current directory use a `./` prefix, otherwise it will be detected as a class
		 * * `shortcut` - keyCode which will trigger the action if the menu is open (for example `113` for rename, which equals F2)
		 * * `shortcut_label` - shortcut label (like for example `F2` for rename)
		 *
		 * @name $.jstree.defaults.contextmenu.items
		 * @plugin contextmenu
		 */items:function items(o,cb){ // Could be an object directly
return {"create":{"separator_before":false,"separator_after":true,"_disabled":false, //(this.check("create_node", data.reference, {}, "last")),
"label":"Create","action":function action(data){var inst=$.jstree.reference(data.reference),obj=inst.get_node(data.reference);inst.create_node(obj,{},"last",function(new_node){setTimeout(function(){inst.edit(new_node);},0);});}},"rename":{"separator_before":false,"separator_after":false,"_disabled":false, //(this.check("rename_node", data.reference, this.get_parent(data.reference), "")),
"label":"Rename", /*!
					"shortcut"			: 113,
					"shortcut_label"	: 'F2',
					"icon"				: "glyphicon glyphicon-leaf",
					*/"action":function action(data){var inst=$.jstree.reference(data.reference),obj=inst.get_node(data.reference);inst.edit(obj);}},"remove":{"separator_before":false,"icon":false,"separator_after":false,"_disabled":false, //(this.check("delete_node", data.reference, this.get_parent(data.reference), "")),
"label":"Delete","action":function action(data){var inst=$.jstree.reference(data.reference),obj=inst.get_node(data.reference);if(inst.is_selected(obj)){inst.delete_node(inst.get_selected());}else {inst.delete_node(obj);}}},"ccp":{"separator_before":true,"icon":false,"separator_after":false,"label":"Edit","action":false,"submenu":{"cut":{"separator_before":false,"separator_after":false,"label":"Cut","action":function action(data){var inst=$.jstree.reference(data.reference),obj=inst.get_node(data.reference);if(inst.is_selected(obj)){inst.cut(inst.get_top_selected());}else {inst.cut(obj);}}},"copy":{"separator_before":false,"icon":false,"separator_after":false,"label":"Copy","action":function action(data){var inst=$.jstree.reference(data.reference),obj=inst.get_node(data.reference);if(inst.is_selected(obj)){inst.copy(inst.get_top_selected());}else {inst.copy(obj);}}},"paste":{"separator_before":false,"icon":false,"_disabled":function _disabled(data){return !$.jstree.reference(data.reference).can_paste();},"separator_after":false,"label":"Paste","action":function action(data){var inst=$.jstree.reference(data.reference),obj=inst.get_node(data.reference);inst.paste(obj);}}}}};}};$.jstree.plugins.contextmenu = function(options,parent){this.bind = function(){parent.bind.call(this);var last_ts=0,cto=null,ex,ey;this.element.on("contextmenu.jstree",".jstree-anchor",$.proxy(function(e,data){e.preventDefault();last_ts = e.ctrlKey?+new Date():0;if(data || cto){last_ts = +new Date() + 10000;}if(cto){clearTimeout(cto);}if(!this.is_loading(e.currentTarget)){this.show_contextmenu(e.currentTarget,e.pageX,e.pageY,e);}},this)).on("click.jstree",".jstree-anchor",$.proxy(function(e){if(this._data.contextmenu.visible && (!last_ts || +new Date() - last_ts > 250)){ // work around safari & macOS ctrl+click
$.vakata.context.hide();}last_ts = 0;},this)).on("touchstart.jstree",".jstree-anchor",function(e){if(!e.originalEvent || !e.originalEvent.changedTouches || !e.originalEvent.changedTouches[0]){return;}ex = e.pageX;ey = e.pageY;cto = setTimeout(function(){$(e.currentTarget).trigger('contextmenu',true);},750);}).on('touchmove.vakata.jstree',function(e){if(cto && e.originalEvent && e.originalEvent.changedTouches && e.originalEvent.changedTouches[0] && (Math.abs(ex - e.pageX) > 50 || Math.abs(ey - e.pageY) > 50)){clearTimeout(cto);}}).on('touchend.vakata.jstree',function(e){if(cto){clearTimeout(cto);}}); /*!
			if(!('oncontextmenu' in document.body) && ('ontouchstart' in document.body)) {
				var el = null, tm = null;
				this.element
					.on("touchstart", ".jstree-anchor", function (e) {
						el = e.currentTarget;
						tm = +new Date();
						$(document).one("touchend", function (e) {
							e.target = document.elementFromPoint(e.originalEvent.targetTouches[0].pageX - window.pageXOffset, e.originalEvent.targetTouches[0].pageY - window.pageYOffset);
							e.currentTarget = e.target;
							tm = ((+(new Date())) - tm);
							if(e.target === el && tm > 600 && tm < 1000) {
								e.preventDefault();
								$(el).trigger('contextmenu', e);
							}
							el = null;
							tm = null;
						});
					});
			}
			*/$(document).on("context_hide.vakata.jstree",$.proxy(function(){this._data.contextmenu.visible = false;},this));};this.teardown = function(){if(this._data.contextmenu.visible){$.vakata.context.hide();}parent.teardown.call(this);}; /**
		 * prepare and show the context menu for a node
		 * @name show_contextmenu(obj [, x, y])
		 * @param {mixed} obj the node
		 * @param {Number} x the x-coordinate relative to the document to show the menu at
		 * @param {Number} y the y-coordinate relative to the document to show the menu at
		 * @param {Object} e the event if available that triggered the contextmenu
		 * @plugin contextmenu
		 * @trigger show_contextmenu.jstree
		 */this.show_contextmenu = function(obj,x,y,e){obj = this.get_node(obj);if(!obj || obj.id === $.jstree.root){return false;}var s=this.settings.contextmenu,d=this.get_node(obj,true),a=d.children(".jstree-anchor"),o=false,i=false;if(s.show_at_node || x === undefined || y === undefined){o = a.offset();x = o.left;y = o.top + this._data.core.li_height;}if(this.settings.contextmenu.select_node && !this.is_selected(obj)){this.activate_node(obj,e);}i = s.items;if($.isFunction(i)){i = i.call(this,obj,$.proxy(function(i){this._show_contextmenu(obj,x,y,i);},this));}if($.isPlainObject(i)){this._show_contextmenu(obj,x,y,i);}}; /**
		 * show the prepared context menu for a node
		 * @name _show_contextmenu(obj, x, y, i)
		 * @param {mixed} obj the node
		 * @param {Number} x the x-coordinate relative to the document to show the menu at
		 * @param {Number} y the y-coordinate relative to the document to show the menu at
		 * @param {Number} i the object of items to show
		 * @plugin contextmenu
		 * @trigger show_contextmenu.jstree
		 * @private
		 */this._show_contextmenu = function(obj,x,y,i){var d=this.get_node(obj,true),a=d.children(".jstree-anchor");$(document).one("context_show.vakata.jstree",$.proxy(function(e,data){var cls='jstree-contextmenu jstree-' + this.get_theme() + '-contextmenu';$(data.element).addClass(cls);},this));this._data.contextmenu.visible = true;$.vakata.context.show(a,{'x':x,'y':y},i); /**
			 * triggered when the contextmenu is shown for a node
			 * @event
			 * @name show_contextmenu.jstree
			 * @param {Object} node the node
			 * @param {Number} x the x-coordinate of the menu relative to the document
			 * @param {Number} y the y-coordinate of the menu relative to the document
			 * @plugin contextmenu
			 */this.trigger('show_contextmenu',{"node":obj,"x":x,"y":y});};}; // contextmenu helper
(function($){var right_to_left=false,vakata_context={element:false,reference:false,position_x:0,position_y:0,items:[],html:"",is_visible:false};$.vakata.context = {settings:{hide_onmouseleave:0,icons:true},_trigger:function _trigger(event_name){$(document).triggerHandler("context_" + event_name + ".vakata",{"reference":vakata_context.reference,"element":vakata_context.element,"position":{"x":vakata_context.position_x,"y":vakata_context.position_y}});},_execute:function _execute(i){i = vakata_context.items[i];return i && (!i._disabled || $.isFunction(i._disabled) && !i._disabled({"item":i,"reference":vakata_context.reference,"element":vakata_context.element})) && i.action?i.action.call(null,{"item":i,"reference":vakata_context.reference,"element":vakata_context.element,"position":{"x":vakata_context.position_x,"y":vakata_context.position_y}}):false;},_parse:function _parse(o,is_callback){if(!o){return false;}if(!is_callback){vakata_context.html = "";vakata_context.items = [];}var str="",sep=false,tmp;if(is_callback){str += "<" + "ul>";}$.each(o,function(i,val){if(!val){return true;}vakata_context.items.push(val);if(!sep && val.separator_before){str += "<" + "li class='vakata-context-separator'><" + "a href='#' " + ($.vakata.context.settings.icons?'':'style="margin-left:0px;"') + ">&#160;<" + "/a><" + "/li>";}sep = false;str += "<" + "li class='" + (val._class || "") + (val._disabled === true || $.isFunction(val._disabled) && val._disabled({"item":val,"reference":vakata_context.reference,"element":vakata_context.element})?" vakata-contextmenu-disabled ":"") + "' " + (val.shortcut?" data-shortcut='" + val.shortcut + "' ":'') + ">";str += "<" + "a href='#' rel='" + (vakata_context.items.length - 1) + "'>";if($.vakata.context.settings.icons){str += "<" + "i ";if(val.icon){if(val.icon.indexOf("/") !== -1 || val.icon.indexOf(".") !== -1){str += " style='background:url(\"" + val.icon + "\") center center no-repeat' ";}else {str += " class='" + val.icon + "' ";}}str += "><" + "/i><" + "span class='vakata-contextmenu-sep'>&#160;<" + "/span>";}str += ($.isFunction(val.label)?val.label({"item":i,"reference":vakata_context.reference,"element":vakata_context.element}):val.label) + (val.shortcut?' <span class="vakata-contextmenu-shortcut vakata-contextmenu-shortcut-' + val.shortcut + '">' + (val.shortcut_label || '') + '</span>':'') + "<" + "/a>";if(val.submenu){tmp = $.vakata.context._parse(val.submenu,true);if(tmp){str += tmp;}}str += "<" + "/li>";if(val.separator_after){str += "<" + "li class='vakata-context-separator'><" + "a href='#' " + ($.vakata.context.settings.icons?'':'style="margin-left:0px;"') + ">&#160;<" + "/a><" + "/li>";sep = true;}});str = str.replace(/<li class\='vakata-context-separator'\><\/li\>$/,"");if(is_callback){str += "</ul>";} /**
				 * triggered on the document when the contextmenu is parsed (HTML is built)
				 * @event
				 * @plugin contextmenu
				 * @name context_parse.vakata
				 * @param {jQuery} reference the element that was right clicked
				 * @param {jQuery} element the DOM element of the menu itself
				 * @param {Object} position the x & y coordinates of the menu
				 */if(!is_callback){vakata_context.html = str;$.vakata.context._trigger("parse");}return str.length > 10?str:false;},_show_submenu:function _show_submenu(o){o = $(o);if(!o.length || !o.children("ul").length){return;}var e=o.children("ul"),x=o.offset().left + o.outerWidth(),y=o.offset().top,w=e.width(),h=e.height(),dw=$(window).width() + $(window).scrollLeft(),dh=$(window).height() + $(window).scrollTop(); // може да се спести е една проверка - дали няма някой от класовете вече нагоре
if(right_to_left){o[x - (w + 10 + o.outerWidth()) < 0?"addClass":"removeClass"]("vakata-context-left");}else {o[x + w + 10 > dw?"addClass":"removeClass"]("vakata-context-right");}if(y + h + 10 > dh){e.css("bottom","-1px");}e.show();},show:function show(reference,position,data){var o,e,x,y,w,h,dw,dh,cond=true;if(vakata_context.element && vakata_context.element.length){vakata_context.element.width('');}switch(cond){case !position && !reference:return false;case !!position && !!reference:vakata_context.reference = reference;vakata_context.position_x = position.x;vakata_context.position_y = position.y;break;case !position && !!reference:vakata_context.reference = reference;o = reference.offset();vakata_context.position_x = o.left + reference.outerHeight();vakata_context.position_y = o.top;break;case !!position && !reference:vakata_context.position_x = position.x;vakata_context.position_y = position.y;break;}if(!!reference && !data && $(reference).data('vakata_contextmenu')){data = $(reference).data('vakata_contextmenu');}if($.vakata.context._parse(data)){vakata_context.element.html(vakata_context.html);}if(vakata_context.items.length){vakata_context.element.appendTo("body");e = vakata_context.element;x = vakata_context.position_x;y = vakata_context.position_y;w = e.width();h = e.height();dw = $(window).width() + $(window).scrollLeft();dh = $(window).height() + $(window).scrollTop();if(right_to_left){x -= e.outerWidth() - $(reference).outerWidth();if(x < $(window).scrollLeft() + 20){x = $(window).scrollLeft() + 20;}}if(x + w + 20 > dw){x = dw - (w + 20);}if(y + h + 20 > dh){y = dh - (h + 20);}vakata_context.element.css({"left":x,"top":y}).show().find('a').first().focus().parent().addClass("vakata-context-hover");vakata_context.is_visible = true; /**
					 * triggered on the document when the contextmenu is shown
					 * @event
					 * @plugin contextmenu
					 * @name context_show.vakata
					 * @param {jQuery} reference the element that was right clicked
					 * @param {jQuery} element the DOM element of the menu itself
					 * @param {Object} position the x & y coordinates of the menu
					 */$.vakata.context._trigger("show");}},hide:function hide(){if(vakata_context.is_visible){vakata_context.element.hide().find("ul").hide().end().find(':focus').blur().end().detach();vakata_context.is_visible = false; /**
					 * triggered on the document when the contextmenu is hidden
					 * @event
					 * @plugin contextmenu
					 * @name context_hide.vakata
					 * @param {jQuery} reference the element that was right clicked
					 * @param {jQuery} element the DOM element of the menu itself
					 * @param {Object} position the x & y coordinates of the menu
					 */$.vakata.context._trigger("hide");}}};$(function(){right_to_left = $("body").css("direction") === "rtl";var to=false;vakata_context.element = $("<ul class='vakata-context'></ul>");vakata_context.element.on("mouseenter","li",function(e){e.stopImmediatePropagation();if($.contains(this,e.relatedTarget)){ // премахнато заради delegate mouseleave по-долу
// $(this).find(".vakata-context-hover").removeClass("vakata-context-hover");
return;}if(to){clearTimeout(to);}vakata_context.element.find(".vakata-context-hover").removeClass("vakata-context-hover").end();$(this).siblings().find("ul").hide().end().end().parentsUntil(".vakata-context","li").addBack().addClass("vakata-context-hover");$.vakata.context._show_submenu(this);}) // тестово - дали не натоварва?
.on("mouseleave","li",function(e){if($.contains(this,e.relatedTarget)){return;}$(this).find(".vakata-context-hover").addBack().removeClass("vakata-context-hover");}).on("mouseleave",function(e){$(this).find(".vakata-context-hover").removeClass("vakata-context-hover");if($.vakata.context.settings.hide_onmouseleave){to = setTimeout((function(t){return function(){$.vakata.context.hide();};})(this),$.vakata.context.settings.hide_onmouseleave);}}).on("click","a",function(e){e.preventDefault(); //})
//.on("mouseup", "a", function (e) {
if(!$(this).blur().parent().hasClass("vakata-context-disabled") && $.vakata.context._execute($(this).attr("rel")) !== false){$.vakata.context.hide();}}).on('keydown','a',function(e){var o=null;switch(e.which){case 13:case 32:e.type = "mouseup";e.preventDefault();$(e.currentTarget).trigger(e);break;case 37:if(vakata_context.is_visible){vakata_context.element.find(".vakata-context-hover").last().closest("li").first().find("ul").hide().find(".vakata-context-hover").removeClass("vakata-context-hover").end().end().children('a').focus();e.stopImmediatePropagation();e.preventDefault();}break;case 38:if(vakata_context.is_visible){o = vakata_context.element.find("ul:visible").addBack().last().children(".vakata-context-hover").removeClass("vakata-context-hover").prevAll("li:not(.vakata-context-separator)").first();if(!o.length){o = vakata_context.element.find("ul:visible").addBack().last().children("li:not(.vakata-context-separator)").last();}o.addClass("vakata-context-hover").children('a').focus();e.stopImmediatePropagation();e.preventDefault();}break;case 39:if(vakata_context.is_visible){vakata_context.element.find(".vakata-context-hover").last().children("ul").show().children("li:not(.vakata-context-separator)").removeClass("vakata-context-hover").first().addClass("vakata-context-hover").children('a').focus();e.stopImmediatePropagation();e.preventDefault();}break;case 40:if(vakata_context.is_visible){o = vakata_context.element.find("ul:visible").addBack().last().children(".vakata-context-hover").removeClass("vakata-context-hover").nextAll("li:not(.vakata-context-separator)").first();if(!o.length){o = vakata_context.element.find("ul:visible").addBack().last().children("li:not(.vakata-context-separator)").first();}o.addClass("vakata-context-hover").children('a').focus();e.stopImmediatePropagation();e.preventDefault();}break;case 27:$.vakata.context.hide();e.preventDefault();break;default: //console.log(e.which);
break;}}).on('keydown',function(e){e.preventDefault();var a=vakata_context.element.find('.vakata-contextmenu-shortcut-' + e.which).parent();if(a.parent().not('.vakata-context-disabled')){a.click();}});$(document).on("mousedown.vakata.jstree",function(e){if(vakata_context.is_visible && !$.contains(vakata_context.element[0],e.target)){$.vakata.context.hide();}}).on("context_show.vakata.jstree",function(e,data){vakata_context.element.find("li:has(ul)").children("a").addClass("vakata-context-parent");if(right_to_left){vakata_context.element.addClass("vakata-context-rtl").css("direction","rtl");} // also apply a RTL class?
vakata_context.element.find("ul").hide().end();});});})($); // $.jstree.defaults.plugins.push("contextmenu");
/**
 * ### Drag'n'drop plugin
 *
 * Enables dragging and dropping of nodes in the tree, resulting in a move or copy operations.
 */ /**
	 * stores all defaults for the drag'n'drop plugin
	 * @name $.jstree.defaults.dnd
	 * @plugin dnd
	 */$.jstree.defaults.dnd = { /**
		 * a boolean indicating if a copy should be possible while dragging (by pressint the meta key or Ctrl). Defaults to `true`.
		 * @name $.jstree.defaults.dnd.copy
		 * @plugin dnd
		 */copy:true, /**
		 * a number indicating how long a node should remain hovered while dragging to be opened. Defaults to `500`.
		 * @name $.jstree.defaults.dnd.open_timeout
		 * @plugin dnd
		 */open_timeout:500, /**
		 * a function invoked each time a node is about to be dragged, invoked in the tree's scope and receives the nodes about to be dragged as an argument (array) and the event that started the drag - return `false` to prevent dragging
		 * @name $.jstree.defaults.dnd.is_draggable
		 * @plugin dnd
		 */is_draggable:true, /**
		 * a boolean indicating if checks should constantly be made while the user is dragging the node (as opposed to checking only on drop), default is `true`
		 * @name $.jstree.defaults.dnd.check_while_dragging
		 * @plugin dnd
		 */check_while_dragging:true, /**
		 * a boolean indicating if nodes from this tree should only be copied with dnd (as opposed to moved), default is `false`
		 * @name $.jstree.defaults.dnd.always_copy
		 * @plugin dnd
		 */always_copy:false, /**
		 * when dropping a node "inside", this setting indicates the position the node should go to - it can be an integer or a string: "first" (same as 0) or "last", default is `0`
		 * @name $.jstree.defaults.dnd.inside_pos
		 * @plugin dnd
		 */inside_pos:0, /**
		 * when starting the drag on a node that is selected this setting controls if all selected nodes are dragged or only the single node, default is `true`, which means all selected nodes are dragged when the drag is started on a selected node
		 * @name $.jstree.defaults.dnd.drag_selection
		 * @plugin dnd
		 */drag_selection:true, /**
		 * controls whether dnd works on touch devices. If left as boolean true dnd will work the same as in desktop browsers, which in some cases may impair scrolling. If set to boolean false dnd will not work on touch devices. There is a special third option - string "selected" which means only selected nodes can be dragged on touch devices.
		 * @name $.jstree.defaults.dnd.touch
		 * @plugin dnd
		 */touch:true, /**
		 * controls whether items can be dropped anywhere on the node, not just on the anchor, by default only the node anchor is a valid drop target. Works best with the wholerow plugin. If enabled on mobile depending on the interface it might be hard for the user to cancel the drop, since the whole tree container will be a valid drop target.
		 * @name $.jstree.defaults.dnd.large_drop_target
		 * @plugin dnd
		 */large_drop_target:false, /**
		 * controls whether a drag can be initiated from any part of the node and not just the text/icon part, works best with the wholerow plugin. Keep in mind it can cause problems with tree scrolling on mobile depending on the interface - in that case set the touch option to "selected".
		 * @name $.jstree.defaults.dnd.large_drag_target
		 * @plugin dnd
		 */large_drag_target:false}; // TODO: now check works by checking for each node individually, how about max_children, unique, etc?
$.jstree.plugins.dnd = function(options,parent){this.bind = function(){parent.bind.call(this);this.element.on('mousedown.jstree touchstart.jstree',this.settings.dnd.large_drag_target?'.jstree-node':'.jstree-anchor',$.proxy(function(e){if(this.settings.dnd.large_drag_target && $(e.target).closest('.jstree-node')[0] !== e.currentTarget){return true;}if(e.type === "touchstart" && (!this.settings.dnd.touch || this.settings.dnd.touch === 'selected' && !$(e.currentTarget).closest('.jstree-node').children('.jstree-anchor').hasClass('jstree-clicked'))){return true;}var obj=this.get_node(e.target),mlt=this.is_selected(obj) && this.settings.dnd.drag_selection?this.get_top_selected().length:1,txt=mlt > 1?mlt + ' ' + this.get_string('nodes'):this.get_text(e.currentTarget);if(this.settings.core.force_text){txt = $.vakata.html.escape(txt);}if(obj && obj.id && obj.id !== $.jstree.root && (e.which === 1 || e.type === "touchstart") && (this.settings.dnd.is_draggable === true || $.isFunction(this.settings.dnd.is_draggable) && this.settings.dnd.is_draggable.call(this,mlt > 1?this.get_top_selected(true):[obj],e))){this.element.trigger('mousedown.jstree');return $.vakata.dnd.start(e,{'jstree':true,'origin':this,'obj':this.get_node(obj,true),'nodes':mlt > 1?this.get_top_selected():[obj.id]},'<div id="jstree-dnd" class="jstree-' + this.get_theme() + ' jstree-' + this.get_theme() + '-' + this.get_theme_variant() + ' ' + (this.settings.core.themes.responsive?' jstree-dnd-responsive':'') + '"><i class="jstree-icon jstree-er"></i>' + txt + '<ins class="jstree-copy" style="display:none;">+</ins></div>');}},this));};};$(function(){ // bind only once for all instances
var lastmv=false,laster=false,lastev=false,opento=false,marker=$('<div id="jstree-marker">&#160;</div>').hide(); //.appendTo('body');
$(document).on('dnd_start.vakata.jstree',function(e,data){lastmv = false;lastev = false;if(!data || !data.data || !data.data.jstree){return;}marker.appendTo('body'); //.show();
}).on('dnd_move.vakata.jstree',function(e,data){if(opento){clearTimeout(opento);}if(!data || !data.data || !data.data.jstree){return;} // if we are hovering the marker image do nothing (can happen on "inside" drags)
if(data.event.target.id && data.event.target.id === 'jstree-marker'){return;}lastev = data.event;var ins=$.jstree.reference(data.event.target),ref=false,off=false,rel=false,tmp,l,t,h,p,i,o,ok,t1,t2,op,ps,pr,ip,tm; // if we are over an instance
if(ins && ins._data && ins._data.dnd){marker.attr('class','jstree-' + ins.get_theme() + (ins.settings.core.themes.responsive?' jstree-dnd-responsive':''));data.helper.children().attr('class','jstree-' + ins.get_theme() + ' jstree-' + ins.get_theme() + '-' + ins.get_theme_variant() + ' ' + (ins.settings.core.themes.responsive?' jstree-dnd-responsive':'')).find('.jstree-copy').first()[data.data.origin && (data.data.origin.settings.dnd.always_copy || data.data.origin.settings.dnd.copy && (data.event.metaKey || data.event.ctrlKey))?'show':'hide'](); // if are hovering the container itself add a new root node
if((data.event.target === ins.element[0] || data.event.target === ins.get_container_ul()[0]) && ins.get_container_ul().children().length === 0){ok = true;for(t1 = 0,t2 = data.data.nodes.length;t1 < t2;t1++) {ok = ok && ins.check(data.data.origin && (data.data.origin.settings.dnd.always_copy || data.data.origin.settings.dnd.copy && (data.event.metaKey || data.event.ctrlKey))?"copy_node":"move_node",data.data.origin && data.data.origin !== ins?data.data.origin.get_node(data.data.nodes[t1]):data.data.nodes[t1],$.jstree.root,'last',{'dnd':true,'ref':ins.get_node($.jstree.root),'pos':'i','origin':data.data.origin,'is_multi':data.data.origin && data.data.origin !== ins,'is_foreign':!data.data.origin});if(!ok){break;}}if(ok){lastmv = {'ins':ins,'par':$.jstree.root,'pos':'last'};marker.hide();data.helper.find('.jstree-icon').first().removeClass('jstree-er').addClass('jstree-ok');return;}}else { // if we are hovering a tree node
ref = ins.settings.dnd.large_drop_target?$(data.event.target).closest('.jstree-node').children('.jstree-anchor'):$(data.event.target).closest('.jstree-anchor');if(ref && ref.length && ref.parent().is('.jstree-closed, .jstree-open, .jstree-leaf')){off = ref.offset();rel = data.event.pageY - off.top;h = ref.outerHeight();if(rel < h / 3){o = ['b','i','a'];}else if(rel > h - h / 3){o = ['a','i','b'];}else {o = rel > h / 2?['i','a','b']:['i','b','a'];}$.each(o,function(j,v){switch(v){case 'b':l = off.left - 6;t = off.top;p = ins.get_parent(ref);i = ref.parent().index();break;case 'i':ip = ins.settings.dnd.inside_pos;tm = ins.get_node(ref.parent());l = off.left - 2;t = off.top + h / 2 + 1;p = tm.id;i = ip === 'first'?0:ip === 'last'?tm.children.length:Math.min(ip,tm.children.length);break;case 'a':l = off.left - 6;t = off.top + h;p = ins.get_parent(ref);i = ref.parent().index() + 1;break;}ok = true;for(t1 = 0,t2 = data.data.nodes.length;t1 < t2;t1++) {op = data.data.origin && (data.data.origin.settings.dnd.always_copy || data.data.origin.settings.dnd.copy && (data.event.metaKey || data.event.ctrlKey))?"copy_node":"move_node";ps = i;if(op === "move_node" && v === 'a' && (data.data.origin && data.data.origin === ins) && p === ins.get_parent(data.data.nodes[t1])){pr = ins.get_node(p);if(ps > $.inArray(data.data.nodes[t1],pr.children)){ps -= 1;}}ok = ok && (ins && ins.settings && ins.settings.dnd && ins.settings.dnd.check_while_dragging === false || ins.check(op,data.data.origin && data.data.origin !== ins?data.data.origin.get_node(data.data.nodes[t1]):data.data.nodes[t1],p,ps,{'dnd':true,'ref':ins.get_node(ref.parent()),'pos':v,'origin':data.data.origin,'is_multi':data.data.origin && data.data.origin !== ins,'is_foreign':!data.data.origin}));if(!ok){if(ins && ins.last_error){laster = ins.last_error();}break;}}if(v === 'i' && ref.parent().is('.jstree-closed') && ins.settings.dnd.open_timeout){opento = setTimeout((function(x,z){return function(){x.open_node(z);};})(ins,ref),ins.settings.dnd.open_timeout);}if(ok){lastmv = {'ins':ins,'par':p,'pos':v === 'i' && ip === 'last' && i === 0 && !ins.is_loaded(tm)?'last':i};marker.css({'left':l + 'px','top':t + 'px'}).show();data.helper.find('.jstree-icon').first().removeClass('jstree-er').addClass('jstree-ok');laster = {};o = true;return false;}});if(o === true){return;}}}}lastmv = false;data.helper.find('.jstree-icon').removeClass('jstree-ok').addClass('jstree-er');marker.hide();}).on('dnd_scroll.vakata.jstree',function(e,data){if(!data || !data.data || !data.data.jstree){return;}marker.hide();lastmv = false;lastev = false;data.helper.find('.jstree-icon').first().removeClass('jstree-ok').addClass('jstree-er');}).on('dnd_stop.vakata.jstree',function(e,data){if(opento){clearTimeout(opento);}if(!data || !data.data || !data.data.jstree){return;}marker.hide().detach();var i,j,nodes=[];if(lastmv){for(i = 0,j = data.data.nodes.length;i < j;i++) {nodes[i] = data.data.origin?data.data.origin.get_node(data.data.nodes[i]):data.data.nodes[i];}lastmv.ins[data.data.origin && (data.data.origin.settings.dnd.always_copy || data.data.origin.settings.dnd.copy && (data.event.metaKey || data.event.ctrlKey))?'copy_node':'move_node'](nodes,lastmv.par,lastmv.pos,false,false,false,data.data.origin);}else {i = $(data.event.target).closest('.jstree');if(i.length && laster && laster.error && laster.error === 'check'){i = i.jstree(true);if(i){i.settings.core.error.call(this,laster);}}}lastev = false;lastmv = false;}).on('keyup.jstree keydown.jstree',function(e,data){data = $.vakata.dnd._get();if(data && data.data && data.data.jstree){data.helper.find('.jstree-copy').first()[data.data.origin && (data.data.origin.settings.dnd.always_copy || data.data.origin.settings.dnd.copy && (e.metaKey || e.ctrlKey))?'show':'hide']();if(lastev){lastev.metaKey = e.metaKey;lastev.ctrlKey = e.ctrlKey;$.vakata.dnd._trigger('move',lastev);}}});}); // helpers
(function($){$.vakata.html = {div:$('<div />'),escape:function escape(str){return $.vakata.html.div.text(str).html();},strip:function strip(str){return $.vakata.html.div.empty().append($.parseHTML(str)).text();}}; // private variable
var vakata_dnd={element:false,target:false,is_down:false,is_drag:false,helper:false,helper_w:0,data:false,init_x:0,init_y:0,scroll_l:0,scroll_t:0,scroll_e:false,scroll_i:false,is_touch:false};$.vakata.dnd = {settings:{scroll_speed:10,scroll_proximity:20,helper_left:5,helper_top:10,threshold:5,threshold_touch:50},_trigger:function _trigger(event_name,e){var data=$.vakata.dnd._get();data.event = e;$(document).triggerHandler("dnd_" + event_name + ".vakata",data);},_get:function _get(){return {"data":vakata_dnd.data,"element":vakata_dnd.element,"helper":vakata_dnd.helper};},_clean:function _clean(){if(vakata_dnd.helper){vakata_dnd.helper.remove();}if(vakata_dnd.scroll_i){clearInterval(vakata_dnd.scroll_i);vakata_dnd.scroll_i = false;}vakata_dnd = {element:false,target:false,is_down:false,is_drag:false,helper:false,helper_w:0,data:false,init_x:0,init_y:0,scroll_l:0,scroll_t:0,scroll_e:false,scroll_i:false,is_touch:false};$(document).off("mousemove.vakata.jstree touchmove.vakata.jstree",$.vakata.dnd.drag);$(document).off("mouseup.vakata.jstree touchend.vakata.jstree",$.vakata.dnd.stop);},_scroll:function _scroll(init_only){if(!vakata_dnd.scroll_e || !vakata_dnd.scroll_l && !vakata_dnd.scroll_t){if(vakata_dnd.scroll_i){clearInterval(vakata_dnd.scroll_i);vakata_dnd.scroll_i = false;}return false;}if(!vakata_dnd.scroll_i){vakata_dnd.scroll_i = setInterval($.vakata.dnd._scroll,100);return false;}if(init_only === true){return false;}var i=vakata_dnd.scroll_e.scrollTop(),j=vakata_dnd.scroll_e.scrollLeft();vakata_dnd.scroll_e.scrollTop(i + vakata_dnd.scroll_t * $.vakata.dnd.settings.scroll_speed);vakata_dnd.scroll_e.scrollLeft(j + vakata_dnd.scroll_l * $.vakata.dnd.settings.scroll_speed);if(i !== vakata_dnd.scroll_e.scrollTop() || j !== vakata_dnd.scroll_e.scrollLeft()){ /**
					 * triggered on the document when a drag causes an element to scroll
					 * @event
					 * @plugin dnd
					 * @name dnd_scroll.vakata
					 * @param {Mixed} data any data supplied with the call to $.vakata.dnd.start
					 * @param {DOM} element the DOM element being dragged
					 * @param {jQuery} helper the helper shown next to the mouse
					 * @param {jQuery} event the element that is scrolling
					 */$.vakata.dnd._trigger("scroll",vakata_dnd.scroll_e);}},start:function start(e,data,html){if(e.type === "touchstart" && e.originalEvent && e.originalEvent.changedTouches && e.originalEvent.changedTouches[0]){e.pageX = e.originalEvent.changedTouches[0].pageX;e.pageY = e.originalEvent.changedTouches[0].pageY;e.target = document.elementFromPoint(e.originalEvent.changedTouches[0].pageX - window.pageXOffset,e.originalEvent.changedTouches[0].pageY - window.pageYOffset);}if(vakata_dnd.is_drag){$.vakata.dnd.stop({});}try{e.currentTarget.unselectable = "on";e.currentTarget.onselectstart = function(){return false;};if(e.currentTarget.style){e.currentTarget.style.MozUserSelect = "none";}}catch(ignore) {}vakata_dnd.init_x = e.pageX;vakata_dnd.init_y = e.pageY;vakata_dnd.data = data;vakata_dnd.is_down = true;vakata_dnd.element = e.currentTarget;vakata_dnd.target = e.target;vakata_dnd.is_touch = e.type === "touchstart";if(html !== false){vakata_dnd.helper = $("<div id='vakata-dnd'></div>").html(html).css({"display":"block","margin":"0","padding":"0","position":"absolute","top":"-2000px","lineHeight":"16px","zIndex":"10000"});}$(document).on("mousemove.vakata.jstree touchmove.vakata.jstree",$.vakata.dnd.drag);$(document).on("mouseup.vakata.jstree touchend.vakata.jstree",$.vakata.dnd.stop);return false;},drag:function drag(e){if(e.type === "touchmove" && e.originalEvent && e.originalEvent.changedTouches && e.originalEvent.changedTouches[0]){e.pageX = e.originalEvent.changedTouches[0].pageX;e.pageY = e.originalEvent.changedTouches[0].pageY;e.target = document.elementFromPoint(e.originalEvent.changedTouches[0].pageX - window.pageXOffset,e.originalEvent.changedTouches[0].pageY - window.pageYOffset);}if(!vakata_dnd.is_down){return;}if(!vakata_dnd.is_drag){if(Math.abs(e.pageX - vakata_dnd.init_x) > (vakata_dnd.is_touch?$.vakata.dnd.settings.threshold_touch:$.vakata.dnd.settings.threshold) || Math.abs(e.pageY - vakata_dnd.init_y) > (vakata_dnd.is_touch?$.vakata.dnd.settings.threshold_touch:$.vakata.dnd.settings.threshold)){if(vakata_dnd.helper){vakata_dnd.helper.appendTo("body");vakata_dnd.helper_w = vakata_dnd.helper.outerWidth();}vakata_dnd.is_drag = true; /**
						 * triggered on the document when a drag starts
						 * @event
						 * @plugin dnd
						 * @name dnd_start.vakata
						 * @param {Mixed} data any data supplied with the call to $.vakata.dnd.start
						 * @param {DOM} element the DOM element being dragged
						 * @param {jQuery} helper the helper shown next to the mouse
						 * @param {Object} event the event that caused the start (probably mousemove)
						 */$.vakata.dnd._trigger("start",e);}else {return;}}var d=false,w=false,dh=false,wh=false,dw=false,ww=false,dt=false,dl=false,ht=false,hl=false;vakata_dnd.scroll_t = 0;vakata_dnd.scroll_l = 0;vakata_dnd.scroll_e = false;$($(e.target).parentsUntil("body").addBack().get().reverse()).filter(function(){return (/^auto|scroll$/.test($(this).css("overflow")) && (this.scrollHeight > this.offsetHeight || this.scrollWidth > this.offsetWidth));}).each(function(){var t=$(this),o=t.offset();if(this.scrollHeight > this.offsetHeight){if(o.top + t.height() - e.pageY < $.vakata.dnd.settings.scroll_proximity){vakata_dnd.scroll_t = 1;}if(e.pageY - o.top < $.vakata.dnd.settings.scroll_proximity){vakata_dnd.scroll_t = -1;}}if(this.scrollWidth > this.offsetWidth){if(o.left + t.width() - e.pageX < $.vakata.dnd.settings.scroll_proximity){vakata_dnd.scroll_l = 1;}if(e.pageX - o.left < $.vakata.dnd.settings.scroll_proximity){vakata_dnd.scroll_l = -1;}}if(vakata_dnd.scroll_t || vakata_dnd.scroll_l){vakata_dnd.scroll_e = $(this);return false;}});if(!vakata_dnd.scroll_e){d = $(document);w = $(window);dh = d.height();wh = w.height();dw = d.width();ww = w.width();dt = d.scrollTop();dl = d.scrollLeft();if(dh > wh && e.pageY - dt < $.vakata.dnd.settings.scroll_proximity){vakata_dnd.scroll_t = -1;}if(dh > wh && wh - (e.pageY - dt) < $.vakata.dnd.settings.scroll_proximity){vakata_dnd.scroll_t = 1;}if(dw > ww && e.pageX - dl < $.vakata.dnd.settings.scroll_proximity){vakata_dnd.scroll_l = -1;}if(dw > ww && ww - (e.pageX - dl) < $.vakata.dnd.settings.scroll_proximity){vakata_dnd.scroll_l = 1;}if(vakata_dnd.scroll_t || vakata_dnd.scroll_l){vakata_dnd.scroll_e = d;}}if(vakata_dnd.scroll_e){$.vakata.dnd._scroll(true);}if(vakata_dnd.helper){ht = parseInt(e.pageY + $.vakata.dnd.settings.helper_top,10);hl = parseInt(e.pageX + $.vakata.dnd.settings.helper_left,10);if(dh && ht + 25 > dh){ht = dh - 50;}if(dw && hl + vakata_dnd.helper_w > dw){hl = dw - (vakata_dnd.helper_w + 2);}vakata_dnd.helper.css({left:hl + "px",top:ht + "px"});} /**
				 * triggered on the document when a drag is in progress
				 * @event
				 * @plugin dnd
				 * @name dnd_move.vakata
				 * @param {Mixed} data any data supplied with the call to $.vakata.dnd.start
				 * @param {DOM} element the DOM element being dragged
				 * @param {jQuery} helper the helper shown next to the mouse
				 * @param {Object} event the event that caused this to trigger (most likely mousemove)
				 */$.vakata.dnd._trigger("move",e);return false;},stop:function stop(e){if(e.type === "touchend" && e.originalEvent && e.originalEvent.changedTouches && e.originalEvent.changedTouches[0]){e.pageX = e.originalEvent.changedTouches[0].pageX;e.pageY = e.originalEvent.changedTouches[0].pageY;e.target = document.elementFromPoint(e.originalEvent.changedTouches[0].pageX - window.pageXOffset,e.originalEvent.changedTouches[0].pageY - window.pageYOffset);}if(vakata_dnd.is_drag){ /**
					 * triggered on the document when a drag stops (the dragged element is dropped)
					 * @event
					 * @plugin dnd
					 * @name dnd_stop.vakata
					 * @param {Mixed} data any data supplied with the call to $.vakata.dnd.start
					 * @param {DOM} element the DOM element being dragged
					 * @param {jQuery} helper the helper shown next to the mouse
					 * @param {Object} event the event that caused the stop
					 */$.vakata.dnd._trigger("stop",e);}else {if(e.type === "touchend" && e.target === vakata_dnd.target){var to=setTimeout(function(){$(e.target).click();},100);$(e.target).one('click',function(){if(to){clearTimeout(to);}});}}$.vakata.dnd._clean();return false;}};})($); // include the dnd plugin by default
// $.jstree.defaults.plugins.push("dnd");
/**
 * ### Massload plugin
 *
 * Adds massload functionality to jsTree, so that multiple nodes can be loaded in a single request (only useful with lazy loading).
 */ /**
	 * massload configuration
	 *
	 * It is possible to set this to a standard jQuery-like AJAX config.
	 * In addition to the standard jQuery ajax options here you can supply functions for `data` and `url`, the functions will be run in the current instance's scope and a param will be passed indicating which node IDs need to be loaded, the return value of those functions will be used.
	 *
	 * You can also set this to a function, that function will receive the node IDs being loaded as argument and a second param which is a function (callback) which should be called with the result.
	 *
	 * Both the AJAX and the function approach rely on the same return value - an object where the keys are the node IDs, and the value is the children of that node as an array.
	 *
	 *	{
	 *		"id1" : [{ "text" : "Child of ID1", "id" : "c1" }, { "text" : "Another child of ID1", "id" : "c2" }],
	 *		"id2" : [{ "text" : "Child of ID2", "id" : "c3" }]
	 *	}
	 * 
	 * @name $.jstree.defaults.massload
	 * @plugin massload
	 */$.jstree.defaults.massload = null;$.jstree.plugins.massload = function(options,parent){this.init = function(el,options){parent.init.call(this,el,options);this._data.massload = {};};this._load_nodes = function(nodes,callback,is_callback){var s=this.settings.massload;if(is_callback && !$.isEmptyObject(this._data.massload)){return parent._load_nodes.call(this,nodes,callback,is_callback);}if($.isFunction(s)){return s.call(this,nodes,$.proxy(function(data){if(data){for(var i in data) {if(data.hasOwnProperty(i)){this._data.massload[i] = data[i];}}}parent._load_nodes.call(this,nodes,callback,is_callback);},this));}if(typeof s === 'object' && s && s.url){s = $.extend(true,{},s);if($.isFunction(s.url)){s.url = s.url.call(this,nodes);}if($.isFunction(s.data)){s.data = s.data.call(this,nodes);}return $.ajax(s).done($.proxy(function(data,t,x){if(data){for(var i in data) {if(data.hasOwnProperty(i)){this._data.massload[i] = data[i];}}}parent._load_nodes.call(this,nodes,callback,is_callback);},this)).fail($.proxy(function(f){parent._load_nodes.call(this,nodes,callback,is_callback);},this));}return parent._load_nodes.call(this,nodes,callback,is_callback);};this._load_node = function(obj,callback){var d=this._data.massload[obj.id];if(d){return this[typeof d === 'string'?'_append_html_data':'_append_json_data'](obj,typeof d === 'string'?$($.parseHTML(d)).filter(function(){return this.nodeType !== 3;}):d,function(status){callback.call(this,status);delete this._data.massload[obj.id];});}return parent._load_node.call(this,obj,callback);};}; /**
 * ### Search plugin
 *
 * Adds search functionality to jsTree.
 */ /**
	 * stores all defaults for the search plugin
	 * @name $.jstree.defaults.search
	 * @plugin search
	 */$.jstree.defaults.search = { /**
		 * a jQuery-like AJAX config, which jstree uses if a server should be queried for results. 
		 * 
		 * A `str` (which is the search string) parameter will be added with the request, an optional `inside` parameter will be added if the search is limited to a node id. The expected result is a JSON array with nodes that need to be opened so that matching nodes will be revealed.
		 * Leave this setting as `false` to not query the server. You can also set this to a function, which will be invoked in the instance's scope and receive 3 parameters - the search string, the callback to call with the array of nodes to load, and the optional node ID to limit the search to 
		 * @name $.jstree.defaults.search.ajax
		 * @plugin search
		 */ajax:false, /**
		 * Indicates if the search should be fuzzy or not (should `chnd3` match `child node 3`). Default is `false`.
		 * @name $.jstree.defaults.search.fuzzy
		 * @plugin search
		 */fuzzy:false, /**
		 * Indicates if the search should be case sensitive. Default is `false`.
		 * @name $.jstree.defaults.search.case_sensitive
		 * @plugin search
		 */case_sensitive:false, /**
		 * Indicates if the tree should be filtered (by default) to show only matching nodes (keep in mind this can be a heavy on large trees in old browsers). 
		 * This setting can be changed at runtime when calling the search method. Default is `false`.
		 * @name $.jstree.defaults.search.show_only_matches
		 * @plugin search
		 */show_only_matches:false, /**
		 * Indicates if the children of matched element are shown (when show_only_matches is true)
		 * This setting can be changed at runtime when calling the search method. Default is `false`.
		 * @name $.jstree.defaults.search.show_only_matches_children
		 * @plugin search
		 */show_only_matches_children:false, /**
		 * Indicates if all nodes opened to reveal the search result, should be closed when the search is cleared or a new search is performed. Default is `true`.
		 * @name $.jstree.defaults.search.close_opened_onclear
		 * @plugin search
		 */close_opened_onclear:true, /**
		 * Indicates if only leaf nodes should be included in search results. Default is `false`.
		 * @name $.jstree.defaults.search.search_leaves_only
		 * @plugin search
		 */search_leaves_only:false, /**
		 * If set to a function it wil be called in the instance's scope with two arguments - search string and node (where node will be every node in the structure, so use with caution).
		 * If the function returns a truthy value the node will be considered a match (it might not be displayed if search_only_leaves is set to true and the node is not a leaf). Default is `false`.
		 * @name $.jstree.defaults.search.search_callback
		 * @plugin search
		 */search_callback:false};$.jstree.plugins.search = function(options,parent){this.bind = function(){parent.bind.call(this);this._data.search.str = "";this._data.search.dom = $();this._data.search.res = [];this._data.search.opn = [];this._data.search.som = false;this._data.search.smc = false;this._data.search.hdn = [];this.element.on("search.jstree",$.proxy(function(e,data){if(this._data.search.som && data.res.length){var m=this._model.data,i,j,p=[];for(i = 0,j = data.res.length;i < j;i++) {if(m[data.res[i]] && !m[data.res[i]].state.hidden){p.push(data.res[i]);p = p.concat(m[data.res[i]].parents);if(this._data.search.smc){p = p.concat(m[data.res[i]].children_d);}}}p = $.vakata.array_remove_item($.vakata.array_unique(p),$.jstree.root);this._data.search.hdn = this.hide_all(true);this.show_node(p);}},this)).on("clear_search.jstree",$.proxy(function(e,data){if(this._data.search.som && data.res.length){this.show_node(this._data.search.hdn);}},this));}; /**
		 * used to search the tree nodes for a given string
		 * @name search(str [, skip_async])
		 * @param {String} str the search string
		 * @param {Boolean} skip_async if set to true server will not be queried even if configured
		 * @param {Boolean} show_only_matches if set to true only matching nodes will be shown (keep in mind this can be very slow on large trees or old browsers)
		 * @param {mixed} inside an optional node to whose children to limit the search
		 * @param {Boolean} append if set to true the results of this search are appended to the previous search
		 * @plugin search
		 * @trigger search.jstree
		 */this.search = function(str,skip_async,show_only_matches,inside,append,show_only_matches_children){if(str === false || $.trim(str.toString()) === ""){return this.clear_search();}inside = this.get_node(inside);inside = inside && inside.id?inside.id:null;str = str.toString();var s=this.settings.search,a=s.ajax?s.ajax:false,m=this._model.data,f=null,r=[],p=[],i,j;if(this._data.search.res.length && !append){this.clear_search();}if(show_only_matches === undefined){show_only_matches = s.show_only_matches;}if(show_only_matches_children === undefined){show_only_matches_children = s.show_only_matches_children;}if(!skip_async && a !== false){if($.isFunction(a)){return a.call(this,str,$.proxy(function(d){if(d && d.d){d = d.d;}this._load_nodes(!$.isArray(d)?[]:$.vakata.array_unique(d),function(){this.search(str,true,show_only_matches,inside,append);},true);},this),inside);}else {a = $.extend({},a);if(!a.data){a.data = {};}a.data.str = str;if(inside){a.data.inside = inside;}return $.ajax(a).fail($.proxy(function(){this._data.core.last_error = {'error':'ajax','plugin':'search','id':'search_01','reason':'Could not load search parents','data':JSON.stringify(a)};this.settings.core.error.call(this,this._data.core.last_error);},this)).done($.proxy(function(d){if(d && d.d){d = d.d;}this._load_nodes(!$.isArray(d)?[]:$.vakata.array_unique(d),function(){this.search(str,true,show_only_matches,inside,append);},true);},this));}}if(!append){this._data.search.str = str;this._data.search.dom = $();this._data.search.res = [];this._data.search.opn = [];this._data.search.som = show_only_matches;this._data.search.smc = show_only_matches_children;}f = new $.vakata.search(str,true,{caseSensitive:s.case_sensitive,fuzzy:s.fuzzy});$.each(m[inside?inside:$.jstree.root].children_d,function(ii,i){var v=m[i];if(v.text && (!s.search_leaves_only || v.state.loaded && v.children.length === 0) && (s.search_callback && s.search_callback.call(this,str,v) || !s.search_callback && f.search(v.text).isMatch)){r.push(i);p = p.concat(v.parents);}});if(r.length){p = $.vakata.array_unique(p);for(i = 0,j = p.length;i < j;i++) {if(p[i] !== $.jstree.root && m[p[i]] && this.open_node(p[i],null,0) === true){this._data.search.opn.push(p[i]);}}if(!append){this._data.search.dom = $(this.element[0].querySelectorAll('#' + $.map(r,function(v){return "0123456789".indexOf(v[0]) !== -1?'\\3' + v[0] + ' ' + v.substr(1).replace($.jstree.idregex,'\\$&'):v.replace($.jstree.idregex,'\\$&');}).join(', #')));this._data.search.res = r;}else {this._data.search.dom = this._data.search.dom.add($(this.element[0].querySelectorAll('#' + $.map(r,function(v){return "0123456789".indexOf(v[0]) !== -1?'\\3' + v[0] + ' ' + v.substr(1).replace($.jstree.idregex,'\\$&'):v.replace($.jstree.idregex,'\\$&');}).join(', #'))));this._data.search.res = $.vakata.array_unique(this._data.search.res.concat(r));}this._data.search.dom.children(".jstree-anchor").addClass('jstree-search');} /**
			 * triggered after search is complete
			 * @event
			 * @name search.jstree
			 * @param {jQuery} nodes a jQuery collection of matching nodes
			 * @param {String} str the search string
			 * @param {Array} res a collection of objects represeing the matching nodes
			 * @plugin search
			 */this.trigger('search',{nodes:this._data.search.dom,str:str,res:this._data.search.res,show_only_matches:show_only_matches});}; /**
		 * used to clear the last search (removes classes and shows all nodes if filtering is on)
		 * @name clear_search()
		 * @plugin search
		 * @trigger clear_search.jstree
		 */this.clear_search = function(){if(this.settings.search.close_opened_onclear){this.close_node(this._data.search.opn,0);} /**
			 * triggered after search is complete
			 * @event
			 * @name clear_search.jstree
			 * @param {jQuery} nodes a jQuery collection of matching nodes (the result from the last search)
			 * @param {String} str the search string (the last search string)
			 * @param {Array} res a collection of objects represeing the matching nodes (the result from the last search)
			 * @plugin search
			 */this.trigger('clear_search',{'nodes':this._data.search.dom,str:this._data.search.str,res:this._data.search.res});if(this._data.search.res.length){this._data.search.dom = $(this.element[0].querySelectorAll('#' + $.map(this._data.search.res,function(v){return "0123456789".indexOf(v[0]) !== -1?'\\3' + v[0] + ' ' + v.substr(1).replace($.jstree.idregex,'\\$&'):v.replace($.jstree.idregex,'\\$&');}).join(', #')));this._data.search.dom.children(".jstree-anchor").removeClass("jstree-search");}this._data.search.str = "";this._data.search.res = [];this._data.search.opn = [];this._data.search.dom = $();};this.redraw_node = function(obj,deep,callback,force_render){obj = parent.redraw_node.apply(this,arguments);if(obj){if($.inArray(obj.id,this._data.search.res) !== -1){var i,j,tmp=null;for(i = 0,j = obj.childNodes.length;i < j;i++) {if(obj.childNodes[i] && obj.childNodes[i].className && obj.childNodes[i].className.indexOf("jstree-anchor") !== -1){tmp = obj.childNodes[i];break;}}if(tmp){tmp.className += ' jstree-search';}}}return obj;};}; // helpers
(function($){ // from http://kiro.me/projects/fuse.html
$.vakata.search = function(pattern,txt,options){options = options || {};options = $.extend({},$.vakata.search.defaults,options);if(options.fuzzy !== false){options.fuzzy = true;}pattern = options.caseSensitive?pattern:pattern.toLowerCase();var MATCH_LOCATION=options.location,MATCH_DISTANCE=options.distance,MATCH_THRESHOLD=options.threshold,patternLen=pattern.length,matchmask,pattern_alphabet,match_bitapScore,search;if(patternLen > 32){options.fuzzy = false;}if(options.fuzzy){matchmask = 1 << patternLen - 1;pattern_alphabet = (function(){var mask={},i=0;for(i = 0;i < patternLen;i++) {mask[pattern.charAt(i)] = 0;}for(i = 0;i < patternLen;i++) {mask[pattern.charAt(i)] |= 1 << patternLen - i - 1;}return mask;})();match_bitapScore = function(e,x){var accuracy=e / patternLen,proximity=Math.abs(MATCH_LOCATION - x);if(!MATCH_DISTANCE){return proximity?1.0:accuracy;}return accuracy + proximity / MATCH_DISTANCE;};}search = function(text){text = options.caseSensitive?text:text.toLowerCase();if(pattern === text || text.indexOf(pattern) !== -1){return {isMatch:true,score:0};}if(!options.fuzzy){return {isMatch:false,score:1};}var i,j,textLen=text.length,scoreThreshold=MATCH_THRESHOLD,bestLoc=text.indexOf(pattern,MATCH_LOCATION),binMin,binMid,binMax=patternLen + textLen,lastRd,start,finish,rd,charMatch,score=1,locations=[];if(bestLoc !== -1){scoreThreshold = Math.min(match_bitapScore(0,bestLoc),scoreThreshold);bestLoc = text.lastIndexOf(pattern,MATCH_LOCATION + patternLen);if(bestLoc !== -1){scoreThreshold = Math.min(match_bitapScore(0,bestLoc),scoreThreshold);}}bestLoc = -1;for(i = 0;i < patternLen;i++) {binMin = 0;binMid = binMax;while(binMin < binMid) {if(match_bitapScore(i,MATCH_LOCATION + binMid) <= scoreThreshold){binMin = binMid;}else {binMax = binMid;}binMid = Math.floor((binMax - binMin) / 2 + binMin);}binMax = binMid;start = Math.max(1,MATCH_LOCATION - binMid + 1);finish = Math.min(MATCH_LOCATION + binMid,textLen) + patternLen;rd = new Array(finish + 2);rd[finish + 1] = (1 << i) - 1;for(j = finish;j >= start;j--) {charMatch = pattern_alphabet[text.charAt(j - 1)];if(i === 0){rd[j] = (rd[j + 1] << 1 | 1) & charMatch;}else {rd[j] = (rd[j + 1] << 1 | 1) & charMatch | ((lastRd[j + 1] | lastRd[j]) << 1 | 1) | lastRd[j + 1];}if(rd[j] & matchmask){score = match_bitapScore(i,j - 1);if(score <= scoreThreshold){scoreThreshold = score;bestLoc = j - 1;locations.push(bestLoc);if(bestLoc > MATCH_LOCATION){start = Math.max(1,2 * MATCH_LOCATION - bestLoc);}else {break;}}}}if(match_bitapScore(i + 1,MATCH_LOCATION) > scoreThreshold){break;}lastRd = rd;}return {isMatch:bestLoc >= 0,score:score};};return txt === true?{'search':search}:search(txt);};$.vakata.search.defaults = {location:0,distance:100,threshold:0.6,fuzzy:false,caseSensitive:false};})($); // include the search plugin by default
// $.jstree.defaults.plugins.push("search");
/**
 * ### Sort plugin
 *
 * Automatically sorts all siblings in the tree according to a sorting function.
 */ /**
	 * the settings function used to sort the nodes.
	 * It is executed in the tree's context, accepts two nodes as arguments and should return `1` or `-1`.
	 * @name $.jstree.defaults.sort
	 * @plugin sort
	 */$.jstree.defaults.sort = function(a,b){ //return this.get_type(a) === this.get_type(b) ? (this.get_text(a) > this.get_text(b) ? 1 : -1) : this.get_type(a) >= this.get_type(b);
return this.get_text(a) > this.get_text(b)?1:-1;};$.jstree.plugins.sort = function(options,parent){this.bind = function(){parent.bind.call(this);this.element.on("model.jstree",$.proxy(function(e,data){this.sort(data.parent,true);},this)).on("rename_node.jstree create_node.jstree",$.proxy(function(e,data){this.sort(data.parent || data.node.parent,false);this.redraw_node(data.parent || data.node.parent,true);},this)).on("move_node.jstree copy_node.jstree",$.proxy(function(e,data){this.sort(data.parent,false);this.redraw_node(data.parent,true);},this));}; /**
		 * used to sort a node's children
		 * @private
		 * @name sort(obj [, deep])
		 * @param  {mixed} obj the node
		 * @param {Boolean} deep if set to `true` nodes are sorted recursively.
		 * @plugin sort
		 * @trigger search.jstree
		 */this.sort = function(obj,deep){var i,j;obj = this.get_node(obj);if(obj && obj.children && obj.children.length){obj.children.sort($.proxy(this.settings.sort,this));if(deep){for(i = 0,j = obj.children_d.length;i < j;i++) {this.sort(obj.children_d[i],false);}}}};}; // include the sort plugin by default
// $.jstree.defaults.plugins.push("sort");
/**
 * ### State plugin
 *
 * Saves the state of the tree (selected nodes, opened nodes) on the user's computer using available options (localStorage, cookies, etc)
 */var to=false; /**
	 * stores all defaults for the state plugin
	 * @name $.jstree.defaults.state
	 * @plugin state
	 */$.jstree.defaults.state = { /**
		 * A string for the key to use when saving the current tree (change if using multiple trees in your project). Defaults to `jstree`.
		 * @name $.jstree.defaults.state.key
		 * @plugin state
		 */key:'jstree', /**
		 * A space separated list of events that trigger a state save. Defaults to `changed.jstree open_node.jstree close_node.jstree`.
		 * @name $.jstree.defaults.state.events
		 * @plugin state
		 */events:'changed.jstree open_node.jstree close_node.jstree check_node.jstree uncheck_node.jstree', /**
		 * Time in milliseconds after which the state will expire. Defaults to 'false' meaning - no expire.
		 * @name $.jstree.defaults.state.ttl
		 * @plugin state
		 */ttl:false, /**
		 * A function that will be executed prior to restoring state with one argument - the state object. Can be used to clear unwanted parts of the state.
		 * @name $.jstree.defaults.state.filter
		 * @plugin state
		 */filter:false};$.jstree.plugins.state = function(options,parent){this.bind = function(){parent.bind.call(this);var bind=$.proxy(function(){this.element.on(this.settings.state.events,$.proxy(function(){if(to){clearTimeout(to);}to = setTimeout($.proxy(function(){this.save_state();},this),100);},this)); /**
				 * triggered when the state plugin is finished restoring the state (and immediately after ready if there is no state to restore).
				 * @event
				 * @name state_ready.jstree
				 * @plugin state
				 */this.trigger('state_ready');},this);this.element.on("ready.jstree",$.proxy(function(e,data){this.element.one("restore_state.jstree",bind);if(!this.restore_state()){bind();}},this));}; /**
		 * save the state
		 * @name save_state()
		 * @plugin state
		 */this.save_state = function(){var st={'state':this.get_state(),'ttl':this.settings.state.ttl,'sec':+new Date()};$.vakata.storage.set(this.settings.state.key,JSON.stringify(st));}; /**
		 * restore the state from the user's computer
		 * @name restore_state()
		 * @plugin state
		 */this.restore_state = function(){var k=$.vakata.storage.get(this.settings.state.key);if(!!k){try{k = JSON.parse(k);}catch(ex) {return false;}}if(!!k && k.ttl && k.sec && +new Date() - k.sec > k.ttl){return false;}if(!!k && k.state){k = k.state;}if(!!k && $.isFunction(this.settings.state.filter)){k = this.settings.state.filter.call(this,k);}if(!!k){this.element.one("set_state.jstree",function(e,data){data.instance.trigger('restore_state',{'state':$.extend(true,{},k)});});this.set_state(k);return true;}return false;}; /**
		 * clear the state on the user's computer
		 * @name clear_state()
		 * @plugin state
		 */this.clear_state = function(){return $.vakata.storage.del(this.settings.state.key);};};(function($,undefined){$.vakata.storage = { // simply specifying the functions in FF throws an error
set:function set(key,val){return window.localStorage.setItem(key,val);},get:function get(key){return window.localStorage.getItem(key);},del:function del(key){return window.localStorage.removeItem(key);}};})($); // include the state plugin by default
// $.jstree.defaults.plugins.push("state");
/**
 * ### Types plugin
 *
 * Makes it possible to add predefined types for groups of nodes, which make it possible to easily control nesting rules and icon for each group.
 */ /**
	 * An object storing all types as key value pairs, where the key is the type name and the value is an object that could contain following keys (all optional).
	 *
	 * * `max_children` the maximum number of immediate children this node type can have. Do not specify or set to `-1` for unlimited.
	 * * `max_depth` the maximum number of nesting this node type can have. A value of `1` would mean that the node can have children, but no grandchildren. Do not specify or set to `-1` for unlimited.
	 * * `valid_children` an array of node type strings, that nodes of this type can have as children. Do not specify or set to `-1` for no limits.
	 * * `icon` a string - can be a path to an icon or a className, if using an image that is in the current directory use a `./` prefix, otherwise it will be detected as a class. Omit to use the default icon from your theme.
	 *
	 * There are two predefined types:
	 *
	 * * `#` represents the root of the tree, for example `max_children` would control the maximum number of root nodes.
	 * * `default` represents the default node - any settings here will be applied to all nodes that do not have a type specified.
	 *
	 * @name $.jstree.defaults.types
	 * @plugin types
	 */$.jstree.defaults.types = {'default':{}};$.jstree.defaults.types[$.jstree.root] = {};$.jstree.plugins.types = function(options,parent){this.init = function(el,options){var i,j;if(options && options.types && options.types['default']){for(i in options.types) {if(i !== "default" && i !== $.jstree.root && options.types.hasOwnProperty(i)){for(j in options.types['default']) {if(options.types['default'].hasOwnProperty(j) && options.types[i][j] === undefined){options.types[i][j] = options.types['default'][j];}}}}}parent.init.call(this,el,options);this._model.data[$.jstree.root].type = $.jstree.root;};this.refresh = function(skip_loading,forget_state){parent.refresh.call(this,skip_loading,forget_state);this._model.data[$.jstree.root].type = $.jstree.root;};this.bind = function(){this.element.on('model.jstree',$.proxy(function(e,data){var m=this._model.data,dpc=data.nodes,t=this.settings.types,i,j,c='default';for(i = 0,j = dpc.length;i < j;i++) {c = 'default';if(m[dpc[i]].original && m[dpc[i]].original.type && t[m[dpc[i]].original.type]){c = m[dpc[i]].original.type;}if(m[dpc[i]].data && m[dpc[i]].data.jstree && m[dpc[i]].data.jstree.type && t[m[dpc[i]].data.jstree.type]){c = m[dpc[i]].data.jstree.type;}m[dpc[i]].type = c;if(m[dpc[i]].icon === true && t[c].icon !== undefined){m[dpc[i]].icon = t[c].icon;}}m[$.jstree.root].type = $.jstree.root;},this));parent.bind.call(this);};this.get_json = function(obj,options,flat){var i,j,m=this._model.data,opt=options?$.extend(true,{},options,{no_id:false}):{},tmp=parent.get_json.call(this,obj,opt,flat);if(tmp === false){return false;}if($.isArray(tmp)){for(i = 0,j = tmp.length;i < j;i++) {tmp[i].type = tmp[i].id && m[tmp[i].id] && m[tmp[i].id].type?m[tmp[i].id].type:"default";if(options && options.no_id){delete tmp[i].id;if(tmp[i].li_attr && tmp[i].li_attr.id){delete tmp[i].li_attr.id;}if(tmp[i].a_attr && tmp[i].a_attr.id){delete tmp[i].a_attr.id;}}}}else {tmp.type = tmp.id && m[tmp.id] && m[tmp.id].type?m[tmp.id].type:"default";if(options && options.no_id){tmp = this._delete_ids(tmp);}}return tmp;};this._delete_ids = function(tmp){if($.isArray(tmp)){for(var i=0,j=tmp.length;i < j;i++) {tmp[i] = this._delete_ids(tmp[i]);}return tmp;}delete tmp.id;if(tmp.li_attr && tmp.li_attr.id){delete tmp.li_attr.id;}if(tmp.a_attr && tmp.a_attr.id){delete tmp.a_attr.id;}if(tmp.children && $.isArray(tmp.children)){tmp.children = this._delete_ids(tmp.children);}return tmp;};this.check = function(chk,obj,par,pos,more){if(parent.check.call(this,chk,obj,par,pos,more) === false){return false;}obj = obj && obj.id?obj:this.get_node(obj);par = par && par.id?par:this.get_node(par);var m=obj && obj.id?more && more.origin?more.origin:$.jstree.reference(obj.id):null,tmp,d,i,j;m = m && m._model && m._model.data?m._model.data:null;switch(chk){case "create_node":case "move_node":case "copy_node":if(chk !== 'move_node' || $.inArray(obj.id,par.children) === -1){tmp = this.get_rules(par);if(tmp.max_children !== undefined && tmp.max_children !== -1 && tmp.max_children === par.children.length){this._data.core.last_error = {'error':'check','plugin':'types','id':'types_01','reason':'max_children prevents function: ' + chk,'data':JSON.stringify({'chk':chk,'pos':pos,'obj':obj && obj.id?obj.id:false,'par':par && par.id?par.id:false})};return false;}if(tmp.valid_children !== undefined && tmp.valid_children !== -1 && $.inArray(obj.type || 'default',tmp.valid_children) === -1){this._data.core.last_error = {'error':'check','plugin':'types','id':'types_02','reason':'valid_children prevents function: ' + chk,'data':JSON.stringify({'chk':chk,'pos':pos,'obj':obj && obj.id?obj.id:false,'par':par && par.id?par.id:false})};return false;}if(m && obj.children_d && obj.parents){d = 0;for(i = 0,j = obj.children_d.length;i < j;i++) {d = Math.max(d,m[obj.children_d[i]].parents.length);}d = d - obj.parents.length + 1;}if(d <= 0 || d === undefined){d = 1;}do {if(tmp.max_depth !== undefined && tmp.max_depth !== -1 && tmp.max_depth < d){this._data.core.last_error = {'error':'check','plugin':'types','id':'types_03','reason':'max_depth prevents function: ' + chk,'data':JSON.stringify({'chk':chk,'pos':pos,'obj':obj && obj.id?obj.id:false,'par':par && par.id?par.id:false})};return false;}par = this.get_node(par.parent);tmp = this.get_rules(par);d++;}while(par);}break;}return true;}; /**
		 * used to retrieve the type settings object for a node
		 * @name get_rules(obj)
		 * @param {mixed} obj the node to find the rules for
		 * @return {Object}
		 * @plugin types
		 */this.get_rules = function(obj){obj = this.get_node(obj);if(!obj){return false;}var tmp=this.get_type(obj,true);if(tmp.max_depth === undefined){tmp.max_depth = -1;}if(tmp.max_children === undefined){tmp.max_children = -1;}if(tmp.valid_children === undefined){tmp.valid_children = -1;}return tmp;}; /**
		 * used to retrieve the type string or settings object for a node
		 * @name get_type(obj [, rules])
		 * @param {mixed} obj the node to find the rules for
		 * @param {Boolean} rules if set to `true` instead of a string the settings object will be returned
		 * @return {String|Object}
		 * @plugin types
		 */this.get_type = function(obj,rules){obj = this.get_node(obj);return !obj?false:rules?$.extend({'type':obj.type},this.settings.types[obj.type]):obj.type;}; /**
		 * used to change a node's type
		 * @name set_type(obj, type)
		 * @param {mixed} obj the node to change
		 * @param {String} type the new type
		 * @plugin types
		 */this.set_type = function(obj,type){var t,t1,t2,old_type,old_icon;if($.isArray(obj)){obj = obj.slice();for(t1 = 0,t2 = obj.length;t1 < t2;t1++) {this.set_type(obj[t1],type);}return true;}t = this.settings.types;obj = this.get_node(obj);if(!t[type] || !obj){return false;}old_type = obj.type;old_icon = this.get_icon(obj);obj.type = type;if(old_icon === true || t[old_type] && t[old_type].icon !== undefined && old_icon === t[old_type].icon){this.set_icon(obj,t[type].icon !== undefined?t[type].icon:true);}return true;};}; // include the types plugin by default
// $.jstree.defaults.plugins.push("types");
/**
 * ### Unique plugin
 *
 * Enforces that no nodes with the same name can coexist as siblings.
 */ /**
	 * stores all defaults for the unique plugin
	 * @name $.jstree.defaults.unique
	 * @plugin unique
	 */$.jstree.defaults.unique = { /**
		 * Indicates if the comparison should be case sensitive. Default is `false`.
		 * @name $.jstree.defaults.unique.case_sensitive
		 * @plugin unique
		 */case_sensitive:false, /**
		 * A callback executed in the instance's scope when a new node is created and the name is already taken, the two arguments are the conflicting name and the counter. The default will produce results like `New node (2)`.
		 * @name $.jstree.defaults.unique.duplicate
		 * @plugin unique
		 */duplicate:function duplicate(name,counter){return name + ' (' + counter + ')';}};$.jstree.plugins.unique = function(options,parent){this.check = function(chk,obj,par,pos,more){if(parent.check.call(this,chk,obj,par,pos,more) === false){return false;}obj = obj && obj.id?obj:this.get_node(obj);par = par && par.id?par:this.get_node(par);if(!par || !par.children){return true;}var n=chk === "rename_node"?pos:obj.text,c=[],s=this.settings.unique.case_sensitive,m=this._model.data,i,j;for(i = 0,j = par.children.length;i < j;i++) {c.push(s?m[par.children[i]].text:m[par.children[i]].text.toLowerCase());}if(!s){n = n.toLowerCase();}switch(chk){case "delete_node":return true;case "rename_node":i = $.inArray(n,c) === -1 || obj.text && obj.text[s?'toString':'toLowerCase']() === n;if(!i){this._data.core.last_error = {'error':'check','plugin':'unique','id':'unique_01','reason':'Child with name ' + n + ' already exists. Preventing: ' + chk,'data':JSON.stringify({'chk':chk,'pos':pos,'obj':obj && obj.id?obj.id:false,'par':par && par.id?par.id:false})};}return i;case "create_node":i = $.inArray(n,c) === -1;if(!i){this._data.core.last_error = {'error':'check','plugin':'unique','id':'unique_04','reason':'Child with name ' + n + ' already exists. Preventing: ' + chk,'data':JSON.stringify({'chk':chk,'pos':pos,'obj':obj && obj.id?obj.id:false,'par':par && par.id?par.id:false})};}return i;case "copy_node":i = $.inArray(n,c) === -1;if(!i){this._data.core.last_error = {'error':'check','plugin':'unique','id':'unique_02','reason':'Child with name ' + n + ' already exists. Preventing: ' + chk,'data':JSON.stringify({'chk':chk,'pos':pos,'obj':obj && obj.id?obj.id:false,'par':par && par.id?par.id:false})};}return i;case "move_node":i = obj.parent === par.id && (!more || !more.is_multi) || $.inArray(n,c) === -1;if(!i){this._data.core.last_error = {'error':'check','plugin':'unique','id':'unique_03','reason':'Child with name ' + n + ' already exists. Preventing: ' + chk,'data':JSON.stringify({'chk':chk,'pos':pos,'obj':obj && obj.id?obj.id:false,'par':par && par.id?par.id:false})};}return i;}return true;};this.create_node = function(par,node,pos,callback,is_loaded){if(!node || node.text === undefined){if(par === null){par = $.jstree.root;}par = this.get_node(par);if(!par){return parent.create_node.call(this,par,node,pos,callback,is_loaded);}pos = pos === undefined?"last":pos;if(!pos.toString().match(/^(before|after)$/) && !is_loaded && !this.is_loaded(par)){return parent.create_node.call(this,par,node,pos,callback,is_loaded);}if(!node){node = {};}var tmp,n,dpc,i,j,m=this._model.data,s=this.settings.unique.case_sensitive,cb=this.settings.unique.duplicate;n = tmp = this.get_string('New node');dpc = [];for(i = 0,j = par.children.length;i < j;i++) {dpc.push(s?m[par.children[i]].text:m[par.children[i]].text.toLowerCase());}i = 1;while($.inArray(s?n:n.toLowerCase(),dpc) !== -1) {n = cb.call(this,tmp,++i).toString();}node.text = n;}return parent.create_node.call(this,par,node,pos,callback,is_loaded);};}; // include the unique plugin by default
// $.jstree.defaults.plugins.push("unique");
/**
 * ### Wholerow plugin
 *
 * Makes each node appear block level. Making selection easier. May cause slow down for large trees in old browsers.
 */var div=document.createElement('DIV');div.setAttribute('unselectable','on');div.setAttribute('role','presentation');div.className = 'jstree-wholerow';div.innerHTML = '&#160;';$.jstree.plugins.wholerow = function(options,parent){this.bind = function(){parent.bind.call(this);this.element.on('ready.jstree set_state.jstree',$.proxy(function(){this.hide_dots();},this)).on("init.jstree loading.jstree ready.jstree",$.proxy(function(){ //div.style.height = this._data.core.li_height + 'px';
this.get_container_ul().addClass('jstree-wholerow-ul');},this)).on("deselect_all.jstree",$.proxy(function(e,data){this.element.find('.jstree-wholerow-clicked').removeClass('jstree-wholerow-clicked');},this)).on("changed.jstree",$.proxy(function(e,data){this.element.find('.jstree-wholerow-clicked').removeClass('jstree-wholerow-clicked');var tmp=false,i,j;for(i = 0,j = data.selected.length;i < j;i++) {tmp = this.get_node(data.selected[i],true);if(tmp && tmp.length){tmp.children('.jstree-wholerow').addClass('jstree-wholerow-clicked');}}},this)).on("open_node.jstree",$.proxy(function(e,data){this.get_node(data.node,true).find('.jstree-clicked').parent().children('.jstree-wholerow').addClass('jstree-wholerow-clicked');},this)).on("hover_node.jstree dehover_node.jstree",$.proxy(function(e,data){if(e.type === "hover_node" && this.is_disabled(data.node)){return;}this.get_node(data.node,true).children('.jstree-wholerow')[e.type === "hover_node"?"addClass":"removeClass"]('jstree-wholerow-hovered');},this)).on("contextmenu.jstree",".jstree-wholerow",$.proxy(function(e){e.preventDefault();var tmp=$.Event('contextmenu',{metaKey:e.metaKey,ctrlKey:e.ctrlKey,altKey:e.altKey,shiftKey:e.shiftKey,pageX:e.pageX,pageY:e.pageY});$(e.currentTarget).closest(".jstree-node").children(".jstree-anchor").first().trigger(tmp);},this)) /*!
				.on("mousedown.jstree touchstart.jstree", ".jstree-wholerow", function (e) {
						if(e.target === e.currentTarget) {
							var a = $(e.currentTarget).closest(".jstree-node").children(".jstree-anchor");
							e.target = a[0];
							a.trigger(e);
						}
					})
				*/.on("click.jstree",".jstree-wholerow",function(e){e.stopImmediatePropagation();var tmp=$.Event('click',{metaKey:e.metaKey,ctrlKey:e.ctrlKey,altKey:e.altKey,shiftKey:e.shiftKey});$(e.currentTarget).closest(".jstree-node").children(".jstree-anchor").first().trigger(tmp).focus();}).on("click.jstree",".jstree-leaf > .jstree-ocl",$.proxy(function(e){e.stopImmediatePropagation();var tmp=$.Event('click',{metaKey:e.metaKey,ctrlKey:e.ctrlKey,altKey:e.altKey,shiftKey:e.shiftKey});$(e.currentTarget).closest(".jstree-node").children(".jstree-anchor").first().trigger(tmp).focus();},this)).on("mouseover.jstree",".jstree-wholerow, .jstree-icon",$.proxy(function(e){e.stopImmediatePropagation();if(!this.is_disabled(e.currentTarget)){this.hover_node(e.currentTarget);}return false;},this)).on("mouseleave.jstree",".jstree-node",$.proxy(function(e){this.dehover_node(e.currentTarget);},this));};this.teardown = function(){if(this.settings.wholerow){this.element.find(".jstree-wholerow").remove();}parent.teardown.call(this);};this.redraw_node = function(obj,deep,callback,force_render){obj = parent.redraw_node.apply(this,arguments);if(obj){var tmp=div.cloneNode(true); //tmp.style.height = this._data.core.li_height + 'px';
if($.inArray(obj.id,this._data.core.selected) !== -1){tmp.className += ' jstree-wholerow-clicked';}if(this._data.core.focused && this._data.core.focused === obj.id){tmp.className += ' jstree-wholerow-hovered';}obj.insertBefore(tmp,obj.childNodes[0]);}return obj;};}; // include the wholerow plugin by default
// $.jstree.defaults.plugins.push("wholerow");
if(document.registerElement && Object && Object.create){var proto=Object.create(HTMLElement.prototype);proto.createdCallback = function(){var c={core:{},plugins:[]},i;for(i in $.jstree.plugins) {if($.jstree.plugins.hasOwnProperty(i) && this.attributes[i]){c.plugins.push(i);if(this.getAttribute(i) && JSON.parse(this.getAttribute(i))){c[i] = JSON.parse(this.getAttribute(i));}}}for(i in $.jstree.defaults.core) {if($.jstree.defaults.core.hasOwnProperty(i) && this.attributes[i]){c.core[i] = JSON.parse(this.getAttribute(i)) || this.getAttribute(i);}}$(this).jstree(c);}; // proto.attributeChangedCallback = function (name, previous, value) { };
try{document.registerElement("vakata-jstree",{prototype:proto});}catch(ignore) {}}});
}, {"jquery":10}],
12: [function(require, module, exports) {
/*!
 * escape-html
 * Copyright(c) 2012-2013 TJ Holowaychuk
 * Copyright(c) 2015 Andreas Lubbe
 * Copyright(c) 2015 Tiancheng "Timothy" Gu
 * MIT Licensed
 */

'use strict';

/**
 * Module variables.
 * @private
 */

var matchHtmlRegExp = /["'&<>]/;

/**
 * Module exports.
 * @public
 */

module.exports = escapeHtml;

/**
 * Escape special characters in the given string of html.
 *
 * @param  {string} string The string to escape for inserting into HTML
 * @return {string}
 * @public
 */

function escapeHtml(string) {
  var str = '' + string;
  var match = matchHtmlRegExp.exec(str);

  if (!match) {
    return str;
  }

  var escape;
  var html = '';
  var index = 0;
  var lastIndex = 0;

  for (index = match.index; index < str.length; index++) {
    switch (str.charCodeAt(index)) {
      case 34:
        // "
        escape = '&quot;';
        break;
      case 38:
        // &
        escape = '&amp;';
        break;
      case 39:
        // '
        escape = '&#39;';
        break;
      case 60:
        // <
        escape = '&lt;';
        break;
      case 62:
        // >
        escape = '&gt;';
        break;
      default:
        continue;
    }

    if (lastIndex !== index) {
      html += str.substring(lastIndex, index);
    }

    lastIndex = index + 1;
    html += escape;
  }

  return lastIndex !== index ? html + str.substring(lastIndex, index) : html;
}
}, {}]}, {}, {"1":""})