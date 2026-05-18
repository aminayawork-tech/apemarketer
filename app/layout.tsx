import type { Metadata, Viewport } from "next";
import { Barlow_Condensed } from "next/font/google";
import "./globals.css";

const barlowCondensed = Barlow_Condensed({
  weight: ["700", "800"],
  subsets: ["latin"],
  variable: "--font-display",
  display: "swap",
});

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: "cover",
};

export const metadata: Metadata = {
  title: "Gorilla Marketing Guru",
  icons: {
    icon: "/logo-icon.png",
    apple: "/logo-icon.png",
  },
  description:
    "AI-powered guerrilla marketing analysis for your business location. Upload photos or videos and get expert, street-smart marketing advice.",
  keywords: [
    "guerrilla marketing",
    "marketing analysis",
    "retail strategy",
    "business marketing",
    "AI marketing",
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={barlowCondensed.variable}>
      <body className="min-h-screen bg-[#F2EDE4] text-[#0D0D0D] antialiased">
        {children}
      </body>
    </html>
  );
}
