import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";

const geistSans = localFont({
  src: "./fonts/GeistVF.woff",
  variable: "--font-geist-sans",
  weight: "100 900",
});
const geistMono = localFont({
  src: "./fonts/GeistMonoVF.woff",
  variable: "--font-geist-mono",
  weight: "100 900",
});

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  metadataBase: new URL('https://prohori.app'),
  title: {
    default: "Prohori | Digital Resilience Suite for Smart Bangladesh",
    template: "%s | Prohori"
  },
  description: "Secure your business with Prohori.app, the ultimate SECaaS platform for SME security in Bangladesh. Achieve Cyber Security Act 2023 compliance with our Digital Resilience Suite.",
  keywords: ["SECaaS", "Cyber Security Act 2023", "SME security Bangladesh", "Prohori", "Digital Resilience", "Prohori.app"],
  openGraph: {
    title: "Prohori | Digital Resilience Suite for Smart Bangladesh",
    description: "Secure your business with Prohori.app, the ultimate SECaaS platform for SME security in Bangladesh. Achieve Cyber Security Act 2023 compliance with our Digital Resilience Suite.",
    url: "https://prohori.app",
    siteName: "Prohori",
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Prohori | Digital Resilience Suite for Smart Bangladesh",
    description: "Secure your business with Prohori.app, the ultimate SECaaS platform for SME security in Bangladesh.",
  },
  verification: {
    google: "YOUR_GOOGLE_SEARCH_CONSOLE_VERIFICATION_CODE",
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
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
