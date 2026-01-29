/**
 * Hooks Index - Ouvy SaaS
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
export { useBilling, usePlanInfo, useSubscriptionStatus, type BillingInfo } from './use-billing';
export { useCommon } from './use-common';
export { useDashboard, useDashboardStats, useRecentFeedbacks, type DashboardData } from './use-dashboard';
export { useFeedbackDetails } from './use-feedback-details';
export { useTenantTheme } from './use-tenant-theme';
export { useUserProfile } from './use-user-profile';
