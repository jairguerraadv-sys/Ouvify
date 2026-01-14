import { 
  generateSEO, 
  generateOrganizationSchema, 
  generateWebApplicationSchema,
  generateBreadcrumbSchema 
} from '@/lib/seo';

describe('SEO Library', () => {
  describe('generateSEO', () => {
    it('generates basic metadata', () => {
      const metadata = generateSEO({
        title: 'Test Page',
        description: 'Test description'
      });

      expect(metadata.title).toBe('Test Page | Ouvy');
      expect(metadata.description).toBe('Test description');
    });

    it('includes OpenGraph metadata', () => {
      const metadata = generateSEO({
        title: 'Dashboard',
        description: 'Manage your feedbacks',
        url: '/dashboard'
      });

      expect(metadata.openGraph?.title).toBe('Dashboard | Ouvy');
      expect(metadata.openGraph?.description).toBe('Manage your feedbacks');
      expect(metadata.openGraph?.url).toContain('/dashboard');
    });

    it('includes Twitter Card metadata', () => {
      const metadata = generateSEO({
        title: 'Home',
        description: 'Welcome'
      });

      expect(metadata.twitter?.card).toBe('summary_large_image');
      expect(metadata.twitter?.title).toBe('Home | Ouvy');
    });

    it('uses custom image when provided', () => {
      const customImage = '/custom-og-image.png';
      const metadata = generateSEO({
        title: 'Test',
        description: 'Test',
        image: customImage
      });

      expect(metadata.openGraph?.images?.[0]).toMatchObject({
        url: expect.stringContaining(customImage)
      });
    });
  });

  describe('generateOrganizationSchema', () => {
    it('generates valid Organization schema', () => {
      const schema = generateOrganizationSchema();

      expect(schema['@type']).toBe('Organization');
      expect(schema.name).toBe('Ouvy');
      expect(schema.url).toBeTruthy();
      expect(schema.logo).toBeTruthy();
    });

    it('includes contact information', () => {
      const schema = generateOrganizationSchema();

      expect(schema.contactPoint).toBeDefined();
      expect(schema.contactPoint.contactType).toBe('customer support');
    });
  });

  describe('generateWebApplicationSchema', () => {
    it('generates valid WebApplication schema', () => {
      const schema = generateWebApplicationSchema();

      expect(schema['@type']).toBe('WebApplication');
      expect(schema.name).toBe('Ouvy');
      expect(schema.applicationCategory).toBe('BusinessApplication');
    });

    it('includes offers information', () => {
      const schema = generateWebApplicationSchema();

      expect(schema.offers).toBeDefined();
      expect(schema.offers['@type']).toBe('Offer');
    });
  });

  describe('generateBreadcrumbSchema', () => {
    it('generates valid BreadcrumbList schema', () => {
      const items = [
        { name: 'Home', url: '/' },
        { name: 'Dashboard', url: '/dashboard' }
      ];
      const schema = generateBreadcrumbSchema(items);

      expect(schema['@type']).toBe('BreadcrumbList');
      expect(schema.itemListElement).toHaveLength(2);
    });

    it('assigns correct positions', () => {
      const items = [
        { name: 'Home', url: '/' },
        { name: 'Settings', url: '/settings' }
      ];
      const schema = generateBreadcrumbSchema(items);

      expect(schema.itemListElement[0].position).toBe(1);
      expect(schema.itemListElement[1].position).toBe(2);
    });
  });
});
