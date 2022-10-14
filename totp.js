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

// Bangle.on('init', getHash("ABCD","ABCD"));
// Bangle.on('swipe',function(){getHash("ABCD","ABCD");});
// var MYHMAC = ""; 
// setTimeout(MYHMAC = getHash, 3000, "ABCD", "ABCD");
// setTimeout("{console.log('hallo');}", 3000);
// console.log("hallo 2222");
// console.log(MYHMAC);

// Convert a hex string to a byte array
// https://stackoverflow.com/questions/14603205/how-to-convert-hex-string-into-a-bytes-array-and-a-bytes-array-in-the-hex-strin
function hexToBytes(hex) {
    for (var bytes = [], c = 0; c < hex.length; c += 2)
        bytes.push(parseInt(hex.substr(c, 2), 16));
    return bytes;
}

function hexStrToHexStrArray(hexStr) {
    console.log("hexStr.length =", hexStr.length);
    for (var hexStrArray = [], c = 0; c < hexStr.length; c+=2)
        hexStrArray.push(hexStr.substr(c,2));
    return hexStrArray;
}

function hexStrToHexStrArray_singleStep(hexStr) {
    console.log("hexStr.length =", hexStr.length);
    for (var hexStrArray = [], c = 0; c < hexStr.length; c+=1)
        hexStrArray.push(hexStr.substr(c,1));
    return hexStrArray;
}

function hex2a(hex) {
    var str = '';
    for (var i = 0; i < hex.length; i += 2) {
        var v = parseInt(hex.substr(i, 2), 16);
        if (v) str += String.fromCharCode(v);
    }
    return str;
}  

function truncat(hmac_bytes, returnDigits){
    const offset =  hmac_bytes[19].charCodeAt() & 0xf;
    console.log("\toffset:", offset);
    const bin_code = ((hmac_bytes[offset].charCodeAt()  & 0x7f) << 24)
       | ((hmac_bytes[offset+1].charCodeAt() & 0xff) << 16)
       | ((hmac_bytes[offset+2].charCodeAt() & 0xff) <<  8)
       | ((hmac_bytes[offset+3].charCodeAt() & 0xff));
    let otp = (bin_code % Math.pow(10, returnDigits)).toString();
    while (otp.length < returnDigits) {
      otp = '0' + otp;
    }
    return otp;
}

function genHOTP(key, counter, returnDigits){
    var hmac = new Hashes.SHA1().hex_hmac(key, counter);
    console.log("HMAC: ", hmac);
    // var hmac_bytes = hexToBytes(hmac);
    var hmac_bytes = hexStrToHexStrArray(hmac);
    console.log("HMAC Bytes: ", hmac_bytes);
    var hotp = truncat(hmac_bytes, returnDigits);
    return hotp;
}

function genTOTP(key, returnDigits, timeStep, t0){
    // TODO it's false
    var counter = Math.floor((Date.now() / 1000 - t0) / timeStep);
    counter = String(counter);
    console.log("Time counter =", counter);
    var totp = genHOTP(key, counter, returnDigits);
    console.log("TOTP: ", totp);
    return totp;
}

mykey = "12345678901234567890";
mykey = "JBSWY3DPEHPK3PXP";
setTimeout(genTOTP, 3000, mykey, 6, 30, 0);
setInterval(genTOTP, 30000, mykey, 6, 30, 0);
// setTimeout(genHOTP, 3000, mykey, counter, 6);
