'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  Home, 
  MessageSquare, 
  BarChart3, 
  Settings, 
  LogOut,
  Sparkles,
  Shield,
  CreditCard,
  TrendingUp,
  HelpCircle
} from 'lucide-react';
import { Logo } from '@/components/ui/logo';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { logout } from '@/lib/auth';

interface SidebarProps {
  user?: {
    name: string;
    email: string;
    avatar?: string;
  };
}

const navigation = [
  { name: 'Visão Geral', href: '/dashboard', icon: Home, tourId: '' },
  { name: 'Feedbacks', href: '/dashboard/feedbacks', icon: MessageSquare, tourId: 'feedbacks' },
  { name: 'Analytics', href: '/dashboard/analytics', icon: TrendingUp, tourId: 'analytics' },
  { name: 'Relatórios', href: '/dashboard/relatorios', icon: BarChart3, tourId: 'relatorios' },
  { name: 'Assinatura', href: '/dashboard/assinatura', icon: CreditCard, tourId: 'assinatura' },
  { name: 'Configurações', href: '/dashboard/configuracoes', icon: Settings, tourId: 'configuracoes' },
  { name: 'Ajuda', href: '/dashboard/ajuda', icon: HelpCircle, tourId: 'ajuda' },
];

export function Sidebar({ user }: SidebarProps) {
  const pathname = usePathname();

  return (
    <div className="flex h-screen w-64 flex-col border-r border-border-light bg-background">
      {/* Logo */}
      <div className="flex h-16 items-center justify-center border-b border-border-light px-6">
        <Logo size="md" />
      </div>

      {/* Navigation */}
      <nav className="flex-1 space-y-1 px-3 py-4">
        {navigation.map((item) => {
          const isActive = pathname === item.href || pathname.startsWith(item.href + '/');
          const Icon = item.icon;
          
          return (
            <Link
              key={item.name}
              href={item.href}
              data-tour={item.tourId}
              className={cn(
                'group flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all',
                isActive
                  ? 'bg-primary-50 text-primary-600'
                  : 'text-text-secondary hover:bg-background-secondary hover:text-text-primary'
              )}
            >
              <Icon className={cn(
                'h-5 w-5 transition-colors',
                isActive ? 'text-primary-600' : 'text-text-tertiary group-hover:text-text-secondary'
              )} />
              {item.name}
            </Link>
          );
        })}
      </nav>

      <Separator className="mx-3" />

      {/* Plan Card */}
      <div className="p-4">
        <div className="rounded-lg border border-border-light bg-gradient-to-br from-primary-50 to-secondary-50 p-4">
          <div className="flex items-center gap-2 mb-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-primary-500 to-primary-600">
              <Sparkles className="h-4 w-4 text-white" />
            </div>
            <div>
              <p className="text-xs font-semibold text-secondary-600">Plano Pro</p>
              <Badge variant="secondary" className="mt-0.5 h-4 px-1 text-[10px]">
                Ativo
              </Badge>
            </div>
          </div>
          <p className="text-xs text-text-secondary mb-3">
            Recursos ilimitados até 15/02/2026
          </p>
          <Button size="sm" className="w-full bg-primary-500 hover:bg-primary-600 text-white text-xs h-8">
            Fazer Upgrade
          </Button>
        </div>
      </div>

      {/* User Profile */}
      <div className="border-t border-border-light p-4">
        <div className="flex items-center gap-3">
          <Avatar className="h-9 w-9">
            <AvatarImage src={user?.avatar} alt={user?.name || 'User'} />
            <AvatarFallback className="bg-primary-100 text-primary-600 text-sm font-semibold">
              {user?.name?.charAt(0).toUpperCase() || 'U'}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-text-primary truncate">
              {user?.name || 'Usuário'}
            </p>
            <p className="text-xs text-text-tertiary truncate">
              {user?.email || 'email@example.com'}
            </p>
          </div>
          <Button 
            variant="ghost" 
            size="icon" 
            className="h-8 w-8 text-text-tertiary hover:text-text-secondary"
            onClick={async () => {
              if (confirm('Deseja realmente sair?')) {
                await logout();
              }
            }}
            aria-label="Sair da conta"
          >
            <LogOut className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}
