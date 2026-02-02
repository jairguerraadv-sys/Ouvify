'use client';

import React from 'react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { 
  FileX, 
  Inbox, 
  Search, 
  MessageSquare, 
  Users, 
  Bell, 
  Settings,
  AlertCircle,
  FolderOpen,
  Copy,
  CheckCircle,
  type LucideIcon
} from 'lucide-react';

// ============================================
// TYPES
// ============================================

type EmptyStateVariant = 
  | 'default' 
  | 'no-data' 
  | 'no-results' 
  | 'no-feedbacks'
  | 'no-users'
  | 'no-notifications'
  | 'error'
  | 'custom';

interface EmptyStateAction {
  label: string;
  onClick?: () => void;
  href?: string;
  variant?: 'default' | 'outline' | 'secondary' | 'ghost';
}

interface EmptyStateProps {
  /** Variant determines the default icon and messaging */
  variant?: EmptyStateVariant;
  /** Custom icon override */
  icon?: LucideIcon;
  /** Main title text */
  title?: string;
  /** Description text */
  description?: string;
  /** Primary action button */
  action?: EmptyStateAction;
  /** Secondary action button */
  secondaryAction?: EmptyStateAction;
  /** Size of the component */
  size?: 'sm' | 'md' | 'lg';
  /** Additional CSS classes */
  className?: string;
  /** Children for fully custom content */
  children?: React.ReactNode;
  
  // Legacy props (backward compatibility with EmptyState.tsx)
  /** @deprecated Use action.label instead */
  actionLabel?: string;
  /** @deprecated Use action.href instead */
  actionHref?: string;
  /** @deprecated Use action with onClick/href target */
  actionExternal?: boolean;
  /** @deprecated Use secondaryAction.label instead */
  secondaryActionLabel?: string;
  /** @deprecated Use secondaryAction.href instead */
  secondaryActionHref?: string;
  /** Copy text feature (legacy) */
  copyText?: string;
}

// ============================================
// VARIANT CONFIGS
// ============================================

const variantConfig: Record<EmptyStateVariant, { 
  icon: LucideIcon; 
  title: string; 
  description: string;
  iconColor: string;
}> = {
  default: {
    icon: Inbox,
    title: 'Nada aqui ainda',
    description: 'Não há dados para exibir no momento.',
    iconColor: 'text-text-tertiary',
  },
  'no-data': {
    icon: FolderOpen,
    title: 'Sem dados',
    description: 'Não encontramos nenhum dado para exibir.',
    iconColor: 'text-text-tertiary',
  },
  'no-results': {
    icon: Search,
    title: 'Nenhum resultado encontrado',
    description: 'Tente ajustar os filtros ou termos de busca.',
    iconColor: 'text-primary-400',
  },
  'no-feedbacks': {
    icon: MessageSquare,
    title: 'Nenhum feedback ainda',
    description: 'Os feedbacks aparecerão aqui quando forem recebidos.',
    iconColor: 'text-secondary-400',
  },
  'no-users': {
    icon: Users,
    title: 'Nenhum usuário encontrado',
    description: 'Convide membros da equipe para começar.',
    iconColor: 'text-info-400',
  },
  'no-notifications': {
    icon: Bell,
    title: 'Tudo em dia!',
    description: 'Você não tem novas notificações.',
    iconColor: 'text-success-400',
  },
  error: {
    icon: AlertCircle,
    title: 'Algo deu errado',
    description: 'Não foi possível carregar os dados. Tente novamente.',
    iconColor: 'text-error-400',
  },
  custom: {
    icon: Settings,
    title: '',
    description: '',
    iconColor: 'text-text-tertiary',
  },
};

const sizeConfig = {
  sm: {
    container: 'py-8 px-4',
    icon: 'w-10 h-10',
    iconWrapper: 'w-16 h-16',
    title: 'text-base',
    description: 'text-sm',
    maxWidth: 'max-w-xs',
  },
  md: {
    container: 'py-12 px-6',
    icon: 'w-12 h-12',
    iconWrapper: 'w-20 h-20',
    title: 'text-lg',
    description: 'text-sm',
    maxWidth: 'max-w-sm',
  },
  lg: {
    container: 'py-16 px-8',
    icon: 'w-16 h-16',
    iconWrapper: 'w-24 h-24',
    title: 'text-xl',
    description: 'text-base',
    maxWidth: 'max-w-md',
  },
};

// ============================================
// COMPONENT
// ============================================

export function EmptyState({
  variant = 'default',
  icon,
  title,
  description,
  action,
  secondaryAction,
  size = 'md',
  className,
  children,
  // Legacy props
  actionLabel,
  actionHref,
  actionExternal,
  secondaryActionLabel,
  secondaryActionHref,
  copyText,
}: EmptyStateProps) {
  const [copied, setCopied] = React.useState(false);
  
  const config = variantConfig[variant];
  const sizes = sizeConfig[size];
  
  const Icon = icon || config.icon;
  
  // Handle legacy props - convert to new format
  const resolvedAction: EmptyStateAction | undefined = action || 
    (actionLabel && actionHref ? {
      label: actionLabel,
      href: actionHref,
    } : undefined);
    
  const resolvedSecondaryAction: EmptyStateAction | undefined = secondaryAction ||
    (secondaryActionLabel && secondaryActionHref ? {
      label: secondaryActionLabel,
      href: secondaryActionHref,
    } : undefined);
    
  const handleCopy = async () => {
    if (!copyText) return;
    try {
      await navigator.clipboard.writeText(copyText);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Erro ao copiar:', err);
    }
  };
  const displayTitle = title || config.title;
  const displayDescription = description || config.description;

  const renderAction = (actionConfig: EmptyStateAction, isPrimary: boolean) => {
    const buttonVariant = actionConfig.variant || (isPrimary ? 'default' : 'outline');
    
    if (actionConfig.href) {
      return (
        <Button variant={buttonVariant} asChild size={size === 'sm' ? 'sm' : 'default'}><a href={actionConfig.href}>{actionConfig.label}</a></Button>
      );
    }
    
    return (
      <Button 
        variant={buttonVariant} 
        onClick={actionConfig.onClick}
        size={size === 'sm' ? 'sm' : 'default'}
      >
        {actionConfig.label}
      </Button>
    );
  };

  return (
    <div
      className={cn(
        'flex flex-col items-center justify-center text-center',
        sizes.container,
        className
      )}
      role="status"
      aria-label={displayTitle}
    >
      {/* Icon */}
      <div 
        className={cn(
          'flex items-center justify-center rounded-full bg-background-tertiary mb-4',
          sizes.iconWrapper
        )}
      >
        <Icon 
          className={cn(
            sizes.icon,
            config.iconColor
          )} 
          strokeWidth={1.5}
        />
      </div>

      {/* Content */}
      <div className={cn('space-y-2', sizes.maxWidth)}>
        {displayTitle && (
          <h3 
            className={cn(
              'font-semibold font-heading text-text-primary',
              sizes.title
            )}
          >
            {displayTitle}
          </h3>
        )}
        
        {displayDescription && (
          <p 
            className={cn('text-text-secondary', sizes.description)}
          >
            {displayDescription}
          </p>
        )}
      </div>

      {/* Actions */}
      {(resolvedAction || resolvedSecondaryAction || copyText) && (
        <div className="flex flex-wrap gap-3 mt-6 justify-center">
          {resolvedAction && renderAction(resolvedAction, true)}
          
          {/* Copy Button (legacy feature) */}
          {copyText && (
            <Button 
              variant="ghost" 
              size={size === 'sm' ? 'sm' : 'default'}
              onClick={handleCopy}
              className="gap-2"
            >
              {copied ? (
                <>
                  <CheckCircle className="w-4 h-4 text-success-600" aria-hidden="true" />
                  Copiado!
                </>
              ) : (
                <>
                  <Copy className="w-4 h-4" aria-hidden="true" />
                  Copiar Link
                </>
              )}
            </Button>
          )}
          
          {resolvedSecondaryAction && renderAction(resolvedSecondaryAction, false)}
        </div>
      )}
      
      {/* Copy text display (legacy feature) */}
      {copyText && (
        <div className="mt-4 p-3 bg-background-secondary dark:bg-background rounded-md border border-border-light dark:border-border-light">
          <code className="text-sm text-text-secondary dark:text-text-secondary break-all">
            {copyText}
          </code>
        </div>
      )}

      {/* Custom children */}
      {children && (
        <div className="mt-6">
          {children}
        </div>
      )}
    </div>
  );
}

// ============================================
// PRESET EXPORTS
// ============================================

export function NoFeedbacks({ action }: { action?: EmptyStateAction }) {
  return (
    <EmptyState 
      variant="no-feedbacks" 
      action={action || {
        label: 'Compartilhar link',
        href: '/dashboard/configuracoes',
      }}
    />
  );
}

export function NoResults({ 
  onClear 
}: { 
  onClear?: () => void 
}) {
  return (
    <EmptyState 
      variant="no-results"
      action={onClear ? {
        label: 'Limpar filtros',
        onClick: onClear,
        variant: 'outline',
      } : undefined}
    />
  );
}

export function NoNotifications() {
  return <EmptyState variant="no-notifications" size="sm" />;
}

export function ErrorState({ 
  onRetry,
  description,
}: { 
  onRetry?: () => void;
  description?: string;
}) {
  return (
    <EmptyState 
      variant="error"
      description={description}
      action={onRetry ? {
        label: 'Tentar novamente',
        onClick: onRetry,
      } : undefined}
    />
  );
}

export default EmptyState;
