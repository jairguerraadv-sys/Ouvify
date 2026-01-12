import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Ouvy - Canal de Escuta",
  description: "Seu canal seguro de feedback.",
  icons: {
    icon: "/logo.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  // Cor primária padrão (azul)
  // Em produção, isso virá do banco de dados via API
  const primaryColor = '#0066CC';

  return (
    <html lang="pt-br">
      <body className={inter.className}>
        {/* Injetamos a variável CSS no estilo */}
        <div style={{ '--primary-color': primaryColor } as React.CSSProperties}>
          {children}
        </div>
      </body>
    </html>
  );
}
