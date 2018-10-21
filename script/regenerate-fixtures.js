'use strict'

var fs = require('fs')
var path = require('path')
var remark = require('../packages/remark')
var fixtures = require('../test/fixtures')

fixtures.forEach(function(fixture) {
  var input = fixture.input
  var name = fixture.name
  var mapping = fixture.mapping

  Object.keys(mapping).forEach(function(key) {
    var filename = name + (key ? '.' + key : key) + '.json'
    var result

    try {
      result = remark()
        .data('settings', fixture.possibilities[key])
        .parse(input)
    } catch (error) {
      console.log('Cannot regenerate `' + filename + '`')
      throw error
    }

    result = JSON.stringify(result, null, 2) + '\n'

    filename = filename.replace(/\*/g, '-asterisk-')

    fs.writeFileSync(path.join('test', 'fixtures', 'tree', filename), result)
  })
})
