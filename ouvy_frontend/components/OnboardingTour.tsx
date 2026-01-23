'use client';

import { useEffect, useState } from 'react';
import { driver } from 'driver.js';
import 'driver.js/dist/driver.css';
import { useAuth } from '@/contexts/AuthContext';

export function OnboardingTour() {
  const { user, tenant } = useAuth();
  const [hasRun, setHasRun] = useState(false);

  useEffect(() => {
    // Só executa se usuário está logado e tenant existe
    if (!user || !tenant || hasRun) return;

    // Verifica se onboarding já foi completado
    const onboardingCompleted = localStorage.getItem('onboarding_completed');
    if (onboardingCompleted === 'true') return;

    // Verifica se é usuário novo (criado há menos de 24h)
    const createdAt = new Date(tenant.created_at);
    const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
    const isNewUser = createdAt > oneDayAgo;

    if (!isNewUser) return;

    // Aguarda 1 segundo para garantir que elementos estão renderizados
    const timer = setTimeout(() => {
      startTour();
      setHasRun(true);
    }, 1000);

    return () => clearTimeout(timer);
  }, [user, tenant, hasRun]);

  const startTour = () => {
    const driverObj = driver({
      showProgress: true,
      showButtons: ['next', 'previous', 'close'],
      steps: [
        {
          element: 'body',
          popover: {
            title: '🎉 Bem-vindo ao Ouvy!',
            description: `Olá ${user?.name || 'Visitante'}! Vamos fazer um tour rápido de 2 minutos para você conhecer as principais funcionalidades da plataforma.`,
            side: 'center',
            align: 'center',
          },
        },
        {
          element: '[data-tour="configuracoes"]',
          popover: {
            title: '1️⃣ Configure sua Marca',
            description: 'Primeiro, personalize sua plataforma com seu logo, cores e favicon. Isso aparecerá na página pública de feedback que seus clientes verão.',
            side: 'right',
            align: 'start',
          },
        },
        {
          element: '[data-tour="public-link"]',
          popover: {
            title: '2️⃣ Compartilhe o Link Público',
            description: `Este é o link da sua página pública onde seus clientes podem enviar feedbacks: <br><br><code style="background: #f3f4f6; padding: 8px; border-radius: 4px; display: block; margin-top: 8px;">${tenant?.subdominio}.ouvy.com/enviar</code><br><br>Compartilhe em emails, site, redes sociais, etc.`,
            side: 'bottom',
            align: 'start',
          },
        },
        {
          element: '[data-tour="feedbacks"]',
          popover: {
            title: '3️⃣ Gerencie Feedbacks',
            description: 'Aqui você visualiza, filtra e responde aos feedbacks recebidos. Você pode mudar o status (pendente, em análise, resolvido) e adicionar comentários internos.',
            side: 'right',
            align: 'start',
          },
        },
        {
          element: '[data-tour="relatorios"]',
          popover: {
            title: '4️⃣ Exporte Relatórios',
            description: 'Exporte seus dados em CSV ou JSON para análises externas. Filtre por tipo, status e período. Disponível a partir do plano STARTER.',
            side: 'right',
            align: 'start',
          },
        },
        {
          element: '[data-tour="assinatura"]',
          popover: {
            title: '5️⃣ Gerencie sua Assinatura',
            description: 'Veja seu plano atual, faça upgrade ou gerencie pagamentos. Comece no plano FREE (até 50 feedbacks/mês) e evolua conforme sua necessidade.',
            side: 'right',
            align: 'start',
          },
        },
        {
          element: 'body',
          popover: {
            title: '✅ Pronto para Começar!',
            description: `Agora você está pronto para começar a receber feedbacks. Se tiver dúvidas:<br><br>
              📧 Email: <a href="mailto:suporte@ouvy.com" style="color: #4F46E5;">suporte@ouvy.com</a><br>
              💬 Chat: Disponível no canto inferior direito<br>
              📚 Documentação: <a href="https://docs.ouvy.com" target="_blank" style="color: #4F46E5;">docs.ouvy.com</a>`,
            side: 'center',
            align: 'center',
          },
        },
      ],
      onDestroyStarted: () => {
        localStorage.setItem('onboarding_completed', 'true');
        driverObj.destroy();
      },
    });

    driverObj.drive();
  };

  // Botão para reiniciar tour (útil para testes)
  if (process.env.NODE_ENV === 'development') {
    return (
      <button
        onClick={() => {
          localStorage.removeItem('onboarding_completed');
          startTour();
        }}
        className="fixed bottom-4 right-4 bg-purple-600 text-white px-4 py-2 rounded-lg shadow-lg hover:bg-purple-700 z-50"
      >
        🔄 Reiniciar Tour
      </button>
    );
  }

  return null;
}
