var http = require('http');
var lib = require('./lib');
var bignum = require('bignum');


var rsa = new lib.RSA();
rsa.generate(512);
console.log(rsa.n);

var short_key;




function put_key(callback) {
    var quote = "Those who would give up essential Liberty, to purchase a little temporary Safety, deserve neither Liberty nor Safety.";
    var message = lib.str_to_num(quote);
    var proof = rsa.decrypt(message).toBuffer();
    var proof_len = new Buffer(2);
    proof_len.writeUInt16BE(proof.length, 0);
    var key = rsa.n.toBuffer();
    var key_len = new Buffer(2);
    key_len.writeUInt16BE(key.length, 0);
    var initial_put = Buffer.concat([key_len, key, proof_len, proof]);

    var req = http.request({
        hostname: "nacl.im",
        port: 80,
        path: "/key/",
        method: "PUT"
    }, function (res) {
        lib.collect_and_call(res, callback, res);
    });
    req.write(initial_put);
    req.end();
}

function get_key(callback) {
    http.get({
        hostname: "nacl.im",
        port: 80,
        path: "/key/" + short_key
    }, function (res) {
        lib.collect_and_call(res, callback, res);
    });
}






function get_data(callback) {
    console.log("about to get_data");
    var req = http.get({
        hostname: "nacl.im",
        port: 80,
        path:"/data/" + short_key
    }, function (res) {
        lib.collect_and_call(res, function (err, data) {
            console.log(data.toString());
        }, res);
    });
    req.on("socket", function (sock) {
        console.log("socket");
        sock.on("connect", function () {
            console.log("socket connected");
            callback();
        });
        sock.on("data", function (chunk) {
            console.log("data", chunk);
        });
    });
    req.on("connect", function (res, sock, head) {
        console.log("connect", head);
        res.on("data", function (chunk) {
            console.log("data", chunk);
        });
    });
    req.on("data", function (chunk) {
        console.log("data", data);
    });
    req.end();
}







function put_message(callback) {
    console.log("about to put");
    var req = http.request({
        hostname: "nacl.im",
        port: 80,
        path: "/data/" + short_key,
        method: "POST"
    }, function (res) {
        lib.collect_and_call(res, callback, res);
    });
    req.write("hello there");
    req.end();
}


put_key(function (err, buffer) {
    if (err) throw err;
    var obj = JSON.parse(buffer.toString());
    short_key = obj.short_key;
    get_key(function (err, buffer) {
        if (err) throw err;
        var key = bignum.fromBuffer(buffer);
        console.log(key);

        get_data(function () {
        });
        setTimeout(function () {
            put_message(function () {
                console.log("done-ish");
            });
        }, 1000);

        /*
        put_key(function (err, buffer, res) {
            if (Math.floor(res.statusCode / 100) !== 2) throw new Error(buffer.toString());
            if (err) throw err;
            console.log(err, buffer.toString());
        });
        */
    });
});
