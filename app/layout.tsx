import type { Metadata, Viewport } from "next";
import { Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";
import { WhatsAppFloatingButton } from "@/components/WhatsAppFloatingButton";
import { AuthProvider } from "@/context/AuthContext";
import { ThemeProvider } from "@/context/ThemeContext";
import { ButtonRipple } from "@/components/ButtonRipple";
import { AnalyticsTracker } from "@/components/AnalyticsTracker";
import { DeferredModals } from "@/components/DeferredModals";

const plusJakartaSans = Plus_Jakarta_Sans({
  variable: "--font-plus-jakarta",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700", "800"],
  display: "swap",
  preload: true,
});

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  themeColor: "#0b3c68",
};

export const metadata: Metadata = {
  title: "Hamza Phone Store | Pakistan's #1 PTA-Approved Mobile Marketplace",
  description:
    "Explore 220+ PTA-Approved smartphones and button phones with official prices, 0% EMI installments, Open-Parcel delivery, and official 1-year brand warranties.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning className={`${plusJakartaSans.variable} h-full antialiased overflow-x-hidden`}>
      <head>
        {/* Instant Theme script to prevent Flash of Unstyled Theme (FOUC) */}
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                try {
                  var saved = localStorage.getItem('hamzastore_theme');
                  var prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
                  if (saved === 'dark' || (!saved && prefersDark)) {
                    document.documentElement.classList.add('dark');
                    document.documentElement.setAttribute('data-theme', 'dark');
                    document.documentElement.style.colorScheme = 'dark';
                  } else {
                    document.documentElement.classList.remove('dark');
                    document.documentElement.setAttribute('data-theme', 'light');
                    document.documentElement.style.colorScheme = 'light';
                  }
                } catch (e) {}
              })();
            `,
          }}
        />
        {/* Preconnect to external image CDNs & Google Fonts to eliminate DNS/TLS latency */}
        <link rel="preconnect" href="https://images.priceoye.pk" crossOrigin="anonymous" />
        <link rel="dns-prefetch" href="https://images.priceoye.pk" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      </head>
      <body className="min-h-full flex flex-col bg-[#f1f3f6] text-[#0f1111] dark:bg-[#0b1120] dark:text-[#f1f5f9] font-sans overflow-x-hidden w-full max-w-full transition-colors duration-200">
        <ThemeProvider>
          <AuthProvider>
            <AnalyticsTracker />
            <ButtonRipple />
            {children}
            <DeferredModals />
            <WhatsAppFloatingButton />
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
