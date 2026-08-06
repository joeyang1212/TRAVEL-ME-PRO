import type { WeatherDay, WeatherHour } from "@/types/travel";

export type WeatherForecast = {
  current: {
    temperature: number;
    humidity: number;
    apparentTemperature: number;
    weatherCode: number;
    windSpeed: number;
  };
  hourly: WeatherHour[];
  daily: WeatherDay[];
};

export async function fetchWeatherForecast(
  latitude: number,
  longitude: number,
  signal?: AbortSignal
): Promise<WeatherForecast> {
  const params = new URLSearchParams({
    latitude: String(latitude),
    longitude: String(longitude),
    current: "temperature_2m,relative_humidity_2m,apparent_temperature,weather_code,wind_speed_10m",
    hourly: "temperature_2m,relative_humidity_2m,apparent_temperature,precipitation_probability,weather_code",
    daily: "weather_code,temperature_2m_max,temperature_2m_min,precipitation_probability_max,sunrise,sunset",
    timezone: "auto",
    forecast_days: "7"
  });

  const response = await fetch(`https://api.open-meteo.com/v1/forecast?${params}`, {
    cache: "no-store",
    signal
  });

  if (!response.ok) {
    throw new Error(`Open-Meteo request failed: ${response.status}`);
  }

  const data = await response.json();
  if (!data.current || !data.hourly || !data.daily) {
    throw new Error("Open-Meteo returned incomplete forecast data");
  }

  const now = Date.now() - 60 * 60 * 1000;
  const hourly: WeatherHour[] = data.hourly.time
    .map((time: string, index: number) => ({
      time,
      temperature: data.hourly.temperature_2m[index],
      humidity: data.hourly.relative_humidity_2m[index],
      apparent: data.hourly.apparent_temperature[index],
      rainProbability: data.hourly.precipitation_probability[index] ?? 0,
      weatherCode: data.hourly.weather_code[index]
    }))
    .filter((item: WeatherHour) => new Date(item.time).getTime() >= now)
    .slice(0, 12);

  const daily: WeatherDay[] = data.daily.time.map((date: string, index: number) => ({
    date,
    code: data.daily.weather_code[index],
    max: data.daily.temperature_2m_max[index],
    min: data.daily.temperature_2m_min[index],
    rainProbability: data.daily.precipitation_probability_max[index] ?? 0,
    sunrise: data.daily.sunrise[index],
    sunset: data.daily.sunset[index]
  }));

  return {
    current: {
      temperature: data.current.temperature_2m,
      humidity: data.current.relative_humidity_2m,
      apparentTemperature: data.current.apparent_temperature,
      weatherCode: data.current.weather_code,
      windSpeed: data.current.wind_speed_10m
    },
    hourly,
    daily
  };
}
