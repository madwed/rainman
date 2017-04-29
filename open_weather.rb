# frozen_string_literal

require 'httparty'

DEV_KEY = '6a61a747caa0c047335fb32382bd3210'

class OpenWeather
  include HTTParty
  base_uri 'api.openweathermap.org'

  def initialize(zip = 21218)
    @options = { query: { zip: "#{zip},us", APPID: DEV_KEY } }
  end

  def forecast
    self.class.get('/data/2.5/forecast', @options)
  end
end
