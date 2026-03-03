import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import "../styles/theme.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

export const metadata: Metadata = {
  title: "TutorFlow",
  description: "TutorFlow platform foundation",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${inter.variable} antialiased bg-[var(--color-bg-app)] text-[var(--color-text-main)]`}
      >
        <div className="flex min-h-screen items-center justify-center px-4">
          <div className="w-full max-w-5xl">{children}</div>
        </div>
      </body>
    </html>
  );
}
