# 🚀 Guia de Implementação das Melhorias

## 📦 Instalação de Dependências

### Frontend

```bash
cd ouvy_frontend

# Dependências de teste
npm install -D jest @testing-library/react @testing-library/jest-dom @testing-library/user-event jest-environment-jsdom

# Integração Next.js com Jest
npm install -D @types/jest

# Analytics e Monitoring (opcional - Vercel)
npm install @vercel/analytics @vercel/speed-insights

# Atualizar Axios
npm update axios
```

### Backend

```bash
cd ouvy_saas

# Documentação API (Swagger)
pip install drf-yasg==1.21.7

# Error tracking (Sentry - opcional)
pip install sentry-sdk

# Adicionar ao requirements.txt
echo "drf-yasg==1.21.7" >> requirements.txt
```

## 🔐 Configuração da Autenticação

### 1. Middleware já configurado ✅

O arquivo `middleware.ts` protege as rotas automaticamente:
- `/dashboard/*` - Requer autenticação
- `/admin/*` - Requer autenticação  
- `/login`, `/cadastro` - Redireciona se já autenticado

### 2. AuthContext implementado ✅

Funcionalidades disponíveis:
```tsx
const { user, login, logout, register, isAuthenticated, loading } = useAuth();

// Login
await login('email@example.com', 'senha123');

// Logout
logout();

// Verificar autenticação
if (isAuthenticated) {
  // Usuário logado
}
```

### 3. Integração nas páginas

Para usar autenticação em qualquer página:

```tsx
'use client';

import { useAuth } from '@/hooks/useAuth';

export default function MinhaPage() {
  const { user, loading, isAuthenticated } = useAuth();

  if (loading) return <div>Carregando...</div>;
  if (!isAuthenticated) return <div>Não autorizado</div>;

  return <div>Olá, {user?.name}!</div>;
}
```

## 🧪 Executar Testes

```bash
cd ouvy_frontend

# Executar todos os testes
npm test

# Modo watch (desenvolvimento)
npm run test:watch

# Gerar relatório de cobertura
npm run test:coverage
```

### Estrutura de testes criada:

```
__tests__/
├── Button.test.tsx        # Testes do componente Button
└── validation.test.ts     # Testes de validação
```

### Adicionar novos testes:

```tsx
// __tests__/MeuComponente.test.tsx
import { render, screen } from '@testing-library/react';
import MeuComponente from '@/components/MeuComponente';

describe('MeuComponente', () => {
  it('renderiza corretamente', () => {
    render(<MeuComponente />);
    expect(screen.getByText('Texto esperado')).toBeInTheDocument();
  });
});
```

## 📚 Documentação da API (Swagger)

### 1. Adicionar ao settings.py:

```python
INSTALLED_APPS = [
    # ... outras apps
    'drf_yasg',
]
```

### 2. Adicionar ao urls.py principal:

```python
from config.swagger import swagger_urlpatterns

urlpatterns = [
    # ... outras urls
] + swagger_urlpatterns
```

### 3. Acessar documentação:

- **Swagger UI**: http://localhost:8000/api/docs/
- **ReDoc**: http://localhost:8000/api/redoc/
- **JSON Schema**: http://localhost:8000/api/schema/

## ♿ Melhorias de Acessibilidade

Implementadas:
- ✅ ARIA labels em botões interativos
- ✅ role="alert" para mensagens de erro
- ✅ aria-live para atualizações dinâmicas
- ✅ aria-expanded para menus expansíveis
- ✅ Navegação por teclado melhorada

### Como adicionar em novos componentes:

```tsx
// Botões de ação
<button aria-label="Fechar modal" onClick={closeModal}>
  <X />
</button>

// Mensagens de erro/sucesso
<div role="alert" aria-live="polite">
  {errorMessage}
</div>

// Menus expansíveis
<button 
  aria-expanded={isOpen}
  aria-controls="menu-id"
  aria-label="Abrir menu"
>
```

## 🔍 SEO e Metadados

### Uso da função generateSEO:

```tsx
// app/sua-pagina/page.tsx
import { generateSEO } from '@/lib/seo';

export const metadata = generateSEO({
  title: 'Título da Página',
  description: 'Descrição detalhada para SEO',
  keywords: ['palavra-chave', 'ouvidoria', 'feedback'],
  url: '/sua-pagina',
  image: '/imagem-custom.png', // opcional
});
```

### Adicionar Schema.org:

```tsx
import { OrganizationSchema } from '@/components/StructuredData';

export default function Page() {
  return (
    <>
      <OrganizationSchema />
      {/* Seu conteúdo */}
    </>
  );
}
```

## 📊 Analytics (Opcional - Vercel)

### 1. Instalar:
```bash
npm install @vercel/analytics @vercel/speed-insights
```

### 2. Adicionar ao layout.tsx:

```tsx
import { Analytics } from '@vercel/analytics/react';
import { SpeedInsights } from '@vercel/speed-insights/next';

export default function RootLayout({ children }) {
  return (
    <html>
      <body>
        {children}
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  );
}
```

## 🐛 Error Tracking (Sentry - Opcional)

### 1. Instalar:
```bash
npx @sentry/wizard@latest -i nextjs
```

### 2. Configurar:
O wizard criará automaticamente os arquivos necessários.

## 🔄 CI/CD (GitHub Actions)

Criar `.github/workflows/test.yml`:

```yaml
name: Tests
on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    
    steps:
      - uses: actions/checkout@v3
      
      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '20'
          
      - name: Install dependencies
        run: npm ci
        working-directory: ./ouvy_frontend
        
      - name: Run tests
        run: npm test
        working-directory: ./ouvy_frontend
        
      - name: Build
        run: npm run build
        working-directory: ./ouvy_frontend
```

## 🎯 Próximos Passos

### Imediato:
1. ✅ Instalar dependências de teste
2. ✅ Executar `npm test` para validar
3. ✅ Instalar drf-yasg no backend
4. ✅ Acessar http://localhost:8000/api/docs/

### Curto Prazo (1-2 semanas):
1. Adicionar mais testes de componentes
2. Implementar Sentry para error tracking
3. Configurar CI/CD no GitHub
4. Migrar para PostgreSQL

### Médio Prazo (1 mês):
1. Implementar Analytics
2. Adicionar i18n (internacionalização)
3. PWA features
4. Dark mode

## 📝 Checklist de Implementação

- [x] AuthContext e useAuth criados
- [x] Middleware de proteção de rotas
- [x] Configuração de testes (Jest)
- [x] Testes iniciais (Button, Validation)
- [x] Swagger/OpenAPI setup
- [x] ARIA labels nos componentes principais
- [x] Funções de SEO e metadados
- [x] Schema.org structured data
- [ ] Instalar dependências (`npm install -D ...`)
- [ ] Executar testes (`npm test`)
- [ ] Instalar drf-yasg backend
- [ ] Configurar Swagger no Django
- [ ] Adicionar Analytics (opcional)
- [ ] Configurar Sentry (opcional)
- [ ] Setup CI/CD (opcional)

## 🆘 Troubleshooting

### Erro: "useAuth must be used within AuthProvider"
**Solução**: Verificar se `AuthProvider` está envolvendo a aplicação em `app/layout.tsx`

### Erro: Middleware não protege rotas
**Solução**: Limpar cache do Next.js: `rm -rf .next && npm run dev`

### Testes falham: "Cannot find module '@/...'"
**Solução**: Verificar `tsconfig.json` e `jest.config.ts` com paths corretos

### Swagger não aparece
**Solução**: 
1. Instalar: `pip install drf-yasg`
2. Adicionar em INSTALLED_APPS
3. Incluir swagger_urlpatterns no urls.py
4. Reiniciar servidor Django

## 📞 Suporte

- **Issues**: Criar issue no repositório
- **Documentação**: Ver AUDITORIA_PROJETO.md
- **Contato**: support@ouvy.com

---

**Última atualização**: 14/01/2026  
**Versão**: 1.0
