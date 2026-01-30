# 📦 OUVIFY COMPONENT SPECIFICATIONS

**Versão:** 1.0  
**Data:** 30 de Janeiro de 2026  
**Referência técnica para componentes UI**

---

## 📌 OVERVIEW

Este documento especifica os componentes do Design System Ouvify.
Cada componente segue os tokens definidos em `DESIGN_TOKENS.md`.

**Localização:** `apps/frontend/components/ui/`

---

## 🔘 BUTTON

### Variantes

| Variant | Background | Text | Border | Uso |
|---------|------------|------|--------|-----|
| `default` | primary-500 | white | - | CTAs principais |
| `secondary` | secondary-500 | white | - | Ações secundárias |
| `outline` | transparent | foreground | border | Ações terciárias |
| `ghost` | transparent | foreground | - | Ações inline |
| `destructive` | error-500 | white | - | Deletar, remover |
| `success` | success-500 | white | - | Confirmar, salvar |
| `warning` | warning-500 | white | - | Alertas |
| `link` | transparent | primary | - | Links inline |

### Sizes

| Size | Height | Padding X | Font Size | Icon Size |
|------|--------|-----------|-----------|-----------|
| `sm` | 32px | 12px | 14px | 16px |
| `default` | 40px | 16px | 14px | 18px |
| `lg` | 48px | 24px | 16px | 20px |
| `icon` | 40px | 0 (square) | - | 18px |

### States

```tsx
// Normal
bg-primary-500 text-white

// Hover
bg-primary-600

// Active/Pressed
bg-primary-700 scale-[0.98]

// Focus
ring-2 ring-ring ring-offset-2

// Disabled
opacity-50 cursor-not-allowed
```

### Specs

- **Border Radius:** 6px (rounded-md)
- **Font Weight:** 500 (medium)
- **Transition:** 150ms ease
- **Min Width:** 64px
- **Gap (icon + text):** 8px

### Código

```tsx
import { Button } from "@/components/ui/button"

<Button variant="default" size="default">
  Confirmar
</Button>

<Button variant="outline" size="sm">
  <PlusIcon className="mr-2 h-4 w-4" />
  Adicionar
</Button>
```

---

## 📝 INPUT

### Variantes

| Variant | Uso |
|---------|-----|
| `default` | Campos de texto padrão |
| `error` | Validação falhou |
| `success` | Validação passou |

### Specs

| Property | Value |
|----------|-------|
| Height | 40px |
| Padding | 12px 16px |
| Font Size | 14px |
| Border Width | 1px |
| Border Radius | 6px |
| Border Color | gray-200 |
| Background | white |
| Placeholder | gray-400 |

### States

```tsx
// Normal
border-gray-200 bg-white

// Hover
border-gray-300

// Focus
border-primary-500 ring-1 ring-primary-500

// Error
border-error-500 ring-1 ring-error-500

// Disabled
bg-gray-100 opacity-50 cursor-not-allowed
```

### Código

```tsx
import { Input } from "@/components/ui/input"

<Input
  type="email"
  placeholder="email@exemplo.com"
/>

// Com label
<div className="space-y-2">
  <Label htmlFor="email">Email</Label>
  <Input id="email" type="email" />
</div>
```

---

## 🏷️ BADGE

### Variantes

| Variant | Background | Text | Uso |
|---------|------------|------|-----|
| `default` | primary-500 | white | Status ativo |
| `secondary` | gray-100 | gray-900 | Neutro |
| `outline` | transparent | foreground | Outline |
| `destructive` | error-500 | white | Erro, crítico |
| `success` | success-100 | success-700 | Sucesso |
| `warning` | warning-100 | warning-700 | Atenção |

### Specs

| Property | Value |
|----------|-------|
| Height | 22px |
| Padding | 2px 10px |
| Font Size | 12px |
| Font Weight | 500 |
| Border Radius | 9999px (full) |
| Letter Spacing | 0 |

### Código

```tsx
import { Badge } from "@/components/ui/badge"

<Badge variant="success">Ativo</Badge>
<Badge variant="warning">Pendente</Badge>
<Badge variant="destructive">Inativo</Badge>
```

---

## 🃏 CARD

### Estrutura

```tsx
<Card>           // Container
  <CardHeader>   // Título + descrição
    <CardTitle />
    <CardDescription />
  </CardHeader>
  <CardContent>  // Conteúdo principal
    ...
  </CardContent>
  <CardFooter>   // Ações
    ...
  </CardFooter>
</Card>
```

### Specs

| Property | Value |
|----------|-------|
| Background | white |
| Border | 1px gray-200 |
| Border Radius | 8px (rounded-lg) |
| Shadow | shadow-sm |
| Padding Header | 24px |
| Padding Content | 0 24px 24px |
| Padding Footer | 0 24px 24px |

### Variantes

| Variant | Sombra | Uso |
|---------|--------|-----|
| `default` | shadow-sm | Cards padrão |
| `elevated` | shadow-md | Cards destacados |
| `outline` | none | Cards com borda |
| `ghost` | none | Cards sem borda |

### Código

```tsx
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card"

<Card>
  <CardHeader>
    <CardTitle>Plano Pro</CardTitle>
    <CardDescription>Para equipes em crescimento</CardDescription>
  </CardHeader>
  <CardContent>
    <p className="text-3xl font-bold">R$ 99/mês</p>
  </CardContent>
  <CardFooter>
    <Button className="w-full">Assinar</Button>
  </CardFooter>
</Card>
```

---

## 🔔 ALERT

### Variantes

| Variant | Icon | Background | Border | Uso |
|---------|------|------------|--------|-----|
| `default` | Info | gray-50 | gray-200 | Informação |
| `info` | Info | info-50 | info-200 | Dicas |
| `success` | Check | success-50 | success-200 | Sucesso |
| `warning` | Alert | warning-50 | warning-200 | Atenção |
| `destructive` | X | error-50 | error-200 | Erro |

### Specs

| Property | Value |
|----------|-------|
| Padding | 16px |
| Border Radius | 8px |
| Border Width | 1px |
| Icon Size | 20px |
| Title Size | 14px bold |
| Description Size | 14px |
| Gap | 12px |

### Código

```tsx
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"

<Alert variant="success">
  <CheckIcon className="h-4 w-4" />
  <AlertTitle>Sucesso!</AlertTitle>
  <AlertDescription>
    Suas alterações foram salvas.
  </AlertDescription>
</Alert>
```

---

## 💬 DIALOG (Modal)

### Specs

| Property | Value |
|----------|-------|
| Backdrop | black/50 |
| Background | white |
| Border Radius | 12px |
| Max Width | 425px (sm) / 600px (default) |
| Padding | 24px |
| Shadow | shadow-xl |
| Animation | scale-in 200ms |

### Estrutura

```tsx
<Dialog>
  <DialogTrigger />
  <DialogContent>
    <DialogHeader>
      <DialogTitle />
      <DialogDescription />
    </DialogHeader>
    {/* Conteúdo */}
    <DialogFooter>
      <DialogClose />
      {/* Botões */}
    </DialogFooter>
  </DialogContent>
</Dialog>
```

### Código

```tsx
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"

<Dialog>
  <DialogTrigger asChild>
    <Button>Abrir Modal</Button>
  </DialogTrigger>
  <DialogContent>
    <DialogHeader>
      <DialogTitle>Confirmar ação</DialogTitle>
      <DialogDescription>
        Tem certeza que deseja continuar?
      </DialogDescription>
    </DialogHeader>
    <DialogFooter>
      <Button variant="outline">Cancelar</Button>
      <Button>Confirmar</Button>
    </DialogFooter>
  </DialogContent>
</Dialog>
```

---

## 🍞 TOAST

### Variantes

| Variant | Background | Border | Icon |
|---------|------------|--------|------|
| `default` | white | gray-200 | - |
| `success` | success-50 | success-200 | ✓ |
| `error` | error-50 | error-200 | ✕ |
| `warning` | warning-50 | warning-200 | ⚠ |

### Specs

| Property | Value |
|----------|-------|
| Position | bottom-right |
| Width | 360px |
| Padding | 16px |
| Border Radius | 8px |
| Shadow | shadow-lg |
| Duration | 5000ms |
| Animation | slide-in-from-right |

### Código

```tsx
import { useToast } from "@/hooks/use-toast"

const { toast } = useToast()

toast({
  title: "Sucesso!",
  description: "Ação concluída com sucesso.",
  variant: "success",
})
```

---

## 📑 TABS

### Specs

| Property | Value |
|----------|-------|
| List BG | gray-100 |
| List Padding | 4px |
| List Radius | 8px |
| Tab Height | 36px |
| Tab Padding | 12px 16px |
| Tab Radius | 6px |
| Active BG | white |
| Active Shadow | shadow-sm |
| Font Size | 14px |
| Font Weight | 500 |

### Código

```tsx
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

<Tabs defaultValue="overview">
  <TabsList>
    <TabsTrigger value="overview">Visão Geral</TabsTrigger>
    <TabsTrigger value="analytics">Analytics</TabsTrigger>
    <TabsTrigger value="settings">Configurações</TabsTrigger>
  </TabsList>
  <TabsContent value="overview">...</TabsContent>
  <TabsContent value="analytics">...</TabsContent>
  <TabsContent value="settings">...</TabsContent>
</Tabs>
```

---

## 📊 TABLE

### Specs

| Property | Value |
|----------|-------|
| Header BG | gray-50 |
| Header Font | 12px 500 uppercase |
| Row Height | 52px |
| Cell Padding | 16px |
| Border | 1px gray-200 bottom |
| Hover Row | gray-50 |
| Selected Row | primary-50 |

### Código

```tsx
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"

<Table>
  <TableHeader>
    <TableRow>
      <TableHead>Nome</TableHead>
      <TableHead>Email</TableHead>
      <TableHead>Status</TableHead>
    </TableRow>
  </TableHeader>
  <TableBody>
    <TableRow>
      <TableCell>João Silva</TableCell>
      <TableCell>joao@email.com</TableCell>
      <TableCell><Badge>Ativo</Badge></TableCell>
    </TableRow>
  </TableBody>
</Table>
```

---

## 🧭 NAVIGATION

### Navbar

| Property | Value |
|----------|-------|
| Height | 64px |
| Background | white |
| Border Bottom | 1px gray-200 |
| Shadow | shadow-sm |
| Logo Size | 32px height |
| Nav Item | 14px 500 |
| Nav Item Padding | 8px 12px |
| Z-index | 100 |

### Sidebar

| Property | Value |
|----------|-------|
| Width | 280px (expanded) / 64px (collapsed) |
| Background | white |
| Border Right | 1px gray-200 |
| Item Height | 44px |
| Item Padding | 12px 16px |
| Item Radius | 6px |
| Item Active BG | primary-50 |
| Item Active Text | primary-600 |
| Icon Size | 20px |

---

## 📍 AVATAR

### Sizes

| Size | Dimensions |
|------|------------|
| `sm` | 32px |
| `default` | 40px |
| `lg` | 48px |
| `xl` | 64px |
| `2xl` | 96px |

### Specs

| Property | Value |
|----------|-------|
| Border Radius | 9999px (full) |
| Fallback BG | gray-200 |
| Fallback Text | 14px 500 |
| Ring (online) | 2px success-500 |

### Código

```tsx
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

<Avatar>
  <AvatarImage src="/avatar.jpg" alt="João" />
  <AvatarFallback>JS</AvatarFallback>
</Avatar>
```

---

## 📐 SKELETON

### Specs

| Property | Value |
|----------|-------|
| Background | gray-200 |
| Animation | pulse 2s infinite |
| Border Radius | 6px |

### Código

```tsx
import { Skeleton } from "@/components/ui/skeleton"

<div className="space-y-4">
  <Skeleton className="h-12 w-12 rounded-full" />
  <Skeleton className="h-4 w-[250px]" />
  <Skeleton className="h-4 w-[200px]" />
</div>
```

---

## 🔄 SPINNER / LOADING

### Sizes

| Size | Dimensions |
|------|------------|
| `sm` | 16px |
| `default` | 24px |
| `lg` | 32px |
| `xl` | 48px |

### Specs

| Property | Value |
|----------|-------|
| Animation | spin 1s linear infinite |
| Stroke Width | 2px |
| Color | primary-500 |
| Track Color | gray-200 |

---

## 📋 SELECT / DROPDOWN

### Specs

| Property | Value |
|----------|-------|
| Trigger Height | 40px |
| Trigger Padding | 12px 16px |
| Trigger Radius | 6px |
| Content BG | white |
| Content Shadow | shadow-md |
| Content Radius | 8px |
| Item Height | 36px |
| Item Padding | 8px 12px |
| Item Hover | gray-100 |
| Checkmark Color | primary-500 |

---

## 📅 DATE PICKER

### Specs

| Property | Value |
|----------|-------|
| Popover Width | 280px |
| Day Cell | 36px x 36px |
| Day Radius | 6px |
| Selected BG | primary-500 |
| Today BG | gray-100 |
| Hover BG | gray-50 |
| Header Height | 44px |

---

## 🎛️ SWITCH / TOGGLE

### Specs

| Property | Value |
|----------|-------|
| Width | 44px |
| Height | 24px |
| Thumb Size | 20px |
| Off BG | gray-200 |
| On BG | primary-500 |
| Transition | 150ms |

---

## ✅ CHECKBOX

### Specs

| Property | Value |
|----------|-------|
| Size | 20px |
| Border Radius | 4px |
| Border | 2px gray-300 |
| Checked BG | primary-500 |
| Check Color | white |
| Focus Ring | 2px ring-offset-2 |

---

## 📻 RADIO

### Specs

| Property | Value |
|----------|-------|
| Size | 20px |
| Border | 2px gray-300 |
| Checked Border | primary-500 |
| Dot Size | 10px |
| Dot Color | primary-500 |

---

## 📏 PROGRESS

### Specs

| Property | Value |
|----------|-------|
| Height | 8px |
| Border Radius | 9999px |
| Track BG | gray-200 |
| Indicator BG | primary-500 |
| Transition | 300ms |

---

## 🔧 PADRÕES DE USO

### Composição

```tsx
// ✅ Correto: usar variants
<Button variant="destructive">Deletar</Button>

// ❌ Errado: override manual
<Button className="bg-red-500">Deletar</Button>
```

### Acessibilidade

```tsx
// ✅ Sempre incluir labels
<Label htmlFor="email">Email</Label>
<Input id="email" type="email" />

// ✅ ARIA labels para ícones
<Button size="icon" aria-label="Fechar">
  <XIcon />
</Button>
```

### Responsividade

```tsx
// ✅ Mobile-first
<div className="flex flex-col md:flex-row gap-4">
  <Card className="flex-1">...</Card>
  <Card className="flex-1">...</Card>
</div>
```

---

## 📖 REFERÊNCIAS

- Design Tokens: `docs/design/DESIGN_TOKENS.md`
- Brand Guidelines: `docs/design/BRAND_GUIDELINES_OUVIFY.md`
- Tailwind Config: `apps/frontend/tailwind.config.ts`
- shadcn/ui: https://ui.shadcn.com/docs/components

---

*Ouvify Component Specifications v1.0 - Janeiro 2026*
