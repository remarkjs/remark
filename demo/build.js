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
var debounce = require('component/debounce@1.0.0');
var keycode = require('timoxley/keycode');
var query = require('component/querystring');
var events = require('component/event');

/*
 * Constants.
 */

var defaultText = 'Here’s a tiny demo for __mdast__.\n\nIts focus is to *showcase* how the options above work.\n\nCheers!\n\n---\n\nP.S. You can also permalink the current document using `⌘+s` or `Ctrl+s`.\n';

/*
 * DOM elements.
 */

var $write = document.getElementById('write');
var $read = document.getElementById('read');
var $ast = document.getElementsByName('ast')[0];
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
events.bind($ast, 'change', onmethodchange);

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
}, {"wooorm/mdast@0.26.0":2,"component/debounce@1.0.0":3,"timoxley/keycode":4,"component/querystring":5,"component/event":6}],
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
}, {"ware":7,"./lib/parse.js":8,"./lib/stringify.js":9,"./lib/file.js":10,"./lib/utilities.js":11}],
7: [function(require, module, exports) {
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
}, {"wrap-fn":12}],
12: [function(require, module, exports) {
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
}, {"co":13}],
13: [function(require, module, exports) {

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
8: [function(require, module, exports) {
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
}, {"he":14,"repeat-string":15,"./utilities.js":11,"./expressions.js":16,"./defaults.js":17}],
14: [function(require, module, exports) {
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
15: [function(require, module, exports) {
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
11: [function(require, module, exports) {
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
16: [function(require, module, exports) {
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
17: [function(require, module, exports) {
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
9: [function(require, module, exports) {
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
}, {"he":14,"markdown-table":18,"repeat-string":15,"./utilities.js":11,"./defaults.js":17}],
18: [function(require, module, exports) {
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
10: [function(require, module, exports) {
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
}, {"date-now":19}],
19: [function(require, module, exports) {
"use strict";

module.exports = Date.now || now;

function now() {
    return new Date().getTime();
}
}, {}],
4: [function(require, module, exports) {
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
5: [function(require, module, exports) {

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
}, {"trim":20,"type":21}],
20: [function(require, module, exports) {
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
21: [function(require, module, exports) {
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
6: [function(require, module, exports) {
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
}, {}]}, {}, {"1":""})