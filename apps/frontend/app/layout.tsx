import type { Metadata } from "next";
import { Inter, Poppins } from "next/font/google";
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
  weight: ["400", "500", "600", "700"],
  display: "swap",
  preload: true,
  fallback: ["system-ui", "arial"],
  variable: "--font-inter",
});

const poppins = Poppins({
  subsets: ["latin"],
  weight: ["500", "600", "700", "800"],
  display: "swap",
  preload: true,
  variable: "--font-poppins",
});

export const metadata: Metadata = {
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000",
  ),
  title: {
    default: "Ouvify - Canal de Ética Profissional",
    template: "%s | Ouvify",
  },
  description:
    "Plataforma SaaS completa para gerenciar denúncias, sugestões e feedbacks anônimos. White Label, seguro e pronto para usar.",
  keywords: [
    "canal de ética",
    "ouvidoria",
    "feedback anônimo",
    "compliance",
    "saas",
  ],
  authors: [{ name: "Ouvify Team" }],
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
    url: "https://ouvify.com",
    siteName: "Ouvify",
    title: "Ouvify - Canal de Ética Profissional",
    description:
      "Plataforma SaaS completa para gerenciar denúncias, sugestões e feedbacks anônimos.",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "Ouvify - Canal de Ética Profissional",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Ouvify - Canal de Ética Profissional",
    description:
      "Plataforma SaaS completa para gerenciar denúncias e feedbacks anônimos.",
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
  const nonce = headersList.get("x-nonce") || "";

  return (
    <html
      lang="pt-BR"
      className={`${inter.variable} ${poppins.variable}`}
      suppressHydrationWarning
    >
      <head>
        <meta
          name="viewport"
          content="width=device-width, initial-scale=1, maximum-scale=5"
        />
        <meta name="theme-color" content="hsl(217 91% 60%)" />
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
            `,
          }}
        />
      </head>
      <body className="font-sans antialiased">
        <CSPNonceProvider nonce={nonce}>
          <ThemeProvider>
            <AuthProvider>
              <OnboardingProvider>
                <ThemeLoader />
                <a href="#main-content" className="skip-to-content">
                  Pular para o conteúdo
                </a>
                <main id="main-content" tabIndex={-1}>
                  {children}
                </main>
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
