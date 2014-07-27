var fs = require('fs');
var mdast = require('../index.js');

console.log(mdast);

fs.readdirSync('./spec/input').filter(function (path) {
    return path.indexOf('.') !== 0;
}).forEach(function (path) {
    var filename = path.split('.');
    filename.pop();
    filename = filename.join('.');

    var file = fs.readFileSync('./spec/input/' + path, 'utf-8');
    var json;

    try {
        console.log('+' + filename);
        json = mdast(file);
        fs.writeFileSync('./spec/output/' + filename + '.json', JSON.stringify(json, null, 2));
    } catch (error) {
        console.log('-' + filename);
        throw error;
        fs.writeFileSync('./spec/output/' + filename.toUpperCase() + '.json', '');
    }
})
