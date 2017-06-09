/**
 * @author Titus Wormer
 * @copyright 2015 Titus Wormer
 * @license MIT
 * @module remark:parse:util:html
 * @fileoverview HTML regexes.
 */

const attributeName = '[a-zA-Z_:][a-zA-Z0-9:._-]*';
const unquoted = '[^"\'=<>`\\u0000-\\u0020]+';
const singleQuoted = '\'[^\']*\'';
const doubleQuoted = '"[^"]*"';
const attributeValue = '(?:' + unquoted + '|' + singleQuoted + '|' + doubleQuoted + ')';
const attribute = '(?:\\s+' + attributeName + '(?:\\s*=\\s*' + attributeValue + ')?)';
const openTag = '<[A-Za-z][A-Za-z0-9\\-]*' + attribute + '*\\s*\\/?>';
const closeTag = '<\\/[A-Za-z][A-Za-z0-9\\-]*\\s*>';
const comment = '<!---->|<!--(?:-?[^>-])(?:-?[^-])*-->';
const processing = '<[?].*?[?]>';
const declaration = '<![A-Za-z]+\\s+[^>]*>';
const cdata = '<!\\[CDATA\\[[\\s\\S]*?\\]\\]>';

export default new RegExp('^(?:' + openTag + '|' + closeTag + ')');

export const tag = new RegExp('^(?:' +
  openTag + '|' +
  closeTag + '|' +
  comment + '|' +
  processing + '|' +
  declaration + '|' +
  cdata +
')');
