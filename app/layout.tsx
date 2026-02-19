// app/layout.tsx
import type { Metadata } from "next";
import "./globals.css";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Analytics } from "@vercel/analytics/next";

import { Inter } from "next/font/google";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

export const metadata: Metadata = {
  title: "Nico Belazaras — Senior Full-Stack Engineer",
  description:
    "Senior full-stack engineer specializing in React, Node.js, headless Shopify, and data-intensive product systems.",
  openGraph: {
    title: "Nico Belazaras — Senior Full-Stack Engineer",
    description: "Headless ecommerce, data platforms, AI systems, and selected case studies.",
    images: ["/nico.jpg"],
  },
  metadataBase: new URL("https://belazaras.vercel.app"),
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`h-full ${inter.variable}`}>
      <body className="font-sans bg-[#0B0B0C] text-white antialiased">
        <Navbar />
        <main className="mx-auto max-w-6xl px-5 py-8">{children}</main>
        <Footer />
        {/* JSON-LD Person schema for richer search results */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "Person",
              name: "Nico Belazaras",
              jobTitle: "Senior Full-Stack Engineer",
              url: "https://belazaras.vercel.app",
              email: "mailto:belazaras@live.com",
              sameAs: ["https://www.linkedin.com/in/belazaras/"],
            }),
          }}
        />
        <Analytics />
      </body>
    </html>
  );
}
