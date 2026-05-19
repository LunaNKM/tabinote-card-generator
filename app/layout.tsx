import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "tabinote card generator",
  description: "Internal Instagram card generator for tabinote"
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ja">
      <body>{children}</body>
    </html>
  );
}
