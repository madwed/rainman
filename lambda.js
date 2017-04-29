const http = require('http');

function OpenWeather(zip = 21218) {
  this.zip = zip;
}

OpenWeather.prototype.forecast = function () {
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

function ForecastParser (list) {
  this.list = list.map((item) => {
    return new ThreeHourForecast(item);
  }).filter((item) => item.today());
}

ForecastParser.prototype.rainPrediction = function() {
  if (this.list.some((item) => item.rain())) {
    return 'Yes, it will!';
  } else {
    return 'Nope';
  }
}

const DRIZZLE = [300, 301, 302, 310, 311, 312, 313, 314, 321];
const EXTREME = [901, 902, 960, 961, 962];
const RAIN_AND_SNOW = [611, 612, 615, 616, 620, 621, 622];
const STANDARD_RAIN = [500, 501, 502, 503, 504, 511, 520, 521, 522, 531];
const THUNDERSTORM = [200, 201, 202, 210, 211, 212, 221, 230, 231, 232];

const RAIN = [].concat(DRIZZLE, EXTREME, RAIN_AND_SNOW, STANDARD_RAIN, THUNDERSTORM);

function ThreeHourForecast (json) {
  this.inchesOfRain = (json.rain || { '3h': 0 })['3h'];
  this.time = new Date(json.dt);
  this.weatherId = (json.weather[0] || { id: 0 }).id;
}

ThreeHourForecast.prototype.today = function() {
  return (new Date()).getDate() === this.time.getDate();
}

ThreeHourForecast.prototype.rain = function() {
  return RAIN.indexOf(this.weatherId) !== -1;
}

function generateResponse (message) {
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

exports.handler = (event, context, callback) => {
  const openWeather = new OpenWeather();

  openWeather.forecast().then((data) => {
    const parser = new ForecastParser(data.list);
    callback(null, generateResponse(parser.rainPrediction()));
  }).catch((e) => {
    console.warn(e);
    callback(null, generateResponse("I'm sorry. I don't know right now"));
  });
};
