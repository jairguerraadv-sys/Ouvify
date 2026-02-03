# Estratégia de Testes Frontend - Sprint 1

## Status Atual

### Cobertura de Testes
- **122 testes** implementados e passando ✅
- **Cobertura atual**: ~4.15%
- **Meta Sprint 3**: 60%

### Distribuição de Testes

#### Componentes UI (48 testes) ✅
- `Button.test.tsx` - 12 testes (100% cobertura)
- `Input.test.tsx` - 11 testes (98% cobertura)
- `Card.test.tsx` - 8 testes (100% cobertura)
- `Badge.test.tsx` - 8 testes (100% cobertura)
- `Label.test.tsx` - 5 testes (100% cobertura)
- `Separator.test.tsx` - 4 testes (100% cobertura)

#### Bibliotecas (49 testes) ✅
- `utils.test.ts` - 10 testes (100% cobertura)
- `validation.test.ts` - 30 testes (96.56% cobertura)
- `api.test.ts` - 9 testes (27.86% cobertura)

#### Hooks (14 testes) ✅
- `useConfirm.test.tsx` - 9 testes
- `useNotification.test.tsx` - 5 testes (wrapper Sonner)

#### Componentes de Negócio (11 testes) ✅
- `ErrorBoundary.test.tsx` - 11 testes

## Roadmap de Cobertura

### Sprint 1 (Atual): Fundação - 4% → 10%
**Status**: ✅ Completo - 122 testes implementados

**Entregas**:
- [x] Configuração Jest + Testing Library
- [x] Testes componentes UI críticos (6 componentes)
- [x] Testes bibliotecas utilitárias (3 libs)
- [x] Testes hooks customizados (2 hooks)
- [x] CI/CD com GitHub Actions
- [x] Documentação estratégia de testes

**Cobertura**:
- Statements: 4.15%
- Branches: 40.8%
- Functions: 9.27%
- Lines: 4.15%

### Sprint 2: Expansão - 10% → 30%
**Prioridade**: P1
**Estimativa**: 40h

**Componentes a testar**:
1. **Formulários** (8h)
   - ConsentCheckboxes
   - TermsCheckbox
   - FormField
   - Input variants

2. **Autenticação** (8h)
   - AuthContext
   - ProtectedRoute
   - Login page
   - Register page

3. **Dashboard** (12h)
   - Feedbacks list
   - Filtros
   - Paginação
   - Dashboard layout

4. **Feedback Flow** (8h)
   - Formulário de feedback
   - Preview de branding
   - Success card
   - Protocol tracking

5. **Hooks Avançados** (4h)
   - useToast
   - useFormState
   - useDebounce
   - useLocalStorage

**Meta Cobertura**: 30%

### Sprint 3: Cobertura Completa - 30% → 60%
**Prioridade**: P1
**Estimativa**: 60h

**Áreas a cobrir**:
1. **Billing & Plans** (12h)
   - Planos e preços
   - Checkout flow
   - Payment forms

2. **Multitenancy** (12h)
   - Tenant switching
   - Subdomain validation
   - Tenant banner

3. **Notificações** (8h)
   - Notification center
   - Permission prompts
   - Real-time updates

4. **Admin** (12h)
   - User management
   - Tenant settings
   - Analytics dashboard

5. **E2E Critical Flows** (16h)
   - Signup → Onboarding → First feedback
   - Login → Dashboard → View feedback
   - Admin → Manage tenants → Settings

**Meta Cobertura**: 60%

## Configuração de Thresholds

### Atual (Sprint 1)
```typescript
coverageThreshold: {
  global: {
    statements: 4,
    branches: 20,
    functions: 8,
    lines: 4,
  },
}
```

### Sprint 2
```typescript
coverageThreshold: {
  global: {
    statements: 25,
    branches: 30,
    functions: 25,
    lines: 25,
  },
}
```

### Sprint 3 (Meta Final)
```typescript
coverageThreshold: {
  global: {
    statements: 60,
    branches: 50,
    functions: 60,
    lines: 60,
  },
}
```

## Executar Testes

### Comandos Disponíveis

```bash
# Rodar todos os testes
npm test

# Rodar com cobertura
npm run test:coverage

# Rodar em modo watch
npm run test:watch

# Rodar testes específicos
npm test Button.test

# Rodar com relatório detalhado
npm test -- --verbose
```

### CI/CD

Os testes rodam automaticamente em:
- **Push** para qualquer branch
- **Pull Request** para develop/main
- **Matrix**: Node 18.x, 20.x

**Critérios de aprovação**:
- Todos os testes passando
- Cobertura acima dos thresholds
- Build sem erros de lint

## Boas Práticas

### Estrutura de Testes
```typescript
describe('ComponentName', () => {
  it('renders correctly', () => {
    // Arrange
    render(<Component />)
    
    // Assert
    expect(screen.getByText('Hello')).toBeInTheDocument()
  })

  it('handles user interaction', async () => {
    // Arrange
    const user = userEvent.setup()
    const onClick = jest.fn()
    render(<Component onClick={onClick} />)
    
    // Act
    await user.click(screen.getByRole('button'))
    
    // Assert
    expect(onClick).toHaveBeenCalledTimes(1)
  })
})
```

### Nomenclatura
- Arquivos: `ComponentName.test.tsx`
- Describes: Nome do componente/função
- Tests: Comportamento esperado em português ou inglês

### Mocks
```typescript
// Mock API
jest.mock('@/lib/api', () => ({
  apiClient: {
    get: jest.fn(),
    post: jest.fn(),
  },
}))

// Mock Router
jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: jest.fn(),
    replace: jest.fn(),
  }),
}))
```

## Métricas de Sucesso

### Quantitativas
- ✅ 122+ testes implementados
- ✅ 0 testes falhando
- ✅ Build CI/CD verde
- 🔄 4% → 10% cobertura (Sprint 1)
- 🔜 10% → 30% cobertura (Sprint 2)
- 🔜 30% → 60% cobertura (Sprint 3)

### Qualitativas
- Testes legíveis e manuteníveis
- Cobertura de casos edge
- Testes de acessibilidade
- Performance (< 10s para suite completa)

## Próximos Passos

1. **Imediato (Sprint 1)**:
   - [x] Implementar testes base (122 testes)
   - [x] Configurar CI/CD
   - [ ] Criar PR para develop
   - [ ] Code review

2. **Sprint 2**:
   - [ ] Aumentar cobertura para 30%
   - [ ] Adicionar testes de formulários
   - [ ] Adicionar testes de autenticação
   - [ ] Documentar padrões de teste

3. **Sprint 3**:
   - [ ] Atingir meta de 60% cobertura
   - [ ] Implementar E2E com Playwright
   - [ ] Integrar relatórios Codecov
   - [ ] Performance testing

## Referências

- [Testing Library Docs](https://testing-library.com/react)
- [Jest Documentation](https://jestjs.io/)
- [Next.js Testing](https://nextjs.org/docs/testing)
- [IMPLEMENTATION_ROADMAP.md](./IMPLEMENTATION_ROADMAP.md) - Sprint 1 completo
