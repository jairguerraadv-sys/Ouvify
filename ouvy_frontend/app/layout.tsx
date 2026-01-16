import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { AuthProvider } from "@/contexts/AuthContext";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "sonner";
import { CookieBanner } from "@/components/CookieBanner";
import { ThemeLoader } from "@/components/ThemeLoader";
import "./globals.css"; // ✅ Import DEVE estar aqui, no topo

const inter = Inter({
  subsets: ["latin"],
  display: "swap",
  preload: true,
  fallback: ["system-ui", "arial"],
});

export const metadata: Metadata = {
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"
  ),
  title: {
    default: "Ouvy - Canal de Ética Profissional",
    template: "%s | Ouvy",
  },
  description:
    "Plataforma SaaS completa para gerenciar denúncias, sugestões e feedbacks anônimos. White Label, seguro e pronto para usar.",
  keywords: ["canal de ética", "ouvidoria", "feedback anônimo", "compliance", "saas"],
  authors: [{ name: "Ouvy Team" }],
  icons: {
    icon: [
      { url: "/favicon.ico" },
      { url: "/favicon-16x16.png", sizes: "16x16", type: "image/png" },
      { url: "/favicon-32x32.png", sizes: "32x32", type: "image/png" },
    ],
    apple: [{ url: "/apple-touch-icon.png", sizes: "180x180" }],
    other: [
      { rel: "android-chrome-192x192", url: "/android-chrome-192x192.png" },
      { rel: "android-chrome-512x512", url: "/android-chrome-512x512.png" },
    ],
  },
  manifest: "/site.webmanifest",
  openGraph: {
    type: "website",
    locale: "pt_BR",
    url: "https://ouvy.com",
    siteName: "Ouvy",
    title: "Ouvy - Canal de Ética",
    description: "Seu canal seguro de feedback e denúncias",
    images: [
      {
        url: "/logo.png",
        width: 1200,
        height: 630,
        alt: "Ouvy - Canal de Ética",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Ouvy",
    description: "Canal seguro de feedback",
    images: ["/logo.png"],
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="pt-br" suppressHydrationWarning>
      <head>
        <meta
          name="viewport"
          content="width=device-width, initial-scale=1, maximum-scale=5"
        />
        <meta name="theme-color" content="#00BCD4" />
        
        {/* ✅ NOVO: Estilos globais para White Label */}
        <style
          dangerouslySetInnerHTML={{
            __html: `
              /* Classe para logo do tenant */
              .logo-tenant {
                background-size: contain;
                background-repeat: no-repeat;
                background-position: center;
                width: 100%;
                height: 100%;
              }
              
              /* Prevenir FOUC (Flash of Unstyled Content) */
              html:not(.theme-ready) body {
                visibility: hidden;
              }
              
              html.theme-ready body {
                visibility: visible;
                animation: fadeIn 0.3s ease-in;
              }
              
              @keyframes fadeIn {
                from { opacity: 0; }
                to { opacity: 1; }
              }
              
              /* Transições suaves para mudanças de cor */
              * {
                transition: background-color 0.3s ease, 
                            border-color 0.3s ease, 
                            color 0.3s ease;
              }
            `,
          }}
        />
      </head>
      <body className={inter.className}>
        <AuthProvider>
          <ThemeLoader />
          {children}
          <Toaster />
          <Sonner 
            position="top-right" 
            richColors 
            expand={true}
            closeButton
          />
          <CookieBanner />
        </AuthProvider>
      </body>
    </html>
  );
}
