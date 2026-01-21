import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Rotas públicas (não requerem autenticação)
const publicRoutes = [
  '/',
  '/login',
  '/cadastro',
  '/recuperar-senha',
  '/acompanhar',
  '/enviar',
  '/demo',
  '/precos',
  '/recursos',
];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Gerar nonce para CSP usando Web Crypto API (compatível com Edge Runtime)
  const nonce = btoa(crypto.randomUUID());

  // Configurar CSP baseado no ambiente
  const isDevelopment = process.env.NODE_ENV === 'development';
  const cspMode = process.env.CSP_MODE || (process.env.VERCEL_ENV === 'preview' ? 'report-only' : 'enforce');
  const forceCSP = process.env.FORCE_CSP === 'true'; // For testing

  console.log('[CSP Middleware] Processing request:', pathname);

  let cspHeader = '';

  if (isDevelopment && !forceCSP) {
    // Development mode - no CSP
    cspHeader = '';
  } else {
    // Production CSP (strict) - applied in production or when FORCE_CSP=true
    cspHeader = `
      default-src 'self';
      script-src 'self' 'nonce-${nonce}' 'strict-dynamic' https://js.stripe.com;
      style-src 'self';
      img-src 'self' data: https: blob:;
      font-src 'self' data:;
      connect-src 'self' ${process.env.NEXT_PUBLIC_API_URL || 'https://api.ouvy.com.br'} https://api.stripe.com;
      frame-src https://js.stripe.com https://hooks.stripe.com;
      object-src 'none';
      base-uri 'self';
      form-action 'self';
      frame-ancestors 'none';
      upgrade-insecure-requests;
    `.replace(/\s{2,}/g, ' ').trim();
  }

  // Permitir todas as rotas públicas
  if (publicRoutes.some(route => pathname === route || pathname.startsWith(route + '/'))) {
    const response = NextResponse.next();

    if (cspHeader) {
      // TEMP: For testing - always apply CSP
      if (cspMode === 'report-only') {
        response.headers.set('Content-Security-Policy-Report-Only', cspHeader + '; report-uri /api/csp-report');
      } else {
        response.headers.set('Content-Security-Policy', cspHeader);
      }
    }

    if (!isDevelopment || forceCSP) {
      response.headers.set('x-nonce', nonce);
    }
    return response;
  }

  // Para rotas protegidas (/dashboard, /admin), o AuthContext client-side
  // fará o redirect se necessário
  const response = NextResponse.next();

  if (cspHeader) {
    // TEMP: For testing - always apply CSP
    if (cspMode === 'report-only') {
      response.headers.set('Content-Security-Policy-Report-Only', cspHeader + '; report-uri /api/csp-report');
    } else {
      response.headers.set('Content-Security-Policy', cspHeader);
    }
  }

  if (!isDevelopment || forceCSP) {
    response.headers.set('x-nonce', nonce);
  }

  return response;
}

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     * - api routes
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$|api).*)',
  ],
};
