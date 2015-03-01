Lots of entities are supported in mdast: &nbsp;, &amp;, &copy;, &AElig;,
&Dcaron;, &frac34;, &HilbertSpace;, &DifferentialD;,
&ClockwiseContourIntegral;, &c.  Even some entities with a missing
terminal semicolon are parsed correctly (as per the HTML5 spec):
&yuml, &aacute, &copy, and &amp.

However, &MadeUpEntities; are kept in the document.

Entities even work in the language flag of fenced code blocks:

```some&mdash;language
alert('Hello');
```

Or in [l&iacute;nks](~/some&mdash;file "in some pl&aelig;ce")

Or in ![&iacute;mages](~/an&ndash;image.png "&copy Someone")

But, entities are not interpreted in `inline c&ouml;de`, or in
code blocks:

	C&Ouml;DE block.
