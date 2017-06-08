/**
 * @author Titus Wormer
 * @copyright 2015 Titus Wormer
 * @license MIT
 * @module remark:parse:tokenize:text
 * @fileoverview Tokenise text.
 */

export default text;

/* Tokenise text. */
function text(eat, value, silent) {
  const self = this;
  let methods;
  let tokenizers;
  let index;
  let length;
  let subvalue;
  let position;
  let tokenizer;
  let name;
  let min;
  let now;

  /* istanbul ignore if - never used (yet) */
  if (silent) {
    return true;
  }

  methods = self.inlineMethods;
  length = methods.length;
  tokenizers = self.inlineTokenizers;
  index = -1;
  min = value.length;

  while (++index < length) {
    name = methods[index];

    if (name === 'text' || !tokenizers[name]) {
      continue;
    }

    tokenizer = tokenizers[name].locator;

    if (!tokenizer) {
      eat.file.fail('Missing locator: `' + name + '`');
    }

    position = tokenizer.call(self, value, 1);

    if (position !== -1 && position < min) {
      min = position;
    }
  }

  subvalue = value.slice(0, min);
  now = eat.now();

  self.decode(subvalue, now, (content, position, source) => {
    eat(source || content)({
      type: 'text',
      value: content
    });
  });
}
