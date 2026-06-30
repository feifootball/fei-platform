import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  weight: ["400", "600", "700", "900"],
});

export const metadata: Metadata = {
  icons: {
    icon: "/favicon.svg",
    shortcut: "/favicon.svg",
    apple: "/apple-icon.svg",
  },
  title: "FEI — Football English Intelligence",
  description:
    "Professional English training for the elite football ecosystem. Players, coaches, and club staff.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${inter.variable} h-full font-sans antialiased`}
    >
      <body className="min-h-full flex flex-col bg-fei-bg text-fei-text">
        {children}
      </body>
    </html>
  );
}
