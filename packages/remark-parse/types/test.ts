import unified = require('unified')
import * as Unist from 'unist'
import remarkParse = require('remark-parse')

const parseOptions: Partial<remarkParse.RemarkParseOptions> = {
  gfm: true,
  pedantic: true
}

unified().use(remarkParse, parseOptions)

const badParseOptions: Partial<remarkParse.RemarkParseOptions> = {
  // $ExpectError
  gfm: 'true'
}
remarkParse.Parser // $ExpectType typeof MarkdownParser

const locateMention: remarkParse.Locator = (value, fromIndex) => {
  return value.indexOf('@', fromIndex)
}

tokenizeMention.notInLink = true
tokenizeMention.locator = locateMention

function tokenizeMention(
  eat: remarkParse.Eat,
  value: string,
  silent: true
): boolean | void
function tokenizeMention(eat: remarkParse.Eat, value: string): Unist.Node | void
function tokenizeMention(
  eat: remarkParse.Eat,
  value: string,
  silent?: boolean
): Unist.Node | boolean | void {
  var match = /^@(\w+)/.exec(value)

  if (match) {
    if (silent) {
      return true
    }

    const add = eat(match[0])
    return add({
      type: 'link',
      url: 'https://social-network/' + match[1],
      children: [{type: 'text', value: match[0]}]
    })
  }
}

function mentions(this: unified.Processor) {
  var Parser = this.Parser as typeof remarkParse.Parser
  var tokenizers = Parser.prototype.inlineTokenizers
  var methods = Parser.prototype.inlineMethods

  tokenizers.mention = tokenizeMention

  methods.splice(methods.indexOf('text'), 0, 'mention')
}

const plugin: unified.Attacher = mentions
