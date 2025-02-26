import type { Metadata } from "next";
import "./globals.css";
import { Toaster } from "sonner";
//import "@geist-ui/react/dist/geist.css";
import { JetBrains_Mono } from "next/font/google";

const jetBrainsMono = JetBrains_Mono({ subsets: ["latin"] });

//import { Inter } from "next/font/google";
//
//const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
	title: "Subululhuda",
	description: "Subululhuda Secondary Madrasa",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${jetBrainsMono.className} bg-gray-900`}
      >
        {children}
        <Toaster richColors />
      </body>
    </html>
  );
}
