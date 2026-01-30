import Script from 'next/script';

interface StructuredDataProps {
  data: Record<string, any>;
}

export function StructuredData({ data }: StructuredDataProps) {
  return (
    <Script
      id="structured-data"
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}

export function OrganizationSchema() {
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: 'Ouvify',
    description: 'Plataforma completa de ouvidoria digital',
    url: 'https://ouvify.com',
    logo: 'https://ouvify.com/logo.png',
    contactPoint: {
      '@type': 'ContactPoint',
      email: 'support@ouvify.com',
      contactType: 'customer support',
    },
  };

  return <StructuredData data={schema} />;
}
