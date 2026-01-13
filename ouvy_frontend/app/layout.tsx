import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ 
  subsets: ["latin"],
  display: 'swap',
  preload: true,
  fallback: ['system-ui', 'arial']
});

export const metadata: Metadata = {
  title: {
    default: "Ouvy - Canal de Ética Profissional",
    template: "%s | Ouvy"
  },
  description: "Plataforma SaaS completa para gerenciar denúncias, sugestões e feedbacks anônimos. White Label, seguro e pronto para usar.",
  keywords: ["canal de ética", "ouvidoria", "feedback anônimo", "compliance", "saas", "denúncias"],
  authors: [{ name: "Ouvy Team" }],
  icons: {
    icon: [
      { url: '/favicon.ico' },
      { url: '/favicon-16x16.png', sizes: '16x16', type: 'image/png' },
      { url: '/favicon-32x32.png', sizes: '32x32', type: 'image/png' }
    ],
    apple: [
      { url: '/apple-touch-icon.png', sizes: '180x180', type: 'image/png' }
    ],
    other: [
      { rel: 'icon', url: '/android-chrome-192x192.png', sizes: '192x192' },
      { rel: 'icon', url: '/android-chrome-512x512.png', sizes: '512x512' }
    ]
  },
  manifest: '/site.webmanifest',
  openGraph: {
    type: 'website',
    locale: 'pt_BR',
    url: 'https://ouvy.com',
    siteName: 'Ouvy',
    title: 'Ouvy - Canal de Ética Profissional',
    description: 'Seu canal seguro de feedback e denúncias',
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: 'Ouvy - Canal de Ética'
      }
    ]
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Ouvy - Canal de Ética',
    description: 'Plataforma completa de feedback anônimo',
    images: ['/og-image.png']
  }
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  // Cor primária padrão (cyan - cor do logo Ouvy)
  // Em produção, isso virá do banco de dados via API
  const primaryColor = '#06B6D4';

  return (
    <html lang="pt-br">
      <head>
        {/* CSS variables para white label */}
        <style>{`
          :root {
            --primary-color: ${primaryColor};
          }
        `}</style>
      </head>
      <body className={inter.className}>
        {/* Injetamos a variável CSS no estilo */}
        <div style={{ '--primary-color': primaryColor } as React.CSSProperties}>
          {children}
        </div>
      </body>
    </html>
  );
}
