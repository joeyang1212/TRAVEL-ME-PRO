import type { WeatherDay, WeatherHour } from "../../types/travel";

type WeatherForecastProps = {
  city: string;
  hours: WeatherHour[];
  days: WeatherDay[];
  loading: boolean;
  error?: string;
  updatedAt?: string;
  onRefresh: () => void;
};

function weatherText(code: number) {
  if (code === 0) return "晴朗";
  if ([1, 2].includes(code)) return "晴時多雲";
  if (code === 3) return "陰天";
  if ([45, 48].includes(code)) return "霧";
  if ([51, 53, 55, 56, 57].includes(code)) return "毛毛雨";
  if ([61, 63, 65, 66, 67].includes(code)) return "下雨";
  if ([71, 73, 75, 77].includes(code)) return "下雪";
  if ([80, 81, 82].includes(code)) return "陣雨";
  if ([85, 86].includes(code)) return "陣雪";
  if ([95, 96, 99].includes(code)) return "雷雨";
  return "天氣變化";
}

function weatherIcon(code: number) {
  if (code === 0) return "☀️";
  if ([1, 2].includes(code)) return "🌤️";
  if (code === 3) return "☁️";
  if ([45, 48].includes(code)) return "🌫️";
  if ([51, 53, 55, 56, 57, 61, 63, 65, 66, 67, 80, 81, 82].includes(code)) return "🌧️";
  if ([71, 73, 75, 77, 85, 86].includes(code)) return "🌨️";
  if ([95, 96, 99].includes(code)) return "⛈️";
  return "🌦️";
}

export function WeatherForecast({ city, hours, days, loading, error, updatedAt, onRefresh }: WeatherForecastProps) {
  const current = hours[0];

  return (
    <section className="weatherForecastPanel">
      <div className="sectionHead">
        <div><h2>🌦️ 7 日氣象預報</h2><p>{city}｜溫度、體感溫度、濕度與降雨機率</p></div>
        <button className="minor" onClick={onRefresh} disabled={loading}>{loading ? "更新中…" : "更新預報"}</button>
      </div>

      {error && <div className="weatherError">⚠️ {error}</div>}

      {current && <>
        <div className="weatherNow">
          <article><small>目前／下一小時</small><strong>{weatherIcon(current.weatherCode)} {current.temperature}°C</strong><span>{weatherText(current.weatherCode)}</span></article>
          <article><small>體感溫度</small><strong>{current.apparent}°C</strong><span>穿著感受參考</span></article>
          <article><small>相對濕度</small><strong>{current.humidity}%</strong><span>高濕度時鏡頭較容易起霧</span></article>
          <article><small>降雨機率</small><strong>{current.rainProbability}%</strong><span>{current.rainProbability >= 50 ? "建議攜帶雨衣" : "仍留意山區變化"}</span></article>
        </div>

        <div className="hourlyForecast">
          {hours.map((hour) => <article key={hour.time}>
            <small>{new Date(hour.time).toLocaleTimeString("zh-TW", { hour: "2-digit", minute: "2-digit" })}</small>
            <b>{weatherIcon(hour.weatherCode)}</b><strong>{hour.temperature}°</strong>
            <span>濕度 {hour.humidity}%</span><span>雨 {hour.rainProbability}%</span>
          </article>)}
        </div>

        <div className="dailyForecast">
          {days.map((day) => <article key={day.date}>
            <small>{new Date(`${day.date}T12:00:00`).toLocaleDateString("zh-TW", { month: "numeric", day: "numeric", weekday: "short" })}</small>
            <div className="dailyWeatherMain"><b>{weatherIcon(day.code)}</b><strong>{weatherText(day.code)}</strong></div>
            <span>高 {day.max}°／低 {day.min}°</span><span>降雨 {day.rainProbability}%</span>
            <span>日出 {new Date(day.sunrise).toLocaleTimeString("zh-TW", { hour: "2-digit", minute: "2-digit" })}</span>
            <span>日落 {new Date(day.sunset).toLocaleTimeString("zh-TW", { hour: "2-digit", minute: "2-digit" })}</span>
          </article>)}
        </div>
      </>}

      <div className="weatherAdvice"><b>跟團提醒</b><p>山區與湖區天氣變化快。即使降雨機率低，仍建議攜帶輕量防水外套。</p></div>
      <small className="sourceNote">資料來源：Open-Meteo。{updatedAt ? ` 最後更新：${updatedAt}` : ""}</small>
    </section>
  );
}
