
import "~/styles/globals.css";

import { Inter, JetBrains_Mono } from "next/font/google";
import { type Metadata } from "next";
import { ThemeProvider } from "~/components/theme-provider";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-jetbrains-mono",
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "ClipFlow - AI Podcast Clipper | Turn Long Videos into Viral Shorts",
    template: "%s | ClipFlow"
  },
  description: "Transform long-form podcasts and videos into viral short clips with AI. Auto-detect speakers, generate captions, enhance audio, and repurpose content for TikTok, YouTube Shorts, and Instagram Reels. Trusted by 10,000+ creators.",
  keywords: [
    "AI video editor",
    "podcast clipper",
    "video repurposing",
    "short video generator",
    "AI captions",
    "vertical video",
    "TikTok clips",
    "YouTube Shorts",
    "Instagram Reels",
    "content repurposing",
    "viral clips",
    "podcast to shorts"
  ],
  authors: [{ name: "ClipFlow" }],
  creator: "ClipFlow",
  publisher: "ClipFlow Inc.",
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://clipflow.ai",
    siteName: "ClipFlow",
    title: "ClipFlow - AI Podcast Clipper | Turn Long Videos into Viral Shorts",
    description: "Transform long-form podcasts into viral short clips with AI. Auto-detect speakers, generate captions, and repurpose content instantly.",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "ClipFlow - AI-Powered Content Engine",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "ClipFlow - AI Podcast Clipper",
    description: "Turn long podcasts into viral short clips with AI. Trusted by 10,000+ creators.",
    images: ["/og-image.png"],
    creator: "@clipflow",
  },
  icons: [{ rel: "icon", url: "/favicon.ico" }],
  metadataBase: new URL("https://clipflow.ai"),
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={`${inter.variable} ${jetbrainsMono.variable}`} suppressHydrationWarning>
      <body
        className="min-h-screen font-sans antialiased bg-background text-foreground selection:bg-primary selection:text-primary-foreground"
        suppressHydrationWarning
      >
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}
