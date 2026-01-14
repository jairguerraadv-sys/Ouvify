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

  // Permitir todas as rotas públicas
  if (publicRoutes.some(route => pathname === route || pathname.startsWith(route + '/'))) {
    return NextResponse.next();
  }

  // Para rotas protegidas (/dashboard, /admin), o AuthContext client-side
  // fará o redirect se necessário
  return NextResponse.next();
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
