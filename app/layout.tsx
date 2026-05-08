import type { Metadata, Viewport } from "next";
import BottomNav from "@/components/layout/BottomNav";
import "./globals.css";

export const metadata: Metadata = {
  title: "きぶんカレンダー",
  description: "毎日の気分を天気として記録して、家族みんなで見守り合えるアプリ",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ja">
      <body>
        <main style={{ maxWidth: 480, margin: "0 auto", minHeight: "100dvh", paddingBottom: "5rem" }}>
          {children}
        </main>
        <BottomNav />
      </body>
    </html>
  );
}
