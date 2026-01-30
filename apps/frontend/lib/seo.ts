import type { Metadata } from 'next';

interface SEOProps {
  title: string;
  description: string;
  keywords?: string[];
  image?: string;
  url?: string;
  type?: 'website' | 'article';
  publishedTime?: string;
  modifiedTime?: string;
  author?: string;
}

export function generateSEO({
  title,
  description,
  keywords = [],
  image = '/logo.png',
  url,
  type = 'website',
  publishedTime,
  modifiedTime,
  author,
}: SEOProps): Metadata {
  const siteName = 'Ouvify';
  const fullTitle = title.includes(siteName) ? title : `${title} | ${siteName}`;
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://ouvify.com';
  const fullUrl = url ? `${baseUrl}${url}` : baseUrl;
  const imageUrl = image.startsWith('http') ? image : `${baseUrl}${image}`;

  const metadata: Metadata = {
    title: fullTitle,
    description,
    keywords: keywords.join(', '),
    authors: author ? [{ name: author }] : [{ name: 'Ouvify Team' }],
    openGraph: {
      type,
      locale: 'pt_BR',
      url: fullUrl,
      siteName,
      title: fullTitle,
      description,
      images: [
        {
          url: imageUrl,
          width: 1200,
          height: 630,
          alt: title,
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title: fullTitle,
      description,
      images: [imageUrl],
      creator: '@ouvify',
      site: '@ouvify',
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
    alternates: {
      canonical: fullUrl,
    },
  };

  // Adicionar timestamps para artigos
  if (type === 'article' && (publishedTime || modifiedTime)) {
    metadata.openGraph = {
      ...metadata.openGraph,
      publishedTime,
      modifiedTime,
      type: 'article',
    } as any;
  }

  return metadata;
}

// Schemas JSON-LD para rich snippets
export function generateOrganizationSchema() {
  return {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: 'Ouvify',
    description: 'Plataforma completa de ouvidoria digital e canal de ética',
    url: process.env.NEXT_PUBLIC_SITE_URL || 'https://ouvify.com',
    logo: `${process.env.NEXT_PUBLIC_SITE_URL || 'https://ouvify.com'}/logo.png`,
    contactPoint: {
      '@type': 'ContactPoint',
      email: 'support@ouvify.com',
      contactType: 'customer support',
      availableLanguage: ['pt-BR', 'en'],
    },
    sameAs: [
      'https://twitter.com/ouvify',
      'https://linkedin.com/company/ouvify',
    ],
  };
}

export function generateWebApplicationSchema() {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebApplication',
    name: 'Ouvify',
    description: 'Sistema SaaS para gestão de feedbacks, denúncias e canal de ética empresarial',
    url: process.env.NEXT_PUBLIC_SITE_URL || 'https://ouvify.com',
    applicationCategory: 'BusinessApplication',
    operatingSystem: 'Web Browser',
    offers: {
      '@type': 'Offer',
      price: '0',
      priceCurrency: 'BRL',
    },
    aggregateRating: {
      '@type': 'AggregateRating',
      ratingValue: '4.8',
      ratingCount: '127',
    },
  };
}

export function generateBreadcrumbSchema(items: Array<{ name: string; url: string }>) {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://ouvify.com';
  
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      item: `${baseUrl}${item.url}`,
    })),
  };
}
