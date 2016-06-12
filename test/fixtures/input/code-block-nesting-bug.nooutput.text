GitHub, thus RedCarpet, has a bug where “nested” fenced code blocks,
even with shorter fences, can exit their actual “parent” block.

Note that this bug does not occur on indented code-blocks.

````foo
```bar
baz
```
````

Even with a different fence marker:

````foo
~~~bar
baz
~~~
````

And reversed:

~~~~foo
~~~bar
baz
~~~
~~~~

~~~~foo
```bar
baz
```
~~~~
