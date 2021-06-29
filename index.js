let config = require('./config');
let Alexa = require('alexa-remote2');
let alexa = new Alexa();
let fs = require('fs');
var mqtt = require('mqtt')
var client  = mqtt.connect('mqtt://' + config.mqttHostPort)

client.on('connect', function () {
    console.log('MQtT client connected to ' + config.mqttHostPort)
    client.subscribe('ALEXA_DEVICE_SPEAK', function (err) {
      if (!err) {
        console.log('Subscribed to topic ALEXA_DEVICE_SPEAK');
      } else {
          console.error('Unable to connect to MQTT at '+ config.mqttHostPort +': ', err.message)
      }
    })
  })
  
  client.on('message', function (topic, message) {
    // message is Buffer
    var msg = message.toString();
    console.log('MQTT:', topic, ':', msg)
    var device = msg.split('|')[0]
    var speech = msg.split('|')[1]
    alexa.sendSequenceCommand(device, 'speak', speech, function(res) {
        console.log('Spoken:', speech, res)
    });
  })


/***************************************************************/
// see: https://www.gehrig.info/alexa/Alexa.html
// cookie starts with x-amzn-dat and ends with =" csrf=12345780
let cookie = {};
try {
    cookie = JSON.parse(fs.readFileSync('cookie.txt'));
} catch(e) {console.warn(e.message)}

alexa.init({
        cookie: cookie,  // cookie if already known, else can be generated using email/password
        email: '...',    // optional, amazon email for login to get new cookie
        password: '...', // optional, amazon password for login to get new cookie
        proxyOnly: true,
        proxyOwnIp: 'localhost',
        proxyPort: config.proxyPort ? config.proxyPort : 3001,
        proxyLogLevel: 'error',
        bluetooth: true,
//        logger: console.log, // optional
        amazonPage: config.amazonPage ? config.amazonPage : 'amazon.in',
        alexaServiceHost: config.alexaServiceHost ? config.alexaServiceHost : 'alexa.amazon.in', // optional, e.g. "pitangui.amazon.com" for amazon.com, default is "layla.amazon.de"
//        userAgent: '...', // optional, override used user-Agent for all Requests and Cookie determination
//        acceptLanguage: '...', // optional, override Accept-Language-Header for cookie determination
//        amazonPage: '...', // optional, override Amazon-Login-Page for cookie determination and referer for requests
        useWsMqtt: true, // optional, true to use the Websocket/MQTT direct push connection
        cookieRefreshInterval: config.cookieRefreshInterval ? config.cookieRefreshInterval : 7*24*60*60*1000 // optional, cookie refresh intervall, set to 0 to disable refresh
    },
    function (err) {
        if (err) {
            console.log (err);
            return;
        }
        // console.log(JSON.stringify(alexa.cookie));
        // console.log(JSON.stringify(alexa.csrf));
        // console.log(JSON.stringify(alexa.cookieData));
        fs.writeFileSync('cookie.txt', JSON.stringify(alexa.cookieData));
        console.log('*****************************Cookie written to cookie.txt *********************************')
        var lowerNames = [];
        console.log('\nDevices:\n')
        for (let name of Object.keys(alexa.names)) {
            if(!lowerNames.includes(name.toLowerCase())) {
                console.log (name);
                lowerNames.push(name.toLowerCase());
            }
        }
        alexa.on('ws-device-activity', function(activity) {
            console.log('Activity:\n', activity);
            client.publish('ALEXA_DEVICE_ACTIVITY', JSON.stringify(activity), {}, function() {
                console.log('Sent to MQTT topic ALEXA_DEVICE_ACTIVITY');
            })
        })

        var message = 'Hi There! We are Ready!!';
        var echo = Object.keys(alexa.names)[0];  // first echo
        alexa.sendSequenceCommand(echo, 'speak', message, function(res) {
            console.log('*****************************************\nSpoken: device:', echo, '    message:', message)
        });
    }
);
