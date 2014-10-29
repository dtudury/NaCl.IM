var http = require('http');
var put = require('./methods/put');
var get = require('./methods/get');
/*
var put = require('./methods/put');
var connect = require('./methods/connect');
*/
var lib = require('./lib');


module.exports = function (req, res) {
    console.log(req.url);
    if (req.method === "PUT" || req.url.match(/^\/put\//i)) {
        return lib.collect_and_call(req, put, function (err, obj) {
            if (err) lib.respond_err(res, err);
            else lib.respond_json(res, obj);
        });
    } else if (req.method === "GET" || req.url.match(/^\/get\//i)) {
        var key = req.url.match(/[^\/]*$/)[0];
        return get(key, function (err, obj) {
            if (err) lib.respond_err(res, err);
            else lib.respond_octet_stream(res, obj);
        });
        /*
    } else if (req.method === "PUT" || req.url.match(/^\/put\//i)) {
        var key = req.url.match(/[^\/]*$/)[0];
        return lib.collect_and_call(req, post, function (err, obj) {
            if (err) lib.respond_err(res, err);
            else lib.respond_json(res, obj);
        });
    } else if (req.method === "CONNECT" || req.url.match(/^\/connect\//i)) {
        var key = req.url.match(/[^\/]*$/)[0];
        return get(key, function (err, obj) {
            if (err) lib.respond_err(res, err);
            else lib.respond_json(res, obj);
        });
        */
    } else if (req.url.match(/^\/(index\.html?)?$/)) {
        res.writeHead(200, {'Content-Type': 'text/plain'});
        res.end('nacl.im\n');
    }
};
