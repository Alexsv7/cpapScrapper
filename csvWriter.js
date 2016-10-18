var csvFileWrite = function (fileName, rowList){
    var csv = require('csv');
    var obj = csv();  
    obj.from.array(rowList).to.path('../datafile/' + fileName);
}

module.exports.csvFileWrite = csvFileWrite;