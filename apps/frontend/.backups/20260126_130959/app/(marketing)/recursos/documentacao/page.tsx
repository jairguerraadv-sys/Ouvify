import Link from 'next/link';

export const metadata = {
  title: 'Documentação | Recursos | Ouvy',
  description: 'Guias, tutoriais e referência da API da plataforma Ouvy',
};

export default function DocumentacaoPage() {
  const guias = [
    {
      category: 'Início Rápido',
      items: [
        { title: 'Criar sua primeira conta', time: '5 min', href: '/docs/criar-conta' },
        { title: 'Configurar seu primeiro formulário', time: '10 min', href: '/docs/primeiro-formulario' },
        { title: 'Coletar seu primeiro feedback', time: '3 min', href: '/docs/primeiro-feedback' },
      ],
    },
    {
      category: 'Guias Avançados',
      items: [
        { title: 'Integrações com Slack e Discord', time: '15 min', href: '/docs/integracoes' },
        { title: 'Webhooks e Automações', time: '20 min', href: '/docs/webhooks' },
        { title: 'API REST - Referência Completa', time: '30 min', href: '/docs/api' },
      ],
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Breadcrumb */}
      <div className="bg-white border-b">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <nav className="text-sm">
            <Link href="/" className="text-primary-600 hover:underline">Início</Link>
            <span className="mx-2 text-gray-400">/</span>
            <Link href="/recursos" className="text-primary-600 hover:underline">Recursos</Link>
            <span className="mx-2 text-gray-400">/</span>
            <span className="text-gray-600">Documentação</span>
          </nav>
        </div>
      </div>

      {/* Hero */}
      <section className="bg-gradient-to-br from-purple-600 to-purple-800 text-white py-16">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-4 mb-6">
            <span className="text-6xl">📚</span>
            <h1 className="text-5xl font-bold">Documentação Completa</h1>
          </div>
          <p className="text-xl text-purple-100">
            Guias detalhados, tutoriais e referências para aproveitar ao máximo a plataforma.
          </p>
        </div>
      </section>

      {/* Conteúdo */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        
        {/* Busca */}
        <div className="mb-12">
          <div className="relative max-w-2xl mx-auto">
            <input
              type="text"
              placeholder="Buscar na documentação..."
              className="w-full px-6 py-4 rounded-xl border-2 border-gray-300 focus:border-purple-500 focus:outline-none text-lg"
            />
            <span className="absolute right-6 top-1/2 -translate-y-1/2 text-2xl">🔍</span>
          </div>
        </div>

        {/* Guias Principais */}
        {guias.map((section) => (
          <section key={section.category} className="mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-6">{section.category}</h2>
            
            <div className="grid md:grid-cols-3 gap-6">
              {section.items.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className="bg-white rounded-xl p-6 shadow-md hover:shadow-xl transition group"
                >
                  <div className="flex justify-between items-start mb-3">
                    <h3 className="text-lg font-semibold text-gray-900 group-hover:text-purple-600 transition">
                      {item.title}
                    </h3>
                    <span className="text-sm text-gray-500 bg-gray-100 px-3 py-1 rounded-full">
                      {item.time}
                    </span>
                  </div>
                  <span className="text-purple-600 font-medium group-hover:underline">
                    Ler guia →
                  </span>
                </Link>
              ))}
            </div>
          </section>
        ))}

        {/* Vídeo Tutoriais */}
        <section className="mb-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-6">🎥 Vídeo Tutoriais</h2>
          
          <div className="grid md:grid-cols-2 gap-6">
            <div className="bg-white rounded-xl overflow-hidden shadow-md hover:shadow-xl transition">
              <div className="aspect-video bg-gradient-to-br from-purple-400 to-pink-400 flex items-center justify-center">
                <span className="text-6xl">▶️</span>
              </div>
              <div className="p-6">
                <h3 className="text-xl font-semibold mb-2">Tour Completo da Plataforma</h3>
                <p className="text-gray-600 mb-4">Conheça todas as funcionalidades em 10 minutos</p>
                <Link href="/docs/videos/tour" className="text-purple-600 font-medium hover:underline">
                  Assistir agora →
                </Link>
              </div>
            </div>

            <div className="bg-white rounded-xl overflow-hidden shadow-md hover:shadow-xl transition">
              <div className="aspect-video bg-gradient-to-br from-brand-primary-400 to-brand-secondary-400 flex items-center justify-center">
                <span className="text-6xl">▶️</span>
              </div>
              <div className="p-6">
                <h3 className="text-xl font-semibold mb-2">Integrando com sua Aplicação</h3>
                <p className="text-gray-600 mb-4">Aprenda a integrar o Ouvy via API</p>
                <Link href="/docs/videos/integracao" className="text-purple-600 font-medium hover:underline">
                  Assistir agora →
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* API Reference */}
        <section className="mb-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-6">⚙️ Referência da API</h2>
          
          <div className="bg-gradient-to-r from-gray-900 to-gray-800 text-white rounded-xl p-8">
            <h3 className="text-2xl font-bold mb-4">REST API v1.0</h3>
            <p className="text-gray-300 mb-6">
              Documentação técnica completa com exemplos de código em Python, JavaScript, PHP e mais.
            </p>
            
            <div className="grid md:grid-cols-2 gap-4 mb-6">
              <div className="bg-gray-800 rounded-lg p-4">
                <div className="text-sm text-gray-400 mb-1">Base URL</div>
                <code className="text-green-400">https://api.ouvy.com/v1</code>
              </div>
              <div className="bg-gray-800 rounded-lg p-4">
                <div className="text-sm text-gray-400 mb-1">Autenticação</div>
                <code className="text-primary-400">Bearer Token (JWT)</code>
              </div>
            </div>

            <Link
              href="/docs/api"
              className="inline-block bg-purple-600 text-white px-8 py-3 rounded-lg font-medium hover:bg-purple-700 transition"
            >
              Ver Documentação da API →
            </Link>
          </div>
        </section>

        {/* SDKs */}
        <section className="mb-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-6">📦 SDKs Oficiais</h2>
          
          <div className="grid md:grid-cols-4 gap-4">
            {['JavaScript', 'Python', 'PHP', 'Ruby'].map((lang) => (
              <div key={lang} className="bg-white rounded-lg p-6 shadow-md text-center hover:shadow-xl transition">
                <div className="text-3xl mb-3">💻</div>
                <h3 className="font-semibold mb-2">{lang}</h3>
                <Link href={`/docs/sdk/${lang.toLowerCase()}`} className="text-purple-600 text-sm hover:underline">
                  Ver SDK →
                </Link>
              </div>
            ))}
          </div>
        </section>

        {/* CTA */}
        <div className="bg-purple-50 border border-purple-200 rounded-xl p-8 text-center">
          <h3 className="text-2xl font-bold text-gray-900 mb-4">
            Precisa de ajuda personalizada?
          </h3>
          <p className="text-gray-700 mb-6">
            Nossa equipe de suporte está disponível para ajudar você.
          </p>
          <div className="flex flex-wrap gap-4 justify-center">
            <Link
              href="/contato"
              className="bg-purple-600 text-white px-8 py-3 rounded-lg font-medium hover:bg-purple-700 transition"
            >
              Falar com Suporte
            </Link>
            <Link
              href="/recursos"
              className="bg-white text-purple-600 px-8 py-3 rounded-lg font-medium border-2 border-purple-600 hover:bg-purple-50 transition"
            >
              ← Voltar para Recursos
            </Link>
          </div>
        </div>

      </div>
    </div>
  );
}
