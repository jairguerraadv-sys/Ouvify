'use client';

import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  MessageSquare,
  BarChart3,
  Settings,
  LogOut,
  Menu,
  X,
  ChevronDown
} from 'lucide-react';
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Logo } from '@/components/ui/logo';

interface SidebarProps {
  user?: {
    name: string;
    email: string;
    avatar?: string;
  };
}

export function Sidebar({ user }: SidebarProps) {
  const [open, setOpen] = useState(false);
  const [logoSrc, setLogoSrc] = useState<string>('/logo.png');
  const [imageError, setImageError] = useState<boolean>(false);
  const pathname = usePathname();

  const navigation = [
    { name: 'Visão Geral', href: '/dashboard', icon: LayoutDashboard },
    { name: 'Feedbacks', href: '/dashboard/feedbacks', icon: MessageSquare },
    { name: 'Relatórios', href: '/dashboard/relatorios', icon: BarChart3 },
    { name: 'Configurações', href: '/dashboard/configuracoes', icon: Settings }
  ];

  const isActive = (href: string) => pathname === href;

  // White Label: tentar carregar logo do tenant; se falhar, usar logo padrão
  useEffect(() => {
    const fetchTenantLogo = async () => {
      try {
        const res = await fetch('/api/tenant-info/');
        if (res.ok) {
          const data = await res.json();
          if (data?.logo) {
            setLogoSrc(data.logo);
          }
        }
      } catch (e) {
        // Silencia erros e mantém fallback padrão
      }
    };
    fetchTenantLogo();
  }, []);

  return (
    <>
      {/* Mobile Toggle */}
      <div className="fixed top-0 left-0 z-50 p-4 lg:hidden">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setOpen(!open)}
          className="text-slate-600"
        >
          {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </Button>
      </div>

      {/* Mobile Overlay */}
      {open && (
        <div
          className="fixed inset-0 z-30 bg-black/50 lg:hidden"
          onClick={() => setOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed left-0 top-0 z-40 h-screen w-64 border-r border-slate-200 bg-white transition-transform duration-300 ease-in-out lg:translate-x-0 ${
          open ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Logo */}
        <div className="flex h-16 items-center border-b border-slate-200 px-6">
          <div className="hidden lg:block">
            <Logo width={120} height={30} linkTo="/dashboard" />
          </div>
          <div className="block lg:hidden">
            <Logo variant="icon-only" width={40} height={40} linkTo="/dashboard" />
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 space-y-2 px-4 py-6">
          {navigation.map((item) => {
            const Icon = item.icon;
            const active = isActive(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setOpen(false)}
                className={`flex items-center gap-3 rounded-lg px-4 py-2.5 text-sm font-medium transition-colors ${
                  active
                    ? 'bg-blue-50 text-blue-600'
                    : 'text-slate-600 hover:bg-slate-100'
                }`}
              >
                <Icon className="h-5 w-5" />
                {item.name}
              </Link>
            );
          })}
        </nav>

        {/* User Profile */}
        <div className="border-t border-slate-200 p-4 space-y-4">
          {user && (
            <div className="flex items-center gap-3 px-2">
              <Avatar className="h-10 w-10">
                <AvatarImage src={user.avatar} alt={user.name} />
                <AvatarFallback className="bg-blue-100 text-blue-600">
                  {user.name.charAt(0).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-slate-900 truncate">
                  {user.name}
                </p>
                <p className="text-xs text-slate-600 truncate">
                  {user.email}
                </p>
              </div>
            </div>
          )}
          <Button
            variant="outline"
            className="w-full justify-start text-slate-600 hover:text-slate-900"
            onClick={() => setOpen(false)}
          >
            <LogOut className="h-4 w-4 mr-2" />
            Sair
          </Button>
        </div>
      </aside>

      {/* Spacer para desktop */}
      <div className="hidden lg:block w-64" />
    </>
  );
}
