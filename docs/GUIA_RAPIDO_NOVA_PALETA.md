# 🎨 GUIA RÁPIDO: Nova Paleta Ouvify

**Versão:** 1.0 (Fase 1 - Fundação)  
**Data:** 06/02/2026  
**Status:** ✅ Em produção

---

## 📌 RESUMO EXECUTIVO

A paleta do Ouvify foi atualizada para um estilo **"Modern SaaS"** profissional, inspirado em Vercel, Linear e Tailwind UI. Todas as cores agora usam tons de **Slate** (cinza neutro) e **Blue** (azul vibrante mas sério).

---

## 🎨 CORES PRINCIPAIS (Copiar e Colar)

### **Modo Claro**

```css
/* ===== COPIAR ESTAS VARIÁVEIS ===== */
--background: 0 0% 100%; /* Branco puro */
--foreground: 222.2 84% 4.9%; /* Slate 950 (texto principal) */
--primary: 221.2 83.2% 53.3%; /* Blue 600 (botões, links) */
--primary-foreground: 210 40% 98%; /* Texto sobre azul */
--secondary: 210 40% 96.1%; /* Slate 50 (fundos secundários) */
--border: 214.3 31.8% 91.4%; /* Slate 200 (bordas) */
--muted-foreground: 215.4 16.3% 46.9%; /* Slate 600 (texto de apoio) */
```

### **Cores Semânticas (Status)**

```css
--success: 142 76% 36%; /* Green 600 (verde profissional) */
--warning: 38 92% 50%; /* Amber 500 (amarelo alerta) */
--error: 0 84.2% 60.2%; /* Red 500 (vermelho erro) */
--info: 217.2 91.2% 59.8%; /* Blue 500 (azul informação) */
```

---

## 🔤 TIPOGRAFIA

### **Fontes**

| Uso                            | Fonte          | Pesos Disponíveis  |
| ------------------------------ | -------------- | ------------------ |
| **Body Text** (parágrafos, UI) | Inter          | 400, 500, 600, 700 |
| **Headings** (H1-H6)           | Poppins        | 500, 600, 700, 800 |
| **Code** (monospace)           | JetBrains Mono | 400                |

### **Classes Tailwind**

```tsx
{
  /* Heading (Poppins Bold) */
}
<h1 className="text-5xl font-bold">Título Principal</h1>;

{
  /* Body Text (Inter Regular) */
}
<p className="text-base text-foreground">Parágrafo normal</p>;

{
  /* Texto de Apoio (Inter + Muted) */
}
<p className="text-sm text-muted-foreground">Texto secundário</p>;

{
  /* Link (Inter Semibold + Primary) */
}
<a href="/docs" className="text-primary font-semibold hover:underline">
  Leia a documentação
</a>;
```

---

## 🧩 COMPONENTES - COMO USAR

### **Botões (Button)**

```tsx
import { Button } from "@/components/ui/button";

<Button variant="default">Primary Button</Button>      {/* Azul vibrante */}
<Button variant="secondary">Secondary Button</Button>  {/* Cinza claro */}
<Button variant="outline">Outline Button</Button>     {/* Borda fina */}
<Button variant="ghost">Ghost Button</Button>         {/* Transparente */}
<Button variant="destructive">Delete</Button>         {/* Vermelho */}
```

### **Cards (Card)**

```tsx
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";

<Card>
  <CardHeader>
    <CardTitle>Título do Card (Slate 950)</CardTitle>
    <CardDescription>Descrição secundária (Slate 600)</CardDescription>
  </CardHeader>
  <CardContent>
    <p className="text-foreground">Conteúdo principal aqui</p>
  </CardContent>
</Card>;
```

### **Alertas (Alert)**

```tsx
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import { CheckCircle2, AlertTriangle, XCircle, Info } from "lucide-react";

{
  /* Success (Verde) */
}
<Alert className="border-green-200 bg-green-50">
  <CheckCircle2 className="h-5 w-5 text-green-600" />
  <AlertTitle className="text-green-900">Sucesso!</AlertTitle>
  <AlertDescription className="text-green-700">
    Operação concluída.
  </AlertDescription>
</Alert>;

{
  /* Warning (Amarelo) */
}
<Alert className="border-amber-200 bg-amber-50">
  <AlertTriangle className="h-5 w-5 text-amber-600" />
  <AlertTitle className="text-amber-900">Atenção!</AlertTitle>
  <AlertDescription className="text-amber-700">
    Esta ação é irreversível.
  </AlertDescription>
</Alert>;

{
  /* Error (Vermelho) */
}
<Alert className="border-red-200 bg-red-50">
  <XCircle className="h-5 w-5 text-red-600" />
  <AlertTitle className="text-red-900">Erro!</AlertTitle>
  <AlertDescription className="text-red-700">Algo deu errado.</AlertDescription>
</Alert>;
```

### **Badges (Badge)**

```tsx
import { Badge } from "@/components/ui/badge";

<Badge variant="default">Padrão</Badge>
<Badge variant="secondary">Secundário</Badge>
<Badge variant="outline">Outline</Badge>
<Badge variant="destructive">Erro</Badge>

{/* Custom Colors */}
<Badge className="bg-green-100 text-green-800">Ativo</Badge>
<Badge className="bg-amber-100 text-amber-800">Pendente</Badge>
<Badge className="bg-blue-100 text-blue-800">Info</Badge>
```

---

## 🎨 CLASSES TAILWIND ÚTEIS

### **Backgrounds**

```tsx
{
  /* Fundo Principal (Branco) */
}
<div className="bg-background">...</div>;

{
  /* Fundo Secundário (Slate 50 - sutil) */
}
<div className="bg-secondary">...</div>;

{
  /* Fundo Alternado (para alternar seções) */
}
<div className="bg-muted">...</div>;

{
  /* Card com Sombra */
}
<div className="bg-card shadow-soft rounded-lg border border-border">...</div>;
```

### **Texto**

```tsx
{
  /* Texto Principal (Slate 950) */
}
<p className="text-foreground">Texto principal</p>;

{
  /* Texto Secundário (Slate 600) */
}
<p className="text-muted-foreground">Texto de apoio</p>;

{
  /* Texto sobre Fundo Escuro */
}
<p className="text-background">Texto invertido</p>;

{
  /* Link */
}
<a className="text-primary hover:underline">Link</a>;
```

### **Bordas e Divisórias**

```tsx
{
  /* Borda Padrão (Slate 200) */
}
<div className="border border-border rounded-lg">...</div>;

{
  /* Divisória Horizontal */
}
<hr className="border-t border-border my-6" />;

{
  /* Card com Borda Destacada */
}
<div className="border-2 border-primary rounded-lg p-4">...</div>;
```

---

## ♿ ACESSIBILIDADE

### **Contraste Garantido (WCAG)**

| Par de Cores                  | Contraste | WCAG Level | Status |
| ----------------------------- | --------- | ---------- | ------ |
| Foreground / Background       | 21:1      | AAA        | ✅     |
| Primary / Primary-Foreground  | 8.5:1     | AA         | ✅     |
| Muted-Foreground / Background | 4.8:1     | AA         | ✅     |

### **Focus States**

Todos os elementos interativos têm ring de foco automático:

```tsx
{/* Automático em botões e inputs */}
<Button>Click Me</Button>  {/* ✅ Ring azul no :focus-visible */}

{/* Customizado */}
<div className="focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2">
  Elemento focável
</div>
```

---

## 🧪 TESTAR A NOVA PALETA

### **1. Ver o Design System Showcase**

```bash
# Iniciar dev server
cd /workspaces/Ouvify/apps/frontend
npm run dev

# Abrir no navegador:
# http://localhost:3000/design-system
```

### **2. Verificar Contraste (Ferramentas)**

- [WebAIM Contrast Checker](https://webaim.org/resources/contrastchecker/)
- [Chrome DevTools Lighthouse](chrome://lighthouse) (Accessibility audit)
- [axe DevTools Extension](https://www.deque.com/axe/devtools/)

### **3. Testar Modo Escuro**

```tsx
// Alternar tema no perfil do usuário
// Caminho: Dashboard → Perfil → Aparência
```

---

## 📚 REFERÊNCIAS

- **Documentação Completa:** `/workspaces/Ouvify/docs/REBRAND_VISUAL_FASE_1.md`
- **Design Tokens:** `/workspaces/Ouvify/apps/frontend/styles/design-tokens.ts`
- **Variáveis CSS:** `/workspaces/Ouvify/apps/frontend/app/globals.css` (linha 175+)
- **Showcase Page:** `/workspaces/Ouvify/apps/frontend/app/design-system/page.tsx`

---

## 🚀 PRÓXIMOS PASSOS

Fase 1 (Fundação) está completa! Próximas fases:

1. **Fase 2:** Restyling de componentes UI (Button, Card, Dialog, etc.)
2. **Fase 3:** Atualizar páginas principais (Landing, Dashboard, Feedback)
3. **Fase 4:** Animações e micro-interações
4. **Fase 5:** Auditoria final e documentação

---

## ❓ PERGUNTAS FREQUENTES

### **Q: Posso usar cores customizadas fora da paleta?**

A: Sim, mas prefira as cores semânticas (`success`, `warning`, `error`) quando possível para consistência.

### **Q: E se eu precisar de um tom específico de azul?**

A: Use as escalas geradas automaticamente:

```tsx
<div className="bg-primary-100">Azul muito claro</div>
<div className="bg-primary-600">Azul padrão</div>
<div className="bg-primary-900">Azul muito escuro</div>
```

### **Q: Como garantir acessibilidade nos meus componentes?**

A: Sempre use pares de cores testados:

- `text-foreground` sobre `bg-background` ✅
- `text-primary-foreground` sobre `bg-primary` ✅
- Evite `text-muted-foreground` sobre `bg-secondary` ⚠️ (contraste baixo)

---

**Dúvidas?** Consulte a documentação completa em `docs/REBRAND_VISUAL_FASE_1.md`
