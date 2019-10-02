'use strict'

module.exports = root

var lineFeed = '\n'

// Stringify a root.
// Adds a final newline to ensure valid POSIX files. */
function root(node) {
  var block = this.block(node)
  if (block.substr(lineFeed.length * -1) === lineFeed) {
    return block
  }
  return block + lineFeed
}
