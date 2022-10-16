// --------------- Layout ---------------
let Layout = require("Layout");

const size0 = "10%";
const size05 = "11%";
const size1 = "13%";
const size2 = "14%";
const size3 = "23%";
const col1 = "#4A4A4A"; // grey
const col2 = "#590396"; // violette
const col3 = "#50FF9F"; // green, background color

// TOTP must be updated each 30 seconds -> store the ID of setInterval() for clearInterval(ID):
var intervalId = undefined;

var accList = []; // list of TOTP accounts

// Class for TOTP-Accounts, stores label and secret to generate a TOTP:
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

// TODO: dont hard code accounts, store them in a file (like .json):
let Acc1 = new TOTPacc("github", "3132333435363738393031323334353637383930");
let Acc2 = new TOTPacc("stackoverflow", "35810503158083");
console.log("acc list:", accList.length);
for (var i = 0; i < accList.length; i++) {
  console.log(accList[i].label, accList[i].secret)
}

// Menu for totp-account overview:
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
  dict["+add account+"] = () => {drawAddAccScreen1();}
  console.log(dict);
  return dict;
}

// The screen displaying the TOTP:
function getTOTPlayout(label, totp){
  // TODO add a delete button plus callback, to delete an acc (use accList.splice() to delete elements dynamically):
  var layout = new Layout(
    {type:"h", c:[
      {type:"v", fillx:1, valign:-1, c: [
        {type:"txt", font:size2, label: label, col:col2},
        {type:"txt", font:size3, label: totp, col:col2, pad:10, id:"totp"},
        {type:"btn", font:"6x8:2", label:"Exit", cb: l=>exitTOTPscreen()},
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

// draw the TOTP screen and update the TOTP each 30 seconds:
function drawAndUpdateTOTP(totpacc) {
  // Just draw the layout:
  var counter = Math.floor((Date.now() / 1000) / 30);
  var layout = getTOTPlayout(totpacc.label, totpacc.getTOTP(counter));
  drawLayout(layout);
  // Pre-calculate the next counter and layout:
  var nextcounter = Math.floor((Date.now() / 1000) / 30);
  if (nextcounter = counter) nextcounter++;
  // TODO draw the TOTP screen again when the clock hits 0 or 30 seconds and start the Interval:
  // Start interval (interval = 30 sec):
  intervalId = setInterval( function () {
    layout = getTOTPlayout(totpacc.label, totpacc.getTOTP(nextcounter));
    drawLayout(layout);
    nextcounter++;
  }, 3000)
}

// Exit TOTP screen and go back to the menu:
function exitTOTPscreen() {
  clearInterval(intervalId);
  intervalId = undefined;
  E.showMenu(menu());
}

// Screen to create a new account: when BT connection isn't established already
function drawAddAccScreen1() {
  var layout = new Layout(
    {type:"v", filly:1, c: [
      {type:"txt", width:0, height:0, font:size1, label: "New Account", col:col2, pad:0},
      {type:"txt", halign:-1, width:0, height:0, font:"4%", label: ' ', col:col2, pad:1},
      {type:"txt", halign:-1, width:0, height:0, font:size0, label: "- follow the exten-", col:col2, pad:1},
      {type:"txt", halign:-1, width:0, height:0, font:size0, label: "  sion's instruction", col:col2, pad:1},
      {type:"txt", halign:-1, width:0, height:0, font:"4%", label: ' ', col:col2, pad:1},
      {type:"txt", halign:-1, width:0, height:0, font:size0, label: '- select "Bangle.js', col:col2, pad:1},
      {type:"txt", halign:-1, width:0, height:0, font:size0, label: '  e79b"', col:col2, pad:1},
      // {type:"txt", halign:-1, font:size1, label: "Label:", col:col2, pad:3},
      // {type:"txt", halign:-1, font:size1, label: "Secret:", col:col2, pad:3},
      {type:"btn", font:"6x8:2", label:"Cancel", cb: l=>exitAddAccScreen()},
    ]}
  );
  drawLayout(layout);
}
// Screen to create a new account: waiting for browser extension to send data
function drawAddAccScreen2() {
  var layout = new Layout(
    {type:"v", filly:1, c: [
      {type:"txt", width:0, height:0, font:size1, label: "New Account", col:col2, pad:0},
      {type:"txt", halign:-1, width:0, height:0, font:"4%", label: ' ', col:col2, pad:1},
      {type:"txt", width:0, height:0, font:size0, label: "Connection", col:col2, pad:1},
      {type:"txt", width:0, height:0, font:size0, label: "established!", col:col2, pad:1},
      {type:"txt", halign:-1, width:0, height:0, font:"4%", label: ' ', col:col2, pad:1},
      {type:"txt", width:0, height:0, font:size0, label: "Receiving data ...", col:col2, pad:1},
      {type:"txt", width:0, height:0, font:size0, label: " ", col:col2, pad:1},
      {type:"btn", font:"6x8:2", label:"Cancel", cb: l=>exitAddAccScreen()}
    ]}
  );
  drawLayout(layout);
}


// Screen to create a new account: let user check received data
function drawAddAccScreen3() {
  var layout = new Layout(
    {type:"v", filly:1, c: [
      {type:"txt", width:0, height:0, font:size1, label: "New Account", col:col2, pad:0},
      {type:"txt", halign:-1, width:0, height:0, font:size0, label: 'Label:', col:col2, pad:1},
      {type:"txt", halign:-1, width:0, height:0, font:size0, label: '  TODO label string', col:col2, pad:1},
      {type:"txt", halign:-1, width:0, height:0, font:size0, label: 'Secret:', col:col2, pad:1},
      {type:"txt", halign:-1, width:0, height:0, font:size0, label: '  TODO secret string', col:col2, pad:1},
      {type:"h", c: [
        // {type:"btn", font:"6x8:2", label:"Cancel", cb: l=>exitAddAccScreen()},
        {type:"btn", font:"6x8:2", label:"Apply", cb: l=>exitAddAccScreen()}
      ]}
    ]}
  );
  drawLayout(layout);
}

function exitAddAccScreen() {
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
