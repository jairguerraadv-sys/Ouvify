'use client';

import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Bell, Settings, User, LogOut, ChevronDown } from 'lucide-react';
import Link from 'next/link';
import { logout } from '@/lib/auth';

interface HeaderProps {
  title: string;
  subtitle?: string;
  description?: string;
  action?: {
    label: string;
    onClick?: () => void;
    href?: string;
  };
  user?: {
    name: string;
    email: string;
  };
}

export function Header({ title, subtitle, description, action, user }: HeaderProps) {
  return (
    <header className="sticky top-0 z-30 border-b border-slate-200 bg-white">
      <div className="flex h-16 items-center justify-between px-6">
        {/* Left */}
        <div>
          <h1 className="text-2xl font-bold font-heading text-slate-900">{title}</h1>
          {(subtitle || description) && <p className="text-sm text-slate-600">{subtitle || description}</p>}
        </div>

        {/* Right */}
        <div className="flex items-center gap-4">
          {action && (
            action.href ? (
              <Link href={action.href}>
                <Button>{action.label}</Button>
              </Link>
            ) : (
              <Button onClick={action.onClick}>{action.label}</Button>
            )
          )}

          {/* Notifications */}
          <Button 
            variant="ghost" 
            size="icon" 
            className="text-slate-600"
            aria-label="Notificações"
          >
            <Bell className="h-5 w-5" />
          </Button>

          {/* User Menu */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button 
                variant="ghost" 
                className="text-slate-600 gap-2"
                aria-label="Menu do usuário"
              >
                <span className="hidden sm:inline text-sm">{user?.name}</span>
                <ChevronDown className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              <div className="px-2 py-1.5">
                <p className="text-sm font-medium text-slate-900">{user?.name}</p>
                <p className="text-xs text-slate-600">{user?.email}</p>
              </div>
              <DropdownMenuSeparator />
              <DropdownMenuItem>
                <Link href="/dashboard/perfil" className="cursor-pointer flex items-center">
                  <User className="h-4 w-4 mr-2" />
                  Perfil
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem>
                <Link href="/dashboard/configuracoes" className="cursor-pointer flex items-center">
                  <Settings className="h-4 w-4 mr-2" />
                  Configurações
                </Link>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem 
                className="text-red-600 cursor-pointer"
                onClick={async () => {
                  if (confirm('Deseja realmente sair?')) {
                    await logout();
                  }
                }}
              >
                <LogOut className="h-4 w-4 mr-2" />
                Sair
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
}

// Alias para compatibilidade
export { Header as DashboardHeader };
