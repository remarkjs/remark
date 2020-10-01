'use strict'

var test = require('tape')
var remove = require('unist-util-remove-position')
var mdast = require('mdast-util-assert')
var remark = require('../packages/remark')
var fixtures = require('./fixtures')

test('fixtures', function (t) {
  var index = -1

  next()

  // Check the next fixture.
  function next() {
    var fixture = fixtures[++index]

    if (!fixture) {
      t.end()
      return
    }

    setImmediate(next) // Queue next.

    t.test(fixture.name, function (st) {
      var actualTree
      var actualOutput
      var reparsedTree

      actualTree = remark().parse(fixture.input)

      mdast(actualTree)

      st.deepLooseEqual(
        actualTree,
        fixture.tree,
        'should parse `' + fixture.name + '` correctly'
      )

      actualOutput = remark()
        .data('settings', fixture.stringify)
        .stringify(actualTree)

      if (fixture.output !== false) {
        reparsedTree = remark().parse(actualOutput)

        mdast(reparsedTree)
        remove(actualTree, true)
        remove(reparsedTree, true)

        st.deepEqual(
          actualTree,
          reparsedTree,
          'should stringify `' + fixture.name + '`'
        )
      }

      if (fixture.output === true) {
        st.equal(
          fixture.input,
          actualOutput,
          'should stringify `' + fixture.name + '` exact'
        )
      }

      st.end()
    })
  }
})
