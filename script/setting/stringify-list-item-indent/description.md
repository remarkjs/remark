Setting `listItemIndent: "1"` (`"tab"`, `"mixed"`, or `"1"`, default: `"tab"`)
will stringify list items with a single space following the bullet.

The default, `"tab"`, will compile to bullets and spacing set to tab-stops
(multiples of 4).

The other value, `"mixed"`, uses `"tav"` when the list item spans multiple
lines, and `"1"` otherwise.

> **Note**: choosing `"tab"` results in the greatest support across
> vendors when mixing lists, block quotes, indented code, &c.
