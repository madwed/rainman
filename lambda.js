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

function getLocationPermissionResponse() {
  return {
    version: '1.0',
    response: {
      card: {
        type: 'AskForPermissionsConsent',
        permissions: ['read::alexa:device:all:country_and_postal_code']
      }
    }
  };
}

exports.handler = (event, context, callback) => {
  const {
    context: {
      System: {
        device: { deviceId },
        user: { permissions: { consentToken } },
      },
    },
  } = event;

  const locationData = new LocationData({ deviceId, consentToken });

  locationData.retrieve().then((data) => {
    const openWeather = new OpenWeather(data.postalCode);
    return openWeather.forecast();
  }).then((data) => {
    const parser = new ForecastParser(data.list);
    callback(null, generateResponse(parser.rainPrediction()));
  }).catch((e) => {
    console.warn(e);
    if (e === 'No location data') {
      callback(null, getLocationPermissionResponse());
    } else {
      callback(null, generateResponse("I'm sorry. I don't know right now"));
    }
  });
};
