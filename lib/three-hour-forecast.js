const DRIZZLE = [300, 301, 302, 310, 311, 312, 313, 314, 321];
const EXTREME = [901, 902, 960, 961, 962];
const RAIN_AND_SNOW = [611, 612, 615, 616, 620, 621, 622];
const STANDARD_RAIN = [500, 501, 502, 503, 504, 511, 520, 521, 522, 531];
const THUNDERSTORM = [200, 201, 202, 210, 211, 212, 221, 230, 231, 232];

const RAIN = [].concat(DRIZZLE, EXTREME, RAIN_AND_SNOW, STANDARD_RAIN, THUNDERSTORM);

function ThreeHourForecast(json) {
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

module.exports = ThreeHourForecast;
