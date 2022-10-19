// -------------------------------------- //
// ------------ Conversion -------------- //
// -------------------------------------- //

function hexStrToBytes(hexStr) {
    var hexBytes = []
    for (i = 0; i < hexStr.length; i += 2) {
        hexBytes.push(parseInt(hexStr.substr(i, 2), 16));
    }
    return hexBytes;
}

function bytesToHexStr(bytes) {
    var hexStr = '';
    for (var i = 0; i < bytes.length; i++) {
        hexStr = hexStr + intToHexStr(bytes[i]);
    }
    return hexStr;
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


// -------------------------------------- //
// ------------- Base32 ----------------- //
// -------------------------------------- //

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


// -------------------------------------- //
// ------------- jsSJA LIB -------------- //
// -------------------------------------- //

JSSHAsha1 = require("sha1.js"); // https://github.com/Caligatio/jsSHA

function JSSHAhmac(JSSHAkey, keyT, JSSHAcounter, counterT) {
    var myhmac = new JSSHAsha1("SHA-1", counterT, {hmacKey: {value: JSSHAkey, format: keyT },});
    myhmac.update(JSSHAcounter);
    return myhmac.getHash("HEX");
}


// -------------------------------------- //
// ------------- TOTP stuff ------------- //
// -------------------------------------- //

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

function truncat_withBytes(hmacBytes, returnDigits){
    const offset =  hmacBytes[19] & 0xf;
    const binCode = ((hmacBytes[offset]  & 0x7f) << 24)
    | ((hmacBytes[offset+1] & 0xff) << 16)
    | ((hmacBytes[offset+2] & 0xff) <<  8)
    | ((hmacBytes[offset+3] & 0xff));
    let otp = (binCode % Math.pow(10, returnDigits)).toString();
    console.log("OTP:", otp);
    while (otp.length < returnDigits) {
    otp = '0' + otp;
    }
    return otp;
}

function genHOTP(key, keyT, counter, counterT, returnDigits){
    var hmac = JSSHAhmac(key, keyT, counter, counterT);
    console.log("HMAC: ", hmac);
    var hmacBytes = hexStrToBytes(hmac);
    var hotp = truncat_withBytes(hmacBytes, returnDigits);
    return hotp;
}

exports.generate = function genTOTP(key, keyT, counter, returnDigits){
    console.log("Time counter =", counter);
    counter = intToHexStr(counter);
    // We need to pad the hex value of counter, otherwise we get a wrong hmac:
    while (counter.length < 2*8) {
        counter = "0" + counter;
    }
    counter = hexStrToBytes(counter);
    var totp = genHOTP(key, keyT, counter, "UINT8ARRAY", returnDigits);
    return totp;
}

// TODO: my TOTP isn't matching TOTPs of other generators (like Authy or https://totp.danhersam.com/), my TOTP-Algorithm is compliant to RFC-6238, so my input processing must be wrong!

// -------------------------------------- //
// ----------- Usage/Examples ----------- //
// -------------------------------------- //

// If the keyT="TEXT", the key must be UTF-8 encoded!
// If the keyT="HEX", the key must be a string of a hex value!

// Example usage:
// mykey = "12345678901234567890";
// mykey = b32ToBytes("JBSWY3DPEHPK3PXP");
// console.log("mykey b32 to bytes:", mykey);
// mykey = bytesToHexStr(mykey);
// console.log("mykey hexStr:", mykey);
// mykey = "3132333435363738393031323334353637383930"
// setTimeout(genTOTP, 3000, key=mykey, keyT="UINT8ARRAY", counter=0,  returnDigits=6);
// setTimeout(genTOTP, 30000, key=mykey, keyT="TEXT", counter=0,  returnDigits=6);
// setTimeout(genTOTP, 3000, key=mykey, keyT="HEX", counter=1,  returnDigits=6);
// setInterval(genTOTP, 30000, key=mykey, keyT="HEX", counter=0,  returnDigits=6);


// TODO rm following

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