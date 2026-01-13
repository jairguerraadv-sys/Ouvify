/**
 * Componentes UI Modernos e Elegantes - Ouvy
 * 
 * Este arquivo exporta todos os componentes UI otimizados para criar
 * uma interface profissional, elegante e moderna.
 * 
 * Paleta de cores:
 * - Primary: #06B6D4 (Cyan - Marca)
 * - Secondary: #0F172A (Azul Escuro - Base)
 * - Accents: Gradientes e variações
 */

// Core Components
export { Logo } from './logo';
export { NavBar } from './navbar';
export { Footer } from './footer';

// Sections & Layouts
export { Hero, FeatureGrid, FeatureCard, StatsGrid, Stat } from './sections';

// Cards
export { 
  Card, 
  CardHeader,
  CardContent,
  CardFooter,
} from './card';

// Inputs & Forms
export { Input } from './input';

// Buttons
export { Button } from './button';

// UI Elements
export { 
  Badge,
  Alert,
  Progress,
  PricingCard,
} from './elements';

// Exports para compatibilidade
export { 
  Badge as BadgeChip,
  Alert as AlertBox,
  Progress as ProgressBar,
} from './elements';
