"use client";

import { useEffect, useMemo, useState } from "react";

type Mode = "shopping" | "wine" | "translate" | "guide" | "receipt" | "photo";
type Favorite = { id: string; title: string; note: string; createdAt: string };
type CartItem = {
  id: string;
  name: string;
  category: string;
  qty: number;
  unitPriceNzd: number;
  unitWeightKg: number;
  bought: boolean;
};
type PhotoTask = {
  key: string;
  done: boolean;
  favorite: boolean;
};
type WeatherHour = { time:string; temperature:number; humidity:number; apparent:number; rainProbability:number; weatherCode:number };
type WeatherDay = { date:string; code:number; max:number; min:number; rainProbability:number; sunrise:string; sunset:string };
type JournalEntry = { id:string; day:number; date:string; mood:string; note:string; spendTwd:number; photos:number };
type HistoryGuide = {
  day: number;
  place: string;
  era: string;
  intro: string;
  formation: string;
  history: string[];
  lookFor: string[];
  quickFacts: string[];
};
type Product = {
  name: string;
  category: string;
  nzdMin: number;
  nzdMax: number;
  twdRef: number;
  weight: number;
  stars: number;
  note: string;
  days: number[];
};
type Wine = {
  name: string;
  region: string;
  style: string;
  nzdMin: number;
  nzdMax: number;
  gift: string;
  note: string;
};

const modes: Record<Mode, { icon: string; title: string; subtitle: string; placeholder: string }> = {
  shopping: { icon: "🛍️", title: "AI 購物顧問", subtitle: "價格、CP 值、預算與重量", placeholder: "例如：售價 NZ$16.99，值得買嗎？" },
  wine: { icon: "🍷", title: "AI 酒類顧問", subtitle: "酒款、搭餐與帶回建議", placeholder: "例如：這瓶酒適合送禮嗎？建議帶幾瓶？" },
  translate: { icon: "🌐", title: "AI 翻譯", subtitle: "菜單、標籤、成分與警告", placeholder: "例如：請完整翻譯並整理過敏原與注意事項。" },
  guide: { icon: "🏞️", title: "AI 景點介紹", subtitle: "歷史、拍照與停留建議", placeholder: "例如：最佳拍照位置與建議停留時間？" },
  receipt: { icon: "🧾", title: "AI 收據辨識", subtitle: "金額、品項、幣別與分類", placeholder: "例如：請整理品項與總金額，並換算成台幣。" },
  photo: { icon: "📸", title: "AI 照片評分", subtitle: "構圖、光線、站位與重拍建議", placeholder: "例如：人物要往哪裡移、手機要抬高或降低多少？" }
};

const itinerary = [
  { title: "台北 → 奧克蘭", city: "Auckland", lat: -36.8509, lng: 174.7645 },
  { title: "奧克蘭 → 基督城 → 凱庫拉", city: "Kaikōura", lat: -42.4008, lng: 173.6814 },
  { title: "賞鯨 → 漢默溫泉", city: "Hanmer Springs", lat: -42.5228, lng: 172.8294 },
  { title: "Monteith 酒廠 → 千層岩", city: "Greymouth", lat: -42.4504, lng: 171.2108 },
  { title: "樹冠步道 → 霍基蒂卡 → 福克斯冰河", city: "Franz Josef", lat: -43.3896, lng: 170.1833 },
  { title: "馬瑟森湖 → 瓦納卡", city: "Wānaka", lat: -44.6949, lng: 169.1417 },
  { title: "Cromwell → Kinross → 箭鎮 → 皇后鎮", city: "Queenstown", lat: -45.0312, lng: 168.6626 },
  { title: "米佛峽灣飛行 → 普卡基湖 → 蒂卡波", city: "Lake Tekapo", lat: -44.0047, lng: 170.4771 },
  { title: "庫克山 → 好牧羊人教堂 → 基督城", city: "Christchurch", lat: -43.5321, lng: 172.6362 },
  { title: "羊駝牧場 → 阿卡羅阿 → 奧克蘭", city: "Auckland", lat: -36.8509, lng: 174.7645 },
  { title: "返回台灣", city: "Auckland Airport", lat: -37.0082, lng: 174.7850 }
];

const products: Product[] = [
  { name: "Whittaker's 巧克力", category: "巧克力", nzdMin: 5.5, nzdMax: 8.5, twdRef: 260, weight: 0.25, stars: 5, note: "超市最實用伴手禮，先確認口味與促銷。", days: [1,2,7,9,10] },
  { name: "Comvita / Manuka Health 麥蘆卡蜂蜜", category: "蜂蜜", nzdMin: 25, nzdMax: 95, twdRef: 2200, weight: 0.5, stars: 5, note: "看 UMF/MGO 等級；玻璃罐較重。", days: [1,7,9,10] },
  { name: "Anchor / Mainland 起司", category: "起司", nzdMin: 6, nzdMax: 16, twdRef: 420, weight: 0.5, stars: 4, note: "需注意冷藏與入境規定，適合旅途中吃。", days: [1,2,7,9,10] },
  { name: "Cookie Time", category: "餅乾", nzdMin: 4, nzdMax: 12, twdRef: 350, weight: 0.4, stars: 4, note: "Queenstown 有專門店，禮盒注意體積。", days: [7,9] },
  { name: "Pic's 花生醬", category: "食品", nzdMin: 7, nzdMax: 13, twdRef: 450, weight: 0.38, stars: 4, note: "口味自然但罐裝偏重，建議限量。", days: [1,7,9,10] },
  { name: "Fix & Fogg 花生醬", category: "食品", nzdMin: 8, nzdMax: 15, twdRef: 520, weight: 0.4, stars: 4, note: "適合自用；先看台灣是否容易買到。", days: [1,7,9,10] },
  { name: "Antipodes 保養品", category: "保養", nzdMin: 18, nzdMax: 65, twdRef: 1600, weight: 0.2, stars: 4, note: "藥妝店或百貨比價，注意液體容量。", days: [1,7,9,10] },
  { name: "Trilogy 玫瑰果油", category: "保養", nzdMin: 22, nzdMax: 55, twdRef: 1450, weight: 0.08, stars: 4, note: "重量低、送禮方便，促銷時更值得。", days: [1,7,9,10] },
  { name: "Icebreaker 美麗諾羊毛", category: "服飾", nzdMin: 70, nzdMax: 220, twdRef: 4800, weight: 0.35, stars: 5, note: "折扣店或季末價差較大，試穿後再買。", days: [1,7,9,10] },
  { name: "Macpac 戶外服飾", category: "服飾", nzdMin: 60, nzdMax: 260, twdRef: 5200, weight: 0.65, stars: 5, note: "皇后鎮、基督城門市適合比價。", days: [7,9] },
  { name: "Merino Possum 羊毛圍巾", category: "服飾", nzdMin: 45, nzdMax: 120, twdRef: 3000, weight: 0.18, stars: 5, note: "重量低、送禮方便，注意成分比例與產地。", days: [1,7,9,10] },
  { name: "Kathmandu 戶外用品", category: "服飾", nzdMin: 40, nzdMax: 220, twdRef: 4500, weight: 0.6, stars: 4, note: "折扣季較有價差，先比官網與門市。", days: [1,7,9,10] },
  { name: "All Blacks 紀念服飾", category: "紀念品", nzdMin: 30, nzdMax: 130, twdRef: 2600, weight: 0.35, stars: 4, note: "官方授權款較適合送禮，注意尺寸。", days: [1,7,9,10] },
  { name: "Aotea 護膚膏", category: "保養", nzdMin: 18, nzdMax: 45, twdRef: 1100, weight: 0.12, stars: 4, note: "適合乾燥氣候使用，先確認成分與過敏風險。", days: [1,7,9,10] },
  { name: "Linden Leaves 身體保養", category: "保養", nzdMin: 20, nzdMax: 65, twdRef: 1500, weight: 0.25, stars: 4, note: "包裝漂亮，適合送禮，液體需托運。", days: [1,7,9,10] },
  { name: "蜂膠喉糖", category: "食品", nzdMin: 8, nzdMax: 25, twdRef: 650, weight: 0.15, stars: 4, note: "輕量伴手禮，確認蜂製品成分與有效期限。", days: [1,2,7,9,10] },
  { name: "麥蘆卡蜂蜜喉糖", category: "食品", nzdMin: 6, nzdMax: 18, twdRef: 480, weight: 0.12, stars: 4, note: "比蜂蜜罐更輕，適合多人送禮。", days: [1,2,7,9,10] },
  { name: "Hokey Pokey 糖果", category: "糖果", nzdMin: 4, nzdMax: 12, twdRef: 320, weight: 0.2, stars: 4, note: "紐西蘭代表風味，注意高溫與易碎。", days: [1,2,7,9,10] },
  { name: "Pineapple Lumps", category: "糖果", nzdMin: 3.5, nzdMax: 8, twdRef: 240, weight: 0.18, stars: 4, note: "超市常見、價格低，適合補送禮數量。", days: [1,2,7,9,10] },
  { name: "ETA / Proper Crisps 洋芋片", category: "零食", nzdMin: 3, nzdMax: 7, twdRef: 180, weight: 0.15, stars: 3, note: "適合旅途中吃，不建議占用太多行李空間。", days: [1,2,7,9,10] },
  { name: "Lewis Road Creamery 巧克力牛奶", category: "飲品", nzdMin: 5, nzdMax: 9, twdRef: 220, weight: 0.75, stars: 4, note: "需冷藏，建議旅途中喝，不適合帶回台灣。", days: [1,2,7,9,10] },
  { name: "紐西蘭奶粉／乳製品", category: "食品", nzdMin: 18, nzdMax: 45, twdRef: 1100, weight: 1.0, stars: 3, note: "重量高，購買前確認台灣入境與個人需求。", days: [1,7,9,10] },
  { name: "Salmon Jerky 鮭魚乾", category: "食品", nzdMin: 12, nzdMax: 28, twdRef: 750, weight: 0.12, stars: 4, note: "高蛋白但需確認肉魚製品入境規定。", days: [6,7,8,9] },
  { name: "紐西蘭海鹽", category: "食品", nzdMin: 6, nzdMax: 18, twdRef: 420, weight: 0.3, stars: 3, note: "實用但較重，建議小包裝。", days: [1,7,9,10] },
  { name: "羊毛脂護手霜", category: "保養", nzdMin: 6, nzdMax: 20, twdRef: 420, weight: 0.1, stars: 4, note: "便宜輕量，適合大量送禮，注意香味。", days: [1,2,7,9,10] },
  { name: "羊毛脂護唇膏", category: "保養", nzdMin: 4, nzdMax: 12, twdRef: 280, weight: 0.04, stars: 4, note: "重量極低，適合小禮物。", days: [1,2,7,9,10] },
  { name: "Greenstone 翡翠飾品", category: "紀念品", nzdMin: 35, nzdMax: 300, twdRef: 5200, weight: 0.08, stars: 4, note: "確認材質、來源與工藝，不要只看外觀。", days: [4,5,7,9] },
  { name: "Pāua Shell 飾品", category: "紀念品", nzdMin: 15, nzdMax: 90, twdRef: 1800, weight: 0.08, stars: 4, note: "適合送禮，注意易碎與真偽。", days: [4,5,7,9] },
  { name: "紐西蘭羊毛毯", category: "家居", nzdMin: 90, nzdMax: 350, twdRef: 7500, weight: 1.6, stars: 4, note: "品質佳但體積重量高，需保留行李空間。", days: [1,7,9,10] },
  { name: "Rotorua Mud 泥膜", category: "保養", nzdMin: 12, nzdMax: 38, twdRef: 900, weight: 0.2, stars: 3, note: "旅遊紀念性高，確認膚質適用性。", days: [1,10] },
  { name: "Kiwifruit 奇異果乾", category: "食品", nzdMin: 7, nzdMax: 18, twdRef: 450, weight: 0.2, stars: 4, note: "易攜帶，但糖分與單價需注意。", days: [1,2,7,9,10] },
  { name: "Feijoa 相關零食", category: "食品", nzdMin: 5, nzdMax: 16, twdRef: 380, weight: 0.2, stars: 4, note: "紐西蘭特色水果風味，適合嘗鮮。", days: [1,2,7,9,10] },
  { name: "ANZAC Biscuits", category: "餅乾", nzdMin: 4, nzdMax: 12, twdRef: 300, weight: 0.3, stars: 4, note: "具歷史特色，適合送禮與旅途點心。", days: [1,2,7,9,10] }
];

const wines: Wine[] = [
  { name: "Cloudy Bay Sauvignon Blanc", region: "Marlborough", style: "清爽白酒", nzdMin: 35, nzdMax: 55, gift: "送禮佳", note: "辨識度高，適合海鮮；先比較超市與酒莊價格。" },
  { name: "Felton Road Pinot Noir", region: "Central Otago", style: "黑皮諾紅酒", nzdMin: 65, nzdMax: 110, gift: "高階送禮", note: "Central Otago 代表酒款，價格高、需防撞。" },
  { name: "Craggy Range Te Muna Sauvignon Blanc", region: "Martinborough", style: "白酒", nzdMin: 25, nzdMax: 42, gift: "送禮佳", note: "風格乾淨，CP 值通常不錯。" },
  { name: "Villa Maria Private Bin", region: "Marlborough", style: "白酒", nzdMin: 15, nzdMax: 25, gift: "日常自飲", note: "超市常見，適合價格敏感型購買。" },
  { name: "Mt Difficulty Pinot Noir", region: "Central Otago", style: "黑皮諾紅酒", nzdMin: 42, nzdMax: 70, gift: "送禮佳", note: "Day 7 Central Otago 路線特別適合找。" },
  { name: "Kinross 酒莊系列", region: "Gibbston", style: "酒莊選品", nzdMin: 35, nzdMax: 85, gift: "旅程紀念", note: "你 Day 7 會到 Kinross，可現場試飲後決定。" },
  { name: "Dog Point Sauvignon Blanc", region: "Marlborough", style: "白酒", nzdMin: 28, nzdMax: 45, gift: "送禮佳", note: "風格集中、酸度明亮，適合海鮮。" },
  { name: "Greywacke Sauvignon Blanc", region: "Marlborough", style: "白酒", nzdMin: 27, nzdMax: 44, gift: "懂酒送禮", note: "風格較細緻，適合想避開大眾品牌者。" },
  { name: "Rippon Mature Vine Pinot Noir", region: "Wānaka", style: "黑皮諾紅酒", nzdMin: 75, nzdMax: 120, gift: "高階送禮", note: "Day 6 Wānaka 路線具代表性，價格較高。" },
  { name: "Prophet's Rock Pinot Noir", region: "Central Otago", style: "黑皮諾紅酒", nzdMin: 55, nzdMax: 90, gift: "送禮佳", note: "Central Otago 特色鮮明，適合紅酒愛好者。" },
  { name: "Gibbston Valley Pinot Noir", region: "Gibbston", style: "黑皮諾紅酒", nzdMin: 38, nzdMax: 68, gift: "旅程紀念", note: "Day 7 鄰近產區，試飲後再選年份與系列。" },
  { name: "Amisfield Pinot Noir", region: "Central Otago", style: "黑皮諾紅酒", nzdMin: 45, nzdMax: 80, gift: "送禮佳", note: "皇后鎮周邊知名酒莊，餐酒搭配表現好。" },
  { name: "Pegasus Bay Riesling", region: "Waipara", style: "麗絲玲白酒", nzdMin: 28, nzdMax: 48, gift: "特色送禮", note: "可甜可乾，購買時注意甜度標示。" },
  { name: "Te Mata Estate Syrah", region: "Hawke's Bay", style: "希哈紅酒", nzdMin: 25, nzdMax: 48, gift: "送禮佳", note: "不是南島產區，但在大型酒鋪可找到。" },
  { name: "Ata Rangi Pinot Noir", region: "Martinborough", style: "黑皮諾紅酒", nzdMin: 65, nzdMax: 105, gift: "高階送禮", note: "紐西蘭代表性黑皮諾之一。" },
  { name: "Oyster Bay Sauvignon Blanc", region: "Marlborough", style: "白酒", nzdMin: 14, nzdMax: 24, gift: "日常自飲", note: "超市常見，價格合理但台灣也容易買到。" },
  { name: "Kim Crawford Sauvignon Blanc", region: "Marlborough", style: "白酒", nzdMin: 16, nzdMax: 28, gift: "日常自飲", note: "品牌辨識度高，是否值得帶要看現場促銷。" },
  { name: "Saint Clair Pioneer Block", region: "Marlborough", style: "白酒", nzdMin: 25, nzdMax: 45, gift: "送禮佳", note: "單一園系列，適合比較不同區塊風格。" },
  { name: "Kumeu River Chardonnay", region: "Auckland", style: "夏多內白酒", nzdMin: 35, nzdMax: 75, gift: "懂酒送禮", note: "Day 1/10 Auckland 可留意，風格偏經典。" },
  { name: "Esk Valley Merlot Cabernet", region: "Hawke's Bay", style: "紅酒", nzdMin: 18, nzdMax: 35, gift: "日常自飲", note: "價格親民，適合想買非黑皮諾紅酒者。" }
];

const dayTips: Record<number, string[]> = {
  1: ["抵達日先不要大量購物，確認行李與轉機安排。", "Auckland 可先看超市價格作為後續比價基準。"],
  2: ["Kaikōura 以海景與賞鯨為主，伴手禮先少量。", "長途移動日注意補充零食與飲水。"],
  3: ["Hanmer Springs 行程偏休閒，注意保暖與防水用品。"],
  4: ["Monteith 酒廠可試飲，但不要只因現場氣氛衝動購買。", "Pancake Rocks 周邊以景點紀念品為主。"],
  5: ["Hokitika 適合看 Greenstone 與 Pāua 飾品，確認來源與工藝。"],
  6: ["Wānaka 可留意 Rippon 等產區酒款。", "玻璃瓶購買後立即加入行李重量。"],
  7: ["Kinross 先試飲再買，避免只看品牌。", "Queenstown 適合集中購買 Cookie Time、戶外服飾與超市商品。"],
  8: ["飛行與長途移動日，避免新增大量易碎品。", "Tekapo 夜間溫差大，保暖用品優先。"],
  9: ["Christchurch 是補買大型連鎖商品的重要一天。", "離回程近，開始檢查總重量與酒類數量。"],
  10: ["Auckland 最後補貨，優先買清單中尚未取得的輕量品。", "不要在機場才大量購買高單價商品。"],
  11: ["出發前再次確認托運、液體、酒類與食品申報。"]
};


type PhotoSpot = {
  day:number; place:string; title:string; image:string; source:string;
  lat:number; lng:number; lens:string; photographer:string; subject:string;
  light:string; duration:string; pose:string; steps:string[];
  popularity:number; styles:string[]; hashtags:string[]; reasons:string[]; diagram:string;
};
const historyGuides: HistoryGuide[] = [
  {
    day: 2,
    place: "Kaikōura",
    era: "毛利文化、捕鯨史與海洋生態",
    intro: "Kaikōura 位於高山與太平洋之間，名稱常被解釋為「吃龍蝦／小龍蝦的餐食」。這裡因近岸深海地形、洋流與豐富食物鏈，成為賞鯨與海洋生態的重要據點。",
    formation: "海岸外不遠處即進入深水海溝環境，深層海水上湧帶來營養鹽，形成魚類、魷魚、海豚與抹香鯨聚集的條件。",
    history: [
      "毛利人很早便在此活動與採集海產。",
      "歐洲移民時期曾發展岸上捕鯨與漁業。",
      "現代 Kaikōura 轉型為以賞鯨、海豚與自然保育為主的旅遊地。"
    ],
    lookFor: ["山脈幾乎貼近海岸的景觀", "海岸岩礁與海鳥", "賞鯨活動如何結合在地毛利文化"],
    quickFacts: ["適合先了解抹香鯨與上湧流", "海況可能影響賞鯨班次", "景觀特色是『雪山＋海洋』同框"]
  },
  {
    day: 3,
    place: "Hanmer Springs",
    era: "地熱溫泉與高地療養小鎮",
    intro: "Hanmer Springs 以天然溫泉與高地森林環境聞名，早期便因地熱泉水而成為療養與休閒地。",
    formation: "地下水沿斷層與裂隙深入地底受熱，再回到地表形成溫泉。南島活躍的地質構造是溫泉形成的重要背景。",
    history: [
      "19 世紀後期開始發展公共浴場與療養設施。",
      "之後逐步成為南島重要的度假與戶外活動小鎮。"
    ],
    lookFor: ["不同溫度與礦物特色的池區", "周圍森林與山谷地形", "溫泉鎮的歐式度假氛圍"],
    quickFacts: ["泡湯前補充水分", "冬季室外溫差較大", "跟團自由時間要預留更衣與集合時間"]
  },
  {
    day: 4,
    place: "Punakaiki Pancake Rocks",
    era: "石灰岩地形與海蝕作用",
    intro: "千層岩因薄層石灰岩外觀像一疊鬆餅而得名，是西海岸最具代表性的地質景觀之一。",
    formation: "海底沉積物經壓實與抬升形成石灰岩；不同硬度層受風化、雨水與海浪侵蝕，逐漸形成層狀外觀、海蝕洞與噴水孔。",
    history: [
      "景觀是長期海洋沉積、板塊抬升與海蝕共同作用的結果。",
      "步道設計讓旅客可以安全觀察噴水孔與岩層。"
    ],
    lookFor: ["像鬆餅般的薄層岩石", "海蝕洞與垂直裂縫", "漲潮和大浪時可能出現的 blowhole"],
    quickFacts: ["噴水孔效果受潮汐與浪況影響", "雨天步道較滑", "不要跨越欄杆靠近海蝕邊緣"]
  },
  {
    day: 5,
    place: "Hokitika",
    era: "西海岸淘金、玉石與港口小鎮",
    intro: "Hokitika 在 1860 年代西海岸淘金熱中迅速成長，後來以 pounamu（綠玉）、工藝與海岸景觀聞名。",
    formation: "城鎮位於河流出海口與西海岸沖積平原，河川把山區礦物與礫石帶到海岸。",
    history: [
      "淘金熱時期曾是繁忙港口和商業中心。",
      "pounamu 對毛利文化具有重要意義，並非只是一般紀念品。",
      "現今以工藝工作室、海灘與西海岸文化吸引旅客。"
    ],
    lookFor: ["工藝店對 pounamu 來源與雕刻意義的說明", "海灘漂流木藝術", "老港口城市的街道尺度"],
    quickFacts: ["購買綠玉應確認來源與材質", "不要把所有綠色石頭都當作 pounamu", "適合購買小型、輕量、有來源證明的作品"]
  },
  {
    day: 5,
    place: "Franz Josef Glacier",
    era: "南阿爾卑斯山冰河地形",
    intro: "Franz Josef Glacier／Kā Roimata o Hine Hukatere 是少數從高山冰雪區快速下降到溫帶雨林附近的冰河。",
    formation: "高山積雪受重力壓密成冰，冰體沿山谷緩慢流動並侵蝕谷地。降雪、氣溫與降雨變化會影響冰河長度和厚度。",
    history: [
      "毛利名稱與 Hine Hukatere 的傳說相關。",
      "19 世紀歐洲探險者與測量者為其留下 Franz Josef 的名稱。",
      "近代冰河前緣位置變動明顯，步道與觀景方式也隨安全條件調整。"
    ],
    lookFor: ["U 形谷與冰河搬運留下的岩石", "雨林和冰河並存的強烈對比", "舊冰河前緣標示"],
    quickFacts: ["不可自行進入冰河危險區", "天候可快速變化", "步道開放狀態需以現場公告為準"]
  },
  {
    day: 6,
    place: "Lake Matheson",
    era: "冰河湖與倒影景觀",
    intro: "Lake Matheson 以映照 Aoraki／Mt Cook 與 Mt Tasman 的倒影聞名，是西海岸經典風景之一。",
    formation: "湖泊形成於冰河退縮後留下的地形凹地，湖水中的有機物使水色偏深，在無風時能形成鏡面般倒影。",
    history: [
      "湖區屬於傳統毛利活動範圍。",
      "現代步道與觀景台把它發展為重要自然景點。"
    ],
    lookFor: ["無風時的雪山倒影", "湖畔原生森林", "不同觀景台構圖差異"],
    quickFacts: ["清晨通常風較小", "不是每天都看得到完整倒影", "步道可能濕滑"]
  },
  {
    day: 6,
    place: "Wānaka",
    era: "冰河湖、高地牧業與旅遊小鎮",
    intro: "Wānaka 位於同名冰河湖畔，早期是毛利季節性移動路線的一部分，後來發展高地牧業，今日則以戶外活動與湖景著名。",
    formation: "Lake Wānaka 是冰河侵蝕形成的湖盆，周圍山谷與湖岸保留明顯冰河地貌。",
    history: [
      "毛利人曾利用此區通行、採集與前往西海岸。",
      "歐洲移民時期發展牧場與小型聚落。",
      "20 世紀後逐漸成為滑雪、健行與休閒旅遊中心。"
    ],
    lookFor: ["湖盆與周圍山脈關係", "That Wānaka Tree 的湖岸位置", "小鎮如何結合戶外生活與觀光"],
    quickFacts: ["湖岸風大時體感很低", "熱門拍攝點需尊重植被與水岸", "跟團時間有限時先拍湖景再逛街"]
  },
  {
    day: 7,
    place: "Cromwell",
    era: "淘金、果園與水庫新城",
    intro: "Cromwell 由淘金聚落、果園產業與水力發電工程共同塑造，是 Central Otago 的重要交通與農業節點。",
    formation: "城鎮位於 Kawarau 與 Clutha/Mata-Au 河流交會附近，乾燥內陸氣候與河階地形適合果樹與葡萄栽培。",
    history: [
      "1860 年代淘金熱帶動聚落發展。",
      "20 世紀 Clyde Dam 興建後，舊城部分區域被 Lake Dunstan 淹沒。",
      "部分歷史建築被遷移保存，形成 Cromwell Heritage Precinct。"
    ],
    lookFor: ["乾燥內陸地貌", "果園與葡萄園", "舊城保存區與新城規劃的差異"],
    quickFacts: ["巨大水果雕塑象徵果園產業", "老城區適合短時間散步", "Central Otago 日夜溫差明顯"]
  },
  {
    day: 7,
    place: "Gibbston / Kinross",
    era: "淘金後的 Central Otago 葡萄酒文化",
    intro: "Gibbston 位於狹長山谷中，被稱為 Valley of the Vines，是 Central Otago 黑皮諾的重要產區之一。",
    formation: "乾燥內陸氣候、強烈日照、涼爽夜晚與片岩土壤，形成適合黑皮諾與芳香型白葡萄的條件。",
    history: [
      "Central Otago 的葡萄栽培可追溯到 19 世紀淘金時期。",
      "現代產業在 1980 年代由少數先驅重新建立。",
      "Gibbston Valley 在 1987 年推出首批商業黑皮諾，帶動區域知名度。"
    ],
    lookFor: ["片岩山坡與葡萄園的距離", "酒莊如何利用冷涼氣候", "黑皮諾、灰皮諾與麗絲玲風格差異"],
    quickFacts: ["試飲後再買，不只看品牌", "酒莊限定與超市常見款要分開比較", "每瓶含包裝通常約 1.2–1.5 kg"]
  },
  {
    day: 7,
    place: "Arrowtown",
    era: "1860 年代 Otago 淘金熱",
    intro: "Arrowtown 是保存良好的淘金小鎮，沿 Arrow River 發展，街道、石造建築與華人礦工聚落仍保留歷史痕跡。",
    formation: "Arrow River 河床沉積金礦吸引大量礦工，谷地地形使聚落沿河與主街集中發展。",
    history: [
      "1862 年發現黃金後，大批礦工迅速湧入。",
      "華人礦工在淘金熱後期來到此地，生活條件艱困。",
      "今日小鎮被列為重要文化遺產地景。"
    ],
    lookFor: ["Buckingham Street 的歷史立面", "Chinese Settlement 的簡樸建築", "Arrow River 與淘金活動的關係"],
    quickFacts: ["不是只有漂亮老街，華人礦工史也很重要", "博物館可快速建立背景", "秋季樹色是現代觀光形象的一部分"]
  },
  {
    day: 7,
    place: "Queenstown",
    era: "毛利季節性活動、牧場、淘金與全球觀光",
    intro: "Queenstown 位於 Lake Whakatipu 湖畔，毛利名稱 Tāhuna 指涉淺灣地形。19 世紀先有高地牧場，之後因 Shotover River 淘金迅速成長。",
    formation: "Lake Whakatipu 是冰河作用形成的深長湖泊，周圍山地和谷地塑造了今日的城市景觀。",
    history: [
      "毛利人曾在此季節性移動、採集與尋找 pounamu。",
      "1860 年前後歐洲牧場主進入此區。",
      "1862 年附近發現黃金，聚落快速擴大。",
      "淘金衰退後，城市逐步轉型為景觀與冒險旅遊中心。"
    ],
    lookFor: ["湖岸與城市核心的關係", "遠眺 Remarkables 山脈", "淘金時代如何影響周邊聚落"],
    quickFacts: ["Queenstown 約在 1863 年形成城市規模", "城市前身曾被稱為 Camptown", "現代形象是冒險活動與景觀旅遊"]
  },
  {
    day: 8,
    place: "Milford Sound / Piopiotahi",
    era: "冰河峽灣與毛利傳說",
    intro: "Milford Sound 雖名為 Sound，地質上其實是冰河雕刻形成的 fjord。毛利名稱 Piopiotahi 與傳說及已滅絕的 piopio 鳥相關。",
    formation: "冰河沿山谷向海移動，侵蝕出陡峭 U 形谷；冰河退縮與海水進入後形成深水峽灣。大量降雨造就瀑布與濃密雨林。",
    history: [
      "毛利人早已知道並通行此地。",
      "歐洲航海者最初因入口隱蔽而忽略它。",
      "後來成為 Fiordland 代表景觀與世界遺產區的重要部分。"
    ],
    lookFor: ["近乎垂直的岩壁", "雨後大量臨時瀑布", "Mitre Peak 的辨識角度"],
    quickFacts: ["下雨不是壞事，瀑布反而更壯觀", "飛行活動高度依賴天候", "峽灣環境變化快"]
  },
  {
    day: 8,
    place: "Lake Pukaki",
    era: "冰河湖與乳藍色水體",
    intro: "Lake Pukaki 是 Mackenzie Basin 的大型冰河湖，以乳藍色湖水與 Aoraki／Mt Cook 遠景著名。",
    formation: "冰河磨碎岩石形成極細的 rock flour 懸浮在湖水中，散射光線後呈現特殊藍綠色。",
    history: [
      "湖泊原為冰河地形的一部分。",
      "20 世紀水力發電工程提高了湖面並把它納入 Waitaki hydro system。"
    ],
    lookFor: ["湖水顏色隨光線改變", "Aoraki 方向的山景", "湖岸冰河堆積地形"],
    quickFacts: ["陰天湖色仍可能明顯", "風吹時湖面反光較強", "拍照以深色服裝最容易突出人物"]
  },
  {
    day: 8,
    place: "Lake Tekapo",
    era: "冰河湖、牧羊文化與暗空保育",
    intro: "Lake Tekapo 位於 Mackenzie Basin，以冰河湖色、好牧羊人教堂與夜空觀測聞名。",
    formation: "冰河侵蝕形成湖盆，岩粉讓湖水呈現藍綠色；乾燥高地氣候和低光害則使此區適合天文觀測。",
    history: [
      "Mackenzie Basin 名稱來自 19 世紀的 James Mckenzie 傳說。",
      "歐洲牧羊業塑造了地方聚落與景觀。",
      "現代以暗空保護、天文旅遊與湖景著名。"
    ],
    lookFor: ["湖色與乾燥高地草原對比", "教堂與牧羊犬紀念像", "光害管理對夜空的影響"],
    quickFacts: ["教堂是宗教場所，不只是拍照背景", "夜間請降低手機亮度", "冬季風寒明顯"]
  },
  {
    day: 9,
    place: "Aoraki / Mt Cook",
    era: "毛利祖先傳說、板塊抬升與登山史",
    intro: "Aoraki／Mt Cook 是紐西蘭最高峰，對 Ngāi Tahu 具有深厚文化意義，也是南阿爾卑斯山地質與登山史的象徵。",
    formation: "太平洋板塊與澳洲板塊碰撞，使南阿爾卑斯山持續抬升；冰河、崩塌與侵蝕同時不斷改造山體。",
    history: [
      "Aoraki 在 Ngāi Tahu 的創世與祖先故事中地位重要。",
      "19 世紀歐洲測量與登山活動逐漸增加。",
      "1894 年首次成功登頂，後來成為紐西蘭登山文化核心。"
    ],
    lookFor: ["山體抬升與冰河侵蝕的痕跡", "Hooker Valley 的冰河地貌", "雙語地名所代表的文化意義"],
    quickFacts: ["山區天氣變化快速", "步道開放依現場公告", "請尊重 Aoraki 的文化地位"]
  },
  {
    day: 9,
    place: "Church of the Good Shepherd",
    era: "1935 年牧羊先驅紀念教堂",
    intro: "好牧羊人教堂建於 1935 年，紀念 Mackenzie Country 的早期牧羊家庭，是一座仍在使用的小型教堂。",
    formation: "建築本身不是古老遺跡，而是刻意以當地石材和湖山景觀融合的紀念性建築。",
    history: [
      "由地方居民與教會推動興建。",
      "設計重點之一是讓祭壇窗直接框住湖泊與山景。",
      "後來成為 Lake Tekapo 最具代表性的地標。"
    ],
    lookFor: ["當地石材牆面", "教堂尺度與湖山景觀的比例", "祭壇窗框景概念"],
    quickFacts: ["請保持安靜並尊重禮拜活動", "不要阻擋入口", "遊客多時快速完成拍照後讓位"]
  },
  {
    day: 9,
    place: "Christchurch",
    era: "英國殖民城市、地震重建與花園城市",
    intro: "Christchurch／Ōtautahi 是南島最大城市之一，以英國殖民規劃、河畔花園、哥德式建築與地震後重建著名。",
    formation: "城市位於 Canterbury Plains 沖積平原，Avon／Ōtākaro River 穿越市區。",
    history: [
      "1850 年代 Canterbury Association 有計畫地建立英國移民城市。",
      "2010 與 2011 年地震嚴重改變城市中心。",
      "重建過程形成紙教堂、新公共空間與新舊並存的城市面貌。"
    ],
    lookFor: ["棋盤式街道與河流曲線", "震後保留、重建與新建建築", "毛利地名 Ōtautahi 在城市標示中的使用"],
    quickFacts: ["市中心仍可看到重建痕跡", "植物園與 Avon River 適合短時間散步", "教堂廣場是理解城市變遷的核心"]
  },
  {
    day: 10,
    place: "Akaroa",
    era: "古火山港灣、毛利歷史與法國移民",
    intro: "Akaroa 位於 Banks Peninsula 古火山地形內，是紐西蘭少數保留明顯法國移民色彩的城鎮。",
    formation: "Banks Peninsula 由古代火山活動形成，後來火山口與谷地被海水淹入，成為今日的港灣。",
    history: [
      "毛利人很早便在港灣周邊定居。",
      "1840 年代法國移民抵達，留下街名、建築與文化痕跡。",
      "英國主權建立後，Akaroa 仍保有獨特法式地方形象。"
    ],
    lookFor: ["法文街名 Rue Lavaud 等", "港灣地形像被海水填入的火山口", "法式建築與紐西蘭海港生活的融合"],
    quickFacts: ["法國影響是真實歷史，但城鎮不是完整法國殖民地", "博物館可快速補充背景", "港灣野生動物活動需尊重保育規範"]
  }
];

const photoSpots: PhotoSpot[] = [
{
  day:5,place:"Lake Matheson",title:"湖面倒影構圖",
  image:"https://commons.wikimedia.org/wiki/Special:Redirect/file/Lake_matheson.jpg?width=1200",
  source:"https://commons.wikimedia.org/wiki/File:Lake_matheson.jpg",
  lat:-43.4442,lng:169.9712,lens:"1×",photographer:"觀景台中央偏右",
  subject:"人物放右下三分之一，湖與山保留大面積",
  light:"清晨或風小時較容易出現倒影",duration:"10–15 分鐘",
  pose:"人物側身看湖面，手臂不要緊貼身體",
  steps:["手機保持水平，開啟格線","先拍無人風景，再補人物照","曝光稍降，保留天空與雪山細節"],
  popularity:91,styles:["倒影風景","人物背影","電影感"],
  hashtags:["lakematheson","foxglacier","newzealandtravel"],
  reasons:["雪山倒影辨識度高","橫幅與直幅都好構圖","適合人物小比例入鏡"],
  diagram:"🏔️  湖面倒影\n────────────\n      👤\n  📱 攝影者"
},
{
  day:7,place:"Arrowtown",title:"歷史老街人像",
  image:"https://commons.wikimedia.org/wiki/Special:Redirect/file/Arrowtown_street.jpg?width=1200",
  source:"https://commons.wikimedia.org/wiki/File:Arrowtown_street.jpg",
  lat:-44.9431,lng:168.8406,lens:"1× 或 2×",photographer:"Buckingham Street 對面人行道",
  subject:"人物站左或右三分之一，避免正中央擋住老街",
  light:"下午斜光較有層次；陰天也適合",duration:"10 分鐘",
  pose:"慢走、回頭或看櫥窗，比直立看鏡頭自然",
  steps:["用 2× 壓縮街景可減少路人干擾","手機高度約胸口","等待車輛與人群空檔連拍"],
  popularity:96,styles:["老街打卡","慢走回頭","情侶街拍"],
  hashtags:["arrowtown","arrowtownnz","buckinghamstreet"],
  reasons:["歷史街景色彩集中","秋季尤其受歡迎","2× 鏡頭可壓縮背景並減少雜亂"],
  diagram:"🏠🏠 老街背景\n 👤 → 慢走\n       📱 8m"
},
{
  day:7,place:"Queenstown",title:"湖景＋城市全景",
  image:"https://commons.wikimedia.org/wiki/Special:Redirect/file/NZL-wakatipu-queenstown.jpg?width=1200",
  source:"https://commons.wikimedia.org/wiki/File:NZL-wakatipu-queenstown.jpg",
  lat:-45.0271,lng:168.6538,lens:"0.5× 或 1×",photographer:"Skyline 觀景平台",
  subject:"人物放畫面下方，保留湖泊與山景",
  light:"傍晚較柔和；逆光時點人物臉部測光",duration:"10–20 分鐘",
  pose:"人物背對或 45° 側身看湖",
  steps:["先用 0.5× 拍環境","再用 1× 拍人物半身","地平線放上或下三分之一"],
  popularity:98,styles:["城市全景","湖山大片","情侶背影"],
  hashtags:["queenstown","queenstownnz","bobpeak"],
  reasons:["湖泊、城市與山景一次入鏡","非常適合 0.5× 廣角","日落前後層次最完整"],
  diagram:"⛰️  湖泊  城市\n────────────\n👤      👤\n   📱 0.5×"
},
{
  day:8,place:"Lake Pukaki",title:"乳藍湖水＋庫克山方向",
  image:"https://commons.wikimedia.org/wiki/Special:Redirect/file/Lake_Pukaki,_New_Zealand.jpg?width=1400",
  source:"https://commons.wikimedia.org/wiki/File:Lake_Pukaki,_New_Zealand.jpg",
  lat:-44.1884,lng:170.1358,lens:"1×",photographer:"湖岸安全停留區或觀景平台",
  subject:"人物小比例放左下或右下，讓湖與山成主角",
  light:"晴天湖色最明顯；中午可稍降曝光",duration:"8–12 分鐘",
  pose:"面向山景，深色衣服較能和湖水分離",
  steps:["避免踩到湖岸危險邊緣","曝光降低約 0.3 EV","拍一張橫幅與一張直幅"],
  popularity:95,styles:["藍湖風景","人物小景","公路旅行感"],
  hashtags:["lakepukaki","mountcook","newzealandmustdo"],
  reasons:["乳藍色湖水非常搶眼","深色服裝與湖色對比明顯","人物放小可保留壯闊感"],
  diagram:"🏔️ Mt Cook\n~~~~~~~~ 湖水 ~~~~~~~~\n👤\n      📱 1×"
},
{
  day:9,place:"Church of the Good Shepherd",title:"教堂＋湖景經典角度",
  image:"https://commons.wikimedia.org/wiki/Special:Redirect/file/Church_of_the_Good_Shepherd_at_Lake_Tekapo.jpg?width=1200",
  source:"https://commons.wikimedia.org/wiki/File:Church_of_the_Good_Shepherd_at_Lake_Tekapo.jpg",
  lat:-44.0049,lng:170.4806,lens:"1×",photographer:"教堂右前方約 15–25 公尺",
  subject:"教堂放三分之一，人物不要站入口正中央",
  light:"早晨或傍晚較柔和",duration:"10–15 分鐘",
  pose:"人物站近鏡頭一點，以教堂作背景",
  steps:["手機高度約胸口","確認教堂垂直線沒有歪","拍完立即離開通道"],
  popularity:99,styles:["教堂經典構圖","湖景人像","極簡打卡"],
  hashtags:["churchofthegoodshepherd","laketekapo","tekapo"],
  reasons:["紐西蘭最具辨識度景點之一","建築、湖與人物容易形成三層構圖","適合 1× 保持建築比例自然"],
  diagram:"⛪ 教堂      湖\n      👤\n📱 1×（右前方）"
}
];
function stars(n: number) {
  return "★".repeat(n) + "☆".repeat(5 - n);
}

export default function TravelApp() {
  const [mode, setMode] = useState<Mode>("shopping");
  const [open, setOpen] = useState(false);
  const [image, setImage] = useState("");
  const [question, setQuestion] = useState("");
  const [budget, setBudget] = useState(30000);
  const [spent, setSpent] = useState(0);
  const [weightLimit, setWeightLimit] = useState(23);
  const [weightUsed, setWeightUsed] = useState(18);
  const [rate, setRate] = useState(19.5);
  const [rateDate, setRateDate] = useState("手動參考");
  const [answer, setAnswer] = useState("");
  const [loading, setLoading] = useState(false);
  const [day, setDay] = useState(7);
  const [weather, setWeather] = useState("尚未取得");
  const [location, setLocation] = useState("");
  const [favorites, setFavorites] = useState<Favorite[]>([]);
  const [compareName, setCompareName] = useState("Whittaker's 巧克力");
  const [comparePrice, setComparePrice] = useState(6.99);
  const [wineQuery, setWineQuery] = useState("");
  const [cart, setCart] = useState<CartItem[]>([]);
  const [cartOpen, setCartOpen] = useState(false);
  const [photoDay, setPhotoDay] = useState(7);
  const [countdownMinutes, setCountdownMinutes] = useState(40);
  const [countdownEnd, setCountdownEnd] = useState<number | null>(null);
  const [remainingSeconds, setRemainingSeconds] = useState(0);
  const [photoTasks, setPhotoTasks] = useState<Record<string, PhotoTask>>({});
  const [historyDay, setHistoryDay] = useState(7);
  const [historyQuery, setHistoryQuery] = useState("");
  const [expandedHistory, setExpandedHistory] = useState<string | null>(null);
  const [weatherHours, setWeatherHours] = useState<WeatherHour[]>([]);
  const [weatherDays, setWeatherDays] = useState<WeatherDay[]>([]);
  const [weatherLoading, setWeatherLoading] = useState(false);
  const [weatherUpdatedAt, setWeatherUpdatedAt] = useState("");
  const [weatherError, setWeatherError] = useState("");
  const [meetingName,setMeetingName]=useState("集合點");
  const [meetingLat,setMeetingLat]=useState<number|null>(null);
  const [meetingLng,setMeetingLng]=useState<number|null>(null);
  const [meetingTime,setMeetingTime]=useState("");
  const [meetingDistance,setMeetingDistance]=useState<number|null>(null);
  const [journal,setJournal]=useState<JournalEntry[]>([]);
  const [journalMood,setJournalMood]=useState("😊 很棒");
  const [journalNote,setJournalNote]=useState("");
  const [journalSpend,setJournalSpend]=useState(0);
  const [journalPhotos,setJournalPhotos]=useState(0);
  const [aiUsage,setAiUsage]=useState({date:"",count:0});
  const AI_DAILY_LIMIT=30;
  const active = useMemo(() => modes[mode], [mode]);
  const remainingBudget = Math.max(0, budget - spent);
  const remainingWeight = Math.max(0, weightLimit - weightUsed);
  const currentTrip = itinerary[day - 1];
  const dailyProducts = products.filter(p => p.days.includes(day));
  const selectedProduct = products.find(p => p.name === compareName) || products[0];
  const cartTotalNzd = cart.reduce((sum, x) => sum + x.unitPriceNzd * x.qty, 0);
  const cartTotalTwd = Math.round(cartTotalNzd * rate);
  const cartWeight = cart.reduce((sum, x) => sum + x.unitWeightKg * x.qty, 0);
  const projectedBudget = Math.max(0, remainingBudget - cartTotalTwd);
  const projectedWeight = Math.max(0, remainingWeight - cartWeight);

  useEffect(() => {
    const read = (key: string, fallback: number) => Number(localStorage.getItem(key) ?? fallback);
    setBudget(read("tm-budget", 30000));
    setSpent(read("tm-spent", 0));
    setWeightLimit(read("tm-weight-limit", 23));
    setWeightUsed(read("tm-weight-used", 18));
    setRate(read("tm-rate", 19.5));
    setDay(read("tm-day", 7));
    try { setFavorites(JSON.parse(localStorage.getItem("tm-favorites") || "[]")); } catch {}
    try { setCart(JSON.parse(localStorage.getItem("tm-cart") || "[]")); } catch {}
    try { setPhotoTasks(JSON.parse(localStorage.getItem("tm-photo-tasks") || "{}")); } catch {}
    try { setJournal(JSON.parse(localStorage.getItem("tm-journal") || "[]")); } catch {}
    try { const m=JSON.parse(localStorage.getItem("tm-meeting")||"{}"); if(m.name)setMeetingName(m.name); if(typeof m.lat==="number")setMeetingLat(m.lat); if(typeof m.lng==="number")setMeetingLng(m.lng); if(m.time)setMeetingTime(m.time); } catch {}
    try { const u=JSON.parse(localStorage.getItem("tm-ai-usage")||"{}"); const today=new Date().toISOString().slice(0,10); setAiUsage(u.date===today?u:{date:today,count:0}); } catch {}
  }, []);

  useEffect(() => {
    localStorage.setItem("tm-budget", String(budget));
    localStorage.setItem("tm-spent", String(spent));
    localStorage.setItem("tm-weight-limit", String(weightLimit));
    localStorage.setItem("tm-weight-used", String(weightUsed));
    localStorage.setItem("tm-rate", String(rate));
    localStorage.setItem("tm-day", String(day));
    localStorage.setItem("tm-favorites", JSON.stringify(favorites));
    localStorage.setItem("tm-cart", JSON.stringify(cart));
    localStorage.setItem("tm-photo-tasks", JSON.stringify(photoTasks));
    localStorage.setItem("tm-journal",JSON.stringify(journal));
    localStorage.setItem("tm-meeting",JSON.stringify({name:meetingName,lat:meetingLat,lng:meetingLng,time:meetingTime}));
    localStorage.setItem("tm-ai-usage",JSON.stringify(aiUsage));
  }, [budget, spent, weightLimit, weightUsed, rate, day, favorites, cart, photoTasks, journal, meetingName, meetingLat, meetingLng, meetingTime, aiUsage]);

  useEffect(() => { loadForecast(); }, [day]);

  useEffect(() => {
    if (!countdownEnd) { setRemainingSeconds(0); return; }
    const tick=()=>{ const left=Math.max(0,Math.ceil((countdownEnd-Date.now())/1000)); setRemainingSeconds(left); if([1200,600,300].includes(left)&&"Notification" in window&&Notification.permission==="granted") new Notification("Travel ME 集合提醒",{body:`距離集合還有 ${Math.round(left/60)} 分鐘`}); if(left===0)setCountdownEnd(null); };
    tick(); const timer=window.setInterval(tick,1000); return()=>window.clearInterval(timer);
  },[countdownEnd]);
  function startCountdown(){ if("Notification" in window&&Notification.permission==="default") Notification.requestPermission().catch(()=>{}); setCountdownEnd(Date.now()+Math.max(1,countdownMinutes)*60000); }
  function formatCountdown(total:number){const m=Math.floor(total/60),sec=total%60;return `${String(m).padStart(2,"0")}:${String(sec).padStart(2,"0")}`;}

  function photoKey(spot: PhotoSpot) {
    return `${spot.day}-${spot.place}`;
  }

  function updatePhotoTask(spot: PhotoSpot, patch: Partial<PhotoTask>) {
    const key = photoKey(spot);
    setPhotoTasks(old => ({
      ...old,
      [key]: { key, done: old[key]?.done || false, favorite: old[key]?.favorite || false, ...patch }
    }));
  }

  function instagramTagUrl(tag: string) {
    return `https://www.instagram.com/explore/tags/${encodeURIComponent(tag.replace(/^#/, ""))}/`;
  }


  function clothingAdvice(){ const c=weatherHours[0]; if(!c)return ["預報載入後顯示穿搭建議"]; const a:string[]=[]; if(c.apparent<=5)a.push("羽絨或厚保暖外套"); else if(c.apparent<=10)a.push("保暖中層＋防風外套"); else if(c.apparent<=16)a.push("長袖＋薄外套"); else a.push("透氣上衣，早晚備薄外套"); if(c.rainProbability>=40)a.push("輕量防水外套／雨衣"); if(c.humidity>=80)a.push("快乾衣物與鏡頭布"); if(c.humidity<=40)a.push("護唇膏與保濕"); a.push("帽子與防曬"); return a; }
  function haversine(a:number,b:number,c:number,d:number){ const R=6371,x=(c-a)*Math.PI/180,y=(d-b)*Math.PI/180; const q=Math.sin(x/2)**2+Math.cos(a*Math.PI/180)*Math.cos(c*Math.PI/180)*Math.sin(y/2)**2; return R*2*Math.atan2(Math.sqrt(q),Math.sqrt(1-q)); }
  function saveMeetingHere(){ navigator.geolocation?.getCurrentPosition(p=>{setMeetingLat(p.coords.latitude);setMeetingLng(p.coords.longitude);setMeetingDistance(0)},()=>alert("無法取得位置")); }
  function checkMeetingDistance(){ if(meetingLat===null||meetingLng===null)return alert("請先儲存集合點"); navigator.geolocation?.getCurrentPosition(p=>setMeetingDistance(haversine(p.coords.latitude,p.coords.longitude,meetingLat,meetingLng)),()=>alert("無法取得目前位置")); }
  function addJournalEntry(){ if(!journalNote.trim())return; setJournal(o=>[{id:crypto.randomUUID(),day,date:new Date().toLocaleDateString("zh-TW"),mood:journalMood,note:journalNote.trim(),spendTwd:Number(journalSpend)||0,photos:Number(journalPhotos)||0},...o]); setJournalNote("");setJournalSpend(0);setJournalPhotos(0); }
  function exportJournal(){ const t=journal.map(j=>`Day ${j.day}｜${j.date}｜${j.mood}\n花費：NT$${j.spendTwd}\n照片：${j.photos} 張\n${j.note}`).join("\n\n---\n\n"); const b=new Blob([t||"尚無旅行日誌"],{type:"text/plain;charset=utf-8"}); const u=URL.createObjectURL(b); const a=document.createElement("a");a.href=u;a.download="Travel-ME-旅行日誌.txt";a.click();URL.revokeObjectURL(u); }

  function weatherText(code:number){
    if(code===0)return "晴朗";
    if([1,2].includes(code))return "晴時多雲";
    if(code===3)return "陰天";
    if([45,48].includes(code))return "霧";
    if([51,53,55,56,57].includes(code))return "毛毛雨";
    if([61,63,65,66,67].includes(code))return "下雨";
    if([71,73,75,77].includes(code))return "下雪";
    if([80,81,82].includes(code))return "陣雨";
    if([85,86].includes(code))return "陣雪";
    if([95,96,99].includes(code))return "雷雨";
    return "天氣變化";
  }
  function weatherIcon(code:number){
    if(code===0)return "☀️";
    if([1,2].includes(code))return "🌤️";
    if(code===3)return "☁️";
    if([45,48].includes(code))return "🌫️";
    if([51,53,55,56,57,61,63,65,66,67,80,81,82].includes(code))return "🌧️";
    if([71,73,75,77,85,86].includes(code))return "🌨️";
    if([95,96,99].includes(code))return "⛈️";
    return "🌦️";
  }
  function humidityAdvice(h:number){
    if(h>=85)return "濕度很高，鏡頭容易起霧。";
    if(h>=70)return "濕度偏高，體感可能更冷。";
    if(h<=40)return "空氣偏乾，注意補水與護唇。";
    return "濕度舒適。";
  }
  async function loadForecast(){
    setWeatherLoading(true); setWeatherError("");
    try{
      const {lat,lng,city}=currentTrip;
      const url=`https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lng}&current=temperature_2m,relative_humidity_2m,apparent_temperature,weather_code,wind_speed_10m&hourly=temperature_2m,relative_humidity_2m,apparent_temperature,precipitation_probability,weather_code&daily=weather_code,temperature_2m_max,temperature_2m_min,precipitation_probability_max,sunrise,sunset&timezone=auto&forecast_days=7`;
      const r=await fetch(url,{cache:"no-store"}); const d=await r.json();
      if(!r.ok||!d.hourly||!d.daily)throw new Error("天氣資料暫時無法取得");
      const now=Date.now()-3600000;
      setWeatherHours(d.hourly.time.map((time:string,i:number)=>({
        time,temperature:d.hourly.temperature_2m[i],humidity:d.hourly.relative_humidity_2m[i],
        apparent:d.hourly.apparent_temperature[i],rainProbability:d.hourly.precipitation_probability[i]??0,
        weatherCode:d.hourly.weather_code[i]
      })).filter((x:WeatherHour)=>new Date(x.time).getTime()>=now).slice(0,12));
      setWeatherDays(d.daily.time.map((date:string,i:number)=>({
        date,code:d.daily.weather_code[i],max:d.daily.temperature_2m_max[i],min:d.daily.temperature_2m_min[i],
        rainProbability:d.daily.precipitation_probability_max[i]??0,sunrise:d.daily.sunrise[i],sunset:d.daily.sunset[i]
      })));
      setWeather(`${d.current.temperature_2m}°C｜濕度 ${d.current.relative_humidity_2m}%`);
      setWeatherUpdatedAt(`${city}｜${new Date().toLocaleString("zh-TW")}`);
    }catch(e){setWeatherError(e instanceof Error?e.message:"天氣資料讀取失敗")}
    finally{setWeatherLoading(false)}
  }

  async function refreshRate() {
    try {
      const r = await fetch("https://api.frankfurter.dev/v2/rate/NZD/TWD", { cache: "no-store" });
      const d = await r.json();
      if (!d.rate) throw new Error();
      setRate(Number(d.rate.toFixed(3)));
      setRateDate(d.date || "最新工作日");
    } catch {
      setRateDate("更新失敗，保留目前值");
    }
  }

  async function compress(file: File) {
    const bitmap = await createImageBitmap(file);
    const maxSide = 1600;
    const scale = Math.min(1, maxSide / Math.max(bitmap.width, bitmap.height));
    const canvas = document.createElement("canvas");
    canvas.width = Math.round(bitmap.width * scale);
    canvas.height = Math.round(bitmap.height * scale);
    canvas.getContext("2d")?.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
    return canvas.toDataURL("image/jpeg", 0.82);
  }

  async function selectPhoto(file?: File) {
    if (!file) return;
    setImage(await compress(file));
    setAnswer("");
  }

  async function analyze() {
    const today=new Date().toISOString().slice(0,10); const usage=aiUsage.date===today?aiUsage:{date:today,count:0};
    if(usage.count>=AI_DAILY_LIMIT){setAnswer(`⚠️ 今日 AI 使用量已達 ${AI_DAILY_LIMIT} 次。其他功能仍可正常使用。`);return;}
    if (!image) return setAnswer("請先拍照或選擇圖片。");
    setLoading(true);
    setAnswer("正在分析圖片…");
    try {
      const response = await fetch("/api/analyze", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          mode, imageDataUrl: image, question,
          remainingBudget, remainingWeight, exchangeRate: rate,
          tripContext: `紐西蘭 Day ${day}：${currentTrip.title}；城市：${currentTrip.city}；目前位置：${location || "未提供"}`
        })
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "AI 分析失敗");
      setAnswer(data.answer);
      const today=new Date().toISOString().slice(0,10); setAiUsage(p=>({date:today,count:(p.date===today?p.count:0)+1}));
    } catch (error) {
      setAnswer(`⚠️ ${error instanceof Error ? error.message : "AI 分析失敗"}`);
    } finally {
      setLoading(false);
    }
  }

  function locate() {
    if (!navigator.geolocation) return setLocation("此裝置不支援定位");
    navigator.geolocation.getCurrentPosition(async (p) => {
      const lat = p.coords.latitude.toFixed(5);
      const lng = p.coords.longitude.toFixed(5);
      setLocation(`${lat}, ${lng}`);
      try {
        const r = await fetch(`https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lng}&current=temperature_2m,weather_code,wind_speed_10m&timezone=auto`);
        const d = await r.json();
        setWeather(`${d.current.temperature_2m}°C｜風速 ${d.current.wind_speed_10m} km/h`);
      } catch { setWeather("已定位，但天氣取得失敗"); }
    }, () => setLocation("無法取得位置，請檢查瀏覽器權限"));
  }

  function saveFavorite() {
    if (!answer) return;
    const title = `${active.title}｜Day ${day}`;
    setFavorites((old) => [{ id: crypto.randomUUID(), title, note: answer.slice(0, 500), createdAt: new Date().toLocaleString("zh-TW") }, ...old]);
  }

  function addProductFavorite(p: Product) {
    setFavorites(old => [{
      id: crypto.randomUUID(),
      title: `${p.name}｜Day ${day}`,
      note: `參考價 NZ$${p.nzdMin}–${p.nzdMax}｜約 NT$${Math.round(p.nzdMin * rate).toLocaleString()}–${Math.round(p.nzdMax * rate).toLocaleString()}｜${p.note}`,
      createdAt: new Date().toLocaleString("zh-TW")
    }, ...old]);
  }

  function addToCart(p: Product) {
    setCart(old => {
      const existing = old.find(x => x.name === p.name);
      if (existing) return old.map(x => x.id === existing.id ? { ...x, qty: x.qty + 1 } : x);
      return [...old, {
        id: crypto.randomUUID(),
        name: p.name,
        category: p.category,
        qty: 1,
        unitPriceNzd: Number(((p.nzdMin + p.nzdMax) / 2).toFixed(2)),
        unitWeightKg: p.weight,
        bought: false
      }];
    });
  }

  function updateCart(id: string, patch: Partial<CartItem>) {
    setCart(old => old.map(x => x.id === id ? { ...x, ...patch } : x));
  }

  function removeCart(id: string) {
    setCart(old => old.filter(x => x.id !== id));
  }

  const delta = selectedProduct.twdRef - comparePrice * rate;
  const compareVerdict =
    comparePrice < selectedProduct.nzdMin ? "價格非常漂亮，可優先買" :
    comparePrice <= selectedProduct.nzdMax ? "落在合理區間，可依需求買" :
    "高於常見參考區間，建議再比價";

  const mapBox = `${currentTrip.lng - 0.08},${currentTrip.lat - 0.055},${currentTrip.lng + 0.08},${currentTrip.lat + 0.055}`;
  const mapUrl = `https://www.openstreetmap.org/export/embed.html?bbox=${encodeURIComponent(mapBox)}&layer=mapnik&marker=${currentTrip.lat}%2C${currentTrip.lng}`;
  const navUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(currentTrip.city + " New Zealand")}`;
  const pakUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent("PAK'nSAVE near " + currentTrip.city + " New Zealand")}`;

  return (
    <main className="shell">
      <header className="topbar">
        <div><strong>🌏 Travel ME v10</strong><small>Photo Guide Pro＋IG 靈感搜尋＋Gemini AI</small></div>
        <div className="topActions"><button className="cartButton" onClick={() => setCartOpen(true)}>🛒 購物車 {cart.reduce((n,x)=>n+x.qty,0)}</button><a href="/login">Google 登入</a></div>
      </header>

      <section className="hero">
        <span>NEW ZEALAND 2026</span>
        <h1>熱門拍法、IG 靈感、站位教學，一頁完成</h1>
        <p>AI 整理熱門拍法、一鍵 Instagram 標籤搜尋、拍照任務與 AI 照片評分。</p>
      </section>

      <section className="todayPanel"><div className="sectionHead"><div><span className="todayBadge">TODAY</span><h2>Day {day}｜{currentTrip.city}</h2><p>{currentTrip.title}</p></div><label>切換行程<select value={day} onChange={e=>setDay(Number(e.target.value))}>{itinerary.map((_,i)=><option value={i+1} key={i}>Day {i+1}</option>)}</select></label></div><div className="todayGrid"><article><small>🌦️ 天氣</small><strong>{weatherHours[0]?`${weatherIcon(weatherHours[0].weatherCode)} ${weatherHours[0].temperature}°C`:"載入中"}</strong><span>{weatherHours[0]?`體感 ${weatherHours[0].apparent}°｜濕度 ${weatherHours[0].humidity}%`:""}</span></article><article><small>🚌 集合</small><strong>{meetingTime||"尚未設定"}</strong><span>{meetingName}{meetingDistance!==null?`｜${meetingDistance<1?Math.round(meetingDistance*1000)+"m":meetingDistance.toFixed(1)+"km"}`:""}</span></article><article><small>📸 今日必拍</small><strong>{photoSpots.filter(x=>x.day===day).length} 個</strong><span>已完成 {photoSpots.filter(x=>x.day===day&&photoTasks[photoKey(x)]?.done).length}</span></article><article><small>🛍️ 今日推薦</small><strong>{dailyProducts.length} 項</strong><span>購物車約 NT${cartTotalTwd.toLocaleString()}</span></article><article><small>💰 剩餘預算</small><strong>NT${remainingBudget.toLocaleString()}</strong><span>購物後 NT${projectedBudget.toLocaleString()}</span></article><article className={aiUsage.count>=24?"usageWarn":""}><small>🤖 今日 AI 使用</small><strong>{aiUsage.count}/{AI_DAILY_LIMIT}</strong><span>{aiUsage.count>=AI_DAILY_LIMIT?"今日額度已用完":aiUsage.count>=24?"接近上限":"可正常使用"}</span></article></div></section>

      <section className="modeGrid">
        {(Object.keys(modes) as Mode[]).map((key) => (
          <button key={key} className="modeCard" onClick={() => { setMode(key); setOpen(true); setAnswer(""); }}>
            <b>{modes[key].icon}</b><strong>{modes[key].title}</strong><small>{modes[key].subtitle}</small>
          </button>
        ))}
      </section>

      <section className="dashboard">
        <article>
          <label>目前 Day
            <select value={day} onChange={(e) => setDay(Number(e.target.value))}>
              {itinerary.map((_, i) => <option value={i + 1} key={i}>Day {i + 1}</option>)}
            </select>
          </label>
          <strong>{currentTrip.title}</strong>
        </article>
        <article><small>剩餘預算</small><strong>NT$ {remainingBudget.toLocaleString()}</strong></article>
        <article><small>剩餘行李</small><strong>{remainingWeight.toFixed(1)} kg</strong></article>
        <article><small>目前天氣</small><strong>{weather}</strong><button className="minor" onClick={locate}>GPS 定位</button></article>
      </section>

      <section className="mapPanel">
        <div className="sectionHead">
          <div><h2>📍 Day {day} 行程地圖</h2><p>{currentTrip.city}｜{currentTrip.title}</p></div>
          <div className="mapActions"><a href={navUrl} target="_blank" rel="noreferrer">開 Google Maps</a><a href={pakUrl} target="_blank" rel="noreferrer">找附近 PAK'nSAVE</a></div>
        </div>
        <iframe title={`Day ${day} map`} src={mapUrl} loading="lazy" />
        <small className="sourceNote">地圖使用 OpenStreetMap；導航按鈕會另開 Google Maps。</small>
      </section>

      <section className="dayAssistant">
        <div className="sectionHead"><div><h2>🚌 Day {day} 今日行程助理</h2><p>{currentTrip.title}</p></div><strong>預計購物後剩餘：NT${projectedBudget.toLocaleString()}／{projectedWeight.toFixed(1)} kg</strong></div>
        <div className="tipGrid">{(dayTips[day] || []).map((tip, i) => <article key={i}>{tip}</article>)}</div>
      </section>


      <section className="groupToolsGrid"><article className="meetingPanel"><div className="sectionHead"><div><h2>🚌 跟團集合點</h2><p>儲存領隊指定位置與時間</p></div></div><div className="meetingInputs"><label>集合點名稱<input value={meetingName} onChange={e=>setMeetingName(e.target.value)}/></label><label>集合時間<input type="datetime-local" value={meetingTime} onChange={e=>setMeetingTime(e.target.value)}/></label></div><div className="meetingActions"><button onClick={saveMeetingHere}>📍 將目前位置設為集合點</button><button onClick={checkMeetingDistance}>量測距離</button>{meetingLat!==null&&meetingLng!==null&&<a href={`https://www.google.com/maps/search/?api=1&query=${meetingLat},${meetingLng}`} target="_blank" rel="noreferrer">開啟導航</a>}</div><div className="meetingStatus"><span>座標：{meetingLat!==null?`${meetingLat.toFixed(5)}, ${meetingLng?.toFixed(5)}`:"尚未儲存"}</span><strong>{meetingDistance===null?"尚未量測距離":meetingDistance<0.2?"已接近集合點":`距離約 ${meetingDistance<1?Math.round(meetingDistance*1000)+" 公尺":meetingDistance.toFixed(1)+" 公里"}`}</strong></div></article><article className="clothingPanel"><div className="sectionHead"><div><h2>🧥 今日穿搭建議</h2><p>依溫度、體感、濕度與降雨判斷</p></div></div><div className="clothingWeather"><strong>{weatherHours[0]?`${weatherHours[0].temperature}°C／體感 ${weatherHours[0].apparent}°C`:"等待預報"}</strong><span>{weatherHours[0]?`濕度 ${weatherHours[0].humidity}%｜降雨 ${weatherHours[0].rainProbability}%`:""}</span></div><ul>{clothingAdvice().map(x=><li key={x}>{x}</li>)}</ul><small>山區與湖區風勢會讓體感更低，建議洋蔥式穿法。</small></article></section>

      <section className="weatherForecastPanel">
        <div className="sectionHead">
          <div><h2>🌦️ 7 日氣象預報</h2><p>{currentTrip.city}｜溫度、體感溫度、濕度與降雨機率</p></div>
          <button className="minor" onClick={loadForecast} disabled={weatherLoading}>{weatherLoading?"更新中…":"更新預報"}</button>
        </div>
        {weatherError&&<div className="weatherError">⚠️ {weatherError}</div>}
        {weatherHours.length>0&&<>
          <div className="weatherNow">
            <article><small>目前／下一小時</small><strong>{weatherIcon(weatherHours[0].weatherCode)} {weatherHours[0].temperature}°C</strong><span>{weatherText(weatherHours[0].weatherCode)}</span></article>
            <article><small>體感溫度</small><strong>{weatherHours[0].apparent}°C</strong><span>穿著感受參考</span></article>
            <article><small>相對濕度</small><strong>{weatherHours[0].humidity}%</strong><span>{humidityAdvice(weatherHours[0].humidity)}</span></article>
            <article><small>降雨機率</small><strong>{weatherHours[0].rainProbability}%</strong><span>{weatherHours[0].rainProbability>=50?"建議攜帶雨衣":"仍留意山區變化"}</span></article>
          </div>
          <div className="hourlyForecast">
            {weatherHours.map(h=><article key={h.time}>
              <small>{new Date(h.time).toLocaleTimeString("zh-TW",{hour:"2-digit",minute:"2-digit"})}</small>
              <b>{weatherIcon(h.weatherCode)}</b><strong>{h.temperature}°</strong>
              <span>濕度 {h.humidity}%</span><span>雨 {h.rainProbability}%</span>
            </article>)}
          </div>
          <div className="dailyForecast">
            {weatherDays.map(d=><article key={d.date}>
              <small>{new Date(d.date+"T12:00:00").toLocaleDateString("zh-TW",{month:"numeric",day:"numeric",weekday:"short"})}</small>
              <div className="dailyWeatherMain"><b>{weatherIcon(d.code)}</b><strong>{weatherText(d.code)}</strong></div>
              <span>高 {d.max}°／低 {d.min}°</span><span>降雨 {d.rainProbability}%</span>
              <span>日出 {new Date(d.sunrise).toLocaleTimeString("zh-TW",{hour:"2-digit",minute:"2-digit"})}</span>
              <span>日落 {new Date(d.sunset).toLocaleTimeString("zh-TW",{hour:"2-digit",minute:"2-digit"})}</span>
            </article>)}
          </div>
        </>}
        <div className="weatherAdvice"><b>跟團提醒</b><p>山區與湖區天氣變化快。即使降雨機率低，仍建議攜帶輕量防水外套；高濕度配合低溫時，體感通常會更冷。</p></div>
        <small className="sourceNote">資料來源：Open-Meteo。{weatherUpdatedAt&&` 最後更新：${weatherUpdatedAt}`}</small>
      </section>

      <section className="historyPreviewPanel">
        <div className="sectionHead">
          <div>
            <h2>📚 行前景點預習</h2>
            <p>依 Day 1–11 行程預先整理，不需拍照、不需使用 Gemini 額度。</p>
          </div>
          <div className="historyFilters">
            <label>Day
              <select value={historyDay} onChange={e => setHistoryDay(Number(e.target.value))}>
                {Array.from(new Set(historyGuides.map(x => x.day))).map(d => <option value={d} key={d}>Day {d}</option>)}
              </select>
            </label>
            <label>搜尋
              <input value={historyQuery} onChange={e => setHistoryQuery(e.target.value)} placeholder="景點或關鍵字"/>
            </label>
          </div>
        </div>

        <div className="historyGrid">
          {historyGuides
            .filter(g => g.day === historyDay)
            .filter(g => `${g.place}${g.era}${g.intro}${g.formation}`.toLowerCase().includes(historyQuery.toLowerCase()))
            .map(g => {
              const isOpen = expandedHistory === `${g.day}-${g.place}`;
              return (
                <article className="historyCard" key={`${g.day}-${g.place}`}>
                  <div className="historyCardHead">
                    <div><small>Day {g.day}｜{g.era}</small><h3>{g.place}</h3></div>
                    <button onClick={() => setExpandedHistory(isOpen ? null : `${g.day}-${g.place}`)}>
                      {isOpen ? "收合" : "開始預習"}
                    </button>
                  </div>
                  <p className="historyIntro">{g.intro}</p>
                  <div className="formationBox"><b>🌋 這個景點怎麼形成？</b><p>{g.formation}</p></div>

                  {isOpen && <>
                    <div className="historyDetail">
                      <section><h4>歷史脈絡</h4><ol>{g.history.map(x => <li key={x}>{x}</li>)}</ol></section>
                      <section><h4>到現場要看什麼</h4><ul>{g.lookFor.map(x => <li key={x}>{x}</li>)}</ul></section>
                      <section><h4>三個快速重點</h4><ul>{g.quickFacts.map(x => <li key={x}>{x}</li>)}</ul></section>
                    </div>
                    <button className="historyAiButton" onClick={() => {
                      setMode("guide");
                      setQuestion(`請用繁體中文進一步介紹 ${g.place} 的歷史、地質形成、文化意義，以及我現場最值得注意的三件事。`);
                      setOpen(true);
                      setAnswer("");
                    }}>再問 Gemini 深入介紹</button>
                  </>}
                </article>
              );
            })}
        </div>

        {historyGuides.filter(g => g.day === historyDay).length === 0 &&
          <div className="emptyPhoto">此日尚無預載景點介紹。</div>}

        <p className="sourceNote">
          此區內容已預載於 App，可在出發前直接閱讀，也不會消耗 Gemini 每日額度。
          即時開放狀態、天氣與行程異動仍以領隊及現場公告為準。
        </p>
      </section>

      <section className="photoGuidePanel">
        <div className="sectionHead">
          <div><h2>📸 Photo Guide Pro</h2><p>AI 整理熱門拍法＋Instagram 靈感搜尋＋拍照任務</p></div>
          <label>顯示 Day
            <select value={photoDay} onChange={e => setPhotoDay(Number(e.target.value))}>
              {Array.from(new Set(photoSpots.map(x => x.day))).map(d => <option key={d} value={d}>Day {d}</option>)}
            </select>
          </label>
        </div>

        <div className="photoMissionSummary">
          <article><small>今日拍照點</small><strong>{photoSpots.filter(x => x.day === photoDay).length}</strong></article>
          <article><small>已完成</small><strong>{photoSpots.filter(x => x.day === photoDay && photoTasks[photoKey(x)]?.done).length}</strong></article>
          <article><small>已收藏</small><strong>{photoSpots.filter(x => x.day === photoDay && photoTasks[photoKey(x)]?.favorite).length}</strong></article>
        </div>

        <div className="photoSpotGrid">
          {photoSpots.filter(x => x.day === photoDay).map(spot => {
            const task = photoTasks[photoKey(spot)];
            return (
              <article className={`photoSpotCard ${task?.done ? "photoDone" : ""}`} key={spot.place}>
                <a href={spot.source} target="_blank" rel="noreferrer" className="photoImageWrap">
                  <img src={spot.image} alt={`${spot.place} 參考照片`} loading="lazy"/>
                  <span>查看圖片授權來源</span>
                </a>

                <div className="photoSpotBody">
                  <div className="photoTitleRow">
                    <div>
                      <small>Day {spot.day}｜{spot.place}</small>
                      <h3>{spot.title}</h3>
                    </div>
                    <div className="popularScore">
                      <small>IG 熱門拍法</small>
                      <strong>{spot.popularity}</strong><span>/100</span>
                    </div>
                  </div>

                  <div className="styleTags">
                    {spot.styles.map(style => <span key={style}>🔥 {style}</span>)}
                  </div>

                  <div className="photoFacts">
                    <span><b>📱 鏡頭</b>{spot.lens}</span>
                    <span><b>⏱ 建議</b>{spot.duration}</span>
                    <span><b>📍 攝影者</b>{spot.photographer}</span>
                    <span><b>👤 人物</b>{spot.subject}</span>
                  </div>

                  <div className="poseDiagram"><pre>{spot.diagram}</pre></div>

                  <p><b>光線：</b>{spot.light}</p>
                  <p><b>姿勢：</b>{spot.pose}</p>

                  <div className="popularReasons">
                    <b>為什麼這種拍法受歡迎</b>
                    <ul>{spot.reasons.map(reason => <li key={reason}>{reason}</li>)}</ul>
                  </div>

                  <ol>{spot.steps.map(step => <li key={step}>{step}</li>)}</ol>

                  <div className="igSearchBlock">
                    <b>Instagram 靈感搜尋</b>
                    <div>
                      {spot.hashtags.map(tag => (
                        <a href={instagramTagUrl(tag)} target="_blank" rel="noreferrer" key={tag}>#{tag}</a>
                      ))}
                    </div>
                    <small>只開啟 Instagram 標籤頁，不會把 IG 照片下載或嵌入 App。</small>
                  </div>

                  <div className="taskActions">
                    <label>
                      <input type="checkbox" checked={task?.done || false}
                        onChange={e => updatePhotoTask(spot, { done: e.target.checked })}/>
                      已拍完成
                    </label>
                    <button className={task?.favorite ? "active" : ""}
                      onClick={() => updatePhotoTask(spot, { favorite: !task?.favorite })}>
                      {task?.favorite ? "★ 已收藏" : "☆ 收藏拍法"}
                    </button>
                  </div>

                  <div className="photoActions">
                    <a href={`https://www.google.com/maps/search/?api=1&query=${spot.lat},${spot.lng}`} target="_blank" rel="noreferrer">導航拍攝點</a>
                    <button onClick={() => { setMode("photo"); setOpen(true); setAnswer(""); }}>拍完請 AI 評分</button>
                  </div>
                </div>
              </article>
            );
          })}
          {photoSpots.filter(x => x.day === photoDay).length === 0 &&
            <div className="emptyPhoto">這一天尚未建立專屬拍照攻略，可使用 AI 景點介紹或照片評分。</div>}
        </div>

        <p className="licenseNote">
          參考照片來自 Wikimedia Commons；點照片可查看作者與授權條款。Instagram 按鈕只開啟標籤搜尋頁，
          熱門程度與拍法為 Travel ME 的規劃用整理，不代表 Instagram 官方排行或即時統計。
        </p>
      </section>

      <section className="groupTimerPanel"><div className="sectionHead"><div><h2>🚌 旅行團集合倒數</h2><p>開始後在 20、10、5 分鐘提醒；手機通知需允許權限。</p></div><div className={`timerDisplay ${remainingSeconds>0&&remainingSeconds<=300?"urgent":""}`}>{remainingSeconds>0?formatCountdown(remainingSeconds):"尚未開始"}</div></div><div className="timerControls"><label>自由活動時間（分鐘）<input type="number" min="1" value={countdownMinutes} onChange={e=>setCountdownMinutes(Number(e.target.value))}/></label><button onClick={startCountdown}>開始倒數</button><button className="secondary" onClick={()=>setCountdownEnd(null)}>停止</button>{[20,30,40,60,90].map(n=><button className="preset" key={n} onClick={()=>setCountdownMinutes(n)}>{n} 分</button>)}</div>{remainingSeconds>0&&<p className="timerTip">建議剩 10 分鐘開始往集合點移動；剩 5 分鐘不要再排隊購物。</p>}</section>

      <section className="featureGrid">
        <article className="featureCard">
          <div className="sectionHead"><h2>💰 即時換算台幣</h2><button className="minor" onClick={refreshRate}>更新匯率</button></div>
          <div className="rateHero">1 NZD ≈ NT$ {rate.toFixed(3)}</div>
          <small>{rateDate}｜銀行刷卡或現鈔會有價差</small>
          <div className="quickRates">
            {[10,20,50,100,200].map(n => <span key={n}>NZ${n}<b>NT${Math.round(n*rate).toLocaleString()}</b></span>)}
          </div>
        </article>

        <article className="featureCard">
          <h2>🏪 PAK'nSAVE 價格判斷</h2>
          <label>商品
            <select value={compareName} onChange={e => setCompareName(e.target.value)}>
              {products.map(p => <option key={p.name}>{p.name}</option>)}
            </select>
          </label>
          <label>現場售價 NZD<input type="number" step="0.01" value={comparePrice} onChange={e => setComparePrice(Number(e.target.value))}/></label>
          <div className="verdict"><strong>{compareVerdict}</strong><span>約 NT$ {Math.round(comparePrice*rate).toLocaleString()}｜相較台灣參考價約省 NT$ {Math.round(delta).toLocaleString()}</span></div>
          <small>價格範圍為規劃用參考，不代表即時庫存或當日促銷。</small>
        </article>
      </section>

      <section className="recommendPanel">
        <div className="sectionHead"><div><h2>🐑 Day {day} 附近必買推薦</h2><p>依目前行程城市與常見購物點篩選</p></div><span>{dailyProducts.length} 項</span></div>
        <div className="productGrid">
          {dailyProducts.map(p => (
            <article className="productCard" key={p.name}>
              <small>{p.category}</small>
              <h3>{p.name}</h3>
              <div className="stars">{stars(p.stars)}</div>
              <strong>NZ${p.nzdMin}–{p.nzdMax}</strong>
              <span>約 NT${Math.round(p.nzdMin*rate).toLocaleString()}–{Math.round(p.nzdMax*rate).toLocaleString()}</span>
              <p>{p.note}</p>
              <div className="cardFoot"><small>約 {p.weight} kg</small><div><button onClick={() => addProductFavorite(p)}>收藏</button><button onClick={() => addToCart(p)}>加入購物車</button></div></div>
            </article>
          ))}
        </div>
      </section>

      <section className="databasePanel">
        <div className="sectionHead"><div><h2>🍷 紐西蘭酒款資料庫</h2><p>適合出發前做功課、現場搭配 AI 酒標辨識</p></div></div>
        <input className="searchInput" value={wineQuery} onChange={e => setWineQuery(e.target.value)} placeholder="搜尋酒名、產區或風格"/>
        <div className="wineGrid">
          {wines.filter(w => `${w.name}${w.region}${w.style}`.toLowerCase().includes(wineQuery.toLowerCase())).map(w => (
            <article key={w.name}>
              <small>{w.region}｜{w.style}</small>
              <h3>{w.name}</h3>
              <strong>NZ${w.nzdMin}–{w.nzdMax}</strong>
              <span>{w.gift}</span>
              <p>{w.note}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="categoryPanel">
        <h2>🧀 起司、蜂蜜、巧克力快速指南</h2>
        <div className="guideGrid">
          <article><b>🧀 起司</b><p>適合旅途中食用；需要冷藏。帶回台灣前應再次確認最新入境規定。</p></article>
          <article><b>🍯 蜂蜜</b><p>先看 UMF/MGO、容量與包裝重量。高等級不一定最適合自用，依預算選擇。</p></article>
          <article><b>🍫 巧克力</b><p>Whittaker's 適合大量送禮，但要計算重量與高溫融化風險。</p></article>
          <article><b>🎁 送禮策略</b><p>輕量商品優先；酒、蜂蜜和玻璃瓶控制數量，避免行李超重。</p></article>
        </div>
      </section>

      <section className="cartPanel">
        <div className="sectionHead">
          <div><h2>🛒 我的購物車</h2><p>自動統計金額、重量與剩餘額度</p></div>
          <div className="cartTotals"><b>NZ${cartTotalNzd.toFixed(2)}／約 NT${cartTotalTwd.toLocaleString()}</b><span>{cartWeight.toFixed(2)} kg</span></div>
        </div>
        {cart.length === 0 ? <p className="emptyText">從每日推薦商品按「加入購物車」。</p> :
          <div className="cartList">{cart.map(item => (
            <article key={item.id} className={item.bought ? "bought" : ""}>
              <input type="checkbox" checked={item.bought} onChange={e => updateCart(item.id,{bought:e.target.checked})}/>
              <div className="cartName"><strong>{item.name}</strong><small>{item.category}</small></div>
              <label>數量<input type="number" min="1" value={item.qty} onChange={e => updateCart(item.id,{qty:Math.max(1,Number(e.target.value))})}/></label>
              <label>單價 NZ$<input type="number" step="0.01" value={item.unitPriceNzd} onChange={e => updateCart(item.id,{unitPriceNzd:Number(e.target.value)})}/></label>
              <label>單重 kg<input type="number" step="0.01" value={item.unitWeightKg} onChange={e => updateCart(item.id,{unitWeightKg:Number(e.target.value)})}/></label>
              <button onClick={() => removeCart(item.id)}>刪除</button>
            </article>
          ))}</div>}
        <div className="projection">
          <span>購物後預估剩餘預算 <b>NT${projectedBudget.toLocaleString()}</b></span>
          <span>購物後預估剩餘行李 <b>{projectedWeight.toFixed(1)} kg</b></span>
        </div>
      </section>

      <section className="toolsPanel">
        <h2>旅行管理</h2>
        <div className="inputGrid">
          <label>總預算 TWD<input type="number" value={budget} onChange={(e) => setBudget(Number(e.target.value))} /></label>
          <label>已花費 TWD<input type="number" value={spent} onChange={(e) => setSpent(Number(e.target.value))} /></label>
          <label>行李上限 kg<input type="number" step="0.1" value={weightLimit} onChange={(e) => setWeightLimit(Number(e.target.value))} /></label>
          <label>目前重量 kg<input type="number" step="0.1" value={weightUsed} onChange={(e) => setWeightUsed(Number(e.target.value))} /></label>
          <label>NZD/TWD 匯率<input type="number" step="0.01" value={rate} onChange={(e) => setRate(Number(e.target.value))} /></label>
          <label>位置<input value={location} readOnly placeholder="按 GPS 定位" /></label>
        </div>
      </section>

      <section className="journalPanel"><div className="sectionHead"><div><h2>📔 旅行日誌</h2><p>記錄每日心情、花費與照片數量</p></div><button className="minor" onClick={exportJournal}>匯出日誌</button></div><div className="journalForm"><label>心情<select value={journalMood} onChange={e=>setJournalMood(e.target.value)}><option>😊 很棒</option><option>🙂 不錯</option><option>😮 驚喜</option><option>😴 很累</option><option>🌧️ 天氣影響</option></select></label><label>今日花費 TWD<input type="number" value={journalSpend} onChange={e=>setJournalSpend(Number(e.target.value))}/></label><label>照片張數<input type="number" value={journalPhotos} onChange={e=>setJournalPhotos(Number(e.target.value))}/></label><label className="journalNote">今日心得<textarea value={journalNote} onChange={e=>setJournalNote(e.target.value)} placeholder="今天最喜歡的景點、買了什麼、發生什麼有趣的事…"/></label><button className="journalSave" onClick={addJournalEntry}>儲存 Day {day} 日誌</button></div><div className="journalList">{journal.length===0?<p className="emptyText">尚無日誌。</p>:journal.map(j=><article key={j.id}><div><small>Day {j.day}｜{j.date}</small><h3>{j.mood}</h3><p>{j.note}</p></div><div className="journalStats"><span>NT${j.spendTwd.toLocaleString()}</span><span>{j.photos} 張照片</span><button onClick={()=>setJournal(journal.filter(x=>x.id!==j.id))}>刪除</button></div></article>)}</div></section>

      <section className="favorites">
        <div className="sectionHead"><h2>收藏紀錄</h2><span>{favorites.length} 筆</span></div>
        {favorites.length === 0 ? <p>AI 分析或商品卡可加入收藏。</p> :
          favorites.map((f) => <article key={f.id}><div><strong>{f.title}</strong><small>{f.createdAt}</small><p>{f.note}</p></div><button onClick={() => setFavorites(favorites.filter(x => x.id !== f.id))}>刪除</button></article>)}
      </section>

      {cartOpen && <div className="backdrop">
        <section className="modal cartModal">
          <div className="modalHead"><div><small>即時統計</small><h2>🛒 購物車摘要</h2></div><button onClick={() => setCartOpen(false)}>✕</button></div>
          <div className="summaryCards">
            <article><small>商品數量</small><strong>{cart.reduce((n,x)=>n+x.qty,0)}</strong></article>
            <article><small>預估金額</small><strong>NT${cartTotalTwd.toLocaleString()}</strong></article>
            <article><small>預估重量</small><strong>{cartWeight.toFixed(2)} kg</strong></article>
          </div>
          <div className="projection">
            <span>剩餘預算 <b>NT${projectedBudget.toLocaleString()}</b></span>
            <span>剩餘行李 <b>{projectedWeight.toFixed(1)} kg</b></span>
          </div>
          <button className="save" onClick={() => setCartOpen(false)}>返回繼續購物</button>
        </section>
      </div>}

      {open && <div className="backdrop">
        <section className="modal">
          <div className="modalHead"><div><small>{active.subtitle}</small><h2>{active.icon} {active.title}</h2></div><button onClick={() => setOpen(false)}>✕</button></div>
          <label className="camera">
            {image ? <img src={image} alt="待分析圖片" /> : <div><b>📷</b><span>拍照或選擇圖片</span></div>}
            <input type="file" accept="image/*" capture="environment" onChange={(e) => selectPhoto(e.target.files?.[0])} />
          </label>
          <p className="photoTip">{mode === "photo" ? "評分提示：上傳剛拍完的完整照片，AI 會分析構圖、水平、人物比例與光線。" : "拍攝提示：商品名稱、酒標正面、容量與價格牌盡量同時入鏡。"}</p>
          <label>補充問題或現場價格<textarea value={question} placeholder={active.placeholder} onChange={(e) => setQuestion(e.target.value)} /></label>
          <div className="twoCol">
            <label>剩餘預算<input value={remainingBudget} readOnly /></label>
            <label>剩餘重量<input value={remainingWeight.toFixed(1)} readOnly /></label>
          </div>
          <button className="analyze" onClick={analyze} disabled={loading}>{loading ? "AI 分析中…" : "直接由 AI 分析"}</button>
          {answer && <div className="answer">{answer}</div>}
          {answer && !answer.startsWith("⚠️") && <button className="save" onClick={saveFavorite}>加入收藏</button>}
          <p className="privacy">圖片會由伺服器安全送至 Gemini 分析；API Key 不會出現在手機中。</p>
        </section>
      </div>}
    </main>
  );
}
