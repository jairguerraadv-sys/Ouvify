# 🎨 White Label Integration Examples

**Guia de Integração para Desenvolvedores**

Este documento contém exemplos práticos de como integrar o sistema White Label do Ouvify em novos componentes, páginas e features.

---

## 📚 Índice

1. [Quick Start](#quick-start)
2. [Hook useTenantTheme()](#hook-usetenanttheme)
3. [App lication em Componentes](#application-em-componentes)
4. [Componentes Customizados](#componentes-customizados)
5. [SSR e Next.js](#ssr-e-nextjs)
6. [Temas Avançados](#temas-avançados)
7. [Testing](#testing)

---

## Quick Start

### Importar e Usar o Hook

```tsx
import { useTenantTheme } from '@/hooks/use-tenant-theme';

export default function MyComponent() {
  const theme = useTenantTheme();
  
  if (!theme) {
    return <Skeleton />;
  }
  
  return (
    <div>
      <h1>{theme.nome}</h1>
      {theme.logo && <img src={theme.logo} alt={theme.nome} />}
    </div>
  );
}
```

**Features automáticas:**
- ✅ Cores aplicadas via CSS variables
- ✅ Fonte carregada dinamicamente
- ✅ Favicon atualizado
- ✅ Cache de 5 minutos

---

## Hook useTenantTheme()

### Interface do Retorno

```typescript
interface TenantTheme {
  nome: string;                    // Nome do tenant
  subdominio: string;              // Subdomínio
  logo: string | null;             // URL da logo (Cloudinary)
  cor_primaria: string;            // HSL: "199 89% 48%"
  cor_secundaria?: string | null;  // HSL
  cor_texto?: string | null;       // HSL
  fonte_customizada?: string | null; // "Roboto", "Inter"
  favicon?: string | null;         // URL do favicon
}
```

### Uso Básico

```tsx
import { useTenantTheme } from '@/hooks/use-tenant-theme';

function Header() {
  const theme = useTenantTheme();
  
  return (
    <header className="bg-primary text-primary-foreground">
      {theme?.logo ? (
        <img src={theme.logo} alt={theme.nome} className="h-12" />
      ) : (
        <h1>{theme?.nome || 'Ouvify'}</h1>
      )}
    </header>
  );
}
```

### Loading State

```tsx
function MyPage() {
  const theme = useTenantTheme();
  
  // Opções para loading:
  
  // 1. Skeleton
  if (!theme) {
    return <Skeleton className="h-12 w-48" />;
  }
  
  // 2. Spinner
  if (!theme) {
    return <Spinner />;
  }
  
  // 3. Render sem logo (fallback)
  return (
    <div>
      {theme?.logo ? (
        <img src={theme.logo} />
      ) : (
        <DefaultLogo />
      )}
    </div>
  );
}
```

### Error Handling

```tsx
function SafeComponent() {
  const theme = useTenantTheme();
  
  // O hook já tem fallback interno, mas você pode adicionar:
  const safeName = theme?.nome || 'Sistema';
  const safeLogo = theme?.logo || '/default-logo.png';
  
  return (
    <div>
      <h1>{safeName}</h1>
      <img src={safeLogo} alt={safeName} />
    </div>
  );
}
```

---

## Application em Componentes

### 1. Headers e Navbars

```tsx
import { useTenantTheme } from '@/hooks/use-tenant-theme';
import Link from 'next/link';

export function PublicHeader() {
  const theme = useTenantTheme();
  
  return (
    <header className="bg-card border-b">
      <div className="container mx-auto px-4 py-3">
        <Link href="/" className="flex items-center gap-3">
          {theme?.logo ? (
            <img 
              src={theme.logo} 
              alt={theme.nome}
              className="h-12 w-auto object-contain"
            />
          ) : (
            <>
              <DefaultLogo size="md" />
              {theme?.nome && theme.nome !== 'Ouvify' && (
                <span className="text-xl font-semibold text-primary">
                  {theme.nome}
                </span>
              )}
            </>
          )}
        </Link>
      </div>
    </header>
  );
}
```

### 2. Footer com Branding

```tsx
export function BrandedFooter() {
  const theme = useTenantTheme();
  
  return (
    <footer className="bg-muted py-8 mt-auto">
      <div className="container mx-auto text-center">
        {theme?.logo && (
          <img 
            src={theme.logo} 
            alt={theme.nome}
            className="h-8 mx-auto mb-4 opacity-70"
          />
        )}
        <p className="text-sm text-muted-foreground">
          © {new Date().getFullYear()} {theme?.nome || 'Ouvify'}. 
          Todos os direitos reservados.
        </p>
      </div>
    </footer>
  );
}
```

### 3. Cards com Cor Primária

```tsx
import { Card, CardHeader, CardTitle } from '@/components/ui/card';

export function BrandedCard({ title, children }: Props) {
  const theme = useTenantTheme();
  
  return (
    <Card className="border-t-4 border-t-primary">
      <CardHeader>
        <CardTitle className="text-primary">{title}</CardTitle>
      </CardHeader>
      <CardContent>{children}</CardContent>
    </Card>
  );
}
```

### 4. Buttons Customizados

```tsx
import { Button } from '@/components/ui/button';

export function ActionButton({ children, ...props }: ButtonProps) {
  const theme = useTenantTheme();
  
  return (
    <Button 
      variant="default"
      className="bg-primary hover:bg-primary/90 text-primary-foreground"
      {...props}
    >
      {children}
    </Button>
  );
}
```

### 5. Badges com Cor Secundária

```tsx
import { Badge } from '@/components/ui/badge';

export function StatusBadge({ status }: { status: string }) {
  const theme = useTenantTheme();
  
  return (
    <Badge 
      variant="secondary"
      className="bg-secondary text-secondary-foreground"
    >
      {status}
    </Badge>
  );
}
```

---

## Componentes Customizados

### Logo Component com Fallback

```tsx
import { useTenantTheme } from '@/hooks/use-tenant-theme';
import { DefaultLogo } from '@/components/icons/Logo';

interface BrandLogoProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  showName?: boolean;
  className?: string;
}

export function BrandLogo({ 
  size = 'md', 
  showName = false,
  className = '' 
}: BrandLogoProps) {
  const theme = useTenantTheme();
  
  const sizeClasses = {
    sm: 'h-8',
    md: 'h-12',
    lg: 'h-16',
    xl: 'h-20',
  };
  
  if (theme?.logo) {
    return (
      <div className={`flex items-center gap-2 ${className}`}>
        <img 
          src={theme.logo} 
          alt={theme.nome}
          className={`w-auto object-contain ${sizeClasses[size]}`}
        />
        {showName && theme.nome !== 'Ouvify' && (
          <span className="text-lg font-semibold text-primary">
            {theme.nome}
          </span>
        )}
      </div>
    );
  }
  
  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <DefaultLogo size={size} />
      {showName && theme?.nome && theme.nome !== 'Ouvify' && (
        <span className="text-lg font-semibold text-primary">
          {theme.nome}
        </span>
      )}
    </div>
  );
}

// Uso:
<BrandLogo size="lg" showName />
```

### Loading Placeholder

```tsx
import { Skeleton } from '@/components/ui/skeleton';

export function BrandLogoSkeleton({ size = 'md' }: { size?: string }) {
  const heights = {
    sm: 'h-8',
    md: 'h-12',
    lg: 'h-16',
    xl: 'h-20',
  };
  
  return (
    <Skeleton className={`w-32 ${heights[size]}`} />
  );
}

// Uso com loading:
function Header() {
  const theme = useTenantTheme();
  
  return (
    <header>
      {!theme ? (
        <BrandLogoSkeleton size="md" />
      ) : (
        <BrandLogo size="md" />
      )}
    </header>
  );
}
```

### Color Preview Component

```tsx
export function ColorPreview({ color }: { color: string }) {
  return (
    <div className="flex items-center gap-2">
      <div 
        className="w-8 h-8 rounded border"
        style={{ backgroundColor: `hsl(${color})` }}
      />
      <code className="text-sm text-muted-foreground">{color}</code>
    </div>
  );
}

// Uso:
function ConfigPage() {
  const theme = useTenantTheme();
  
  return (
    <div>
      <h3>Cor Primária</h3>
      <ColorPreview color={theme?.cor_primaria || '199 89% 48%'} />
    </div>
  );
}
```

---

## SSR e Next.js

### App Router (Next.js 13+)

**Client Component (recomendado):**
```tsx
'use client';

import { useTenantTheme } from '@/hooks/use-tenant-theme';

export default function ClientComponent() {
  const theme = useTenantTheme();
  
  return <div>{theme?.nome}</div>;
}
```

**Server Component (não recomendado):**
```tsx
// ❌ NÃO FUNCIONA - useTenantTheme usa hooks do React
export default async function ServerComponent() {
  const theme = useTenantTheme(); // ERRO!
  return <div>{theme?.nome}</div>;
}
```

**Solução: Fetch no servidor:**
```tsx
// ✅ Alternativa: Fetch direto no servidor
import { cookies } from 'next/headers';

async function getTenantInfo() {
  const res = await fetch('https://api.ouvify.com/api/tenant-info/', {
    cache: 'force-cache',
    next: { revalidate: 300 } // 5 minutos
  });
  return res.json();
}

export default async function ServerComponent() {
  const theme = await getTenantInfo();
  
  return (
    <div>
      <h1>{theme.nome}</h1>
      {theme.logo && <img src={theme.logo} alt={theme.nome} />}
    </div>
  );
}
```

### Metadata Dinâmica (SEO)

```tsx
import { Metadata } from 'next';

export async function generateMetadata(): Promise<Metadata> {
  const theme = await getTenantInfo();
  
  return {
    title: `${theme.nome} - Ouvidoria`,
    description: `Canal de ouvidoria da ${theme.nome}`,
    icons: {
      icon: theme.favicon || '/favicon.ico',
    },
  };
}
```

### Dynamic Imports

```tsx
import dynamic from 'next/dynamic';

// Carregar componente apenas no client
const BrandedComponent = dynamic(
  () => import('@/components/BrandedComponent'),
  { ssr: false, loading: () => <Skeleton /> }
);

export default function Page() {
  return <BrandedComponent />;
}
```

---

## Temas Avançados

### Acessar Cores Diretamente

```tsx
function CustomComponent() {
  const theme = useTenantTheme();
  
  // Cores em HSL (pronto para CSS)
  const primaryColor = theme?.cor_primaria || '199 89% 48%';
  const secondaryColor = theme?.cor_secundaria || '271 91% 65%';
  
  return (
    <div 
      style={{
        backgroundColor: `hsl(${primaryColor})`,
        color: `hsl(${secondaryColor})`
      }}
    >
      Custom styled element
    </div>
  );
}
```

### Calcular Variações de Cor

```tsx
function calculateLightVariant(hslColor: string): string {
  const [h, s, l] = hslColor.split(' ');
  const luminosity = parseInt(l);
  const lightLum = Math.min(luminosity + 20, 95);
  
  return `${h} ${s} ${lightLum}%`;
}

function HoverButton() {
  const theme = useTenantTheme();
  const primary = theme?.cor_primaria || '199 89% 48%';
  const primaryLight = calculateLightVariant(primary);
  
  return (
    <button
      className="px-4 py-2 rounded transition"
      style={{
        backgroundColor: `hsl(${primary})`,
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.backgroundColor = `hsl(${primaryLight})`;
      }}
    >
      Hover me
    </button>
  );
}
```

### Aplicar Fonte Manualmente

```tsx
function CustomTextComponent() {
  const theme = useTenantTheme();
  
  return (
    <div 
      style={{ 
        fontFamily: theme?.fonte_customizada 
          ? `'${theme.fonte_customizada}', sans-serif` 
          : 'Inter, sans-serif'
      }}
    >
      Texto com fonte customizada
    </div>
  );
}
```

### CSS Modules com Variáveis

```css
/* styles.module.css */
.container {
  background-color: hsl(var(--primary));
  color: hsl(var(--primary-foreground));
}

.button {
  background-color: hsl(var(--secondary));
  padding: 0.5rem 1rem;
  border-radius: 0.375rem;
}
```

```tsx
import styles from './styles.module.css';

function ModuleStyledComponent() {
  const theme = useTenantTheme(); // Aplica variáveis automaticamente
  
  return (
    <div className={styles.container}>
      <button className={styles.button}>Click me</button>
    </div>
  );
}
```

---

## Testing

### Mock do Hook

```tsx
// __mocks__/use-tenant-theme.ts
export const useTenantTheme = jest.fn(() => ({
  nome: 'Test Company',
  subdominio: 'test',
  logo: 'https://example.com/logo.png',
  cor_primaria: '199 89% 48%',
  cor_secundaria: '271 91% 65%',
  cor_texto: '0 0% 15%',
  fonte_customizada: 'Roboto',
  favicon: 'https://example.com/favicon.ico',
}));
```

### Test com Mock

```tsx
import { render, screen } from '@testing-library/react';
import { useTenantTheme } from '@/hooks/use-tenant-theme';
import MyComponent from './MyComponent';

jest.mock('@/hooks/use-tenant-theme');

describe('MyComponent', () => {
  it('displays tenant logo', () => {
    (useTenantTheme as jest.Mock).mockReturnValue({
      nome: 'ACME Corp',
      logo: 'https://example.com/acme-logo.png',
      cor_primaria: '199 89% 48%',
    });
    
    render(<MyComponent />);
    
    const logo = screen.getByAltText('ACME Corp');
    expect(logo).toBeInTheDocument();
    expect(logo).toHaveAttribute('src', 'https://example.com/acme-logo.png');
  });
  
  it('shows default logo when tenant has no logo', () => {
    (useTenantTheme as jest.Mock).mockReturnValue({
      nome: 'Test Company',
      logo: null,
      cor_primaria: '199 89% 48%',
    });
    
    render(<MyComponent />);
    
    expect(screen.getByText('Test Company')).toBeInTheDocument();
  });
});
```

### Integration Test com MSW

```tsx
import { rest } from 'msw';
import { setupServer } from 'msw/node';

const server = setupServer(
  rest.get('/api/tenant-info/', (req, res, ctx) => {
    return res(ctx.json({
      nome: 'Integration Test Company',
      logo: 'https://example.com/logo.png',
      cor_primaria: '#FF0000',
      cor_secundaria: '#00FF00',
      cor_texto: '#000000',
    }));
  })
);

beforeAll(() => server.listen());
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

test('loads and displays tenant info', async () => {
  render(<App />);
  
  await waitFor(() => {
    expect(screen.getByAltText('Integration Test Company')).toBeInTheDocument();
  });
});
```

### Test de CSS Variables

```tsx
import { renderHook, waitFor } from '@testing-library/react';
import { useTenantTheme } from '@/hooks/use-tenant-theme';

test('applies CSS variables to :root', async () => {
  renderHook(() => useTenantTheme());
  
  await waitFor(() => {
    const primaryColor = document.documentElement.style.getPropertyValue('--primary');
    expect(primaryColor).toBeTruthy();
    expect(primaryColor).toMatch(/\d+ \d+% \d+%/); // HSL format
  });
});
```

---

## 🔧 Utilitários

### Converter HSL para HEX

```typescript
export function hslToHex(hsl: string): string {
  const [h, s, l] = hsl.split(' ').map((v) => {
    const num = parseFloat(v);
    return v.includes('%') ? num / 100 : num / 360;
  });
  
  const hue = h * 360;
  const saturation = s;
  const luminosity = l;
  
  const c = (1 - Math.abs(2 * luminosity - 1)) * saturation;
  const x = c * (1 - Math.abs(((hue / 60) % 2) - 1));
  const m = luminosity - c / 2;
  
  let r = 0, g = 0, b = 0;
  
  if (hue < 60) { r = c; g = x; b = 0; }
  else if (hue < 120) { r = x; g = c; b = 0; }
  else if (hue < 180) { r = 0; g = c; b = x; }
  else if (hue < 240) { r = 0; g = x; b = c; }
  else if (hue < 300) { r = x; g = 0; b = c; }
  else { r = c; g = 0; b = x; }
  
  const toHex = (n: number) => {
    const hex = Math.round((n + m) * 255).toString(16);
    return hex.length === 1 ? '0' + hex : hex;
  };
  
  return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
}

// Uso:
const hexColor = hslToHex('199 89% 48%'); // "#0EA5E9"
```

### Verificar Contraste

```typescript
export function getContrastRatio(color1: string, color2: string): number {
  // Implementação simplificada
  // Use bibliotecas como 'color' ou 'tinycolor2' para produção
  
  const getLuminance = (hex: string): number => {
    const rgb = parseInt(hex.slice(1), 16);
    const r = ((rgb >> 16) & 0xff) / 255;
    const g = ((rgb >> 8) & 0xff) / 255;
    const b = ((rgb >> 0) & 0xff) / 255;
    
    const luminance = 0.2126 * r + 0.7152 * g + 0.0722 * b;
    return luminance;
  };
  
  const lum1 = getLuminance(color1);
  const lum2 = getLuminance(color2);
  
  const brighter = Math.max(lum1, lum2);
  const darker = Math.min(lum1, lum2);
  
  return (brighter + 0.05) / (darker + 0.05);
}

// WCAG AA requer contrast ratio >= 4.5
const contrast = getContrastRatio('#FFFFFF', '#3B82F6');
console.log(contrast >= 4.5 ? 'Accessible!' : 'Low contrast');
```

---

## 📚 Referências

**Hooks:**
- `apps/frontend/hooks/use-tenant-theme.ts` - Hook principal

**Componentes:**
- `apps/frontend/components/ui/*` - Componentes Shadcn UI

**Páginas:**
- `apps/frontend/app/enviar/page.tsx` - Exemplo de uso
- `apps/frontend/app/acompanhar/page.tsx` - Exemplo de uso
- `apps/frontend/app/dashboard/configuracoes/page.tsx` - Editor

**Documentação:**
- `docs/WHITE_LABEL_IMPLEMENTATION.md` - Documentação técnica
- `docs/WHITE_LABEL_USER_GUIDE.md` - Guia do usuário

---

**Criado em:** 2026-02-06  
**Versão:** 1.0  
**Autor:** GitHub Copilot (Claude Sonnet 4.5)
