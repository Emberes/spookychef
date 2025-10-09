import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "SpookyChef - Horror-Inspired Recipe Generator",
  description: "Get personalized recipes from horror-inspired personas based on your ingredients",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="sv" className="dark">
      <body className={inter.className}>{children}</body>
    </html>
  );
}
