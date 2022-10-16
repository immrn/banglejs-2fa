b32Set = ['A','B','C','D','E','F','G','H','I','J','K','L','M','N','O','P','Q','R','S','T','U','V','W','X','Y','Z','2','3','4','5','6','7'];

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

console.log("next:", b32ToBytes("ACB7"));