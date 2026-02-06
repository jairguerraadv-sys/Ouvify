# 📜 Componentes de Consentimento LGPD

Componentes React/TypeScript para gerenciamento de consentimentos LGPD e privacidade de dados.

---

## 📦 Componentes Disponíveis

### 1. `ConsentCheckbox.tsx`

Checkbox expandível para aceite de termos LGPD em formulários.

**Uso:**

```tsx
import { ConsentCheckbox } from "@/components/consent/ConsentCheckbox";

function MyForm() {
  const [consentAccepted, setConsentAccepted] = useState(false);

  return (
    <form>
      <ConsentCheckbox
        checked={consentAccepted}
        onChange={setConsentAccepted}
        email="optional@email.com"
      />
    </form>
  );
}
```

**Props:**

```typescript
interface ConsentCheckboxProps {
  checked: boolean; // Estado do checkbox
  onChange: (checked: boolean) => void; // Callback quando muda
  email?: string; // Email do usuário (opcional)
  className?: string; // Classes Tailwind adicionais
}
```

**Features:**

- ✅ Busca automática de termos obrigatórios (`GET /api/consent/versions/required/`)
- ✅ Exibe termo LGPD com versão
- ✅ Botão "Ver detalhes" para expandir direitos LGPD
- ✅ Links externos para documentos (privacy policy)
- ✅ Loading skeleton
- ✅ Error handling

**Estados:**

**Loading:**

```tsx
<div className="animate-pulse">
  <div className="h-4 bg-muted rounded w-3/4 mb-2" />
  <div className="h-3 bg-muted rounded w-1/2" />
</div>
```

**Expandido:**

- Lista de direitos LGPD (acessar, corrigir, excluir dados)
- Link para privacy policy (`content_url`)
- Badge com data de vigência

**Error:**

```tsx
<p className="text-error text-sm">Erro ao carregar termos de consentimento</p>
```

---

## 🪝 Hook: `use-consent.ts`

Hook centralizado para todas as operações de consentimento.

### Exports

#### `useConsent()`

Hook principal com acesso completo à API de consentimento.

```typescript
const {
  versions, // Todas as versões de termos
  required, // Somente termos obrigatórios
  myConsents, // Consentimentos do usuário
  pending, // Termos pendentes de aceite
  isLoading, // Loading state
  acceptConsent, // Aceitar (usuário autenticado)
  acceptConsentAnonymous, // Aceitar (anônimo com email)
  revokeConsent, // Revogar consentimento
  refetchVersions, // Recarregar versões
  refetchMyConsents, // Recarregar meus consentimentos
} = useConsent();
```

#### `useRequiredConsents()`

Hook simplificado para formulários (só retorna termos obrigatórios).

```typescript
const {
  required, // ConsentVersion[] | undefined
  isLoading, // boolean
  error, // any
} = useRequiredConsents();
```

---

## 📘 API Reference

### Tipos TypeScript

#### `ConsentVersion`

Representa uma versão de termo (LGPD, Privacy, Terms, Marketing).

```typescript
interface ConsentVersion {
  id: number;
  document_type: string; // 'lgpd' | 'privacy' | 'terms' | 'marketing'
  document_type_display: string; // 'Termos LGPD' | 'Política de Privacidade'
  version: string; // '1.0', '2.0'
  content_url: string; // Link para documento completo
  effective_date: string; // ISO timestamp
  is_current: boolean;
  is_required: boolean;
}
```

#### `UserConsent`

Representa o aceite/revogação de um usuário.

```typescript
interface UserConsent {
  id: number;
  user: number | null; // null se consentimento anônimo
  email: string | null; // preenchido se anônimo
  consent_version: number; // FK para ConsentVersion
  consent_version_details: ConsentVersion; // Nested object
  accepted_at: string; // ISO timestamp
  revoked: boolean;
  revoked_at: string | null;
  context: string; // 'feedback' | 'signup' | 'manual'
}
```

#### `PendingResponse`

Indica se há termos pendentes de aceite.

```typescript
interface PendingResponse {
  has_pending: boolean;
  pending_consents: ConsentVersion[];
}
```

#### `AcceptConsentData`

Payload para aceitar consentimento.

```typescript
interface AcceptConsentData {
  document_type: string; // 'lgpd' | 'privacy' | 'terms' | 'marketing'
  version?: string; // Opcional (backend usa versão mais recente)
}
```

---

## 🔌 Endpoints Integrados

### Versões de Consentimento

| Método | Endpoint                          | Descrição              | Usado em                |
| ------ | --------------------------------- | ---------------------- | ----------------------- |
| GET    | `/api/consent/versions/`          | Lista todas as versões | `useConsent()`          |
| GET    | `/api/consent/versions/required/` | Somente obrigatórios   | `useRequiredConsents()` |

### Consentimentos do Usuário

| Método | Endpoint                                       | Descrição                    | Usado em                   |
| ------ | ---------------------------------------------- | ---------------------------- | -------------------------- |
| GET    | `/api/consent/user-consents/`                  | Lista consentimentos do user | `useConsent()`             |
| POST   | `/api/consent/user-consents/accept/`           | Aceitar (autenticado)        | `acceptConsent()`          |
| POST   | `/api/consent/user-consents/accept_anonymous/` | Aceitar (anônimo)            | `acceptConsentAnonymous()` |
| POST   | `/api/consent/user-consents/{id}/revoke/`      | Revogar                      | `revokeConsent()`          |
| GET    | `/api/consent/user-consents/pending/`          | Termos pendentes             | `useConsent()`             |

---

## 🚀 Exemplos de Uso

### Exemplo 1: Formulário de Denúncia Anônima

```tsx
"use client";

import { useState } from "react";
import { ConsentCheckbox } from "@/components/consent/ConsentCheckbox";
import { useConsent } from "@/hooks/use-consent";
import { Button } from "@/components/ui/button";

export default function FeedbackForm() {
  const [formData, setFormData] = useState({
    titulo: "",
    descricao: "",
    email: "",
  });
  const [consentAccepted, setConsentAccepted] = useState(false);
  const { acceptConsentAnonymous } = useConsent();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validar consentimento
    if (!consentAccepted) {
      alert("Você deve aceitar os termos LGPD");
      return;
    }

    // Aceitar consentimento LGPD
    const consent = await acceptConsentAnonymous(
      [{ document_type: "lgpd" }],
      formData.email || undefined,
    );

    if (!consent) {
      alert("Erro ao registrar consentimento");
      return;
    }

    // Enviar feedback
    // ...
  };

  return (
    <form onSubmit={handleSubmit}>
      <input
        type="text"
        value={formData.titulo}
        onChange={(e) => setFormData({ ...formData, titulo: e.target.value })}
        placeholder="Título"
      />

      <textarea
        value={formData.descricao}
        onChange={(e) =>
          setFormData({ ...formData, descricao: e.target.value })
        }
        placeholder="Descrição"
      />

      <input
        type="email"
        value={formData.email}
        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
        placeholder="Email (opcional)"
      />

      {/* Checkbox de Consentimento */}
      <ConsentCheckbox
        checked={consentAccepted}
        onChange={setConsentAccepted}
        email={formData.email}
      />

      <Button type="submit" disabled={!consentAccepted}>
        Enviar Denúncia
      </Button>
    </form>
  );
}
```

---

### Exemplo 2: Página de Privacidade

```tsx
"use client";

import { useConsent } from "@/hooks/use-consent";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export default function PrivacyPage() {
  const { myConsents, pending, revokeConsent, isLoading } = useConsent();

  const handleRevoke = async (consentId: number) => {
    const confirmed = confirm(
      "Tem certeza que deseja revogar este consentimento?",
    );
    if (!confirmed) return;

    const success = await revokeConsent(consentId);
    if (success) {
      // Toast de sucesso já exibido pelo hook
    }
  };

  if (isLoading) {
    return <div>Carregando...</div>;
  }

  return (
    <div>
      <h1>Meus Consentimentos</h1>

      {/* Alerta de Pendentes */}
      {pending?.has_pending && (
        <div className="bg-warning/10 p-4 rounded-lg mb-4">
          <p>Você tem termos pendentes de aceitação!</p>
        </div>
      )}

      {/* Lista de Consentimentos */}
      <div className="space-y-4">
        {myConsents?.map((consent) => (
          <Card
            key={consent.id}
            className={
              consent.revoked
                ? "border-error/20 bg-error/5"
                : "border-success/20 bg-success/5"
            }
          >
            <h3>{consent.consent_version_details.document_type_display}</h3>
            <p>Versão {consent.consent_version_details.version}</p>

            <Badge variant={consent.revoked ? "destructive" : "success"}>
              {consent.revoked ? "Revogado" : "Ativo"}
            </Badge>

            <p className="text-sm text-muted-foreground">
              {consent.revoked
                ? `Revogado em ${new Date(consent.revoked_at!).toLocaleDateString()}`
                : `Aceito em ${new Date(consent.accepted_at).toLocaleDateString()}`}
            </p>

            {consent.consent_version_details.content_url && (
              <a
                href={consent.consent_version_details.content_url}
                target="_blank"
                rel="noopener noreferrer"
              >
                Ver Documento
              </a>
            )}

            {!consent.revoked && (
              <Button
                variant="outline"
                onClick={() => handleRevoke(consent.id)}
                className="text-error"
              >
                Revogar
              </Button>
            )}
          </Card>
        ))}
      </div>
    </div>
  );
}
```

---

### Exemplo 3: Modal de Cadastro

```tsx
"use client";

import { useState } from "react";
import { useRequiredConsents } from "@/hooks/use-consent";
import { Button } from "@/components/ui/button";

export default function SignupModal() {
  const { required, isLoading } = useRequiredConsents();
  const [acceptedTerms, setAcceptedTerms] = useState<Record<number, boolean>>(
    {},
  );

  const allAccepted = required?.every((term) => acceptedTerms[term.id]);

  const handleSubmit = async () => {
    if (!allAccepted) {
      alert("Você deve aceitar todos os termos obrigatórios");
      return;
    }

    // Aceitar todos os consents
    const consentsData = required?.map((term) => ({
      document_type: term.document_type,
      version: term.version,
    }));

    // ... lógica de cadastro
  };

  if (isLoading) {
    return <div>Carregando termos...</div>;
  }

  return (
    <div>
      <h2>Termos de Uso</h2>
      <p>Para continuar, você deve aceitar os seguintes termos:</p>

      {required?.map((term) => (
        <label key={term.id} className="flex items-start gap-3">
          <input
            type="checkbox"
            checked={acceptedTerms[term.id] || false}
            onChange={(e) =>
              setAcceptedTerms({
                ...acceptedTerms,
                [term.id]: e.target.checked,
              })
            }
          />
          <div>
            <p className="font-semibold">
              {term.document_type_display} - v{term.version}
            </p>
            <a
              href={term.content_url}
              target="_blank"
              className="text-primary text-sm"
            >
              Ler documento completo
            </a>
          </div>
        </label>
      ))}

      <Button onClick={handleSubmit} disabled={!allAccepted}>
        Aceitar e Continuar
      </Button>
    </div>
  );
}
```

---

## 🎨 Design Guidelines

### Cores Semânticas

| Classe Tailwind                   | Uso                    | Exemplo         |
| --------------------------------- | ---------------------- | --------------- |
| `border-success/20 bg-success/5`  | Consentimento ativo    | Card verde      |
| `border-error/20 bg-error/5`      | Consentimento revogado | Card vermelho   |
| `border-primary/20 bg-primary/5`  | Checkbox de destaque   | ConsentCheckbox |
| `border-warning/30 bg-warning/10` | Alertas de pendentes   | Pending alert   |

### Badges

```tsx
// Status: Ativo
<Badge variant="success" className="flex items-center gap-1">
  <CheckCircle2 className="w-3 h-3" />
  Ativo
</Badge>

// Status: Revogado
<Badge variant="destructive" className="flex items-center gap-1">
  <XCircle className="w-3 h-3" />
  Revogado
</Badge>

// Tipo: LGPD
<Badge variant="primary">Versão 1.0</Badge>

// Tipo: Privacy
<Badge variant="success">Versão 2.0</Badge>

// Tipo: Terms
<Badge variant="info">Versão 1.0</Badge>

// Tipo: Marketing
<Badge variant="warning">Versão 1.0</Badge>
```

### Ícones

```tsx
import {
  Shield, // LGPD, Privacidade
  FileText, // Termos, Documentos
  CheckCircle2, // Ativo
  XCircle, // Revogado
  AlertCircle, // Alertas
  Download, // Exportar dados
  Trash2, // Revogar, Excluir
  ExternalLink, // Links externos
  Calendar, // Datas
  Mail, // Email, Marketing
} from "lucide-react";
```

---

## 🧪 Testes

### Teste Manual 1: Checkbox de Consentimento

1. Acessar `/enviar`
2. Verificar se checkbox aparece
3. Clicar "Ver detalhes" → deve expandir
4. Tentar enviar sem marcar → deve exibir erro
5. Marcar checkbox → erro desaparece
6. Enviar formulário → toast de sucesso

### Teste Manual 2: Página de Privacidade

1. Acessar `/dashboard/privacidade`
2. Verificar lista de consentimentos
3. Clicar "Revogar" → modal aparece
4. Confirmar revogação → toast de sucesso
5. Card muda para vermelho com badge "Revogado"

### Teste Manual 3: Loading States

1. Abrir DevTools → Network → Throttling: Slow 3G
2. Acessar `/dashboard/privacidade`
3. Verificar skeleton de 3 cards
4. Acessar `/enviar`
5. Verificar skeleton no ConsentCheckbox

### Teste Manual 4: Error States

1. Desligar backend
2. Acessar `/enviar`
3. Verificar erro: "Erro ao carregar termos de consentimento"

---

## 🔧 Troubleshooting

### Problema: "Erro ao carregar termos de consentimento"

**Causa:** Backend não está respondendo ou não há termos cadastrados.

**Solução:**

1. Verificar se backend está rodando: `cd apps/backend && python manage.py runserver`
2. Acessar admin: `http://localhost:8000/admin/consent/consentversion/`
3. Criar pelo menos 1 termo com `is_required=True` e `document_type='lgpd'`

---

### Problema: "Consentimento aceito mas não aparece na lista"

**Causa:** SWR não revalidou a query.

**Solução:**

```typescript
const { myConsents, refetchMyConsents } = useConsent();

// Após aceitar consentimento
await acceptConsent(...);
await refetchMyConsents(); // Força revalidação
```

---

### Problema: Modal de revogação não fecha

**Causa:** Estado `isRevoking` não está sendo resetado.

**Solução:**

```typescript
const handleRevokeConfirm = async () => {
  setIsRevoking(true);
  try {
    await revokeConsent(consentId);
    setRevokeModalOpen(false); // Fechar modal
  } finally {
    setIsRevoking(false); // Sempre resetar
  }
};
```

---

## 📚 Recursos Adicionais

- **Documentação Backend:** [apps/backend/apps/consent/README.md](../../backend/apps/consent/README.md)
- **Relatório de Implementação:** [docs/LGPD_IMPLEMENTATION_REPORT.md](../../../docs/LGPD_IMPLEMENTATION_REPORT.md)
- **API Future Features:** [docs/API_FUTURE_FEATURES.md](../../../docs/API_FUTURE_FEATURES.md)
- **LGPD (Lei Geral de Proteção de Dados):** https://www.planalto.gov.br/ccivil_03/_ato2015-2018/2018/lei/l13709.htm

---

## ✅ Checklist de Implementação

Ao implementar consentimento em uma nova página:

- [ ] Importar `ConsentCheckbox` ou criar lista de checkboxes com `useRequiredConsents()`
- [ ] Adicionar estado `const [consentAccepted, setConsentAccepted] = useState(false)`
- [ ] Validar consentimento antes de enviar formulário
- [ ] Chamar `acceptConsent()` ou `acceptConsentAnonymous()` conforme caso
- [ ] Tratar erros (toast) e loading states
- [ ] Testar fluxo completo: carregar → marcar → enviar → verificar no backend

---

**Implementado por:** Ouvify Frontend Engineer  
**Data:** 06 de Fevereiro de 2026  
**Status:** ✅ Pronto para Produção
