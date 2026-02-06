/**
 * Hook para gerenciar consentimentos LGPD
 * 
 * Endpoints:
 * - GET /api/consent/versions/ - Lista versões atuais
 * - GET /api/consent/versions/required/ - Versões obrigatórias
 * - GET /api/consent/user-consents/ - Meus consentimentos
 * - POST /api/consent/user-consents/accept/ - Aceitar (autenticado)
 * - POST /api/consent/user-consents/accept_anonymous/ - Aceitar (anônimo)
 * - POST /api/consent/user-consents/{id}/revoke/ - Revogar
 * - GET /api/consent/user-consents/pending/ - Verificar pendentes
 */

import useSWR from "swr";
import api from "@/lib/api";
import { toast } from "sonner";
import { useState } from "react";

// Types baseados nos models do backend
export interface ConsentVersion {
  id: number;
  document_type: "terms" | "privacy" | "lgpd" | "marketing";
  document_type_display: string;
  version: string;
  content_url: string;
  is_current: boolean;
  is_required: boolean;
  effective_date: string;
}

export interface UserConsent {
  id: number;
  consent_version: number;
  consent_version_details: ConsentVersion;
  accepted: boolean;
  accepted_at: string | null;
  revoked: boolean;
  revoked_at: string | null;
  context: string;
}

export interface PendingResponse {
  has_pending: boolean;
  pending_consents: ConsentVersion[];
}

interface AcceptConsentPayload {
  consents: Array<{
    document_type: string;
    version?: string;
  }>;
  email?: string;
}

/**
 * Hook principal para gerenciar consentimentos LGPD
 */
export function useConsent() {
  const [isLoading, setIsLoading] = useState(false);

  // Busca versões atuais (todas)
  const { data: versions, error: versionsError } = useSWR<ConsentVersion[]>(
    "/api/consent/versions/",
    {
      revalidateOnFocus: false,
    }
  );

  // Busca versões obrigatórias (para signup/feedback)
  const { data: required, error: requiredError, mutate: refetchRequired } = useSWR<ConsentVersion[]>(
    "/api/consent/versions/required/",
    {
      revalidateOnFocus: false,
    }
  );

  // Busca consentimentos do usuário autenticado
  const { data: myConsents, error: myConsentsError, mutate: refetchMyConsents } = useSWR<UserConsent[]>(
    "/api/consent/user-consents/",
    {
      revalidateOnFocus: false,
      shouldRetryOnError: false, // Não retry se não autenticado
    }
  );

  // Busca consentimentos pendentes
  const { data: pending, error: pendingError, mutate: refetchPending } = useSWR<PendingResponse>(
    "/api/consent/user-consents/pending/",
    {
      revalidateOnFocus: false,
      shouldRetryOnError: false,
    }
  );

  /**
   * Aceitar consentimentos (usuário autenticado)
   * Usado no signup ou configurações
   */
  const acceptConsent = async (
    consentsData: Array<{ document_type: string; version?: string }>
  ): Promise<boolean> => {
    setIsLoading(true);
    try {
      const payload: AcceptConsentPayload = { consents: consentsData };
      await api.post("/api/consent/user-consents/accept/", payload);
      toast.success("Consentimentos aceitos com sucesso");
      await refetchMyConsents();
      await refetchPending();
      return true;
    } catch (error: any) {
      const message = error.response?.data?.error || "Erro ao aceitar consentimentos";
      toast.error(message);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Aceitar consentimentos (usuário anônimo)
   * Usado no envio de feedback anônimo
   */
  const acceptConsentAnonymous = async (
    consentsData: Array<{ document_type: string; version?: string }>,
    email?: string
  ): Promise<boolean> => {
    setIsLoading(true);
    try {
      const payload: AcceptConsentPayload = {
        consents: consentsData,
        email,
      };
      await api.post("/api/consent/user-consents/accept_anonymous/", payload);
      toast.success("Consentimento registrado");
      return true;
    } catch (error: any) {
      const message = error.response?.data?.error || "Erro ao registrar consentimento";
      toast.error(message);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Revogar consentimento
   * @param consentId - ID do consentimento a ser revogado
   */
  const revokeConsent = async (consentId: number): Promise<boolean> => {
    setIsLoading(true);
    try {
      await api.post(`/api/consent/user-consents/${consentId}/revoke/`);
      toast.success("Consentimento revogado");
      await refetchMyConsents();
      return true;
    } catch (error: any) {
      const message = error.response?.data?.error || "Erro ao revogar consentimento";
      toast.error(message);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  return {
    // Estado
    versions,
    required,
    myConsents,
    pending,
    isLoading: isLoading || (!versions && !versionsError),
    error: versionsError || requiredError || myConsentsError || pendingError,
    hasPending: pending?.has_pending ?? false,
    
    // Ações
    acceptConsent,
    acceptConsentAnonymous,
    revokeConsent,
    refetchRequired,
    refetchMyConsents,
    refetchPending,
  };
}

/**
 * Hook simplificado para obter apenas versões obrigatórias
 * Útil para formulário de envio de denúncia
 */
export function useRequiredConsents() {
  const { data, error } = useSWR<ConsentVersion[]>(
    "/api/consent/versions/required/",
    {
      revalidateOnFocus: false,
    }
  );

  return {
    required: data || [],
    isLoading: !data && !error,
    error,
  };
}
