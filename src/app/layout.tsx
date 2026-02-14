import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Oracle — Premium Fortune Platform",
  description: "AI-powered astrology, saju, and tarot readings",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return children;
}
