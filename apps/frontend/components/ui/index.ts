/**
 * Componentes UI Modernos e Elegantes - Ouvify
 * 
 * Este arquivo exporta todos os componentes UI otimizados para criar
 * uma interface profissional, elegante e moderna.
 * 
 * Paleta de cores:
 * - Primary: #00BCD4 (Cyan Vibrante)
 * - Secondary: #0A1E3B (Navy Profundo)
 * - Semânticas: Success, Warning, Error, Info
 */

// Core Components
export { 
  Logo, 
  LogoHeader, 
  LogoFooter, 
  LogoAuth, 
  LogoError, 
  LogoSidebar, 
  LogoMobile,
  LogoHero,
  LogoStatic,
} from './logo';
export { NavBar } from './navbar';
export { Footer } from './footer';

// Typography
export { 
  H1, 
  H2, 
  H3, 
  H4, 
  H5, 
  H6,
  Paragraph,
  Lead,
  Small,
  Muted,
} from './typography';

// Sections & Layouts
export { Hero, FeatureGrid, FeatureCard, StatsGrid, Stat } from './sections';

// Cards
export { 
  Card, 
  CardHeader,
  CardContent,
  CardFooter,
  CardTitle,
  CardDescription,
} from './card';

// Inputs & Forms
export { Input } from './input';

// Buttons
export { Button, buttonVariants } from './button';

// Badges & Chips
export { Badge, badgeVariants } from './badge';
export { Chip } from './chip';

// Avatar
export { Avatar, AvatarImage, AvatarFallback } from './avatar';

// Divider
export { Divider } from './divider';

// Separator
export { Separator } from './separator';

// Skeleton
export { Skeleton } from './skeleton';

// Alert
export { Alert, AlertTitle, AlertDescription, AlertWithIcon } from './alert';

// Status Badge
export { StatusBadge } from './status-badge';

// Empty State
export { 
  EmptyState, 
  NoFeedbacks, 
  NoResults, 
  NoNotifications, 
  ErrorState 
} from './empty-state';

// Progress
export { Progress } from './progress';

// Stats Card
export { StatsCard } from './stats-card';

// Page Layout (NEW)
export { 
  PageLayout, 
  PageContent, 
  PageSection, 
  PageGrid, 
  PageDivider 
} from './page-layout';

// Form Components (NEW)
export { 
  Form, 
  FormField, 
  FormSection, 
  FormActions, 
  FormRow 
} from './form-field';

// Loading States (NEW)
export { 
  LoadingState, 
  LoadingSpinner, 
  LoadingDots, 
  PageLoading, 
  ButtonLoadingContent 
} from './loading-state';

// Breadcrumb
export { Breadcrumb } from './breadcrumb';

// Loading & Feedback (Sprint 5)
export { 
  LoadingOverlay,
  CardSkeleton,
  TableRowSkeleton,
  ListSkeleton,
  StatCardSkeleton,
  ChartSkeleton,
  useLoadingState,
} from './LoadingOverlay';

export {
  InlineNotification,
  StatusIndicator,
  ProgressSteps,
  CopyButton,
  ActionResult,
  Countdown,
} from './ActionFeedback';

// Toast System (NEW)
export {
  ToastProvider,
  useToast,
  InlineToast,
  ConfirmDialog,
} from './toast-system';

// Accessibility (NEW)
export {
  SkipLink,
  VisuallyHidden,
  LiveRegion,
  FocusTrap,
  FocusIndicator,
  KeyboardNav,
  Announce,
  useAnnounce,
} from './accessibility';

// Layout Utilities (Phase 5)
export {
  Flex,
  FlexRow,
  InlineFlexRow,
  FlexCol,
  FlexBetween,
  FlexCenter,
  Container,
  DecorativeBlob,
  Stack,
  MutedText,
  IconWrapper,
  Spinner,
  Section,
} from './layout-utils';

export type {
  FlexProps,
  ContainerProps,
  DecorativeBlobProps,
  DecorativeBlobTone,
  DecorativeBlobSize,
  DecorativeBlobPlacement,
  StackProps,
  MutedTextProps,
  IconWrapperProps,
  SpinnerProps,
  SectionProps,
} from './layout-utils';

// (exports duplicados e inválidos removidos)
