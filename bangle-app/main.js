// -------------------------------------- //
// -------------- States ---------------- //
// -------------------------------------- //

const STATE_MAIN_MENU = 0;
const STATE_TOTP_SCREEN = 1;
const STATE_NEW_ACC_START = 2;
const STATE_NEW_ACC_RECV = 3;
const STATE_NEW_ACC_CONFIRM = 4;
const STATE_ERROR_AND_RESUME = 5;


// -------------------------------------- //
// -------------- Imports --------------- //
// -------------------------------------- //

let Layout = require("Layout");
const TOTP = require("totp.js").generate;


// -------------------------------------- //
// -------------- Bluetooth ------------- //
// -------------------------------------- //

// function BTstuff(){
//   NRF.requestDevice({ filters: [{ services: ['heart_rate'] }] })
//     .then(device =>  {
//       console.log("Trying to connect...");
//       device.gatt.connect();
//       console.log("GATT connected!");
//     })
//     .then(server => {
//       console.log("Trying to get service...");
//       server.getPrimaryService('heart_rate');
//       console.log("Got the service!");
//     })
//     .then(service => {
//       console.log("Trying to get characteristic!");
//       service.getCharacteristic('heart_rate_measurement');
//       console.log("Got the characteristic!");
//     })
//     .then(characteristic => {
//       console.log("Trying to start notifications...");
//       characteristic.startNotifications();
//       console.log("Started notifictaions!");
//     })
//     .then(characteristic => {
//       characteristic.addEventListener('characteristicvaluechanged',
//                                       handleCharacteristicValueChanged);
//       console.log('Started event listener!');
//     })
//     .catch(error => { console.error(error);
//   });
// }


// NRF.on('connect', function(addr) {
//   BTcentralAddr=addr;
//   NRF.requestDevice(addr).then(device => {
//     device.on('gattserverdisconnected', function(reason) {
//       term.print(`\r\nDISCONNECTED (${reason})\r\n`);
//       uart = undefined;
//       device = undefined;
//       setTimeout(showConnectMenu, 1000);
//     });
//     require('ble_uart').connect(device).then(uart => {
//       uart.on('data', function(data) {  })
//     })
//   });

// })

NRF.setServices({
  "0e3096df-3f24-4eb8-91c0-16b333d451ad" : { // GATT Service
    "0e3096e0-3f24-4eb8-91c0-16b333d451ad" : { // GATT Characteristic RX
      value : "Hello", // optional
      maxLen : 8, // optional (otherwise is length of initial value)
      broadcast : false, // optional, default is false
      readable : false,   // optional, default is false
      writable : true,   // optional, default is false
      notify : true,   // optional, default is false
      indicate : true,   // optional, default is false
      description: "RX TOTP Info",  // optional, default is null,
      security: { // optional - see NRF.setSecurity
        read: { // optional
          encrypted: false, // optional, default is false
          mitm: false, // optional, default is false
          lesc: false, // optional, default is false
          signed: false // optional, default is false
        },
        write: { // optional
          encrypted: false, // optional, default is false
          mitm: false, // optional, default is false
          lesc: false, // optional, default is false
          signed: false // optional, default is false
        }
      },
      onWrite : function(evt) { // optional
        console.log("Got ", evt.data); // an ArrayBuffer
      },
      onWriteDesc : function(evt) { // optional - called when the 'cccd' descriptor is written
        // for example this is called when notifications are requested by the client:
        console.log("Notifications enabled = ", evt.data[0]&1);
      }
    }
    // more characteristics allowed
  }
  // more services allowed
})

var BTcentralAddr = undefined;


// -------------------------------------- //
// ----------- State machine ------------ //
// -------------------------------------- //

function enterState(state) {
  switch(state) {
    case STATE_MAIN_MENU:
      console.log("----- Main Menu -----");
      E.showMenu(menu());
      printAccounts();
      break;
    case STATE_TOTP_SCREEN:
      console.log("----- TOTP Screen -----");
      doStateTOTPScreen(arguments[1]); // arg must be the totp acc
      break;
    case STATE_NEW_ACC_START:
      console.log("----- New Acc Start -----");
      doStateNewAccStart();
      break;
    case STATE_NEW_ACC_RECV: 
      console.log("----- New Acc Receive -----");
      doStateNewAccRecv();
      break;
    case STATE_NEW_ACC_CONFIRM:
      console.log("----- New Acc Confirm -----");
      doStateNewAccConfirm();
      break;
    case STATE_ERROR_AND_RESUME:
      console.log("----- ERROR -----");
      console.log(arguments[1]);
      showTextScreen(arguments[1]);
      sleep(2000);
      enterState(STATE_MAIN_MENU);
      break;
    default:
      console.log("----- ERROR -----");
      showTextScreen("Error: First argument of enterState() is not valid!");
      sleep(2000);
      enterState(STATE_MAIN_MENU);
  }
}


// -------------------------------------- //
// ----------- TOTP Accounts ------------ //
// -------------------------------------- //

console.log("test: ", TOTP("3132333435363738393031323334353637383930", "HEX", 1, 6));

// TOTP must be updated each 30 seconds -> store the ID of setInterval() for clearInterval(ID):
var intervalId = undefined;
var accounts = []; // list of TOTP accounts

// A TOTP-Account stores a label, and a secret to generate a TOTP:
class TOTPacc {
  constructor(label, secret) {
    this.label = label;
    this.secret = secret;
    accounts.push(this);
  }

  getTOTP(counter) { // counter means the time counter
    return TOTP(key=this.secret, keyT="HEX", counter=counter, returnDigits=6);
  }
}

function printAccounts() {
  var i = 1;
  for (acc of accounts) { console.log(i++, acc.label, "\t", acc.secret); }
}

// TODO: dont hard code accounts, store them in a file (like .json):
let Acc1 = new TOTPacc("github", "3132333435363738393031323334353637383930");
let Acc2 = new TOTPacc("stackoverflow", "35810503158083");

// -------------------------------------- //
// ---------- Screens/Layouts ----------- //
// -------------------------------------- //

// Constants:
const size0 = "10%";
const size05 = "11%";
const size1 = "13%";
const size2 = "14%";
const size3 = "23%";
const col1 = "#4A4A4A"; // grey
const col2 = "#590396"; // violette
const col3 = "#50FF9F"; // green, background color

// Main menu, overview for the totp-accounts:
var menu = function () { 
  var dict = { "" : { "title" : "-- My TOTPs --" } };
  for (acc of accounts) {
    ( function(){
      dict[acc.label] = () => { enterState(STATE_TOTP_SCREEN, acc); };
    })()
  }
  dict["+add account+"] = () => {enterState(STATE_NEW_ACC_START);}
  return dict;
}

// Just show a text on the screen:
function showTextScreen(text) {
  // var layout = new Layout(
  //   {type:"v", filly:1, c: [
  //     {type:"txt", width:0, height:0, font:size0, label: text, col:col2, pad:0},
  //   ]}
  // );
  // g.setBgColor(col3);
  // g.clear();
  // layout.render();
  g.clear();
  g.drawString(text, 0, 0);
  Bangle.setLCDPower(1);
}

function drawLayout(layout) {
  g.setBgColor(col3);
  g.clear();
  layout.render()
}

// The screen displaying the Service + TOTP:
function getTOTPlayout(label, totp){
  // TODO add a delete button plus callback, to delete an acc (use accounts.splice() to delete elements dynamically):
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

// draw the TOTP screen and update the TOTP each 30 seconds:
function doStateTOTPScreen(totpacc) {
  // Just draw the layout without TOTP because calculation needs some time:
  layout = getTOTPlayout(totpacc.label, "...");
  drawLayout(layout);
  
  var counter = Math.floor((Date.now() / 1000) / 30);
  // Set timeout, otherwise we won't see the TOTP screen, we've just drawn:
  setTimeout(function() {
    layout = getTOTPlayout(totpacc.label, totpacc.getTOTP(counter));
    drawLayout(layout);
  }, 1);
  // Pre-calculate the next counter and layout:
  var nextcounter = Math.floor((Date.now() / 1000) / 30);
  if (nextcounter = counter) nextcounter++;
  // TODO draw the TOTP screen again when the clock hits 0 or 30 seconds and start the Interval:
  // Start interval (interval = 30 sec):
  intervalId = setInterval( function () {
    layout = getTOTPlayout(totpacc.label, totpacc.getTOTP(nextcounter));
    drawLayout(layout);
    nextcounter++;
  }, 30000)
}

// Exit TOTP screen and go back to the menu:
function exitTOTPscreen() {
  clearInterval(intervalId);
  intervalId = undefined;
  enterState(STATE_MAIN_MENU);
}

// Screen to create a new account: when BT connection isn't established already
function doStateNewAccStart() {
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
      {type:"btn", font:"6x8:2", label:"Cancel", cb: l=>enterState(STATE_MAIN_MENU)},
    ]}
  );
  drawLayout(layout);
}

// Screen to create a new account: waiting for browser extension to send data
function doStateNewAccRecv() {
  var layout = new Layout(
    {type:"v", filly:1, c: [
      {type:"txt", width:0, height:0, font:size1, label: "New Account", col:col2, pad:0},
      {type:"txt", halign:-1, width:0, height:0, font:"4%", label: ' ', col:col2, pad:1},
      {type:"txt", width:0, height:0, font:size0, label: "Connection", col:col2, pad:1},
      {type:"txt", width:0, height:0, font:size0, label: "established!", col:col2, pad:1},
      {type:"txt", halign:-1, width:0, height:0, font:"4%", label: ' ', col:col2, pad:1},
      {type:"txt", width:0, height:0, font:size0, label: "Receiving data ...", col:col2, pad:1},
      {type:"txt", width:0, height:0, font:size0, label: " ", col:col2, pad:1},
      {type:"btn", font:"6x8:2", label:"Cancel", cb: l=>enterState(STATE_MAIN_MENU)}
    ]}
  );
  drawLayout(layout);
}

// Screen to create a new account: let user check received data
function doStateNewAccConfirm() {
  var layout = new Layout(
    {type:"v", filly:1, c: [
      {type:"txt", width:0, height:0, font:size1, label: "New Account", col:col2, pad:0},
      {type:"txt", halign:-1, width:0, height:0, font:size0, label: 'Label:', col:col2, pad:1},
      {type:"txt", halign:-1, width:0, height:0, font:size0, label: '  TODO label string', col:col2, pad:1},
      {type:"txt", halign:-1, width:0, height:0, font:size0, label: 'Secret:', col:col2, pad:1},
      {type:"txt", halign:-1, width:0, height:0, font:size0, label: '  TODO secret string', col:col2, pad:1},
      {type:"h", c: [
        // {type:"btn", font:"6x8:2", label:"Cancel", cb: l=>exitAddAccScreen()},
        {type:"btn", font:"6x8:2", label:"Apply", cb: l=>enterState(STATE_MAIN_MENU)}
      ]}
    ]}
  );
  drawLayout(layout);
}


// -------------------------------------- //
// ------------ Start the app ---------------
// -------------------------------------- //

enterState(STATE_MAIN_MENU);

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