var bignum = require('bignum');



var p_size = 1024;
//should make sure these are strong and aren't too close... (but probably won't)
var p = bignum.prime(p_size);
console.log('p', p);
var q = bignum.prime(p_size);
console.log('q', q);
var n = bignum.mul(p, q);
console.log('n', n);
var t = bignum.mul(p.sub(1), q.sub(1));
console.log('t', t);
var e = bignum(0x10001);
console.log('e', e);
var d = e.invertm(t);
console.log('d', d);
var d_p = d.mod(p.sub(1));
console.log('d_p', d_p);
var d_q = d.mod(q.sub(1));
console.log('d_q', d_q);
var q_inv = q.invertm(p);
console.log('q_inv', q_inv);


var message = bignum.fromBuffer(new Buffer("I can haz world?"));
console.time("encryption");
var c = bignum.powm(message, e, n);
console.timeEnd("encryption");
console.log(c);

console.time("simple decryption");
var m = bignum.powm(c, d, n);
console.timeEnd("simple decryption");
console.log(m.toBuffer().toString());


console.time("efficient decryption");
var m1 = bignum.powm(c, d_p, p);
var m2 = bignum.powm(c, d_q, q);
var h = q_inv.mul(m1.sub(m2)).mod(p);
var m = m2.add(h.mul(q));
console.timeEnd("efficient decryption");
console.log(m.toBuffer().toString());

