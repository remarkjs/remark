![remark][logo]

# Getting Started

**remark** transforms markdown.  It’s an ecosystem of [plug-ins][plugins].
If you get stuck, [issues][] and [Gitter][] are good places to get help.

## Table of Contents

*   [Introduction](#introduction)
*   [Command-line](#command-line)
*   [Using remark in a project](#using-remark-in-a-project)
*   [Programmatic usage](#programmatic-usage)

## Introduction

Out of the box, **remark** transpiles markdown:
markdown is given, reformatted, and written:

```md
# Alpha #
Bravo charlie **delta** __echo__.
- Foxtrot
*  Golf
+ Hotel
```

Yields:

```md
# Alpha

Bravo charlie **delta** **echo**.

-   Foxtrot
-   Golf
-   Hotel
```

But, much more can be done, [through plug-ins][plugins].

## Command-line

**remark**’s CLI is a simple way to process markdown files from the
command line.  Its interface is provided by [**unified-args**][unified-args].

Install [`remark-cli`][cli] and dependencies with [npm][]:

```bash
npm install --global remark-cli remark-lint remark-html
```

`readme.md` contains:

```md
## Hello world!
```

`remark readme.md --use lint --use html` yields:

```txt
<h2>Hello world!</h2>
readme.md:
   1:1-1:16  warning  First heading level should be `1`         first-heading-level
   1:1-1:16  warning  Don’t add a trailing `!` to headings      no-heading-punctuation

⚠ 3 warnings
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

And install `remark-cli` and `remark-lint` into it as a dev-dependency:

```sh
npm install remark-cli --save-dev
```

The `--save-dev` option stores the dependencies in our `package.json`:

```diff
 {
   "name": "my-package",
   "version": "1.0.0",
+  "devDependencies": {
+    "remark-cli": "^1.0.0",
+    "remark-lint": "^4.0.0"
+  },
   "scripts": {
     "test": "node test.js"
   }
 }
```

Then, we change our `test` script to include remark.

```diff
 {
   "name": "my-package",
   "version": "1.0.0",
   "devDependencies": {
     "remark-cli": "^1.0.0",
     "remark-lint": "^4.0.0"
   },
   "scripts": {
-    "test": "node test.js"
+    "test": "remark . --use lint --quiet --frail && node test.js"
   }
 }
```

Now from the command line we can run:

```sh
npm test
```

This will lint all markdown files when we test the project.
[`--frail`][frail] ensures the command fails if a code-style violation
is found, and [`--quiet`][quiet] hides successful files from the report.

## Programmatic usage

The programmatic interface of **remark** is provided by
[**unified**][unified].  In fact, [`remark`][api] is two plug-ins:
[`remark-parse`][parse] and [`remark-stringify`][stringify].

Install [`remark`][api] and dependencies with [npm][]:

```bash
npm install remark remark-lint remark-html vfile-reporter
```

`index.js` contains:

```js
var remark = require('remark');
var lint = require('remark-lint');
var html = require('remark-html');
var report = require('vfile-reporter');

remark().use(lint).use(html).process('## Hello world!', function (err, file) {
  console.error(report(err || file));
  console.log(String(file));
});
```

`node index.js` yields:

```txt
        1:1  warning  Missing newline character at end of file  final-newline
   1:1-1:16  warning  First heading level should be `1`         first-heading-level
   1:1-1:16  warning  Don’t add a trailing `!` to headings      no-heading-punctuation

⚠ 3 warnings
<h2>Hello world!</h2>
```

<!-- Definitions -->

[logo]: https://cdn.rawgit.com/wooorm/remark/master/logo.svg

[issues]: https://github.com/wooorm/remark/issues

[gitter]: https://gitter.im/wooorm/remark

[npm]: https://docs.npmjs.com/cli/install

[api]: https://github.com/wooorm/remark/tree/master/packages/remark

[cli]: https://github.com/wooorm/remark/tree/master/packages/remark-cli

[plugins]: https://github.com/wooorm/remark/tree/master/doc/plugins.md

[unified]: https://github.com/wooorm/unified

[unified-args]: https://github.com/wooorm/unified-args

[frail]: https://github.com/wooorm/unified-args#--frail

[quiet]: https://github.com/wooorm/unified-args#--quiet

[parse]: https://github.com/wooorm/remark/tree/master/packages/remark-parse

[stringify]: https://github.com/wooorm/remark/tree/master/packages/remark-stringify
