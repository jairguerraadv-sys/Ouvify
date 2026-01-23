/** @type {import('next').NextConfig} */
const nextConfig = {
  // Ignora erros de TypeScript no build
  typescript: {
    ignoreBuildErrors: true,
  },

  images: {
    remotePatterns: [
      { protocol: 'https', hostname: '*.railway.app' },
      { protocol: 'https', hostname: '*.vercel.app' },
      { protocol: 'https', hostname: 'res.cloudinary.com' }
    ],
    formats: ['image/avif', 'image/webp'],
    minimumCacheTTL: 60,
  },

  // Headers de Segurança e CSP
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'X-Frame-Options', value: 'DENY' },
          { key: 'X-XSS-Protection', value: '1; mode=block' },
          { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
          { 
            key: 'Content-Security-Policy', 
            value: "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval' https://vercel.live https://va.vercel-scripts.com; style-src 'self' 'unsafe-inline'; img-src 'self' data: https: blob:; connect-src 'self' https://*.railway.app https://vitals.vercel-insights.com; font-src 'self' data:;" 
          },
        ],
      },
    ];
  },
};

module.exports = nextConfig;
