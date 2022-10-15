function hexStrToBytes(hexStr) {
    var hexBytes = []
    for (i = 0; i < hexStr.length; i += 2)
        hexBytes.push(parseInt(hexStr.substr(i, 2), 16));
    return hexBytes;
}

function hexStrToHexStrArray(hexStr) {
    for (var hexStrArray = [], c = 0; c < hexStr.length; c+=2)
        hexStrArray.push(hexStr.substr(c,2));
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

function JSSHAhmac(JSSHAkey, JSSHAcounter) {
    var myhmac = new JSSHAsha1("SHA-1", "HEX", {hmacKey: {value: JSSHAkey, format: "HEX" },});
    myhmac.update(JSSHAcounter);
    return myhmac.getHash("HEX");
}

// ----------------------------------------------------

function truncat(hmac_bytes, returnDigits){
    const offset =  hmac_bytes[19].charCodeAt() & 0xf;
    console.log("\toffset:", offset);
    console.log("test:", hmac_bytes[19], " = ", parseInt(hmac_bytes[19], 16));
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

function truncat_withBytes(hmac_bytes, returnDigits){
    const offset =  hmac_bytes[19] & 0xf;
    console.log("hmac_bytes[19] =", hmac_bytes[19]);
    console.log("\toffset:", offset);
    const bin_code = ((hmac_bytes[offset]  & 0x7f) << 24)
       | ((hmac_bytes[offset+1] & 0xff) << 16)
       | ((hmac_bytes[offset+2] & 0xff) <<  8)
       | ((hmac_bytes[offset+3] & 0xff));
    let otp = (bin_code % Math.pow(10, returnDigits)).toString();
    while (otp.length < returnDigits) {
      otp = '0' + otp;
    }
    return otp;
}

function genHOTP(key, counter, returnDigits){
    var hmac = JSSHAhmac(key, counter);
    console.log("HMAC: ", hmac);
    var hmacBytes = hexStrToBytes(hmac);
    console.log("hmacBytes: ", hmacBytes);
    var hotp = truncat_withBytes(hmacBytes, returnDigits);
    return hotp;
}

function genTOTP(key, returnDigits, timeStep, t0){
    // TODO it's false
    var counter = Math.floor((Date.now() / 1000 - t0) / timeStep);
    counter = String(counter);
    counter = "00";
    console.log("Time counter =", counter);
    var totp = genHOTP(key, counter, returnDigits);
    console.log("TOTP: ", totp);
    return totp;
}

mykey = "12345678901234567890";
mykey = "JBSWY3DPEHPK3PXP";
mykey = "3132333435363738393031323334353637383930"
setTimeout(genTOTP, 3000, mykey, 6, 30, 0);
setInterval(genTOTP, 30000, mykey, 6, 30, 0);
// setTimeout(genHOTP, 3000, mykey, counter, 6);

