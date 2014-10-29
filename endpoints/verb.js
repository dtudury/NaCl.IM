function VERB(req, res) {
    this.req = req;
    this.res = res;
}

VERB.prototype.respond_err = function (err, code) {
    this.res.writeHead(code || 500, {"Content-Type": "text/plain"});
    this.res.end(err.message);
};

VERB.prototype.respond_json = function (obj, code) {
    this.res.writeHead(code || 200, {'Content-Type': 'application/json'});
    this.res.end(JSON.stringify(obj));
};

VERB.prototype.respond_octet_stream = function (obj, code) {
    this.res.writeHead(code || 200, {'Content-Type': 'application/octet_stream'});
    this.res.end(obj);
};

VERB.prototype.collect_data = function (callback) {
    var self = this;
    var buffers = [];
    this.req.on('data', function (data) {
        buffers.push(data);
    });
    this.req.on('end', function () {
        self.data = Buffer.concat(buffers);
        callback();
    });
    this.req.on('error', function () {
        self.respond_err(new Error("http_socket error"));
    });
};

module.exports = VERB;
