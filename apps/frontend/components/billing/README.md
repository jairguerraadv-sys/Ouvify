# Billing Components

Componentes React para gerenciar e exibir informações de billing e feature gating.

**Sprint 4 - FASE 1 (MOTOR SAAS & GATING)**

---

## 📦 Componentes Disponíveis

### 1. `<UpgradeAlert />`

Alerta visual para notificar usuários sobre limites de plano.

**Características:**
- Exibe apenas para plano Free
- Mostra apenas quando próximo (>80%) ou no limite (100%)
- Alerta amarelo (warning) ou vermelho (destructive)
- Barra de progresso visual
- CTA "Fazer Upgrade"

**Uso:**
```tsx
import { UpgradeAlert } from '@/components/billing/UpgradeAlert';

export default function DashboardPage() {
  return (
    <div>
      <UpgradeAlert />
      {/* resto do conteúdo */}
    </div>
  );
}
```

**Props:**
```typescript
interface UpgradeAlertProps {
  className?: string;           // Classe CSS adicional
  forceShow?: boolean;          // Força exibição (útil para testes)
  upgradeUrl?: string;          // URL customizada do botão
}
```

**Exemplo com Props:**
```tsx
<UpgradeAlert 
  className="my-6"
  upgradeUrl="/dashboard/billing/plans"
/>
```

**Estados Visuais:**

- **Alerta Amarelo (80-99%):**
  ```
  ⚠️ Próximo ao Limite de Feedbacks
  Você usou 45 de 50 feedbacks (90%) este mês.
  [Barra amarela: 90%]
  [Fazer Upgrade]
  ```

- **Alerta Vermelho (100%):**
  ```
  🚫 Limite de Feedbacks Atingido
  Você atingiu o limite de 50 feedbacks/mês.
  Não será possível criar novos até o próximo mês ou upgrade.
  [Barra vermelha: 100%]
  ⚡ Plano Pro: Feedbacks Ilimitados
  [Fazer Upgrade]
  ```

---

### 2. `<UsageBadge />`

Badge compacto para exibir uso atual (ideal para headers/navbars).

**Características:**
- Mostra apenas se próximo ou no limite
- Badge vermelho ou amarelo conforme severidade
- Ícone + texto compacto

**Uso:**
```tsx
import { UsageBadge } from '@/components/billing/UpgradeAlert';

export default function Header() {
  return (
    <header>
      <h1>Dashboard</h1>
      <UsageBadge className="ml-auto" />
    </header>
  );
}
```

**Output:**
```
🔒 45/50 feedbacks   (quando no limite)
⚠️ 45/50 feedbacks   (quando próximo)
```

---

### 3. `<CreateFeedbackButton />`

Botão "Criar Feedback" com bloqueio automático no limite.

**Características:**
- Desabilita automaticamente se `isAtLimit`
- Mostra ícone de cadeado quando bloqueado
- Tooltip explicativo

**Uso:**
```tsx
import { CreateFeedbackButton } from '@/components/billing/UpgradeAlert';

export default function FeedbackList() {
  return (
    <div>
      <h1>Feedbacks</h1>
      <CreateFeedbackButton href="/dashboard/feedbacks/novo">
        Novo Feedback
      </CreateFeedbackButton>
    </div>
  );
}
```

**Props:**
```typescript
interface CreateFeedbackButtonProps {
  href: string;                 // URL de destino (OBRIGATÓRIO)
  children?: React.ReactNode;   // Texto do botão
  className?: string;           // Classe CSS adicional
}
```

**Estados:**

- **Normal (pode criar):**
  ```tsx
  <Button>Novo Feedback</Button>
  ```

- **Bloqueado (limite atingido):**
  ```tsx
  <Button disabled title="Limite de feedbacks atingido">
    🔒 Novo Feedback
  </Button>
  ```

---

## 🔌 Hook: `useUsageLimits()`

Hook para acessar estatísticas de uso e limites.

**Localização:** `hooks/use-usage-limits.ts`

**Características:**
- Usa SWR para cache e auto-refresh
- Atualiza a cada 60 segundos
- Revalida ao focar na janela
- Helpers computados para checks comuns

**Uso:**
```tsx
import { useUsageLimits } from '@/hooks/use-usage-limits';

function MyComponent() {
  const { 
    usage,              // Dados brutos da API
    isLoading,          // Se está carregando
    isNearLimit,        // Se >80%
    isAtLimit,          // Se 100%
    canCreateFeedback,  // Se pode criar
    usageText,          // "45 de 50 feedbacks (90%)"
    usagePercent,       // 90.0
    feedbacksRemaining, // 5
  } = useUsageLimits();

  if (isLoading) return <Loading />;
  
  return (
    <div>
      <p>{usageText}</p>
      <Progress value={usagePercent} />
      <Button disabled={!canCreateFeedback}>Criar</Button>
    </div>
  );
}
```

**Interface de Retorno:**
```typescript
{
  usage: UsageStats | undefined;
  isLoading: boolean;
  error: any;
  refetch: () => void;
  
  // Computed helpers
  isNearLimit: boolean;        // usage_percent > 80
  isAtLimit: boolean;          // is_blocked === true
  isFreePlan: boolean;         // plan === 'free'
  canCreateFeedback: boolean;  // !is_blocked
  usageText: string;           // String formatada
  usagePercent: number;        // 0-100
  feedbacksRemaining: number;  // Restantes (-1 = ilimitado)
}
```

**API Response (`UsageStats`):**
```typescript
interface UsageStats {
  plan: string;            // 'free', 'pro', 'enterprise'
  plan_name: string;       // 'Free', 'Pro', 'Enterprise'
  feedbacks_used: number;  // 45
  feedbacks_limit: number; // 50 (-1 = ilimitado)
  usage_percent: number;   // 90.0
  is_blocked: boolean;     // true se >= limite
  is_near_limit: boolean;  // true se > 80%
}
```

---

## 📚 Exemplos de Uso

### Exemplo 1: Dashboard com Alerta

```tsx
// app/dashboard/page.tsx
import { UpgradeAlert } from '@/components/billing/UpgradeAlert';

export default function DashboardPage() {
  return (
    <div className="container py-8">
      {/* Alerta no topo da página */}
      <UpgradeAlert />
      
      <h1>Dashboard</h1>
      {/* resto do conteúdo */}
    </div>
  );
}
```

### Exemplo 2: Header com Badge

```tsx
// components/Header.tsx
import { UsageBadge } from '@/components/billing/UpgradeAlert';

export function Header() {
  return (
    <header className="flex items-center justify-between p-4">
      <h1>Ouvify</h1>
      <div className="flex items-center gap-4">
        <UsageBadge />
        <UserMenu />
      </div>
    </header>
  );
}
```

### Exemplo 3: Lista de Feedbacks com Botão Bloqueável

```tsx
// app/dashboard/feedbacks/page.tsx
import { CreateFeedbackButton } from '@/components/billing/UpgradeAlert';

export default function FeedbacksPage() {
  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1>Feedbacks</h1>
        <CreateFeedbackButton href="/dashboard/feedbacks/novo">
          + Novo Feedback
        </CreateFeedbackButton>
      </div>
      
      <FeedbackList />
    </div>
  );
}
```

### Exemplo 4: Modal de Criação com Validação

```tsx
// components/CreateFeedbackModal.tsx
import { useUsageLimits } from '@/hooks/use-usage-limits';
import { UpgradeAlert } from '@/components/billing/UpgradeAlert';

export function CreateFeedbackModal() {
  const { isAtLimit, canCreateFeedback } = useUsageLimits();
  
  if (isAtLimit) {
    return (
      <Dialog>
        <DialogContent>
          <UpgradeAlert />
          <DialogFooter>
            <Button asChild>
              <Link href="/dashboard/configuracoes/plano">
                Ver Planos
              </Link>
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    );
  }
  
  return <FeedbackForm />;
}
```

### Exemplo 5: Condicional Baseado em Limite

```tsx
// app/dashboard/settings/page.tsx
import { useUsageLimits } from '@/hooks/use-usage-limits';

export default function SettingsPage() {
  const { usage, isFreePlan, feedbacksRemaining } = useUsageLimits();
  
  return (
    <div>
      <h1>Configurações</h1>
      
      {isFreePlan && (
        <Card>
          <CardHeader>
            <CardTitle>Plano Atual: {usage?.plan_name}</CardTitle>
          </CardHeader>
          <CardContent>
            <p>Feedbacks restantes este mês: {feedbacksRemaining}</p>
            <Button asChild className="mt-4">
              <Link href="/dashboard/configuracoes/plano">
                Fazer Upgrade para Pro
              </Link>
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
```

---

## 🎨 Customização de Estilos

### Personalizar Cores do Alerta

```tsx
// Usar className para sobrescrever estilos
<UpgradeAlert 
  className="border-l-8 shadow-lg my-8"
/>
```

### Usar Badge com Estilos Customizados

```tsx
<UsageBadge className="text-xs font-bold uppercase tracking-wide" />
```

### Botão com Variante Customizada

```tsx
import { useUsageLimits } from '@/hooks/use-usage-limits';
import { Button } from '@/components/ui/button';

function CustomButton() {
  const { canCreateFeedback, isAtLimit } = useUsageLimits();
  
  return (
    <Button 
      disabled={!canCreateFeedback}
      variant={isAtLimit ? 'destructive' : 'default'}
      size="lg"
    >
      {isAtLimit ? '🔒 Limite Atingido' : '+ Criar Feedback'}
    </Button>
  );
}
```

---

## 🧪 Testes

### Testar com Dados Mockados

```tsx
// Em storybook ou testes
import { SWRConfig } from 'swr';

const mockUsageData = {
  plan: 'free',
  plan_name: 'Free',
  feedbacks_used: 45,
  feedbacks_limit: 50,
  usage_percent: 90,
  is_blocked: false,
  is_near_limit: true,
};

export function TestComponent() {
  return (
    <SWRConfig value={{ 
      fallback: { 
        '/api/v1/billing/usage/': mockUsageData 
      } 
    }}>
      <UpgradeAlert />
    </SWRConfig>
  );
}
```

### Forçar Exibição do Alerta

```tsx
// Útil para visualizar no Storybook
<UpgradeAlert forceShow={true} />
```

---

## 🔧 Troubleshooting

### Problema: Alerta não aparece

**Checklist:**
1. ✅ Usuário está autenticado?
2. ✅ Plano é Free?
3. ✅ Uso está > 80%?
4. ✅ API `/api/v1/billing/usage/` retorna dados?

**Debug:**
```tsx
function DebugUsage() {
  const { usage, isNearLimit, isAtLimit, isFreePlan } = useUsageLimits();
  
  console.log({
    usage,
    isNearLimit,
    isAtLimit,
    isFreePlan,
  });
  
  return <pre>{JSON.stringify(usage, null, 2)}</pre>;
}
```

### Problema: Hook não atualiza

**Solução:** Forçar revalidação
```tsx
const { refetch } = useUsageLimits();

// Após criar feedback
await createFeedback(data);
refetch(); // Atualiza contador
```

### Problema: Botão não desabilita

**Checklist:**
1. ✅ Usando `<CreateFeedbackButton />` ou verificando `canCreateFeedback`?
2. ✅ `isAtLimit` retorna `true`?
3. ✅ API retorna `is_blocked: true`?

**Debug:**
```tsx
function DebugButton() {
  const { canCreateFeedback, isAtLimit, usage } = useUsageLimits();
  
  return (
    <div>
      <p>Can Create: {String(canCreateFeedback)}</p>
      <p>Is At Limit: {String(isAtLimit)}</p>
      <p>Usage: {usage?.feedbacks_used}/{usage?.feedbacks_limit}</p>
      
      <CreateFeedbackButton href="/novo">Criar</CreateFeedbackButton>
    </div>
  );
}
```

---

## 📖 Documentação Relacionada

- **Implementação Completa:** [`docs/FEATURE_GATING_IMPLEMENTATION.md`](../../docs/FEATURE_GATING_IMPLEMENTATION.md)
- **Backend API:** `apps/backend/apps/billing/views.py` → `UsageStatsView`
- **Hook SWR:** `apps/frontend/hooks/use-usage-limits.ts`

---

## 🚀 Roadmap

**Melhorias Futuras:**

- [ ] Tooltip com detalhes ao passar mouse no Badge
- [ ] Animação de pulso quando próximo do limite
- [ ] Histórico de uso mensal (gráfico)
- [ ] Notificações push quando atingir 90%
- [ ] Modal de upgrade inline (sem navegar)

---

**Desenvolvido em:** Sprint 4 - FASE 1 (MOTOR SAAS & GATING)  
**Última Atualização:** 2026-02-05
