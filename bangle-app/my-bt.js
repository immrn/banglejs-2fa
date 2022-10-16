exports.doSomething=function (str) {
    ret = '';
    for (var i = str.length-1; i >= 0; i--) {
        ret = ret + str[i];
    }
    return ret;
}