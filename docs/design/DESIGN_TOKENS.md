# 🎨 OUVIFY DESIGN TOKENS

**Versão:** 1.0  
**Data:** 30 de Janeiro de 2026  
**Single Source of Truth para Design System**

---

## 📌 VISÃO GERAL

Este documento define TODOS os tokens de design usados na plataforma Ouvify.
Tokens são valores atômicos que garantem consistência visual.

**Implementação:**
- CSS Variables: `apps/frontend/app/globals.css`
- Tailwind Config: `apps/frontend/tailwind.config.ts`
- TypeScript: `apps/frontend/lib/design-tokens.ts`

---

## 🎨 CORES (Colors)

### Primária (Brand)

| Token | HSL | Hex | Uso |
|-------|-----|-----|-----|
| `--primary-50` | 214 100% 97% | #EFF6FF | Background sutil |
| `--primary-100` | 214 95% 93% | #DBEAFE | Background hover |
| `--primary-200` | 213 97% 87% | #BFDBFE | Border light |
| `--primary-300` | 212 96% 78% | #93C5FD | - |
| `--primary-400` | 213 94% 68% | #60A5FA | Light variant |
| `--primary-500` | 217 91% 60% | #3B82F6 | **MAIN** |
| `--primary-600` | 221 83% 53% | #2563EB | **HOVER** |
| `--primary-700` | 224 76% 48% | #1D4ED8 | Active |
| `--primary-800` | 226 71% 40% | #1E40AF | - |
| `--primary-900` | 224 64% 33% | #1E3A8A | Dark |

### Secundária (Accent)

| Token | HSL | Hex | Uso |
|-------|-----|-----|-----|
| `--secondary-50` | 270 100% 98% | #FAF5FF | Background sutil |
| `--secondary-100` | 269 100% 95% | #F3E8FF | Background hover |
| `--secondary-200` | 269 100% 92% | #E9D5FF | Border light |
| `--secondary-300` | 269 97% 85% | #D8B4FE | - |
| `--secondary-400` | 270 95% 75% | #C084FC | Light variant |
| `--secondary-500` | 271 91% 65% | #A855F7 | **MAIN** |
| `--secondary-600` | 272 72% 47% | #9333EA | **HOVER** |
| `--secondary-700` | 273 67% 31% | #7E22CE | Active |
| `--secondary-800` | 274 66% 32% | #6B21A8 | - |
| `--secondary-900` | 274 87% 21% | #581C87 | Dark |

### Semânticas

#### Success (Verde)
| Token | Hex | Uso |
|-------|-----|-----|
| `--success-50` | #F0FDF4 | Background |
| `--success-100` | #DCFCE7 | - |
| `--success-500` | #22C55E | **MAIN** |
| `--success-600` | #16A34A | **HOVER** |
| `--success-700` | #15803D | Active |

#### Warning (Amarelo)
| Token | Hex | Uso |
|-------|-----|-----|
| `--warning-50` | #FFFBEB | Background |
| `--warning-100` | #FEF3C7 | - |
| `--warning-500` | #F59E0B | **MAIN** |
| `--warning-600` | #D97706 | **HOVER** |
| `--warning-700` | #B45309 | Active |

#### Error (Vermelho)
| Token | Hex | Uso |
|-------|-----|-----|
| `--error-50` | #FEF2F2 | Background |
| `--error-100` | #FEE2E2 | - |
| `--error-500` | #EF4444 | **MAIN** |
| `--error-600` | #DC2626 | **HOVER** |
| `--error-700` | #B91C1C | Active |

#### Info (Ciano)
| Token | Hex | Uso |
|-------|-----|-----|
| `--info-50` | #ECFEFF | Background |
| `--info-100` | #CFFAFE | - |
| `--info-500` | #06B6D4 | **MAIN** |
| `--info-600` | #0891B2 | **HOVER** |
| `--info-700` | #0E7490 | Active |

### Neutras (Gray)

| Token | Hex | Uso |
|-------|-----|-----|
| `--gray-50` | #F9FAFB | Muted backgrounds |
| `--gray-100` | #F3F4F6 | Input backgrounds |
| `--gray-200` | #E5E7EB | Borders |
| `--gray-300` | #D1D5DB | Borders hover |
| `--gray-400` | #9CA3AF | Placeholders |
| `--gray-500` | #6B7280 | Muted text |
| `--gray-600` | #4B5563 | Secondary text |
| `--gray-700` | #374151 | Body text |
| `--gray-800` | #1F2937 | Headings |
| `--gray-900` | #111827 | **MAIN TEXT** |

### UI Tokens

| Token | Valor | Uso |
|-------|-------|-----|
| `--background` | #FFFFFF | Page background |
| `--foreground` | #111827 | Main text |
| `--card` | #FFFFFF | Card background |
| `--card-foreground` | #111827 | Card text |
| `--muted` | #F9FAFB | Muted background |
| `--muted-foreground` | #6B7280 | Muted text |
| `--border` | #E5E7EB | Borders |
| `--input` | #F3F4F6 | Input background |
| `--ring` | #3B82F6 | Focus ring |

---

## 📝 TIPOGRAFIA (Typography)

### Font Families

| Token | Valor | Uso |
|-------|-------|-----|
| `--font-sans` | Inter, system-ui | Body text |
| `--font-heading` | Poppins, Inter | Headings |
| `--font-mono` | JetBrains Mono | Code |

### Font Sizes

| Token | Size | Line Height | Uso |
|-------|------|-------------|-----|
| `--text-xs` | 12px | 16px | Tiny labels |
| `--text-sm` | 14px | 20px | Small text, badges |
| `--text-base` | 16px | 24px | Body |
| `--text-lg` | 18px | 28px | Large body |
| `--text-xl` | 20px | 28px | Small headings |
| `--text-2xl` | 24px | 32px | H4 |
| `--text-3xl` | 30px | 36px | H3 |
| `--text-4xl` | 36px | 40px | H2 |
| `--text-5xl` | 48px | 1 | H1 |
| `--text-6xl` | 60px | 1 | Display |
| `--text-7xl` | 72px | 1 | Hero |

### Font Weights

| Token | Valor | Uso |
|-------|-------|-----|
| `--font-normal` | 400 | Body text |
| `--font-medium` | 500 | Labels, buttons |
| `--font-semibold` | 600 | Subtitles |
| `--font-bold` | 700 | Headings |

### Letter Spacing

| Token | Valor | Uso |
|-------|-------|-----|
| `--tracking-tighter` | -0.05em | Large headings |
| `--tracking-tight` | -0.025em | Headings |
| `--tracking-normal` | 0 | Body |
| `--tracking-wide` | 0.025em | Labels uppercase |
| `--tracking-wider` | 0.05em | Small caps |

---

## 📐 ESPAÇAMENTO (Spacing)

Base unit: **4px**

| Token | Valor | Uso |
|-------|-------|-----|
| `--space-0` | 0 | - |
| `--space-px` | 1px | Hairline |
| `--space-0.5` | 2px | - |
| `--space-1` | 4px | Micro |
| `--space-2` | 8px | Small |
| `--space-3` | 12px | - |
| `--space-4` | 16px | Default |
| `--space-5` | 20px | - |
| `--space-6` | 24px | Medium |
| `--space-8` | 32px | Large |
| `--space-10` | 40px | - |
| `--space-12` | 48px | XL |
| `--space-16` | 64px | 2XL |
| `--space-20` | 80px | 3XL |
| `--space-24` | 96px | 4XL |

---

## 🔲 BORDER RADIUS

| Token | Valor | Uso |
|-------|-------|-----|
| `--radius-none` | 0 | Sharp |
| `--radius-sm` | 4px | Badges |
| `--radius-md` | 6px | Buttons, inputs |
| `--radius-lg` | 8px | Cards |
| `--radius-xl` | 12px | Modals |
| `--radius-2xl` | 16px | - |
| `--radius-3xl` | 24px | - |
| `--radius-full` | 9999px | Pills, avatars |

---

## 🌑 SOMBRAS (Shadows)

| Token | Valor | Uso |
|-------|-------|-----|
| `--shadow-subtle` | 0 1px 2px hsl(var(--foreground) / 0.05) | Subtle |
| `--shadow-sm` | 0 1px 2px 0 rgba(0, 0, 0, 0.05) | Small |
| `--shadow-DEFAULT` | 0 1px 3px 0 rgba(0, 0, 0, 0.1) | Default |
| `--shadow-md` | 0 4px 6px -1px rgba(0, 0, 0, 0.1) | Medium |
| `--shadow-lg` | 0 10px 15px -3px rgba(0, 0, 0, 0.1) | Large |
| `--shadow-xl` | 0 20px 25px -5px rgba(0, 0, 0, 0.1) | XL |
| `--shadow-2xl` | 0 25px 50px -12px rgba(0, 0, 0, 0.25) | 2XL |
| `--shadow-inner` | inset 0 2px 4px 0 rgba(0, 0, 0, 0.06) | Inner |

---

## ⏱️ ANIMAÇÕES (Animations)

### Durations

| Token | Valor | Uso |
|-------|-------|-----|
| `--duration-75` | 75ms | Micro interactions |
| `--duration-100` | 100ms | - |
| `--duration-150` | 150ms | Fast |
| `--duration-200` | 200ms | Default |
| `--duration-300` | 300ms | Medium |
| `--duration-500` | 500ms | Slow |
| `--duration-700` | 700ms | Very slow |
| `--duration-1000` | 1000ms | Extra slow |

### Easings

| Token | Valor | Uso |
|-------|-------|-----|
| `--ease-in` | cubic-bezier(0.4, 0, 1, 1) | Enter |
| `--ease-out` | cubic-bezier(0, 0, 0.2, 1) | Exit |
| `--ease-in-out` | cubic-bezier(0.4, 0, 0.2, 1) | Default |

### Keyframes

```css
@keyframes fade-in {
  from { opacity: 0; }
  to { opacity: 1; }
}

@keyframes slide-up {
  from { transform: translateY(10px); opacity: 0; }
  to { transform: translateY(0); opacity: 1; }
}

@keyframes scale-in {
  from { transform: scale(0.95); opacity: 0; }
  to { transform: scale(1); opacity: 1; }
}
```

---

## 📏 Z-INDEX

| Token | Valor | Uso |
|-------|-------|-----|
| `--z-dropdown` | 50 | Dropdowns |
| `--z-sticky` | 100 | Sticky headers |
| `--z-fixed` | 200 | Fixed elements |
| `--z-modal` | 300 | Modals |
| `--z-popover` | 400 | Popovers |
| `--z-tooltip` | 500 | Tooltips |
| `--z-toast` | 1000 | Toast notifications |

---

## 📱 BREAKPOINTS

| Token | Valor | Uso |
|-------|-------|-----|
| `--screen-sm` | 640px | Mobile landscape |
| `--screen-md` | 768px | Tablet |
| `--screen-lg` | 1024px | Laptop |
| `--screen-xl` | 1280px | Desktop |
| `--screen-2xl` | 1536px | Large desktop |

---

## 🔧 IMPLEMENTAÇÃO

### CSS Variables (globals.css)

```css
:root {
  --primary: 217 91% 60%;
  --primary-foreground: 0 0% 100%;
  --secondary: 271 91% 65%;
  --secondary-foreground: 0 0% 100%;
  --background: 0 0% 100%;
  --foreground: 222 47% 11%;
  --radius: 0.5rem;
  /* ... */
}
```

### Tailwind Classes

```tsx
// Cores
className="bg-primary-500 text-primary-foreground"
className="text-gray-900"
className="border-gray-200"

// Tipografia
className="text-sm font-medium"
className="text-2xl font-bold"

// Espaçamento
className="p-4 m-2 gap-6"

// Border Radius
className="rounded-lg"

// Sombras
className="shadow-md"
```

### TypeScript Constants

```typescript
import { colors, spacing, typography } from '@/lib/design-tokens';

// Uso em estilos dinâmicos
const style = {
  backgroundColor: colors.brand.primary[500],
  padding: spacing[4],
  fontSize: typography.fontSize.base,
};
```

---

## ✅ CHECKLIST DE VALIDAÇÃO

- [ ] Cores seguem a paleta definida
- [ ] Texto atinge contraste AA (4.5:1)
- [ ] Espaçamento usa escala de 4px
- [ ] Border radius é consistente
- [ ] Sombras seguem hierarquia
- [ ] Animações são suaves (150-300ms)
- [ ] Z-index não conflita

---

*Ouvify Design Tokens v1.0 - Janeiro 2026*
