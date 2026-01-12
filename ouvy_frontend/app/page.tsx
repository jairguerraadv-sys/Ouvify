import Link from 'next/link';
import { CheckCircle, Shield, BarChart3, Zap } from 'lucide-react';

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white">
      {/* Header */}
      <header className="border-b border-slate-200 bg-white/80 backdrop-blur-sm fixed w-full top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <span className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent">
                Ouvy
              </span>
            </div>
            <div className="flex items-center gap-4">
              <Link 
                href="/login" 
                className="text-slate-600 hover:text-slate-900 font-medium transition"
              >
                Entrar
              </Link>
              <Link 
                href="/cadastro" 
                className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-medium transition shadow-sm"
              >
                Começar Agora
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="pt-32 pb-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 bg-blue-50 text-blue-700 px-4 py-2 rounded-full text-sm font-medium mb-8">
            <Zap className="w-4 h-4" />
            Implemente seu canal de ética em 5 minutos
          </div>
          <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold text-slate-900 mb-6 leading-tight">
            Seu Canal de Ética e<br />
            <span className="bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent">
              Feedback em 5 minutos
            </span>
          </h1>
          <p className="text-xl text-slate-600 mb-12 max-w-3xl mx-auto leading-relaxed">
            Plataforma SaaS completa para gerenciar denúncias, sugestões e feedbacks anônimos. 
            White Label, seguro e pronto para usar.
          </p>
          <div className="flex gap-4 justify-center flex-col sm:flex-row">
            <Link 
              href="/cadastro" 
              className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-4 rounded-lg font-semibold text-lg transition shadow-lg hover:shadow-xl"
            >
              Criar Conta Grátis
            </Link>
            <Link 
              href="/acompanhar" 
              className="bg-white hover:bg-slate-50 text-slate-900 px-8 py-4 rounded-lg font-semibold text-lg transition border-2 border-slate-200"
            >
              Acompanhar Protocolo
            </Link>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-slate-50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-slate-900 mb-4">
              Por que escolher o Ouvy?
            </h2>
            <p className="text-xl text-slate-600">
              Tudo que você precisa para um canal de ética profissional
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            {/* Feature 1 */}
            <div className="bg-white p-8 rounded-2xl shadow-sm hover:shadow-md transition border border-slate-100">
              <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center mb-6">
                <Shield className="w-6 h-6 text-blue-600" />
              </div>
              <h3 className="text-2xl font-bold text-slate-900 mb-4">
                100% Anônimo
              </h3>
              <p className="text-slate-600 leading-relaxed">
                Sistema de protocolos criptograficamente seguro. Seus colaboradores podem denunciar 
                sem medo, sem cadastro, sem rastreamento.
              </p>
            </div>

            {/* Feature 2 */}
            <div className="bg-white p-8 rounded-2xl shadow-sm hover:shadow-md transition border border-slate-100">
              <div className="w-12 h-12 bg-cyan-100 rounded-xl flex items-center justify-center mb-6">
                <BarChart3 className="w-6 h-6 text-cyan-600" />
              </div>
              <h3 className="text-2xl font-bold text-slate-900 mb-4">
                White Label
              </h3>
              <p className="text-slate-600 leading-relaxed">
                Personalize com sua logo, cores e domínio próprio. Seus clientes nem saberão 
                que é uma plataforma terceirizada.
              </p>
            </div>

            {/* Feature 3 */}
            <div className="bg-white p-8 rounded-2xl shadow-sm hover:shadow-md transition border border-slate-100">
              <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center mb-6">
                <CheckCircle className="w-6 h-6 text-purple-600" />
              </div>
              <h3 className="text-2xl font-bold text-slate-900 mb-4">
                Dashboard de Gestão
              </h3>
              <p className="text-slate-600 leading-relaxed">
                Gerencie todas as denúncias, responda feedbacks e acompanhe métricas em tempo real. 
                Interface intuitiva e poderosa.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-slate-900 mb-4">
              Planos Transparentes
            </h2>
            <p className="text-xl text-slate-600">
              Escolha o plano ideal para o tamanho da sua empresa
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {/* Starter Plan */}
            <div className="bg-white p-8 rounded-2xl shadow-sm border-2 border-slate-200 hover:border-blue-300 transition">
              <div className="mb-6">
                <h3 className="text-2xl font-bold text-slate-900 mb-2">Starter</h3>
                <div className="flex items-baseline gap-2">
                  <span className="text-4xl font-bold text-slate-900">Grátis</span>
                  <span className="text-slate-600">/ 30 dias</span>
                </div>
              </div>
              <ul className="space-y-4 mb-8">
                <li className="flex items-center gap-3">
                  <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0" />
                  <span className="text-slate-700">Até 50 feedbacks/mês</span>
                </li>
                <li className="flex items-center gap-3">
                  <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0" />
                  <span className="text-slate-700">Protocolos anônimos</span>
                </li>
                <li className="flex items-center gap-3">
                  <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0" />
                  <span className="text-slate-700">Dashboard básico</span>
                </li>
                <li className="flex items-center gap-3">
                  <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0" />
                  <span className="text-slate-700">Suporte por email</span>
                </li>
              </ul>
              <Link 
                href="/cadastro" 
                className="block text-center bg-slate-100 hover:bg-slate-200 text-slate-900 py-3 rounded-lg font-semibold transition"
              >
                Começar Teste Grátis
              </Link>
            </div>

            {/* Pro Plan */}
            <div className="bg-gradient-to-br from-blue-600 to-cyan-600 p-8 rounded-2xl shadow-lg relative transform hover:scale-105 transition">
              <div className="absolute top-4 right-4 bg-yellow-400 text-yellow-900 px-3 py-1 rounded-full text-xs font-bold">
                POPULAR
              </div>
              <div className="mb-6">
                <h3 className="text-2xl font-bold text-white mb-2">Pro</h3>
                <div className="flex items-baseline gap-2">
                  <span className="text-4xl font-bold text-white">R$ 197</span>
                  <span className="text-blue-100">/ mês</span>
                </div>
              </div>
              <ul className="space-y-4 mb-8">
                <li className="flex items-center gap-3">
                  <CheckCircle className="w-5 h-5 text-cyan-200 flex-shrink-0" />
                  <span className="text-white">Feedbacks ilimitados</span>
                </li>
                <li className="flex items-center gap-3">
                  <CheckCircle className="w-5 h-5 text-cyan-200 flex-shrink-0" />
                  <span className="text-white">White Label completo</span>
                </li>
                <li className="flex items-center gap-3">
                  <CheckCircle className="w-5 h-5 text-cyan-200 flex-shrink-0" />
                  <span className="text-white">Dashboard avançado</span>
                </li>
                <li className="flex items-center gap-3">
                  <CheckCircle className="w-5 h-5 text-cyan-200 flex-shrink-0" />
                  <span className="text-white">API de integração</span>
                </li>
                <li className="flex items-center gap-3">
                  <CheckCircle className="w-5 h-5 text-cyan-200 flex-shrink-0" />
                  <span className="text-white">Suporte prioritário</span>
                </li>
              </ul>
              <Link 
                href="/cadastro" 
                className="block text-center bg-white hover:bg-blue-50 text-blue-600 py-3 rounded-lg font-semibold transition"
              >
                Assinar Agora
              </Link>
            </div>

            {/* Enterprise Plan */}
            <div className="bg-white p-8 rounded-2xl shadow-sm border-2 border-slate-200 hover:border-purple-300 transition">
              <div className="mb-6">
                <h3 className="text-2xl font-bold text-slate-900 mb-2">Enterprise</h3>
                <div className="flex items-baseline gap-2">
                  <span className="text-4xl font-bold text-slate-900">Custom</span>
                </div>
              </div>
              <ul className="space-y-4 mb-8">
                <li className="flex items-center gap-3">
                  <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0" />
                  <span className="text-slate-700">Tudo do Pro +</span>
                </li>
                <li className="flex items-center gap-3">
                  <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0" />
                  <span className="text-slate-700">Multi-usuários</span>
                </li>
                <li className="flex items-center gap-3">
                  <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0" />
                  <span className="text-slate-700">SSO / LDAP</span>
                </li>
                <li className="flex items-center gap-3">
                  <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0" />
                  <span className="text-slate-700">Consultoria dedicada</span>
                </li>
                <li className="flex items-center gap-3">
                  <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0" />
                  <span className="text-slate-700">SLA garantido</span>
                </li>
              </ul>
              <Link 
                href="/cadastro" 
                className="block text-center bg-slate-900 hover:bg-slate-800 text-white py-3 rounded-lg font-semibold transition"
              >
                Falar com Vendas
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-slate-900 text-slate-400 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row justify-between items-center gap-6">
            <div>
              <span className="text-2xl font-bold text-white">Ouvy</span>
              <p className="text-sm mt-2">Canal de Ética Profissional</p>
            </div>
            <div className="flex gap-8 text-sm">
              <Link href="/acompanhar" className="hover:text-white transition">
                Acompanhar Protocolo
              </Link>
              <Link href="/cadastro" className="hover:text-white transition">
                Criar Conta
              </Link>
              <Link href="/login" className="hover:text-white transition">
                Entrar
              </Link>
            </div>
          </div>
          <div className="border-t border-slate-800 mt-8 pt-8 text-center text-sm">
            <p>© 2026 Ouvy. Todos os direitos reservados.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
