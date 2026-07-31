# Travel ME v6

此版本已修正先前 Vercel Build 的 TypeScript 錯誤，並加入：

- AI 購物顧問
- AI 酒類顧問
- AI 翻譯
- AI 景點介紹
- AI 收據辨識
- GPS 與免 API Key 即時天氣
- 預算與行李重量
- 收藏紀錄
- Google 登入架構
- PWA manifest

## 最快部署

1. 將 ZIP 解壓縮。
2. 將全部檔案覆蓋上傳至 GitHub repository 根目錄。
3. Vercel 會自動重新部署。
4. 在 Vercel → Environment Variables 設定：
   - `OPENAI_API_KEY`
   - `OPENAI_MODEL` = `gpt-4.1-mini`
5. 重新部署一次。

Google 登入可稍後設定，不影響 AI、GPS、天氣、預算及收藏功能。

## Google 登入選用設定

設定：
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`

並在 Supabase Authentication 啟用 Google Provider。
