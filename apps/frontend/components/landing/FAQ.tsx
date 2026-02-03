'use client';

import { useState } from 'react';
import { ChevronDown } from 'lucide-react';

interface FAQItem {
  question: string;
  answer: string;
}

const faqs: FAQItem[] = [
  {
    question: 'Como funciona o período de teste gratuito?',
    answer:
      'Você tem 14 dias completos para testar todas as funcionalidades do plano escolhido, sem precisar cadastrar cartão de crédito. Ao final do período, você decide se quer continuar. Sem pegadinhas!',
  },
  {
    question: 'Posso mudar de plano depois?',
    answer:
      'Sim! Você pode fazer upgrade ou downgrade do seu plano a qualquer momento. As alterações entram em vigor imediatamente e o valor é ajustado proporcionalmente na próxima fatura.',
  },
  {
    question: 'Como funciona o White Label?',
    answer:
      'O White Label permite personalizar a plataforma com seu logo, cores da marca e até mesmo domínio próprio (no plano Professional e Enterprise). Seus usuários verão a plataforma como se fosse totalmente sua.',
  },
  {
    question: 'Os dados estão seguros e são conformes à LGPD?',
    answer:
      'Absolutamente! Usamos criptografia AES-256 em repouso e TLS 1.3 em trânsito. Somos 100% conformes com LGPD e temos certificação ISO 27001. Seus dados ficam em servidores no Brasil e você tem total controle sobre eles.',
  },
  {
    question: 'Posso integrar com outros sistemas?',
    answer:
      'Sim! Oferecemos API REST completa (planos Professional e Enterprise) e webhooks para notificações em tempo real. Integrações comuns incluem: Slack, Teams, sistemas de RH, ERPs e ferramentas de BI.',
  },
  {
    question: 'Qual o SLA de uptime?',
    answer:
      'Garantimos 99.9% de uptime no plano Professional e Enterprise. Nossa infraestrutura é redundante e monitorada 24/7. Histórico de uptime disponível em tempo real no nosso status page.',
  },
  {
    question: 'Como funciona o suporte?',
    answer:
      'Starter: suporte por email com resposta em até 48h. Professional: suporte prioritário por email e chat com resposta em até 4h. Enterprise: suporte 24/7 com gerente de conta dedicado e atendimento por telefone.',
  },
  {
    question: 'Posso cancelar a qualquer momento?',
    answer:
      'Sim, você pode cancelar seu plano a qualquer momento sem multas ou taxas. O acesso permanece ativo até o final do período pago. Você pode exportar todos os seus dados antes de cancelar.',
  },
  {
    question: 'Como funciona o anonimato das denúncias?',
    answer:
      'O denunciante pode escolher se identificar ou permanecer anônimo. Para denúncias anônimas, não coletamos nem armazenamos nenhum dado que possa identificar o autor. Usamos um sistema de protocolo que permite acompanhamento sem comprometer o anonimato.',
  },
  {
    question: 'Há limite de armazenamento?',
    answer:
      'Não! Você pode armazenar quantos feedbacks quiser dentro do limite mensal do seu plano. Feedbacks antigos não são deletados. Arquivos anexados têm limite de 10MB por arquivo no Starter e 50MB no Professional/Enterprise.',
  },
  {
    question: 'Vocês oferecem treinamento?',
    answer:
      'Sim! Todos os planos incluem documentação completa e vídeos tutoriais. O plano Enterprise inclui treinamento personalizado para sua equipe, seja online ou presencial.',
  },
  {
    question: 'E se eu exceder o limite de feedbacks do mês?',
    answer:
      'Você será notificado quando atingir 80% do limite. Ao exceder, você pode fazer upgrade para um plano maior ou pagar pelo excedente (valores proporcionais). Seus feedbacks nunca serão bloqueados.',
  },
];

function FAQItemComponent({ faq, index }: { faq: FAQItem; index: number }) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="border border-border rounded-lg overflow-hidden">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between p-6 text-left hover:bg-muted/50 transition-colors"
      >
        <span className="font-semibold text-secondary pr-8">
          {faq.question}
        </span>
        <ChevronDown
          className={`w-5 h-5 text-muted-foreground flex-shrink-0 transition-transform ${
            isOpen ? 'rotate-180' : ''
          }`}
        />
      </button>
      
      {isOpen && (
        <div className="px-6 pb-6 text-muted-foreground leading-relaxed">
          {faq.answer}
        </div>
      )}
    </div>
  );
}

export function FAQ() {
  return (
    <div className="max-w-3xl mx-auto space-y-4">
      {faqs.map((faq, idx) => (
        <FAQItemComponent key={`faq-${idx}`} faq={faq} index={idx} />
      ))}
    </div>
  );
}
