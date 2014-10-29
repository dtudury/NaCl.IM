var bignum = require('bignum');
var lib = require('../lib');
var util = require('util');

var quote = "Those who would give up essential Liberty, to purchase a little temporary Safety, deserve neither Liberty nor Safety.";

function PUT (req, res) {
    if (!(this instanceof PUT)) return new PUT(req, res);
    PUT.super_.call(this, req, res);
    this.collect_data(this.parse_data.bind(this));
}

util.inherits(PUT, require('./verb'));

PUT.prototype.parse_data = function () {
    var offset = 0;
    var key_len = this.data.readUInt16BE(offset);
    offset += 2;
    this.key_buf = this.data.slice(offset, offset += key_len);
    this.key = bignum.fromBuffer(this.key_buf);
    this.short_key = this.key_buf.slice(this.key_buf.length - 6).toString('base64').replace(/\+/g, '-').replace(/\//g, '_');
    this.bucket = "nacl.im/" + this.short_key;
    var proof_len = this.data.readUInt16BE(offset);
    offset += 2;
    this.proof = bignum.fromBuffer(this.data.slice(offset, offset += proof_len));
    this.test_proof();
};

PUT.prototype.test_proof = function () {
    var e = bignum(0x10001);
    var plain_text = bignum.powm(this.proof, e, this.key).toBuffer().toString();
    if (quote !== plain_text) return this.respond_err(new Error("proof not accepted"));
    this.test_collision();
};

PUT.prototype.test_collision = function () {
    var data = {Bucket: this.bucket};
    lib.s3.headBucket(data, this.on_test_collision.bind(this));
};

PUT.prototype.on_test_collision = function (err, data) {
    if (data) return this.respond_err(new Error("short_key already in database"));
    this.save_key();
};

PUT.prototype.save_key = function () {
    var data = {
        Bucket: this.bucket,
        Key: "public_key", 
        Body: this.key_buf
    };
    lib.s3.putObject(data, this.on_save_key.bind(this));
};

PUT.prototype.on_save_key = function (err, data) {
    if (err) return this.respond_err(new Error("Error uploading data: ", err.message));
    this.respond_json({short_key:this.short_key});
};

module.exports = PUT;
