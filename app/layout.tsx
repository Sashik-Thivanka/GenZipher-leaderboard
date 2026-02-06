import type { Metadata } from "next";
import { Amarante } from "next/font/google";
import "./globals.css";

const amarante = Amarante({
  subsets: ["latin"],
  weight: "400",
  variable: "--font-amarante",
});

export const metadata: Metadata = {
  title: "GenZipher Leaderboard",
  description: "Live leaderboard experience for the GenZipher flagship hackathon.",
  icons: {
    icon: "/assets/favicon.svg",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={amarante.variable}>
      <body className="bg-coal text-dusk-50">
        {children}
      </body>
    </html>
  );
}
