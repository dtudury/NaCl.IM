var lib = require('../lib');
var util = require('util');

function GET (req, res) {
    if(!(this instanceof GET)) return new GET(req, res);
    GET.super_.call(this, req, res);
    this.key = this.req.url.match(/[^\/]*$/)[0];
    this.get_key();
}

util.inherits(GET, require('./verb'));

GET.prototype.get_key = function () {
    var data = {
        Bucket: "nacl.im/" + this.key,
        Key: "public_key"
    };
    lib.s3.getObject(data, this.on_get_key.bind(this));
};

GET.prototype.on_get_key = function (err, data) {
    if (err) this.respond_err(new Error("Error retrieving data: ", err.message));
    this.respond_octet_stream(data.Body);
};

module.exports = GET;
