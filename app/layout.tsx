import type { Metadata } from "next";
import "./globals.css";
import { Toaster } from "react-hot-toast";
import { Inter, JetBrains_Mono } from "next/font/google";
import { cn } from "@/lib/utils";

const inter = Inter({ subsets: ["latin"], variable: "--font-sans" });
const jetbrainsMono = JetBrains_Mono({ 
  subsets: ["latin"], 
  variable: "--font-mono" 
});


import { TooltipProvider } from "@/components/ui/tooltip";

export const metadata: Metadata = {
  title: "Prohori — Digital Resilience Suite",
  description:
    "প্রহরী | Security-as-a-Service for Bangladeshi SMEs. Powered by SIEM, AI, and local compliance tools.",
  keywords: ["cybersecurity", "SIEM", "Bangladesh", "SME", "security", "AI analyst"],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning className={cn("font-sans font-mono", inter.variable, jetbrainsMono.variable, "dark")}>
      <head>
      </head>
      <body>
        <TooltipProvider>{children}</TooltipProvider>
        <Toaster
          position="top-right"
          toastOptions={{
            style: {
              background: "rgba(10, 14, 26, 0.95)",
              border: "1px solid rgba(0, 212, 255, 0.2)",
              color: "#f0f6ff",
              backdropFilter: "blur(16px)",
              borderRadius: "12px",
              fontSize: "0.875rem",
            },
            success: {
              iconTheme: { primary: "#10b981", secondary: "#f0f6ff" },
            },
            error: {
              iconTheme: { primary: "#ef4444", secondary: "#f0f6ff" },
            },
          }}
        />
      </body>
    </html>
  );
}
