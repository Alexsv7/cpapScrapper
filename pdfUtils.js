var fs = require('fs');
var http = require('http');
var fileExists = require('file-exists');


exports.downloadFile = function (uri) {
    var filepath = uri.replace('/', '');// "images/" + filename;
    if (!fileExists(filepath)) {
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
}