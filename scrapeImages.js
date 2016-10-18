var fs = require('fs');
var app = express();

debugger;
app.get('/scrape', function (req, res) {
    debugger;
    var writeStream = fs.createWriteStream("file.xls");

    var header = "Sl No" + "\t" + " Age" + "\t" + "Name" + "\n";
    var row1 = "0" + "\t" + " 21" + "\t" + "Rob" + "\n";
    var row2 = "1" + "\t" + " 22" + "\t" + "bob" + "\n";

    writeStream.write(header);
    writeStream.write(row1);
    writeStream.write(row2);

    writeStream.close();

    // debugger;
    // request(_ProductListUrl, function (error, response, html) {
    //     if (!error) {
    //         var $ = cheerio.load(html);

    //         $('#products').filter(function () {
    //             debugger;
    //             var data = $(this);
    //             var productsUrls = data.find('.SingleProductDisplayName a');
    //             _ProductsCount = productsUrls.length;
    //             for (var i = 0; i < productsUrls.length; i++) {
    //                 var link = "http://www.cpapsupplyusa.com" + $(productsUrls[i]).attr('href');
    //                 _IsLastProduct = (i == productsUrls.length - 1);
    //                 parseProduct(link);
    //             }
    //         });
    //         // Finally, we'll just send out a message to the browser reminding you that this app does not have a UI.
    //         res.send('ok');
    //     }
    // })


    // url = 'http://www.cpapsupplyusa.com/fisher-paykel-simplus-mask.aspx';
    // parseProduct(url);

})
app.listen('8081')
exports = module.exports = app;