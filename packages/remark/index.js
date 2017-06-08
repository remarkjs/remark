import unified from 'unified';
import parse from 'remark-parse';
import stringify from 'remark-stringify';

export default unified().use(parse).use(stringify).freeze();
