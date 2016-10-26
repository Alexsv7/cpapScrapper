var writeFile = function (rowList, fileName){
    debugger;
    var csv = require('csv');
    var obj = csv();  
    obj.from.array(rowList).to.path('result/' + fileName + '.csv');
}

//module.exports.csvFileWrite = csvFileWrite;
function sizeSkuGet(size) {
    var sku = '';
    var sizeParts = size.split('-');
    if (sizeParts != undefined && sizeParts.length > 1) {
        sku = sizeParts[0].trim();
    }
    return sku;    
}
function oneProductRowsPrepare(product) {
 var type = product.sizeOptions.length > 0 ? 'configurable' : 'simple';
 var rows = [];
 var row = [
            product.name,
            product.sku,
            type,
            1, // visibility
            product.category,
            product.brand,
            product.description,
            product.features
        ];
        const imgsCount = 5;
        for (var imgIndex = 0; imgIndex < imgsCount; imgIndex++) {
            if (product.images.length < imgIndex) {
                row.push('');
            } else {
                row.push(product.images[imgIndex]);
            }
        }
        row.push("");
        row.push("");
        row.push("");
        row.push(product.price);
        row.push(""); //short_description;
        row.push(""); //weight 
        row.push("999")//quantity            
        rows.push(row);

    var iteration = 0;
    while (iteration < product.sizeOptions.length) {
        var size = product.sizeOptions[iteration];
        var sku = sizeSkuGet(size);
        if (sku == '')
            sku = product.sku;
        var row = [
            product.name,
            sku,
            "simple",//type
            0, // visibility,
            '',// category,
            '',// brand,
            '',// description,
            '',// features
            '',// image1
            '',// image2
            '',// image3
            '',// image4
            '',// image5
            size,//options_1
            '', // options_2
            '', // options_3
            '', // price
            '', // short_description
            '', //weight
            '999' //quantity           
        ];           
        rows.push(row);
        iteration++;
    }
    return rows;
}
var dataPrepare = function (headers, products) {
    //debugger;
    var rows = [];
    rows.push(headers);
    for (var i = 0; i < products.length; i++) {
        var oneProductRows = oneProductRowsPrepare(products[i]);
        for (var j=0; j < oneProductRows.length; j++){
            rows.push(oneProductRows[j]);
        }   
    }
    return rows;
}


exports.writeCsv = function (products, fileName) {
    //debugger;
    var headerArray =
        ['name',
            'sku',
            '_type',
            'visibility',
            '_category',
            'brands',
            'description',
            'features',
            'Main Image',
            '2nd Image',
            '3rd Image',
            '4th Image',
            '5th Image',
            'options_1',
            'options_2',
            'options_3',
            'price',
            'short_description',
            'weight',
            'quantity'];

    var data = dataPrepare(headerArray, products);   
    //debugger;
    writeFile(data, fileName);
}