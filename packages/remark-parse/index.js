import unherit from 'unherit';
import xtend from 'xtend';
import Parser from './lib/parser.js';

export default parse;
parse.Parser = Parser;

function parse(options) {
  const Local = unherit(Parser);
  Local.prototype.options = xtend(Local.prototype.options, this.data('settings'), options);
  this.Parser = Local;
}
