var http = require('http');
var AWS = require('aws-sdk');
var path = require('path');
AWS.config.loadFromPath(path.join(__dirname, './config.json'));

module.exports = function(port, hostname) {
    http.createServer(function (req, res) {
        if (req.url.match(/^\/(index\.html?)?$/)) {
            res.writeHead(200, {'Content-Type': 'text/plain'});
            res.end('nacl.im\n');
        } else {
            res.writeHead(404);
            res.end(http.STATUS_CODES[404]);
        }
    }).listen(port, hostname);
    console.log('nacl.im running at http://%s:%s/', hostname, port);
}


var s3bucket = new AWS.S3({params: {Bucket: 'nacl.im'}});
s3bucket.createBucket(function() {
    var data = {Key: 'myKey', Body: 'Hello!'};
    s3bucket.putObject(data, function(err, data) {
        if (err) {
            console.log("Error uploading data: ", err);
        } else {
            console.log("Successfully uploaded data to myBucket/myKey");
        }
    });
});
