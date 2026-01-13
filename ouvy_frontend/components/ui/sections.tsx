'use client';

import React, { ReactNode } from 'react';
import { cn } from '@/lib/utils';

interface HeroProps {
  title: ReactNode;
  subtitle?: ReactNode;
  description?: string;
  children?: ReactNode;
  gradient?: boolean;
  backgroundPattern?: 'dots' | 'grid' | 'waves' | 'none';
  className?: string;
}

export function Hero({
  title,
  subtitle,
  description,
  children,
  gradient = true,
  backgroundPattern = 'dots',
  className,
}: HeroProps) {
  const getBackground = () => {
    switch (backgroundPattern) {
      case 'dots':
        return 'bg-gradient-to-br from-white via-neutral-50 to-blue-50 relative overflow-hidden';
      case 'grid':
        return 'bg-gradient-to-br from-white to-neutral-50 relative overflow-hidden';
      case 'waves':
        return 'bg-gradient-to-br from-blue-50 via-white to-cyan-50 relative overflow-hidden';
      default:
        return 'bg-white relative overflow-hidden';
    }
  };

  return (
    <section className={cn(
      'relative py-20 px-4 sm:px-6 lg:px-8',
      getBackground(),
      className
    )}>
      {/* Decorative elements */}
      {backgroundPattern !== 'none' && (
        <>
          <div className="absolute top-0 right-0 w-96 h-96 bg-primary/10 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blur" />
          <div className="absolute bottom-0 left-0 w-96 h-96 bg-accent/10 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blur" style={{ animationDelay: '2s' }} />
        </>
      )}

      <div className="max-w-4xl mx-auto text-center relative z-10 space-y-8">
        {subtitle && (
          <div className="inline-flex items-center gap-2 bg-primary/10 px-4 py-2 rounded-full border border-primary/20">
            <span className="w-2 h-2 bg-primary rounded-full animate-pulse" />
            <span className="text-sm font-semibold text-primary">{subtitle}</span>
          </div>
        )}

        <h1 className={cn(
          'text-4xl sm:text-5xl lg:text-6xl font-bold leading-tight',
          gradient && 'bg-gradient-to-r from-secondary via-primary to-accent bg-clip-text text-transparent',
          !gradient && 'text-secondary'
        )}>
          {title}
        </h1>

        {description && (
          <p className="text-lg sm:text-xl text-neutral-600 leading-relaxed max-w-2xl mx-auto">
            {description}
          </p>
        )}

        {children && (
          <div className="pt-8">
            {children}
          </div>
        )}
      </div>
    </section>
  );
}

interface FeatureGridProps {
  children: ReactNode;
  columns?: 2 | 3 | 4;
  gap?: 'sm' | 'md' | 'lg';
  className?: string;
}

export function FeatureGrid({
  children,
  columns = 3,
  gap = 'md',
  className,
}: FeatureGridProps) {
  const columnMap = {
    2: 'md:grid-cols-2',
    3: 'md:grid-cols-3',
    4: 'md:grid-cols-4',
  };

  const gapMap = {
    sm: 'gap-4',
    md: 'gap-6',
    lg: 'gap-8',
  };

  return (
    <div className={cn(
      'grid grid-cols-1',
      columnMap[columns],
      gapMap[gap],
      className
    )}>
      {children}
    </div>
  );
}

interface FeatureCardProps {
  icon?: ReactNode;
  title: string;
  description: string;
  badge?: string;
  href?: string;
  highlighted?: boolean;
  className?: string;
}

export function FeatureCard({
  icon,
  title,
  description,
  badge,
  href,
  highlighted = false,
  className,
}: FeatureCardProps) {
  const Card = ({ children }: { children: ReactNode }) => (
    <div className={cn(
      'group relative p-6 sm:p-8 rounded-2xl transition-all duration-300',
      highlighted
        ? 'bg-gradient-to-br from-primary/5 to-accent/5 border border-primary/20 shadow-lg hover:shadow-xl hover:border-primary/40'
        : 'bg-white border border-neutral-200 shadow-subtle hover:shadow-lg hover:border-neutral-300',
      className
    )}>
      {/* Animated background on hover */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary/0 to-accent/0 group-hover:from-primary/5 group-hover:to-accent/5 rounded-2xl transition-all duration-300" />

      {/* Content */}
      <div className="relative z-10 space-y-4">
        {badge && (
          <div className="inline-flex items-center px-3 py-1 bg-primary/10 text-primary rounded-full text-xs font-semibold uppercase tracking-wide">
            {badge}
          </div>
        )}

        {icon && (
          <div className={cn(
            'w-12 h-12 rounded-lg flex items-center justify-center transition-all duration-300',
            highlighted
              ? 'bg-gradient-to-br from-primary/20 to-accent/20 group-hover:from-primary/30 group-hover:to-accent/30'
              : 'bg-neutral-100 group-hover:bg-primary/10'
          )}>
            <div className={cn(
              highlighted
                ? 'text-primary group-hover:scale-110'
                : 'text-secondary group-hover:text-primary',
              'transition-all duration-300'
            )}>
              {icon}
            </div>
          </div>
        )}

        <div>
          <h3 className="text-lg font-bold text-secondary group-hover:text-primary transition-colors">
            {title}
          </h3>
          <p className="text-neutral-600 text-sm mt-2 leading-relaxed">
            {description}
          </p>
        </div>
      </div>
    </div>
  );

  if (href) {
    return (
      <a href={href} className="block hover:no-underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary rounded-2xl">
        <Card>
          <div />
        </Card>
      </a>
    );
  }

  return <Card><div /></Card>;
}

interface StatProps {
  value: string | number;
  label: string;
  unit?: string;
  icon?: ReactNode;
}

export function Stat({ value, label, unit, icon }: StatProps) {
  return (
    <div className="text-center space-y-2">
      {icon && (
        <div className="flex justify-center mb-3">
          <div className="text-primary text-3xl">
            {icon}
          </div>
        </div>
      )}
      <div className="text-3xl sm:text-4xl font-bold bg-gradient-to-r from-secondary to-primary bg-clip-text text-transparent">
        {value}
        {unit && <span className="text-lg text-neutral-600 ml-1">{unit}</span>}
      </div>
      <p className="text-neutral-600 text-sm font-medium">
        {label}
      </p>
    </div>
  );
}

interface StatsGridProps {
  stats: StatProps[];
  columns?: 2 | 3 | 4;
  className?: string;
}

export function StatsGrid({ stats, columns = 3, className }: StatsGridProps) {
  const columnMap = {
    2: 'md:grid-cols-2',
    3: 'md:grid-cols-3',
    4: 'md:grid-cols-4',
  };

  return (
    <div className={cn(
      'grid grid-cols-1',
      columnMap[columns],
      'gap-8 sm:gap-12',
      className
    )}>
      {stats.map((stat, idx) => (
        <Stat key={idx} {...stat} />
      ))}
    </div>
  );
}
