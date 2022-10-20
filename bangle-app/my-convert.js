const b32Set = ['A','B','C','D','E','F','G','H','I','J','K','L','M','N','O','P','Q','R','S','T','U','V','W','X','Y','Z','2','3','4','5','6','7'];

function b32ToBytes(b32text) {
    function index(c, array) {
        for (var i = 0; i < array.length; i++)
            if (c == array[i])
                return i;
    }

    b32bytes = [];
    for (var i = 0; i < b32text.length; i++) {
        b32bytes.push(index(b32text[i], b32Set));
    }
    return b32bytes;
}

// console.log("next:", b32ToBytes("ACB7"));

// -------------------------------------- //
// -------- UTF8 HEX Convertion --------- //
// -------------------------------------- //

function intToHexStr(int) {
    var hex = int.toString(16);
    return (hex.length % 2) == 0 ? hex : "0" + hex;
}

function intArrayToHexStr(intArray) {
    hexStr = "";
    for (var i = 0; i < intArray.length; i++) {
        temphexStr = intToHexStr(intArray[i]);
        hexStr += temphexStr;
    }
    return hexStr;
}

exports.UTF8toIntArray = function (str){
    var intArray = [];
    for (var i = 0; i < str.length; i++) {
        intArray[i] = str.charCodeAt(i);
    }
    return intArray;
}

exports.intArrayToUTF8 = function (intArray){
    var utf8 = "";
    for (var i = 0; i < intArray.length; i++){
        utf8 += String.fromCharCode(intArray[i]);
    }
    return utf8;
}

// const utf8 = "Hallo 1*-!";
// const intArray = UTF8toIntArray(utf8);
// const hexStr = intArrayToHexStr(intArray);
// const backToUTF8 = intArrayToUTF8(intArray);

// console.log("UTF:", utf8);
// console.log("Num:", intArray);
// console.log("HexStr:", hexStr);
// console.log("back to utf8:", backToUTF8);