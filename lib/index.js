var bignum = require('bignum');
var AWS = require('aws-sdk');
var path = require('path');
AWS.config.loadFromPath(path.join(__dirname, '../config.json'));

exports.s3bucket = new AWS.S3({params: {Bucket: 'nacl.im'}});

exports.respond_err = function (res, err, code) {
    res.writeHead(code || 500, {"Content-Type": "text/plain"});
    res.end(err.message);
};

exports.respond_json = function (res, obj, code) {
    res.writeHead(code || 200, {'Content-Type': 'application/json'});
    res.end(JSON.stringify(obj));
};

exports.collect_and_call = function (socket, callback) {
    var args = [].slice.call(arguments, 2);
    var buffers = [];
    socket.on('data', function (data) {
        buffers.push(data);
    });
    socket.on('end', function () {
        callback.apply(null, [null, Buffer.concat(buffers)].concat(args));
    });
    socket.on('error', function () {
        callback(new Error("socket error"));
    });
};

exports.RSA = function() {
    var self = this;
    this.generate = function (bits) {
        bits = bits || 1024;
        //should make sure these are strong and aren't too close... (but probably won't)
        if (!self.p) self.p = bignum.prime(bits);
        if (!self.q) self.q = bignum.prime(bits);
        self.n = bignum.mul(self.p, self.q);
        self.t = bignum.mul(self.p.sub(1), self.q.sub(1));
        self.e = bignum(0x10001);
        self.d = self.e.invertm(self.t);
        self.d_p = self.d.mod(self.p.sub(1));
        self.d_q = self.d.mod(self.q.sub(1));
        self.q_inv = self.q.invertm(self.p);
    };
    this.encrypt = function (plain) {
        return bignum.powm(plain, self.e, self.n);
    };
    this.decrypt = function (cipher) {
        var m1 = bignum.powm(cipher, self.d_p, self.p);
        var m2 = bignum.powm(cipher, self.d_q, self.q);
        var h = self.q_inv.mul(m1.sub(m2)).mod(self.p).add(self.p).mod(self.p);
        return m2.add(h.mul(self.q));
    };
};

exports.str_to_num = function (str) {
    return bignum.fromBuffer(new Buffer(str));
};

exports.num_to_str = function (num) {
    return num.toBuffer().toString();
};

