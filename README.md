# BangleJs 2FA

**------- WORK IN PROGESS -------**

[Bangle Js 2](https://banglejs.com/) app for [two factor authentication](https://docs.github.com/en/authentication/securing-your-account-with-two-factor-authentication-2fa/about-two-factor-authentication)

This project contains a Bangle.js app and a Chrome extension to setup up two factor authentication (2FA) on your Bangle.js device and let it generate Time-based One-time Passwords (TOTP).

This Project isn't finished, there are several [bugs](#known-bugs) and things you could solve better. It's just a start!

## Setup
### Bangle App
1. Open the [Espruino Web IDE](https://www.espruino.com/ide/#) in a browser that is capable of Web-Bluetooh (like Chrome).
2. Use the **Storage** button (the 4 disks) to upload following files:
    - `bangle-app/totp.js`
    - `bangle-app/sha1.js`
    - `bangle-app/base32.min.js`

3. Use the **Upload** button (the folder) to upload `bangle-app/main.js`, choose your Bangle.js device.

### Chrome Extension
1. Open the Chrome browser and enter following address: `chrome://extensions/`
2. Use the **Load unpacked** button and upload directory `the bt-chrome-ext/`. Maybe you have to restart your browser before executing the following step.
3. Press the **Extensions** button of chrome (top right corner, the puzzle symbol) and pin the extension.

## Usage
If you don't know how to setup two factor authentication in general, read [here](#how-to-setup-two-factor-authentication).

### Adding a new Account on your Bangle.js device
A account just saves the secret key (for 2FA) and a label (so you can distinguish multiple accounts).

1. Doing the [setup](#setup), you already started the Bangle.js application.
2. On your Bangle.js device select **+add account+**
3. Open the chrome extension and state a label (how you want to name the 2FA account on your Bangle.js app) and the secret key.
4. Hit **Send to Bangle.js** and follow the instructions on your Bangle.js device.

### Accessing your TOTP
1. Run the Bangle.js app and select a TOTP account.
2. It will state the label and a TOTP.
3. Every 30 seconds the TOTP will be updated.

## How to setup two factor authentication
1. In your browser open a website (e.g. Github) where you want to setup 2FA for an account of yours. Not every host supports 2FA. Mostly you find this option in your account settings (e.g. [Github 2FA Setup](https://github.com/settings/two_factor_authentication/setup/intro)).
2. Before starting the setup of two factor authentication (2FA), be aware that **you could brick your account** at this host. When the website states the secret key, you should **note the key** on paper or something and if stated, **note the recovery codes** too.

## Known Bugs

- not possible to create a totp account that has the same label like one that exists already
- you must disconnect from the espruino web IDE when when using bluetooth features (creating a new totp account)
- chrome extension: bad checks for validity of the entered strings for label and secret; e.g. input a secret that has odd length