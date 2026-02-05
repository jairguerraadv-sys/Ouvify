# 🐛 Reproduzindo React Error #418

## Contexto

Erro observado em produção:
```
Minified React error #418
```

**Referência:** https://reactjs.org/docs/error-decoder.html/?invariant=418

## O que significa Error #418?

Erro #418 no React geralmente indica:
- **Hydration mismatch** - HTML inicial (SSR) != HTML do cliente
- **Marcação inválida** - Tags HTML aninhadas incorretamente
- **Uso de APIs do browser durante SSR** - `window`, `document`, `localStorage` etc.
- **Renderização condicional inconsistente** - Diferentes outputs entre servidor e cliente

## Passos para Reproduzir (Modo Dev)

### 1. Rodar frontend em modo desenvolvimento

```bash
cd apps/frontend
npm run dev
```

**Por quê?**
- Modo dev mostra erro completo (não-minificado)
- Inclui stack trace com arquivo e linha
- Mensagem de erro detalhada

### 2. Navegar para a rota problemática

Baseado nos logs, o erro provavelmente ocorre em:
- `/` (home page)
- `/login`
- `/cadastro`
- `/enviar`

Abrir Firefox/Chrome DevTools console e reproduzir ação que causa o erro.

### 3. Capturar stack trace completo

```javascript
// No DevTools Console, rodar:
console.trace();
```

Salvar output completo.

### 4. Verificar HTML source

```bash
# Comparar HTML inicial (SSR) vs DOM após hydration
curl https://ouvify.vercel.app/ > ssr_html.html
# Então, no browser, copiar document.documentElement.outerHTML para outro arquivo
```

Buscar diferenças usando `diff`.

## Causas Comuns e Como Identificar

### A. Hydration Mismatch

**Sintomas:**
- Warning no console: "Text content did not match"
- Erro #418
- Flash of unstyled content (FOUC)

**Como verificar:**
```bash
grep -r "new Date()" apps/frontend/
grep -r "Math.random()" apps/frontend/
grep -r "window\." apps/frontend/
grep -r "document\." apps/frontend/
```

**Fix:** Usar `useEffect` para código que roda apenas no cliente:

```tsx
// ❌ ERRADO
function Component() {
  const date = new Date().toLocaleString(); // Executa no servidor E cliente
  return <div>{date}</div>;
}

// ✅ CORRETO
function Component() {
  const [date, setDate] = useState<string>('');
  
  useEffect(() => {
    setDate(new Date().toLocaleString()); // Apenas no cliente
  }, []);
  
  return <div>{date || 'Loading...'}</div>;
}
```

### B. Marcação HTML Inválida

**Sintomas:**
- Tags aninhadas incorretamente (ex: `<p>` dentro de `<p>`)
- Atributos inválidos

**Como verificar:**
```bash
# Validar HTML
curl https://ouvify.vercel.app/ | npx html-validator
```

### C. Third-party Scripts (Stripe, Analytics)

**Sintomas:**
- Erro ocorre após certos eventos
- Related a scripts externos

**Como verificar:**
```javascript
// Desabilitar temporariamente no código
// Comment out Stripe/Analytics initialization
```

## Comandos para Gerar Evidências

```bash
# 1. Capturar erro em dev
cd apps/frontend
npm run dev 2>&1 | tee audit/evidence/react418_dev_log.txt

# 2. Build e analisar bundle
npm run build
npx next build --debug 2>&1 | tee audit/evidence/react418_build_log.txt

# 3. Verificar hydration errors
npm run lint 2>&1 | grep -i "hydration" | tee audit/evidence/react418_lint_hydration.txt

# 4. Buscar usos problemáticos
echo "=== window usage ===" > audit/evidence/react418_browser_apis.txt
grep -r "window\." apps/frontend/app apps/frontend/components >> audit/evidence/react418_browser_apis.txt
echo "" >> audit/evidence/react418_browser_apis.txt
echo "=== document usage ===" >> audit/evidence/react418_browser_apis.txt
grep -r "document\." apps/frontend/app apps/frontend/components >> audit/evidence/react418_browser_apis.txt
echo "" >> audit/evidence/react418_browser_apis.txt
echo "=== localStorage usage ===" >> audit/evidence/react418_browser_apis.txt
grep -r "localStorage" apps/frontend/app apps/frontend/components >> audit/evidence/react418_browser_apis.txt
```

## Checklist de Verificação

- [ ] Rodar `npm run dev` e capturar erro não-minificado
- [ ] Verificar console do browser para warnings de hydration
- [ ] Comparar HTML SSR vs DOM final
- [ ] Buscar uso de `window`, `document`, `localStorage` em componentes
- [ ] Buscar renderização condicional baseada em dados do cliente
- [ ] Verificar componentes de third-party (Stripe, etc.)
- [ ] Validar HTML com html-validator
- [ ] Revisar `useEffect`, `useState` para side effects
- [ ] Testar com JavaScript desabilitado para verificar SSR

## Resultado Esperado

Após executar estes passos, você deve ter:

1. **audit/evidence/react418_dev_log.txt** - Erro completo não-minificado
2. **audit/evidence/react418_build_log.txt** - Análise do build
3. **audit/evidence/react418_browser_apis.txt** - Usos problemáticos de APIs do browser
4. **audit/evidence/react418_screenshots/** - Screenshots do erro

Com estas evidências, o erro pode ser diagnosticado e corrigido.

## Próximos Passos

Depois de identificar a causa:

1. **Criar fix** - Corrigir código problemático
2. **Adicionar teste** - Prevenir regressão
3. **Documentar** - Adicionar comentário explicando o fix
4. **Deploy** - Testar em staging antes de produção

## Referências

- [React Error Decoder](https://reactjs.org/docs/error-decoder.html/)
- [Next.js Hydration Docs](https://nextjs.org/docs/messages/react-hydration-error)
- [React Hydration Best Practices](https://legacy.reactjs.org/docs/react-dom.html#hydrate)
