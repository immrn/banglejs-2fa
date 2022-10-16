function hexStrToBytes(hexStr) {
    var hexBytes = []
    for (i = 0; i < hexStr.length; i += 2) {
        hexBytes.push(parseInt(hexStr.substr(i, 2), 16));
    }
    return hexBytes;
}

function hexStrToHexStrArray(hexStr) {
    for (var hexStrArray = [], c = 0; c < hexStr.length; c+=2) {
        hexStrArray.push(hexStr.substr(c,2));
    }
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

function intToHexStr(int) {
    var hex = int.toString(16);
    return (hex.length % 2) == 0 ? hex : "0" + hex;
}

// -----------------------------------------------

b32Set = ['A','B','C','D','E','F','G','H','I','J','K','L','M','N','O','P','Q','R','S','T','U','V','W','X','Y','Z','2','3','4','5','6','7'];

function b32ToBytes(b32text) {
    function index(c, array) {
        for (var i = 0; i < array.length; i++) {
            if (c == array[i]) {
                return i;
            }
        }
    }

    b32bytes = [];
    for (var i = 0; i < b32text.length; i++) {
        b32bytes.push(index(b32text[i], b32Set));
    }
    return b32bytes;
}

// -----------------------------------------------
// var BASE32 = require('base32.min.js');
// var encoded = BASE32.encode("some data blabla");
// var decoded = BASE32.decode(encoded);
// console.log("encoded:", encoded);
// console.log("decoded:", decoded);

// -----------------------------------------------

// from https://github.com/kazuho/sha1.min.js

// sha1 = require("sha1.min.js").sha1;
// console.log(sha1("hallo"));

// ------------------------------------------------

// from https://github.com/h2non/jshashes
// var Hashes = require("hashes.min.js");
// var hmac = new Hashes.SHA1().hex_hmac(key, counter);

// --------------------------------------------------

// from https://github.com/Caligatio/jsSHA
JSSHAsha1 = require("sha1.js");
// var shaObj = new JSSHAsha1("SHA-1", "TEXT", { encoding: "UTF8" });
// shaObj.update("hallo");
// var myhash = shaObj.getHash("HEX")
// console.log(myhash, "\nof type", typeof(myhash));


// const testKey = "3132333435363738393031323334353637383930";
// console.log("testKey: ", testKey);
// console.log("testKey length:", testKey.length);

// const testCounter = "00";
// console.log("testCounter:" ,testCounter);

// function doJSSHAmac() {
//     var myhmac = new JSSHAsha1("SHA-1", "UINT8ARRAY", {hmacKey: {value: hexStrToBytes(testKey), format: "UINT8ARRAY" },});
//     myhmac.update(hexStrToBytes(testCounter));
//     var finalhmac = myhmac.getHash("HEX");
//     console.log("hmac:", finalhmac);
// }

// setTimeout(doJSSHAmac, 2000);

function JSSHAhmac(JSSHAkey, JSSHAcounter, keyT, counterT) {
    var myhmac = new JSSHAsha1("SHA-1", counterT, {hmacKey: {value: JSSHAkey, format: keyT },});
    myhmac.update(JSSHAcounter);
    return myhmac.getHash("HEX");
}

// ----------------------------------------------------

// function truncat(hmac_bytes, returnDigits){
//     const offset =  hmac_bytes[19].charCodeAt() & 0xf;
//     console.log("\toffset:", offset);
//     console.log("test:", hmac_bytes[19], " = ", parseInt(hmac_bytes[19], 16));
//     const bin_code = ((hmac_bytes[offset].charCodeAt()  & 0x7f) << 24)
//        | ((hmac_bytes[offset+1].charCodeAt() & 0xff) << 16)
//        | ((hmac_bytes[offset+2].charCodeAt() & 0xff) <<  8)
//        | ((hmac_bytes[offset+3].charCodeAt() & 0xff));
//     let otp = (bin_code % Math.pow(10, returnDigits)).toString();
//     while (otp.length < returnDigits) {
//       otp = '0' + otp;
//     }
//     return otp;
// }

function truncat_withBytes(hmac_bytes, returnDigits){
    const offset =  hmac_bytes[19] & 0xf;
    const bin_code = ((hmac_bytes[offset]  & 0x7f) << 24)
       | ((hmac_bytes[offset+1] & 0xff) << 16)
       | ((hmac_bytes[offset+2] & 0xff) <<  8)
       | ((hmac_bytes[offset+3] & 0xff));
    let otp = (bin_code % Math.pow(10, returnDigits)).toString();
    console.log("OTP:", otp);
    while (otp.length < returnDigits) {
      otp = '0' + otp;
    }
    return otp;
}

function genHOTP(key, counter, returnDigits, keyT, counterT){
    var hmac = JSSHAhmac(key, counter, keyT, counterT);
    console.log("HMAC: ", hmac);
    var hmacBytes = hexStrToBytes(hmac);
    var hotp = truncat_withBytes(hmacBytes, returnDigits);
    return hotp;
}

function genTOTP(key, returnDigits, timeStep, t0, keyT, counterT){
    var counter = Math.floor((Date.now() / 1000 - t0) / timeStep);
    counter = 0;
    console.log("Time counter =", counter);
    counter = intToHexStr(counter);
    // We need to pad the hex value of counter, otherwise we get a wrong hmac:
    while (counter.length < 2*8) {
        counter = "0" + counter;
    }
    counter = hexStrToBytes(counter);
    var totp = genHOTP(key, counter, returnDigits, keyT, counterT="UINT8ARRAY");
    console.log("----------------");
    return totp;
}

function bytesToHexStr(bytes) {
    var hexStr = '';
    for (var i = 0; i < bytes.length; i++) {
        hexStr = hexStr + intToHexStr(bytes[i]);
    }
    return hexStr;
}

// TODO: my TOTP isn't matching TOTPs of other generators (like Authy or https://totp.danhersam.com/), my TOTP-Algorithm is compliant to RFC-6238, so my input processing must be wrong!
mykey = "12345678901234567890";
mykey = b32ToBytes("JBSWY3DPEHPK3PXP");
console.log("mykey b32 to bytes:", mykey);
mykey = bytesToHexStr(mykey);
console.log("mykey hexStr:", mykey);
mykey = "3132333435363738393031323334353637383930"
// setTimeout(genTOTP, 3000, mykey, 6, timeStep=30, t0=0, keyT="UINT8ARRAY");
// setInterval(genTOTP, 30000, mykey, 6, timeStep=30, t0=0, keyT="UINT8ARRAY");
setTimeout(genTOTP, 3000, mykey, 6, timeStep=30, t0=0, keyT="HEX");
setInterval(genTOTP, 30000, mykey, 6, timeStep=30, t0=0, keyT="HEX");