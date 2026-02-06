# Exemplo: Integração do Feature Gating no Dashboard

Este arquivo demonstra como integrar os componentes de Feature Gating em páginas reais do dashboard.

**Sprint 4 - FASE 1 (MOTOR SAAS & GATING)**

---

## 📄 Página Principal do Dashboard

**Arquivo:** `apps/frontend/app/dashboard/page.tsx`

```tsx
import { UpgradeAlert } from "@/components/billing/UpgradeAlert";
import { Suspense } from "react";

export default function DashboardPage() {
  return (
    <div className="container py-8">
      {/* Alerta de limite no topo - sempre visível quando aplicável */}
      <Suspense fallback={null}>
        <UpgradeAlert className="mb-6" />
      </Suspense>

      <div className="grid gap-6">
        <WelcomeCard />
        <StatsCards />
        <RecentFeedbacks />
      </div>
    </div>
  );
}
```

---

## 📝 Página de Lista de Feedbacks

**Arquivo:** `apps/frontend/app/dashboard/feedbacks/page.tsx`

```tsx
import { CreateFeedbackButton } from "@/components/billing/UpgradeAlert";
import { UsageBadge } from "@/components/billing/UpgradeAlert";
import { Suspense } from "react";

export default function FeedbacksPage() {
  return (
    <div className="container py-8">
      {/* Header com Badge e Botão Bloqueável */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <h1 className="text-3xl font-bold">Feedbacks</h1>

          {/* Badge compacto mostrando uso */}
          <Suspense fallback={null}>
            <UsageBadge />
          </Suspense>
        </div>

        {/* Botão que desabilita automaticamente no limite */}
        <CreateFeedbackButton href="/dashboard/feedbacks/novo">
          + Novo Feedback
        </CreateFeedbackButton>
      </div>

      {/* Filtros e Lista */}
      <FeedbackFilters />
      <FeedbackList />
    </div>
  );
}
```

---

## ➕ Página de Criação de Feedback

**Arquivo:** `apps/frontend/app/dashboard/feedbacks/novo/page.tsx`

```tsx
"use client";

import { useUsageLimits } from "@/hooks/use-usage-limits";
import { UpgradeAlert } from "@/components/billing/UpgradeAlert";
import { FeedbackForm } from "@/components/feedbacks/FeedbackForm";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2 } from "lucide-react";

export default function NewFeedbackPage() {
  const { isAtLimit, isLoading, usage } = useUsageLimits();

  // Loading state
  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-6 h-6 animate-spin" />
      </div>
    );
  }

  // Bloqueio por limite
  if (isAtLimit) {
    return (
      <div className="container max-w-2xl py-8">
        <Card>
          <CardHeader>
            <CardTitle>Limite de Feedbacks Atingido</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <UpgradeAlert forceShow />

            <p className="text-sm text-muted-foreground">
              Você atingiu o limite de {usage?.feedbacks_limit} feedbacks/mês do
              plano {usage?.plan_name}. Faça upgrade para o plano Pro para criar
              feedbacks ilimitados.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Formulário normal (com alerta se próximo do limite)
  return (
    <div className="container max-w-2xl py-8">
      <UpgradeAlert className="mb-6" />

      <Card>
        <CardHeader>
          <CardTitle>Novo Feedback</CardTitle>
        </CardHeader>
        <CardContent>
          <FeedbackForm />
        </CardContent>
      </Card>
    </div>
  );
}
```

---

## ⚙️ Página de Configurações de Plano

**Arquivo:** `apps/frontend/app/dashboard/configuracoes/plano/page.tsx`

```tsx
"use client";

import { useUsageLimits } from "@/hooks/use-usage-limits";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Check, Zap } from "lucide-react";

export default function PlanPage() {
  const { usage, usagePercent, feedbacksRemaining, isFreePlan } =
    useUsageLimits();

  return (
    <div className="container py-8">
      <h1 className="text-3xl font-bold mb-6">Planos e Assinaturas</h1>

      {/* Card de Uso Atual */}
      {usage && (
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Plano Atual: {usage.plan_name}</CardTitle>
            <CardDescription>Uso de feedbacks este mês</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium">
                  {usage.feedbacks_used} de {usage.feedbacks_limit} feedbacks
                </span>
                <span className="text-sm text-muted-foreground">
                  {Math.round(usagePercent)}%
                </span>
              </div>
              <Progress value={usagePercent} />
            </div>

            {isFreePlan && (
              <p className="text-sm text-muted-foreground">
                {feedbacksRemaining > 0
                  ? `Você ainda pode criar ${feedbacksRemaining} feedbacks este mês.`
                  : "Você atingiu o limite mensal. Faça upgrade para continuar."}
              </p>
            )}
          </CardContent>
        </Card>
      )}

      {/* Cards de Planos */}
      <div className="grid md:grid-cols-3 gap-6">
        {/* Plano Free */}
        <Card className={isFreePlan ? "border-primary" : ""}>
          <CardHeader>
            <CardTitle>Free</CardTitle>
            <CardDescription>Para começar</CardDescription>
            <div className="mt-2">
              <span className="text-3xl font-bold">R$ 0</span>
              <span className="text-muted-foreground">/mês</span>
            </div>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2">
              <li className="flex items-center gap-2">
                <Check className="w-4 h-4 text-green-600" />
                <span className="text-sm">50 feedbacks/mês</span>
              </li>
              <li className="flex items-center gap-2">
                <Check className="w-4 h-4 text-green-600" />
                <span className="text-sm">1 usuário</span>
              </li>
              <li className="flex items-center gap-2">
                <Check className="w-4 h-4 text-green-600" />
                <span className="text-sm">Suporte básico</span>
              </li>
            </ul>
          </CardContent>
          <CardFooter>
            {isFreePlan ? (
              <Button disabled className="w-full">
                Plano Atual
              </Button>
            ) : (
              <Button variant="outline" className="w-full">
                Downgrade
              </Button>
            )}
          </CardFooter>
        </Card>

        {/* Plano Pro */}
        <Card
          className={
            !isFreePlan ? "border-primary" : "border-2 border-yellow-500"
          }
        >
          <div className="absolute -top-3 left-1/2 -translate-x-1/2">
            <span className="bg-yellow-500 text-white text-xs font-bold px-3 py-1 rounded-full">
              POPULAR
            </span>
          </div>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Zap className="w-5 h-5 text-yellow-600" />
              Pro
            </CardTitle>
            <CardDescription>Para crescer</CardDescription>
            <div className="mt-2">
              <span className="text-3xl font-bold">R$ 99</span>
              <span className="text-muted-foreground">/mês</span>
            </div>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2">
              <li className="flex items-center gap-2">
                <Check className="w-4 h-4 text-green-600" />
                <span className="text-sm font-bold">Feedbacks ilimitados</span>
              </li>
              <li className="flex items-center gap-2">
                <Check className="w-4 h-4 text-green-600" />
                <span className="text-sm">Usuários ilimitados</span>
              </li>
              <li className="flex items-center gap-2">
                <Check className="w-4 h-4 text-green-600" />
                <span className="text-sm">Analytics avançado</span>
              </li>
              <li className="flex items-center gap-2">
                <Check className="w-4 h-4 text-green-600" />
                <span className="text-sm">Suporte prioritário</span>
              </li>
            </ul>
          </CardContent>
          <CardFooter>
            {!isFreePlan ? (
              <Button disabled className="w-full">
                Plano Atual
              </Button>
            ) : (
              <Button className="w-full">Fazer Upgrade</Button>
            )}
          </CardFooter>
        </Card>

        {/* Plano Enterprise */}
        <Card>
          <CardHeader>
            <CardTitle>Enterprise</CardTitle>
            <CardDescription>Para empresas</CardDescription>
            <div className="mt-2">
              <span className="text-3xl font-bold">Custom</span>
            </div>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2">
              <li className="flex items-center gap-2">
                <Check className="w-4 h-4 text-green-600" />
                <span className="text-sm">Tudo do Pro</span>
              </li>
              <li className="flex items-center gap-2">
                <Check className="w-4 h-4 text-green-600" />
                <span className="text-sm">SLA garantido</span>
              </li>
              <li className="flex items-center gap-2">
                <Check className="w-4 h-4 text-green-600" />
                <span className="text-sm">Customizações</span>
              </li>
              <li className="flex items-center gap-2">
                <Check className="w-4 h-4 text-green-600" />
                <span className="text-sm">Account manager</span>
              </li>
            </ul>
          </CardContent>
          <CardFooter>
            <Button variant="outline" className="w-full">
              Falar com Vendas
            </Button>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}
```

---

## 🎯 Header Global com Badge

**Arquivo:** `apps/frontend/components/layout/Header.tsx`

```tsx
"use client";

import { UsageBadge } from "@/components/billing/UpgradeAlert";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Suspense } from "react";

export function Header() {
  return (
    <header className="border-b">
      <div className="container flex items-center justify-between h-16">
        <Link href="/dashboard" className="font-bold text-xl">
          Ouvify
        </Link>

        <nav className="flex items-center gap-4">
          {/* Badge de uso no header global */}
          <Suspense fallback={null}>
            <UsageBadge />
          </Suspense>

          <Link href="/dashboard/feedbacks">
            <Button variant="ghost">Feedbacks</Button>
          </Link>

          <Link href="/dashboard/configuracoes">
            <Button variant="ghost">Configurações</Button>
          </Link>

          <UserMenu />
        </nav>
      </div>
    </header>
  );
}
```

---

## 🔔 Toast Notification ao Atingir Limite

**Arquivo:** `apps/frontend/components/feedbacks/FeedbackForm.tsx`

```tsx
"use client";

import { useUsageLimits } from "@/hooks/use-usage-limits";
import { useToast } from "@/hooks/use-toast";
import { useEffect } from "react";

export function FeedbackForm() {
  const { isNearLimit, isAtLimit, feedbacksRemaining } = useUsageLimits();
  const { toast } = useToast();

  // Notifica quando próximo do limite
  useEffect(() => {
    if (isNearLimit && !isAtLimit && feedbacksRemaining <= 10) {
      toast({
        title: "⚠️ Próximo do Limite",
        description: `Você tem apenas ${feedbacksRemaining} feedbacks restantes este mês.`,
        variant: "warning",
      });
    }
  }, [isNearLimit, isAtLimit, feedbacksRemaining, toast]);

  const handleSubmit = async (data: FeedbackData) => {
    try {
      await createFeedback(data);

      toast({
        title: "✅ Feedback Criado",
        description: "Seu feedback foi criado com sucesso.",
      });

      // Atualiza contador
      refetch();
    } catch (error) {
      if (error.status === 403) {
        toast({
          title: "🚫 Limite Atingido",
          description:
            "Você atingiu o limite de feedbacks. Faça upgrade para continuar.",
          variant: "destructive",
        });
      }
    }
  };

  // ... resto do form
}
```

---

## 📊 Widget de Estatísticas

**Arquivo:** `apps/frontend/components/dashboard/UsageWidget.tsx`

```tsx
"use client";

import { useUsageLimits } from "@/hooks/use-usage-limits";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { TrendingUp } from "lucide-react";

export function UsageWidget() {
  const {
    usage,
    usagePercent,
    isNearLimit,
    isAtLimit,
    feedbacksRemaining,
    isFreePlan,
  } = useUsageLimits();

  if (!usage || !isFreePlan) return null;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Uso de Feedbacks</CardTitle>
        <CardDescription>
          Plano {usage.plan_name} - Ciclo mensal
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <div className="flex items-center justify-between mb-2">
            <span className="text-2xl font-bold">{usage.feedbacks_used}</span>
            <span className="text-sm text-muted-foreground">
              de {usage.feedbacks_limit}
            </span>
          </div>
          <Progress
            value={usagePercent}
            className={
              isAtLimit ? "bg-red-100" : isNearLimit ? "bg-yellow-100" : ""
            }
          />
        </div>

        <div className="text-sm text-muted-foreground">
          {isAtLimit ? (
            <p className="text-red-600 font-medium">
              ⚠️ Limite atingido. Faça upgrade para continuar.
            </p>
          ) : isNearLimit ? (
            <p className="text-yellow-600 font-medium">
              ⚠️ Restam apenas {feedbacksRemaining} feedbacks.
            </p>
          ) : (
            <p>
              Você ainda pode criar {feedbacksRemaining} feedbacks este mês.
            </p>
          )}
        </div>

        {(isNearLimit || isAtLimit) && (
          <Button asChild variant="outline" size="sm" className="w-full">
            <Link href="/dashboard/configuracoes/plano">
              <TrendingUp className="w-4 h-4 mr-2" />
              Ver Planos
            </Link>
          </Button>
        )}
      </CardContent>
    </Card>
  );
}
```

---

## 🎨 Layout Root com Provider SWR

**Arquivo:** `apps/frontend/app/dashboard/layout.tsx`

```tsx
import { SWRConfig } from "swr";
import { Header } from "@/components/layout/Header";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <SWRConfig
      value={{
        // Configurações globais do SWR
        dedupingInterval: 5000,
        revalidateOnFocus: true,
      }}
    >
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-1">{children}</main>
      </div>
    </SWRConfig>
  );
}
```

---

## 🧪 Testes End-to-End (Cypress)

**Arquivo:** `cypress/e2e/feature-gating.cy.ts`

```typescript
describe("Feature Gating - Limites de Plano", () => {
  beforeEach(() => {
    cy.login("free-user@example.com");
  });

  it("Exibe alerta quando próximo do limite (>80%)", () => {
    // Mock API com 45/50 feedbacks
    cy.intercept("GET", "/api/v1/billing/usage/", {
      plan: "free",
      plan_name: "Free",
      feedbacks_used: 45,
      feedbacks_limit: 50,
      usage_percent: 90,
      is_blocked: false,
      is_near_limit: true,
    });

    cy.visit("/dashboard");

    // Alerta deve aparecer
    cy.contains("Próximo ao Limite").should("be.visible");
    cy.contains("45 de 50 feedbacks").should("be.visible");

    // Botão ainda habilitado
    cy.get('[data-testid="create-feedback-btn"]').should("not.be.disabled");
  });

  it("Bloqueia criação quando limite atingido (100%)", () => {
    // Mock API com 50/50 feedbacks
    cy.intercept("GET", "/api/v1/billing/usage/", {
      plan: "free",
      plan_name: "Free",
      feedbacks_used: 50,
      feedbacks_limit: 50,
      usage_percent: 100,
      is_blocked: true,
      is_near_limit: true,
    });

    cy.visit("/dashboard/feedbacks");

    // Alerta vermelho
    cy.contains("Limite de Feedbacks Atingido").should("be.visible");

    // Botão desabilitado
    cy.get('[data-testid="create-feedback-btn"]').should("be.disabled");

    // Tentativa de criar via URL
    cy.visit("/dashboard/feedbacks/novo");
    cy.contains("Limite de Feedbacks Atingido").should("be.visible");
    cy.get("form").should("not.exist");
  });

  it("Permite criação ilimitada no plano Pro", () => {
    // Mock API Pro
    cy.intercept("GET", "/api/v1/billing/usage/", {
      plan: "pro",
      plan_name: "Pro",
      feedbacks_used: 1000,
      feedbacks_limit: -1,
      usage_percent: 0,
      is_blocked: false,
      is_near_limit: false,
    });

    cy.visit("/dashboard");

    // Não deve exibir alerta
    cy.contains("Limite de Feedbacks").should("not.exist");

    // Botão habilitado
    cy.get('[data-testid="create-feedback-btn"]').should("not.be.disabled");
  });
});
```

---

**Desenvolvido em:** Sprint 4 - FASE 1 (MOTOR SAAS & GATING)  
**Última Atualização:** 2026-02-05
