# mdast

**mdast** is speedy Markdown parser (not compiler) for multipurpose analysis (a syntax tree) in JavaScript. NodeJS, and the browser. Lots of tests. 100% coverage.

## Installation

npm:
```sh
$ npm install mdast
```

Component.js:
```sh
$ component install wooorm/mdast
```

Bower:
```sh
$ bower install mdast
```

## Usage

### Markdown:
```js
var marked = require('marked');

marked('Some *emphasis*,  **strongness**, and `code`.');
```

Output:

```json
{
    "type" : "root",
    "children" : [
        {
            "type": "paragraph",
            "children": [
                {
                    "type": "text",
                    "value": "Some "
                },
                {
                    "type": "emphasis",
                    "children": [
                        {
                            "type": "text",
                            "value": "emphasis"
                        }
                    ]
                },
                {
                    "type": "text",
                    "value": ",  "
                },
                {
                    "type": "strong",
                    "children": [
                        {
                            "type": "text",
                            "value": "strongness"
                        }
                    ]
                },
                {
                    "type": "text",
                    "value": ", and "
                },
                {
                    "type": "code",
                    "value": "code"
                },
                {
                    "type": "text",
                    "value": "."
                }
            ]
        }
    ]
}
```

### Github Flavored Markdown

```js
marked('hello ~~hi~~ world', {
    'gfm' : true
});
```

Output:

```json
{
    "type": "root",
    "children": [
        {
            "type": "paragraph",
            "children": [
                {
                    "type": "text",
                    "value": "hello "
                },
                {
                    "type": "delete",
                    "children": [
                        {
                            "type": "text",
                            "value": "hi"
                        }
                    ]
                },
                {
                    "type": "text",
                    "value": " world"
                }
            ]
        }
    ]
}
```


## License

This project was initially a fork of [marked](https://github.com/chjj/marked).

Copyright (c) 2011-2014, Christopher Jeffrey. (MIT License)
Copyright (c) 2014, Titus Wormer. (MIT License)
