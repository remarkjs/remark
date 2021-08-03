import test from 'tape'
import {removePosition} from 'unist-util-remove-position'
import {assert} from 'mdast-util-assert'
import {remark} from '../packages/remark/index.js'
import {fixtures} from './fixtures/index.js'

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

      assert(actualTree)

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

        assert(reparsedTree)
        removePosition(actualTree, true)
        removePosition(reparsedTree, true)

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
