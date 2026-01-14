# 🎨 QUICK REFERENCE - DESIGN SYSTEM OUVY 2.0

## 🎯 Imports

```tsx
// Componentes de base
import { Button, Card, Input, Badge, Chip } from '@/components/ui'

// Tipografia
import { H1, H2, H3, H4, H5, H6, Paragraph, Lead, Small, Muted } from '@/components/ui'

// Semântico
import { Alert, AlertWithIcon } from '@/components/ui'
import { StatusBadge } from '@/components/ui'
import { Progress } from '@/components/ui'
import { Divider } from '@/components/ui'

// Exibição
import { Avatar } from '@/components/ui'
import { StatsCard } from '@/components/ui'
import { Skeleton } from '@/components/ui'

// Layout
import { NavBar, Footer } from '@/components/ui'
```

---

## 🎨 Paleta de Cores

### CSS Variables (em globals.css)
```css
/* Primary - Cyan */
--primary: 184 100% 39.4%      /* #00BCD4 */
--primary-light: 184 100% 60%   /* #00E5FF */
--primary-dark: 186 75% 35%     /* #0097A7 */

/* Secondary - Navy */
--secondary: 217 69% 14%        /* #0A1E3B */
--secondary-light: 217 50% 24%  /* #1A3A52 */
--secondary-dark: 217 80% 10%   /* #051121 */

/* Semantic */
--success: 132 50% 43%          /* #22C55E */
--warning: 44 97% 56%           /* #FBBF24 */
--error: 0 85% 70%              /* #F87171 */
--info: 217 91% 60%             /* #3B82F6 */
```

### Uso em Tailwind
```tsx
// Background
<div className="bg-primary">...</div>        // #00BCD4
<div className="dark:bg-primary-dark">...</div>

// Texto
<p className="text-secondary">...</p>
<span className="text-success">Ativo</span>

// Border
<input className="border border-primary" />

// Ring (Focus)
<button className="ring-2 ring-primary" />
```

---

## 🔘 Button Variants

```tsx
// Estilos primários
<Button variant="default">Primary</Button>
<Button variant="secondary">Secondary</Button>
<Button variant="ghost">Ghost</Button>

// Outline
<Button variant="outline">Outline</Button>
<Button variant="outline-secondary">Outline Secondary</Button>

// Semântico
<Button variant="success">Success</Button>
<Button variant="warning">Warning</Button>
<Button variant="destructive">Delete</Button>

// Especial
<Button variant="link">Link Style</Button>
<Button variant="ghost-primary">Ghost Primary</Button>

// Tamanhos
<Button size="sm">Small</Button>
<Button size="md">Medium</Button>
<Button size="lg">Large</Button>
<Button size="xl">XL</Button>

// Ícone
<Button size="icon">🔍</Button>
<Button size="icon-sm">×</Button>

// Estados
<Button disabled>Disabled</Button>
<Button aria-busy={true}>Loading...</Button>
```

---

## 📊 Card Variants

```tsx
<Card variant="default">         {/* Subtle background */}
  <CardHeader>
    <CardTitle>Title</CardTitle>
    <CardDescription>Desc</CardDescription>
  </CardHeader>
  <CardContent>Content</CardContent>
  <CardFooter>Footer</CardFooter>
</Card>

<Card variant="elevated">       {/* Drop shadow */}
  ...
</Card>

<Card variant="outlined">       {/* Cyan border */}
  ...
</Card>

<Card variant="ghost">          {/* Minimal style */}
  ...
</Card>
```

---

## 📝 Typography

```tsx
// Headings
<H1>Main Title</H1>         {/* font-size: 2.25rem */}
<H2>Section Title</H2>      {/* font-size: 1.875rem */}
<H3>Subsection</H3>         {/* font-size: 1.5rem */}
<H4>Subheading</H4>         {/* font-size: 1.25rem */}
<H5>Minor Heading</H5>      {/* font-size: 1.125rem */}
<H6>Smallest Heading</H6>   {/* font-size: 1rem */}

// Paragraph
<Paragraph>Normal text</Paragraph>
<Paragraph size="sm">Small text</Paragraph>
<Paragraph size="lg">Large text</Paragraph>
<Paragraph muted>Muted text</Paragraph>

// Especial
<Lead>Prominent intro text</Lead>     {/* Larger, bold */}
<Small>Small disclaimer</Small>
<Muted>Desaturated text</Muted>
```

---

## 🏷️ Badge & Chip

```tsx
// Badges - variantes
<Badge variant="primary">Primary</Badge>
<Badge variant="secondary">Secondary</Badge>
<Badge variant="success">Success</Badge>
<Badge variant="warning">Warning</Badge>
<Badge variant="error">Error</Badge>
<Badge variant="info">Info</Badge>
<Badge variant="outline">Outline</Badge>
<Badge variant="ghost">Ghost</Badge>

// Badge - tamanhos
<Badge size="sm">Small</Badge>
<Badge size="md">Medium</Badge>

// Chips - removível
<Chip
  icon={<TrashIcon />}
  onRemove={() => console.log('removed')}
>
  Removable Tag
</Chip>
<Chip disabled>Disabled Chip</Chip>
```

---

## ⚠️ Alert & StatusBadge

```tsx
// Alert padrão
<Alert
  title="Alert Title"
  description="Description text"
  variant="default"
/>

// Alert com ícones automáticos
<AlertWithIcon
  variant="success"
  title="Success!"
  description="Operation completed"
/>

<AlertWithIcon variant="warning" ... />
<AlertWithIcon variant="error" ... />
<AlertWithIcon variant="info" ... />

// StatusBadge
<StatusBadge status="active" />         {/* Green */}
<StatusBadge status="inactive" />       {/* Gray */}
<StatusBadge status="pending" />        {/* Yellow */}
<StatusBadge status="success" />        {/* Green */}
<StatusBadge status="warning" />        {/* Yellow */}
<StatusBadge status="error" />          {/* Red */}
<StatusBadge status="info" />           {/* Blue */}

// Com rótulo
<StatusBadge status="active" label="Online" />

// Variantes
<StatusBadge status="active" variant="filled" />
<StatusBadge status="active" variant="outline" />
<StatusBadge status="active" variant="soft" />

// Tamanhos
<StatusBadge status="active" size="sm" />
<StatusBadge status="active" size="md" />
<StatusBadge status="active" size="lg" />
```

---

## 📈 Progress & StatsCard

```tsx
// Progress bar
<Progress value={65} variant="default" />
<Progress value={100} variant="success" />
<Progress value={30} variant="warning" />
<Progress value={0} variant="error" />
<Progress value={50} variant="info" />

// Com label
<Progress value={75} showLabel />        {/* Mostra "75%" */}

// StatsCard
<StatsCard
  title="Total Users"
  value="1,234"
  change={12.5}
  period="Last 30 days"
  icon={<UsersIcon />}
/>

{/* Trend negativo */}
<StatsCard
  title="Churn Rate"
  value="2.1%"
  change={-0.3}
  period="vs last month"
/>
```

---

## 👤 Avatar & Divider

```tsx
// Avatar
<Avatar src="/user.jpg" alt="User" size="md" />

// Tamanhos
<Avatar size="sm" />      {/* h-8 */}
<Avatar size="md" />      {/* h-10 */}
<Avatar size="lg" />      {/* h-12 */}
<Avatar size="xl" />      {/* h-16 */}

// Status
<Avatar status="online" />     {/* Green */}
<Avatar status="offline" />    {/* Gray */}
<Avatar status="away" />       {/* Yellow */}
<Avatar status="busy" />       {/* Red */}

// Divider
<Divider />                    {/* Linha simples */}
<Divider variant="dashed" />
<Divider variant="dotted" />
<Divider variant="gradient" />

// Com label
<Divider withLabel>Or</Divider>

// Tamanhos
<Divider size="sm" />  {/* h-px */}
<Divider size="md" />  {/* h-[2px] */}
<Divider size="lg" />  {/* h-1 */}
```

---

## ⏳ Skeleton

```tsx
// Variantes
<Skeleton />                {/* Rounded block */}
<Skeleton variant="circle" />
<Skeleton variant="text" />
<Skeleton variant="avatar" />

// Em lista
<div className="space-y-2">
  <Skeleton />
  <Skeleton />
  <Skeleton variant="text" />
</div>
```

---

## 🧭 NavBar & Footer

```tsx
// NavBar
<NavBar
  links={[
    { label: 'Home', href: '/' },
    { label: 'About', href: '/about' },
  ]}
  sticky={true}
  rightContent={<Button>Sign In</Button>}
/>

// Footer
<Footer
  links={{
    Product: [
      { label: 'Features', href: '#' },
      { label: 'Pricing', href: '#' },
    ],
    Company: [
      { label: 'About', href: '#' },
    ],
  }}
/>
```

---

## 🌙 Dark Mode

```tsx
// No HTML root
<html className="dark">
  ...
</html>

// CSS automático
/* Light mode */
.bg-primary /* #00BCD4 */

/* Dark mode */
.dark .bg-primary /* #0097A7 (darker) */
.dark .text-secondary /* Adjusted for dark */
```

---

## ♿ Accessibility (WCAG 2.1 AA)

```tsx
// ARIA Labels
<Button aria-label="Close menu">×</Button>
<div role="navigation" aria-label="Main nav">...</div>
<div role="status" aria-busy="true">Loading...</div>

// Focus Styles
<button className="focus:ring-2 focus:ring-primary">
  Click me
</button>

// Semantic HTML
<header>
  <nav aria-label="Main">...</nav>
</header>
<main>...</main>
<footer role="contentinfo">...</footer>
```

---

## 📱 Responsive

```tsx
// Mobile-first
<div className="text-sm md:text-base lg:text-lg">
  Responsive text
</div>

// Breakpoints
// sm: 640px   (mobile)
// md: 768px   (tablet)
// lg: 1024px  (desktop)
// xl: 1280px  (large)

<div className="hidden md:block">
  Desktop only
</div>

<nav className="md:flex">
  Mobile menu / Desktop nav
</nav>
```

---

## 📚 Full Example Page

```tsx
import {
  H1, Lead, Paragraph, Badge, Button, Card,
  NavBar, Footer, Alert, AlertWithIcon
} from '@/components/ui'

export default function Home() {
  return (
    <>
      <NavBar
        links={[
          { label: 'Home', href: '/' },
          { label: 'Docs', href: '/docs' },
        ]}
      />

      <main className="min-h-screen bg-gradient-to-br from-primary/5 to-secondary/5">
        <div className="container mx-auto px-4 py-20">
          {/* Hero */}
          <H1>Welcome to Ouvy</H1>
          <Lead className="mt-2">
            Professional ethical channel
          </Lead>

          <div className="mt-8">
            <Badge variant="primary">New Feature</Badge>
            <Paragraph className="mt-4 text-lg">
              Join thousands of professionals
            </Paragraph>
          </div>

          {/* Alerts */}
          <div className="mt-12 space-y-4">
            <AlertWithIcon
              variant="success"
              title="Welcome!"
              description="Your account is ready to use"
            />
          </div>

          {/* Features */}
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mt-16">
            {[1, 2, 3].map(i => (
              <Card key={i} variant="outlined">
                <h3 className="font-bold">Feature {i}</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Description
                </p>
              </Card>
            ))}
          </div>

          {/* CTA */}
          <div className="mt-16 text-center">
            <Button size="lg">Get Started</Button>
          </div>
        </div>
      </main>

      <Footer
        links={{
          Product: [{ label: 'Features', href: '#' }],
        }}
      />
    </>
  )
}
```

---

**Version:** 2.0  
**Last Updated:** January 13, 2026  
**Status:** ✅ PRODUCTION READY
