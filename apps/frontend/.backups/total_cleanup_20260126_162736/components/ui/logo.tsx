import Link from 'next/link';
import Image from 'next/image';
import { cn } from '@/lib/utils';

type LogoSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl';
type LogoVariant = 'full' | 'icon';
type LogoColorScheme = 'default' | 'white' | 'dark';

interface LogoProps {
  variant?: LogoVariant;
  size?: LogoSize;
  colorScheme?: LogoColorScheme;
  className?: string;
  href?: string;
  linkTo?: string;
}

const sizeConfig = {
  xs: { width: 80, height: 32, text: 'text-lg', gap: 'gap-1.5' },
  sm: { width: 100, height: 40, text: 'text-xl', gap: 'gap-2' },
  md: { width: 120, height: 48, text: 'text-2xl', gap: 'gap-2.5' },
  lg: { width: 150, height: 60, text: 'text-3xl', gap: 'gap-3' },
  xl: { width: 180, height: 72, text: 'text-4xl', gap: 'gap-4' },
};

export function Logo({
  variant = 'icon',
  size = 'md',
  colorScheme = 'default',
  className,
  href,
  linkTo,
}: LogoProps) {
  const { width, height, text: textSize, gap } = sizeConfig[size];

  const textColors = {
    default: 'text-secondary',
    white: 'text-gray-900',
    dark: 'text-secondary-dark',
  };

  const LogoImage = () => (
    <Image
      src="/logo.png"
      alt="Ouvy Logo"
      width={width}
      height={height}
      className={cn('object-contain', 'transition-transform duration-200 hover:scale-105')}
      priority
    />
  );

  const LogoText = () => (
    <span 
      className={cn(
        textSize, 
        'font-bold tracking-tight leading-none',
        textColors[colorScheme]
      )}
    >
      Ouvy
    </span>
  );

  const content = (
    <>
      {variant === 'full' ? (
        <div className={cn('flex items-center', gap, className)}>
          <LogoImage />
          <LogoText />
        </div>
      ) : (
        <div className={cn('flex items-center', className)}>
          <LogoImage />
        </div>
      )}
    </>
  );

  const targetHref = linkTo ?? href;

  if (targetHref) {
    return (
      <Link 
        href={targetHref}
        className={cn(
          'inline-flex items-center hover:opacity-80 transition-opacity duration-200',
          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-primary rounded-md'
        )}
      >
        {content}
      </Link>
    );
  }

  return content;
}