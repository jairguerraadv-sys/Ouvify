'use client';

import { NavBar } from '@/components/ui/navbar';
import { Footer } from '@/components/ui/footer';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { Shield, Eye, Lock, Database, UserCheck, FileText } from 'lucide-react';

export default function PrivacidadePage() {
  const navLinks = [
    { label: 'Início', href: '/' },
    { label: 'Recursos', href: '/recursos' },
    { label: 'Preços', href: '/precos' },
  ];

  return (
    <>
      <NavBar
        links={navLinks}
        rightContent={
          <div className="flex gap-3">
            <Link href="/login">
              <Button variant="ghost">Entrar</Button>
            </Link>
            <Link href="/cadastro">
              <Button variant="default">Começar Grátis</Button>
            </Link>
          </div>
        }
      />

      <main className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5 relative overflow-hidden">
        {/* Decorative elements */}
        <div className="absolute top-20 left-1/4 w-96 h-96 bg-primary/10 rounded-full blur-3xl opacity-50" />
        <div className="absolute bottom-20 right-1/4 w-96 h-96 bg-secondary/10 rounded-full blur-3xl opacity-30" />
        
        <div className="container mx-auto px-4 py-16 max-w-4xl relative z-10">
          <div className="space-y-8">
            {/* Header */}
            <div className="text-center space-y-4 bg-white rounded-2xl p-8 shadow-lg border border-border">
              <div className="flex justify-center mb-4">
                <div className="rounded-full bg-primary/10 p-4">
                  <Shield className="w-12 h-12 text-primary" />
                </div>
              </div>
              <h1 className="text-4xl font-bold text-primary">
                Política de Privacidade
              </h1>
              <p className="text-muted-foreground">
                Última atualização: 14 de janeiro de 2026
              </p>
              <p className="text-sm text-muted-foreground max-w-2xl mx-auto">
                No Ouvy, levamos sua privacidade a sério. Esta política descreve como coletamos, 
                usamos, armazenamos e protegemos seus dados pessoais.
              </p>
            </div>

            {/* Resumo Visual */}
            <div className="grid md:grid-cols-3 gap-4 my-8">
              <div className="bg-primary/5 border border-primary/20 rounded-xl p-4 text-center space-y-2">
                <Lock className="w-8 h-8 text-primary mx-auto" />
                <h3 className="font-semibold text-secondary">Dados Criptografados</h3>
                <p className="text-xs text-muted-foreground">SSL/TLS em todas as conexões</p>
              </div>
              <div className="bg-success/5 border border-success/20 rounded-xl p-4 text-center space-y-2">
                <UserCheck className="w-8 h-8 text-success mx-auto" />
                <h3 className="font-semibold text-secondary">LGPD Compliant</h3>
                <p className="text-xs text-muted-foreground">Conformidade total com a lei</p>
              </div>
              <div className="bg-secondary/5 border border-secondary/20 rounded-xl p-4 text-center space-y-2">
                <Eye className="w-8 h-8 text-secondary mx-auto" />
                <h3 className="font-semibold text-secondary">Transparência</h3>
                <p className="text-xs text-muted-foreground">Você controla seus dados</p>
              </div>
            </div>

            {/* Conteúdo */}
            <div className="prose prose-lg max-w-none space-y-6 bg-white rounded-2xl p-8 shadow-lg border border-border">
              {/* Seção 1 */}
              <section className="space-y-4">
                <h2 className="text-2xl font-semibold text-secondary flex items-center gap-2">
                  <Database className="w-6 h-6" />
                  1. Dados que Coletamos
                </h2>
                
                <h3 className="text-xl font-semibold text-secondary mt-4">1.1 Clientes (Empresas)</h3>
                <p className="text-muted-foreground leading-relaxed">
                  Ao criar uma conta como Cliente, coletamos:
                </p>
                <ul className="list-disc list-inside space-y-2 text-muted-foreground">
                  <li><strong>Dados de cadastro:</strong> Nome, email, nome da empresa, subdomínio</li>
                  <li><strong>Dados de pagamento:</strong> Processados pelo Stripe (não armazenamos cartões)</li>
                  <li><strong>Dados de uso:</strong> Logs de acesso, features utilizadas, métricas</li>
                  <li><strong>Dados técnicos:</strong> IP, navegador, dispositivo, localização aproximada</li>
                </ul>

                <h3 className="text-xl font-semibold text-secondary mt-4">1.2 Usuários Finais (Enviadores de Feedback)</h3>
                <p className="text-muted-foreground leading-relaxed">
                  Ao enviar um feedback, coletamos:
                </p>
                <ul className="list-disc list-inside space-y-2 text-muted-foreground">
                  <li><strong>Conteúdo do feedback:</strong> Mensagem, tipo (denúncia/sugestão/elogio)</li>
                  <li><strong>Dados opcionais:</strong> Nome, email, telefone (se fornecidos)</li>
                  <li><strong>Anexos:</strong> Arquivos enviados junto ao feedback</li>
                  <li><strong>Protocolo:</strong> Código único de rastreamento</li>
                  <li><strong>Metadata:</strong> Data/hora do envio, IP (para segurança)</li>
                </ul>
              </section>

              {/* Seção 2 */}
              <section className="space-y-4">
                <h2 className="text-2xl font-semibold text-secondary flex items-center gap-2">
                  <Eye className="w-6 h-6" />
                  2. Como Usamos seus Dados
                </h2>
                <p className="text-muted-foreground leading-relaxed">
                  Utilizamos os dados coletados para:
                </p>
                <ul className="list-disc list-inside space-y-2 text-muted-foreground">
                  <li><strong>Fornecer o serviço:</strong> Processar feedbacks, gerar protocolos, enviar notificações</li>
                  <li><strong>Gerenciar sua conta:</strong> Autenticação, configurações, preferências</li>
                  <li><strong>Processar pagamentos:</strong> Cobranças, faturas, gerenciamento de assinaturas</li>
                  <li><strong>Melhorar o produto:</strong> Analytics, testes A/B, identificação de bugs</li>
                  <li><strong>Comunicação:</strong> Emails transacionais, suporte, atualizações importantes</li>
                  <li><strong>Segurança:</strong> Detecção de fraudes, prevenção de abusos</li>
                  <li><strong>Conformidade legal:</strong> Cumprimento de obrigações legais</li>
                </ul>
              </section>

              {/* Seção 3 */}
              <section className="space-y-4">
                <h2 className="text-2xl font-semibold text-secondary flex items-center gap-2">
                  <Lock className="w-6 h-6" />
                  3. Como Protegemos seus Dados
                </h2>
                <p className="text-muted-foreground leading-relaxed">
                  Implementamos medidas técnicas e organizacionais para proteger seus dados:
                </p>
                <div className="bg-secondary/5 rounded-lg p-6 space-y-3">
                  <div className="flex items-start gap-3">
                    <div className="w-2 h-2 bg-success rounded-full mt-2" />
                    <div>
                      <strong className="text-secondary">Criptografia:</strong>
                      <p className="text-sm text-muted-foreground">
                        SSL/TLS para dados em trânsito, criptografia em repouso no banco de dados
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-2 h-2 bg-success rounded-full mt-2" />
                    <div>
                      <strong className="text-secondary">Autenticação:</strong>
                      <p className="text-sm text-muted-foreground">
                        Tokens seguros, hashing de senhas, proteção contra força bruta
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-2 h-2 bg-success rounded-full mt-2" />
                    <div>
                      <strong className="text-secondary">Isolamento:</strong>
                      <p className="text-sm text-muted-foreground">
                        Dados de cada Cliente são isolados (multitenancy seguro)
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-2 h-2 bg-success rounded-full mt-2" />
                    <div>
                      <strong className="text-secondary">Backups:</strong>
                      <p className="text-sm text-muted-foreground">
                        Backups automáticos diários com retenção de 30 dias
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-2 h-2 bg-success rounded-full mt-2" />
                    <div>
                      <strong className="text-secondary">Monitoramento:</strong>
                      <p className="text-sm text-muted-foreground">
                        Logs de acesso, detecção de anomalias, alertas de segurança
                      </p>
                    </div>
                  </div>
                </div>
              </section>

              {/* Seção 4 */}
              <section className="space-y-4">
                <h2 className="text-2xl font-semibold text-secondary">
                  4. Compartilhamento de Dados
                </h2>
                <p className="text-muted-foreground leading-relaxed">
                  <strong>Não vendemos seus dados.</strong> Podemos compartilhar dados apenas com:
                </p>
                <ul className="list-disc list-inside space-y-2 text-muted-foreground">
                  <li><strong>Prestadores de serviço:</strong> Stripe (pagamentos), Railway (hosting), Vercel (frontend)</li>
                  <li><strong>Por exigência legal:</strong> Autoridades competentes, mediante ordem judicial</li>
                  <li><strong>Entre Clientes e usuários:</strong> Feedbacks enviados são visíveis para o Cliente correspondente</li>
                </ul>
              </section>

              {/* Seção 5 */}
              <section className="space-y-4">
                <h2 className="text-2xl font-semibold text-secondary flex items-center gap-2">
                  <UserCheck className="w-6 h-6" />
                  5. Seus Direitos (LGPD)
                </h2>
                <p className="text-muted-foreground leading-relaxed">
                  De acordo com a LGPD, você tem direito a:
                </p>
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="bg-primary/5 rounded-lg p-4">
                    <strong className="text-secondary">✓ Acesso</strong>
                    <p className="text-sm text-muted-foreground mt-1">
                      Solicitar cópia dos seus dados
                    </p>
                  </div>
                  <div className="bg-primary/5 rounded-lg p-4">
                    <strong className="text-secondary">✓ Correção</strong>
                    <p className="text-sm text-muted-foreground mt-1">
                      Atualizar dados incorretos
                    </p>
                  </div>
                  <div className="bg-primary/5 rounded-lg p-4">
                    <strong className="text-secondary">✓ Exclusão</strong>
                    <p className="text-sm text-muted-foreground mt-1">
                      Deletar sua conta e dados
                    </p>
                  </div>
                  <div className="bg-primary/5 rounded-lg p-4">
                    <strong className="text-secondary">✓ Portabilidade</strong>
                    <p className="text-sm text-muted-foreground mt-1">
                      Exportar dados em formato legível
                    </p>
                  </div>
                  <div className="bg-primary/5 rounded-lg p-4">
                    <strong className="text-secondary">✓ Revogação</strong>
                    <p className="text-sm text-muted-foreground mt-1">
                      Retirar consentimento a qualquer momento
                    </p>
                  </div>
                  <div className="bg-primary/5 rounded-lg p-4">
                    <strong className="text-secondary">✓ Informação</strong>
                    <p className="text-sm text-muted-foreground mt-1">
                      Saber quem acessa seus dados
                    </p>
                  </div>
                </div>
                <p className="text-muted-foreground leading-relaxed mt-4">
                  Para exercer seus direitos, entre em contato: <strong>privacidade@ouvy.com</strong>
                </p>
              </section>

              {/* Seção 6 */}
              <section className="space-y-4">
                <h2 className="text-2xl font-semibold text-secondary">
                  6. Cookies e Tecnologias Similares
                </h2>
                <p className="text-muted-foreground leading-relaxed">
                  Utilizamos cookies essenciais para:
                </p>
                <ul className="list-disc list-inside space-y-2 text-muted-foreground">
                  <li>Manter você autenticado durante a sessão</li>
                  <li>Lembrar suas preferências (ex: modo escuro)</li>
                  <li>Analisar o uso da plataforma (analytics anônimos)</li>
                </ul>
                <p className="text-muted-foreground leading-relaxed">
                  Você pode desabilitar cookies no seu navegador, mas isso pode afetar a funcionalidade.
                </p>
              </section>

              {/* Seção 7 */}
              <section className="space-y-4">
                <h2 className="text-2xl font-semibold text-secondary">
                  7. Retenção de Dados
                </h2>
                <p className="text-muted-foreground leading-relaxed">
                  Mantemos seus dados pelo tempo necessário para fornecer o serviço:
                </p>
                <ul className="list-disc list-inside space-y-2 text-muted-foreground">
                  <li><strong>Conta ativa:</strong> Enquanto sua assinatura estiver ativa</li>
                  <li><strong>Conta cancelada:</strong> 90 dias após cancelamento (para possível reativação)</li>
                  <li><strong>Dados financeiros:</strong> 5 anos (exigência legal contábil)</li>
                  <li><strong>Logs de segurança:</strong> 6 meses</li>
                </ul>
              </section>

              {/* Seção 8 */}
              <section className="space-y-4">
                <h2 className="text-2xl font-semibold text-secondary">
                  8. Transferência Internacional
                </h2>
                <p className="text-muted-foreground leading-relaxed">
                  Nossos servidores estão localizados em provedores certificados. Alguns prestadores 
                  de serviço (como Stripe) podem processar dados fora do Brasil, sempre com 
                  garantias adequadas de proteção.
                </p>
              </section>

              {/* Seção 9 */}
              <section className="space-y-4">
                <h2 className="text-2xl font-semibold text-secondary">
                  9. Menores de Idade
                </h2>
                <p className="text-muted-foreground leading-relaxed">
                  O Ouvy não coleta intencionalmente dados de menores de 18 anos. Se identificarmos 
                  dados de menores, tomaremos medidas para deletá-los.
                </p>
              </section>

              {/* Seção 10 */}
              <section className="space-y-4">
                <h2 className="text-2xl font-semibold text-secondary">
                  10. Alterações nesta Política
                </h2>
                <p className="text-muted-foreground leading-relaxed">
                  Podemos atualizar esta Política periodicamente. Notificaremos mudanças significativas 
                  por email ou através da plataforma. A data da última atualização está sempre visível 
                  no topo desta página.
                </p>
              </section>

              {/* Seção 11 */}
              <section className="space-y-4">
                <h2 className="text-2xl font-semibold text-secondary flex items-center gap-2">
                  <FileText className="w-6 h-6" />
                  11. Contato - Encarregado de Dados (DPO)
                </h2>
                <p className="text-muted-foreground leading-relaxed">
                  Para questões sobre privacidade e proteção de dados:
                </p>
                <div className="bg-secondary/5 rounded-lg p-6 space-y-3">
                  <p className="text-muted-foreground">
                    <strong>Email do DPO:</strong>{' '}
                    <a href="mailto:privacidade@ouvy.com" className="text-primary hover:underline">
                      privacidade@ouvy.com
                    </a>
                  </p>
                  <p className="text-muted-foreground">
                    <strong>Suporte Geral:</strong>{' '}
                    <a href="mailto:support@ouvy.com" className="text-primary hover:underline">
                      support@ouvy.com
                    </a>
                  </p>
                  <p className="text-sm text-muted-foreground mt-4">
                    Responderemos suas solicitações em até 15 dias úteis, conforme a LGPD.
                  </p>
                </div>
              </section>
            </div>

            {/* Footer Actions */}
            <div className="flex flex-col sm:flex-row gap-4 items-center justify-center pt-8 border-t">
              <Link href="/cadastro">
                <Button variant="default">
                  Aceitar e Começar
                </Button>
              </Link>
              <Link href="/termos">
                <Button variant="ghost">
                  Ver Termos de Uso
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </>
  );
}
