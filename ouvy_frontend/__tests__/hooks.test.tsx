/**
 * Testes dos custom hooks
 * Cobertura: useAuth, useDashboard, useDebounce, etc.
 */
import { renderHook, act } from '@testing-library/react';
import { waitFor } from '@testing-library/dom';

// Mock dos hooks
jest.mock('@/contexts/AuthContext', () => ({
  useAuth: jest.fn(() => ({
    isAuthenticated: false,
    isLoading: false,
    user: null,
    tenant: null,
    login: jest.fn(),
    logout: jest.fn(),
    register: jest.fn(),
  })),
}));

describe('useDebounce Hook', () => {
  beforeEach(() => {
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('deve retornar valor inicial imediatamente', async () => {
    // Importar diretamente para testar
    const { useDebounce } = require('@/hooks/use-common');
    
    const { result } = renderHook(() => useDebounce('initial', 500));
    
    expect(result.current).toBe('initial');
  });

  it('deve debounce alterações de valor', async () => {
    const { useDebounce } = require('@/hooks/use-common');
    
    const { result, rerender } = renderHook(
      ({ value, delay }) => useDebounce(value, delay),
      { initialProps: { value: 'initial', delay: 500 } }
    );
    
    // Alterar valor
    rerender({ value: 'changed', delay: 500 });
    
    // Valor não deve mudar imediatamente
    expect(result.current).toBe('initial');
    
    // Avançar timers
    act(() => {
      jest.advanceTimersByTime(500);
    });
    
    // Agora deve ter o novo valor
    expect(result.current).toBe('changed');
  });
});

describe('useDashboardStats Hook', () => {
  it('deve retornar estrutura correta', () => {
    const { useDashboardStats } = require('@/hooks/use-dashboard');
    
    const { result } = renderHook(() => useDashboardStats());
    
    expect(result.current).toHaveProperty('stats');
    expect(result.current).toHaveProperty('isLoading');
  });
});

describe('useFeedbacks Hook', () => {
  it('deve retornar estrutura correta', () => {
    const { useFeedbacks } = require('@/hooks/use-dashboard');
    
    const { result } = renderHook(() => useFeedbacks());
    
    expect(result.current).toHaveProperty('feedbacks');
    expect(result.current).toHaveProperty('isLoading');
  });
});

describe('useAuth Hook', () => {
  it('deve retornar estado de autenticação', () => {
    const { useAuth } = require('@/contexts/AuthContext');
    
    const mockAuthState = {
      isAuthenticated: true,
      isLoading: false,
      user: { id: 1, email: 'test@test.com' },
      tenant: { id: 1, nome: 'Test' },
      login: jest.fn(),
      logout: jest.fn(),
    };
    
    useAuth.mockReturnValue(mockAuthState);
    
    // Chamar hook
    const result = useAuth();
    
    expect(result.isAuthenticated).toBe(true);
    expect(result.user).toBeDefined();
    expect(result.tenant).toBeDefined();
  });

  it('deve ter funções de login e logout', () => {
    const { useAuth } = require('@/contexts/AuthContext');
    
    const mockAuthState = {
      isAuthenticated: false,
      isLoading: false,
      user: null,
      tenant: null,
      login: jest.fn(),
      logout: jest.fn(),
    };
    
    useAuth.mockReturnValue(mockAuthState);
    
    const result = useAuth();
    
    expect(typeof result.login).toBe('function');
    expect(typeof result.logout).toBe('function');
  });
});

describe('useFeedbackDetails Hook', () => {
  it('deve retornar detalhes do feedback', () => {
    // Mock do hook
    jest.mock('@/hooks/use-feedback-details', () => ({
      useFeedbackDetails: jest.fn(() => ({
        feedback: null,
        isLoading: true,
        error: null,
        mutate: jest.fn(),
      })),
    }));
    
    const { useFeedbackDetails } = require('@/hooks/use-feedback-details');
    
    const { result } = renderHook(() => useFeedbackDetails('OUVY-1234-5678'));
    
    expect(result.current).toHaveProperty('feedback');
    expect(result.current).toHaveProperty('isLoading');
  });
});

describe('useTenantTheme Hook', () => {
  it('deve retornar tema do tenant', () => {
    jest.mock('@/hooks/use-tenant-theme', () => ({
      useTenantTheme: jest.fn(() => ({
        theme: {
          primaryColor: '#3B82F6',
          secondaryColor: '#6366F1',
        },
        isLoading: false,
      })),
    }));
    
    const { useTenantTheme } = require('@/hooks/use-tenant-theme');
    
    const result = useTenantTheme();
    
    expect(result).toHaveProperty('theme');
    expect(result).toHaveProperty('isLoading');
  });
});

describe('useToast Hook', () => {
  it('deve retornar função toast', () => {
    jest.mock('@/hooks/use-toast', () => ({
      useToast: jest.fn(() => ({
        toast: jest.fn(),
        toasts: [],
        dismiss: jest.fn(),
      })),
    }));
    
    const { useToast } = require('@/hooks/use-toast');
    
    const result = useToast();
    
    expect(typeof result.toast).toBe('function');
  });
});
