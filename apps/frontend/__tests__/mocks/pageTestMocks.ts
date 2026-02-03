export function protectedRouteMock() {
  return {
    ProtectedRoute: ({ children }: { children: React.ReactNode }) => <>{children}</>,
  };
}

export function createNextNavigationMock(pathname: string) {
  return {
    useRouter: jest.fn(() => ({
      push: jest.fn(),
      replace: jest.fn(),
      prefetch: jest.fn(),
      back: jest.fn(),
    })),
    usePathname: jest.fn(() => pathname),
    useSearchParams: jest.fn(() => new URLSearchParams()),
  };
}

export function authenticatedAuthContextMock() {
  return {
    useAuth: jest.fn(() => ({
      isAuthenticated: true,
      isLoading: false,
      user: {
        id: 1,
        email: 'test@example.com',
        name: 'Test User',
      },
      tenant: {
        id: 1,
        nome: 'Test Company',
        subdominio: 'testcompany',
        plano: 'professional',
      },
    })),
    AuthProvider: ({ children }: { children: React.ReactNode }) => <>{children}</>,
  };
}
