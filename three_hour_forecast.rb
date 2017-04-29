# frozen_string_literal: true

class ThreeHourForecast
  attr_reader :weather_id, :inches_of_rain

  DRIZZLE = [300, 301, 302, 310, 311, 312, 313, 314, 321]
  EXTREME = [901, 902, 960, 961, 962]
  RAIN_AND_SNOW = [611, 612, 615, 616, 620, 621, 622]
  STANDARD_RAIN = [500, 501, 502, 503, 504, 511, 520, 521, 522, 531]
  THUNDERSTORM = [200, 201, 202, 210, 211, 212, 221, 230, 231, 232]

  RAIN = DRIZZLE + EXTREME + RAIN_AND_SNOW + STANDARD_RAIN + THUNDERSTORM

  NO_RAIN = { "3h" => 0 }

  def initialize(json)
    @inches_of_rain = json.fetch("rain", NO_RAIN)["3h"]
    @time = Time.at(json["dt"].to_i)
    @weather_id = json["weather"].first.fetch("id")
  end

  def rain?
    RAIN.include?(@weather_id)
  end

  def today?
    Time.new.day == @time.day
  end
end
