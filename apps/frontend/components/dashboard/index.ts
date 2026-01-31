/**
 * Dashboard Components - Ouvify
 * 
 * Componentes padronizados para o painel administrativo.
 */

// Layout Components
export {
  DashboardLayout,
  DashboardHeader,
  DashboardSection,
  DashboardGrid,
  DashboardCard,
  DashboardStat,
  DashboardEmpty,
} from './DashboardLayout';

// Sidebar
export { Sidebar } from './sidebar';

// Charts
export { 
  FeedbackTrendChart, 
  FeedbackTypeChart, 
  ResponseTimeChart 
} from './RechartsComponents';

// Widgets
export { SLAComplianceWidget } from './Widgets';

// Onboarding
export { OnboardingChecklist } from './OnboardingChecklist';
