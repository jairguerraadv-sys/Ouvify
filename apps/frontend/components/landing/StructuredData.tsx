export function generateStructuredData() {
  const organizationSchema = {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: 'Ouvify',
    description:
      'Plataforma SaaS white label para gestão de feedback e canal de ética corporativo',
    url: 'https://ouvify.com.br',
    logo: 'https://ouvify.com.br/images/logo.png',
    sameAs: [
      'https://www.linkedin.com/company/ouvify',
      'https://twitter.com/ouvify',
      'https://www.facebook.com/ouvify',
    ],
    contactPoint: {
      '@type': 'ContactPoint',
      telephone: '+55-11-0000-0000',
      contactType: 'Customer Service',
      areaServed: 'BR',
      availableLanguage: 'pt-BR',
    },
  };

  const softwareApplicationSchema = {
    '@context': 'https://schema.org',
    '@type': 'SoftwareApplication',
    name: 'Ouvify',
    applicationCategory: 'BusinessApplication',
    operatingSystem: 'Web',
    offers: [
      {
        '@type': 'Offer',
        name: 'Plano Starter',
        price: '99.00',
        priceCurrency: 'BRL',
        priceValidUntil: '2026-12-31',
      },
      {
        '@type': 'Offer',
        name: 'Plano Professional',
        price: '299.00',
        priceCurrency: 'BRL',
        priceValidUntil: '2026-12-31',
      },
    ],
    aggregateRating: {
      '@type': 'AggregateRating',
      ratingValue: '4.9',
      ratingCount: '50',
      bestRating: '5',
      worstRating: '1',
    },
  };

  const faqSchema = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: [
      {
        '@type': 'Question',
        name: 'Como funciona o período de teste gratuito?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'Você tem 14 dias completos para testar todas as funcionalidades do plano escolhido, sem precisar cadastrar cartão de crédito.',
        },
      },
      {
        '@type': 'Question',
        name: 'Os dados estão seguros e são conformes à LGPD?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'Usamos criptografia AES-256 e somos 100% conformes com LGPD. Temos certificação ISO 27001 e seus dados ficam em servidores no Brasil.',
        },
      },
      {
        '@type': 'Question',
        name: 'Posso cancelar a qualquer momento?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'Sim, você pode cancelar seu plano a qualquer momento sem multas ou taxas. O acesso permanece ativo até o final do período pago.',
        },
      },
    ],
  };

  return {
    organizationSchema,
    softwareApplicationSchema,
    faqSchema,
  };
}

export function StructuredDataScripts() {
  const { organizationSchema, softwareApplicationSchema, faqSchema } =
    generateStructuredData();

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(softwareApplicationSchema),
        }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />
    </>
  );
}
