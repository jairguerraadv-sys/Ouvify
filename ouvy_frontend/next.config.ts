import type { NextConfig } from 'next';

/**
 * Configuração Next.js para produção
 * Otimizado para performance e segurança
 */
const nextConfig: NextConfig = {
  // Turbopack (desenvolvimento)
  turbopack: {
    root: __dirname,
  },
  
  // Otimizações de imagem
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '*.railway.app',
      },
    ],
    formats: ['image/avif', 'image/webp'],
    minimumCacheTTL: 60,
  },
  
  // Compilador SWC (otimizações)
  compiler: {
    // Remove console.log em produção (exceto warn e error)
    removeConsole: process.env.NODE_ENV === 'production' 
      ? { exclude: ['warn', 'error'] } 
      : false,
  },
  
  // Headers de segurança
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'X-DNS-Prefetch-Control',
            value: 'on',
          },
          {
            key: 'Strict-Transport-Security',
            value: 'max-age=63072000; includeSubDomains; preload',
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'X-Frame-Options',
            value: 'DENY',
          },
          {
            key: 'X-XSS-Protection',
            value: '1; mode=block',
          },
          {
            key: 'Referrer-Policy',
            value: 'strict-origin-when-cross-origin',
          },
          {
            key: 'Permissions-Policy',
            value: 'camera=(), microphone=(), geolocation=()',
          },
        ],
      },
    ];
  },
  
  // Redirecionamentos
  async redirects() {
    return [
      // Redirecionar www para non-www
      {
        source: '/:path*',
        has: [{ type: 'host', value: 'www.ouvy.com' }],
        destination: 'https://ouvy.com/:path*',
        permanent: true,
      },
    ];
  },
  
  // Otimização de pacotes externos
  experimental: {
    optimizePackageImports: [
      'lucide-react',
      '@radix-ui/react-dialog',
      '@radix-ui/react-dropdown-menu',
      '@radix-ui/react-toast',
      '@radix-ui/react-tooltip',
    ],
  },
};

export default nextConfig;
