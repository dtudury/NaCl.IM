var http = require('http');
var lib = require('./lib');
var bignum = require('bignum');


var rsa = new lib.RSA();
rsa.generate(512);
console.log(rsa.n);




function post_key(callback) {
    var quote = "Those who would give up essential Liberty, to purchase a little temporary Safety, deserve neither Liberty nor Safety.";
    var message = lib.str_to_num(quote);
    var proof = rsa.decrypt(message).toBuffer();
    var proof_len = new Buffer(2);
    proof_len.writeUInt16BE(proof.length, 0);
    var key = rsa.n.toBuffer();
    var key_len = new Buffer(2);
    key_len.writeUInt16BE(key.length, 0);
    var initial_post = Buffer.concat([key_len, key, proof_len, proof]);

    var req = http.request({
        hostname: "0.0.0.0",
        port: 8000,
        path: "/",
        method: "POST"
    }, function (res) {
        lib.collect_and_call(res, callback, res);
    });
    req.write(initial_post);
    req.end();
}

function get_key(short_key, callback) {
    http.get({
        hostname: "0.0.0.0",
        port: 8000,
        path: "/" + short_key
    }, function (res) {
        lib.collect_and_call(res, callback, res);
    });
}

function connect(callback) {
}


post_key(function (err, buffer) {
    if (err) throw err;
    var obj = JSON.parse(buffer.toString());
    get_key(obj.short_key, function (err, buffer) {
        if (err) throw err;
        var key = bignum.fromBuffer(buffer);
        console.log(key);

        connect(function (connection) {
        });

        /*
        post_key(function (err, buffer, res) {
            if (Math.floor(res.statusCode / 100) !== 2) throw new Error(buffer.toString());
            if (err) throw err;
            console.log(err, buffer.toString());
        });
        */
    });
});
