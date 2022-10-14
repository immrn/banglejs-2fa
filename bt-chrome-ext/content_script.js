console.log('Content script is running');

const SERVICE_UUID = '6e400001-b5a3-f393-e0a9-e50e24dcca9e';

function doSomething() {
  navigator.bluetooth.requestDevice({
    filters: [{ services: [SERVICE_UUID] }]
  })
  .then(device => {
    // Human-readable name of the device.
    console.log(device.name);

    // Attempts to connect to remote GATT Server.
    return device.gatt.connect();
  })
  .then(server => { /* … */ })
  .catch(error => { console.error(error); });
}

let interval = null;
const button = document.createElement('button');
button.innerHTML = 'Bluetooth Connect'
button.style.zIndex = '10';
button.style.position = 'absolute';
button.onclick = async () => {
  doSomething();
  // const characteristic = await connectDevice();
}
document.body.appendChild(button);
