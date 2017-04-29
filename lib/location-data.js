const http = require('http');

function LocationData({ deviceId, consentToken }) {
  this.deviceId = deviceId;
  this.consentToken = consentToken;
}

LocationData.prototype.retrieve = function() {
  const options = {
    protocol: 'https:',
    host: 'api.amazonalexa.com',
    path: `/v1/devices/${this.deviceId}/settings/address/countryAndPostalCode`,
    headers: {
      'Accept': 'application/json',
      'Authorization': `Bearer ${this.consentToken}`,
    },
  };

  return new Promise((resolve, reject) => {
    const req = http.get(options, (res) => {
      const { statusCode } = res;
      const contentType = res.headers['content-type'];

      let error;
      if (statusCode !== 200) {
        error = new Error(`Alexa location request failed.\n` +
          `Status code: ${statusCode}`);
      } else if (!/^application\/json/.test(contentType)) {
        error = new Error(`Invalid content-type.\n` +
          `Expected application/json but received ${contentType}`);
      }

      if (error) {
        console.error(error.message);
        // consume response data to free up memory
        res.resume();
        reject('No location data');
      }

      res.setEncoding('utf8');
      let rawData = '';
      res.on('data', (chunk) => { rawData += chunk; });
      res.on('end', () => {
        try {
          resolve(JSON.parse(rawData));
        } catch (e) {
          console.error(e.message);
          reject('No location data');
        }
      });
    }).on('error', (e) => {
      console.error(`Error on Alexa location request: ${e.message}`);
      reject('No location data');
    });
  });
}

module.exports = LocationData;
