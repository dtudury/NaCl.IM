var lib = require('../lib');
var util = require('util');

var connections_by_key = {};

function CONNECT_POST (req, res, head) {
    if(!(this instanceof CONNECT_POST)) return new CONNECT_POST(req, res);
    CONNECT_POST.super_.call(this, req, res);
    if(req.method === "GET") {
        this.on_connect();
    } else if (req.method === "POST") {
        this.on_post();
    } else {
        console.log("err");
        this.key = this.req.url.match(/[^\/]*$/)[0];
        this.respond_err(new Error("unhandled verb"));
    }
}

util.inherits(CONNECT_POST, require('./verb'));

CONNECT_POST.prototype.on_connect = function () {
    console.log("on_connect");
    connections_by_key[this.key] = connections_by_key[this.key] || [];
    connections_by_key[this.key].push(this);
};

CONNECT_POST.prototype.on_post = function () {
    var self = this;
    var connections = connections_by_key[this.key] || [];
    if (!connections.length) return this.respond_err(new Error("no matching connection"));
    connections.forEach(function (connection) {
        self.req.pipe(connections[0].res);
    });
    self.req.on('end', function () {
        connections.forEach(function (connection) {
        });
        self.res.writeHead(200);
        self.res.end();
    });
};

module.exports = CONNECT_POST;
