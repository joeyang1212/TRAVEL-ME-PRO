import type { WeatherHour } from "../../types/travel";

type ClothingAdviceProps = {
  current?: WeatherHour;
};

function buildAdvice(current?: WeatherHour) {
  if (!current) return ["預報載入後顯示穿搭建議"];

  const advice: string[] = [];
  if (current.apparent <= 5) advice.push("羽絨或厚保暖外套");
  else if (current.apparent <= 10) advice.push("保暖中層＋防風外套");
  else if (current.apparent <= 16) advice.push("長袖＋薄外套");
  else advice.push("透氣上衣，早晚備薄外套");

  if (current.rainProbability >= 40) advice.push("輕量防水外套／雨衣");
  if (current.humidity >= 80) advice.push("快乾衣物與鏡頭布");
  if (current.humidity <= 40) advice.push("護唇膏與保濕用品");
  advice.push("帽子、太陽眼鏡與防曬");

  return advice;
}

export function ClothingAdvice({ current }: ClothingAdviceProps) {
  const advice = buildAdvice(current);

  return (
    <article className="clothingPanel">
      <div className="sectionHead">
        <div><h2>🧥 今日穿搭建議</h2><p>依溫度、體感、濕度與降雨判斷</p></div>
      </div>
      <div className="clothingWeather">
        <strong>{current ? `${current.temperature}°C／體感 ${current.apparent}°C` : "等待預報"}</strong>
        <span>{current ? `濕度 ${current.humidity}%｜降雨 ${current.rainProbability}%` : ""}</span>
      </div>
      <ul>{advice.map((item) => <li key={item}>{item}</li>)}</ul>
      <small>山區與湖區風勢會讓體感更低，建議使用洋蔥式穿法。</small>
    </article>
  );
}
