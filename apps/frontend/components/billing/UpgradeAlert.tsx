/**
 * Componente de alerta para upgrade de plano (Soft Enforcement).
 * 
 * Exibe alertas quando o tenant está próximo ou atingiu limites do plano:
 * - Alerta amarelo quando uso > 80% (is_near_limit)
 * - Alerta vermelho quando uso = 100% (is_blocked)
 * - Barra de progresso visual
 * - CTA para upgrade
 * 
 * Sprint 4 - FASE 1 (MOTOR SAAS & GATING)
 * 
 * @example
 * ```tsx
 * // Em qualquer página do dashboard
 * import { UpgradeAlert } from '@/components/billing/UpgradeAlert';
 * 
 * function DashboardPage() {
 *   return (
 *     <div>
 *       <UpgradeAlert />
 *       {/* resto do conteúdo *\/}
 *     </div>
 *   );
 * }
 * ```
 */

'use client';

import { useUsageLimits } from '@/hooks/use-usage-limits';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { AlertTriangle, Lock, TrendingUp, Zap } from 'lucide-react';
import Link from 'next/link';
import { cn } from '@/lib/utils';

interface UpgradeAlertProps {
  /**
   * Classe CSS adicional para o container.
   */
  className?: string;
  
  /**
   * Se true, sempre mostra o alerta (útil para testes).
   * @default false
   */
  forceShow?: boolean;
  
  /**
   * URL customizada para o botão de upgrade.
   * @default '/dashboard/configuracoes/plano'
   */
  upgradeUrl?: string;
}

export function UpgradeAlert({
  className,
  forceShow = false,
  upgradeUrl = '/dashboard/configuracoes/plano',
}: UpgradeAlertProps) {
  const { usage, isNearLimit, isAtLimit, isFreePlan, isLoading } = useUsageLimits();

  // Não exibe enquanto carrega
  if (isLoading) return null;

  // Não exibe se não tem dados
  if (!usage) return null;

  // Só exibe para plano Free
  if (!isFreePlan && !forceShow) return null;

  // Não exibe se não está próximo do limite
  if (!isNearLimit && !isAtLimit && !forceShow) return null;

  // Variante do alerta
  const variant = isAtLimit ? 'error' : 'warning';
  const Icon = isAtLimit ? Lock : AlertTriangle;

  return (
    <Alert 
      variant={variant}
      className={cn('mb-6 border-l-4', className)}
    >
      <div className="flex items-start gap-4">
        <div className="flex-shrink-0 mt-0.5">
          <Icon className="w-5 h-5" />
        </div>
        
        <div className="flex-1 space-y-3">
          {/* Título */}
          <AlertTitle className="text-base font-semibold">
            {isAtLimit 
              ? '🚫 Limite de Feedbacks Atingido' 
              : '⚠️ Próximo ao Limite de Feedbacks'
            }
          </AlertTitle>
          
          {/* Descrição */}
          <AlertDescription className="space-y-3">
            <p className="text-sm">
              {isAtLimit ? (
                <>
                  Você atingiu o limite de <strong>{usage.feedbacks_limit} feedbacks/mês</strong> do plano {usage.plan_name}.
                  {' '}Não será possível criar novos feedbacks até o próximo mês ou fazer upgrade.
                </>
              ) : (
                <>
                  Você usou <strong>{usage.feedbacks_used} de {usage.feedbacks_limit} feedbacks</strong>
                  {' '}({Math.round(usage.usage_percent)}%) este mês no plano {usage.plan_name}.
                </>
              )}
            </p>
            
            {/* Barra de Progresso */}
            <div className="space-y-1">
              <Progress 
                value={usage.usage_percent} 
                className={cn(
                  'h-2',
                  isAtLimit && 'bg-red-100',
                  isNearLimit && !isAtLimit && 'bg-yellow-100'
                )}
              />
              <p className="text-xs text-muted-foreground">
                {usage.feedbacks_used} / {usage.feedbacks_limit} feedbacks usados
              </p>
            </div>
            
            {/* CTA de Upgrade */}
            {isAtLimit && (
              <div className="flex items-start gap-2 p-3 bg-background/50 rounded-md border">
                <Zap className="w-4 h-4 mt-0.5 text-yellow-600" />
                <div className="flex-1 text-sm">
                  <p className="font-medium">Plano Pro: Feedbacks Ilimitados</p>
                  <p className="text-muted-foreground text-xs mt-0.5">
                    Crie quantos feedbacks precisar, sem limites mensais.
                  </p>
                </div>
              </div>
            )}
          </AlertDescription>
        </div>
        
        {/* Botão de Upgrade */}
        <div className="flex-shrink-0">
          <Button asChild variant={isAtLimit ? 'default' : 'outline'} size="sm">
            <Link href={upgradeUrl}>
              <TrendingUp className="w-4 h-4 mr-2" />
              Fazer Upgrade
            </Link>
          </Button>
        </div>
      </div>
    </Alert>
  );
}

/**
 * Badge compacto para exibir uso atual (ex: em headers).
 * 
 * @example
 * ```tsx
 * <UsageBadge />
 * // Output: "45/50 feedbacks"
 * ```
 */
export function UsageBadge({ className }: { className?: string }) {
  const { usage, isAtLimit, isNearLimit, isLoading } = useUsageLimits();

  if (isLoading || !usage) return null;

  // Só exibe se próximo ou no limite
  if (!isNearLimit && !isAtLimit) return null;

  return (
    <div
      className={cn(
        'inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium',
        isAtLimit && 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400',
        isNearLimit && !isAtLimit && 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400',
        className
      )}
    >
      {isAtLimit ? (
        <Lock className="w-3 h-3" />
      ) : (
        <AlertTriangle className="w-3 h-3" />
      )}
      <span>
        {usage.feedbacks_used}/{usage.feedbacks_limit} feedbacks
      </span>
    </div>
  );
}

/**
 * Botão "Criar Feedback" com bloqueio automático.
 * 
 * @example
 * ```tsx
 * <CreateFeedbackButton href="/dashboard/feedbacks/novo" />
 * ```
 */
interface CreateFeedbackButtonProps {
  href: string;
  children?: React.ReactNode;
  className?: string;
}

export function CreateFeedbackButton({ 
  href, 
  children = 'Novo Feedback',
  className 
}: CreateFeedbackButtonProps) {
  const { canCreateFeedback, isAtLimit, usage } = useUsageLimits();

  if (isAtLimit) {
    return (
      <Button disabled className={className} title="Limite de feedbacks atingido">
        <Lock className="w-4 h-4 mr-2" />
        {children}
      </Button>
    );
  }

  return (
    <Button asChild className={className}>
      <Link href={href}>
        {children}
      </Link>
    </Button>
  );
}
