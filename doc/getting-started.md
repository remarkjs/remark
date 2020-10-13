![remark][logo]

# Getting started

**remark** transforms Markdown.
It’s an ecosystem of [plugins][].
If you get stuck, [issues][] and [Discussions][] are good places to get help.

It’s built on [unified][], make sure to read it and its [website][] too.

## Contents

*   [Intro](#intro)
*   [Command line](#command-line)
*   [Using remark in a project](#using-remark-in-a-project)
*   [Programmatic usage](#programmatic-usage)

## Intro

Out of the box, **remark** transforms Markdown: Markdown is given, reformatted,
and written:

```md
# Alpha #
Bravo charlie **delta** __echo__.
- Foxtrot
```

Yields:

```md
# Alpha

Bravo charlie **delta** **echo**.

*   Foxtrot
```

But, much more can be done, [through plugins][plugins].

## Command line

**remark**’s CLI is a simple way to process Markdown files from the
command line.  Its interface is provided by [**unified-args**][unified-args].

Install [`remark-cli`][cli] and dependencies (in this case a [linting
preset][preset] and [`remark-html`][html]) with [npm][]:

```sh
npm install --global remark-cli remark-html remark-preset-lint-markdown-style-guide
```

`readme.md` contains:

```md
_Hello_.
```

Now, to process `readme.md`, run the following:

```sh
remark readme.md --use html --use preset-lint-markdown-style-guide
```

Yields:

```txt
<p><em>Hello</em>.</p>
readme.md.md
  1:1-1:8  warning  Emphasis should use `*` as a marker  emphasis-marker  remark-lint

⚠ 1 warning
```

## Using remark in a project

In the previous example, `remark-cli` was installed globally.  That’s
generally a bad idea.  Here we’re going to use the CLI to lint
an npm package.

Say we have the following `package.json`:

```json
{
  "name": "my-package",
  "version": "1.0.0",
  "scripts": {
    "test": "node test.js"
  }
}
```

And install `remark-cli`, `remark-html`, and
`remark-preset-lint-markdown-style-guide` into it as a dev-dependencies:

```sh
npm install --save-dev remark-cli remark-html remark-preset-lint-markdown-style-guide
```

The `--save-dev` option stores the dependencies in our `package.json`:

```diff
 {
   "name": "my-package",
   "version": "1.0.0",
+  "devDependencies": {
+    "remark-cli": "^9.0.0",
+    "remark-html": "^13.0.0",
+    "remark-preset-lint-markdown-style-guide": "^4.0.0"
+  },
   "scripts": {
     "test": "node test.js"
   }
 }
```

Then, we change our `test` script to include remark, and add
configuration:

```diff
 {
   "name": "my-package",
   "version": "1.0.0",
   "devDependencies": {
     "remark-cli": "^9.0.0",
     "remark-html": "^13.0.0",
     "remark-preset-lint-markdown-style-guide": "^4.0.0"
   },
   "scripts": {
-    "test": "node test.js"
+    "test": "remark . --quiet --frail && node test.js"
+  },
+  "remarkConfig": {
+    "plugins": [
+      "preset-lint-markdown-style-guide",
+      "html"
+    ]
   }
 }
```

Now from the command line we can run:

```sh
npm test
```

This will lint all Markdown files when we test the project.
[`--frail`][frail] ensures the command fails if a code-style violation
is found, and [`--quiet`][quiet] hides successful files from the report.

## Programmatic usage

The programmatic interface of **remark** is provided by
[**unified**][unified].  In fact, [`remark`][api] is two plugins:
[`remark-parse`][parse] and [`remark-stringify`][stringify].

Install [`remark`][api] and dependencies with [npm][]:

```sh
npm install vfile-reporter remark remark-html remark-preset-lint-markdown-style-guide
```

`index.js` contains:

```js
var remark = require('remark')
var styleGuide = require('remark-preset-lint-markdown-style-guide')
var html = require('remark-html')
var report = require('vfile-reporter')

remark()
  .use(styleGuide)
  .use(html)
  .process('_Hello_.', function (err, file) {
    console.error(report(err || file))
    console.log(String(file))
  })
```

`node index.js` yields:

```txt
  1:1-1:8  warning  Emphasis should use `*` as a marker  emphasis-marker  remark-lint

⚠ 1 warning
<p><em>Hello</em>.</p>
```

<!-- Definitions -->

[logo]: https://raw.githubusercontent.com/remarkjs/remark/4f6b3d7/logo.svg?sanitize=true

[issues]: https://github.com/remarkjs/remark/issues

[discussions]: https://github.com/remarkjs/remark/discussions

[npm]: https://docs.npmjs.com/cli/install

[api]: https://github.com/remarkjs/remark/tree/main/packages/remark

[cli]: https://github.com/remarkjs/remark/tree/main/packages/remark-cli

[plugins]: https://github.com/remarkjs/remark/tree/main/doc/plugins.md

[unified]: https://github.com/unifiedjs/unified

[website]: https://unifiedjs.com

[unified-args]: https://github.com/unifiedjs/unified-args

[frail]: https://github.com/unifiedjs/unified-args#--frail

[quiet]: https://github.com/unifiedjs/unified-args#--quiet

[parse]: https://github.com/remarkjs/remark/tree/main/packages/remark-parse

[stringify]: https://github.com/remarkjs/remark/tree/main/packages/remark-stringify

[preset]: https://github.com/remarkjs/remark-lint/tree/HEAD/packages/remark-preset-lint-markdown-style-guide

[html]: https://github.com/remarkjs/remark-html
