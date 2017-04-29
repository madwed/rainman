const ThreeHourForecast = require('./three-hour-forecast');

function ForecastParser(list) {
  this.list = list.map((item) => {
    return new ThreeHourForecast(item);
  }).filter((item) => item.today());
}

ForecastParser.prototype.rainPrediction = function() {
  if (this.list.some((item) => item.rain())) {
    return "It's going to rain";
  } else {
    return 'Nope';
  }
}

module.exports = ForecastParser;
