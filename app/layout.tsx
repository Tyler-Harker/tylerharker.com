import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    default: "Tyler Harker - Software Engineer",
    template: "%s | Tyler Harker",
  },
  description: "Personal website of Tyler Harker - Software Engineer specializing in .NET, distributed systems, and cloud architecture.",
  metadataBase: new URL('https://tylerharker.com'),
  authors: [{ name: 'Tyler Harker' }],
  creator: 'Tyler Harker',
  openGraph: {
    type: 'website',
    locale: 'en_US',
    siteName: 'Tyler Harker',
  },
  twitter: {
    card: 'summary_large_image',
    creator: '@TylerHarker93',
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} min-h-screen bg-white font-sans antialiased dark:bg-zinc-950`}
      >
        <div className="flex min-h-screen flex-col">
          <Header />
          <main className="flex-1">{children}</main>
          <Footer />
        </div>
      </body>
    </html>
  );
}
