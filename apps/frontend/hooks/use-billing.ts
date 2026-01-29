/**
 * Billing Hooks - Ouvy SaaS
 * Sprint 4 - Feature 4.3: Pricing Page
 * 
 * Hooks para gerenciamento de planos, assinaturas e billing
 */
import { useState, useEffect, useCallback } from 'react';
import { api, getErrorMessage } from '@/lib/api';

// Types
export interface Plan {
  id: number;
  name: string;
  slug: string;
  price_cents: number;
  price_display: string;
  currency: string;
  description: string;
  features: string[];
  limits: Record<string, number>;
  is_popular: boolean;
  is_free: boolean;
  trial_days: number;
  is_active: boolean;
}

export interface Subscription {
  id: number;
  plan: Plan | null;
  status: string;
  is_active: boolean;
  is_trialing: boolean;
  trial_days_remaining: number | null;
  can_access_features: boolean;
  trial_start: string | null;
  trial_end: string | null;
  current_period_start: string | null;
  current_period_end: string | null;
  cancel_at_period_end: boolean;
  created_at: string;
  updated_at: string;
}

export interface Invoice {
  id: number;
  subscription: number;
  amount_cents: number;
  amount_display: string;
  currency: string;
  status: string;
  is_paid: boolean;
  pdf_url: string | null;
  hosted_invoice_url: string | null;
  period_start: string | null;
  period_end: string | null;
  paid_at: string | null;
  due_date: string | null;
  description: string | null;
  created_at: string;
}

export interface SubscriptionStatus {
  has_subscription: boolean;
  plan: Plan | null;
  status: string | null;
  is_trialing: boolean;
}

export interface CheckoutResponse {
  session_id: string;
  checkout_url: string;
}

export interface PortalResponse {
  portal_url: string;
}

// Hook para carregar planos disponíveis
export function usePlans() {
  const [plans, setPlans] = useState<Plan[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchPlans = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const data = await api.get<Plan[]>('/api/v1/billing/plans/');
      setPlans(data);
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchPlans();
  }, [fetchPlans]);

  return { plans, loading, error, refetch: fetchPlans };
}

// Hook para status da assinatura atual
export function useSubscriptionStatus() {
  const [status, setStatus] = useState<SubscriptionStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchStatus = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const data = await api.get<SubscriptionStatus>('/api/v1/billing/subscription/status/');
      setStatus(data);
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchStatus();
  }, [fetchStatus]);

  return { status, loading, error, refetch: fetchStatus };
}

// Hook para listar faturas
export function useInvoices() {
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchInvoices = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const data = await api.get<Invoice[]>('/api/v1/billing/invoices/');
      setInvoices(data);
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchInvoices();
  }, [fetchInvoices]);

  return { invoices, loading, error, refetch: fetchInvoices };
}

// Hook para ações de billing
export function useBillingActions() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Criar sessão de checkout
  const createCheckout = useCallback(async (
    planId: number,
    successUrl: string,
    cancelUrl: string
  ): Promise<CheckoutResponse | null> => {
    setLoading(true);
    setError(null);

    try {
      const response = await api.post<CheckoutResponse>('/api/v1/billing/subscription/checkout/', {
        plan_id: planId,
        success_url: successUrl,
        cancel_url: cancelUrl,
      });
      return response;
    } catch (err) {
      setError(getErrorMessage(err));
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  // Criar sessão do portal de billing
  const createPortal = useCallback(async (
    returnUrl: string
  ): Promise<PortalResponse | null> => {
    setLoading(true);
    setError(null);

    try {
      const response = await api.post<PortalResponse>('/api/v1/billing/subscription/portal/', {
        return_url: returnUrl,
      });
      return response;
    } catch (err) {
      setError(getErrorMessage(err));
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  // Cancelar assinatura
  const cancelSubscription = useCallback(async (
    immediate: boolean = false
  ): Promise<boolean> => {
    setLoading(true);
    setError(null);

    try {
      await api.post('/api/v1/billing/subscription/cancel/', {
        immediate,
      });
      return true;
    } catch (err) {
      setError(getErrorMessage(err));
      return false;
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    createCheckout,
    createPortal,
    cancelSubscription,
    loading,
    error,
  };
}

// Hook combinado para billing
export function useBilling() {
  const { plans, loading: plansLoading, error: plansError, refetch: refetchPlans } = usePlans();
  const { status, loading: statusLoading, error: statusError, refetch: refetchStatus } = useSubscriptionStatus();
  const { invoices, loading: invoicesLoading, error: invoicesError, refetch: refetchInvoices } = useInvoices();
  const { createCheckout, createPortal, cancelSubscription, loading: actionLoading, error: actionError } = useBillingActions();

  const loading = plansLoading || statusLoading || invoicesLoading || actionLoading;
  const error = plansError || statusError || invoicesError || actionError;

  const refetch = useCallback(async () => {
    await Promise.all([refetchPlans(), refetchStatus(), refetchInvoices()]);
  }, [refetchPlans, refetchStatus, refetchInvoices]);

  return {
    plans,
    status,
    invoices,
    loading,
    error,
    refetch,
    createCheckout,
    createPortal,
    cancelSubscription,
  };
}
