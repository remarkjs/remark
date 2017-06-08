import unherit from 'unherit';
import xtend from 'xtend';
import Compiler from './lib/compiler.js';

export default stringify;
stringify.Compiler = Compiler;

function stringify(options) {
  const Local = unherit(Compiler);
  Local.prototype.options = xtend(Local.prototype.options, this.data('settings'), options);
  this.Compiler = Local;
}
