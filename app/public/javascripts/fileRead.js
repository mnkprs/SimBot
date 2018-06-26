const testFolder = 'simulations'
var fs = require('fs')

filesArray = [];

    fs.readdir(testFolder, (err, files) => {
        if (err) {
            throw err
        }
        files.forEach(file => {
            filesArray.push(file)
        })
    });

module.exports = filesArray;
