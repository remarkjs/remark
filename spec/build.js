var fs = require('fs');
var mdast = require('../index.js');

fs.readdirSync('./spec/input').filter(function (path) {
    return path.indexOf('.') !== 0;
}).forEach(function (path) {
    var filename = path.split('.'),
        flag, options, index;

    filename.pop();

    if (filename.length > 1) {
        index = 0;
        options = {};

        while (filename[++index]) {
            flag = filename[index];

            if (flag === 'gfm' || flag === 'nogfm') {
                options.gfm = flag === 'gfm';
            }

            if (flag === 'tables' || flag === 'notables') {
                options.tables = flag === 'tables';
            }

            if (flag === 'breaks' || flag === 'nobreaks') {
                options.breaks = flag === 'breaks';
            }

            if (flag === 'pedantic' || flag === 'nopedantic') {
                options.pedantic = flag === 'pedantic';
            }

            if (flag === 'smartlists' || flag === 'nosmartlists') {
                options.smartLists = flag === 'smartlists';
            }
        }
    }

    filename = filename.join('.');

    var file = fs.readFileSync('./spec/input/' + path, 'utf-8');
    var json;

    try {
        console.log('+' + filename);
        json = mdast(file, options);
        fs.writeFileSync('./spec/output/' + filename + '.json', JSON.stringify(json, null, 2));
    } catch (error) {
        console.log('-' + filename);
        throw error;
        fs.writeFileSync('./spec/output/' + filename.toUpperCase() + '.json', '');
    }
})
