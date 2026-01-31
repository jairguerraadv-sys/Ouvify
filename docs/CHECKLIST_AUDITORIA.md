# 📋 Checklist de Auditoria - Ouvify

**Data de Início:** ___/___/______  
**Data de Conclusão:** ___/___/______  
**Auditor:** _________________________

---

## 🔐 SEGURANÇA

### Autenticação e Autorização
| Item | Status | Notas |
|------|--------|-------|
| JWT com expiração curta (< 15 min) | ⬜ | |
| Refresh token com rotação | ⬜ | |
| Blacklist de tokens | ⬜ | |
| Rate limiting em login | ⬜ | |
| Bloqueio após tentativas falhas | ⬜ | |
| 2FA implementado | ⬜ | |
| Senhas com hash bcrypt/argon2 | ⬜ | |
| Isolamento multi-tenant | ⬜ | |
| Roles e permissões | ⬜ | |

### Validação de Entrada
| Item | Status | Notas |
|------|--------|-------|
| Sanitização de HTML (Bleach) | ⬜ | |
| DOMPurify no frontend | ⬜ | |
| Validação de tipos de arquivo | ⬜ | |
| Limite de tamanho de upload | ⬜ | |
| Validação de email | ⬜ | |
| Validação de URLs | ⬜ | |
| SQL Injection prevenido (ORM) | ⬜ | |

### Headers de Segurança
| Item | Status | Notas |
|------|--------|-------|
| HSTS habilitado | ⬜ | |
| X-Frame-Options: DENY | ⬜ | |
| X-Content-Type-Options: nosniff | ⬜ | |
| X-XSS-Protection | ⬜ | |
| Referrer-Policy | ⬜ | |
| CSP implementado | ⬜ | |
| Permissions-Policy | ⬜ | |

### Secrets e Configuração
| Item | Status | Notas |
|------|--------|-------|
| Nenhum secret hardcoded | ⬜ | |
| .env.example documentado | ⬜ | |
| SECRET_KEY validada em prod | ⬜ | |
| DEBUG=False em prod | ⬜ | |
| ALLOWED_HOSTS restritivo | ⬜ | |
| CORS configurado | ⬜ | |

### LGPD/GDPR
| Item | Status | Notas |
|------|--------|-------|
| Endpoint de exclusão de conta | ⬜ | |
| Endpoint de exportação de dados | ⬜ | |
| Consentimento antes de coleta | ⬜ | |
| Política de privacidade | ⬜ | |
| Termos de uso | ⬜ | |
| Logs sem dados sensíveis | ⬜ | |
| Anonimização implementada | ⬜ | |

---

## 💻 CÓDIGO

### Backend
| Item | Status | Notas |
|------|--------|-------|
| Estrutura de apps consistente | ⬜ | |
| Models com validadores | ⬜ | |
| Serializers com validação | ⬜ | |
| Views com permissões | ⬜ | |
| Signals documentados | ⬜ | |
| Tasks Celery funcionando | ⬜ | |
| Migrações atualizadas | ⬜ | |
| Sem código duplicado | ⬜ | |
| Sem imports não utilizados | ⬜ | |
| Docstrings em funções | ⬜ | |

### Frontend
| Item | Status | Notas |
|------|--------|-------|
| Componentes tipados (TypeScript) | ⬜ | |
| Props com interface/type | ⬜ | |
| Hooks com deps corretas | ⬜ | |
| useEffect com cleanup | ⬜ | |
| Error boundaries | ⬜ | |
| Loading states | ⬜ | |
| Tratamento de erros | ⬜ | |
| Sem código duplicado | ⬜ | |
| ESLint sem erros | ⬜ | |
| TypeScript sem erros | ⬜ | |

---

## 🔗 INTEGRIDADE

### Funcionalidades Público
| Item | Backend | Frontend | Testado | Status |
|------|---------|----------|---------|--------|
| Enviar feedback | ⬜ | ⬜ | ⬜ | |
| Upload anexos | ⬜ | ⬜ | ⬜ | |
| Receber protocolo | ⬜ | ⬜ | ⬜ | |
| Consultar status | ⬜ | ⬜ | ⬜ | |
| Adicionar info ao protocolo | ⬜ | ⬜ | ⬜ | |
| Aceitar termos LGPD | ⬜ | ⬜ | ⬜ | |

### Funcionalidades Admin
| Item | Backend | Frontend | Testado | Status |
|------|---------|----------|---------|--------|
| Login | ⬜ | ⬜ | ⬜ | |
| Dashboard métricas | ⬜ | ⬜ | ⬜ | |
| Listar feedbacks | ⬜ | ⬜ | ⬜ | |
| Filtrar feedbacks | ⬜ | ⬜ | ⬜ | |
| Ver detalhes feedback | ⬜ | ⬜ | ⬜ | |
| Responder feedback | ⬜ | ⬜ | ⬜ | |
| Alterar status | ⬜ | ⬜ | ⬜ | |
| Alterar prioridade | ⬜ | ⬜ | ⬜ | |
| Atribuir membro | ⬜ | ⬜ | ⬜ | |
| Notas internas | ⬜ | ⬜ | ⬜ | |
| Templates resposta | ⬜ | ⬜ | ⬜ | |
| Gerenciar tags | ⬜ | ⬜ | ⬜ | |
| Convidar equipe | ⬜ | ⬜ | ⬜ | |
| Aceitar convite | ⬜ | ⬜ | ⬜ | |
| Definir roles | ⬜ | ⬜ | ⬜ | |
| Remover membro | ⬜ | ⬜ | ⬜ | |
| Configurar logo | ⬜ | ⬜ | ⬜ | |
| Configurar cores | ⬜ | ⬜ | ⬜ | |
| Exportar dados | ⬜ | ⬜ | ⬜ | |
| Ver relatórios | ⬜ | ⬜ | ⬜ | |
| Gerenciar assinatura | ⬜ | ⬜ | ⬜ | |
| Upgrade plano | ⬜ | ⬜ | ⬜ | |
| Configurar webhooks | ⬜ | ⬜ | ⬜ | |
| Ver audit log | ⬜ | ⬜ | ⬜ | |
| Alterar perfil | ⬜ | ⬜ | ⬜ | |
| Reset senha | ⬜ | ⬜ | ⬜ | |
| Habilitar 2FA | ⬜ | ⬜ | ⬜ | |
| Excluir conta | ⬜ | ⬜ | ⬜ | |

### Funcionalidades Super Admin
| Item | Backend | Frontend | Testado | Status |
|------|---------|----------|---------|--------|
| Listar tenants | ⬜ | ⬜ | ⬜ | |
| Ver status tenant | ⬜ | ⬜ | ⬜ | |
| Ativar/desativar tenant | ⬜ | ⬜ | ⬜ | |
| Métricas globais | ⬜ | ⬜ | ⬜ | |

---

## 🚀 PERFORMANCE

### Backend
| Item | Status | Notas |
|------|--------|-------|
| Queries N+1 corrigidas | ⬜ | |
| Índices em campos filtrados | ⬜ | |
| select_related usado | ⬜ | |
| prefetch_related usado | ⬜ | |
| Paginação implementada | ⬜ | |
| Cache configurado | ⬜ | |
| Gzip habilitado | ⬜ | |

### Frontend
| Item | Status | Notas |
|------|--------|-------|
| Bundle size otimizado | ⬜ | |
| Lazy loading componentes | ⬜ | |
| next/image para imagens | ⬜ | |
| Code splitting | ⬜ | |
| Tree shaking | ⬜ | |
| LCP < 2.5s | ⬜ | |
| FID < 100ms | ⬜ | |
| CLS < 0.1 | ⬜ | |

---

## 🧪 TESTES

### Backend
| Item | Status | Notas |
|------|--------|-------|
| Testes unitários | ⬜ | |
| Testes de integração | ⬜ | |
| Cobertura > 70% | ⬜ | |
| Testes de segurança | ⬜ | |
| Testes de performance | ⬜ | |

### Frontend
| Item | Status | Notas |
|------|--------|-------|
| Testes unitários (Jest) | ⬜ | |
| Testes de componentes | ⬜ | |
| Cobertura > 60% | ⬜ | |
| Testes E2E (Playwright) | ⬜ | |
| Testes de acessibilidade | ⬜ | |

---

## 📦 DEPLOY

### Backend (Railway)
| Item | Status | Notas |
|------|--------|-------|
| Dockerfile funcional | ⬜ | |
| Variáveis de ambiente | ⬜ | |
| Health check | ⬜ | |
| Logs centralizados | ⬜ | |
| Sentry integrado | ⬜ | |
| Backup configurado | ⬜ | |

### Frontend (Vercel)
| Item | Status | Notas |
|------|--------|-------|
| vercel.json configurado | ⬜ | |
| Build sem erros | ⬜ | |
| Variáveis de ambiente | ⬜ | |
| Domínio customizado | ⬜ | |
| Sentry integrado | ⬜ | |

---

## 📄 DOCUMENTAÇÃO

| Item | Status | Notas |
|------|--------|-------|
| README.md principal | ⬜ | |
| Guia de instalação | ⬜ | |
| Documentação API | ⬜ | |
| Guia do admin | ⬜ | |
| Guia do usuário | ⬜ | |
| Guia de deploy | ⬜ | |
| Documentação segurança | ⬜ | |
| CHANGELOG | ⬜ | |

---

## 📝 NOTAS E OBSERVAÇÕES

### Problemas Críticos Encontrados
1. 
2. 
3. 

### Melhorias Sugeridas
1. 
2. 
3. 

### Próximos Passos
1. 
2. 
3. 

---

**Assinatura do Auditor:** _________________________  
**Data:** ___/___/______
