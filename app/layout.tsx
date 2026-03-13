import type { Metadata } from "next";
import { Inter, JetBrains_Mono } from "next/font/google";
import { Toaster } from "sonner";
import "./globals.css";
import { TopNav } from "@/components/TopNav";
import { Providers } from "@/components/Providers";
import { GithubButton } from "@/components/GithubButton";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-sans",
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
});

export const metadata: Metadata = {
  title: "Yakiquant — Demo",
  description: "AI-assisted U.S. equities swing trading research lab — demo",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <body
        className={`${inter.variable} ${jetbrainsMono.variable} font-sans min-h-screen bg-background`}
      >
        <Providers>
          {/* Demo Mode Banner */}
          <div className="sticky top-0 z-[60] w-full bg-amber-500/90 text-amber-950 text-xs font-semibold text-center py-1.5 tracking-wide">
            Demo Mode — static data only · quant.philbuildsthings.com
          </div>
          <TopNav />
          {children}
          <GithubButton />
          <Toaster theme="dark" position="bottom-right" richColors closeButton />
        </Providers>
      </body>
    </html>
  );
}
