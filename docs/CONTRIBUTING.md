# Guia de Contribuição - Ouvify

Obrigado pelo interesse em contribuir com o Ouvify! Este documento fornece diretrizes e instruções para contribuidores.

## Índice

1. [Código de Conduta](#código-de-conduta)
2. [Configuração do Ambiente](#configuração-do-ambiente)
3. [Estrutura do Projeto](#estrutura-do-projeto)
4. [Padrões de Código](#padrões-de-código)
5. [Workflow de Desenvolvimento](#workflow-de-desenvolvimento)
6. [Commits e Pull Requests](#commits-e-pull-requests)
7. [Testes](#testes)
8. [Documentação](#documentação)

---

## Código de Conduta

- Seja respeitoso e inclusivo
- Critique ideias, não pessoas
- Aceite feedback construtivo
- Priorize a colaboração

---

## Configuração do Ambiente

### Pré-requisitos

- **Node.js** >= 18.0
- **Python** >= 3.12
- **PostgreSQL** >= 15
- **Redis** >= 7.0
- **Git**

### Setup Inicial

```bash
# 1. Clone o repositório
git clone https://github.com/jairguerraadv-sys/ouvy-saas.git
cd ouvy-saas

# 2. Instale dependências do monorepo
npm install

# 3. Configure o backend Python
cd ouvy_saas
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate
pip install -r requirements.txt

# 4. Configure variáveis de ambiente
cp .env.example .env
# Edite .env com suas configurações

# 5. Execute as migrações
python manage.py migrate

# 6. Crie um superusuário
python manage.py createsuperuser

# 7. Volte para a raiz e inicie o desenvolvimento
cd ..
npm run dev
```

### Variáveis de Ambiente

```bash
# Backend
DATABASE_URL=postgresql://user:pass@localhost:5432/ouvy_db
REDIS_URL=redis://localhost:6379/0
SECRET_KEY=sua-secret-key-aqui
DEBUG=True

# Frontend
NEXT_PUBLIC_API_URL=http://localhost:8000
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

---

## Estrutura do Projeto

```
ouvy-saas/
├── ouvy_frontend/          # Frontend Next.js
│   ├── app/               # App Router (pages)
│   ├── components/        # Componentes React
│   ├── lib/               # Utilitários e API clients
│   ├── hooks/             # Custom React hooks
│   └── contexts/          # Context providers
│
├── ouvy_saas/              # Backend Django
│   ├── apps/              # Django apps
│   │   ├── core/          # Funcionalidades core
│   │   ├── tenants/       # Multi-tenancy
│   │   ├── feedbacks/     # Gestão de feedbacks
│   │   ├── notifications/ # Push notifications
│   │   └── auditlog/      # Audit log
│   └── config/            # Configurações Django
│
├── monitoring/             # Prometheus & Grafana
├── docs/                   # Documentação
├── scripts/                # Scripts utilitários
└── tests/                  # Testes de integração
```

---

## Padrões de Código

### Python (Backend)

- **Style Guide**: PEP 8
- **Formatter**: Black
- **Linter**: Ruff
- **Type Hints**: Obrigatório para funções públicas

```python
# ✅ BOM
def get_feedback_by_protocol(protocol: str, tenant: Client) -> Feedback | None:
    """
    Busca um feedback pelo protocolo.
    
    Args:
        protocol: Número do protocolo
        tenant: Tenant do usuário
        
    Returns:
        Feedback se encontrado, None caso contrário
    """
    return Feedback.objects.filter(
        protocolo=protocol,
        client=tenant
    ).first()


# ❌ RUIM
def get(p, t):
    return Feedback.objects.filter(protocolo=p, client=t).first()
```

### TypeScript (Frontend)

- **Style Guide**: Airbnb
- **Formatter**: Prettier
- **Linter**: ESLint
- **Types**: Evite `any`, prefira tipos explícitos

```typescript
// ✅ BOM
interface FeedbackProps {
  feedback: Feedback;
  onStatusChange: (id: number, status: FeedbackStatus) => Promise<void>;
}

export function FeedbackCard({ feedback, onStatusChange }: FeedbackProps) {
  const handleClick = async () => {
    await onStatusChange(feedback.id, 'em_andamento');
  };
  
  return <Card onClick={handleClick}>{/* ... */}</Card>;
}


// ❌ RUIM
export function FeedbackCard(props: any) {
  return <div onClick={() => props.onStatusChange(props.feedback.id)}></div>;
}
```

### CSS/Tailwind

- Use classes Tailwind sempre que possível
- Evite CSS customizado
- Use variáveis CSS do design system (`--primary`, `--secondary`)

```tsx
// ✅ BOM
<button className="bg-primary text-primary-foreground hover:bg-primary-dark px-4 py-2 rounded-lg">
  Enviar
</button>

// ❌ RUIM
<button style={{ backgroundColor: '#00BCD4', color: 'white' }}>
  Enviar
</button>
```

---

## Workflow de Desenvolvimento

### Branches

```
main          # Produção (protegida)
├── develop   # Desenvolvimento (base para features)
│   ├── feature/xxx   # Nova funcionalidade
│   ├── fix/xxx       # Correção de bug
│   ├── refactor/xxx  # Refatoração
│   └── docs/xxx      # Documentação
```

### Criando uma Feature

```bash
# 1. Atualize develop
git checkout develop
git pull origin develop

# 2. Crie branch da feature
git checkout -b feature/minha-feature

# 3. Desenvolva com commits atômicos
git add .
git commit -m "feat(module): add new functionality"

# 4. Push e crie PR
git push -u origin feature/minha-feature
```

---

## Commits e Pull Requests

### Conventional Commits

Usamos [Conventional Commits](https://www.conventionalcommits.org/) para mensagens padronizadas:

```
<tipo>(<escopo>): <descrição>

[corpo opcional]

[rodapé opcional]
```

#### Tipos Permitidos

| Tipo | Descrição |
|------|-----------|
| `feat` | Nova funcionalidade |
| `fix` | Correção de bug |
| `docs` | Documentação |
| `style` | Formatação (não afeta lógica) |
| `refactor` | Refatoração de código |
| `perf` | Melhoria de performance |
| `test` | Adição/modificação de testes |
| `build` | Build system ou dependências |
| `ci` | Configuração de CI |
| `chore` | Tarefas de manutenção |
| `revert` | Reverter commit anterior |

#### Exemplos

```bash
# Feature
git commit -m "feat(auth): add two-factor authentication"

# Bug fix
git commit -m "fix(feedback): resolve status update race condition"

# Docs
git commit -m "docs(readme): update installation instructions"

# Breaking change
git commit -m "feat(api)!: change authentication to JWT

BREAKING CHANGE: Token authentication is deprecated"
```

### Pull Request Template

```markdown
## Descrição
Breve descrição das mudanças

## Tipo de Mudança
- [ ] Nova funcionalidade
- [ ] Correção de bug
- [ ] Refatoração
- [ ] Documentação

## Checklist
- [ ] Testes passando
- [ ] Código lint-free
- [ ] Documentação atualizada
- [ ] Sem breaking changes (ou documentados)

## Screenshots (se aplicável)
```

---

## Testes

### Backend (pytest)

```bash
# Executar todos os testes
cd ouvy_saas
pytest

# Com coverage
pytest --cov=apps --cov-report=html

# Testes específicos
pytest apps/feedbacks/tests/
pytest -k "test_create_feedback"
```

#### Exemplo de Teste

```python
import pytest
from apps.feedbacks.models import Feedback

@pytest.mark.django_db
class TestFeedbackModel:
    def test_create_feedback_generates_protocol(self, tenant):
        feedback = Feedback.objects.create(
            client=tenant,
            tipo='denuncia',
            conteudo='Teste'
        )
        
        assert feedback.protocolo is not None
        assert len(feedback.protocolo) == 12
    
    def test_feedback_belongs_to_tenant(self, tenant, other_tenant):
        feedback = Feedback.objects.create(
            client=tenant,
            tipo='sugestao',
            conteudo='Teste'
        )
        
        assert feedback.client == tenant
        assert Feedback.objects.filter(client=other_tenant).count() == 0
```

### Frontend (Jest + Testing Library)

```bash
# Executar testes
cd ouvy_frontend
npm test

# Watch mode
npm run test:watch

# Coverage
npm run test:coverage
```

#### Exemplo de Teste

```typescript
import { render, screen, fireEvent } from '@testing-library/react';
import { FeedbackCard } from '@/components/FeedbackCard';

describe('FeedbackCard', () => {
  const mockFeedback = {
    id: 1,
    protocolo: 'ABC123',
    tipo: 'denuncia',
    status: 'pendente',
    conteudo: 'Conteúdo de teste',
  };

  it('renders feedback information', () => {
    render(<FeedbackCard feedback={mockFeedback} />);
    
    expect(screen.getByText('ABC123')).toBeInTheDocument();
    expect(screen.getByText('Denúncia')).toBeInTheDocument();
  });

  it('calls onStatusChange when status is updated', async () => {
    const onStatusChange = jest.fn();
    render(
      <FeedbackCard 
        feedback={mockFeedback} 
        onStatusChange={onStatusChange} 
      />
    );
    
    fireEvent.click(screen.getByText('Iniciar Análise'));
    
    expect(onStatusChange).toHaveBeenCalledWith(1, 'em_andamento');
  });
});
```

### E2E (Playwright)

```bash
# Executar E2E
npm run test:e2e

# UI Mode
npm run test:e2e:ui

# Debug
npm run test:e2e:debug
```

---

## Documentação

### Docstrings (Python)

```python
def create_feedback(
    data: dict,
    user: User | None = None,
    tenant: Client = None
) -> Feedback:
    """
    Cria um novo feedback no sistema.
    
    Args:
        data: Dados do feedback (tipo, conteudo, etc.)
        user: Usuário que está criando (None se anônimo)
        tenant: Tenant/Cliente associado
        
    Returns:
        Feedback: Instância do feedback criado
        
    Raises:
        ValidationError: Se os dados forem inválidos
        PermissionDenied: Se o tenant não permitir feedbacks
        
    Example:
        >>> feedback = create_feedback(
        ...     data={'tipo': 'sugestao', 'conteudo': 'Melhorar UI'},
        ...     tenant=my_tenant
        ... )
        >>> print(feedback.protocolo)
        'ABC123XYZ'
    """
```

### JSDoc (TypeScript)

```typescript
/**
 * Cria um novo feedback via API.
 * 
 * @param data - Dados do feedback
 * @param options - Opções adicionais
 * @returns Promise com o feedback criado
 * 
 * @example
 * ```ts
 * const feedback = await createFeedback({
 *   tipo: 'sugestao',
 *   conteudo: 'Melhorar a UI'
 * });
 * ```
 */
export async function createFeedback(
  data: CreateFeedbackData,
  options?: FeedbackOptions
): Promise<Feedback> {
  // ...
}
```

---

## Recursos Úteis

- [Documentação Django](https://docs.djangoproject.com/)
- [Documentação Next.js](https://nextjs.org/docs)
- [Tailwind CSS](https://tailwindcss.com/docs)
- [React Testing Library](https://testing-library.com/docs/react-testing-library/intro/)
- [Conventional Commits](https://www.conventionalcommits.org/)

---

## Dúvidas?

- Abra uma [Issue](https://github.com/jairguerraadv-sys/ouvy-saas/issues)
- Entre em contato: dev@ouvy.com.br

---

*Última atualização: Janeiro 2026*
