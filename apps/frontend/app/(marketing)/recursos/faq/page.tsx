'use client';

import Link from 'next/link';
import { useState } from 'react';

const faqs = [
  {
    category: 'Geral',
    questions: [
      {
        q: 'Como funciona o período de teste gratuito?',
        a: 'Você tem 14 dias para testar todas as funcionalidades da plataforma sem compromisso. Não é necessário cadastrar cartão de crédito. Ao final do período, você pode escolher um plano ou continuar com o plano gratuito limitado.',
      },
      {
        q: 'Posso cancelar a qualquer momento?',
        a: 'Sim! Você pode cancelar sua assinatura a qualquer momento através do painel de configurações. Não cobramos multas ou taxas de cancelamento. Seus dados permanecem disponíveis por 30 dias após o cancelamento.',
      },
      {
        q: 'Quais formas de pagamento vocês aceitam?',
        a: 'Aceitamos cartões de crédito (Visa, Mastercard, Amex), boleto bancário e Pix. Para planos anuais, oferecemos 20% de desconto.',
      },
    ],
  },
  {
    category: 'Segurança e Privacidade',
    questions: [
      {
        q: 'Os dados são armazenados em servidores brasileiros?',
        a: 'Sim! Todos os dados são armazenados em datacenters certificados na região de São Paulo, garantindo conformidade total com a LGPD e menor latência para usuários brasileiros.',
      },
      {
        q: 'Como vocês protegem meus dados?',
        a: 'Utilizamos criptografia SSL/TLS em todas as comunicações, backups diários automáticos, autenticação de dois fatores e somos 100% conformes com LGPD e GDPR. Realizamos auditorias de segurança semestrais.',
      },
      {
        q: 'Vocês compartilham dados com terceiros?',
        a: 'Não! Nunca vendemos ou compartilhamos seus dados pessoais com terceiros para fins de marketing. Seus dados são seus e permanecem privados.',
      },
    ],
  },
  {
    category: 'Planos e Limites',
    questions: [
      {
        q: 'Existe limite de feedbacks que posso coletar?',
        a: 'O plano Starter permite até 100 feedbacks/mês. O plano Professional até 1.000/mês e o Enterprise é ilimitado. Você pode atualizar seu plano a qualquer momento.',
      },
      {
        q: 'O que acontece se eu exceder meu limite?',
        a: 'Você receberá um aviso quando atingir 80% do limite. Se exceder, ofereceremos upgrade automático ou os feedbacks adicionais serão cobrados separadamente (R$ 0,50 por feedback extra).',
      },
      {
        q: 'Posso trocar de plano depois?',
        a: 'Sim! Você pode fazer upgrade ou downgrade a qualquer momento. No caso de upgrade, você paga a diferença proporcional. No downgrade, o crédito é aplicado no próximo mês.',
      },
    ],
  },
  {
    category: 'Suporte e Integração',
    questions: [
      {
        q: 'Vocês oferecem suporte técnico?',
        a: 'Sim! Oferecemos suporte via chat, email e telefone em horário comercial (9h às 18h, dias úteis). Planos Enterprise têm acesso a suporte prioritário 24/7.',
      },
      {
        q: 'Como funciona a integração com outras ferramentas?',
        a: 'Oferecemos integrações nativas com Slack, Discord, Trello, Jira, Notion e mais. Também disponibilizamos uma API REST completa para integrações customizadas e webhooks para automações.',
      },
      {
        q: 'Preciso saber programar para usar a plataforma?',
        a: 'Não! A interface é totalmente visual e intuitiva. Você pode criar formulários, coletar feedback e gerar relatórios sem escrever uma linha de código. A API é opcional para casos avançados.',
      },
    ],
  },
];

export default function FAQPage() {
  const [openItems, setOpenItems] = useState<string[]>([]);

  const toggleItem = (id: string) => {
    setOpenItems(prev => 
      prev.includes(id) 
        ? prev.filter(item => item !== id)
        : [...prev, id]
    );
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Breadcrumb */}
      <div className="bg-white border-b">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <nav className="text-sm">
            <Link href="/" className="text-blue-600 hover:underline">Início</Link>
            <span className="mx-2 text-gray-400">/</span>
            <Link href="/recursos" className="text-blue-600 hover:underline">Recursos</Link>
            <span className="mx-2 text-gray-400">/</span>
            <span className="text-gray-600">FAQ</span>
          </nav>
        </div>
      </div>

      {/* Hero */}
      <section className="bg-gradient-to-br from-green-600 to-green-800 text-white py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-4 mb-6">
            <span className="text-6xl">❓</span>
            <h1 className="text-5xl font-bold">Perguntas Frequentes</h1>
          </div>
          <p className="text-xl text-green-100">
            Encontre respostas para as dúvidas mais comuns sobre a plataforma Ouvy.
          </p>
        </div>
      </section>

      {/* Busca */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 -mt-8">
        <div className="relative">
          <input
            type="text"
            placeholder="Buscar pergunta..."
            className="w-full px-6 py-4 rounded-xl border-2 border-gray-300 focus:border-green-500 focus:outline-none text-lg shadow-lg"
          />
          <span className="absolute right-6 top-1/2 -translate-y-1/2 text-2xl">🔍</span>
        </div>
      </div>

      {/* FAQs */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        
        {faqs.map((section) => (
          <section key={section.category} className="mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-6">{section.category}</h2>
            
            <div className="space-y-4">
              {section.questions.map((faq, index) => {
                const itemId = `${section.category}-${index}`;
                const isOpen = openItems.includes(itemId);
                
                return (
                  <div
                    key={index}
                    className="bg-white border border-gray-200 rounded-xl overflow-hidden hover:shadow-md transition"
                  >
                    <button
                      onClick={() => toggleItem(itemId)}
                      className="w-full p-6 text-left flex items-center justify-between"
                    >
                      <span className="font-semibold text-lg text-gray-900 pr-4">{faq.q}</span>
                      <span className={`text-green-600 transition-transform flex-shrink-0 ${isOpen ? 'rotate-180' : ''}`}>
                        ▼
                      </span>
                    </button>
                    {isOpen && (
                      <div className="px-6 pb-6">
                        <p className="text-gray-700 leading-relaxed">
                          {faq.a}
                        </p>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </section>
        ))}

        {/* CTA Contato */}
        <div className="bg-green-50 border border-green-200 rounded-xl p-8 text-center mt-12">
          <h3 className="text-2xl font-bold text-gray-900 mb-4">
            Não encontrou a resposta que procurava?
          </h3>
          <p className="text-gray-700 mb-6">
            Nossa equipe está pronta para ajudar você com qualquer dúvida.
          </p>
          <div className="flex flex-wrap gap-4 justify-center">
            <Link
              href="/contato"
              className="bg-green-600 text-white px-8 py-3 rounded-lg font-medium hover:bg-green-700 transition"
            >
              Entrar em Contato
            </Link>
            <Link
              href="/recursos"
              className="bg-white text-green-600 px-8 py-3 rounded-lg font-medium border-2 border-green-600 hover:bg-green-50 transition"
            >
              ← Voltar para Recursos
            </Link>
          </div>
        </div>

      </div>
    </div>
  );
}
