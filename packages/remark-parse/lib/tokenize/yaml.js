/**
 * @author Titus Wormer
 * @copyright 2015 Titus Wormer
 * @license MIT
 * @module remark:parse:tokenize:yaml
 * @fileoverview Tokenise YAML.
 */

export default yaml;
yaml.onlyAtStart = true;

const FENCE = '---';
const C_DASH = '-';
const C_NEWLINE = '\n';

/* Tokenise YAML. */
function yaml(eat, value, silent) {
  const self = this;
  let subvalue;
  let content;
  let index;
  let length;
  let character;
  let queue;

  if (
    !self.options.yaml ||
    value.charAt(0) !== C_DASH ||
    value.charAt(1) !== C_DASH ||
    value.charAt(2) !== C_DASH ||
    value.charAt(3) !== C_NEWLINE
  ) {
    return;
  }

  subvalue = FENCE + C_NEWLINE;
  content = '';
  queue = '';
  index = 3;
  length = value.length;

  while (++index < length) {
    character = value.charAt(index);

    if (
      character === C_DASH &&
      (queue || !content) &&
      value.charAt(index + 1) === C_DASH &&
      value.charAt(index + 2) === C_DASH
    ) {
      /* istanbul ignore if - never used (yet) */
      if (silent) {
        return true;
      }

      subvalue += queue + FENCE;

      return eat(subvalue)({
        type: 'yaml',
        value: content
      });
    }

    if (character === C_NEWLINE) {
      queue += character;
    } else {
      subvalue += queue + character;
      content += queue + character;
      queue = '';
    }
  }
}
