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