/**
 * Hook para gerenciar autenticação de dois fatores (2FA)
 * 
 * Endpoints:
 * - POST /api/auth/2fa/setup/ - Inicia configuração
 * - POST /api/auth/2fa/confirm/ - Confirma código
 * - POST /api/auth/2fa/verify/ - Verifica código no login
 * - POST /api/auth/2fa/disable/ - Desabilita 2FA
 * - GET /api/auth/2fa/status/ - Status atual
 * - POST /api/auth/2fa/backup-codes/regenerate/ - Regenera códigos
 */

import { useState } from "react";
import useSWR from "swr";
import api from "@/lib/api";
import { toast } from "sonner";

// Types baseados na resposta da API
export interface TwoFactorSetupResponse {
  secret: string;
  qr_code: string; // data:image/png;base64,...
  backup_codes: string[];
  message: string;
}

export interface TwoFactorStatusResponse {
  enabled: boolean;
  confirmed_at: string | null;
  backup_codes_remaining: number;
}

export interface TwoFactorConfirmResponse {
  message: string;
  backup_codes_count: number;
}

export interface TwoFactorVerifyResponse {
  message: string;
  verified: boolean;
  remaining_attempts?: number;
}

export interface TwoFactorDisableResponse {
  message: string;
}

/**
 * Hook principal para gerenciar 2FA
 */
export function use2FA() {
  const [isLoading, setIsLoading] = useState(false);
  const [setupData, setSetupData] = useState<TwoFactorSetupResponse | null>(null);

  // Busca status atual do 2FA
  const { data: status, error, mutate: refetchStatus } = useSWR<TwoFactorStatusResponse>(
    "/api/auth/2fa/status/",
    {
      revalidateOnFocus: false,
      shouldRetryOnError: false,
    }
  );

  /**
   * Inicia o processo de configuração de 2FA
   * Retorna secret, QR code e backup codes
   */
  const setup2FA = async (): Promise<TwoFactorSetupResponse | null> => {
    setIsLoading(true);
    try {
      const response = await api.post<TwoFactorSetupResponse>("/api/auth/2fa/setup/");
      setSetupData(response);
      toast.success("QR Code gerado com sucesso");
      return response;
    } catch (error: any) {
      const message = error.response?.data?.error || "Erro ao configurar 2FA";
      toast.error(message);
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Confirma a configuração do 2FA verificando o primeiro código
   * @param code - Código de 6 dígitos do app autenticador
   */
  const confirm2FA = async (code: string): Promise<boolean> => {
    setIsLoading(true);
    try {
      const response = await api.post<TwoFactorConfirmResponse>(
        "/api/auth/2fa/confirm/",
        { code }
      );
      toast.success(response.message);
      await refetchStatus(); // Atualiza status
      setSetupData(null); // Limpa dados temporários
      return true;
    } catch (error: any) {
      const message = error.response?.data?.error || "Código inválido";
      const remainingAttempts = error.response?.data?.remaining_attempts;
      
      if (remainingAttempts !== undefined) {
        toast.error(`${message} (${remainingAttempts} tentativas restantes)`);
      } else {
        toast.error(message);
      }
      
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Verifica código 2FA (usado no login)
   * @param code - Código TOTP (6 dígitos) ou backup code (XXXX-XXXX)
   */
  const verify2FA = async (code: string): Promise<boolean> => {
    setIsLoading(true);
    try {
      const response = await api.post<TwoFactorVerifyResponse>(
        "/api/auth/2fa/verify/",
        { code }
      );
      
      if (response.verified) {
        toast.success(response.message);
        return true;
      }
      
      return false;
    } catch (error: any) {
      const message = error.response?.data?.error || "Código inválido";
      const remainingAttempts = error.response?.data?.remaining_attempts;
      
      if (remainingAttempts !== undefined) {
        toast.error(`${message} (${remainingAttempts} tentativas restantes)`);
      } else {
        toast.error(message);
      }
      
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Desabilita 2FA (requer senha e código)
   * @param password - Senha atual do usuário
   * @param code - Código 2FA atual
   */
  const disable2FA = async (password: string, code: string): Promise<boolean> => {
    setIsLoading(true);
    try {
      const response = await api.post<TwoFactorDisableResponse>(
        "/api/auth/2fa/disable/",
        { password, code }
      );
      toast.success(response.message);
      await refetchStatus(); // Atualiza status
      return true;
    } catch (error: any) {
      const message = error.response?.data?.error || "Erro ao desabilitar 2FA";
      toast.error(message);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Regenera códigos de backup
   */
  const regenerateBackupCodes = async (): Promise<string[] | null> => {
    setIsLoading(true);
    try {
      const response = await api.post<{ backup_codes: string[] }>(
        "/api/auth/2fa/backup-codes/regenerate/"
      );
      toast.success("Códigos de backup regenerados");
      await refetchStatus(); // Atualiza contagem
      return response.backup_codes;
    } catch (error: any) {
      const message = error.response?.data?.error || "Erro ao regenerar códigos";
      toast.error(message);
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  return {
    // Estado
    status,
    isLoading: isLoading || !status,
    error,
    setupData,
    isEnabled: status?.enabled ?? false,
    
    // Ações
    setup2FA,
    confirm2FA,
    verify2FA,
    disable2FA,
    regenerateBackupCodes,
    refetchStatus,
  };
}
