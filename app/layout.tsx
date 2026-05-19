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
  themeColor: "#111111",
};

export const metadata: Metadata = {
  title: "Ape Marketer",
  description:
    "AI-powered guerrilla marketing analysis for your business location. Get street-smart marketing tactics instantly.",
  keywords: [
    "guerrilla marketing",
    "marketing analysis",
    "retail strategy",
    "business marketing",
    "AI marketing",
  ],
  manifest: "/manifest.webmanifest",
  appleWebApp: {
    capable: true,
    title: "Ape Marketer",
    statusBarStyle: "black-translucent",
  },
  icons: {
    icon: [
      { url: "/icons/icon-32.png", sizes: "32x32", type: "image/png" },
      { url: "/icons/icon-96.png", sizes: "96x96", type: "image/png" },
      { url: "/icons/icon-192.png", sizes: "192x192", type: "image/png" },
    ],
    apple: [
      { url: "/icons/icon-152.png", sizes: "152x152" },
      { url: "/icons/icon-167.png", sizes: "167x167" },
      { url: "/icons/apple-touch-icon.png", sizes: "180x180" },
    ],
    other: [
      { rel: "apple-touch-icon-precomposed", url: "/icons/apple-touch-icon.png" },
    ],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={barlowCondensed.variable}>
      <head>
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="apple-touch-fullscreen" content="yes" />
        <link rel="apple-touch-startup-image" href="/icons/icon-1024.png" />
      </head>
      <body className="min-h-screen bg-[#F2EDE4] text-[#0D0D0D] antialiased">
        {children}
        <script
          dangerouslySetInnerHTML={{
            __html: `
              if ('serviceWorker' in navigator) {
                window.addEventListener('load', function() {
                  navigator.serviceWorker.register('/sw.js');
                });
              }
            `,
          }}
        />
      </body>
    </html>
  );
}
