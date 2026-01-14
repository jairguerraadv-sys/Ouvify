'use client';

import { NavBar } from '@/components/ui/navbar';
import { Footer } from '@/components/ui/footer';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

export default function TermosPage() {
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

      <main className="min-h-screen bg-background">
        <div className="container mx-auto px-4 py-16 max-w-4xl">
          <div className="space-y-8">
            {/* Header */}
            <div className="text-center space-y-4">
              <h1 className="text-4xl font-bold text-secondary">
                Termos de Uso
              </h1>
              <p className="text-muted-foreground">
                Última atualização: 14 de janeiro de 2026
              </p>
            </div>

            {/* Conteúdo */}
            <div className="prose prose-lg max-w-none space-y-8">
              {/* Seção 1 */}
              <section className="space-y-4">
                <h2 className="text-2xl font-semibold text-secondary">
                  1. Aceitação dos Termos
                </h2>
                <p className="text-muted-foreground leading-relaxed">
                  Ao acessar e usar a plataforma Ouvy (&quot;Serviço&quot;), você concorda em cumprir e 
                  estar vinculado a estes Termos de Uso. Se você não concordar com qualquer parte 
                  destes termos, não deverá usar nosso Serviço.
                </p>
                <p className="text-muted-foreground leading-relaxed">
                  O Ouvy é uma plataforma SaaS (Software as a Service) que fornece canais de 
                  comunicação para feedback de usuários, incluindo denúncias, reclamações, 
                  sugestões e elogios, com sistema de rastreamento de interações.
                </p>
              </section>

              {/* Seção 2 */}
              <section className="space-y-4">
                <h2 className="text-2xl font-semibold text-secondary">
                  2. Definições
                </h2>
                <ul className="list-disc list-inside space-y-2 text-muted-foreground">
                  <li><strong>Ouvy:</strong> A plataforma e todos os seus serviços</li>
                  <li><strong>Cliente:</strong> Empresa ou organização que contrata o serviço</li>
                  <li><strong>Usuário Final:</strong> Pessoa que envia feedbacks através da plataforma</li>
                  <li><strong>Feedback:</strong> Qualquer comunicação enviada através da plataforma</li>
                  <li><strong>Protocolo:</strong> Código único de rastreamento de cada feedback</li>
                </ul>
              </section>

              {/* Seção 3 */}
              <section className="space-y-4">
                <h2 className="text-2xl font-semibold text-secondary">
                  3. Cadastro e Conta
                </h2>
                <p className="text-muted-foreground leading-relaxed">
                  Para usar o Ouvy como Cliente, você deve criar uma conta fornecendo informações 
                  precisas e completas. Você é responsável por:
                </p>
                <ul className="list-disc list-inside space-y-2 text-muted-foreground">
                  <li>Manter a confidencialidade de suas credenciais de acesso</li>
                  <li>Todas as atividades realizadas em sua conta</li>
                  <li>Notificar-nos imediatamente sobre qualquer uso não autorizado</li>
                  <li>Garantir que as informações da conta estejam sempre atualizadas</li>
                </ul>
              </section>

              {/* Seção 4 */}
              <section className="space-y-4">
                <h2 className="text-2xl font-semibold text-secondary">
                  4. Planos e Pagamentos
                </h2>
                <p className="text-muted-foreground leading-relaxed">
                  O Ouvy oferece diferentes planos de assinatura mensal. Os Clientes concordam em:
                </p>
                <ul className="list-disc list-inside space-y-2 text-muted-foreground">
                  <li>Pagar as taxas de assinatura conforme o plano escolhido</li>
                  <li>Fornecer informações de pagamento válidas e atualizadas</li>
                  <li>Autorizar cobranças recorrentes até o cancelamento do serviço</li>
                  <li>Os pagamentos são processados através do Stripe</li>
                  <li>Reembolsos serão avaliados caso a caso, conforme nossa política</li>
                </ul>
              </section>

              {/* Seção 5 */}
              <section className="space-y-4">
                <h2 className="text-2xl font-semibold text-secondary">
                  5. Uso Aceitável
                </h2>
                <p className="text-muted-foreground leading-relaxed">
                  Ao usar o Ouvy, você concorda em NÃO:
                </p>
                <ul className="list-disc list-inside space-y-2 text-muted-foreground">
                  <li>Violar qualquer lei ou regulamento aplicável</li>
                  <li>Enviar conteúdo ilegal, difamatório, obsceno ou prejudicial</li>
                  <li>Tentar hackear, interromper ou sobrecarregar o sistema</li>
                  <li>Usar o serviço para spam ou comunicações não solicitadas</li>
                  <li>Compartilhar sua conta com terceiros não autorizados</li>
                  <li>Fazer engenharia reversa ou copiar a plataforma</li>
                </ul>
              </section>

              {/* Seção 6 */}
              <section className="space-y-4">
                <h2 className="text-2xl font-semibold text-secondary">
                  6. Propriedade Intelectual
                </h2>
                <p className="text-muted-foreground leading-relaxed">
                  O Ouvy e todo o seu conteúdo (código, design, marca, logo) são propriedade 
                  exclusiva da empresa e protegidos por leis de propriedade intelectual.
                </p>
                <p className="text-muted-foreground leading-relaxed">
                  Os Clientes mantêm todos os direitos sobre os feedbacks e dados coletados 
                  através da plataforma. O Ouvy não reivindica propriedade sobre o conteúdo 
                  dos Clientes.
                </p>
              </section>

              {/* Seção 7 */}
              <section className="space-y-4">
                <h2 className="text-2xl font-semibold text-secondary">
                  7. Privacidade e Proteção de Dados
                </h2>
                <p className="text-muted-foreground leading-relaxed">
                  A coleta e uso de dados pessoais são regidos por nossa{' '}
                  <Link href="/privacidade" className="text-primary hover:underline font-semibold">
                    Política de Privacidade
                  </Link>
                  . Ao usar o Ouvy, você concorda com essas práticas.
                </p>
                <p className="text-muted-foreground leading-relaxed">
                  Estamos em conformidade com a LGPD (Lei Geral de Proteção de Dados) e GDPR 
                  (General Data Protection Regulation).
                </p>
              </section>

              {/* Seção 8 */}
              <section className="space-y-4">
                <h2 className="text-2xl font-semibold text-secondary">
                  8. Cancelamento e Suspensão
                </h2>
                <p className="text-muted-foreground leading-relaxed">
                  Você pode cancelar sua assinatura a qualquer momento através do painel de 
                  configurações. O cancelamento terá efeito no final do período de cobrança atual.
                </p>
                <p className="text-muted-foreground leading-relaxed">
                  Reservamo-nos o direito de suspender ou encerrar contas que violem estes 
                  Termos de Uso, sem aviso prévio e sem reembolso.
                </p>
              </section>

              {/* Seção 9 */}
              <section className="space-y-4">
                <h2 className="text-2xl font-semibold text-secondary">
                  9. Limitação de Responsabilidade
                </h2>
                <p className="text-muted-foreground leading-relaxed">
                  O Ouvy é fornecido &quot;como está&quot;, sem garantias de qualquer tipo. Não 
                  garantimos que o serviço será ininterrupto, seguro ou livre de erros.
                </p>
                <p className="text-muted-foreground leading-relaxed">
                  Em nenhuma circunstância seremos responsáveis por danos indiretos, incidentais, 
                  especiais ou consequenciais resultantes do uso ou impossibilidade de uso do serviço.
                </p>
              </section>

              {/* Seção 10 */}
              <section className="space-y-4">
                <h2 className="text-2xl font-semibold text-secondary">
                  10. Alterações nos Termos
                </h2>
                <p className="text-muted-foreground leading-relaxed">
                  Reservamo-nos o direito de modificar estes Termos de Uso a qualquer momento. 
                  Notificaremos os Clientes sobre mudanças significativas por email ou através 
                  da plataforma.
                </p>
                <p className="text-muted-foreground leading-relaxed">
                  O uso continuado do serviço após as alterações constitui aceitação dos novos termos.
                </p>
              </section>

              {/* Seção 11 */}
              <section className="space-y-4">
                <h2 className="text-2xl font-semibold text-secondary">
                  11. Lei Aplicável
                </h2>
                <p className="text-muted-foreground leading-relaxed">
                  Estes Termos de Uso são regidos pelas leis do Brasil. Qualquer disputa será 
                  resolvida nos tribunais competentes do Brasil.
                </p>
              </section>

              {/* Seção 12 */}
              <section className="space-y-4">
                <h2 className="text-2xl font-semibold text-secondary">
                  12. Contato
                </h2>
                <p className="text-muted-foreground leading-relaxed">
                  Para dúvidas sobre estes Termos de Uso, entre em contato conosco:
                </p>
                <div className="bg-secondary/5 rounded-lg p-4 space-y-2">
                  <p className="text-muted-foreground">
                    <strong>Email:</strong>{' '}
                    <a href="mailto:legal@ouvy.com" className="text-primary hover:underline">
                      legal@ouvy.com
                    </a>
                  </p>
                  <p className="text-muted-foreground">
                    <strong>Suporte:</strong>{' '}
                    <a href="mailto:support@ouvy.com" className="text-primary hover:underline">
                      support@ouvy.com
                    </a>
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
              <Link href="/privacidade">
                <Button variant="ghost">
                  Ver Política de Privacidade
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
