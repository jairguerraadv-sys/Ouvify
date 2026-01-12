# PROJETO: Ouvy - Frontend (Next.js + Tailwind)

## 1. Visão Geral
Interface pública e administrativa para o SaaS "Ouvy".
Este Frontend consome a API Django que já está rodando em `http://localhost:8000`.

## 2. Stack Tecnológica
* **Framework:** Next.js 14+ (App Router).
* **Linguagem:** TypeScript.
* **Estilização:** Tailwind CSS (Crucial para o White Label dinâmico).
* **Data Fetching:** Fetch API ou Axios.

## 3. Requisito White Label (Frontend)
O Frontend deve ler o subdomínio da URL (ex: `empresaA.site.com`) e:
1.  Fazer uma requisição ao Backend para pegar os dados da empresa (Logo, Cores).
    * *Endpoint sugerido:* GET `/api/public/tenant-info/?domain=empresaA` (Precisaremos criar este endpoint no Django).
2.  **CSS Variables:** Injetar a `primary_color` recebida nas variáveis do CSS `:root` para que todos os botões e bordas mudem de cor automaticamente.

## 4. Estrutura de Rotas (App Router)
* `app/[domain]/page.tsx` -> Página pública de feedback (Dinâmica por subdomínio).
* `app/admin/...` -> Dashboard dos gestores.

## 5. Tarefa Inicial
Atue como Especialista em React/Next.js.
1.  Forneça o comando para iniciar um projeto Next.js limpo chamado `ouvy_frontend`.
2.  Configure o `next.config.js` para permitir carregar imagens externas (para os logos vindos do Backend).