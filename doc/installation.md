![mdast](https://cdn.rawgit.com/wooorm/mdast/master/logo.svg)

# Installation

To use **mdast**’s [API](https://github.com/wooorm/mdast#api),
[install](#install) **mdast** and start to [use](#use) it using a
preferred method. To use the [CLI](https://github.com/wooorm/mdast#cli),
install with [npm](#npm).

## Table of Contents

*   [Use](#use)

    *   [CommonJS](#commonjs)
    *   [AMD](#amd)
    *   [Globals](#globals)

*   [Install](#install)

    *   [Package Managers](#package-managers)

        *   [npm](#npm)
        *   [Duo](#duo)

    *   [Download](#download)

## Use

### CommonJS

1.  Install with [**npm**](#npm), [**Duo**](#duo), or
    [download](#download);

    *   When downloading or installing with **Bower**, follow step `2.` of
        [**Globals**](#globals) and additionally load a **CommonJS** loader
        such as [require1k](http://stuk.github.io/require1k/).

2.  Access `mdast`:

    ```js
    var mdast = require('mdast');

    console.log(mdast.process('*hello* __world__'));
    // _hello_ **world**
    ```

### AMD

1.  [Download](#download);

2.  Access **mdast**:

    ```js
    require(['path/to/mdast.min.js'], function (mdast) {
        console.log(mdast.process('*hello* __world__'));
        // _hello_ **world**
    });
    ```

Read more about **AMD** on [requirejs.org](http://requirejs.org/docs/start.html#add).

### Globals

1.  [Download](#download);

2.  Include `mdast.min.js` in HTML:

    ```html
    <!DOCTYPE html>
    <html>
      <head>
        <title>mdast example</title>
        <script src="path/to/mdast.min.js" charset="utf-8"></script>
        <script src="path/to/script/using/mdast.js" charset="utf-8"></script>
      </head>
      <body>
      </body>
    </html>
    ```

3.  Access **mdast**:

    ```js
    console.log(mdast.process('*hello* __world__'));
    // _hello_ **world**
    ```

## Install

### Package Managers

First, if you have not already, install Node:

Either install node from its [download](https://nodejs.org/en/download/)
documentation, or install [nvm](https://github.com/creationix/nvm#install-script)
to [manage and update](https://github.com/creationix/nvm#usage) Node versions.

#### [npm](https://docs.npmjs.com/cli/install)

```sh
npm install mdast
```

When using the **mdast** CLI system-wide, provide the `--global` flag.

When using **mdast** inside a project, provide either `--save` or `--save-dev`.

See [**CommonJS**](#commonjs) on how to start using **mdast**.

#### [Duo](http://duojs.org#getting-started)

Optionally: when using **mdast** inside a project, add it to a
[`component.json`](http://duojs.org/#ii-components) file:

```json
{
  "name": "duo-component",
  "version": "0.0.1",
  "main": "index.js",
  "dependencies": {
    "wooorm/mdast": "^2.0.0"
  }
}
```

See [**CommonJS**](#commonjs) on how to start using **mdast**.

### Download

Using a [package manager](#package-managers) is suggested, but it is possible
to download [`mdast.js` and `mdast.min.js`](https://github.com/wooorm/mdast/releases)
and save them to your project folder.

See [**Globals**](#globals), [**AMD**](#amd), or [**CommonJS**](#commonjs) on
how to start using **mdast**.
