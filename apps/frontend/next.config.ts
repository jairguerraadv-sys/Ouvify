import type { NextConfig } from 'next';
import { withSentryConfig } from '@sentry/nextjs';

/**
 * Configuração Next.js para produção
 * Otimizado para performance e segurança
 */
let nextConfig: NextConfig = {
  // Otimizações de imagem (Auditoria Fase 3)
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '*.railway.app',
      },
      {
        protocol: 'https',
        hostname: 'res.cloudinary.com',  // Cloudinary CDN
      },
    ],
    formats: ['image/avif', 'image/webp'],
    minimumCacheTTL: 60,
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048],  // Responsive breakpoints
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],  // Small images/icons
  },

  // Compilador SWC (otimizações)
  // ✅ OTIMIZAÇÃO FASE 3: SWC minify é padrão no Next.js 16+
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

  // Otimização de pacotes externos (Auditoria Fase 3)
  experimental: {
    optimizePackageImports: [
      'lucide-react',  // Tree-shaking de ícones
      '@radix-ui/react-dialog',
      '@radix-ui/react-dropdown-menu',
      '@radix-ui/react-toast',
      '@radix-ui/react-tooltip',
      '@radix-ui/react-select',
      '@radix-ui/react-tabs',
      'recharts',  // Biblioteca de gráficos (charts)
    ],
    optimizeCss: true,  // ✅ NOVO: Otimização de CSS
  },

  // Output standalone para produção (reduz tamanho)
  output: process.env.NODE_ENV === 'production' ? 'standalone' : undefined,
};

// Bundle Analyzer (apenas quando ANALYZE=true)
if (process.env.ANALYZE === 'true') {
  const withBundleAnalyzer = require('@next/bundle-analyzer')({
    enabled: true,
    openAnalyzer: true,
  });
  nextConfig = withBundleAnalyzer(nextConfig);
}

export default withSentryConfig(nextConfig, {
  // For all available options, see:
  // https://github.com/getsentry/sentry-webpack-plugin#options

  org: process.env.SENTRY_ORG,
  project: process.env.SENTRY_PROJECT,

  // Only print logs for uploading source maps in CI
  silent: !process.env.CI,

  // For all available options, see:
  // https://docs.sentry.io/platforms/javascript/guides/nextjs/manual-setup/

  // Upload a larger set of source maps for prettier stack traces (increases build time)
  widenClientFileUpload: true,

  // Automatically annotate React components to show their full name in breadcrumbs and session replay
  reactComponentAnnotation: {
    enabled: true,
  },

  // Route browser requests to Sentry through a Next.js rewrite to circumvent ad-blockers.
  // This can increase your server load as well as your hosting bill.
  // Note: Check that the configured route will not match with your Next.js middleware, otherwise reporting of client-
  // side errors will fail.
  tunnelRoute: "/monitoring",

  // Configurações webpack para otimização
  webpack: {
    treeshake: {
      removeDebugLogging: true,
    },
  },

  // Enables automatic instrumentation of Vercel Cron Monitors. (Does not yet work with App Router route handlers.)
  // See the following for more information:
  // https://docs.sentry.io/product/cron/get-started/#1-instrument-cron-jobs
  automaticVercelMonitors: true,
});
