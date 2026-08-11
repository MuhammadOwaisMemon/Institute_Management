import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { ToastProvider } from "@/components/feedback/toast-provider";
import { AuthGate } from "@/features/auth/auth-provider";
import { QueryProvider } from "@/lib/providers/query-provider";
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
  title: "Institute Suite",
  description: "Simple institute management for training centers.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full">
        <QueryProvider>
          <AuthGate>{children}</AuthGate>
        </QueryProvider>
        <ToastProvider />
      </body>
    </html>
  );
}
