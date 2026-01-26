'use client';

import { useEffect, useState, useCallback, createContext, useContext } from 'react';
import { driver, Driver } from 'driver.js';
import 'driver.js/dist/driver.css';
import { useAuth } from '@/contexts/AuthContext';

// Contexto para permitir restart do tour de qualquer lugar
interface OnboardingContextType {
  restartTour: () => void;
  isActive: boolean;
}

const OnboardingContext = createContext<OnboardingContextType | null>(null);

export function useOnboarding() {
  const context = useContext(OnboardingContext);
  if (!context) {
    // Return a no-op if not inside provider
    return { restartTour: () => {}, isActive: false };
  }
  return context;
}

export function OnboardingProvider({ children }: { children: React.ReactNode }) {
  const [restartTrigger, setRestartTrigger] = useState(0);
  const [isActive, setIsActive] = useState(false);

  const restartTour = useCallback(() => {
    localStorage.removeItem('onboarding_completed');
    setRestartTrigger((prev) => prev + 1);
  }, []);

  return (
    <OnboardingContext.Provider value={{ restartTour, isActive }}>
      {children}
      <OnboardingTourInner restartTrigger={restartTrigger} onActiveChange={setIsActive} />
    </OnboardingContext.Provider>
  );
}

interface OnboardingTourInnerProps {
  restartTrigger: number;
  onActiveChange: (active: boolean) => void;
}

function OnboardingTourInner({ restartTrigger, onActiveChange }: OnboardingTourInnerProps) {
  const { user } = useAuth();
  const [hasRun, setHasRun] = useState(false);
  
  // Pegar tenant do localStorage
  const tenant = typeof window !== 'undefined'
    ? JSON.parse(localStorage.getItem('tenant_data') || '{}')
    : null;

  const startTour = useCallback(() => {
    onActiveChange(true);
    
    const driverObj: Driver = driver({
      showProgress: true,
      showButtons: ['next', 'previous', 'close'],
      steps: [
        {
          element: 'body',
          popover: {
            title: '🎉 Bem-vindo ao Ouvy!',
            description: `Olá ${user?.name || 'Visitante'}! Vamos fazer um tour rápido de 2 minutos para você conhecer as principais funcionalidades da plataforma.`,
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
            description: `Este é o link da sua página pública onde seus clientes podem enviar feedbacks: <br><br><code style="background: #f3f4f6; padding: 8px; border-radius: 4px; display: block; margin-top: 8px;">${tenant?.subdominio || 'seudominio'}.ouvy.com/enviar</code><br><br>Compartilhe em emails, site, redes sociais, etc.`,
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
          },
        },
      ],
      onDestroyStarted: () => {
        localStorage.setItem('onboarding_completed', 'true');
        onActiveChange(false);
        driverObj.destroy();
      },
    });

    driverObj.drive();
  }, [user, tenant, onActiveChange]);

  // Effect para iniciar tour automaticamente
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
  }, [user, tenant, hasRun, startTour]);

  // Effect para reiniciar tour quando trigger muda
  useEffect(() => {
    if (restartTrigger > 0 && user) {
      const timer = setTimeout(() => {
        startTour();
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [restartTrigger, user, startTour]);

  return null;
}

// Componente standalone para usar sem provider (mantém retrocompatibilidade)
export function OnboardingTour() {
  const { user } = useAuth();
  const [hasRun, setHasRun] = useState(false);
  
  // Pegar tenant do localStorage
  const tenant = typeof window !== 'undefined'
    ? JSON.parse(localStorage.getItem('tenant_data') || '{}')
    : null;

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
            description: `Este é o link da sua página pública onde seus clientes podem enviar feedbacks: <br><br><code style="background: #f3f4f6; padding: 8px; border-radius: 4px; display: block; margin-top: 8px;">${tenant?.subdominio || 'seudominio'}.ouvy.com/enviar</code><br><br>Compartilhe em emails, site, redes sociais, etc.`,
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

  return null;
}
