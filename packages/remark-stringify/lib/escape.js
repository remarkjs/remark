/**
 * @author Titus Wormer
 * @copyright 2015 Titus Wormer
 * @license MIT
 * @module remark:stringify:escape
 * @fileoverview Escape text to prevent it turning
 *   into markdown syntax.
 */

/* Dependencies. */
import decimal from 'is-decimal';
import alphanumeric from 'is-alphanumeric';
import whitespace from 'is-whitespace-character';
import escapes from 'markdown-escapes';
import prefix from './util/entity-prefix-length';

/* Expose. */
export default factory;

/* Constants. */
const BACKSLASH = '\\';
const BULLETS = ['*', '-', '+'];
const ALLIGNMENT = [':', '-', ' ', '|'];
const entities = {'<': '&lt;', ':': '&#x3A;', '&': '&amp;', '|': '&#x7C;', '~': '&#x7E;'};

/**
 * Factory to escape characters.
 *
 * @example
 *   var escape = escapeFactory({ commonmark: true });
 *   escape('x*x', { type: 'text', value: 'x*x' }) // 'x\\*x'
 *
 * @param {Object} options - Compiler options.
 * @return {function(value, node, parent): string} - Function which
 *   takes a value and a node and (optionally) its parent and returns
 *   its escaped value.
 */
function factory(options) {
  return escape;

  /**
   * Escape punctuation characters in a node's value.
   *
   * @param {string} value - Value to escape.
   * @param {Object} node - Node in which `value` exists.
   * @param {Object} [parent] - Parent of `node`.
   * @return {string} - Escaped `value`.
   */
  function escape(value, node, parent) {
    const self = this;
    const gfm = options.gfm;
    const commonmark = options.commonmark;
    const pedantic = options.pedantic;
    const markers = commonmark ? ['.', ')'] : ['.'];
    const siblings = parent && parent.children;
    const index = siblings && siblings.indexOf(node);
    const prev = siblings && siblings[index - 1];
    let next = siblings && siblings[index + 1];
    let length = value.length;
    const escapable = escapes(options);
    let position = -1;
    const queue = [];
    const escaped = queue;
    let afterNewLine;
    let character;
    let wordCharBefore;
    let wordCharAfter;
    let offset;
    let replace;

    if (prev) {
      afterNewLine = text(prev) && /\n\s*$/.test(prev.value);
    } else {
      afterNewLine = !parent || parent.type === 'root' || parent.type === 'paragraph';
    }

    function one(character) {
      return escapable.indexOf(character) === -1 ?
        entities[character] : BACKSLASH + character;
    }

    while (++position < length) {
      character = value.charAt(position);
      replace = false;

      if (character === '\n') {
        afterNewLine = true;
      } else if (
        character === BACKSLASH ||
        character === '`' ||
        character === '*' ||
        character === '[' ||
        character === '<' ||
        (character === '&' && prefix(value.slice(position)) > 0) ||
        (character === ']' && self.inLink) ||
        (gfm && character === '~' && value.charAt(position + 1) === '~') ||
        (gfm && character === '|' && (self.inTable || alignment(value, position))) ||
        (
          character === '_' &&
          /* Delegate leading/trailing underscores
           * to the multinode version below. */
          position > 0 &&
          position < length - 1 &&
          (
              pedantic ||
              !alphanumeric(value.charAt(position - 1)) ||
              !alphanumeric(value.charAt(position + 1))
          )
        ) ||
        (gfm && !self.inLink && character === ':' && protocol(queue.join('')))
      ) {
        replace = true;
      } else if (afterNewLine) {
        if (
          character === '>' ||
          character === '#' ||
          BULLETS.indexOf(character) !== -1
        ) {
          replace = true;
        } else if (decimal(character)) {
          offset = position + 1;

          while (offset < length) {
            if (!decimal(value.charAt(offset))) {
              break;
            }

            offset++;
          }

          if (markers.indexOf(value.charAt(offset)) !== -1) {
            next = value.charAt(offset + 1);

            if (!next || next === ' ' || next === '\t' || next === '\n') {
              queue.push(value.slice(position, offset));
              position = offset;
              character = value.charAt(position);
              replace = true;
            }
          }
        }
      }

      if (afterNewLine && !whitespace(character)) {
        afterNewLine = false;
      }

      queue.push(replace ? one(character) : character);
    }

    /* Multi-node versions. */
    if (siblings && text(node)) {
      /* Check for an opening parentheses after a
       * link-reference (which can be joined by
       * white-space). */
      if (prev && prev.referenceType === 'shortcut') {
        position = -1;
        length = escaped.length;

        while (++position < length) {
          character = escaped[position];

          if (character === ' ' || character === '\t') {
            continue;
          }

          if (character === '(' || character === ':') {
            escaped[position] = one(character);
          }

          break;
        }

        /* If the current node is all spaces / tabs,
         * preceded by a shortcut, and followed by
         * a text starting with `(`, escape it. */
        if (
          text(next) &&
          position === length &&
          next.value.charAt(0) === '('
        ) {
          escaped.push(BACKSLASH);
        }
      }

      /* Ensure non-auto-links are not seen as links.
       * This pattern needs to check the preceding
       * nodes too. */
      if (
        gfm &&
        !self.inLink &&
        text(prev) &&
        value.charAt(0) === ':' &&
        protocol(prev.value.slice(-6))
      ) {
        escaped[0] = one(':');
      }

      /* Escape ampersand if it would otherwise
       * start an entity. */
      if (
        text(next) &&
        value.charAt(length - 1) === '&' &&
        prefix('&' + next.value) !== 0
      ) {
        escaped[escaped.length - 1] = one('&');
      }

      /* Escape double tildes in GFM. */
      if (
        gfm &&
        text(next) &&
        value.charAt(length - 1) === '~' &&
        next.value.charAt(0) === '~'
      ) {
        escaped.splice(escaped.length - 1, 0, BACKSLASH);
      }

      /* Escape underscores, but not mid-word (unless
       * in pedantic mode). */
      wordCharBefore = text(prev) && alphanumeric(prev.value.slice(-1));
      wordCharAfter = text(next) && alphanumeric(next.value.charAt(0));

      if (length === 1) {
        if (value === '_' && (pedantic || !wordCharBefore || !wordCharAfter)) {
          escaped.unshift(BACKSLASH);
        }
      } else {
        if (
          value.charAt(0) === '_' &&
          (pedantic || !wordCharBefore || !alphanumeric(value.charAt(1)))
        ) {
          escaped.unshift(BACKSLASH);
        }

        if (
          value.charAt(length - 1) === '_' &&
          (pedantic || !wordCharAfter || !alphanumeric(value.charAt(length - 2)))
        ) {
          escaped.splice(escaped.length - 1, 0, BACKSLASH);
        }
      }
    }

    return escaped.join('');
  }
}

/**
 * Check if `index` in `value` is inside an alignment row.
 */
function alignment(value, index) {
  let start = value.lastIndexOf('\n', index);
  let end = value.indexOf('\n', index);

  start = start === -1 ? -1 : start;
  end = end === -1 ? value.length : end;

  while (++start < end) {
    if (ALLIGNMENT.indexOf(value.charAt(start)) === -1) {
      return false;
    }
  }

  return true;
}

/**
 * Check if `node` is a text node.
 */
function text(node) {
  return node && node.type === 'text';
}

/**
 * Check if `value` ends in a protocol.
 */
function protocol(value) {
  const val = value.slice(-6).toLowerCase();
  return val === 'mailto' || val.slice(-5) === 'https' || val.slice(-4) === 'http';
}
