# 📘 Tutorial: Guia Completo de Testes

> **Tempo estimado:** 45 minutos  
> **Nível:** Intermediário  
> **Última atualização:** Janeiro 2026

## 📋 Índice

1. [Visão Geral](#-visão-geral)
2. [Backend: Pytest](#-backend-pytest)
3. [Frontend: Jest + React Testing Library](#-frontend-jest)
4. [E2E: Playwright](#-e2e-playwright)
5. [Boas Práticas](#-boas-práticas)
6. [CI/CD Integration](#-cicd-integration)

---

## 🎯 Visão Geral

### Pirâmide de Testes

```
         /\
        /  \
       / E2E \        <- Poucos: fluxos críticos
      /______\
     /        \
    /Integration\     <- Médios: APIs, integrações
   /______________\
  /                \
 /    Unit Tests    \  <- Muitos: funções, componentes
/____________________\
```

### Stack de Testes

| Camada | Ferramenta | Cobertura Alvo |
|--------|------------|----------------|
| Backend Unit | Pytest | 80%+ |
| Backend Integration | Pytest + Django Test Client | 70%+ |
| Frontend Unit | Jest + RTL | 70%+ |
| Frontend E2E | Playwright | Fluxos críticos |

---

## 🐍 Backend: Pytest

### Setup Inicial

```bash
cd apps/backend

# Instalar dependências de teste
pip install pytest pytest-django pytest-cov pytest-xdist factory-boy

# Verificar instalação
pytest --version
```

### Estrutura de Arquivos

```
apps/backend/
├── conftest.py              # Fixtures globais
├── pytest.ini               # Configuração pytest
└── tests/
    ├── __init__.py
    ├── conftest.py          # Fixtures de testes
    ├── test_auth.py
    ├── test_feedbacks.py
    ├── test_billing.py
    └── factories/
        ├── __init__.py
        └── models.py        # Factories para criar objetos
```

### Configuração (pytest.ini)

```ini
# pytest.ini

[pytest]
DJANGO_SETTINGS_MODULE = config.settings.test
python_files = test_*.py
python_classes = Test*
python_functions = test_*
addopts = -v --tb=short --strict-markers
markers =
    slow: marks tests as slow (deselect with '-m "not slow"')
    integration: marks integration tests
    unit: marks unit tests
```

### Fixtures (conftest.py)

```python
# apps/backend/conftest.py

import pytest
from rest_framework.test import APIClient
from django.contrib.auth import get_user_model
from apps.tenants.models import Client, TeamMember
from apps.feedbacks.models import Feedback
from django.utils import timezone
from datetime import timedelta

User = get_user_model()


# =============================================================================
# API CLIENT
# =============================================================================

@pytest.fixture
def api_client():
    """Cliente da API sem autenticação."""
    return APIClient()


@pytest.fixture
def authenticated_client(api_client, user):
    """Cliente da API com autenticação."""
    api_client.force_authenticate(user=user)
    return api_client


# =============================================================================
# USUÁRIOS
# =============================================================================

@pytest.fixture
def user(db):
    """Usuário básico."""
    return User.objects.create_user(
        email='test@example.com',
        password='testpass123',
        first_name='Test',
        last_name='User'
    )


@pytest.fixture
def admin_user(db):
    """Usuário admin."""
    return User.objects.create_superuser(
        email='admin@example.com',
        password='adminpass123'
    )


# =============================================================================
# TENANTS
# =============================================================================

@pytest.fixture
def client_tenant(db):
    """Tenant/Cliente de teste."""
    return Client.objects.create(
        nome='Empresa Teste',
        subdominio='teste',
        trial_end_date=timezone.now().date() + timedelta(days=14),
        is_active=True
    )


@pytest.fixture
def expired_client(db):
    """Tenant com trial expirado."""
    return Client.objects.create(
        nome='Empresa Expirada',
        subdominio='expirado',
        trial_end_date=timezone.now().date() - timedelta(days=1),
        is_active=True
    )


# =============================================================================
# TEAM MEMBERS
# =============================================================================

@pytest.fixture
def team_member(db, client_tenant, user):
    """Membro da equipe com role ADMIN."""
    return TeamMember.objects.create(
        client=client_tenant,
        user=user,
        role='ADMIN',
        is_active=True
    )


@pytest.fixture
def viewer_member(db, client_tenant):
    """Membro com role VIEWER."""
    viewer_user = User.objects.create_user(
        email='viewer@example.com',
        password='viewerpass123'
    )
    return TeamMember.objects.create(
        client=client_tenant,
        user=viewer_user,
        role='VIEWER',
        is_active=True
    )


@pytest.fixture
def other_team_member(db, client_tenant):
    """Outro membro da equipe."""
    other_user = User.objects.create_user(
        email='other@example.com',
        password='otherpass123'
    )
    return TeamMember.objects.create(
        client=client_tenant,
        user=other_user,
        role='MODERATOR',
        is_active=True
    )


# =============================================================================
# FEEDBACKS
# =============================================================================

@pytest.fixture
def feedback(db, client_tenant):
    """Feedback de teste."""
    return Feedback.objects.create(
        client=client_tenant,
        titulo='Feedback de Teste',
        descricao='Descrição do feedback de teste',
        tipo='SUGESTAO',
        status='PENDENTE',
        prioridade='MEDIA'
    )


@pytest.fixture
def resolved_feedback(db, client_tenant, team_member):
    """Feedback já resolvido."""
    return Feedback.objects.create(
        client=client_tenant,
        titulo='Feedback Resolvido',
        descricao='Este feedback foi resolvido',
        tipo='RECLAMACAO',
        status='RESOLVIDO',
        prioridade='ALTA',
        assigned_to=team_member
    )


@pytest.fixture
def multiple_feedbacks(db, client_tenant):
    """Lista de feedbacks para testes de listagem."""
    feedbacks = []
    for i in range(5):
        feedbacks.append(
            Feedback.objects.create(
                client=client_tenant,
                titulo=f'Feedback {i+1}',
                descricao=f'Descrição {i+1}',
                tipo=['SUGESTAO', 'RECLAMACAO', 'ELOGIO', 'DENUNCIA'][i % 4],
                status='PENDENTE',
                prioridade='MEDIA'
            )
        )
    return feedbacks
```

### Escrevendo Testes Unitários

```python
# apps/backend/tests/test_feedbacks.py

import pytest
from django.urls import reverse
from rest_framework import status
from apps.feedbacks.models import Feedback


@pytest.mark.django_db
class TestFeedbackModel:
    """Testes do modelo Feedback."""
    
    def test_create_feedback(self, client_tenant):
        """Criar feedback com campos mínimos."""
        feedback = Feedback.objects.create(
            client=client_tenant,
            titulo='Teste',
            tipo='SUGESTAO'
        )
        
        assert feedback.id is not None
        assert feedback.codigo_rastreio is not None
        assert len(feedback.codigo_rastreio) == 8
        assert feedback.status == 'PENDENTE'
    
    def test_codigo_rastreio_is_unique(self, client_tenant):
        """Código de rastreio deve ser único."""
        feedback1 = Feedback.objects.create(
            client=client_tenant,
            titulo='Feedback 1',
            tipo='SUGESTAO'
        )
        feedback2 = Feedback.objects.create(
            client=client_tenant,
            titulo='Feedback 2',
            tipo='SUGESTAO'
        )
        
        assert feedback1.codigo_rastreio != feedback2.codigo_rastreio
    
    def test_str_representation(self, feedback):
        """String representation do modelo."""
        expected = f"[{feedback.codigo_rastreio}] {feedback.titulo}"
        assert str(feedback) == expected


@pytest.mark.django_db
class TestFeedbackAPI:
    """Testes da API de Feedbacks."""
    
    # =========================================================================
    # LIST
    # =========================================================================
    
    def test_list_feedbacks_authenticated(
        self, api_client, team_member, multiple_feedbacks
    ):
        """Listar feedbacks autenticado."""
        api_client.force_authenticate(user=team_member.user)
        
        url = reverse('feedback-list')
        response = api_client.get(url)
        
        assert response.status_code == status.HTTP_200_OK
        assert len(response.data['results']) == 5
    
    def test_list_feedbacks_unauthenticated(self, api_client):
        """Listar feedbacks sem autenticação falha."""
        url = reverse('feedback-list')
        response = api_client.get(url)
        
        assert response.status_code == status.HTTP_401_UNAUTHORIZED
    
    def test_list_feedbacks_only_own_tenant(
        self, api_client, team_member, feedback
    ):
        """Usuário só vê feedbacks do próprio tenant."""
        # Criar feedback de outro tenant
        other_client = Client.objects.create(
            nome='Outro Cliente',
            subdominio='outro'
        )
        Feedback.objects.create(
            client=other_client,
            titulo='Feedback de outro tenant',
            tipo='SUGESTAO'
        )
        
        api_client.force_authenticate(user=team_member.user)
        url = reverse('feedback-list')
        response = api_client.get(url)
        
        # Deve ver apenas 1 feedback (do próprio tenant)
        assert len(response.data['results']) == 1
        assert response.data['results'][0]['titulo'] == feedback.titulo
    
    # =========================================================================
    # CREATE
    # =========================================================================
    
    def test_create_feedback_success(self, api_client, team_member):
        """Criar feedback com sucesso."""
        api_client.force_authenticate(user=team_member.user)
        
        url = reverse('feedback-list')
        data = {
            'titulo': 'Nova sugestão',
            'descricao': 'Descrição detalhada da sugestão',
            'tipo': 'SUGESTAO',
            'prioridade': 'MEDIA'
        }
        
        response = api_client.post(url, data)
        
        assert response.status_code == status.HTTP_201_CREATED
        assert response.data['titulo'] == 'Nova sugestão'
        assert 'codigo_rastreio' in response.data
        assert Feedback.objects.count() == 1
    
    def test_create_feedback_validation_error(self, api_client, team_member):
        """Criar feedback sem título falha."""
        api_client.force_authenticate(user=team_member.user)
        
        url = reverse('feedback-list')
        data = {'tipo': 'SUGESTAO'}  # Sem título
        
        response = api_client.post(url, data)
        
        assert response.status_code == status.HTTP_400_BAD_REQUEST
        assert 'titulo' in response.data
    
    def test_create_feedback_invalid_tipo(self, api_client, team_member):
        """Criar feedback com tipo inválido falha."""
        api_client.force_authenticate(user=team_member.user)
        
        url = reverse('feedback-list')
        data = {
            'titulo': 'Teste',
            'tipo': 'INVALIDO'
        }
        
        response = api_client.post(url, data)
        
        assert response.status_code == status.HTTP_400_BAD_REQUEST
        assert 'tipo' in response.data
    
    # =========================================================================
    # RETRIEVE
    # =========================================================================
    
    def test_retrieve_feedback_success(self, api_client, team_member, feedback):
        """Buscar feedback específico."""
        api_client.force_authenticate(user=team_member.user)
        
        url = reverse('feedback-detail', args=[feedback.id])
        response = api_client.get(url)
        
        assert response.status_code == status.HTTP_200_OK
        assert response.data['titulo'] == feedback.titulo
    
    def test_retrieve_feedback_not_found(self, api_client, team_member):
        """Buscar feedback inexistente retorna 404."""
        api_client.force_authenticate(user=team_member.user)
        
        url = reverse('feedback-detail', args=[99999])
        response = api_client.get(url)
        
        assert response.status_code == status.HTTP_404_NOT_FOUND
    
    # =========================================================================
    # UPDATE
    # =========================================================================
    
    def test_update_feedback_success(self, api_client, team_member, feedback):
        """Atualizar feedback com sucesso."""
        api_client.force_authenticate(user=team_member.user)
        
        url = reverse('feedback-detail', args=[feedback.id])
        data = {
            'titulo': 'Título Atualizado',
            'status': 'EM_ANALISE'
        }
        
        response = api_client.patch(url, data)
        
        assert response.status_code == status.HTTP_200_OK
        assert response.data['titulo'] == 'Título Atualizado'
        assert response.data['status'] == 'EM_ANALISE'
    
    def test_update_feedback_viewer_forbidden(
        self, api_client, viewer_member, feedback
    ):
        """Viewer não pode atualizar feedback."""
        api_client.force_authenticate(user=viewer_member.user)
        
        url = reverse('feedback-detail', args=[feedback.id])
        data = {'titulo': 'Tentativa de update'}
        
        response = api_client.patch(url, data)
        
        assert response.status_code == status.HTTP_403_FORBIDDEN
    
    # =========================================================================
    # DELETE
    # =========================================================================
    
    def test_delete_feedback_success(self, api_client, team_member, feedback):
        """Deletar feedback com sucesso."""
        api_client.force_authenticate(user=team_member.user)
        
        url = reverse('feedback-detail', args=[feedback.id])
        response = api_client.delete(url)
        
        assert response.status_code == status.HTTP_204_NO_CONTENT
        assert Feedback.objects.count() == 0
    
    # =========================================================================
    # FILTERS
    # =========================================================================
    
    def test_filter_by_status(self, api_client, team_member, multiple_feedbacks):
        """Filtrar feedbacks por status."""
        # Mudar status de alguns
        multiple_feedbacks[0].status = 'RESOLVIDO'
        multiple_feedbacks[0].save()
        
        api_client.force_authenticate(user=team_member.user)
        
        url = reverse('feedback-list')
        response = api_client.get(url, {'status': 'PENDENTE'})
        
        assert response.status_code == status.HTTP_200_OK
        assert len(response.data['results']) == 4
    
    def test_filter_by_tipo(self, api_client, team_member, multiple_feedbacks):
        """Filtrar feedbacks por tipo."""
        api_client.force_authenticate(user=team_member.user)
        
        url = reverse('feedback-list')
        response = api_client.get(url, {'tipo': 'SUGESTAO'})
        
        assert response.status_code == status.HTTP_200_OK
        # Apenas feedbacks do tipo SUGESTAO
        for item in response.data['results']:
            assert item['tipo'] == 'SUGESTAO'
```

### Comandos Úteis

```bash
# Rodar todos os testes
pytest

# Verbose
pytest -v

# Com cobertura
pytest --cov=apps --cov-report=html

# Arquivo específico
pytest tests/test_feedbacks.py

# Classe específica
pytest tests/test_feedbacks.py::TestFeedbackAPI

# Teste específico
pytest tests/test_feedbacks.py::TestFeedbackAPI::test_create_feedback_success

# Apenas testes rápidos (excluir lentos)
pytest -m "not slow"

# Paralelo (mais rápido)
pytest -n auto

# Com print statements
pytest -v -s

# Parar no primeiro erro
pytest -x

# Último teste que falhou
pytest --lf
```

---

## ⚛️ Frontend: Jest + React Testing Library

### Setup

```bash
cd apps/frontend

# Instalar dependências
npm install -D jest @testing-library/react @testing-library/jest-dom @testing-library/user-event jest-environment-jsdom
```

### Configuração (jest.config.js)

```javascript
// apps/frontend/jest.config.js

const nextJest = require('next/jest');

const createJestConfig = nextJest({
  dir: './',
});

const customJestConfig = {
  setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],
  testEnvironment: 'jest-environment-jsdom',
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/$1',
  },
  testPathIgnorePatterns: ['<rootDir>/e2e/'],
  collectCoverageFrom: [
    'components/**/*.{js,jsx,ts,tsx}',
    'hooks/**/*.{js,jsx,ts,tsx}',
    'lib/**/*.{js,jsx,ts,tsx}',
    '!**/*.d.ts',
  ],
};

module.exports = createJestConfig(customJestConfig);
```

### Setup Global (jest.setup.js)

```javascript
// apps/frontend/jest.setup.js

import '@testing-library/jest-dom';

// Mock next/navigation
jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: jest.fn(),
    replace: jest.fn(),
    prefetch: jest.fn(),
    back: jest.fn(),
  }),
  usePathname: () => '/',
  useSearchParams: () => new URLSearchParams(),
}));

// Mock next/image
jest.mock('next/image', () => ({
  __esModule: true,
  default: (props) => <img {...props} />,
}));

// Mock fetch global
global.fetch = jest.fn();

// Cleanup mocks after each test
afterEach(() => {
  jest.clearAllMocks();
});
```

### Escrevendo Testes de Componentes

```typescript
// apps/frontend/components/__tests__/Button.test.tsx

import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Button } from '@/components/ui/button';

describe('Button Component', () => {
  it('renders with children', () => {
    render(<Button>Click me</Button>);
    
    expect(screen.getByRole('button', { name: /click me/i })).toBeInTheDocument();
  });
  
  it('calls onClick when clicked', async () => {
    const handleClick = jest.fn();
    render(<Button onClick={handleClick}>Click me</Button>);
    
    await userEvent.click(screen.getByRole('button'));
    
    expect(handleClick).toHaveBeenCalledTimes(1);
  });
  
  it('is disabled when disabled prop is true', () => {
    render(<Button disabled>Disabled</Button>);
    
    expect(screen.getByRole('button')).toBeDisabled();
  });
  
  it('shows loading state', () => {
    render(<Button loading>Loading</Button>);
    
    expect(screen.getByRole('button')).toHaveAttribute('aria-busy', 'true');
  });
  
  it('applies variant classes correctly', () => {
    const { rerender } = render(<Button variant="default">Default</Button>);
    expect(screen.getByRole('button')).toHaveClass('bg-primary');
    
    rerender(<Button variant="destructive">Destructive</Button>);
    expect(screen.getByRole('button')).toHaveClass('bg-destructive');
    
    rerender(<Button variant="outline">Outline</Button>);
    expect(screen.getByRole('button')).toHaveClass('border');
  });
});
```

### Testando Hooks

```typescript
// apps/frontend/hooks/__tests__/use-debounce.test.ts

import { renderHook, act } from '@testing-library/react';
import { useDebounce } from '@/hooks/use-common';

describe('useDebounce', () => {
  beforeEach(() => {
    jest.useFakeTimers();
  });
  
  afterEach(() => {
    jest.useRealTimers();
  });
  
  it('returns initial value immediately', () => {
    const { result } = renderHook(() => useDebounce('initial', 500));
    
    expect(result.current).toBe('initial');
  });
  
  it('debounces value changes', () => {
    const { result, rerender } = renderHook(
      ({ value }) => useDebounce(value, 500),
      { initialProps: { value: 'initial' } }
    );
    
    // Mudar valor
    rerender({ value: 'updated' });
    
    // Valor ainda não mudou
    expect(result.current).toBe('initial');
    
    // Avançar timer
    act(() => {
      jest.advanceTimersByTime(500);
    });
    
    // Agora mudou
    expect(result.current).toBe('updated');
  });
  
  it('cancels previous timeout on rapid changes', () => {
    const { result, rerender } = renderHook(
      ({ value }) => useDebounce(value, 500),
      { initialProps: { value: 'initial' } }
    );
    
    // Mudanças rápidas
    rerender({ value: 'change1' });
    act(() => jest.advanceTimersByTime(200));
    
    rerender({ value: 'change2' });
    act(() => jest.advanceTimersByTime(200));
    
    rerender({ value: 'final' });
    act(() => jest.advanceTimersByTime(500));
    
    // Apenas último valor
    expect(result.current).toBe('final');
  });
});
```

### Testando Formulários

```typescript
// apps/frontend/components/__tests__/FeedbackForm.test.tsx

import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { FeedbackForm } from '@/components/feedbacks/FeedbackForm';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: { retry: false },
    mutations: { retry: false },
  },
});

const Wrapper = ({ children }) => (
  <QueryClientProvider client={queryClient}>
    {children}
  </QueryClientProvider>
);

describe('FeedbackForm', () => {
  const mockOnSubmit = jest.fn();
  
  beforeEach(() => {
    mockOnSubmit.mockReset();
  });
  
  it('renders all form fields', () => {
    render(<FeedbackForm onSubmit={mockOnSubmit} />, { wrapper: Wrapper });
    
    expect(screen.getByLabelText(/título/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/descrição/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/tipo/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /enviar/i })).toBeInTheDocument();
  });
  
  it('shows validation errors on empty submit', async () => {
    render(<FeedbackForm onSubmit={mockOnSubmit} />, { wrapper: Wrapper });
    
    await userEvent.click(screen.getByRole('button', { name: /enviar/i }));
    
    await waitFor(() => {
      expect(screen.getByText(/título é obrigatório/i)).toBeInTheDocument();
    });
    
    expect(mockOnSubmit).not.toHaveBeenCalled();
  });
  
  it('submits form with valid data', async () => {
    render(<FeedbackForm onSubmit={mockOnSubmit} />, { wrapper: Wrapper });
    
    // Preencher formulário
    await userEvent.type(screen.getByLabelText(/título/i), 'Minha sugestão');
    await userEvent.type(
      screen.getByLabelText(/descrição/i),
      'Descrição detalhada'
    );
    await userEvent.selectOptions(screen.getByLabelText(/tipo/i), 'SUGESTAO');
    
    // Submeter
    await userEvent.click(screen.getByRole('button', { name: /enviar/i }));
    
    await waitFor(() => {
      expect(mockOnSubmit).toHaveBeenCalledWith({
        titulo: 'Minha sugestão',
        descricao: 'Descrição detalhada',
        tipo: 'SUGESTAO',
      });
    });
  });
  
  it('disables submit button while loading', async () => {
    mockOnSubmit.mockImplementation(
      () => new Promise((resolve) => setTimeout(resolve, 1000))
    );
    
    render(<FeedbackForm onSubmit={mockOnSubmit} />, { wrapper: Wrapper });
    
    await userEvent.type(screen.getByLabelText(/título/i), 'Teste');
    await userEvent.click(screen.getByRole('button', { name: /enviar/i }));
    
    expect(screen.getByRole('button', { name: /enviando/i })).toBeDisabled();
  });
});
```

### Comandos

```bash
# Rodar todos os testes
npm test

# Watch mode
npm test -- --watch

# Com cobertura
npm test -- --coverage

# Arquivo específico
npm test -- Button.test.tsx

# Atualizar snapshots
npm test -- -u
```

---

## 🎭 E2E: Playwright

### Setup

```bash
cd apps/frontend

# Instalar
npm init playwright@latest

# Instalar browsers
npx playwright install
```

### Configuração (playwright.config.ts)

```typescript
// apps/frontend/playwright.config.ts

import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './e2e',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: 'html',
  
  use: {
    baseURL: 'http://localhost:3000',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
  },
  
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
    {
      name: 'firefox',
      use: { ...devices['Desktop Firefox'] },
    },
    {
      name: 'webkit',
      use: { ...devices['Desktop Safari'] },
    },
    {
      name: 'Mobile Chrome',
      use: { ...devices['Pixel 5'] },
    },
  ],
  
  webServer: {
    command: 'npm run dev',
    url: 'http://localhost:3000',
    reuseExistingServer: !process.env.CI,
  },
});
```

### Escrevendo Testes E2E

```typescript
// apps/frontend/e2e/auth.spec.ts

import { test, expect } from '@playwright/test';

test.describe('Authentication', () => {
  test('should login successfully', async ({ page }) => {
    await page.goto('/login');
    
    // Preencher formulário
    await page.fill('input[name="email"]', 'admin@test.com');
    await page.fill('input[name="password"]', 'testpass123');
    
    // Submeter
    await page.click('button[type="submit"]');
    
    // Verificar redirecionamento
    await expect(page).toHaveURL('/dashboard');
    await expect(page.getByText('Dashboard')).toBeVisible();
  });
  
  test('should show error on invalid credentials', async ({ page }) => {
    await page.goto('/login');
    
    await page.fill('input[name="email"]', 'wrong@test.com');
    await page.fill('input[name="password"]', 'wrongpass');
    await page.click('button[type="submit"]');
    
    await expect(page.getByText(/credenciais inválidas/i)).toBeVisible();
  });
  
  test('should redirect to login when not authenticated', async ({ page }) => {
    await page.goto('/dashboard');
    
    await expect(page).toHaveURL(/\/login/);
  });
  
  test('should logout successfully', async ({ page }) => {
    // Login primeiro
    await page.goto('/login');
    await page.fill('input[name="email"]', 'admin@test.com');
    await page.fill('input[name="password"]', 'testpass123');
    await page.click('button[type="submit"]');
    await page.waitForURL('/dashboard');
    
    // Logout
    await page.click('[data-testid="user-menu"]');
    await page.click('text=Sair');
    
    // Verificar redirecionamento
    await expect(page).toHaveURL('/login');
  });
});
```

```typescript
// apps/frontend/e2e/feedbacks.spec.ts

import { test, expect } from '@playwright/test';

test.describe('Feedbacks', () => {
  test.beforeEach(async ({ page }) => {
    // Login antes de cada teste
    await page.goto('/login');
    await page.fill('input[name="email"]', 'admin@test.com');
    await page.fill('input[name="password"]', 'testpass123');
    await page.click('button[type="submit"]');
    await page.waitForURL('/dashboard');
  });
  
  test('should list feedbacks', async ({ page }) => {
    await page.goto('/dashboard/feedbacks');
    
    await expect(page.getByRole('heading', { name: 'Feedbacks' })).toBeVisible();
    await expect(page.getByTestId('feedback-list')).toBeVisible();
  });
  
  test('should create new feedback', async ({ page }) => {
    await page.goto('/dashboard/feedbacks');
    
    // Abrir modal
    await page.click('button:has-text("Novo Feedback")');
    
    // Preencher formulário
    await page.fill('input[name="titulo"]', 'Feedback E2E Test');
    await page.fill('textarea[name="descricao"]', 'Descrição do teste E2E');
    await page.selectOption('select[name="tipo"]', 'SUGESTAO');
    
    // Submeter
    await page.click('button[type="submit"]:has-text("Criar")');
    
    // Verificar sucesso
    await expect(page.getByText('Feedback criado com sucesso')).toBeVisible();
    await expect(page.getByText('Feedback E2E Test')).toBeVisible();
  });
  
  test('should filter feedbacks by status', async ({ page }) => {
    await page.goto('/dashboard/feedbacks');
    
    // Aplicar filtro
    await page.selectOption('select[name="status"]', 'PENDENTE');
    
    // Verificar que URL tem parâmetro
    await expect(page).toHaveURL(/status=PENDENTE/);
    
    // Verificar badge de filtro ativo
    await expect(page.getByText('1 filtro ativo')).toBeVisible();
  });
  
  test('should search feedbacks', async ({ page }) => {
    await page.goto('/dashboard/feedbacks');
    
    // Digitar busca
    await page.fill('input[placeholder*="Buscar"]', 'teste');
    
    // Aguardar debounce
    await page.waitForTimeout(500);
    
    // Verificar que resultados são filtrados
    const results = page.locator('[data-testid="feedback-card"]');
    const count = await results.count();
    
    // Todos resultados devem conter "teste"
    for (let i = 0; i < count; i++) {
      await expect(results.nth(i)).toContainText(/teste/i);
    }
  });
  
  test('should paginate feedbacks', async ({ page }) => {
    await page.goto('/dashboard/feedbacks');
    
    // Verificar que paginação existe
    const pagination = page.getByRole('navigation', { name: /pagination/i });
    await expect(pagination).toBeVisible();
    
    // Clicar próxima página
    await page.click('button[aria-label="Próxima página"]');
    
    // Verificar URL
    await expect(page).toHaveURL(/page=2/);
  });
});
```

### Page Objects Pattern

```typescript
// apps/frontend/e2e/pages/LoginPage.ts

import { Page, Locator, expect } from '@playwright/test';

export class LoginPage {
  readonly page: Page;
  readonly emailInput: Locator;
  readonly passwordInput: Locator;
  readonly submitButton: Locator;
  readonly errorMessage: Locator;
  
  constructor(page: Page) {
    this.page = page;
    this.emailInput = page.locator('input[name="email"]');
    this.passwordInput = page.locator('input[name="password"]');
    this.submitButton = page.locator('button[type="submit"]');
    this.errorMessage = page.locator('[role="alert"]');
  }
  
  async goto() {
    await this.page.goto('/login');
  }
  
  async login(email: string, password: string) {
    await this.emailInput.fill(email);
    await this.passwordInput.fill(password);
    await this.submitButton.click();
  }
  
  async expectError(message: string) {
    await expect(this.errorMessage).toContainText(message);
  }
}

// Uso:
test('login with page object', async ({ page }) => {
  const loginPage = new LoginPage(page);
  await loginPage.goto();
  await loginPage.login('admin@test.com', 'testpass123');
  await expect(page).toHaveURL('/dashboard');
});
```

### Comandos

```bash
# Rodar todos E2E
npx playwright test

# Com UI
npx playwright test --ui

# Headed (ver browser)
npx playwright test --headed

# Debug mode
npx playwright test --debug

# Browser específico
npx playwright test --project=chromium

# Arquivo específico
npx playwright test e2e/auth.spec.ts

# Relatório HTML
npx playwright show-report
```

---

## ✅ Boas Práticas

### AAA Pattern (Arrange, Act, Assert)

```python
def test_create_feedback(self, api_client, team_member):
    # ARRANGE - preparar dados
    api_client.force_authenticate(user=team_member.user)
    data = {'titulo': 'Teste', 'tipo': 'SUGESTAO'}
    
    # ACT - executar ação
    response = api_client.post('/api/feedbacks/', data)
    
    # ASSERT - verificar resultado
    assert response.status_code == 201
    assert response.data['titulo'] == 'Teste'
```

### Nomes Descritivos

```python
# ❌ Ruim
def test_feedback():
    ...

# ✅ Bom
def test_create_feedback_with_empty_title_returns_400():
    ...
```

### Um Assert por Teste (quando possível)

```python
# ✅ Focado
def test_feedback_has_tracking_code():
    feedback = Feedback.objects.create(titulo='Teste', tipo='SUGESTAO')
    assert feedback.codigo_rastreio is not None

def test_tracking_code_has_8_characters():
    feedback = Feedback.objects.create(titulo='Teste', tipo='SUGESTAO')
    assert len(feedback.codigo_rastreio) == 8
```

### Isolar Testes

```python
# ✅ Cada teste é independente
@pytest.fixture(autouse=True)
def reset_database(db):
    yield
    Feedback.objects.all().delete()
```

### Mock Dependências Externas

```python
from unittest.mock import patch

def test_send_email_notification(self, feedback):
    with patch('apps.feedbacks.tasks.send_email') as mock_email:
        notify_new_feedback(feedback.id)
        
        mock_email.assert_called_once()
        call_args = mock_email.call_args[0]
        assert feedback.titulo in call_args[1]
```

---

## 🔄 CI/CD Integration

### GitHub Actions

```yaml
# .github/workflows/test.yml

name: Tests

on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main, develop]

jobs:
  backend-tests:
    runs-on: ubuntu-latest
    services:
      postgres:
        image: postgres:15
        env:
          POSTGRES_PASSWORD: postgres
        options: >-
          --health-cmd pg_isready
          --health-interval 10s
    
    steps:
      - uses: actions/checkout@v4
      
      - name: Setup Python
        uses: actions/setup-python@v4
        with:
          python-version: '3.11'
      
      - name: Install dependencies
        run: |
          cd apps/backend
          pip install -r requirements.txt
      
      - name: Run tests
        env:
          DATABASE_URL: postgresql://postgres:postgres@localhost/test
        run: |
          cd apps/backend
          pytest --cov=apps --cov-report=xml
      
      - name: Upload coverage
        uses: codecov/codecov-action@v3
        with:
          file: ./apps/backend/coverage.xml
  
  frontend-tests:
    runs-on: ubuntu-latest
    
    steps:
      - uses: actions/checkout@v4
      
      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '18'
      
      - name: Install dependencies
        run: |
          cd apps/frontend
          npm ci
      
      - name: Run unit tests
        run: |
          cd apps/frontend
          npm test -- --coverage
      
      - name: Install Playwright
        run: npx playwright install --with-deps
      
      - name: Run E2E tests
        run: |
          cd apps/frontend
          npx playwright test
      
      - name: Upload test report
        uses: actions/upload-artifact@v3
        if: always()
        with:
          name: playwright-report
          path: apps/frontend/playwright-report/
```

---

## 📊 Métricas de Qualidade

| Métrica | Target | Atual |
|---------|--------|-------|
| Backend Coverage | 80%+ | 82% |
| Frontend Coverage | 70%+ | 75% |
| E2E Pass Rate | 100% | 100% |
| Test Execution Time | <5min | 3min |

---

## 🔗 Recursos

- [Pytest Documentation](https://docs.pytest.org/)
- [Django Testing](https://docs.djangoproject.com/en/5.1/topics/testing/)
- [React Testing Library](https://testing-library.com/docs/react-testing-library/intro/)
- [Playwright Documentation](https://playwright.dev/docs/intro)
- [Testing Best Practices](https://github.com/goldbergyoni/javascript-testing-best-practices)

---

*Última atualização: 29/01/2026*
