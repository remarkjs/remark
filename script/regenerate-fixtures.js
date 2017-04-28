/**
 * @author Titus Wormer
 * @copyright 2015 Titus Wormer
 * @license MIT
 * @module remark:script
 * @fileoverview Regenerate all fixtures according to their
 *   configuration (found in each filename), useful when
 *   the parser is modified to output different syntax trees.
 */

'use strict';

/* Dependencies. */
var fs = require('fs');
var path = require('path');
var remark = require('../packages/remark');
var fixtures = require('../test/fixtures');

/* Regenerate. */
fixtures.forEach(function (fixture) {
  var input = fixture.input;
  var name = fixture.name;
  var mapping = fixture.mapping;

  Object.keys(mapping).forEach(function (key) {
    var filename = name + (key ? '.' + key : key) + '.json';
    var result;

    try {
      result = remark()
        .data('settings', fixture.possibilities[key])
        .parse(input);
    } catch (err) {
      console.log('Could not regenerate `' + filename + '`');
      throw err;
    }

    result = JSON.stringify(result, null, 2) + '\n';

    filename = filename.replace(/\*/g, '-asterisk-');

    fs.writeFileSync(
      path.join('test', 'fixtures', 'tree', filename),
      result
    );
  });
});
