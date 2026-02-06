# Módulo 2FA (Two-Factor Authentication)

## 📋 Visão Geral

Sistema completo de autenticação de dois fatores (2FA) para a plataforma Ouvify. Adiciona uma camada extra de segurança exigindo um código temporário do aplicativo autenticador além da senha.

## 🏗️ Arquitetura

### Backend (Django)
- **Endpoints:** `apps/backend/apps/core/two_factor_urls.py`
- **Serviço:** `apps/backend/apps/core/two_factor_service.py`
- **Views:** `apps/backend/apps/core/views/two_factor_views.py`

### Frontend (Next.js)
- **Hook:** `hooks/use-2fa.ts`
- **Componentes:** `components/2fa/`
- **Páginas:**
  - `/dashboard/configuracoes/seguranca` - Configuração de 2FA
  - `/login/2fa` - Verificação de código no login

## 🔄 Fluxo de Usuário

### Ativação de 2FA

1. **Usuário acessa** `/dashboard/configuracoes/seguranca`
2. **Clica em** "Ativar 2FA"
3. **Backend gera:**
   - Secret TOTP (base32)
   - QR Code (base64)
   - 10 códigos de backup (XXXX-XXXX)
4. **Usuário escaneia** QR Code no app autenticador
5. **Usuário digita** código de 6 dígitos para confirmar
6. **Backend valida** e ativa 2FA
7. **Usuário visualiza** códigos de backup (única vez)

### Login com 2FA Ativo

1. **Usuário faz login** com email/senha → `/api/token/`
2. **JWT é emitido** normalmente
3. **Frontend verifica** `/api/auth/2fa/status/`
4. **Se 2FA ativo:** redireciona para `/login/2fa`
5. **Usuário digita** código TOTP ou backup code
6. **Backend valida** → `/api/auth/2fa/verify/`
7. **Se válido:** libera acesso ao dashboard

### Desativação de 2FA

1. **Usuário acessa** `/dashboard/configuracoes/seguranca`
2. **Clica em** "Desabilitar 2FA"
3. **Digite:** Senha atual + Código 2FA
4. **Backend valida** e desativa 2FA

## 📡 API Endpoints

### Setup - Iniciar Configuração
```http
POST /api/auth/2fa/setup/
Authorization: Bearer <token>

Response 200:
{
  "secret": "JBSWY3DPEHPK3PXP",
  "qr_code": "data:image/png;base64,...",
  "backup_codes": ["A1B2-C3D4", "E5F6-G7H8", ...],
  "message": "Escaneie o QR code..."
}
```

### Confirm - Confirmar Ativação
```http
POST /api/auth/2fa/confirm/
Authorization: Bearer <token>
Content-Type: application/json

{
  "code": "123456"
}

Response 200:
{
  "message": "2FA habilitado com sucesso!",
  "backup_codes_count": 10
}
```

### Verify - Verificar Código no Login
```http
POST /api/auth/2fa/verify/
Authorization: Bearer <token>
Content-Type: application/json

{
  "code": "123456"  // ou "A1B2-C3D4" para backup code
}

Response 200:
{
  "message": "Código verificado com sucesso",
  "verified": true
}
```

### Status - Consultar Status
```http
GET /api/auth/2fa/status/
Authorization: Bearer <token>

Response 200:
{
  "enabled": true,
  "confirmed_at": "2026-02-06T10:30:00Z",
  "backup_codes_remaining": 8
}
```

### Disable - Desabilitar 2FA
```http
POST /api/auth/2fa/disable/
Authorization: Bearer <token>
Content-Type: application/json

{
  "password": "senha_atual",
  "code": "123456"
}

Response 200:
{
  "message": "2FA desabilitado com sucesso"
}
```

### Regenerate Backup Codes
```http
POST /api/auth/2fa/backup-codes/regenerate/
Authorization: Bearer <token>

Response 200:
{
  "backup_codes": ["N1O2-P3Q4", "R5S6-T7U8", ...]
}
```

## 🎨 Componentes

### TwoFactorQRCode
Exibe QR Code para escanear no app autenticador.

**Props:**
- `qrCodeDataUrl: string` - Data URL do QR Code (base64)
- `secret: string` - Secret TOTP para entrada manual
- `className?: string` - Classes CSS adicionais

**Features:**
- Exibição de QR Code responsivo
- Botão para copiar secret manualmente
- Instruções passo-a-passo

### BackupCodesDisplay
Exibe códigos de backup para impressão/download.

**Props:**
- `codes: string[]` - Array de códigos de backup
- `className?: string` - Classes CSS adicionais

**Features:**
- Grid de códigos formatados
- Botão para copiar todos os códigos
- Botão para baixar .txt
- Alertas de segurança

### TwoFactorSetupModal
Wizard completo de configuração de 2FA.

**Props:**
- `open: boolean` - Controla visibilidade
- `onOpenChange: (open: boolean) => void` - Callback ao mudar estado
- `onComplete?: () => void` - Callback ao concluir

**Features:**
- Fluxo multi-etapas (loading → QR → verify → backup)
- Validação de código em tempo real
- Suporte a Enter key
- Animações de transição

### TwoFactorDisableModal
Modal para desabilitar 2FA com validação dupla.

**Props:**
- `open: boolean` - Controla visibilidade
- `onOpenChange: (open: boolean) => void` - Callback ao mudar estado
- `onComplete?: () => void` - Callback ao concluir

**Features:**
- Validação de senha + código 2FA
- Aviso de segurança
- Suporte a TOTP e backup codes

## 🪝 Hook use2FA

Hook React para gerenciar todas as operações de 2FA.

### Retorno

```typescript
{
  // Estado
  status: TwoFactorStatusResponse | undefined;
  isLoading: boolean;
  error: any;
  setupData: TwoFactorSetupResponse | null;
  isEnabled: boolean;
  
  // Ações
  setup2FA: () => Promise<TwoFactorSetupResponse | null>;
  confirm2FA: (code: string) => Promise<boolean>;
  verify2FA: (code: string) => Promise<boolean>;
  disable2FA: (password: string, code: string) => Promise<boolean>;
  regenerateBackupCodes: () => Promise<string[] | null>;
  refetchStatus: () => Promise<void>;
}
```

### Exemplo de Uso

```typescript
import { use2FA } from "@/hooks/use-2fa";

function SecuritySettings() {
  const { status, isEnabled, setup2FA, confirm2FA } = use2FA();

  const handleActivate = async () => {
    const data = await setup2FA();
    if (data) {
      // Exibir QR Code: data.qr_code
      // Salvar backup codes: data.backup_codes
    }
  };

  return (
    <div>
      <p>2FA: {isEnabled ? "Ativo" : "Inativo"}</p>
      {!isEnabled && (
        <button onClick={handleActivate}>Ativar 2FA</button>
      )}
    </div>
  );
}
```

## 🔐 Segurança

### Rate Limiting
- **Máximo:** 5 tentativas de verificação
- **Janela:** 5 minutos
- **Cache:** Redis/Django Cache Framework

### Armazenamento
- **Secret TOTP:** Criptografado no banco de dados
- **Backup Codes:** Armazenados como SHA-256 hash
- **JWT:** Tokens normais (2FA é verificação adicional)

### Algoritmos
- **TOTP:** RFC 6238 (Time-based One-Time Password)
- **Intervalo:** 30 segundos
- **Dígitos:** 6
- **Janela de tolerância:** ±1 intervalo (60 segundos)

## 📱 Apps Autenticadores Compatíveis

- ✅ Google Authenticator (iOS/Android)
- ✅ Authy (iOS/Android/Desktop)
- ✅ Microsoft Authenticator (iOS/Android)
- ✅ 1Password (iOS/Android/Desktop)
- ✅ Bitwarden (iOS/Android/Desktop)

## 🧪 Como Testar

### 1. Configurar 2FA

```bash
# 1. Fazer login no frontend
# 2. Acessar /dashboard/configuracoes/seguranca
# 3. Clicar em "Ativar 2FA"
# 4. Escanear QR Code no Google Authenticator
# 5. Digite o código de 6 dígitos
```

### 2. Testar Login com 2FA

```bash
# 1. Fazer logout
# 2. Fazer login com email/senha
# 3. Será redirecionado para /login/2fa
# 4. Digite o código do app
# 5. Acesso liberado ao dashboard
```

### 3. Testar Backup Code

```bash
# Na tela /login/2fa:
# 1. Clicar em "Usar código de backup"
# 2. Digite um dos códigos salvos (XXXX-XXXX)
# 3. Código será consumido (só pode usar uma vez)
```

### 4. Desabilitar 2FA

```bash
# 1. Acessar /dashboard/configuracoes/seguranca
# 2. Clicar em "Desabilitar 2FA"
# 3. Digite senha + código 2FA
# 4. 2FA será desativado
```

## 🐛 Troubleshooting

### "Código inválido" repetidamente
- Verificar se o relógio do servidor está sincronizado (NTP)
- Verificar se o app autenticador tem a hora correta
- Janela de tolerância: ±30 segundos

### QR Code não aparece
- Verificar se QR Code está sendo gerado no backend
- Verificar logs do Django: `python manage.py runserver`
- Testar endpoint diretamente: `POST /api/auth/2fa/setup/`

### 2FA não está sendo exigido no login
- Verificar se `two_factor_enabled=True` no banco de dados
- Verificar resposta de `/api/auth/2fa/status/`
- Verificar console do navegador para erros

### "Muitas tentativas"
- Rate limit atingido (5 tentativas em 5 minutos)
- Aguardar 5 minutos ou limpar cache do Django
- Comando: `python manage.py shell` → `cache.clear()`

## 📝 Roadmap Futuro

- [ ] SMS como método alternativo de 2FA
- [ ] Email com código de backup
- [ ] Notificação de login suspeito
- [ ] Histórico de dispositivos confiáveis
- [ ] "Lembrar este dispositivo por 30 dias"
- [ ] WebAuthn/FIDO2 (chaves de segurança)

## 📚 Referências

- [RFC 6238 - TOTP](https://datatracker.ietf.org/doc/html/rfc6238)
- [pyotp Documentation](https://pyauth.github.io/pyotp/)
- [Google Authenticator Protocol](https://github.com/google/google-authenticator/wiki/Key-Uri-Format)

---

**Desenvolvido por:** Ouvify Engineering Team  
**Última atualização:** 06/02/2026
