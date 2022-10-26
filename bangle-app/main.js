// -------------------------------------- //
// -------------- States ---------------- //
// -------------------------------------- //

const STATE_MAIN_MENU = 0;
const STATE_TOTP_SCREEN = 1;
const STATE_NEW_ACC_START = 2;
const STATE_NEW_ACC_RECV = 3;
const STATE_NEW_ACC_CONFIRM = 4;
const STATE_TEXT_OUT_AND_RESUME = 5;
const STATE_DELETE_ACC_DIALOG = 6;


// -------------------------------------- //
// -------------- Imports --------------- //
// -------------------------------------- //

let Layout = require("Layout");
let B32 = require("base32.min.js"); // from https://github.com/emn178/hi-base32
const TOTP = require("totp.js").generate;
const intArrayToUTF8 = require("my-convert.js").intArrayToUTF8;


// -------------------------------------- //
// ----------- TOTP Accounts ------------ //
// -------------------------------------- //


// TOTP must be updated each 30 seconds -> store the ID of setInterval() for clearInterval(ID):
var intervalId = undefined;
var timeoutId = undefined;

// list of TOTP accounts
var accounts = [];

// A TOTP-Account stores a label, and a secret to generate a TOTP:
class TOTPacc {
  constructor(label, secret, isLoadedFromFile) { // str, str, bool [optional]
    const isLoaded = isLoadedFromFile || false;
    this.label = label;
    this.secret = secret;
    // add to save file if it's new:
    if(!isLoaded)  { // case: store the new TOTP acc to the save file
      const dict = require("Storage").readJSON(FILENAME);
      // TODO check if label already exists and slighlty change label name (check again after that)
      dict[this.label] = this.secret;
      require("Storage").writeJSON(FILENAME, dict);
    }
    // convert secret key to Uint8Array and add totp acc to array:
    this.secret = B32.decode.asBytes(this.secret);
    accounts.push(this);
  }

  getTOTP(counter) { // counter means the time counter
    return TOTP(key=this.secret, keyT="UINT8ARRAY", counter=counter, returnDigits=6);
  }

  remove() {
    // remove from save file:
    const dict = require("Storage").readJSON(FILENAME);
    delete dict[this.label];
    require("Storage").writeJSON(FILENAME, dict);
    // remove from array:
    accounts.splice(accounts.indexOf(this), 1);
  }
}

function printAccounts() {
  var i = 0;
  for (var acc of accounts) {
    console.log(i++, acc.label, "\t", acc.secret);
  }
}

// Load TOTP accounts from save file:
const FILENAME = "my_totp_accounts.json";
console.log(require("Storage").readJSON(FILENAME)); // TODO rm
const DICT = require("Storage").readJSON(FILENAME);
for (var label in DICT) {
  new TOTPacc(label, DICT[label], true);
}


// -------------------------------------- //
// -------------- Bluetooth ------------- //
// -------------------------------------- //

var receivedMsg = "";
const endOfMsg = ";";
const separator = ","


function advertiseGATT() {
  NRF.setServices({
    '7f9c91ef-6e8d-4d8b-9138-c2649ee9eb2d' : { // GATT Service
      '27d6e20d-5b5f-4994-9ede-3cccb9725bbf' : { // GATT Characteristic RX
        value : "Hello", // optional
        maxLen : 70, // optional (otherwise is length of initial value)
        broadcast : false, // optional, default is false
        readable : false,   // optional, default is false
        writable : true,   // optional, default is false
        notify : true,   // optional, default is false
        indicate : true,   // optional, default is false
        description: null,  // optional, default is null,
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
          // evt.data is an ArrayBuffer!
          const msg = intArrayToUTF8(evt.data);
          receivedMsg += msg;

          if (msg[msg.length-1] == endOfMsg) {
            NRF.sleep();
            receivedMsg = receivedMsg.slice(0,-1);
            const info = receivedMsg.split(separator); // label and secret
            var acc = new TOTPacc(info[0], info[1]); //gen new Acc
            enterState(STATE_NEW_ACC_CONFIRM, acc);
          }
        },
        onWriteDesc : function(evt) { // optional - called when the 'cccd' descriptor is written
          // for example this is called when notifications are requested by the client:
          console.log("Notifications enabled = ", evt.data[0]&1);
        }
      }
      // more characteristics allowed
    }
    // more services allowed
  },{
    advertise: ['7f9c91ef-6e8d-4d8b-9138-c2649ee9eb2d'],
    uart: false
  });
}


// -------------------------------------- //
// ----------- State machine ------------ //
// -------------------------------------- //

function enterState(state) {
  switch(state) {
    case STATE_MAIN_MENU:
      console.log("----- Main Menu -----");
      receivedMsg = ""; // reset received BT message
      NRF.sleep(); // stop BT GATT Advertising, comment this line when debugging
      E.showMenu(menu());
      printAccounts();
      Bangle.setLCDPower(1);
      break;
    case STATE_TOTP_SCREEN: // additional arg: totp acc
      console.log("----- TOTP Screen -----");
      doStateTOTPScreen(arguments[1]);
      console.log(arguments[1].label);
      Bangle.setLCDPower(1);
      break;
    case STATE_DELETE_ACC_DIALOG: // additional arg: totp acc
      console.log("----- DELETE ACC -----");
      drawLayout( getLayoutDeleteAccDialog(arguments[1]) );
      break;
    case STATE_NEW_ACC_START:
      console.log("----- New Acc Start -----");
      advertiseGATT();
      drawLayout( getLayoutNewAccStart() );
      Bangle.setLCDPower(1);
      break;
    case STATE_NEW_ACC_RECV: 
      console.log("----- New Acc Receive -----");
      drawLayout( getLayoutNewAccRecv() );
      Bangle.setLCDPower(1);
      break;
    case STATE_NEW_ACC_CONFIRM: // additional arg: totp acc
      console.log("----- New Acc Confirm -----");
      drawLayout( getLayoutNewAccConfirm(arguments[1]) );
      Bangle.setLCDPower(1);
      break;
    case STATE_TEXT_OUT_AND_RESUME: // additional arg: str
      console.log("----- Text Output -----");
      showTextScreen(arguments[1]);
      Bangle.setLCDPower(1);
      break;
    default:
      console.log("----- ERROR -----");
      showTextScreen("Error: First argument of enterState() is not valid!");
      Bangle.setLCDPower(1);
      setTimeout(enterState, 3000, STATE_MAIN_MENU);
  }
}


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

// Main menu, overview for the TOTP accounts:
var menu = function () { 
  var dict = { "" : { "title" : "-- My TOTPs --" } };
  for (let acc of accounts) {
    console.log("should work", acc.label);
    dict[acc.label] = ( function(acc){
      return function () {
        enterState(STATE_TOTP_SCREEN, acc);
      }
    })(acc);
  }
  dict["+add account+"] = () => {enterState(STATE_NEW_ACC_START);}
  return dict;
}

function drawLayout(layout) {
  g.setBgColor(col3);
  g.clear();
  layout.render()
}

// Just show a text on the screen:
function showTextScreen(text) {
  g.clear();
  text = g.wrapString(text, g.getWidth());
  lines = text.length;
  text = text.join("\n");
  console.log(text);
  // g.drawString(text, 10, 50);
  const layout = new Layout(
    {type:"txt", font:"8%", label:text}
  );
  drawLayout(layout);
}

// The screen displaying the Service + TOTP:
function getTOTPlayout(acc, totp){
  var layout = new Layout(
    {type:"h", c:[
      {type:"v", fillx:1, valign:-1, c: [
        {type:"btn", halign:1 ,font:"6x8:2", label:"X", cb: l=>exitTOTPscreen()},
        {type:"txt", font:size05, label: acc.label, col:col2},
        {type:"txt", font:size3, label: totp, col:col2, pad:10, id:"totp"},
        {type:"btn", font:"6x8:2", label:"Delete Account", cb: l=>{
          enterState(STATE_DELETE_ACC_DIALOG, acc);
        }}
      ]},
    ]}
  );
  return layout;
}

// draw the TOTP screen and update the TOTP each 30 seconds:
function doStateTOTPScreen(acc) {
  // get the current time counter and the gap to the next timestep
  const step = 30;
  const stepMs = 30000;
  const seconds = Date.now() / 1000;
  var counter = Math.floor(seconds / step);
  // gap to next 30 second timestamp of the clock
  var gapToNext = (step - Math.floor(seconds % step)) * 1000;

  // generate TOTP, render TOTP screen, return time needed
  function runTOTPcycle() {
    var startTime = Date.now();
    var layout = getTOTPlayout(acc, acc.getTOTP(counter));
    drawLayout(layout);
    counter++;
    // return render/calc time
    return (Date.now() - startTime);
  }

  // draw the current TOTP
  var cycleTime = runTOTPcycle();
  var timeout = gapToNext - 2 * cycleTime;
  // Wait for timeout milliseconds until starting the interval and running the next cycle
  timeoutId = setTimeout(function(){
    intervalId = setInterval(function() {
      var layout = getTOTPlayout(acc, acc.getTOTP(counter));
      drawLayout(layout);
      counter++;
    }, 30000);
    runTOTPcycle();
  }, timeout);
}

function getLayoutDeleteAccDialog(acc) {
  var layout = new Layout(
    {type:"v", fillx:1, c: [
      {type:"txt", font:size0, col:col2, label:"Do you really\nwant to delete\n" + acc.label + "\n?"},
      {type:"h", c: [
        {type:"btn", font:"6x8:2", label:"Keep", cb: l=>{
          resetTimerIds();
          enterState(STATE_TOTP_SCREEN, acc);
        }},
        {type:"btn", font:"6x8:2", label:"Delete", cb: l=>{
          acc.remove();
          resetTimerIds();
          enterState(STATE_MAIN_MENU);
        }}
      ]}
    ]}
  )
  return layout;
}

function resetTimerIds() {
  if (timeoutId !== undefined) {
    clearTimeout(timeoutId);
    timeoutId = undefined;
  }
  if (intervalId !== undefined) {
    clearInterval(intervalId);
    intervalId = undefined;
  }
}

// Screen to create a new account: when BT connection isn't established already
function getLayoutNewAccStart() {
  const bangleName = NRF.getAddress().substring(12,17).replace(":","");
  return new Layout(
    {type:"v", filly:1, c: [
      {type:"txt", width:0, height:0, font:size1, label: "New Account", col:col2, pad:0},
      {type:"txt", halign:-1, width:0, height:0, font:"4%", label: ' ', col:col2, pad:1},
      {type:"txt", halign:-1, width:0, height:0, font:size0, label: "- follow the exten-", col:col2, pad:1},
      {type:"txt", halign:-1, width:0, height:0, font:size0, label: "  sion's instruction", col:col2, pad:1},
      {type:"txt", halign:-1, width:0, height:0, font:"4%", label: ' ', col:col2, pad:1},
      {type:"txt", halign:-1, width:0, height:0, font:size0, label: '- select Bangle.js', col:col2, pad:1},
      {type:"txt", halign:-1, width:0, height:0, font:size0, label: '  ' + bangleName, col:col2, pad:1},
      {type:"btn", font:"6x8:2", label:"Cancel", cb: l=>enterState(STATE_MAIN_MENU)},
    ]}
  );
}

// Screen to create a new account: let user check received data
function getLayoutNewAccConfirm(acc) {
  const secret = B32.encode(acc.secret);
  return new Layout(
    {type:"v", filly:1, c: [
      {type:"txt", width:0, height:0, font:size1, label: "New Account", col:col2, pad:0},
      {type:"txt", halign:-1, width:0, height:0, font:size0, label: 'Label:', col:col2, pad:1},
      {type:"txt", halign:-1, width:0, height:0, font:size0, label: acc.label, col:col2, pad:1},
      {type:"txt", halign:-1, width:0, height:0, font:size0, label: 'Secret:', col:col2, pad:1},
      {type:"txt", halign:-1, width:0, height:0, font:"9%", label: secret, col:col2, pad:1},
      {type:"h", c: [
        {type:"btn", font:"6x8:2", label:"Cancel", cb: l=>{
          acc.remove();
          enterState(STATE_MAIN_MENU);
        }},
        {type:"btn", font:"6x8:2", label:"Apply", cb: l=>enterState(STATE_MAIN_MENU)}
      ]}
    ]}
  );
}


// -------------------------------------- //
// ------------ Start the app ------------//
// -------------------------------------- //

// If u wanna check correctness to the HOTP RFC:
// console.log("test: ", TOTP("3132333435363738393031323334353637383930", "HEX", 1, 6));

Bangle.setLCDTimeout(30);
// When entering main menu, bangleJs will disconnect from the web IDE
setTimeout(enterState, 1000, STATE_MAIN_MENU);
