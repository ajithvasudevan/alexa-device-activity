# alexa-device-activity
A simple app using [alexa-remote2](https://www.npmjs.com/package/alexa-remote2) to publish speech payload via MQTT and to send text to echo devices

## Usage
1. Clone this project with `git clone https://github.com/ajithvasudevan/alexa-device-activity.git`
2. change to project folder with `cd alexa-device-activity`
3. run `npm install`  or `yarn` to install dependencies
4. start the app with `node index.js`  or  `node .`
5. open the link http://localhost:3001 in your browser (if you're NOT opening browser on the same machine, replace *localhost* with the IP address of machine where app is running)
6. Login with your Amazon credentials and close the browser. This creates a file called `cookie.txt` in the current folder, which will be used for authentication the next time you start this app. `cookie.txt` will get refreshed every time you restart the app.
7. Back in the terminal, you should see your devices listed and some activity when you give Alexa commands.

The command `node index.js` could be made into a *service* on a Raspberry Pi, for example, and the Device Activity Payload can be obtained using *Node-RED's* MQTT nodes.  


## MQTT integration

This app connects to an MQTT broker specified in the `config.js` file so that it can publish the Alexa device activity payload via MQTT.

The app sends the device activity payload to the MQTT topic `ALEXA_DEVICE_ACTIVITY`. The payload is a String representation of a JSON, and it contains the Device Name, and the uttered command, among other things.


In addition to the above, this app listens to the topic `ALEXA_DEVICE_SPEAK` for incoming messages of the form `<Echo Device Name>|<Message to Speak>`, i.e., the **device name** and the **message to speak** separated by a `|` character.

Thus, 
`mosquitto_pub -h <MQTT Broker IP> -t ALEXA_DEVICE_SPEAK -m "Workshop Echo Dot|Hello World"`  will cause the Alexa device named *Workshop Echo Dot* to speak *Hello World*
  
  
