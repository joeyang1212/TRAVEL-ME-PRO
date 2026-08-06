# Travel ME Ultimate Architecture

## 目標

將目前集中在 `components/TravelApp.tsx` 的功能，逐步拆成可維護、可測試、可跨國家重用的模組，同時保持每次 Pull Request 都能部署。

## 目錄責任

```text
app/                 Next.js 路由與 API
components/          UI 元件
  today/             今日首頁
  weather/           氣象、濕度、穿搭
  meeting/           跟團集合點與倒數
  photo/             拍照攻略、任務、AI 評分
  shopping/          商品、購物車、預算與重量
  wine/              酒款資料與顧問
  history/           行前景點預習
  journal/           旅行日誌
data/                 靜態內容與國家資料
  ai/                AI 模式設定
  nz/                紐西蘭行程與資料庫
services/             外部服務存取
  weather/           Open-Meteo
  gemini/            Gemini API
  maps/               地圖與座標工具
types/                共用 TypeScript 型別
hooks/                可重用 React hooks
utils/                純函式工具
```

## 重構原則

1. 不一次重寫整個 App。
2. 每個 PR 只移動一個領域，避免功能回歸。
3. 靜態資料與 UI 分離。
4. 外部 API 只能透過 `services/` 呼叫。
5. 共用型別集中於 `types/`。
6. 每次 PR 必須先通過 Vercel Preview，再合併到 `main`。

## 分階段計畫

### Phase 1：基礎層
- 共用型別
- 紐西蘭行程資料
- AI 模式設定
- Open-Meteo service

### Phase 2：Today 與 Weather
- `TodayDashboard`
- `WeatherForecast`
- `ClothingAdvice`
- `useWeatherForecast`

### Phase 3：Shopping 與 Wine
- 商品與酒款資料外移
- 購物車狀態 hook
- 預算與行李計算工具

### Phase 4：Photo、History、Journal
- 拍照攻略元件
- 景點預習資料
- 日誌 localStorage hook

### Phase 5：雲端同步
- 登入
- Supabase schema
- 同行共享
- 跨裝置同步
