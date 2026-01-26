import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { headers } from "next/headers";
import { AuthProvider } from "@/contexts/AuthContext";
import { OnboardingProvider } from "@/components/OnboardingTour";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "sonner";
import { CookieBanner } from "@/components/CookieBanner";
import { ThemeLoader } from "@/components/ThemeLoader";
import { ThemeProvider } from "@/components/theme";
import { CSPNonceProvider } from "@/components/CSPNonceProvider";
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
    title: "Ouvy - Canal de Ética Profissional",
    description: "Plataforma SaaS completa para gerenciar denúncias, sugestões e feedbacks anônimos.",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "Ouvy - Canal de Ética Profissional",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Ouvy - Canal de Ética Profissional",
    description: "Plataforma SaaS completa para gerenciar denúncias e feedbacks anônimos.",
    images: ["/og-image.png"],
  },
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Get nonce from headers (set by middleware)
  const headersList = await headers();
  const nonce = headersList.get('x-nonce') || '';

  return (
    <html lang="pt-br" suppressHydrationWarning>
      <head>
        <meta
          name="viewport"
          content="width=device-width, initial-scale=1, maximum-scale=5"
        />
        <meta name="theme-color" content="#3B82F6" />
        <meta name="csp-nonce" content={nonce} />
        
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
        <CSPNonceProvider nonce={nonce}>
          <ThemeProvider>
            <AuthProvider>
              <OnboardingProvider>
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
              </OnboardingProvider>
            </AuthProvider>
          </ThemeProvider>
        </CSPNonceProvider>
      </body>
    </html>
  );
}
