const SERVICE_UUID = '6e400001-b5a3-f393-e0a9-e50e24dcca9e'

let start2FA = document.getElementById("start2FA");

start2FA.addEventListener("click", async () => {
  let [tab] = await chrome.tabs.query({ active: true, currentWindow: true });

  chrome.scripting.executeScript({
    target: { tabId: tab.id },
    function: send2FAinfo,
  });
});

function send2FAinfo() {
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
