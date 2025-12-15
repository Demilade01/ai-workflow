import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/sonner";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "AI Workflow Builder - Visual AI Automation Platform",
  description: "Create, connect, and execute AI-powered workflows visually. Build complex AI automation with drag-and-drop blocks, real-time execution tracking, and an AI chat assistant. Powered by Vercel AI SDK and OpenAI.",
  keywords: [
    "AI workflow",
    "workflow builder",
    "AI automation",
    "visual workflow",
    "AI orchestration",
    "workflow automation",
    "AI tools",
    "no-code AI",
    "Vercel AI SDK",
    "OpenAI",
  ],
  authors: [{ name: "AI Workflow Builder" }],
  creator: "AI Workflow Builder",
  publisher: "AI Workflow Builder",
  metadataBase: new URL("https://ai-workflow-henna.vercel.app"),
  alternates: {
    canonical: "/",
  },
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://ai-workflow-henna.vercel.app",
    siteName: "AI Workflow Builder",
    title: "AI Workflow Builder - Visual AI Automation Platform",
    description: "Create, connect, and execute AI-powered workflows visually. Build complex AI automation with drag-and-drop blocks, real-time execution tracking, and an AI chat assistant.",
    images: [
      {
        url: "/preview.png",
        width: 1200,
        height: 630,
        alt: "AI Workflow Builder - Visual AI Automation Platform",
        type: "image/png",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "AI Workflow Builder - Visual AI Automation Platform",
    description: "Create, connect, and execute AI-powered workflows visually. Build complex AI automation with drag-and-drop blocks.",
    images: ["/preview.png"],
    creator: "@aiworkflow",
  },
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
  verification: {
    // Add your verification codes here if needed
    // google: "your-google-verification-code",
    // yandex: "your-yandex-verification-code",
  },
  icons: {
    icon: "/favicon.ico",
    shortcut: "/favicon.ico",
    apple: "/favicon.ico",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="scroll-smooth">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {children}
        <Toaster />
      </body>
    </html>
  );
}
