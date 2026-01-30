# 📜 Conformidade LGPD - Ouvify SaaS

Este documento descreve como o Ouvify implementa os requisitos da Lei Geral de Proteção de Dados (Lei 13.709/2018).

## 📋 Sumário

1. [Dados Coletados](#dados-coletados)
2. [Bases Legais](#bases-legais)
3. [Direitos do Titular](#direitos-do-titular)
4. [Retenção de Dados](#retenção-de-dados)
5. [Segurança dos Dados](#segurança-dos-dados)
6. [Gestão de Consentimento](#gestão-de-consentimento)
7. [Relatório de Impacto (RIPD)](#relatório-de-impacto)

---

## 📊 Dados Coletados

### Por Categoria

| Categoria | Dados | Finalidade | Base Legal |
|-----------|-------|------------|------------|
| **Cadastro Tenant** | Nome da empresa, CNPJ, email admin | Prestação do serviço | Execução de contrato |
| **Cadastro Usuário** | Nome, email, senha (hash) | Autenticação | Execução de contrato |
| **Feedback Anônimo** | Título, descrição, tipo | Canal de ouvidoria | Interesse legítimo |
| **Feedback Identificado** | Email de contato | Resposta ao usuário | Consentimento |
| **Logs de Auditoria** | IP anonimizado, ações | Segurança e compliance | Interesse legítimo |
| **Analytics** | Métricas agregadas | Melhoria do serviço | Interesse legítimo |

### Dados Sensíveis

O Ouvify pode processar dados sensíveis em feedbacks/denúncias:
- Alegações de assédio, discriminação
- Informações de saúde (se reportadas)
- Orientação sexual/religiosa (se reportadas)

**Tratamento:** Criptografia em trânsito e repouso, acesso restrito.

---

## ⚖️ Bases Legais

### Para cada tratamento:

| Tratamento | Base Legal (Art. 7º) |
|------------|---------------------|
| Conta de usuário | I - Consentimento (aceite de termos) |
| Prestação do serviço | II - Execução de contrato |
| Feedbacks anônimos | IX - Interesse legítimo |
| Logs de segurança | IX - Interesse legítimo |
| Faturamento | V - Obrigação legal (fiscal) |
| Notificações marketing | I - Consentimento |

---

## 👤 Direitos do Titular

O Ouvify implementa todos os direitos previstos no Art. 18:

### 1. Confirmação e Acesso (Art. 18, I e II)

**Endpoint:** `GET /api/export-data/`

Exporta todos os dados do usuário em formato JSON ou PDF.

```bash
# Exemplo de uso
curl -X GET "https://api.ouvify.com/api/export-data/" \
  -H "Authorization: Bearer <token>"
```

### 2. Correção (Art. 18, III)

**Endpoint:** `PATCH /api/auth/me/`

Permite atualizar nome, email e outras informações.

### 3. Anonimização/Bloqueio/Eliminação (Art. 18, IV)

**Endpoint:** `DELETE /api/account/`

Processo de exclusão:
1. Soft delete imediato (desativa conta)
2. Período de graça de 30 dias (reversível)
3. Hard delete após 30 dias (irreversível)

**Dados mantidos (anonimizados):**
- Feedbacks: mantidos sem identificação
- Logs de auditoria: IP anonimizado

### 4. Portabilidade (Art. 18, V)

**Endpoint:** `GET /api/export-data/?format=json`

Formatos disponíveis:
- JSON (estruturado)
- CSV (planilhas)

### 5. Revogação de Consentimento (Art. 18, IX)

**Endpoint:** `POST /api/consent/{id}/revoke/`

```bash
curl -X POST "https://api.ouvify.com/api/consent/123/revoke/" \
  -H "Authorization: Bearer <token>"
```

---

## ⏰ Retenção de Dados

### Períodos de Retenção

| Tipo de Dado | Período | Justificativa |
|--------------|---------|---------------|
| Conta ativa | Enquanto ativo | Prestação do serviço |
| Conta deletada | 30 dias | Período de reversão |
| Feedbacks (ativos) | Conforme contrato | Histórico de atendimento |
| Feedbacks (empresa inativa) | 5 anos | Obrigação legal |
| Logs de segurança | 1 ano | Interesse legítimo |
| Dados fiscais | 5 anos | Obrigação legal (Art. 173 CTN) |
| Backups | 90 dias | Disaster recovery |

### Exclusão Automática

```python
# Tarefa agendada (Celery)
@app.task
def cleanup_expired_data():
    # Deletar contas marcadas há mais de 30 dias
    Account.objects.filter(
        deleted_at__lte=timezone.now() - timedelta(days=30)
    ).delete()
    
    # Anonimizar logs antigos
    AuditLog.objects.filter(
        created_at__lte=timezone.now() - timedelta(days=365)
    ).update(ip_address='0.0.0.0', user_agent='[anonymized]')
```

---

## 🔒 Segurança dos Dados

### Medidas Técnicas (Art. 46)

| Medida | Implementação |
|--------|---------------|
| Criptografia em trânsito | TLS 1.2+ (HTTPS obrigatório) |
| Criptografia em repouso | PostgreSQL encryption, bcrypt para senhas |
| Controle de acesso | RBAC (roles: OWNER, ADMIN, MODERATOR, VIEWER) |
| Logs de auditoria | Todas ações críticas registradas |
| Anonimização | IPs parcialmente mascarados em logs |
| Backup | Diário com retenção de 90 dias |

### Incidentes de Segurança (Art. 48)

Processo de resposta:
1. **Detecção:** Alertas Sentry + monitoramento
2. **Contenção:** Isolamento do sistema afetado
3. **Notificação:** ANPD + titulares em até 72h (se aplicável)
4. **Remediação:** Correção e documentação
5. **Pós-incidente:** Análise e melhorias

---

## ✅ Gestão de Consentimento

### Modelo de Dados

```python
class ConsentVersion(models.Model):
    document_type = models.CharField(choices=[
        ('terms', 'Termos de Uso'),
        ('privacy', 'Política de Privacidade'),
        ('lgpd', 'Consentimento LGPD'),
        ('marketing', 'Marketing'),
    ])
    version = models.CharField(max_length=20)
    is_required = models.BooleanField(default=True)
    effective_date = models.DateTimeField()

class UserConsent(models.Model):
    user = models.ForeignKey(User, null=True)
    email = models.EmailField(null=True)  # Para anônimos
    consent_version = models.ForeignKey(ConsentVersion)
    accepted = models.BooleanField()
    accepted_at = models.DateTimeField(null=True)
    revoked = models.BooleanField(default=False)
    revoked_at = models.DateTimeField(null=True)
    ip_address = models.GenericIPAddressField()
```

### Fluxo de Consentimento

1. **Cadastro:** Termos + Privacidade (obrigatórios)
2. **Envio de Feedback:** LGPD (se identificado)
3. **Configurações:** Marketing (opcional)

### Versionamento

Quando os termos são atualizados:
1. Nova versão é criada com `is_current=True`
2. Usuários são notificados no próximo login
3. Consentimento anterior é mantido para auditoria

---

## 📄 Relatório de Impacto (RIPD)

### Quando Elaborar

- Novos tratamentos de dados sensíveis
- Mudanças significativas no fluxo de dados
- Integrações com terceiros

### Estrutura do RIPD

1. **Descrição do tratamento**
2. **Necessidade e proporcionalidade**
3. **Riscos identificados**
4. **Medidas mitigadoras**
5. **Parecer do DPO**

### Operações de Alto Risco

| Operação | Risco | Mitigação |
|----------|-------|-----------|
| Feedbacks de denúncia | Vazamento de identidade | Anonimato, logs restritos |
| Integração Stripe | Dados de pagamento | Tokenização, PCI-DSS |
| Analytics | Profiling | Dados agregados apenas |

---

## 📞 Encarregado (DPO)

**Responsável:** [Nome do DPO]  
**Contato:** dpo@ouvify.com  
**Atribuições:**
- Receber comunicações de titulares
- Interagir com a ANPD
- Orientar funcionários sobre LGPD

---

## 📚 Documentos Relacionados

- [Política de Privacidade](/privacidade) - Versão pública
- [Termos de Uso](/termos) - Contrato de adesão
- [Segurança](./security.md) - Controles técnicos

---

## 🔄 Histórico de Revisões

| Data | Versão | Alterações |
|------|--------|------------|
| 30/01/2026 | 1.0 | Documento inicial |

---

**Última atualização:** 30 de Janeiro de 2026  
**Próxima revisão:** 30 de Julho de 2026
