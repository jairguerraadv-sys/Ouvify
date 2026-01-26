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
    name: 'Ouvy',
    description: 'Plataforma completa de ouvidoria digital',
    url: 'https://ouvy.com',
    logo: 'https://ouvy.com/logo.png',
    contactPoint: {
      '@type': 'ContactPoint',
      email: 'support@ouvy.com',
      contactType: 'customer support',
    },
  };

  return <StructuredData data={schema} />;
}
