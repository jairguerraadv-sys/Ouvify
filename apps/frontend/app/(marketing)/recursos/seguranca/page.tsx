import Link from 'next/link';

export const metadata = {
  title: 'Segurança | Recursos | Ouvy',
  description: 'Conheça as medidas de segurança e proteção de dados da plataforma Ouvy',
};

export default function SegurancaPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Breadcrumb */}
      <div className="bg-white border-b">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <nav className="text-sm">
            <Link href="/" className="text-primary-600 hover:underline">Início</Link>
            <span className="mx-2 text-gray-400">/</span>
            <Link href="/recursos" className="text-primary-600 hover:underline">Recursos</Link>
            <span className="mx-2 text-gray-400">/</span>
            <span className="text-gray-600">Segurança</span>
          </nav>
        </div>
      </div>

      {/* Hero */}
      <section className="bg-gradient-to-br from-primary-600 to-primary-800 text-white py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-4 mb-6">
            <span className="text-6xl">🔒</span>
            <h1 className="text-5xl font-bold">Segurança de Dados</h1>
          </div>
          <p className="text-xl text-primary-100">
            Seus dados e os dados dos seus clientes estão protegidos com as melhores 
            práticas de segurança da indústria.
          </p>
        </div>
      </section>

      {/* Conteúdo */}
      <article className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        
        {/* Introdução */}
        <div className="prose prose-lg max-w-none mb-12">
          <p className="text-xl text-gray-700 leading-relaxed">
            Na Ouvy, levamos a segurança dos dados muito a sério. Implementamos múltiplas 
            camadas de proteção para garantir que suas informações e as de seus clientes 
            estejam sempre seguras.
          </p>
        </div>

        {/* Medidas de Segurança */}
        <section className="mb-16">
          <h2 className="text-3xl font-bold text-gray-900 mb-8">Medidas de Proteção</h2>
          
          <div className="space-y-6">
            {/* Item 1 */}
            <div className="bg-white rounded-xl p-6 shadow-md border-l-4 border-primary-600">
              <div className="flex items-start gap-4">
                <span className="text-4xl">🔐</span>
                <div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">
                    Criptografia SSL/TLS
                  </h3>
                  <p className="text-gray-700 mb-3">
                    Todas as comunicações entre seu navegador e nossos servidores são 
                    criptografadas usando TLS 1.3, o protocolo mais moderno disponível.
                  </p>
                  <ul className="space-y-2 text-gray-600">
                    <li className="flex items-start gap-2">
                      <span className="text-green-500 mt-1">✓</span>
                      <span>Certificado SSL de 256 bits</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-green-500 mt-1">✓</span>
                      <span>Renovação automática e monitoramento 24/7</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-green-500 mt-1">✓</span>
                      <span>Conformidade com PCI DSS para pagamentos</span>
                    </li>
                  </ul>
                </div>
              </div>
            </div>

            {/* Item 2 */}
            <div className="bg-white rounded-xl p-6 shadow-md border-l-4 border-purple-600">
              <div className="flex items-start gap-4">
                <span className="text-4xl">💾</span>
                <div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">
                    Backup Automático
                  </h3>
                  <p className="text-gray-700 mb-3">
                    Realizamos backups diários automáticos de todos os seus dados, com 
                    retenção de 30 dias para recuperação em caso de necessidade.
                  </p>
                  <ul className="space-y-2 text-gray-600">
                    <li className="flex items-start gap-2">
                      <span className="text-green-500 mt-1">✓</span>
                      <span>Backup incremental a cada 6 horas</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-green-500 mt-1">✓</span>
                      <span>Armazenamento em múltiplas regiões geográficas</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-green-500 mt-1">✓</span>
                      <span>Recuperação de desastres em menos de 4 horas</span>
                    </li>
                  </ul>
                </div>
              </div>
            </div>

            {/* Item 3 */}
            <div className="bg-white rounded-xl p-6 shadow-md border-l-4 border-green-600">
              <div className="flex items-start gap-4">
                <span className="text-4xl">🛡️</span>
                <div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">
                    Conformidade LGPD e GDPR
                  </h3>
                  <p className="text-gray-700 mb-3">
                    Estamos em total conformidade com as legislações de proteção de dados 
                    brasileira (LGPD) e europeia (GDPR).
                  </p>
                  <ul className="space-y-2 text-gray-600">
                    <li className="flex items-start gap-2">
                      <span className="text-green-500 mt-1">✓</span>
                      <span>Dados armazenados em servidores no Brasil</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-green-500 mt-1">✓</span>
                      <span>DPO (Encarregado de Dados) dedicado</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-green-500 mt-1">✓</span>
                      <span>Auditoria de segurança semestral</span>
                    </li>
                  </ul>
                </div>
              </div>
            </div>

            {/* Item 4 */}
            <div className="bg-white rounded-xl p-6 shadow-md border-l-4 border-red-600">
              <div className="flex items-start gap-4">
                <span className="text-4xl">🔑</span>
                <div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">
                    Autenticação de Dois Fatores (2FA)
                  </h3>
                  <p className="text-gray-700 mb-3">
                    Proteção adicional para sua conta através de autenticação em duas etapas 
                    via aplicativo ou SMS.
                  </p>
                  <ul className="space-y-2 text-gray-600">
                    <li className="flex items-start gap-2">
                      <span className="text-green-500 mt-1">✓</span>
                      <span>Suporte a Google Authenticator e Authy</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-green-500 mt-1">✓</span>
                      <span>Códigos de recuperação de backup</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-green-500 mt-1">✓</span>
                      <span>Notificação de login suspeito</span>
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Certificações */}
        <section className="mb-16">
          <h2 className="text-3xl font-bold text-gray-900 mb-8">Certificações e Compliance</h2>
          
          <div className="grid md:grid-cols-2 gap-6">
            <div className="bg-gradient-to-br from-primary-50 to-primary-100 rounded-xl p-6 border border-primary-200">
              <h3 className="text-lg font-semibold text-primary-900 mb-3">🇧🇷 LGPD Compliant</h3>
              <p className="text-primary-800">
                100% em conformidade com a Lei Geral de Proteção de Dados Pessoais (Lei nº 13.709/2018).
              </p>
            </div>

            <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl p-6 border border-secondary-200">
              <h3 className="text-lg font-semibold text-secondary-900 mb-3">🇪🇺 GDPR Compliant</h3>
              <p className="text-secondary-800">
                Conformidade com o Regulamento Geral de Proteção de Dados da União Europeia.
              </p>
            </div>

            <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-xl p-6 border border-green-200">
              <h3 className="text-lg font-semibold text-green-900 mb-3">🛡️ ISO 27001 (em processo)</h3>
              <p className="text-green-800">
                Certificação internacional de gestão de segurança da informação em andamento.
              </p>
            </div>

            <div className="bg-gradient-to-br from-red-50 to-red-100 rounded-xl p-6 border border-red-200">
              <h3 className="text-lg font-semibold text-red-900 mb-3">💳 PCI DSS Level 1</h3>
              <p className="text-red-800">
                Conformidade com padrões de segurança da indústria de cartões de pagamento.
              </p>
            </div>
          </div>
        </section>

        {/* Monitoramento */}
        <section className="mb-16">
          <h2 className="text-3xl font-bold text-gray-900 mb-8">Monitoramento 24/7</h2>
          
          <div className="bg-gradient-to-r from-gray-900 to-gray-800 text-white rounded-xl p-8">
            <p className="text-lg mb-6">
              Nossa equipe de segurança monitora continuamente todos os sistemas para 
              detectar e responder a ameaças em tempo real.
            </p>
            
            <div className="grid md:grid-cols-3 gap-6">
              <div>
                <div className="text-3xl font-bold text-green-400 mb-2">99.9%</div>
                <p className="text-gray-300">Uptime garantido</p>
              </div>
              <div>
                <div className="text-3xl font-bold text-primary-400 mb-2">&lt; 15min</div>
                <p className="text-gray-300">Tempo de resposta a incidentes</p>
              </div>
              <div>
                <div className="text-3xl font-bold text-secondary-400 mb-2">24/7</div>
                <p className="text-gray-300">Monitoramento ativo</p>
              </div>
            </div>
          </div>
        </section>

        {/* CTA */}
        <div className="bg-primary-50 border border-primary-200 rounded-xl p-8 text-center">
          <h3 className="text-2xl font-bold text-gray-900 mb-4">
            Quer saber mais sobre nossa segurança?
          </h3>
          <p className="text-gray-700 mb-6">
            Nossa equipe está disponível para responder todas as suas perguntas sobre 
            proteção de dados e compliance.
          </p>
          <div className="flex flex-wrap gap-4 justify-center">
            <Link
              href="/contato"
              className="bg-primary-600 text-white px-8 py-3 rounded-lg font-medium hover:bg-primary-700 transition"
            >
              Falar com Especialista
            </Link>
            <Link
              href="/recursos"
              className="bg-white text-primary-600 px-8 py-3 rounded-lg font-medium border-2 border-primary-600 hover:bg-primary-50 transition"
            >
              ← Voltar para Recursos
            </Link>
          </div>
        </div>

      </article>
    </div>
  );
}
