var http = require('http');
var timers = require('timers');

if (process.send) timers.setInterval(function () {process.send("beat");}, 1000);

http.createServer(function (req, res) {
    console.log(req.method, req.headers.host, req.url);
    console.log(req.headers);
    res.writeHead(200, {'Content-Type': 'text/plain'});
    res.end('nacl.im\n');
}).listen(8000, '0.0.0.0');
console.log('nacl.im running at http://0.0.0.0:8000/');
