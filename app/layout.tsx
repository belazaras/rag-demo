import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "RAG Studio",
  description: "Upload docs, ask questions, get grounded answers with sources.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full">
      <body className="min-h-full bg-white text-gray-900 antialiased dark:bg-neutral-950 dark:text-neutral-100">
        {children}
      </body>
    </html>
  );
}
