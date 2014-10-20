var lib = require('../lib');

function GET (key, callback) {
    if (!(this instanceof GET)) return new GET(key, callback);
    this.key = key;
    this.callback = callback;
    this.get_key();
}

GET.prototype.get_key = function () {
    var data = {Key: this.key};
    lib.s3bucket.getObject(data, this.on_get_key.bind(this));
};

GET.prototype.on_get_key = function (err, data) {
    if (err) return this.callback(new Error("Error retrieving data: ", err.message));
    this.callback(null, data);
};

module.exports = GET;
