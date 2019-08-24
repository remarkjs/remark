'use strict'

module.exports = tableCell

var lineFeed = /\n/g

function tableCell(node) {
  return this.all(node)
    .join('')
    .replace(lineFeed, ' ')
}
