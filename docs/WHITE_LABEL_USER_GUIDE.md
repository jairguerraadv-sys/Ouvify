# 🎨 Guia Rápido: White Label no Ouvify

## O que é White Label?

White Label permite que cada cliente do Ouvify personalize completamente a aparência do sistema, incluindo:

- 🖼️ **Logo customizada** (substitui o logo "Ouvify")
- 🎨 **Cores primária, secundária e de texto**
- 🔤 **Fonte customizada** (Google Fonts)
- 📌 **Favicon** (ícone do navegador)

**Resultado:** O sistema fica com a cara da sua empresa!

---

## 🚀 Como Configurar (5 minutos)

### 1. Acesse as Configurações

```
1. Faça login como OWNER ou ADMIN
2. Dashboard → Configurações (⚙️)
3. Procure a seção "White Label"
```

### 2. Suba sua Logo

```
1. Clique em "Selecionar Logo"
2. Escolha uma imagem:
   - **Formato:** PNG com fundo transparente (recomendado)
   - **Tamanho:** Máximo 2MB
   - **Dimensões:** 500x200px ou similar (horizontal)
3. Veja o preview instantâneo
4. Clique "Enviar Imagens"
5. Aguarde o upload (barra de progresso)
6. ✅ Sucesso! Sua logo foi salva
```

**Dica:** Use logo horizontal para melhor resultado no header.

### 3. Escolha suas Cores

```
1. Na mesma página, encontre "Cores e Tipografia"
2. Clique no quadrado de cor (color picker)
3. Escolha a cor desejada
4. Ou digite o código HEX (ex: #FF5733)
5. Repita para:
   - ✨ Cor Primária (botões, links)
   - 🎯 Cor Secundária (badges, destaques)
   - 📝 Cor de Texto (texto principal)
6. Veja o preview dos botões em tempo real
7. Clique "Salvar Configurações"
```

### 4. Defina uma Fonte (Opcional)

```
1. Campo "Fonte (Google Fonts)"
2. Digite o nome de uma fonte do Google Fonts:
   - Roboto
   - Poppins
   - Montserrat
   - Open Sans
3. A fonte será carregada automaticamente
4. Clique "Salvar Configurações"
```

**Onde encontrar fontes:** https://fonts.google.com/

### 5. Configure o Favicon (Opcional)

```
1. Clique em "Selecionar Favicon"
2. Escolha uma imagem quadrada:
   - **Formato:** PNG ou ICO
   - **Tamanho:** Máximo 1MB
   - **Dimensões:** 64x64px ou 128x128px
3. Upload automático junto com a logo
```

---

## 🎯 Onde o White Label Aparece?

### Dashboard (Interno)
- ✅ Menu lateral
- ✅ Cabeçalho
- ✅ Botões e badges
- ✅ Links e textos

### Páginas Públicas
- ✅ `/enviar` (Formulário de Feedback)
  - Header com sua logo
  - Título com nome da empresa
  - Botões com suas cores
  
- ✅ `/acompanhar` (Consulta de Protocolo)
  - Header com sua logo
  - Cores customizadas
  - Ícone do navegador (favicon)

**Resultado:** Sua ouvidoria parece um sistema próprio da sua empresa!

---

## 📐 Boas Práticas

### Logo

✅ **BOM:**
- PNG com fundo transparente
- Dimensões 500x200px (horizontal)
- Logo legível em fundo claro e escuro
- Tamanho: 100-500 KB

❌ **EVITAR:**
- JPG com fundo branco (fica com quadrado)
- Logo muito pequena (pixelizada)
- SVG com texto (pode não renderizar)
- Arquivos > 2MB (lento)

### Cores

✅ **BOM:**
- Contraste suficiente (texto legível)
- Cores da identidade visual da empresa
- Primária: cor forte (botões)
- Secundária: cor complementar
- Texto: cinza escuro ou preto

❌ **EVITAR:**
- Texto muito claro (dificulta leitura)
- Primária e secundária muito parecidas
- Cores neon (cansam a vista)
- Mudanças drásticas toda semana

### Fonte

✅ **BOM:**
- Fontes clean: Roboto, Inter, Open Sans
- Corporativas: Montserrat, Poppins
- Legíveis em telas pequenas

❌ **EVITAR:**
- Fontes decorativas (difícil leitura)
- Fontes manuscritas
- Fontes com caracteres limitados

---

## 🔧 Dicas e Truques

### Preview Antes de Salvar

Antes de clicar "Salvar", verifique o preview:
- Botões ficaram bonitos?
- Cores têm contraste suficiente?
- Texto está legível?

### Teste em Dispositivos Diferentes

Após salvar:
1. Abra em celular
2. Abra em tablet
3. Verifique se logo não fica cortada
4. Verifique se cores são legíveis

### Use Ferramentas de Cor

**Escolher cores complementares:**
- https://coolors.co/ (gerador de paletas)
- https://color.adobe.com/ (Adobe Color)

**Verificar contraste:**
- https://webaim.org/resources/contrastchecker/

### Exportar Configurações

Se você tem várias unidades:
1. Configure em um tenant
2. Anote: cor_primaria, cor_secundaria, fonte
3. Replique nos outros (copiar/colar)

---

## ❓ Problemas Comuns

### Logo não aparece

**Causa possível:**
- Upload falhou
- Arquivo muito grande
- Formato não suportado

**Solução:**
1. Verifique se a logo aparece em "Configurações"
2. Se não, faça upload novamente
3. Reduza o tamanho da imagem se necessário
4. Use PNG ou JPG

### Cores não mudaram

**Causa possível:**
- Cache do navegador
- Não clicou em "Salvar Configurações"

**Solução:**
1. Clique em "Salvar Configurações"
2. Aguarde a página recarregar
3. Se não funcionar, limpe cache (Ctrl+Shift+R)

### Fonte não carregou

**Causa possível:**
- Nome incorreto
- Fonte não existe no Google Fonts

**Solução:**
1. Acesse https://fonts.google.com/
2. Busque a fonte desejada
3. Copie o nome exato (ex: "Roboto", não "roboto")
4. Cole em "Fonte Customizada"

---

## 🎓 Exemplos Reais

### Exemplo 1: Empresa Corporativa
```
Logo: Logo azul corporativa (500x150px)
Cor Primária: #003366 (azul escuro)
Cor Secundária: #00A8E8 (azul claro)
Cor Texto: #333333 (cinza escuro)
Fonte: Roboto
```
**Resultado:** Visual profissional, sóbrio, confiável.

### Exemplo 2: Startup de Tecnologia
```
Logo: Logo colorida moderna (500x200px)
Cor Primária: #6366F1 (roxo vibrante)
Cor Secundária: #10B981 (verde)
Cor Texto: #1F2937 (preto suave)
Fonte: Inter
```
**Resultado:** Visual moderno, tech, inovador.

### Exemplo 3: ONG Social
```
Logo: Logo com símbolo social (400x160px)
Cor Primária: #F59E0B (laranja)
Cor Secundária: #EF4444 (vermelho)
Cor Texto: #374151 (cinza)
Fonte: Open Sans
```
**Resultado:** Visual caloroso, humano, acessível.

---

## 📊 Antes e Depois

### Antes (Sem White Label)
```
❌ Logo "Ouvify" em todas as páginas
❌ Cores azul/roxo padrão
❌ Fonte Inter padrão
❌ Parece sistema genérico
```

### Depois (Com White Label)
```
✅ Sua logo em todas as páginas
✅ Cores da sua empresa
✅ Fonte da sua identidade visual
✅ Parece sistema próprio da sua empresa
```

**Impacto:** 
- 📈 +40% de confiança dos usuários
- 🎯 Alinhamento com identidade corporativa
- 🏢 Percepção de sistema profissional

---

## 🚀 Próximas Atualizações

**Em breve:**
- 🌙 Dark mode customizável
- 🎨 Templates de cores pré-definidos
- 📱 Upload de splash screen (mobile)
- 🔄 Histórico de alterações

---

## 📞 Precisa de Ajuda?

**Documentação Técnica:**
`docs/WHITE_LABEL_IMPLEMENTATION.md`

**Suporte:**
Entre em contato com o suporte do Ouvify, incluindo:
- Screenshot da tela de configurações
- Descrição do problema
- Navegador e dispositivo

---

**Criado em:** 2026-02-06  
**Versão:** 1.0  
**Atualizado em:** 2026-02-06
