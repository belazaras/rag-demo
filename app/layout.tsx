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
  title: "Nico Belazaras — Full-Stack + AI Engineer",
  description:
    "Senior engineer specializing in full-stack, Shopify, and RAG/AI pipelines. Portfolio, demos, and contact.",
  openGraph: {
    title: "Nico Belazaras — Full-Stack + AI Engineer",
    description: "RAG demo, Podcast→Social Studio, and case studies.",
    images: ["/og.png"],
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
              url: "https://your-domain.com",
              email: "mailto:belazaras@live.com",
              address: {
                "@type": "PostalAddress",
                addressLocality: "London, UK",
              },
              sameAs: ["https://www.linkedin.com/in/belazaras/"],
            }),
          }}
        />
        <Analytics />
      </body>
    </html>
  );
}
