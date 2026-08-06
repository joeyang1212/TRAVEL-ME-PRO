import type { AiMode } from "@/types/travel";

export type AiModeConfig = {
  icon: string;
  title: string;
  subtitle: string;
  placeholder: string;
};

export const aiModes: Record<AiMode, AiModeConfig> = {
  shopping: {
    icon: "🛍️",
    title: "AI 購物顧問",
    subtitle: "價格、CP 值、預算與重量",
    placeholder: "例如：售價 NZ$16.99，值得買嗎？"
  },
  wine: {
    icon: "🍷",
    title: "AI 酒類顧問",
    subtitle: "酒款、搭餐與帶回建議",
    placeholder: "例如：這瓶酒適合送禮嗎？建議帶幾瓶？"
  },
  translate: {
    icon: "🌐",
    title: "AI 翻譯",
    subtitle: "菜單、標籤、成分與警告",
    placeholder: "例如：請完整翻譯並整理過敏原與注意事項。"
  },
  guide: {
    icon: "🏞️",
    title: "AI 景點介紹",
    subtitle: "歷史、拍照與停留建議",
    placeholder: "例如：最佳拍照位置與建議停留時間？"
  },
  receipt: {
    icon: "🧾",
    title: "AI 收據辨識",
    subtitle: "金額、品項、幣別與分類",
    placeholder: "例如：請整理品項與總金額，並換算成台幣。"
  },
  photo: {
    icon: "📸",
    title: "AI 照片評分",
    subtitle: "構圖、光線、站位與重拍建議",
    placeholder: "例如：人物要往哪裡移、手機要抬高或降低多少？"
  }
};
