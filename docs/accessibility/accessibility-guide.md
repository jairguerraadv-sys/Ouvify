# 📘 Guia de Acessibilidade - Ouvy

> **Conformidade:** WCAG 2.1 Nível AA  
> **Última atualização:** Janeiro 2026

## 📋 Índice

1. [Visão Geral](#-visão-geral)
2. [ARIA Labels](#-aria-labels)
3. [Navegação por Teclado](#-navegação-por-teclado)
4. [Screen Readers](#-screen-readers)
5. [Cores e Contraste](#-cores-e-contraste)
6. [Checklist de Acessibilidade](#-checklist)

---

## 🎯 Visão Geral

O Ouvy foi desenvolvido seguindo as diretrizes **WCAG 2.1 Nível AA** para garantir que todos os usuários, incluindo pessoas com deficiências, possam utilizar a plataforma de forma eficiente.

### Princípios POUR

| Princípio | Descrição |
|-----------|-----------|
| **Perceptível** | Informações apresentáveis de múltiplas formas |
| **Operável** | Interface navegável por teclado e outros meios |
| **Compreensível** | Conteúdo legível e previsível |
| **Robusto** | Compatível com tecnologias assistivas |

---

## 🏷️ ARIA Labels

### Componentes com ARIA

#### Botões

```tsx
// ✅ Correto: Botão com ícone e texto acessível
<Button aria-label="Criar novo feedback">
  <Plus className="h-4 w-4" aria-hidden="true" />
  Novo Feedback
</Button>

// ✅ Correto: Botão apenas com ícone
<Button 
  variant="ghost" 
  size="icon"
  aria-label="Fechar modal"
>
  <X className="h-4 w-4" aria-hidden="true" />
</Button>

// ✅ Correto: Botão com estado de loading
<Button 
  aria-label="Salvar alterações"
  aria-busy={isLoading}
  disabled={isLoading}
>
  {isLoading ? (
    <>
      <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
      <span>Salvando...</span>
    </>
  ) : (
    'Salvar'
  )}
</Button>
```

#### Modais/Dialogs

```tsx
// ✅ Correto: Modal com ARIA completo
<Dialog open={isOpen} onOpenChange={setIsOpen}>
  <DialogContent
    aria-labelledby="modal-title"
    aria-describedby="modal-description"
  >
    <DialogHeader>
      <DialogTitle id="modal-title">
        Criar Novo Feedback
      </DialogTitle>
      <DialogDescription id="modal-description">
        Preencha o formulário abaixo para registrar um novo feedback
      </DialogDescription>
    </DialogHeader>
    
    <form aria-label="Formulário de feedback">
      {/* ... */}
    </form>
    
    <DialogFooter>
      <Button 
        variant="outline" 
        onClick={() => setIsOpen(false)}
        aria-label="Cancelar e fechar modal"
      >
        Cancelar
      </Button>
      <Button type="submit" aria-label="Salvar feedback">
        Salvar
      </Button>
    </DialogFooter>
  </DialogContent>
</Dialog>
```

#### Formulários

```tsx
// ✅ Correto: Formulário com labels acessíveis
<form aria-label="Formulário de login">
  <div className="space-y-4">
    {/* Input com label visível */}
    <div className="space-y-2">
      <Label htmlFor="email">Email</Label>
      <Input
        id="email"
        name="email"
        type="email"
        autoComplete="email"
        aria-required="true"
        aria-invalid={errors.email ? 'true' : 'false'}
        aria-describedby={errors.email ? 'email-error' : 'email-hint'}
        placeholder="seu@email.com"
      />
      <p id="email-hint" className="text-sm text-muted-foreground">
        Use o email cadastrado na empresa
      </p>
      {errors.email && (
        <p id="email-error" role="alert" className="text-sm text-error-500">
          {errors.email}
        </p>
      )}
    </div>
    
    {/* Input com label sr-only */}
    <div className="relative">
      <Label htmlFor="search" className="sr-only">
        Buscar feedbacks
      </Label>
      <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" aria-hidden="true" />
      <Input
        id="search"
        name="search"
        type="search"
        placeholder="Buscar feedbacks..."
        className="pl-10"
        aria-label="Buscar feedbacks por título ou descrição"
      />
    </div>
  </div>
</form>
```

#### Tabelas

```tsx
// ✅ Correto: Tabela acessível
<div role="region" aria-label="Lista de feedbacks" tabIndex={0}>
  <Table>
    <TableCaption>
      Lista de feedbacks do último mês
    </TableCaption>
    <TableHeader>
      <TableRow>
        <TableHead scope="col">Código</TableHead>
        <TableHead scope="col">Título</TableHead>
        <TableHead scope="col">Status</TableHead>
        <TableHead scope="col">
          <span className="sr-only">Ações</span>
        </TableHead>
      </TableRow>
    </TableHeader>
    <TableBody>
      {feedbacks.map((feedback) => (
        <TableRow key={feedback.id}>
          <TableCell>
            <code aria-label={`Código de rastreio: ${feedback.codigo}`}>
              {feedback.codigo}
            </code>
          </TableCell>
          <TableCell>{feedback.titulo}</TableCell>
          <TableCell>
            <Badge aria-label={`Status: ${feedback.status}`}>
              {feedback.status}
            </Badge>
          </TableCell>
          <TableCell>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button 
                  variant="ghost" 
                  size="icon"
                  aria-label={`Ações para feedback ${feedback.codigo}`}
                >
                  <MoreHorizontal className="h-4 w-4" aria-hidden="true" />
                </Button>
              </DropdownMenuTrigger>
              {/* ... */}
            </DropdownMenu>
          </TableCell>
        </TableRow>
      ))}
    </TableBody>
  </Table>
</div>
```

#### Navegação

```tsx
// ✅ Correto: Navegação principal
<nav aria-label="Navegação principal">
  <ul role="list" className="space-y-1">
    {menuItems.map((item) => (
      <li key={item.href}>
        <Link
          href={item.href}
          className={cn(
            'flex items-center gap-3 rounded-lg px-3 py-2',
            isActive && 'bg-primary-50 text-primary-600'
          )}
          aria-current={isActive ? 'page' : undefined}
        >
          <item.icon className="h-5 w-5" aria-hidden="true" />
          {item.label}
        </Link>
      </li>
    ))}
  </ul>
</nav>

// ✅ Correto: Breadcrumbs
<nav aria-label="Breadcrumb">
  <ol role="list" className="flex items-center gap-2">
    <li>
      <Link href="/dashboard" aria-label="Voltar para Dashboard">
        Dashboard
      </Link>
    </li>
    <li aria-hidden="true">/</li>
    <li aria-current="page">Feedbacks</li>
  </ol>
</nav>
```

#### Notificações e Alertas

```tsx
// ✅ Correto: Alert com role apropriado
<Alert variant="error" role="alert">
  <AlertCircle className="h-4 w-4" aria-hidden="true" />
  <AlertTitle>Erro ao salvar</AlertTitle>
  <AlertDescription>
    Não foi possível salvar o feedback. Tente novamente.
  </AlertDescription>
</Alert>

// ✅ Correto: Toast com live region
<div 
  role="status" 
  aria-live="polite"
  aria-atomic="true"
  className="toast"
>
  Feedback criado com sucesso!
</div>

// ✅ Correto: Loading state
<div role="status" aria-live="polite" aria-busy="true">
  <Loader2 className="h-8 w-8 animate-spin" aria-hidden="true" />
  <span className="sr-only">Carregando feedbacks...</span>
</div>
```

#### Seleção e Dropdowns

```tsx
// ✅ Correto: Select acessível
<div className="space-y-2">
  <Label htmlFor="status">Status</Label>
  <Select
    value={status}
    onValueChange={setStatus}
    aria-labelledby="status-label"
  >
    <SelectTrigger id="status" aria-label="Selecionar status">
      <SelectValue placeholder="Selecione um status" />
    </SelectTrigger>
    <SelectContent>
      <SelectItem value="PENDENTE">Pendente</SelectItem>
      <SelectItem value="EM_ANALISE">Em Análise</SelectItem>
      <SelectItem value="RESOLVIDO">Resolvido</SelectItem>
    </SelectContent>
  </Select>
</div>
```

---

## ⌨️ Navegação por Teclado

### Teclas de Atalho

| Tecla | Ação |
|-------|------|
| `Tab` | Navegar para próximo elemento focável |
| `Shift + Tab` | Navegar para elemento anterior |
| `Enter` | Ativar botão/link focado |
| `Space` | Ativar checkbox/botão |
| `Escape` | Fechar modal/dropdown |
| `Arrow Up/Down` | Navegar em listas/menus |

### Focus Management

```tsx
// ✅ Correto: Focus trap em modal
export function AccessibleModal({ isOpen, onClose, children }) {
  const modalRef = useRef<HTMLDivElement>(null);
  const previousFocusRef = useRef<HTMLElement | null>(null);
  
  useEffect(() => {
    if (isOpen) {
      // Salvar elemento focado anteriormente
      previousFocusRef.current = document.activeElement as HTMLElement;
      
      // Focar no modal
      modalRef.current?.focus();
    } else {
      // Restaurar foco ao fechar
      previousFocusRef.current?.focus();
    }
  }, [isOpen]);
  
  // Trap focus dentro do modal
  const handleKeyDown = (e: KeyboardEvent) => {
    if (e.key === 'Escape') {
      onClose();
    }
    
    if (e.key === 'Tab') {
      const focusableElements = modalRef.current?.querySelectorAll(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
      );
      
      if (focusableElements && focusableElements.length > 0) {
        const firstElement = focusableElements[0] as HTMLElement;
        const lastElement = focusableElements[focusableElements.length - 1] as HTMLElement;
        
        if (e.shiftKey && document.activeElement === firstElement) {
          e.preventDefault();
          lastElement.focus();
        } else if (!e.shiftKey && document.activeElement === lastElement) {
          e.preventDefault();
          firstElement.focus();
        }
      }
    }
  };
  
  return (
    <div
      ref={modalRef}
      role="dialog"
      aria-modal="true"
      tabIndex={-1}
      onKeyDown={handleKeyDown}
    >
      {children}
    </div>
  );
}
```

### Skip Links

```tsx
// ✅ Correto: Skip link para conteúdo principal
export function SkipLink() {
  return (
    <a
      href="#main-content"
      className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-50 focus:bg-primary-500 focus:text-white focus:px-4 focus:py-2 focus:rounded-lg"
    >
      Pular para conteúdo principal
    </a>
  );
}

// No layout:
<body>
  <SkipLink />
  <Header />
  <main id="main-content" tabIndex={-1}>
    {children}
  </main>
</body>
```

---

## 🔊 Screen Readers

### Testando com Screen Readers

#### macOS - VoiceOver

```bash
# Ativar: Cmd + F5
# Rotor: Ctrl + Option + U
# Navegar: Ctrl + Option + Arrow Keys
```

#### Windows - NVDA

```bash
# Download: https://www.nvaccess.org/download/
# Ativar: Ctrl + Alt + N
# Navegar: Tab, Arrow Keys
```

### Conteúdo Dinâmico

```tsx
// ✅ Correto: Anunciar atualizações
export function FeedbackList() {
  const [announcements, setAnnouncements] = useState('');
  
  const handleDelete = async (id: string) => {
    await deleteFeedback(id);
    setAnnouncements('Feedback deletado com sucesso');
  };
  
  return (
    <>
      {/* Live region para anúncios */}
      <div 
        role="status" 
        aria-live="polite" 
        aria-atomic="true"
        className="sr-only"
      >
        {announcements}
      </div>
      
      {/* Lista de feedbacks */}
      <ul role="list">
        {feedbacks.map(feedback => (
          <li key={feedback.id}>
            {/* ... */}
          </li>
        ))}
      </ul>
    </>
  );
}
```

---

## 🎨 Cores e Contraste

### Ratios de Contraste WCAG

| Nível | Texto Normal | Texto Grande | UI Components |
|-------|--------------|--------------|---------------|
| AA | 4.5:1 | 3:1 | 3:1 |
| AAA | 7:1 | 4.5:1 | - |

### Cores do Ouvy

| Cor | Hex | Contraste com Branco |
|-----|-----|---------------------|
| Primary 500 | #3B82F6 | 4.5:1 ✅ |
| Secondary 500 | #A855F7 | 4.6:1 ✅ |
| Success 500 | #22C55E | 3.1:1 ⚠️ (use 600) |
| Error 500 | #EF4444 | 4.5:1 ✅ |
| Warning 500 | #F59E0B | 2.8:1 ⚠️ (texto escuro) |

### Não Depender Apenas de Cor

```tsx
// ❌ Errado: Apenas cor indica status
<Badge className="bg-red-500">Urgente</Badge>

// ✅ Correto: Cor + ícone + texto
<Badge className="bg-error-500 text-white">
  <AlertTriangle className="h-3 w-3" aria-hidden="true" />
  Urgente
</Badge>
```

---

## ✅ Checklist de Acessibilidade

### Estrutura HTML

- [ ] Usar landmarks semânticos (`<main>`, `<nav>`, `<header>`, `<footer>`)
- [ ] Hierarquia de headings correta (h1 → h2 → h3)
- [ ] Skip links para navegação rápida
- [ ] Lang attribute no `<html>`

### Imagens e Mídia

- [ ] Alt text em todas imagens informativas
- [ ] `aria-hidden="true"` em ícones decorativos
- [ ] Captions em vídeos
- [ ] Transcrições em áudios

### Formulários

- [ ] Labels associados a inputs (`htmlFor`/`id`)
- [ ] Mensagens de erro acessíveis (`aria-describedby`)
- [ ] `aria-required` em campos obrigatórios
- [ ] `aria-invalid` em campos com erro
- [ ] Autocomplete attributes

### Navegação

- [ ] Navegável por teclado
- [ ] Focus visível em todos elementos
- [ ] Ordem de tab lógica
- [ ] `aria-current="page"` no item ativo

### Componentes Interativos

- [ ] Modals com focus trap
- [ ] `aria-expanded` em dropdowns
- [ ] `aria-selected` em tabs/listas
- [ ] `aria-busy` durante loading

### Feedback ao Usuário

- [ ] Live regions para conteúdo dinâmico
- [ ] Alertas com `role="alert"`
- [ ] Status com `role="status"`
- [ ] Progress indicators acessíveis

### Testes

- [ ] Testar com VoiceOver (macOS)
- [ ] Testar com NVDA (Windows)
- [ ] Testar navegação apenas por teclado
- [ ] Testar com zoom 200%
- [ ] Usar axe DevTools

---

## 🛠️ Ferramentas de Teste

### Browser Extensions

- **axe DevTools** - Análise automática de acessibilidade
- **WAVE** - Visualização de erros de acessibilidade
- **Lighthouse** - Auditoria incluindo a11y

### Comandos de Teste

```bash
# Lint de acessibilidade com eslint-plugin-jsx-a11y
npm run lint

# Teste automatizado com Playwright
npx playwright test --project=chromium

# Auditoria com Lighthouse CLI
npx lighthouse http://localhost:3000 --only-categories=accessibility
```

---

## 📚 Recursos

- [WCAG 2.1 Guidelines](https://www.w3.org/WAI/WCAG21/quickref/)
- [MDN ARIA Authoring Practices](https://developer.mozilla.org/en-US/docs/Web/Accessibility/ARIA)
- [Radix UI Accessibility](https://www.radix-ui.com/docs/primitives/overview/accessibility)
- [Testing Library Queries](https://testing-library.com/docs/queries/about#priority)

---

*Última atualização: 29/01/2026*
