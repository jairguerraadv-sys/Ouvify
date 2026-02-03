import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Ouvify - Plataforma White Label para Gestão de Feedback e Canal de Ética',
  description:
    'Transforme feedback em crescimento com o Ouvify. Plataforma SaaS white label completa para gerenciar denúncias, sugestões e elogios com conformidade LGPD. Teste grátis por 14 dias.',
  keywords: [
    'canal de ética',
    'gestão de feedback',
    'denúncias anônimas',
    'compliance',
    'LGPD',
    'white label',
    'SaaS',
    'ouvidoria digital',
    'canal de denúncias',
    'feedback corporativo',
  ],
  authors: [{ name: 'Ouvify' }],
  creator: 'Ouvify',
  publisher: 'Ouvify',
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  metadataBase: new URL('https://ouvify.com.br'),
  alternates: {
    canonical: '/',
  },
  openGraph: {
    title: 'Ouvify - Canal de Ética e Gestão de Feedback White Label',
    description:
      'Plataforma completa para gerenciar feedback profissional com segurança total. Conformidade LGPD, personalização white label e implementação em minutos.',
    url: 'https://ouvify.com.br',
    siteName: 'Ouvify',
    images: [
      {
        url: '/images/og-image.png',
        width: 1200,
        height: 630,
        alt: 'Ouvify - Plataforma de Gestão de Feedback',
      },
    ],
    locale: 'pt_BR',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Ouvify - Canal de Ética White Label',
    description:
      'Transforme feedback em crescimento. Plataforma SaaS com conformidade LGPD.',
    images: ['/images/twitter-image.png'],
    creator: '@ouvify',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  verification: {
    google: 'google-site-verification-code',
    yandex: 'yandex-verification-code',
  },
};
