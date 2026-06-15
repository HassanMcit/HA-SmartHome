import type { Metadata } from "next";
import "./globals.css";
import AuthSessionProvider from "@/components/AuthSessionProvider";
import { AuthProvider } from "@/contexts/AuthContext";
import { ThemeProvider } from "@/contexts/ThemeContext";
import { LanguageProvider } from "@/contexts/LanguageContext";
import { Toaster } from "@/components/ui/sonner";

export const metadata: Metadata = {
  title: "مدبّر | إدارة المنزل الذكية",
  description: "تطبيق عائلي لإدارة الميزانية والمصاريف والادخار بذكاء",
  manifest: "/manifest.json",
  icons: {
    icon: [
      { url: "/favicon.png", type: "image/png" },
      { url: "/favicon.ico", type: "image/x-icon" },
    ],
    apple: [
      { url: "/icon-192x192.png", sizes: "192x192", type: "image/png" },
    ],
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ar" dir="rtl">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Cairo:wght@300;400;500;600;700;800;900&display=swap"
          rel="stylesheet"
        />
        {/* Viewport */}
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no, viewport-fit=cover" />

        {/* PWA Theme */}
        <meta name="theme-color" content="#091b29" />
        <meta name="background-color" content="#091b29" />

        {/* iOS PWA Support */}
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <meta name="apple-mobile-web-app-title" content="مدبّر" />
        <link rel="apple-touch-icon" href="/icon-192x192.png" />
        <link rel="apple-touch-icon" sizes="192x192" href="/icon-192x192.png" />
        <link rel="apple-touch-icon" sizes="512x512" href="/icon-512x512.png" />

        {/* Android PWA */}
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="application-name" content="مدبّر" />

        {/* Splash Screen Colors */}
        <meta name="msapplication-TileColor" content="#091b29" />
        <meta name="msapplication-tap-highlight" content="no" />

        {/* Prevent phone number detection */}
        <meta name="format-detection" content="telephone=no" />
      </head>
      <body className="font-cairo antialiased">
        <AuthSessionProvider>
          <AuthProvider>
            <ThemeProvider>
              <LanguageProvider>
                {children}
                <Toaster position="top-center" richColors dir="rtl" />
              </LanguageProvider>
            </ThemeProvider>
          </AuthProvider>
        </AuthSessionProvider>
      </body>
    </html>
  );
}

