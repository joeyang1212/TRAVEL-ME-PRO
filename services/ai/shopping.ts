import type { Product } from "../../types/travel";

export type ShoppingPromptContext = {
  product: Product;
  priceNzd?: number;
  rate: number;
  remainingBudgetTwd: number;
  remainingWeightKg: number;
};

export function buildShoppingPrompt({ product, priceNzd, rate, remainingBudgetTwd, remainingWeightKg }: ShoppingPromptContext) {
  const price = priceNzd ?? product.nzdMin;
  const priceTwd = Math.round(price * rate);
  return [
    "你是 Travel ME 的紐西蘭購物顧問，請用繁體中文回答。",
    `商品：${product.name}`,
    `分類：${product.category}`,
    `現場價格：NZ$${price}（約 NT$${priceTwd}）`,
    `參考價格區間：NZ$${product.nzdMin}–${product.nzdMax}`,
    `台灣參考價：約 NT$${product.twdRef}`,
    `預估重量：${product.weight} kg`,
    `使用者剩餘預算：NT$${remainingBudgetTwd}`,
    `使用者剩餘行李重量：${remainingWeightKg} kg`,
    `商品備註：${product.note}`,
    "請依序提供：是否值得買、價格判斷、建議購買數量、送禮或自用建議、行李與入境注意事項。",
    "若資料不足，請明確說明，不要假裝知道即時庫存或促銷。"
  ].join("\n");
}
