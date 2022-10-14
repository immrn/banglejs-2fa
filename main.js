// --------------- Layout ---------------
const size1 = "13%";
const size2 = "14%";
const size3 = "23%";
const col1 = "#4A4A4A"; // grey
const col2 = "#590396"; // violette
const col3 = "#50FF9F"; // green, this is the background color

let Layout = require("Layout");

var layoutScreenTOTP = new Layout(
  {type:"h", c:[
    {type:"v", fillx:1, valign:-1, c: [
      {type:"h", c:[
        {type:"txt", font:size1, label:"Login attempt\n to",
          col:col1, height:60}
      ]},
      {type:"txt", font:size2, label:"github.com", col:col2},
      {type:"txt", font:size3, label:"421337", col:col2, pad:10}
    ]}
  ]}
);

var layoutScreenTOTPinfo = new Layout(
  {type:"h", c:[
    {type:"v", fillx:1, valign:-1, c: [
      {type:"h", c:[
        {type:"txt", font:size1, label:"At",
          col:col1, height:30}
        ]},
      {type:"txt", font:size3, label:"10:09", col:col2, pad:5},
      {type:"txt", font:"10%", label:"Mozilla Firefox\nSaxony, Germany", col:col2, pad:5}
    ]}
  ]}
);

function drawScreenIndex(screen_num){
  if (screen_num == 1){
    g.fillCircle(74,150,6);
    g.drawCircle(102,150,6);
    g.drawCircle(102,150,5);
  }
  else if (screen_num == 2){
    g.drawCircle(74,150,6);
    g.drawCircle(74,150,5);
    g.fillCircle(102,150,6);
  }
}

const DrawScreen = {
  TOTP: function() {
    g.setBgColor(col3);
    g.clear();
    layoutScreenTOTP.render();
    drawScreenIndex(1);},
  TOTPinfo: function() {
    g.setBgColor(col3);
    g.clear();
    layoutScreenTOTPinfo.render();
    drawScreenIndex(2);
  } 
};

function onSwipe(dir){
  if (dir == -1 /*left*/){
    DrawScreen.TOTPinfo();
  }
  else if (dir == 1 /*right*/){
    DrawScreen.TOTP();
  }
}

// Draw first screen:
DrawScreen.TOTP();

Bangle.on('swipe', (direction) => {onSwipe(direction);});


// --------------- 2FA/TOTP ---------------
// require("google-closure-library");
// goog.require("goog.crypt.Sha1");

// let Sha1 = require("https://github.com/google/closure-library/blob/master/closure/goog/crypt/BUILD");
// var sha1 = new goog.crypt.Sha1();
// sha1.update("foobar");
// var hash = sha1.digest();


// --------------- BLUETOOTH STUFF ---------------

var gatt;
NRF.requestDevice({ filters: [{ name: 'Puck.js abcd' }] }).then(function(device) {
  console.log("found device");
  return device.gatt.connect();
}).then(function(g) {
  gatt = g;
  console.log("connected");
  return gatt.startBonding();
}).then(function() {
  console.log("bonded", gatt.getSecurityStatus());
  gatt.disconnect();
}).catch(function(e) {
  console.log("ERROR",e);
});