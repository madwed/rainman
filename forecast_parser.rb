# frozen_string_literal: true

require_relative 'three_hour_forecast'

class ForecastParser
  def initialize(list)
    @list = list.map { |item| ThreeHourForecast.new(item) }.select(&:today?)
  end

  def rain_prediction
    if @list.any?(&:rain?)
      'Yes, it will!'
    else
      'Nope'
    end
  end
end
