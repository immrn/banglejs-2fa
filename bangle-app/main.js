// --------------- Layout ---------------
const size1 = "13%";
const size2 = "14%";
const size3 = "23%";
const col1 = "#4A4A4A"; // grey
const col2 = "#590396"; // violette
const col3 = "#50FF9F"; // green, background color

var accList = []; // list of TOTP accounts
// Dict for the menu showing the accounts
// function getAccDict() {
//   accDict = {};
//   key = accList[i].label;
//   func = getTOTPlayout(accList[i]);
//   for (var i = 0; i < accList.length; i++) {
//     key in accDict ? accDict[key].push(func);
//   }
// }

let Layout = require("Layout");

// Class storing label and secret to generate a TOTP:
class TOTPacc {
  constructor(label, secret) {
    this.label = label;
    this.secret = secret;
    accList.push(this);
  }

  // counter means the time counter:
  getTOTP(counter) {
    // TODO: delete this stuff and call the genTOTP function from totp.js
    console.log("counter:", counter);
    counter = counter.toString();
    if (counter.length > 6) {
      var diff = counter.length - 6;
      counter = counter.substr(diff,6);
    }
    return counter;
  }
}

// When showing a TOTP we need to update the TOTP on the screen every 30 seconds, thus we need to setInterval() which returns an ID. Use this ID to clear the Interval later, when the TOTP Screen will be closed. 
var intervalId = undefined;

var Acc1 = new TOTPacc("github", "3132333435363738393031323334353637383930");
var Acc2 = new TOTPacc("stackoverflow", "35810503158083");
console.log("acc list:", accList.length);
for (var i = 0; i < accList.length; i++) {
  console.log(accList[i].label, accList[i].secret)
}

// Menu for totp-account overview. Account means just a label, the secret key (user can't see it) and the current TOTP:
var menu = function () { 
  var dict = { "" : {
      "title" : "-- My TOTPs --"
    },
  };

  for (var i = 0; i < accList.length; i++) {
    ( function(){
      console.log("i =", i);
      const acc = accList[i];
      const label = acc.label;
      console.log("label:", label);
      dict[label] = () => { 
        console.log("building totp layout"); 
        drawAndUpdateTOTP(acc);
      };
    })()
  }
  console.log(dict);
  return dict;
}

// The screen displaying the TOTP:
function getTOTPlayout(label, totp){
  var layout = new Layout(
    {type:"h", c:[
      {type:"v", fillx:1, valign:-1, c: [
        {type:"txt", font:size2, label: label, col:col2},
        {type:"txt", font:size3, label: totp, col:col2, pad:10, id:"totp"},
        {type:"btn", font:"6x8:2", label:"Exit", cb: l=>exitTOTPlayout()},
      ]},
    ]}
  );
  return layout;
}

function drawLayout(layout) {
  g.setBgColor(col3);
  g.clear();
  layout.render()
}

function drawAndUpdateTOTP(totpacc) {
  // Just draw the layout:
  var counter = Math.floor((Date.now() / 1000) / 30);
  var layout = getTOTPlayout(totpacc.label, totpacc.getTOTP(counter));
  drawLayout(layout);
  // Pre-calculate the next counter:
  var nextcounter = Math.floor((Date.now() / 1000) / 30);
  if (nextcounter = counter) nextcounter++;
  // Start interval (interval = 30 sec):
  intervalId = setInterval( function () {
    layout = getTOTPlayout(totpacc.label, totpacc.getTOTP(nextcounter));
    drawLayout(layout);
    nextcounter++;
  }, 3000)
}

function exitTOTPlayout() {
  clearInterval(intervalId);
  intervalId = undefined;
  E.showMenu(menu());
}

E.showMenu(menu());

// ------------------------------------------

// // The screen displaying the TOTP:
// var layoutScreenTOTP = new Layout(
//   {type:"h", c:[
//     {type:"v", fillx:1, valign:-1, c: [
//       {type:"h", c:[
//         {type:"txt", font:size1, label:"Login attempt\n to",
//           col:col1, height:60}
//       ]},
//       {type:"txt", font:size2, label:"github.com", col:col2},
//       {type:"txt", font:size3, label:"421337", col:col2, pad:10}
//     ]}
//   ]}
// );

// // The screen displaying additional info about the login attempt:
// var layoutScreenTOTPinfo = new Layout(
//   {type:"h", c:[
//     {type:"v", fillx:1, valign:-1, c: [
//       {type:"h", c:[
//         {type:"txt", font:size1, label:"At",
//           col:col1, height:30}
//         ]},
//       {type:"txt", font:size3, label:"10:09", col:col2, pad:5},
//       {type:"txt", font:"10%", label:"Mozilla Firefox\nSaxony, Germany", col:col2, pad:5}
//     ]}
//   ]}
// );

// // The dots at the bottom edge:
// function drawScreenIndex(screen_num){
//   if (screen_num == 1){
//     g.fillCircle(74,150,6);
//     g.drawCircle(102,150,6);
//     g.drawCircle(102,150,5);
//   }
//   else if (screen_num == 2){
//     g.drawCircle(74,150,6);
//     g.drawCircle(74,150,5);
//     g.fillCircle(102,150,6);
//   }
// }

// // Dictionairy of functions to draw screens:
// const DrawScreen = {
//   TOTP: function() {
//     g.setBgColor(col3);
//     g.clear();
//     layoutScreenTOTP.render();
//     drawScreenIndex(1);},
//   TOTPinfo: function() {
//     g.setBgColor(col3);
//     g.clear();
//     layoutScreenTOTPinfo.render();
//     drawScreenIndex(2);
//   } 
// };

// function onSwipe(dir){
//   if (dir == -1 /*left*/){
//     DrawScreen.TOTPinfo();
//   }
//   else if (dir == 1 /*right*/){
//     DrawScreen.TOTP();
//   }
// }

// // Draw first screen:
// DrawScreen.TOTP();

// Bangle.on('swipe', (direction) => {onSwipe(direction);});


// --------------- BLUETOOTH STUFF ---------------

// var gatt;
// NRF.requestDevice({ filters: [{ name: 'Puck.js abcd' }] }).then(function(device) {
//   console.log("found device");
//   return device.gatt.connect();
// }).then(function(g) {
//   gatt = g;
//   console.log("connected");
//   return gatt.startBonding();
// }).then(function() {
//   console.log("bonded", gatt.getSecurityStatus());
//   gatt.disconnect();
// }).catch(function(e) {
//   console.log("ERROR",e);
// });
