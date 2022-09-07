import fs from 'node:fs'
import path from 'node:path'

const targetTypeFile = path.join(
  'packages',
  'remark-parse',
  'lib',
  'index.d.ts'
)
if (!fs.existsSync(targetTypeFile)) {
  throw new Error('Cannot find `' + targetTypeFile + '`')
}

const content = fs.readFileSync(targetTypeFile, 'utf-8')

/**
 * NOTE: In ../packages/remark-parse/lib/index.js , we use `typedef` specify the import path as "mdast-util-from-markdown",
 * but due to the issue in https://github.com/microsoft/TypeScript/issues/38111 ,
 * it is replaced by the shortest path.
 * Since the path cannot be referenced, we replace with an entrypoint that types were re-exported.
 * @see https://github.com/remarkjs/remark/issues/1039
 */

const replaced = content.replace(
  'import("mdast-util-from-markdown/lib")',
  'import("mdast-util-from-markdown")'
)

fs.writeFileSync(targetTypeFile, replaced)
