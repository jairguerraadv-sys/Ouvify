import { ReactNode } from 'react';
import { cn } from '@/lib/utils';
import Container from './Container';

interface SectionProps {
  children: ReactNode;
  className?: string;
  containerSize?: 'sm' | 'md' | 'lg' | 'xl' | 'full';
  padding?: 'none' | 'sm' | 'md' | 'lg' | 'xl';
  id?: string;
}

const paddingClasses = {
  none: '',
  sm: 'py-8',
  md: 'py-12',
  lg: 'py-16',
  xl: 'py-24',
};

export default function Section({ 
  children, 
  className = '', 
  containerSize = 'lg',
  padding = 'lg',
  id
}: SectionProps) {
  return (
    <section id={id} className={cn(paddingClasses[padding], className)}>
      <Container size={containerSize}>
        {children}
      </Container>
    </section>
  );
}
