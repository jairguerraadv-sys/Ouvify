/** @type {import('next').NextConfig} */
// Importar configuração de CSP
const { generateCSP } = require("./csp-config.js");

let nextConfig = {
  // Otimizações de imagem (Auditoria Fase 3)
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "*.onrender.com",
      },
      {
        protocol: "https",
        hostname: "res.cloudinary.com", // Cloudinary CDN
      },
    ],
    formats: ["image/avif", "image/webp"],
    qualities: [75, 90],
    minimumCacheTTL: 60,
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048], // Responsive breakpoints
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384], // Small images/icons
  },

  // Compilador SWC (otimizações)
  // ✅ OTIMIZAÇÃO FASE 3: SWC minify é padrão no Next.js 16+
  compiler: {
    // Remove console.log em produção (exceto warn e error)
    removeConsole:
      process.env.NODE_ENV === "production"
        ? { exclude: ["warn", "error"] }
        : false,
  },

  // Headers de segurança
  async headers() {
    const env = process.env.NODE_ENV || "production";
    const cspValue = generateCSP(env);

    return [
      {
        source: "/(.*)",
        headers: [
          // Content Security Policy (P0.2 - Auditoria 2026-02-05)
          {
            key: "Content-Security-Policy",
            value: cspValue,
          },
          {
            key: "X-DNS-Prefetch-Control",
            value: "on",
          },
          {
            key: "Strict-Transport-Security",
            value: "max-age=63072000; includeSubDomains; preload",
          },
          {
            key: "X-Content-Type-Options",
            value: "nosniff",
          },
          {
            key: "X-Frame-Options",
            value: "DENY",
          },
          {
            key: "X-XSS-Protection",
            value: "1; mode=block",
          },
          {
            key: "Referrer-Policy",
            value: "strict-origin-when-cross-origin",
          },
          {
            key: "Permissions-Policy",
            value: "camera=(), microphone=(), geolocation=()",
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
        source: "/:path*",
        has: [{ type: "host", value: "www.ouvify.com" }],
        destination: "https://ouvify.com/:path*",
        permanent: true,
      },

      // Gaps de rotas (Auditoria 2026-01-31): manter links funcionando sem inventar UX nova
      {
        source: "/notifications",
        destination: "/dashboard",
        permanent: false,
      },
      {
        source: "/contato",
        destination: "/recursos/faq",
        permanent: false,
      },
      {
        source: "/lgpd/solicitacao",
        destination: "/lgpd",
        permanent: false,
      },
      {
        source: "/settings/privacy",
        destination: "/dashboard/configuracoes",
        permanent: false,
      },
      {
        source: "/docs",
        destination: "/recursos/documentacao",
        permanent: false,
      },
      {
        source: "/docs/:path*",
        destination: "/recursos/documentacao",
        permanent: false,
      },
    ];
  },

  // Otimização de pacotes externos (Auditoria Fase 3)
  experimental: {
    optimizePackageImports: [
      "lucide-react", // Tree-shaking de ícones
      "@radix-ui/react-dialog",
      "@radix-ui/react-dropdown-menu",
      "@radix-ui/react-toast",
      "@radix-ui/react-tooltip",
      "@radix-ui/react-select",
      "@radix-ui/react-tabs",
      "recharts", // Biblioteca de gráficos (charts)
    ],
    optimizeCss: true, // ✅ NOVO: Otimização de CSS
  },

  // Output standalone para produção (reduz tamanho)
  output: process.env.NODE_ENV === "production" ? "standalone" : undefined,
};

const path = require("path");

// Bundle Analyzer (apenas quando ANALYZE=true)
if (process.env.ANALYZE === "true") {
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const withBundleAnalyzer = require("@next/bundle-analyzer")({
    enabled: true,
    openAnalyzer: true,
  });
  nextConfig = withBundleAnalyzer(nextConfig);
}

const { withSentryConfig } = require("@sentry/nextjs");

const sentryWrappedConfig = withSentryConfig(nextConfig, {
  org: process.env.SENTRY_ORG,
  project: process.env.SENTRY_PROJECT,

  // Only print logs for uploading source maps in CI
  silent: !process.env.CI,

  // Upload a larger set of source maps for prettier stack traces (increases build time)
  widenClientFileUpload: true,

  // Route browser requests to Sentry through a Next.js rewrite to circumvent ad-blockers.
  tunnelRoute: "/monitoring",

  // Configurações webpack para otimização
  webpack: {
    treeshake: {
      removeDebugLogging: true,
    },

    // (Sentry) Prefer webpack.* options (top-level is deprecated)
    reactComponentAnnotation: {
      enabled: true,
    },

    automaticVercelMonitors: true,
  },
});

// Turbopack: define root directory to avoid lockfile/root inference warnings
sentryWrappedConfig.turbopack = {
  root: path.join(__dirname, "../.."),
};

module.exports = sentryWrappedConfig;
