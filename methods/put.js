var bignum = require('bignum');
var lib = require('../lib');

var quote = "Those who would give up essential Liberty, to purchase a little temporary Safety, deserve neither Liberty nor Safety.";

function PUT (error, buffer, callback) {
    if (error) return callback(error);
    if (!(this instanceof PUT)) return new PUT(null, buffer, callback);
    this.buffer = buffer;
    this.callback = callback;
    this.parse_buffer();
}

PUT.prototype.parse_buffer = function () {
    var offset = 0;
    var key_len = this.buffer.readUInt16BE(offset);
    offset += 2;
    this.key_buf = this.buffer.slice(offset, offset += key_len);
    this.key = bignum.fromBuffer(this.key_buf);
    this.short_key = this.key_buf.slice(this.key_buf.length - 6).toString('base64').replace(/\+/g, '-').replace(/\//g, '_');
    var proof_len = this.buffer.readUInt16BE(offset);
    offset += 2;
    this.proof = bignum.fromBuffer(this.buffer.slice(offset, offset += proof_len));
    this.test_proof();
};

PUT.prototype.test_proof = function () {
    var e = bignum(0x10001);
    var plain_text = bignum.powm(this.proof, e, this.key).toBuffer().toString();
    if (quote !== plain_text) return this.callback(new Error("proof not accepted"));
    this.test_collision();
};

PUT.prototype.test_collision = function () {
    var data = {Key: this.short_key};
    lib.s3bucket.headObject(data, this.on_test_collision.bind(this));
};

PUT.prototype.on_test_collision = function (err, data) {
    if (data) return this.callback(new Error("short_key already in database"));
    this.save_key();
};

PUT.prototype.save_key = function () {
    var data = {Key: this.short_key, Body: this.key_buf};
    lib.s3bucket.putObject(data, this.on_save_key.bind(this));
};

PUT.prototype.on_save_key = function (err, data) {
    if (err) return this.callback(new Error("Error uploading data: ", err.message));
    this.callback(null, {short_key:this.short_key});
};

module.exports = PUT;
