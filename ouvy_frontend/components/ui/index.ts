/**
 * Componentes UI Modernos e Elegantes - Ouvy
 * 
 * Este arquivo exporta todos os componentes UI otimizados para criar
 * uma interface profissional, elegante e moderna.
 * 
 * Paleta de cores:
 * - Primary: #00BCD4 (Cyan - Marca)
 * - Secondary: #0A1E3B (Azul Marinho - Base)
 * - Accents: Gradientes e variações
 */

// Core Components
export { LogoEnhanced } from './logo-enhanced';
export { NavBarEnhanced } from './navbar-enhanced';
export { FooterEnhanced } from './footer-enhanced';

// Sections & Layouts
export { Hero, FeatureGrid, FeatureCard, StatsGrid, Stat } from './sections';

// Cards
export { 
  Card, 
  CardEnhanced,
  CardHeader,
  CardHeaderEnhanced,
  CardContent,
  CardContentEnhanced,
  CardFooter,
  CardFooterEnhanced,
} from './card-enhanced';

// Inputs & Forms
export { InputEnhanced, Input, TextareaEnhanced, Textarea } from './input-enhanced';

// Buttons
export { ButtonEnhanced, Button } from './button-enhanced';

// UI Elements
export { 
  Badge,
  Alert,
  Progress,
  PricingCard,
} from './elements';

// Exports para compatibilidade com código existente
export { 
  Badge as BadgeChip,
  Alert as AlertBox,
  Progress as ProgressBar,
} from './elements';
