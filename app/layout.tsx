import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Gorilla Marketing Guru",
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
    <html lang="en">
      <body className="min-h-screen bg-[#0A0F0A] text-[#E8F5E9] antialiased">
        {children}
      </body>
    </html>
  );
}
