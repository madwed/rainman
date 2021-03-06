const ForecastParser = require('./lib/forecast-parser');
const LocationData = require('./lib/location-data');
const OpenWeather = require('./lib/open-weather');

function generateResponse(message) {
  return {
    version: '1.0',
    response: {
      outputSpeech: {
        type: 'PlainText',
        text: message,
      }
    }
  };
}

exports.handler = (event, lambdaContext, callback) => {
  const { context = {} } = event;
  const { System = {} } = context;
  const { device = {}, user = {} } = System;
  const { permissions = {} } = user;

  const locationData = new LocationData({
    consentToken: permissions.consentToken,
    deviceId: device.deviceId,
  });

  locationData.retrieve().then((data) => {
    const openWeather = new OpenWeather(data.postalCode);
    return openWeather.forecast();
  }).then((data) => {
    const parser = new ForecastParser(data.list);
    callback(null, generateResponse(parser.rainPrediction()));
  }).catch((e) => {
    console.warn(e);
    if (e === 'No location data') {
      callback(null, generateResponse("Rain Man doesn't have permission to know where you are"));
    } else {
      callback(null, generateResponse("I'm sorry. I don't know right now"));
    }
  });
};
