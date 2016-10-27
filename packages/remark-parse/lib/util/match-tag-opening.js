/**
 * @author Titus Wormer
 * @copyright 2015 Titus Wormer
 * @license MIT
 * @module remark:parse:util:match-tag-opening
 * @fileoverview Match an HTML opening tag.
 */

'use strict';

/* Dependencies. */
var alphabetical = require('is-alphabetical');
var decimal = require('is-decimal');
var whitespace = require('is-whitespace-character');

/* Expose. */
module.exports = match;

/* Constants. */
var C_LT = '<';
var C_GT = '>';
var C_SLASH = '/';
var C_DOUBLE_QUOTE = '"';
var C_SINGLE_QUOTE = '\'';
var C_EQUALS = '=';

/**
 * Try to match a closing tag.
 *
 * @param {string} value - Value to parse.
 * @param {Array.<string>?} [blocks] - Known block tag-names,
 *   which must be matched if given.
 * @return {string?} - When applicable, the closing tag at
 *   the start of `value`.
 */
function match(value, blocks) {
  var index = 0;
  var length = value.length;
  var queue = '';
  var subqueue = '';
  var character = value.charAt(index);
  var hasEquals;
  var test;

  if (character === C_LT) {
    queue = character;
    subqueue = character = value.charAt(++index);

    if (!alphabetical(character)) {
      return;
    }

    index++;

    /* Eat as many alphabetic characters as
     * possible. */
    while (index < length) {
      character = value.charAt(index);

      if (!alphabetical(character) && !decimal(character)) {
        break;
      }

      subqueue += character;
      index++;
    }

    if (blocks && blocks.indexOf(subqueue.toLowerCase()) === -1) {
      return;
    }

    queue += subqueue;
    subqueue = '';

    /* Find attributes. */
    while (index < length) {
      /* Eat white-space. */
      while (index < length) {
        character = value.charAt(index);

        if (!whitespace(character)) {
          break;
        }

        subqueue += character;
        index++;
      }

      if (!subqueue) {
        break;
      }

      /* Eat an attribute name. */
      queue += subqueue;
      subqueue = '';
      character = value.charAt(index);

      if (
        alphabetical(character) ||
        character === '_' ||
        character === ':'
      ) {
        subqueue = character;
        index++;

        while (index < length) {
          character = value.charAt(index);

          if (
            !alphabetical(character) &&
            !decimal(character) &&
            character !== '_' &&
            character !== ':' &&
            character !== '.' &&
            character !== '-'
          ) {
            break;
          }

          subqueue += character;
          index++;
        }
      }

      if (!subqueue) {
        break;
      }

      queue += subqueue;
      subqueue = '';
      hasEquals = false;

      /* Eat zero or more white-space and one
       * equals sign. */
      while (index < length) {
        character = value.charAt(index);

        if (!whitespace(character)) {
          if (!hasEquals && character === C_EQUALS) {
            hasEquals = true;
          } else {
            break;
          }
        }

        subqueue += character;
        index++;
      }

      queue += subqueue;
      subqueue = '';

      if (hasEquals) {
        character = value.charAt(index);
        queue += subqueue;

        if (character === C_DOUBLE_QUOTE) {
          test = isDoubleQuotedAttributeCharacter;
          subqueue = character;
          index++;
        } else if (character === C_SINGLE_QUOTE) {
          test = isSingleQuotedAttributeCharacter;
          subqueue = character;
          index++;
        } else {
          test = isUnquotedAttributeCharacter;
          subqueue = '';
        }

        while (index < length) {
          character = value.charAt(index);

          if (!test(character)) {
            break;
          }

          subqueue += character;
          index++;
        }

        character = value.charAt(index);
        index++;

        if (!test.delimiter) {
          if (subqueue.length === 0) {
            return;
          }

          index--;
        } else if (character === test.delimiter) {
          subqueue += character;
        } else {
          return;
        }

        queue += subqueue;
        subqueue = '';
      } else {
        queue += subqueue;
      }
    }

    /* More white-space is already eaten by the
     * attributes subroutine. */
    character = value.charAt(index);

    /* Eat an optional backslash (for self-closing
     * tags). */
    if (character === C_SLASH) {
      queue += character;
      character = value.charAt(++index);
    }

    return character === C_GT ? queue + character : null;
  }
}

/**
 * Check whether `character` can be inside an unquoted
 * attribute value.
 *
 * @param {string} character - Single character to check.
 * @return {boolean} - Whether `character` can be inside
 *   an unquoted attribute value.
 */
function isUnquotedAttributeCharacter(character) {
  return character !== C_DOUBLE_QUOTE &&
    character !== C_SINGLE_QUOTE &&
    character !== C_EQUALS &&
    character !== C_LT &&
    character !== C_GT &&
    character !== '`';
}

/**
 * Check whether `character` can be inside a double-quoted
 * attribute value.
 *
 * @property {string} delimiter - Closing delimiter.
 * @param {string} character - Single character to check.
 * @return {boolean} - Whether `character` can be inside
 *   a double-quoted attribute value.
 */
function isDoubleQuotedAttributeCharacter(character) {
  return character !== C_DOUBLE_QUOTE;
}

isDoubleQuotedAttributeCharacter.delimiter = C_DOUBLE_QUOTE;

/**
 * Check whether `character` can be inside a single-quoted
 * attribute value.
 *
 * @property {string} delimiter - Closing delimiter.
 * @param {string} character - Single character to check.
 * @return {boolean} - Whether `character` can be inside
 *   a single-quoted attribute value.
 */
function isSingleQuotedAttributeCharacter(character) {
  return character !== C_SINGLE_QUOTE;
}

isSingleQuotedAttributeCharacter.delimiter = C_SINGLE_QUOTE;
