import type { Metadata } from "next";
import { Archivo } from "next/font/google";
import "./globals.css";

const archivo = Archivo({
  variable: "--font-archivo",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "GENTUNA - DRAW SYSTEM",
  description: "GENTUNA Draw System - Lucky Draw and Raffle Management",
  icons: {
    icon: "/logo.png",
    shortcut: "/logo.png",
    apple: "/logo.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={archivo.variable} style={{ height: '100%' }}>
      <body className="font-sans antialiased" style={{ height: '100%', margin: 0 }}>
        {children}
      </body>
    </html>
  );
}
