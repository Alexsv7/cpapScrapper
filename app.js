
var express = require('express');
var fs = require('fs');
var request = require('request');
var cheerio = require('cheerio');
var app = express();
var http = require('http');
//var excelWriter = require("./excelWriter.js");
var pdfUtils = require("./pdfUtils");
var csvWriter = require("./csvWriter.js");// add 2 to delete images
var EventEmitter = require('events').EventEmitter;
var _emitter = new EventEmitter();
var _Products = [];
var _ProductsCount = 0;
var _parsedImagesCount = 0;
var _ProductImagesCount = [];
//var _Category = 'Mask & Headgear';
//var _Category = 'BiPAP Mashine';

var _ProductListUrl = "http://www.cpapsupplyusa.com/cpap-masks/cpap-masks/brand/fisher-paykel.aspx";
//var _ProductListUrl = "http://www.cpapsupplyusa.com/cpap-masks/cpap-masks/brand/resmed.aspx";
//var _ProductListUrl = "http://www.cpapsupplyusa.com/cpap-masks/cpap-masks/brand/respironics.aspx";
//var _ProductListUrl = "http://www.cpapsupplyusa.com/cpap-machines/cpap-machines/brand/fisher-paykel.aspx";
//var _ProductListUrl = "http://www.cpapsupplyusa.com/cpap-machines/cpap-machines/brand/resmed.aspx";
//var _ProductListUrl = "http://www.cpapsupplyusa.com/cpap-machines/cpap-machines/brand/resmed/cpap.aspx";
//var _ProductListUrl = "http://www.cpapsupplyusa.com/cpap-machines/cpap-machines/brand/resmed/auto-cpap.aspx";
//var _ProductListUrl = "http://www.cpapsupplyusa.com/cpap-machines/cpap-machines/brand/resmed/bipap.aspx";
//var _ProductListUrl = "http://www.cpapsupplyusa.com/cpap-machines/cpap-machines/brand/Respironics.aspx"; 
//var _ProductListUrl = "http://www.cpapsupplyusa.com/cpap-machines/cpap-machines/brand/respironics/cpap.aspx";
//var _ProductListUrl = "http://www.cpapsupplyusa.com/cpap-machines/cpap-machines/brand/respironics/auto-cpap.aspx";
//var _ProductListUrl = "http://www.cpapsupplyusa.com/cpap-machines/cpap-machines/brand/respironics/bipap.aspx";

var _lastPageReached = false;
var _ProductUrls = [];

app.get('/scrape', function (req, res) {
    fillProductLinks(_ProductListUrl);
    res.send(_ProductListUrl);
})
app.listen('8081')
exports = module.exports = app;

var fillProductLinks = function (currentLink) {
    request(currentLink, function (error, response, html) {
        if (!error) {
            var $ = cheerio.load(html);

            $('#products').filter(function () {
                var data = $(this);
                var productsUrls = data.find('.SingleProductDisplayName a');
                for (var i = 0; i < productsUrls.length; i++) {
                    _ProductUrls.push("http://www.cpapsupplyusa.com" + $(productsUrls[i]).attr('href'));
                }
                var nextPageUrl = '';
                var $aNextPage = $("li[id$='_Pager2_NextListItem'] a");
                if ($aNextPage.length > 0) {
                    nextPageUrl = $aNextPage.attr('href');
                }
                if (nextPageUrl != '') {
                    fillProductLinks("http://www.cpapsupplyusa.com" + nextPageUrl);
                } else {
                    _emitter.emit('theLastPageLinksParsed');
                }
            });
        }
    })
}

_emitter.on('theLastPageLinksParsed', function () {
    for (var i = 0; i < _ProductUrls.length; i++) {
        parseProduct(_ProductUrls[i]);
    }
})


_emitter.on('theLastImageParsed', function () {
    //debugger;
    var fileName = _ProductListUrl.replace('http://www.cpapsupplyusa.com/', '')
    fileName = fileName.replace(new RegExp('/', 'g'), '_');
    fileName = fileName.replace('.', '_');
    fileName = fileName.replace(new RegExp('-', 'g'), '_');
    csvWriter.writeCsv(_Products, fileName);
    //excelWriter.writeExcel(_Products, fileName);
});

_emitter.on('theLastProductParsed', function () {
    for (var i = 0; i < _Products.length; i++) {
        imagesDownload(_Products[i].productId);
    }
});


var _parseProductCallCount = 0;
var _lastProductEventCallCount = 0;

var parseProduct = exports.ParseProduct = function (url) {
    _parseProductCallCount++;
    request(url, function (error, response, html) {
        if (!error) {
            var $ = cheerio.load(html);

            $('#Container').filter(function () {
                var data = $(this);
                var product = parseDetails(data);
                saveProduct(product);
            });
        }
        riseEventIfTheLastProduct();
    })
}

var saveProduct = function (productObj) {
    var updateExistingProduct = false;
    if (_Products.length > 0) {
        for (i = 0; i < _Products.length; i++) {
            if (_Products[i].productId == productObj.productId) {
                _Products[i] = productObj;
                updateExistingProduct = true;
            }
        }
    }
    if (!updateExistingProduct) {
        _Products.push(productObj);
    }
}
var getProduct = function (productId) {
    if (_Products.length > 0) {
        for (i = 0; i < _Products.length; i++) {
            if (_Products[i].productId == productId) {
                return _Products[i];
            }
        }
    }
}

var riseEventIfTheLastProduct = function () {
    if (_Products.length == _ProductUrls.length) {
        _lastProductEventCallCount++;
        _emitter.emit('theLastProductParsed');
    }
}

var parseDetails = function (data) {
    var category = 'BiPAP Mashine';
    if (_ProductListUrl.indexOf('cpap-masks') > 0) {
        category = 'CPAP & Respiratory';
    }
    var product = new Product(category);
    product.sku = data.find("span[id$='lblSku']").text();
    //debugger;
    product.name = cleanText(data.find('.productPageHeader').find("span[id$='lblName']").text());
    product.price = getFloat(data.find("span[id$='lblListPrice']").text());
    var priceWithDiscount = data.find("span[id$='lblSitePrice']").text();

    product.productId = data.find("input[id$='bvinField']").val();

    if (isFloat(priceWithDiscount))
        product.price = getFloat(priceWithDiscount);
    var sizeOprions = [];
    var isFirst = true;
    var sizes = data.find(".SizeDD option");
    if (sizes != undefined && sizes.length > 0) {
        for (var index = 1; index < sizes.length; index++)
            product.sizeOptions.push(sizes[index].children[0].data);
    } else {
        var selectOptions = data.find("select[id$='ChoiceList'] option");
        if (selectOptions != undefined &&
            selectOptions.length > 0 &&
            selectOptions[0].children[0].data == 'Select a Size') {
            for (var index = 1; index < selectOptions.length; index++)
                product.sizeOptions.push(selectOptions[index].children[0].data);
        }
    }

    var brandSpan = data.find("span:contains('Brand/Manufacturer:')");
    if (brandSpan != undefined) {
        product.brand = cleanText(brandSpan.next("span").html()).replace('&amp;', '&');
    }

    product.specifications = cleanText(specificationsGet(data));
    product.resources = cleanText(resourcesGet(data));
    product.description = cleanText(descriptionGet(data));

    return product;
}

var descriptionGet = function (data) {
    pdfsDownload(data, 'Desc');
    var desc = data.find('span[id$="_lblDescription"]');
    if (desc != undefined && desc.length > 0)
        return desc.html();
    return '';
}

var specificationsGet = function (data) {
    pdfsDownload(data, 'Specs')
    var result = '';
    var panel = data.find('#Specs .producttypepanel')
    var legal = data.find('#Specs .legal');
    var panelText = panel != null && panel != undefined ? panel.html() : '';
    var legalText = legal != null && legal != undefined ? legal.html() : '';
    if (panelText != '' || legalText != '') {
        result = '<div>' + panelText + '</div> <br/> <div>' + legalText + '</div>';
    }
    return result;
}
var resourcesGet = function (data) {
    pdfsDownload(data, 'Resources #Resources')
    var result = '';
    var res = data.find('#Resources #Resources')
    if (res != undefined && res.length > 0) {
        result = res.html();
    }
    return result;
}

var pdfsDownload = function (data, containerId) {
    var anchers = data.find('#' + containerId + ' a');
    if (anchers.length > 0) {
        for (var i = 0; i < anchers.length; i++) {
            if (anchers[i].attribs != undefined &&
                anchers[i].attribs.href != undefined &&
                anchers[i].attribs.href.indexOf(/pdfs/) == 0) {
                pdfUtils.downloadFile(anchers[i].attribs.href);
            }
        }
    }
}

var cleanText = function (text) {
    if (text != null && text != undefined && text != '') {
        return text.trim().replace('_x000d_', '^|').replace('™', /* '&trade;'*/ '');
    }
    return '';
    //todo Slavik add remove View Specs logic with <p>
}

// var creanName = function (text) {
//     if (text.indexOf('Anonymous') > 0) {
//         text = text.split('Anonymous')[0];
//     }
//     if (text.indexOf('Mask & Headgear') > 0) {
//         text = text.split('Mask & Headgear')[0].trim() + ' Mask & Headgear';
//     } else if (text.indexOf('Mask and Headgear') > 0) {
//         text = text.split('Mask and Headgear')[0].trim() + ' Mask & Headgear';
//     } else if (text.indexOf('Mask with Headgear') > 0) {
//         text = text.split('Mask with Headgear')[0].trim() + ' Mask & Headgear';
//     }
//     return cleanText(text);
// }

var isFloat = function (n) {
    n = n.replace('$', '').trim();
    return Number(n) == n && n % 1 != 0;
}
var getFloat = function (strPrice) {
    var result = 0;
    if (strPrice != '') {
        result = parseFloat(strPrice.replace('$', '').trim());
    }
    return result;
}

var _totalImagesCount = 0;
var _downloadedImagesCount = 0

var imagesDownload = function (productId) {
    var imgZoomUrl = "http://www.cpapsupplyusa.com/ZoomImage.aspx?ProductId=" + productId;
    request(imgZoomUrl, function (error, response, html) {
        if (!error) {
            var $ = cheerio.load(html);
            $('#gallery').filter(function () {
                var data = $(this);
                var anchers = data.find("a");
                for (var index = 0; index < anchers.length; index++) {
                    if (index <= 4) {
                        _totalImagesCount++;
                        var url = $(anchers[index]).attr('href');
                        downloadBigImage('http://www.cpapsupplyusa.com' + url);
                    }
                }
            });
        }
    });
}

var downloadBigImage = function (zoomUrl) {
    request(zoomUrl, function (error, response, html) {
        if (!error) {
            var $ = cheerio.load(html);
            $('#RightColumn').filter(function () {
                var data = $(this);
                var img = data.find("img");
                var productId = response.request.uri.href.split('ProductId=')[1].split('&')[0];
                var product = getProduct(productId);
                var src = $(img).attr('src');
                var srcUrlParts = src.split('/');
                var imageName = srcUrlParts[srcUrlParts.length - 1];
                saveImage(src, imageName);
                product.images.push(imageName);
                saveProduct(product);
                var imagesCount =
                    _downloadedImagesCount++;
                if (_downloadedImagesCount == _totalImagesCount) {
                    _emitter.emit('theLastImageParsed');
                }
            });
        }
    });
}

var saveImage = function (uri, filename) {
    var filepath = "images/" + filename;
    var file = fs.createWriteStream(filepath);
    try {
        var request = http.get("http://www.cpapsupplyusa.com" + uri, function (response) {
            response.pipe(file);
        });
    }
    catch (ex) {
        debugger;
    }
}

function Product(category) {
    this.category = category;
    this.sku = "";
    this.name = "";
    this.price = 0;
    this.productId = "";
    this.sizeOptions = [];
    this.colors = [];
    this.sizeOprions = "";
    this.features = "";
    this.description = "";
    this.resources = "";
    this.specifications = "";
    this.brand = "";
    this.images = [];
}