let buttonSetup2FA = document.getElementById("start2FA");
let inputLabel = document.getElementById("labelId");
let inputSecret = document.getElementById("secretId");


buttonSetup2FA.addEventListener("click", async () => {
  console.log("hi");

  const alertLabel = 'Please state a valid name at the "Label" field!';
  const alertSecret = 'Please state the valid secret/key at the "Secret" field!';
  const alertLabelUnvalid = 'Label is unvalid! Only use characters and digits.';
  const alertSecretUnvalid = 'Secret/Key is unvalid!';

  // Check if inputs are valid:
  const unvalidChars = [',',';'];
  if (inputLabel.value == "") {
    alert(alertLabel);
    inputLabel.placeholder = "Enter a name!";
    return;
  }
  if (inputSecret.value == "") {
    alert(alertSecret);
    inputSecret.placeholder = "Enter the secret/key!";
    return;
  }
  for (var i = 0; i < unvalidChars.length; i++) {
    if (inputLabel.value.includes(unvalidChars[i])) {
      alert(alertLabelUnvalid);
      return;
    }
    else if (inputSecret.value.includes(unvalidChars[i])) {
      alert(alertSecretUnvalid);
      return;
    }
  }

  let [tab] = await chrome.tabs.query({ active: true, currentWindow: true });

  chrome.scripting.executeScript({
    target: { tabId: tab.id },
    function: connectToBangle,
    args: [inputLabel, inputSecret]
  });
});


function connectToBangle(label, secret) {

  var SERVICE_UUID = '7f9c91ef-6e8d-4d8b-9138-c2649ee9eb2d';
  var RX_CHARACTERISTIC_UUID = '27d6e20d-5b5f-4994-9ede-3cccb9725bbf';

  function UTF8toIntArray(str){
    let buffer = new ArrayBuffer(str.length);
    var intArray = new Uint8Array(buffer);
    for (var i = 0; i < str.length; i++) {
        intArray[i] = str.charCodeAt(i);
    }
    return intArray;
  }

  navigator.bluetooth.requestDevice({
    filters: [
      { services: [SERVICE_UUID] },
      { namePrefix: "Bangle" }
    ]
  })
  .then(device => {
    // Human-readable name of the device.
    console.log(device.name);

    // Attempts to connect to remote GATT Server.
    return device.gatt.connect();
  })
  .then(server => {
    console.log("got server!");
    return server.getPrimaryService(SERVICE_UUID);
  })
  .then(service => {
    return service.getCharacteristic(RX_CHARACTERISTIC_UUID);
  })
  .then(characteristic => {
    label = "B2,1234;"; // TODO rm
    console.log("label:", label);
    // split into 8 byte strings because RX Characteristic maxLen = 8
    const msgArray = label.match(/.{1,8}/g); 
    const hex = UTF8toIntArray(msgArray[0]);

    characteristic.writeValueWithResponse(hex);
    
    console.log("Sent Label!");

  })
  .catch(error => { console.error(error); });
}