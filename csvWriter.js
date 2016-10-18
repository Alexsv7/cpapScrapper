// csvFileWrite('dataInfo.csv', [
//         ['101', 'MS', 100000],
//         ['102', 'LS', 80000],
//         ['103', 'TS', 60000],
//         ['104', 'VB', 200000],
//         ['105', 'PB', 180000],
//         ['106', 'AB', 160000]
//         ]);

var csvFileWrite = function (fileName, rowList){
    var csv = require('csv');
    var obj = csv();  
    obj.from.array(rowList).to.path('../datafile/' + fileName);
}

module.exports.csvFileWrite = csvFileWrite;