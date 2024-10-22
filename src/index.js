/* @jsxImportSource react */
/* @jsxRuntime automatic */

/**
 * @import {Grammar} from '@wooorm/starry-night'
 * @import {Root as HastRoot} from 'hast'
 * @import {Root as MdastRoot} from 'mdast'
 * @import {FallbackProps} from 'react-error-boundary'
 * @import {ReactNode} from 'react'
 * @import {PluggableList} from 'unified'
 */

/**
 * @typedef DisplayProperties
 *   Properties.
 * @property {Error} error
 *   Error.
 *
 * @typedef EvalNok
 *   Not OK.
 * @property {false} ok
 *   Whether OK.
 * @property {Error} value
 *   Error.
 *
 * @typedef EvalOk
 *   OK.
 * @property {true} ok
 *   Whether OK.
 * @property {ReactNode} value
 *   Result.
 *
 * @typedef {EvalNok | EvalOk} EvalResult
 *   Result.
 */

import {createStarryNight} from '@wooorm/starry-night'
import sourceCss from '@wooorm/starry-night/source.css'
import sourceJson from '@wooorm/starry-night/source.json'
import sourceJs from '@wooorm/starry-night/source.js'
import sourceMdx from '@wooorm/starry-night/source.mdx'
import sourceShell from '@wooorm/starry-night/source.shell'
import sourceTsx from '@wooorm/starry-night/source.tsx'
import sourceTs from '@wooorm/starry-night/source.ts'
import textHtmlBasic from '@wooorm/starry-night/text.html.basic'
import textMd from '@wooorm/starry-night/text.md'
import {toJsxRuntime} from 'hast-util-to-jsx-runtime'
import {useEffect, useState} from 'react'
import {Fragment, jsx, jsxs} from 'react/jsx-runtime'
import ReactDom from 'react-dom/client'
import {ErrorBoundary} from 'react-error-boundary'
import rehypeFormat from 'rehype-format'
import rehypeRaw from 'rehype-raw'
import rehypeSanitize from 'rehype-sanitize'
import rehypeStringify from 'rehype-stringify'
import remarkDirective from 'remark-directive'
import remarkFrontmatter from 'remark-frontmatter'
import remarkGfm from 'remark-gfm'
import remarkMath from 'remark-math'
import remarkParse from 'remark-parse'
import remarkRehype from 'remark-rehype'
import remarkStringify from 'remark-stringify'
import {unified} from 'unified'
import {removePosition} from 'unist-util-remove-position'
import {VFile} from 'vfile'

if ('paintWorklet' in CSS) {
  // @ts-expect-error: TS doesn’t understand Houdini.
  CSS.paintWorklet.addModule(
    'https://www.unpkg.com/css-houdini-squircle@0.2.1/squircle.min.js'
  )
}

const sample = `# Pluto

**Pluto** (minor-planet designation: *134340 Pluto*)
is a
[dwarf planet](https://en.wikipedia.org/wiki/Dwarf_planet)
in the
[Kuiper belt](https://en.wikipedia.org/wiki/Kuiper_belt).

## History

In the 1840s,
[Urbain Le Verrier](https://wikipedia.org/wiki/Urbain_Le_Verrier)
used Newtonian mechanics to predict the position of the
then-undiscovered planet
[Neptune](https://wikipedia.org/wiki/Neptune)
after analyzing perturbations in the orbit of
[Uranus](https://wikipedia.org/wiki/Uranus).

***

Just a link: www.nasa.gov.

* Lists
* [ ] todo
* [x] done

A table:

| a | b |
| - | - |

<details><summary>Show example</summary>

\`\`\`js
console.log('Hi pluto!')
\`\`\`

</details>`

/** @type {ReadonlyArray<Grammar>} */
const grammars = [
  sourceCss,
  // @ts-expect-error: TS is wrong: this is not a JSON file.
  sourceJson,
  sourceJs,
  sourceMdx,
  sourceShell,
  sourceTsx,
  sourceTs,
  textHtmlBasic,
  textMd
]

/** @type {Awaited<ReturnType<typeof createStarryNight>>} */
let starryNight

const editor = document.querySelector('#js-editor')
if (!editor) throw new Error('Missing editor')
const root = document.createElement('div')
root.classList.add('playground')
editor.after(root)
init(root)

/**
 * @param {Element} main
 *   DOM element.
 * @returns {undefined}
 *   Nothing.
 */
function init(main) {
  const root = ReactDom.createRoot(main)

  createStarryNight(grammars).then(
    /**
     * @returns {undefined}
     *   Nothing.
     */
    function (x) {
      starryNight = x

      const missing = starryNight.missingScopes()

      if (missing.length > 0) {
        throw new Error('Unexpected missing required scopes: `' + missing + '`')
      }

      root.render(<Playground />)
    }
  )
}

function Playground() {
  const [evalResult, setEvalResult] = useState(
    /** @type {unknown} */ (undefined)
  )
  const [outputFormatHtml, setOutputFormatHtml] = useState(true)
  const [pluginRehypeFormat, setPluginRehypeFormat] = useState(false)
  const [pluginRehypeRaw, setPluginRehypeRaw] = useState(false)
  const [pluginRehypeSanitize, setPluginRehypeSanitize] = useState(false)
  const [pluginRemarkDirective, setPluginRemarkDirective] = useState(false)
  const [pluginRemarkFrontmatter, setPluginRemarkFrontmatter] = useState(false)
  const [pluginRemarkGfm, setPluginRemarkGfm] = useState(false)
  const [pluginRemarkMath, setPluginRemarkMath] = useState(false)
  const [positions, setPositions] = useState(false)
  const [show, setShow] = useState('result')
  const [value, setValue] = useState(sample)

  useEffect(
    function () {
      go().then(
        function (ok) {
          setEvalResult({ok: true, value: ok})
        },
        /**
         * @param {Error} error
         *   Error.
         * @returns {undefined}
         *   Nothing.
         */
        function (error) {
          setEvalResult({ok: false, value: error})
        }
      )

      async function go() {
        /** @type {PluggableList} */
        const rehypePlugins = []
        /** @type {PluggableList} */
        const remarkPlugins = []

        if (pluginRehypeRaw) rehypePlugins.push(rehypeRaw)
        // More useful to use after `rehype-raw`.
        if (pluginRehypeFormat) rehypePlugins.push(rehypeFormat)
        if (pluginRehypeSanitize) rehypePlugins.push(rehypeSanitize)
        if (pluginRemarkDirective) remarkPlugins.push(remarkDirective)
        if (pluginRemarkFrontmatter) remarkPlugins.push(remarkFrontmatter)
        if (pluginRemarkGfm) remarkPlugins.push(remarkGfm)
        if (pluginRemarkMath) remarkPlugins.push(remarkMath)

        const file = new VFile({basename: 'example.md', value})

        if (show === 'hast') rehypePlugins.push([captureTree])
        if (show === 'mdast') remarkPlugins.push([captureTree])
        /** @type {HastRoot | MdastRoot | undefined} */
        let ast

        const baseProcessor = unified().use(remarkParse).use(remarkPlugins)

        const processor = outputFormatHtml
          ? baseProcessor
              .use(remarkRehype, {allowDangerousHtml: true})
              .use(rehypePlugins)
              .use(rehypeStringify)
          : baseProcessor.use(remarkStringify)

        await processor.process(file)

        const result = String(file)

        if (show === 'result') {
          return (
            <ErrorBoundary
              FallbackComponent={ErrorFallback}
              resetKeys={[value]}
            >
              {outputFormatHtml ? (
                <div
                  // eslint-disable-next-line react/no-danger
                  dangerouslySetInnerHTML={{__html: result}}
                  className="content playground-cell playground-result"
                />
              ) : (
                result
              )}
            </ErrorBoundary>
          )
        }

        if (ast) {
          if (!positions) removePosition(ast, {force: true})
          return (
            <pre className="playground-code">
              <code>
                {toJsxRuntime(
                  starryNight.highlight(
                    JSON.stringify(ast, undefined, 2),
                    'source.json'
                  ),
                  {Fragment, jsx, jsxs}
                )}
              </code>
            </pre>
          )
        }

        // `show === 'code'`
        return (
          <pre className="playground-code">
            <code>
              {toJsxRuntime(
                starryNight.highlight(
                  result,
                  outputFormatHtml ? 'text.html.basic' : 'text.md'
                ),
                {Fragment, jsx, jsxs}
              )}
            </code>
          </pre>
        )

        function captureTree() {
          /**
           * @param {MdastRoot | HastRoot} tree
           *   Tree.
           * @returns {undefined}
           *   Nothing.
           */
          return function (tree) {
            ast = structuredClone(tree)
          }
        }
      }
    },
    [
      outputFormatHtml,
      pluginRehypeFormat,
      pluginRehypeRaw,
      pluginRehypeSanitize,
      pluginRemarkDirective,
      pluginRemarkFrontmatter,
      pluginRemarkGfm,
      pluginRemarkMath,
      positions,
      show,
      value
    ]
  )

  // Cast to actual value.
  const compiledResult = /** @type {EvalResult | undefined} */ (evalResult)
  /** @type {ReactNode | undefined} */
  let display

  if (compiledResult) {
    if (compiledResult.ok) {
      display = compiledResult.value
    } else {
      display = (
        <div>
          <p>Could not compile code:</p>
          <DisplayError error={compiledResult.value} />
        </div>
      )
    }
  }

  // List of plugins,
  // each an JS identifier and an npm package name.
  // Ordered in how they are `use`d.
  /** @type {Array<[identifier: string, packageName: string, options?: string]>} */
  const plugins = [['remarkParse', 'remark-parse']]

  if (pluginRemarkDirective)
    plugins.push(['remarkDirective', 'remark-directive'])
  if (pluginRemarkFrontmatter)
    plugins.push(['remarkFrontmatter', 'remark-frontmatter'])
  if (pluginRemarkGfm) plugins.push(['remarkGfm', 'remark-gfm'])
  if (pluginRemarkMath) plugins.push(['remarkMath', 'remark-math'])

  if (show === 'mdast') {
    // Empty.
  } else if (outputFormatHtml) {
    plugins.push([
      'remarkRehype',
      'remark-rehype',
      '{allowDangerousHtml: true}'
    ])

    if (pluginRehypeRaw) plugins.push(['rehypeRaw', 'rehype-raw'])
    if (pluginRehypeFormat) plugins.push(['rehypeFormat', 'rehype-format'])
    if (pluginRehypeSanitize)
      plugins.push(['rehypeSanitize', 'rehype-sanitize'])

    if (show === 'hast') {
      // Empty.
    } else {
      plugins.push(['rehypeStringify', 'rehype-stringify'])
    }
  } else {
    plugins.push(['remarkStringify', 'remark-stringify'])
  }

  let document = JSON.stringify(value).slice(1, -1).replace(/'/g, "\\'")

  if (document.length > 55) {
    document = document.slice(0, 54) + '…'
  }

  const names = plugins.map(function (d) {
    return d[1]
  })

  const lines = plugins
    .toSorted(function (a, b) {
      return a[1].localeCompare(b[1])
    })
    .map(function (d) {
      return 'import ' + d[0] + " from '" + d[1] + "'"
    })

  names.push('unified')
  lines.push("import {unified} from 'unified'")

  if (!positions && (show === 'hast' || show === 'mdast')) {
    names.push('unist-util-remove-position')
    lines.push("import {removePosition} from 'unist-util-remove-position'")
  }

  lines.push(
    '',
    'const processor = unified()',
    ...plugins.map(function (d) {
      return '  .use(' + d[0] + (d[2] ? ', ' + d[2] : '') + ')'
    }),
    '',
    "const value = '" + document + "'"
  )

  if (show === 'hast' || show === 'mdast') {
    lines.push(
      'const parseTree = processor.parse(value)',
      'const tree = await processor.run(parseTree)',
      ''
    )

    if (!positions) {
      lines.push('removePosition(tree, {force: true})', '')
    }

    lines.push('console.dir(tree, {depth: null})')
  } else {
    lines.push(
      'const file = await processor.process(value)',
      '',
      'console.log(String(file))'
    )
  }

  const code = lines.join('\n')

  return (
    <>
      <div className="playground-grid">
        <form>
          <div className="playground-cell playground-input-area">
            <div className="playground-input-area-group">
              <div className="playground-input-area-draw">
                {toJsxRuntime(starryNight.highlight(value, 'text.md'), {
                  Fragment,
                  jsx,
                  jsxs
                })}
                {/* Trailing whitespace in a `textarea` is shown, but not in a `div`
                    with `white-space: pre-wrap`.
                    Add a `br` to make the last newline explicit. */}
                {/\n[ \t]*$/.test(value) ? <br /> : undefined}
              </div>
              <textarea
                className="playground-input-area-write"
                rows={value.split('\n').length + 1}
                spellCheck="false"
                value={value}
                onChange={function (event) {
                  setValue(event.target.value)
                }}
              />
            </div>
          </div>
          <div className="playground-cell playground-control-area">
            <fieldset className="content">
              <legend>Show</legend>
              <label>
                <select
                  name="show"
                  onChange={function (event) {
                    setShow(event.target.value)
                    if (event.target.value === 'result') {
                      setOutputFormatHtml(true)
                    }
                  }}
                >
                  <option value="result" disabled={!outputFormatHtml}>
                    rendered html
                  </option>
                  <option value="code">compiled code</option>
                  <option value="mdast">mdast (markdown)</option>
                  <option value="hast" disabled={!outputFormatHtml}>
                    hast (html)
                  </option>
                </select>{' '}
              </label>
            </fieldset>

            <fieldset className="content">
              <legend>Plugin</legend>
              <label>
                <input
                  checked={pluginRemarkDirective}
                  name="directive"
                  type="checkbox"
                  onChange={function () {
                    setPluginRemarkDirective(!pluginRemarkDirective)
                  }}
                />{' '}
                use{' '}
                <a
                  href="https://github.com/remarkjs/remark-directive"
                  rel="noreferrer noopener"
                  target="_blank"
                >
                  <code>remark-directive</code>
                </a>
              </label>
              <label>
                <input
                  checked={pluginRemarkFrontmatter}
                  name="frontmatter"
                  type="checkbox"
                  onChange={function () {
                    setPluginRemarkFrontmatter(!pluginRemarkFrontmatter)
                  }}
                />{' '}
                use{' '}
                <a
                  href="https://github.com/remarkjs/remark-frontmatter"
                  rel="noreferrer noopener"
                  target="_blank"
                >
                  <code>remark-frontmatter</code>
                </a>
              </label>
              <label>
                <input
                  checked={pluginRemarkGfm}
                  name="plugin-remark-gfm"
                  type="checkbox"
                  onChange={function () {
                    setPluginRemarkGfm(!pluginRemarkGfm)
                  }}
                />{' '}
                use{' '}
                <a
                  href="https://github.com/remarkjs/remark-gfm"
                  rel="noreferrer noopener"
                  target="_blank"
                >
                  <code>remark-gfm</code>
                </a>
              </label>
              <label>
                <input
                  checked={pluginRemarkMath}
                  name="math"
                  type="checkbox"
                  onChange={function () {
                    setPluginRemarkMath(!pluginRemarkMath)
                  }}
                />{' '}
                use{' '}
                <a
                  href="https://github.com/remarkjs/remark-math"
                  rel="noreferrer noopener"
                  target="_blank"
                >
                  <code>remark-math</code>
                </a>
              </label>
              <label>
                <input
                  checked={pluginRehypeFormat}
                  disabled={!outputFormatHtml}
                  name="plugin-rehype-format"
                  type="checkbox"
                  onChange={function () {
                    setPluginRehypeFormat(!pluginRehypeFormat)
                  }}
                />{' '}
                use{' '}
                <a
                  href="https://github.com/rehypejs/rehype-format"
                  rel="noreferrer noopener"
                  target="_blank"
                >
                  <code>rehype-format</code>
                </a>{' '}
                <small style={{display: outputFormatHtml ? 'none' : 'initial'}}>
                  (disabled for <code>output format: markdown</code>)
                </small>
              </label>
              <label>
                <input
                  checked={pluginRehypeRaw}
                  disabled={!outputFormatHtml}
                  name="plugin-rehype-raw"
                  type="checkbox"
                  onChange={function () {
                    setPluginRehypeRaw(!pluginRehypeRaw)
                  }}
                />{' '}
                use{' '}
                <a
                  href="https://github.com/rehypejs/rehype-raw"
                  rel="noreferrer noopener"
                  target="_blank"
                >
                  <code>rehype-raw</code>
                </a>{' '}
                <small style={{display: outputFormatHtml ? 'none' : 'initial'}}>
                  (disabled for <code>output format: markdown</code>)
                </small>
              </label>
              <label>
                <input
                  checked={pluginRehypeSanitize}
                  disabled={!outputFormatHtml}
                  name="plugin-rehype-sanitize"
                  type="checkbox"
                  onChange={function () {
                    setPluginRehypeSanitize(!pluginRehypeSanitize)
                  }}
                />{' '}
                use{' '}
                <a
                  href="https://github.com/rehypejs/rehype-sanitize"
                  rel="noreferrer noopener"
                  target="_blank"
                >
                  <code>rehype-sanitize</code>
                </a>{' '}
                <small style={{display: outputFormatHtml ? 'none' : 'initial'}}>
                  (disabled for <code>output format: markdown</code>)
                </small>
              </label>
            </fieldset>

            <fieldset className="content" disabled={show === 'result'}>
              <legend>
                Output format{' '}
                <small
                  style={{display: show === 'result' ? 'initial' : 'none'}}
                >
                  (disabled for <code>show: rendered html</code>)
                </small>
              </legend>
              <label>
                <input
                  checked={!outputFormatHtml}
                  name="output-format"
                  type="radio"
                  onChange={function () {
                    setOutputFormatHtml(false)
                  }}
                />{' '}
                markdown (
                <a
                  href="https://github.com/remarkjs/remark/tree/main/packages/remark-stringify"
                  rel="noreferrer noopener"
                  target="_blank"
                >
                  <code>remark-stringify</code>
                </a>
                )
              </label>
              <label>
                <input
                  checked={outputFormatHtml}
                  name="output-format"
                  type="radio"
                  onChange={function () {
                    setOutputFormatHtml(true)
                  }}
                />{' '}
                html (
                <a
                  href="https://github.com/remarkjs/remark-rehype"
                  rel="noreferrer noopener"
                  target="_blank"
                >
                  <code>remark-rehype</code>
                </a>{' '}
                +{' '}
                <a
                  href="https://github.com/rehypejs/rehype/tree/main/packages/rehype-stringify"
                  rel="noreferrer noopener"
                  target="_blank"
                >
                  <code>rehype-stringify</code>
                </a>
                )
              </label>
            </fieldset>

            <fieldset
              className="content"
              disabled={show === 'code' || show === 'result'}
            >
              <legend>
                Tree{' '}
                <small
                  style={{
                    display:
                      show === 'code' || show === 'result' ? 'initial' : 'none'
                  }}
                >
                  (disabled for <code>show: code</code> or{' '}
                  <code>show: rendered html</code>)
                </small>
              </legend>
              <label>
                <input
                  checked={positions}
                  name="positions"
                  type="checkbox"
                  onChange={function () {
                    setPositions(!positions)
                  }}
                />{' '}
                show <code>position</code> in tree
              </label>
            </fieldset>
          </div>
        </form>
        {display}
      </div>
      {/* playground-code */}
      <div className="container">
        <div className="article content">
          <p>
            The above playground lets you try out some common plugins and
            quickly preview which input leads to what output. But it is really
            recommended to try and play with code yourself. You can do the
            above, in code, as follows. First install dependencies:
          </p>
          <pre className="language-sh">
            <code>
              {toJsxRuntime(
                starryNight.highlight(
                  'npm install --save ' + names.toSorted().join(' '),
                  'source.shell'
                ),
                {Fragment, jsx, jsxs}
              )}
            </code>
          </pre>
          <p>
            …then with the following <code>example.js</code>:
          </p>
          <pre className="language-js">
            <code>
              {toJsxRuntime(starryNight.highlight(code, 'source.js'), {
                Fragment,
                jsx,
                jsxs
              })}
            </code>
          </pre>
          <p>…you‘d get the above output as shown in the playground.</p>
        </div>
      </div>
    </>
  )
}

/**
 *
 * @param {Readonly<FallbackProps>} properties
 *   Properties.
 * @returns {ReactNode}
 *   Element.
 */
function ErrorFallback(properties) {
  // type-coverage:ignore-next-line
  const error = /** @type {Error} */ (properties.error)
  return (
    <div role="alert">
      <p>Something went wrong:</p>
      <DisplayError error={error} />
      <button type="button" onClick={properties.resetErrorBoundary}>
        Try again
      </button>
    </div>
  )
}

/**
 * @param {DisplayProperties} properties
 *   Properties.
 * @returns {ReactNode}
 *   Element.
 */
function DisplayError(properties) {
  return (
    <pre className="playground-code">
      <code>
        {String(
          properties.error.stack
            ? properties.error.message + '\n' + properties.error.stack
            : properties.error
        )}
      </code>
    </pre>
  )
}
