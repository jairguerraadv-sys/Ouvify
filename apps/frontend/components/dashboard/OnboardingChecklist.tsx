'use client';

import { useState, useEffect } from 'react';
import { CheckCircle, Circle, X, ExternalLink } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import Link from 'next/link';

interface ChecklistItem {
  id: string;
  title: string;
  description: string;
  completed: boolean;
  link: string;
  external?: boolean;
}

export function OnboardingChecklist() {
  const { user } = useAuth();
  const [items, setItems] = useState<ChecklistItem[]>([]);
  const [visible, setVisible] = useState(true);
  const [feedbackCount, setFeedbackCount] = useState(0);
  
  // Pegar tenant do localStorage
  const tenant = typeof window !== 'undefined'
    ? JSON.parse(localStorage.getItem('tenant_data') || '{}')
    : null;

  useEffect(() => {
    if (!tenant) return;

    // Buscar quantidade de feedbacks (opcional - pode ser removido se causar problemas)
    fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/feedbacks/`, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem('access_token')}`,
      },
    })
      .then(res => res.json())
      .then(data => {
        setFeedbackCount(Array.isArray(data) ? data.length : 0);
      })
      .catch(() => setFeedbackCount(0));

    // Verificar progresso do onboarding
    const hasLogo = tenant.logo != null && tenant.logo !== '';
    const hasColors = tenant.cor_primaria != null && tenant.cor_primaria !== '';
    const hasFeedbacks = feedbackCount > 0;
    const hasUpgrade = tenant.plano !== 'free';
    const checklistDismissed = localStorage.getItem('checklist_dismissed') === 'true';
    
    setVisible(!checklistDismissed);

    setItems([
      {
        id: 'logo',
        title: 'Configure seu logo',
        description: 'Adicione o logo da sua empresa na página de configurações',
        completed: hasLogo,
        link: '/dashboard/configuracoes',
      },
      {
        id: 'colors',
        title: 'Personalize as cores',
        description: 'Defina a identidade visual da sua plataforma',
        completed: hasColors,
        link: '/dashboard/configuracoes',
      },
      {
        id: 'feedback',
        title: 'Receba seu primeiro feedback',
        description: 'Compartilhe o link público ou crie um feedback de teste',
        completed: hasFeedbacks,
        link: `https://${tenant.subdominio}.ouvify.com/enviar`,
        external: true,
      },
      {
        id: 'share',
        title: 'Compartilhe o link público',
        description: 'Divulgue seu canal de feedback com clientes',
        completed: false, // Não há como detectar isso automaticamente
        link: '/dashboard',
      },
      {
        id: 'upgrade',
        title: 'Considere fazer upgrade (opcional)',
        description: 'Desbloqueie funcionalidades premium como relatórios',
        completed: hasUpgrade,
        link: '/dashboard/assinatura',
      },
    ]);
  }, [tenant, feedbackCount]);

  const progress = items.filter(i => i.completed).length;
  const total = items.length;
  const percentage = Math.round((progress / total) * 100);

  // Esconder checklist se foi dismissado ou se está 100% completo
  if (!visible || !tenant || percentage === 100) return null;

  const handleDismiss = () => {
    localStorage.setItem('checklist_dismissed', 'true');
    setVisible(false);
  };

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-6 mb-6 shadow-sm">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">
            🚀 Complete sua configuração
          </h3>
          <p className="text-sm text-gray-600">
            {progress} de {total} concluídos ({percentage}%)
          </p>
        </div>
        <button
          onClick={handleDismiss}
          className="text-gray-400 hover:text-gray-600 transition-colors"
          aria-label="Fechar checklist"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Progress bar */}
      <div className="w-full bg-gray-200 rounded-full h-2 mb-6">
        <div
          className="bg-primary-600 h-2 rounded-full transition-all duration-500 ease-out"
          style={{ width: `${percentage}%` }}
        />
      </div>

      {/* Checklist items */}
      <ul className="space-y-3">
        {items.map(item => (
          <li key={item.id} className="flex items-start gap-3">
            {item.completed ? (
              <CheckCircle className="w-5 h-5 text-success-600 flex-shrink-0 mt-0.5" />
            ) : (
              <Circle className="w-5 h-5 text-gray-400 flex-shrink-0 mt-0.5" />
            )}
            <div className="flex-1 min-w-0">
              {item.external ? (
                <a
                  href={item.link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`text-sm font-medium hover:text-primary-600 transition-colors inline-flex items-center gap-1 ${
                    item.completed ? 'text-gray-500 line-through' : 'text-gray-900'
                  }`}
                >
                  {item.title}
                  <ExternalLink className="w-3 h-3" />
                </a>
              ) : (
                <Link
                  href={item.link}
                  className={`text-sm font-medium hover:text-primary-600 transition-colors ${
                    item.completed ? 'text-gray-500 line-through' : 'text-gray-900'
                  }`}
                >
                  {item.title}
                </Link>
              )}
              <p className="text-xs text-gray-500 mt-0.5">{item.description}</p>
            </div>
          </li>
        ))}
      </ul>

      {percentage >= 75 && percentage < 100 && (
        <div className="mt-4 p-3 bg-primary-50 border border-primary-200 rounded-lg">
          <p className="text-sm text-primary-900">
            🎉 Quase lá! Você já concluiu {progress} de {total} passos.
          </p>
        </div>
      )}
    </div>
  );
}
