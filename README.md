# Travel ME Ultimate

Travel ME 是針對紐西蘭跟團旅行打造的行動旅遊助手。

## 目前功能
- Today 今日首頁
- 行程、地圖、集合點與導航
- 7 日天氣、濕度、體感與穿搭建議
- 景點歷史預習
- Photo Guide Pro 與 Instagram 標籤搜尋
- Gemini AI 購物、酒類、翻譯、景點、收據與照片評分
- 購物車、預算、行李重量、收藏與旅行日誌
- 本機每日 AI 使用量提示

## 專案結構
- `app/`：Next.js App Router 與 API
- `components/`：前端 UI
- `lib/`：共用函式
- `public/`：PWA 靜態資源

## Vercel 環境變數
- `GEMINI_API_KEY`
- `GEMINI_MODEL`

請勿將 API Key 寫入 GitHub。
