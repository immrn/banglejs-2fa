// from https://github.com/kazuho/sha1.min.js

// sha1 = require("sha1.min.js").sha1;
// console.log(sha1("hallo"));


// from https://github.com/Caligatio/jsSHA

// sha1_jssha = require("sha1.js");
// const shaObj = new sha1_jssha("SHA-1", "TEXT", { encoding: "UTF8" });
// shaObj.update("hallo");
// const myhash = shaObj.getHash("HEX")
// console.log(myhash);


// from https://github.com/h2non/jshashes
var Hashes = require("hashes.min.js");
var SHA1 = new Hashes.SHA1().hex("hallo");
console.log(SHA1);

function getHash(k,d){
    var HMAC = new Hashes.SHA1().hex_hmac(k,d);
    console.log(HMAC);
}

// Bangle.on('init', getHash("ABCD","ABCD"));
// Bangle.on('swipe',function(){getHash("ABCD","ABCD");});
setTimeout(getHash, 3000, "ABCD", "ABCD");
