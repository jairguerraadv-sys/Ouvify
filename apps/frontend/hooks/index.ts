/**
 * Hooks Index - Ouvify
 * Exporta todos os hooks do projeto
 */

// UX Hooks (Sprint 5)
export { useNotification, DEFAULT_MESSAGES } from './useNotification';
export { useConfirm, CONFIRM_MESSAGES } from './useConfirm';
export { useFormState, validators } from './useFormState';

// Auth
export { useAuth } from './useAuth';

// UI
export { useCSPNonce } from './useCSPNonce';
export { useToast } from './use-toast';

// Domain
export { useBilling, usePlans, useSubscriptionStatus, useInvoices, useBillingActions } from './use-billing';
export type { Plan, Subscription, Invoice, SubscriptionStatus } from './use-billing';
export { useDebounce, useLocalStorage, useMediaQuery, useClickOutside, useCopyToClipboard, useAsync } from './use-common';
export { useDashboardStats, useFeedbacks, useFeedback, useAnalytics } from './use-dashboard';
export { useFeedbackDetails } from './use-feedback-details';
export { useTenantTheme } from './use-tenant-theme';
export { useUserProfile } from './use-user-profile';
