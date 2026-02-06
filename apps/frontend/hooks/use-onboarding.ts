/**
 * Hook para gerenciar onboarding de novos clientes
 * 
 * Verifica progresso de configuração inicial:
 * - Personalização da marca (logo ou cores)
 * - Criação de tags/canais
 * - Primeiro feedback
 * - Convite de equipe (opcional)
 */

import useSWR from "swr";
import { useEffect, useState } from "react";

export interface OnboardingProgress {
  brand_configured: boolean;
  tags_created: boolean;
  first_feedback: boolean;
  team_invited: boolean;
  progress_percentage: number;
  completed: boolean;
}

/**
 * Hook para obter progresso do onboarding
 */
export function useOnboarding() {
  const [isDismissed, setIsDismissed] = useState(false);

  // Verificar localStorage ao montar
  useEffect(() => {
    const dismissed = localStorage.getItem("onboarding_dismissed");
    setIsDismissed(dismissed === "true");
  }, []);

  // Buscar dados do tenant
  const { data: tenant } = useSWR("/api/tenant-info/");

  // Buscar tags (verificar se count > 0)
  const { data: tags } = useSWR("/api/tags/?limit=1");

  // Buscar feedbacks (verificar se count > 0)
  const { data: feedbacks } = useSWR("/api/feedbacks/?limit=1");

  // Buscar membros do time (verificar se count > 1)
  const { data: team } = useSWR("/api/team/members/?limit=2");

  // Calcular progresso
  const progress: OnboardingProgress = {
    brand_configured: Boolean(
      tenant?.logo || 
      (tenant?.cor_primaria && tenant?.cor_primaria !== "#6366F1")
    ),
    tags_created: (tags?.count || 0) > 0,
    first_feedback: (feedbacks?.count || 0) > 0,
    team_invited: (team?.count || 0) > 1,
    progress_percentage: 0,
    completed: false,
  };

  // Calcular percentual (3 tarefas principais)
  const tasksCompleted = [
    progress.brand_configured,
    progress.tags_created,
    progress.first_feedback,
  ].filter(Boolean).length;

  progress.progress_percentage = Math.round((tasksCompleted / 3) * 100);
  progress.completed = progress.progress_percentage === 100;

  const dismiss = () => {
    localStorage.setItem("onboarding_dismissed", "true");
    setIsDismissed(true);
  };

  const reset = () => {
    localStorage.removeItem("onboarding_dismissed");
    setIsDismissed(false);
  };

  // Auto-dismiss após 3 segundos se completo
  useEffect(() => {
    if (progress.completed && !isDismissed) {
      const timeout = setTimeout(() => {
        dismiss();
      }, 3000);
      return () => clearTimeout(timeout);
    }
  }, [progress.completed, isDismissed]);

  return {
    progress,
    isDismissed,
    dismiss,
    reset,
    isLoading: !tenant || !tags || !feedbacks,
  };
}
