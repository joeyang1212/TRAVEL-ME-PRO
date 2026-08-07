import "./styles.css";
import "./day-selector-fix.css";
import "./ultimate-ui-v3.css";
import "./google-travel-ui.css";
import type { Metadata, Viewport } from "next";

export const metadata: Metadata = {
  title: "Travel ME v7 Gemini Edition",
  description: "AI 購物、酒類、翻譯、景點與旅行管理助手",
  manifest: "/manifest.webmanifest"
};

export const viewport: Viewport = {
  themeColor: "#0f766e",
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover"
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="zh-Hant-TW"><body>{children}</body></html>;
}
