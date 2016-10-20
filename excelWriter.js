
var XLSX = require('XLSX')

function datenum(v, date1904) {
    if (date1904) v += 1462;
    var epoch = Date.parse(v);
    return (epoch - new Date(Date.UTC(1899, 11, 30))) / (24 * 60 * 60 * 1000);
}

function sheet_from_array_of_arrays(data, opts) {
    var ws = {};
    var range = {
        s: { c: 10000000, r: 10000000 },
        e: { c: 0, r: 0 }
    };
    for (var R = 0; R != data.length; ++R) {
        for (var C = 0; C != data[R].length; ++C) {
            if (range.s.r > R)
                range.s.r = R;
            if (range.s.c > C)
                range.s.c = C;
            if (range.e.r < R)
                range.e.r = R;
            if (range.e.c < C)
                range.e.c = C;
            var cell = { v: data[R][C] };
            if (cell.v == null)
                continue;
            var cell_ref = XLSX.utils.encode_cell({ c: C, r: R });

            if (typeof cell.v === 'number')
                cell.t = 'n';
            else if (typeof cell.v === 'boolean')
                cell.t = 'b';
            else if (cell.v instanceof Date) {
                cell.t = 'n';
                cell.z = XLSX.SSF._table[14];
                cell.v = datenum(cell.v);
            }
            else
                cell.t = 's';

            ws[cell_ref] = cell;
        }
    }
    if (range.s.c < 10000000)
        ws['!ref'] = XLSX.utils.encode_range(range);
    return ws;
}

var ws_name = "Sheet1";

function Workbook() {
    if (!(this instanceof Workbook))
        return new Workbook();
    this.SheetNames = [];
    this.Sheets = {};
}

function writeFile(data, fileName) {
    var wb = new Workbook(),
        ws = sheet_from_array_of_arrays(data);

    wb.SheetNames.push(ws_name);
    wb.Sheets[ws_name] = ws;

    var filePath = 'result/' + fileName + '.xlsx';
    XLSX.writeFile(wb, filePath);
    console.log('Result written: ' + filePath)
}
function sizeSkuGet(size) {
    var sku = '';
    var sizeParts = size.split('-');
    if (sizeParts != undefined && sizeParts.length > 1) {
        sku = sizeParts[0].trim();
    }
    return sku;
    // var sufix = "";
    // if (size.indexOf("Small"))
    //     sufix = "S";
    // if (size.indexOf("Medium"))
    //     sufix = "M";
    // if (size.indexOf("Large"))
    //     sufix = "L";
    // if (size.indexOf("Petite"))
    //     sufix = "S";
    // if (size.indexOf("Standard"))
    //     sufix = "M";
    // if (size.indexOf("Plus"))
    //     sufix = "L";
    // if (size.indexOf("Extra large"))
    //     sufix = "XL";
    // return sufix;
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

exports.writeExcel = function (products, fileName) {
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