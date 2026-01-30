import Link from 'next/link';

export const metadata = {
  title: 'LGPD - Seus Direitos | Ouvify',
  description: 'Conheça seus direitos sob a LGPD e como exercê-los na plataforma Ouvify',
};

export default function LGPDPage() {
  const direitos = [
    {
      icon: '📋',
      title: 'Acesso',
      description: 'Solicitar cópia completa de todos os seus dados pessoais',
      action: 'Solicitar meus dados',
    },
    {
      icon: '✏️',
      title: 'Correção',
      description: 'Corrigir dados incompletos, inexatos ou desatualizados',
      action: 'Corrigir dados',
    },
    {
      icon: '🗑️',
      title: 'Exclusão',
      description: 'Solicitar a exclusão permanente dos seus dados',
      action: 'Excluir dados',
    },
    {
      icon: '📤',
      title: 'Portabilidade',
      description: 'Exportar seus dados em formato estruturado (JSON/CSV)',
      action: 'Exportar dados',
    },
    {
      icon: '🚫',
      title: 'Revogação',
      description: 'Revogar consentimento para tratamento de dados',
      action: 'Revogar consentimento',
    },
    {
      icon: 'ℹ️',
      title: 'Informação',
      description: 'Obter informações sobre uso e compartilhamento dos dados',
      action: 'Ver informações',
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero */}
      <section className="bg-white text-gray-900 py-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-4 mb-6">
            <span className="text-6xl">🇧🇷</span>
            <div>
              <h1 className="text-5xl font-bold mb-2">LGPD</h1>
              <p className="text-2xl text-primary-200">Lei Geral de Proteção de Dados</p>
            </div>
          </div>
          <p className="text-xl text-primary-100 mt-6">
            A Ouvify está em total conformidade com a Lei nº 13.709/2018. 
            Conheça e exerça seus direitos como titular de dados.
          </p>
        </div>
      </section>

      {/* Conteúdo */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        
        {/* Seus Direitos */}
        <section className="mb-16">
          <h2 className="text-4xl font-bold text-gray-900 mb-8">Seus Direitos Garantidos por Lei</h2>
          
          <div className="grid md:grid-cols-2 gap-6">
            {direitos.map((direito) => (
              <div key={direito.title} className="bg-white rounded-xl p-6 shadow-md hover:shadow-xl transition">
                <div className="text-4xl mb-4">{direito.icon}</div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">{direito.title}</h3>
                <p className="text-gray-600 mb-4">{direito.description}</p>
                <Link
                  href={`/lgpd/solicitacao?tipo=${direito.title.toLowerCase()}`}
                  className="text-primary-600 font-medium hover:underline"
                >
                  {direito.action} →
                </Link>
              </div>
            ))}
          </div>
        </section>

        {/* Como Exercer */}
        <section className="mb-16">
          <h2 className="text-4xl font-bold text-gray-900 mb-8">Como Exercer Seus Direitos</h2>
          
          <div className="space-y-6">
            <div className="bg-white rounded-xl p-8 border-l-4 border-primary-600">
              <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
                <span>📧</span>
                Por Email
              </h3>
              <p className="text-gray-700 mb-4">
                Envie sua solicitação para nosso email dedicado de privacidade:
              </p>
              <a
                href="mailto:privacidade@ouvy.com"
                className="inline-block bg-primary-600 text-gray-900 px-6 py-3 rounded-lg font-medium hover:bg-primary-700 transition"
              >
                privacidade@ouvy.com
              </a>
              <p className="text-sm text-gray-600 mt-4">
                Tempo de resposta: até 15 dias úteis
              </p>
            </div>

            <div className="bg-white rounded-xl p-8 border-l-4 border-secondary-600">
              <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
                <span>🌐</span>
                Portal de Solicitação
              </h3>
              <p className="text-gray-700 mb-4">
                Use nosso portal online para fazer solicitações de forma rápida e segura:
              </p>
              <Link
                href="/lgpd/solicitacao"
                className="inline-block bg-secondary-600 text-gray-900 px-6 py-3 rounded-lg font-medium hover:bg-secondary-700 transition"
              >
                Acessar Portal LGPD
              </Link>
              <p className="text-sm text-gray-600 mt-4">
                Requer login na sua conta
              </p>
            </div>

            <div className="bg-white rounded-xl p-8 border-l-4 border-green-600">
              <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
                <span>⚙️</span>
                Painel de Configurações
              </h3>
              <p className="text-gray-700 mb-4">
                Gerencie suas preferências de privacidade diretamente no painel:
              </p>
              <Link
                href="/settings/privacy"
                className="inline-block bg-green-600 text-gray-900 px-6 py-3 rounded-lg font-medium hover:bg-green-700 transition"
              >
                Ir para Configurações
              </Link>
              <p className="text-sm text-gray-600 mt-4">
                Alterações aplicadas imediatamente
              </p>
            </div>
          </div>
        </section>

        {/* DPO */}
        <section className="mb-16">
          <h2 className="text-4xl font-bold text-gray-900 mb-8">Encarregado de Dados (DPO)</h2>
          
          <div className="bg-white rounded-xl p-8 shadow-lg border border-gray-200">
            <p className="text-lg text-gray-700 mb-6">
              Nosso Encarregado de Proteção de Dados (Data Protection Officer) está 
              disponível para esclarecer dúvidas sobre o tratamento de dados pessoais:
            </p>
            
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <div className="text-sm text-gray-500 mb-1">Email do DPO</div>
                <a href="mailto:dpo@ouvy.com" className="text-xl font-semibold text-primary-600 hover:underline">
                  dpo@ouvy.com
                </a>
              </div>
              <div>
                <div className="text-sm text-gray-500 mb-1">Tempo de Resposta</div>
                <div className="text-xl font-semibold text-gray-900">
                  Até 15 dias úteis
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Informações Importantes */}
        <section className="mb-16">
          <h2 className="text-4xl font-bold text-gray-900 mb-8">Informações Importantes</h2>
          
          <div className="space-y-4">
            <details className="bg-white rounded-xl p-6 border border-gray-200 hover:shadow-md transition group">
              <summary className="font-semibold text-lg cursor-pointer list-none flex items-center justify-between">
                <span>Onde meus dados são armazenados?</span>
                <span className="text-primary-600 group-open:rotate-180 transition-transform">▼</span>
              </summary>
              <p className="mt-4 text-gray-700">
                Todos os dados são armazenados em <strong>datacenters certificados na 
                região de São Paulo, Brasil</strong>, garantindo conformidade com a LGPD 
                e jurisdição brasileira para questões legais.
              </p>
            </details>

            <details className="bg-white rounded-xl p-6 border border-gray-200 hover:shadow-md transition group">
              <summary className="font-semibold text-lg cursor-pointer list-none flex items-center justify-between">
                <span>Por quanto tempo meus dados são mantidos?</span>
                <span className="text-primary-600 group-open:rotate-180 transition-transform">▼</span>
              </summary>
              <p className="mt-4 text-gray-700">
                Mantemos seus dados durante a vigência do contrato e por até <strong>5 anos 
                após o cancelamento</strong> para cumprimento de obrigações legais. Após esse 
                período, os dados são permanentemente excluídos ou anonimizados.
              </p>
            </details>

            <details className="bg-white rounded-xl p-6 border border-gray-200 hover:shadow-md transition group">
              <summary className="font-semibold text-lg cursor-pointer list-none flex items-center justify-between">
                <span>Vocês compartilham dados com terceiros?</span>
                <span className="text-primary-600 group-open:rotate-180 transition-transform">▼</span>
              </summary>
              <p className="mt-4 text-gray-700">
                <strong>Não vendemos ou compartilhamos seus dados pessoais com terceiros para 
                fins de marketing.</strong> Compartilhamos apenas quando necessário para 
                prestação do serviço (ex: processador de pagamentos) ou por obrigação legal.
              </p>
            </details>

            <details className="bg-white rounded-xl p-6 border border-gray-200 hover:shadow-md transition group">
              <summary className="font-semibold text-lg cursor-pointer list-none flex items-center justify-between">
                <span>Como vocês protegem meus dados?</span>
                <span className="text-primary-600 group-open:rotate-180 transition-transform">▼</span>
              </summary>
              <p className="mt-4 text-gray-700">
                Utilizamos criptografia SSL/TLS, backups diários, autenticação de dois fatores, 
                monitoramento 24/7 e realizamos auditorias de segurança semestrais. Veja mais 
                detalhes em <Link href="/recursos/seguranca" className="text-primary-600 hover:underline">Segurança de Dados</Link>.
              </p>
            </details>
          </div>
        </section>

        {/* CTA */}
        <div className="bg-white text-gray-900 rounded-xl p-8 text-center">
          <h3 className="text-3xl font-bold mb-4">Exercer Seus Direitos é Simples</h3>
          <p className="text-xl text-primary-100 mb-8">
            Respondemos todas as solicitações em até 15 dias úteis, conforme previsto na LGPD.
          </p>
          <div className="flex flex-wrap gap-4 justify-center">
            <Link
              href="/lgpd/solicitacao"
              className="bg-white text-primary-600 px-8 py-4 rounded-lg font-bold hover:bg-primary-50 transition text-lg"
            >
              Fazer Solicitação LGPD
            </Link>
            <Link
              href="/privacidade"
              className="bg-transparent border-2 border-white text-gray-900 px-8 py-4 rounded-lg font-bold hover:bg-white hover:text-primary-600 transition text-lg"
            >
              Ler Política Completa
            </Link>
          </div>
        </div>

      </div>
    </div>
  );
}
