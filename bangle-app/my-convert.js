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