'use client';

/**
 * Toggle para alternar entre temas (Light/Dark/System)
 */

import { useState, useEffect } from 'react';
import { useTheme } from 'next-themes';
import { Sun, Moon, Monitor } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ThemeToggleProps {
  /** Mostra menu dropdown com todas as opções */
  showMenu?: boolean;
  /** Classes adicionais */
  className?: string;
}

export function ThemeToggle({ showMenu = false, className }: ThemeToggleProps) {
  const [mounted, setMounted] = useState(false);
  const { theme, setTheme, resolvedTheme } = useTheme();

  // Evita hydration mismatch
  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    // Placeholder durante hidratação
    return (
      <button
        className={cn(
          "p-2 rounded-lg bg-gray-100 dark:bg-white",
          className
        )}
        aria-label="Carregando tema"
        disabled
      >
        <div className="w-5 h-5" />
      </button>
    );
  }

  // Toggle simples entre light e dark
  const toggleTheme = () => {
    if (resolvedTheme === 'dark') {
      setTheme('light');
    } else {
      setTheme('dark');
    }
  };

  // Ícone baseado no tema atual
  const Icon = resolvedTheme === 'dark' ? Moon : Sun;

  if (!showMenu) {
    // Botão simples de toggle
    return (
      <button
        onClick={toggleTheme}
        className={cn(
          "p-2 rounded-lg transition-colors",
          "hover:bg-gray-100 dark:hover:bg-white",
          "focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2",
          "dark:focus:ring-offset-gray-900",
          className
        )}
        aria-label={resolvedTheme === 'dark' ? 'Ativar modo claro' : 'Ativar modo escuro'}
      >
        <Icon className="w-5 h-5 text-gray-600 dark:text-gray-400" />
      </button>
    );
  }

  // Menu dropdown com todas as opções
  return (
    <div className={cn("relative inline-block", className)}>
      <div className="flex items-center gap-1 p-1 bg-gray-100 dark:bg-white rounded-lg">
        <ThemeButton
          active={theme === 'light'}
          onClick={() => setTheme('light')}
          icon={<Sun className="w-4 h-4" />}
          label="Claro"
        />
        <ThemeButton
          active={theme === 'dark'}
          onClick={() => setTheme('dark')}
          icon={<Moon className="w-4 h-4" />}
          label="Escuro"
        />
        <ThemeButton
          active={theme === 'system'}
          onClick={() => setTheme('system')}
          icon={<Monitor className="w-4 h-4" />}
          label="Sistema"
        />
      </div>
    </div>
  );
}

interface ThemeButtonProps {
  active: boolean;
  onClick: () => void;
  icon: React.ReactNode;
  label: string;
}

function ThemeButton({ active, onClick, icon, label }: ThemeButtonProps) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm font-medium transition-colors",
        active
          ? "bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm"
          : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
      )}
      aria-label={label}
      aria-pressed={active}
    >
      {icon}
      <span className="hidden sm:inline">{label}</span>
    </button>
  );
}

/**
 * Hook para usar o tema em componentes
 */
export { useTheme } from 'next-themes';
