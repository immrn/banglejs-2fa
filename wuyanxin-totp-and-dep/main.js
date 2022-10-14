const TOTP = require('totp.min.js').TOTP;

const key = TOTP.randomKey();
console.log("Random:", key);