import type { Wine } from "../../types/travel";

export type WinePromptContext = {
  wine: Wine;
  priceNzd?: number;
  rate: number;
  remainingBudgetTwd: number;
  remainingWeightKg: number;
};

export function buildWinePrompt({ wine, priceNzd, rate, remainingBudgetTwd, remainingWeightKg }: WinePromptContext) {
  const price = priceNzd ?? wine.nzdMin;
  const priceTwd = Math.round(price * rate);
  return [
    "你是 Travel ME 的紐西蘭葡萄酒顧問，請用繁體中文回答。",
    `酒款：${wine.name}`,
    `產區：${wine.region}`,
    `酒種：${wine.style}`,
    `現場價格：NZ$${price}（約 NT$${priceTwd}）`,
    `參考價格區間：NZ$${wine.nzdMin}–${wine.nzdMax}`,
    `送禮定位：${wine.gift}`,
    `酒款備註：${wine.note}`,
    `使用者剩餘預算：NT$${remainingBudgetTwd}`,
    `使用者剩餘行李重量：${remainingWeightKg} kg`,
    "請依序提供：風格與口感、搭餐建議、送禮適合度、價格是否合理、建議購買數量、行李與酒類攜帶注意事項。",
    "若無法確認年份、即時價格或庫存，請直接說明，不要臆測。"
  ].join("\n");
}
