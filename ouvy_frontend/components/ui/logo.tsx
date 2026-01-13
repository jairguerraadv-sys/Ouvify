import Link from 'next/link';
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
  xs: { icon: 'w-6 h-6', text: 'text-lg', gap: 'gap-1.5' },
  sm: { icon: 'w-8 h-8', text: 'text-xl', gap: 'gap-2' },
  md: { icon: 'w-10 h-10', text: 'text-2xl', gap: 'gap-2.5' },
  lg: { icon: 'w-12 h-12', text: 'text-3xl', gap: 'gap-3' },
  xl: { icon: 'w-16 h-16', text: 'text-4xl', gap: 'gap-4' },
};

export function Logo({
  variant = 'full',
  size = 'md',
  colorScheme = 'default',
  className,
  href,
  linkTo,
}: LogoProps) {
  const { icon: iconSize, text: textSize, gap } = sizeConfig[size];

  const iconColors = {
    default: 'text-primary-500',
    white: 'text-white',
    dark: 'text-secondary-900',
  };

  const textColors = {
    default: 'text-secondary-900',
    white: 'text-white',
    dark: 'text-secondary-900',
  };

  const SonicWaveIcon = () => (
    <svg 
      className={cn(iconSize, iconColors[colorScheme])}
      viewBox="0 0 48 48" 
      fill="none" 
      xmlns="http://www.w3.org/2000/svg"
      aria-label="Ouvy Icon"
    >
      <path 
        d="M24 8C15.163 8 8 15.163 8 24s7.163 16 16 16 16-7.163 16-16S32.837 8 24 8z" 
        fill="currentColor" 
        opacity="0.2"
      />
      <path 
        d="M12 24c0-6.627 5.373-12 12-12M24 12c6.627 0 12 5.373 12 12M36 24c0 6.627-5.373 12-12 12M24 36c-6.627 0-12-5.373-12-12" 
        stroke="currentColor" 
        strokeWidth="3" 
        strokeLinecap="round"
        opacity="0.6"
      />
      <path 
        d="M16 24c0-4.418 3.582-8 8-8M24 16c4.418 0 8 3.582 8 8M32 24c0 4.418-3.582 8-8 8M24 32c-4.418 0-8-3.582-8-8" 
        stroke="currentColor" 
        strokeWidth="3" 
        strokeLinecap="round"
      />
      <circle cx="24" cy="24" r="3" fill="currentColor" />
    </svg>
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
          <SonicWaveIcon />
          <LogoText />
        </div>
      ) : (
        <div className={cn('flex items-center', className)}>
          <SonicWaveIcon />
        </div>
      )}
    </>
  );

  const targetHref = linkTo ?? href;

  if (targetHref) {
    return (
      <Link 
        href={targetHref}
        className="inline-flex items-center hover:opacity-80 transition-opacity focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 rounded-lg"
        aria-label="Ouvy - Canal de Ética"
      >
        {content}
      </Link>
    );
  }

  return <div className="inline-flex">{content}</div>;
}
