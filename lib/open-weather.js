const http = require('http');

function OpenWeather(zip = 21218) {
  this.zip = zip;
}

OpenWeather.prototype.forecast = function() {
  const path = 'http://api.openweathermap.org/data/2.5/forecast';
  const query = `?zip=${this.zip},us&APPID=${process.env.OPEN_WEATHER_KEY}`;

  return new Promise((resolve, reject) => {
    const req = http.get(path + query, (res) => {
      const { statusCode } = res;
      const contentType = res.headers['content-type'];

      let error;
      if (statusCode !== 200) {
        error = new Error(`OpenWeather Request Failed.\n` +
          `Status Code: ${statusCode}`);
      } else if (!/^application\/json/.test(contentType)) {
        error = new Error(`Invalid content-type.\n` +
          `Expected application/json but received ${contentType}`);
      }
      if (error) {
        console.error(error.message);
        // consume response data to free up memory
        res.resume();
        reject('Error getting weather information');
      }

      res.setEncoding('utf8');
      let rawData = '';
      res.on('data', (chunk) => { rawData += chunk; });
      res.on('end', () => {
        try {
          resolve(JSON.parse(rawData));
        } catch (e) {
          console.error(e.message);
          reject('Error parsing weather data');
        }
      });
    }).on('error', (e) => {
      console.error(`Error on OpenWeather request: ${e.message}`);
      reject('Error getting weather information');
    });
  });
}

module.exports = OpenWeather;
