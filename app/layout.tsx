import type { Metadata } from "next";
import { Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";
import { HelperBot } from "@/components/HelperBot";
import { AuthProvider } from "@/context/AuthContext";
import { AuthModal } from "@/components/AuthModal";

const plusJakartaSans = Plus_Jakarta_Sans({
  variable: "--font-plus-jakarta",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700", "800"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "VoltPhone PK | Pakistan's #1 PTA-Approved Mobile Marketplace",
  description:
    "Explore 220+ PTA-Approved smartphones and button phones with official prices, 0% EMI installments, Open-Parcel delivery, and official 1-year brand warranties.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${plusJakartaSans.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col bg-slate-50 text-slate-900 font-sans">
        <AuthProvider>
          {children}
          <AuthModal />
          <HelperBot />
        </AuthProvider>
      </body>
    </html>
  );
}
