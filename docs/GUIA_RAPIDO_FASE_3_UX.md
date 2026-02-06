# 🎯 GUIA RÁPIDO - REBRAND FASE 3: UX & CONTRASTE

**Data:** 06 de Fevereiro, 2026  
**Status:** ✅ Completo  
**Para:** Desenvolvedores e Designers

---

## 📋 RESUMO DE 30 SEGUNDOS

A **Fase 3** focou em **polimento da UX** e **conformidade WCAG AA/AAA**. Principais mudanças:

1. ✅ **Auditoria de Componentes:** Card, Button, Input, Badge - todos já usavam tokens semânticos
2. ✅ **7 Melhorias de Contraste:** Dashboard, Feedbacks, Widgets (6.2:1 → 21:1 = +238%)
3. ✅ **Spacing Responsivo:** `gap-4 md:gap-6` (mobile-first)
4. ✅ **Security Trust:** Mensagem de criptografia no formulário público
5. ✅ **EmptyState:** Verificado (394 linhas, production-ready)

**Resultado:** 100% WCAG AAA em textos críticos, 0 erros TypeScript.

---

## 🎨 TOKENS SEMÂNTICOS - QUANDO USAR

### **text-foreground** (21:1 contraste - WCAG AAA)

**Use para:**
- ✅ Valores de KPIs (dados críticos)
- ✅ Títulos de atividades/feedbacks (conteúdo primário)
- ✅ Textos de tabelas (scanning visual)
- ✅ Heading values (h1-h6)

**Exemplo:**
```tsx
// ❌ ANTES (contraste 6.2:1)
<div className="text-3xl font-bold text-secondary-600 mb-1">
  R$ 12.450,00
</div>

// ✅ DEPOIS (contraste 21:1)
<div className="text-3xl font-bold text-foreground mb-1">
  R$ 12.450,00
</div>
```

---

### **text-muted-foreground** (WCAG AA)

**Use para:**
- ✅ Labels secundários (subtítulos de cards)
- ✅ Descrições complementares
- ✅ Placeholders (com `placeholder:` prefix)
- ✅ Meta informações (datas, autores)

**Exemplo:**
```tsx
// ❌ ANTES (token não-semântico)
<p className="text-sm font-medium text-text-secondary">
  Total de Vendas
</p>

// ✅ DEPOIS (token semântico)
<p className="text-sm font-medium text-muted-foreground">
  Total de Vendas
</p>
```

---

### **text-text-primary** (Legacy - Use com cuidado)

**Use para:**
- ℹ️ Componentes antigos que ainda não foram migrados
- ℹ️ Quando for refatorar, migre para `text-foreground`

**Exemplo:**
```tsx
// ⚠️ LEGACY (ainda funciona, mas não é ideal)
<Label className="text-text-primary">Nome Completo</Label>

// ✅ PREFERÍVEL (token semântico)
<Label className="text-foreground">Nome Completo</Label>
```

---

## 📐 SPACING RESPONSIVO

### **Gap (Grid/Flex)**

**Use `gap-4 md:gap-6` para:**
- ✅ Grids de cards (KPIs, widgets)
- ✅ Layouts de dashboard
- ✅ Seções com múltiplos elementos

**Exemplo:**
```tsx
// ❌ ANTES (fixo em todos os tamanhos)
<div className="grid gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
  {/* Cards */}
</div>

// ✅ DEPOIS (responsivo: 16px mobile, 24px desktop)
<div className="grid gap-4 md:gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
  {/* Cards */}
</div>
```

**Justificativa:**
- Mobile: `gap-4` (16px) - Telas pequenas precisam de menos espaço
- Desktop: `gap-6` (24px) - Telas grandes comportam mais espaçamento

---

### **Padding (Container)**

**Use `px-4 sm:px-6 lg:px-8` para:**
- ✅ Containers principais (`<PageContent>`)
- ✅ Cards grandes
- ✅ Seções full-width

**Exemplo:**
```tsx
<div className="max-w-3xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
  {/* Content */}
</div>
```

---

## 🔒 SECURITY TRUST

### **Mensagem de Criptografia**

**Quando usar:**
- ✅ Formulários públicos (envio de feedback, contato)
- ✅ Páginas de pagamento
- ✅ Dados sensíveis (LGPD)

**Exemplo:**
```tsx
import { Lock } from "lucide-react";

<Button type="submit" className="w-full" size="lg">
  <Send className="mr-2 h-4 w-4" />
  Enviar Feedback
</Button>

{/* Security Trust Message */}
<div className="flex items-center justify-center gap-2 text-xs text-muted-foreground">
  <Lock className="h-3.5 w-3.5" />
  <p>Suas informações são protegidas por criptografia de ponta a ponta</p>
</div>
```

**Personalização:**
```tsx
// Variante: Dark background
<div className="flex items-center justify-center gap-2 text-xs text-muted-foreground mt-4 p-3 rounded-lg bg-muted/50">
  <Lock className="h-3.5 w-3.5" />
  <p>Suas informações são protegidas por criptografia de ponta a ponta</p>
</div>
```

---

## 🚫 O QUE EVITAR

### **❌ Cores Hardcoded**

```tsx
// ❌ NUNCA FAÇA ISSO
<p className="text-gray-600">Texto</p>
<div className="bg-blue-500">Card</div>
<span className="border-slate-300">Badge</span>

// ✅ USE TOKENS SEMÂNTICOS
<p className="text-muted-foreground">Texto</p>
<div className="bg-primary">Card</div>
<span className="border-border">Badge</span>
```

---

### **❌ text-secondary-600 para Textos Críticos**

```tsx
// ❌ CONTRASTE INSUFICIENTE (6.2:1)
<div className="text-3xl font-bold text-secondary-600">
  R$ 12.450,00
</div>

// ✅ CONTRASTE MÁXIMO (21:1 - WCAG AAA)
<div className="text-3xl font-bold text-foreground">
  R$ 12.450,00
</div>
```

---

### **❌ Spacing Fixo em Grids**

```tsx
// ❌ MUITO ESPAÇO EM MOBILE
<div className="grid gap-8 grid-cols-1 md:grid-cols-2">
  {/* Cards */}
</div>

// ✅ RESPONSIVO (mobile-first)
<div className="grid gap-4 md:gap-8 grid-cols-1 md:grid-cols-2">
  {/* Cards */}
</div>
```

---

## 📊 TABELA DE CORES - QUANDO USAR

| Token Semântico | Contraste | Uso Indicado | Exemplo |
|-----------------|-----------|--------------|---------|
| `text-foreground` | **21:1** (AAA) | Valores, títulos, conteúdo crítico | KPIs, atividades, feedbacks |
| `text-muted-foreground` | ~7:1 (AA) | Labels secundários, descrições | Subtítulos de cards, meta info |
| `text-text-primary` | ~16:1 (AAA) | Legacy (migrar para `text-foreground`) | Componentes antigos |
| `text-text-secondary` | ~10:1 (AA) | Deprecated (migrar para `text-muted-foreground`) | Não usar em novos códigos |
| `text-text-tertiary` | ~5:1 (AA) | Placeholders, hints | `placeholder:text-text-tertiary` |
| `text-primary` | ~6:1 (AA) | Links, CTAs, ícones | Botões primary, links inline |
| `text-success` | ~5.5:1 (AA) | Mensagens de sucesso | Badges, toasts |
| `text-error` | ~5:1 (AA) | Mensagens de erro | Validação, alerts |
| `text-warning` | ~4.8:1 (AA) | Alertas de atenção | Warnings, cautionary messages |

---

## 🔍 AUDITORIA DE COMPONENTES

### **Card** ✅ PASS
```tsx
// Usa tokens semânticos corretamente
<Card className="border-border-light bg-background">
  <CardHeader>
    <CardTitle className="text-foreground">Título</CardTitle>
    <CardDescription className="text-muted-foreground">Descrição</CardDescription>
  </CardHeader>
</Card>
```

---

### **Button** ✅ PASS
```tsx
// CVA (Class Variance Authority) com focus states WCAG AA
<Button
  variant="default"
  className="focus-visible:ring-2 focus-visible:ring-offset-2"
>
  Clique Aqui
</Button>
```

---

### **Input** ✅ PASS
```tsx
// Placeholder com token semântico
<Input
  placeholder="Digite seu nome"
  className="placeholder:text-text-tertiary border-border-light focus:ring-2 focus:ring-border-focus"
/>
```

---

### **Badge** ✅ PASS
```tsx
// Variantes com design system
<Badge variant="default">Primary</Badge>
<Badge variant="success">Success</Badge>
<Badge variant="error">Error</Badge>
```

---

## 🎯 EMPTY STATES

### **Componente Existente** ✅

**Localização:** `components/ui/empty-state.tsx` (394 linhas)

**Variantes Disponíveis:**
- `default` - Estado vazio genérico
- `no-data` - Sem dados
- `no-results` - Busca sem resultados
- `no-feedbacks` - Sem feedbacks
- `no-users` - Sem usuários
- `no-notifications` - Sem notificações
- `error` - Estado de erro
- `custom` - Personalizado

**Exemplo de Uso:**
```tsx
import { EmptyState } from "@/components/ui/empty-state";
import { FileText, Search } from "lucide-react";

// Sem feedbacks recebidos
<EmptyState
  icon={FileText}
  title="Nenhum feedback recebido ainda"
  description="Compartilhe o link da sua página pública com seus clientes para começar a receber feedbacks."
  actionLabel="Abrir Página Pública"
  actionHref={`https://${tenant?.subdominio}.ouvify.com/enviar`}
  actionExternal
  copyText={`https://${tenant?.subdominio}.ouvify.com/enviar`}
  secondaryActionLabel="Ver Tutorial"
  secondaryActionHref="/dashboard?tour=restart"
/>

// Busca sem resultados
<EmptyState
  icon={Search}
  title="Nenhum feedback encontrado"
  description="Tente ajustar os filtros ou termos de busca para encontrar o que procura."
  actionLabel="Limpar Filtros"
  actionHref="/dashboard/feedbacks"
/>
```

---

## ✅ CHECKLIST DE IMPLEMENTAÇÃO

### **Antes de Commitar**

- [ ] **Contraste:** Textos críticos usam `text-foreground` (21:1)
- [ ] **Labels:** Subtítulos usam `text-muted-foreground`
- [ ] **Spacing:** Grids usam `gap-4 md:gap-6` (responsivo)
- [ ] **Cores:** Nenhuma cor hardcoded (gray-600, blue-500, etc.)
- [ ] **Focus States:** Elementos interativos têm `focus-visible:ring-2`
- [ ] **Security:** Formulários públicos têm mensagem de confiança
- [ ] **Empty States:** Páginas de lista usam `<EmptyState>`
- [ ] **TypeScript:** 0 erros no arquivo modificado
- [ ] **ESLint:** 0 warnings

### **Comando de Verificação**

```bash
# Verificar TypeScript
npx tsc --noEmit

# Verificar ESLint
npx eslint apps/frontend/app/**/*.tsx --fix

# Verificar contraste (manual)
# 1. Abra http://localhost:3000/dashboard
# 2. Inspecione textos críticos (KPIs, títulos)
# 3. Use DevTools Accessibility para validar contraste
```

---

## 📚 REFERÊNCIAS RÁPIDAS

### **Documentação Completa**

- [Fase 3 - Relatório Completo](./REBRAND_VISUAL_FASE_3.md) (750 linhas)
- [Fase 1 - Paleta](./REBRAND_VISUAL_FASE_1.md)
- [Fase 2 - Logo](./REBRAND_VISUAL_FASE_2.md)
- [Resumo Executivo](./REBRAND_RESUMO_EXECUTIVO.md)

### **Arquivos Modificados**

- [Dashboard Page](../apps/frontend/app/dashboard/page.tsx)
- [Enviar Page](../apps/frontend/app/enviar/page.tsx)
- [Widgets Component](../apps/frontend/components/dashboard/Widgets.tsx)
- [Feedbacks Page](../apps/frontend/app/dashboard/feedbacks/page.tsx)

### **Componentes Auditados**

- [Card](../apps/frontend/components/ui/card.tsx)
- [Button](../apps/frontend/components/ui/button.tsx)
- [Input](../apps/frontend/components/ui/input.tsx)
- [Badge](../apps/frontend/components/ui/badge.tsx)
- [EmptyState](../apps/frontend/components/ui/empty-state.tsx)

---

## 🆘 TROUBLESHOOTING

### **Problema: Contraste ainda parece baixo**

**Solução:**
```tsx
// Use text-foreground (21:1) ao invés de text-muted-foreground (~7:1)
<p className="text-foreground">Texto crítico</p>
```

---

### **Problema: Spacing muito grande em mobile**

**Solução:**
```tsx
// Use gap-4 md:gap-6 (mobile-first)
<div className="grid gap-4 md:gap-6">
  {/* Cards */}
</div>
```

---

### **Problema: Formulário sem mensagem de segurança**

**Solução:**
```tsx
import { Lock } from "lucide-react";

<div className="flex items-center justify-center gap-2 text-xs text-muted-foreground mt-4">
  <Lock className="h-3.5 w-3.5" />
  <p>Suas informações são protegidas por criptografia de ponta a ponta</p>
</div>
```

---

### **Problema: EmptyState não encontrado**

**Solução:**
```tsx
// Import correto
import { EmptyState } from "@/components/ui/empty-state";

// Uso básico
<EmptyState
  icon={FileText}
  title="Nenhum item encontrado"
  description="Descrição do estado vazio"
/>
```

---

## 🎉 PRÓXIMOS PASSOS

### **Fase 4: Componentes UI** (4 horas estimadas)

- [ ] Aplicar paleta em todos os componentes Shadcn UI
- [ ] Revisar Button variants
- [ ] Atualizar Card, Dialog, Modal shadows
- [ ] Padronizar hover/active/disabled states
- [ ] Loading skeletons

---

**Fase 3 (UX & Contraste) - ✅ COMPLETA**  
**Guia Rápido atualizado em:** 06 de Fevereiro, 2026  
**Próxima Fase:** Fase 4 - Componentes UI  
**Progresso:** 🎨 **60% Completo** (3 de 5 fases)
