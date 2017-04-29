# frozen_string_literal: true

require 'json'
require 'sinatra'

if development?
  require 'pry'
  require 'sinatra/reloader'
end

require_relative 'forecast_parser'
require_relative 'open_weather'

post '/' do
  forecast = OpenWeather.new.forecast
  rain_prediction = ForecastParser.new(forecast["list"]).rain_prediction

  {
    version: "1.0",
    response: {
      outputSpeech: {
        type: "PlainText",
        text: rain_prediction
      }
    }
  }.to_json
end
