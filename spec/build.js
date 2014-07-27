var fs = require('fs');
var mdast = require('../index.js');

fs.readdirSync('./spec/input').filter(function (path) {
    return path.indexOf('.') !== 0;
}).forEach(function (path) {
    var filename = path.split('.'),
        options, option;

    filename.pop();

    if (filename.length === 2) {
        option = filename[1];
        options = {};

        if (option === 'gfm' || option === 'nogfm') {
            options.gfm = option === 'gfm';
        }

        if (option === 'tables' || option === 'notables') {
            options.tables = option === 'tables';
        }

        if (option === 'breaks' || option === 'nobreaks') {
            options.breaks = option === 'breaks';
        }

        if (option === 'pedantic' || option === 'nopedantic') {
            options.pedantic = option === 'pedantic';
        }

        if (option === 'smartlists' || option === 'nosmartlists') {
            options.smartLists = option === 'smartlists';
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
