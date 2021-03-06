var writeFile = function (rowList, fileName) {
    var csv = require('csv');
    var obj = csv();
    obj.from.array(rowList).to.path('result1/' + fileName + '.csv');
    console.log('result1/' + fileName + '.csv');
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
    var imagesList = '';
    const imgsCount = 1;
    for (var imgIndex = 0; imgIndex < imgsCount; imgIndex++) {
        if (imgIndex < product.images.length) {
            imagesList +=  product.images[imgIndex];// + "; ";
        }
    }

    var row = [
        product.name,
        product.sku,
        type,
        4, // visibility
        product.category,
        product.brand,
        'product.description',
        'product.specifications',
        'product.resources',
        imagesList,
        "",//option_1
        product.price,
        'product.description',//short_description
        0,//weight
        999,// quantity
        "Default",//_attribute_set,
        1,//status,
        0//tax_class_id
    ];
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
            1, // visibility,
            '',// category,
            '',// brand,
            '',// description,
            '',// specifications
            '',//resources
            '',// image           
            size,//options_1          
            '', // price
            '', // short_description
            0, //weight
            '999', //quantity       
            "Default",//_attribute_set,          
            1,//status,
            0//tax_class_id    
        ];
        rows.push(row);
        iteration++;
    }
    return rows;
}
var dataPrepare = function (headers, products) {
    debugger;
    var rows = [];
    rows.push(headers);
    for (var i = 0; i < products.length; i++) {
        var oneProductRows = oneProductRowsPrepare(products[i]);
        for (var j = 0; j < oneProductRows.length; j++) {
            rows.push(oneProductRows[j]);
        }
    }
    return rows;
}


exports.writeCsv = function (products, fileName) {
    //debugger;
    var headerArray =
            [  
            'name',
            'sku',
            '_type',
            'visibility',
            '_category',
            'brands',
            'description',
            'specifications',
            'features',
            'image',           
            'options_1',
            'price',
            'short_description',
            "weight",
            'quantity',          
            "_attribute_set",           
            "status",
            "tax_class_id",   
            ];

    var data = dataPrepare(headerArray, products);
    //debugger;
    writeFile(data, fileName);
}