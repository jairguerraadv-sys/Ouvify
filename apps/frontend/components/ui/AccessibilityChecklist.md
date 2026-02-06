# Acessibilidade - Checklist

**Evidências principais (repositório):**

- Skip link + main target: `apps/frontend/app/layout.tsx` + `.skip-to-content` em `apps/frontend/app/globals.css`
- Focus visible (componentes principais): `apps/frontend/components/ui/button.tsx` (focus-visible ring) + `apps/frontend/components/ui/form-field.tsx` (tooltip button)
- Touch targets 44x44px (em dispositivos touch): `.touch-target` em `apps/frontend/app/globals.css` + uso por `Button` em `apps/frontend/components/ui/button.tsx`
- Formulários (labels/erros/aria-\*): `apps/frontend/components/ui/form-field.tsx` + exemplos de `aria-invalid`/`aria-describedby` em `apps/frontend/app/login/page.tsx`
- Notificações com suporte a SR: `apps/frontend/components/ui/toaster.tsx` (Radix Toast) + `apps/frontend/app/layout.tsx` (`sonner`)

## Semântica HTML

- [x] Usar tags semânticas (`<header>`, `<main>`, `<nav>`, `<section>`)
- [x] Hierarquia correta de headings (H1 → H2 → H3)
- [x] Landmarks ARIA quando necessário

## Teclado

- [x] Elementos interativos acessíveis via Tab
- [x] `:focus-visible` presente em todos os elementos
- [x] Link "Pular para o conteúdo" implementado
- [x] `Esc` fecha modais/dropdowns
- [x] `Enter/Space` ativa botões

## Screen Readers

- [x] Alt text em todas as imagens
- [x] `aria-label` em ícones sem texto
- [x] `aria-describedby` para ajuda contextual
- [x] `aria-live` para notificações
- [x] `aria-expanded` em dropdowns/accordions

## Contraste de Cores

- [x] Texto normal: contraste mínimo 4.5:1
- [x] Texto grande: contraste mínimo 3:1
- [x] Elementos de UI: contraste mínimo 3:1
- [x] Validado via `npm run validate:contrast`

## Formulários

- [x] Labels associados aos inputs
- [x] Mensagens de erro claras e associadas
- [x] Campos obrigatórios indicados
- [x] Validação em tempo real
- [x] Mensagens de sucesso após submit

## Responsividade

- [x] Zoom até 200% sem quebrar layout
- [x] Touch targets mínimo 44x44px
- [x] Sem scroll horizontal em mobile
- [x] Texto legível em todos os tamanhos
