import type { Product } from "../../types/travel";

export const nzProducts: Product[] = [
  { name: "Whittaker's 巧克力", category: "巧克力", nzdMin: 5.5, nzdMax: 8.5, twdRef: 260, weight: 0.25, stars: 5, note: "超市常見，適合大量送禮；先比較促銷口味。", days: [1, 2, 7, 9, 10] },
  { name: "Comvita / Manuka Health 麥蘆卡蜂蜜", category: "蜂蜜", nzdMin: 25, nzdMax: 95, twdRef: 2200, weight: 0.5, stars: 5, note: "先看 UMF/MGO 等級與包裝重量；玻璃罐較重。", days: [1, 7, 9, 10] },
  { name: "Anchor / Mainland 起司", category: "起司", nzdMin: 6, nzdMax: 16, twdRef: 420, weight: 0.5, stars: 4, note: "適合旅途中食用；注意冷藏與最新入境規定。", days: [1, 2, 7, 9, 10] },
  { name: "Cookie Time", category: "餅乾", nzdMin: 4, nzdMax: 12, twdRef: 350, weight: 0.4, stars: 4, note: "Queenstown 專門店適合補貨，禮盒注意體積。", days: [7, 9] },
  { name: "Pic's 花生醬", category: "食品", nzdMin: 7, nzdMax: 13, twdRef: 450, weight: 0.38, stars: 4, note: "口味自然但罐裝偏重，建議控制數量。", days: [1, 7, 9, 10] },
  { name: "Antipodes 保養品", category: "保養", nzdMin: 18, nzdMax: 65, twdRef: 1600, weight: 0.2, stars: 4, note: "藥妝店或百貨比價，注意液體容量。", days: [1, 7, 9, 10] },
  { name: "Trilogy 玫瑰果油", category: "保養", nzdMin: 22, nzdMax: 55, twdRef: 1450, weight: 0.08, stars: 4, note: "重量低、送禮方便，促銷時更值得。", days: [1, 7, 9, 10] },
  { name: "Icebreaker 美麗諾羊毛", category: "服飾", nzdMin: 70, nzdMax: 220, twdRef: 4800, weight: 0.35, stars: 5, note: "試穿後再買，折扣店或季末價差較明顯。", days: [1, 7, 9, 10] },
  { name: "Macpac 戶外服飾", category: "服飾", nzdMin: 60, nzdMax: 260, twdRef: 5200, weight: 0.65, stars: 5, note: "Queenstown、Christchurch 門市適合比價。", days: [7, 9] },
  { name: "Merino Possum 羊毛圍巾", category: "服飾", nzdMin: 45, nzdMax: 120, twdRef: 3000, weight: 0.18, stars: 5, note: "重量低、送禮方便，注意成分比例與產地。", days: [1, 7, 9, 10] },
  { name: "All Blacks 紀念服飾", category: "紀念品", nzdMin: 30, nzdMax: 130, twdRef: 2600, weight: 0.35, stars: 4, note: "官方授權款較適合送禮，購買前確認尺寸。", days: [1, 7, 9, 10] },
  { name: "麥蘆卡蜂蜜喉糖", category: "食品", nzdMin: 6, nzdMax: 18, twdRef: 480, weight: 0.12, stars: 4, note: "比蜂蜜罐更輕，適合多人送禮。", days: [1, 2, 7, 9, 10] }
];
