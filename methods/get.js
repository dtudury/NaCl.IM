var lib = require('../lib');

function GET (key, callback) {
    if (!(this instanceof GET)) return new GET(key, callback);
    this.key = key;
    this.callback = callback;
    this.get_key();
}

GET.prototype.get_key = function () {
    var data = {
        Bucket: "nacl.im/" + this.key,
        Key: "public_key"
    };
    lib.s3.getObject(data, this.on_get_key.bind(this));
};

GET.prototype.on_get_key = function (err, data) {
    if (err) return this.callback(new Error("Error retrieving data: ", err.message));
    console.log(data.Body);
    console.log(new Buffer(data.Body));
    console.log(data.Body.length);
    this.callback(null, data.Body);
};

module.exports = GET;
