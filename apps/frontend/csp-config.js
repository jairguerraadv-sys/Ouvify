/**
 * Content Security Policy Configuration
 * Gerado pela Auditoria Fase 2 - 26/01/2026
 * 
 * Este arquivo centraliza a configuração de CSP para diferentes ambientes
 */

const cspDirectives = {
  // Produção: CSP restritiva
  production: {
    'default-src': ["'self'"],
    'script-src': [
      "'self'",
      'https://js.stripe.com',
      'https://cdn.sentry.io',
      'https://va.vercel-scripts.com', // Vercel Analytics
    ],
    'style-src': [
      "'self'",
      "'unsafe-inline'", // Tailwind CSS (inline styles)
      'https://fonts.googleapis.com',
    ],
    'img-src': [
      "'self'",
      'data:',
      'blob:',
      'https:',
      'https://res.cloudinary.com', // Uploads
    ],
    'font-src': [
      "'self'",
      'data:',
      'https://fonts.gstatic.com',
    ],
    'connect-src': [
      "'self'",
      'https://ouvify.up.railway.app',
      'https://api.stripe.com',
      'https://*.sentry.io',
      'https://vitals.vercel-insights.com',
      'wss://ouvify.up.railway.app', // WebSockets
    ],
    'frame-src': [
      "'self'",
      'https://js.stripe.com',
    ],
    'object-src': ["'none'"],
    'base-uri': ["'self'"],
    'form-action': ["'self'"],
    'frame-ancestors': ["'none'"],
    'upgrade-insecure-requests': [],
    'block-all-mixed-content': [],
  },

  // Desenvolvimento: CSP permissiva
  development: {
    'default-src': ["'self'"],
    'script-src': [
      "'self'",
      "'unsafe-inline'",
      "'unsafe-eval'", // React DevTools, HMR
      'https://js.stripe.com',
    ],
    'style-src': ["'self'", "'unsafe-inline'"],
    'img-src': ["'self'", 'data:', 'blob:', 'https:'],
    'font-src': ["'self'", 'data:', 'https:'],
    'connect-src': [
      "'self'",
      'http://localhost:*',
      'ws://localhost:*',
      'https://*.up.railway.app',
      'wss://*.up.railway.app',
    ],
    'frame-src': ["'self'"],
    'object-src': ["'none'"],
  },
};

/**
 * Converte objeto de diretivas em string CSP
 * @param {string} env - Ambiente (production, development)
 * @returns {string} String CSP formatada
 */
function generateCSP(env = 'production') {
  const directives = cspDirectives[env] || cspDirectives.production;
  
  return Object.entries(directives)
    .map(([key, values]) => {
      if (values.length === 0) return key; // Diretivas sem valor (upgrade-insecure-requests)
      return `${key} ${values.join(' ')}`;
    })
    .join('; ');
}

module.exports = {
  cspDirectives,
  generateCSP,
  productionCSP: generateCSP('production'),
  developmentCSP: generateCSP('development'),
};
