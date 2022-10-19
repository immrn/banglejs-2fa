let buttonSetup2FA = document.getElementById("start2FA");
let inputLabel = document.getElementById("labelId");
let inputSecret = document.getElementById("secretId");

buttonSetup2FA.addEventListener("click", async () => {
  // Check if input are valid:
  if (inputLabel.value == "") {
    alert('Please state a name at the "Label" field!');
    inputLabel.placeholder = "Enter a name!";
    return;
  }
  if (inputSecret.value == "") {
    alert('Please state the secret/key at the "Secret" field!')
    inputSecret.placeholder = "Enter the secret/key!";
    return;
  }

  // alert("Name: " + inputLabel.value + ", Secret: " + inputSecret.value);

  let [tab] = await chrome.tabs.query({ active: true, currentWindow: true });

  chrome.scripting.executeScript({
    target: { tabId: tab.id },
    function: connectToBangle,
  });
});

function handleCharacteristicValueChanged(event){
  const value = event.target.value;
  console.log('Received ' + value);
}

function connectToBangle() {
  var SERVICE_UUID = '7f9c91ef-6e8d-4d8b-9138-c2649ee9eb2d';
  var RX_CHARACTERISTIC_UUID = '27d6e20d-5b5f-4994-9ede-3cccb9725bbf';
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
    // const value = Uint8Array.of(23);
    const value = "Hell";
    console.log(value);
    characteristic.writeValue(value);
    console.log("wrote something");
  })
  .catch(error => { console.error(error); });
}