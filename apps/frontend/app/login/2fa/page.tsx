/**
 * Página de verificação 2FA durante o login
 * Exibida após login bem-sucedido quando usuário tem 2FA ativo
 */

"use client";

import { useState, useCallback, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Card, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { LogoAuth } from "@/components/ui/logo";
import { DecorativeBlob } from "@/components/ui/layout-utils";
import { Shield, AlertCircle, KeyRound } from "lucide-react";
import { use2FA } from "@/hooks/use-2fa";
import { useAuth } from "@/contexts/AuthContext";

export default function TwoFactorVerifyPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { verify2FA, isLoading } = use2FA();
  const { user } = useAuth();
  
  const [code, setCode] = useState("");
  const [error, setError] = useState("");
  const [isBackupCode, setIsBackupCode] = useState(false);

  // Redirecionar se não estiver autenticado
  useEffect(() => {
    if (!user) {
      router.push("/login");
    }
  }, [user, router]);

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!code) {
      setError("Digite o código 2FA");
      return;
    }

    // Validar formato
    if (!isBackupCode && (code.length !== 6 || !/^\d{6}$/.test(code))) {
      setError("Código TOTP deve ter 6 dígitos");
      return;
    }

    const success = await verify2FA(code);
    
    if (success) {
      // Redirecionar para o destino original ou dashboard
      const redirect = searchParams.get("redirect") || "/dashboard";
      router.push(redirect);
    } else {
      setError("Código inválido. Tente novamente.");
      setCode("");
    }
  };

  const handleCodeChange = (value: string) => {
    setCode(value);
    setError("");
    
    // Detectar se é backup code (formato XXXX-XXXX)
    if (value.includes("-") || value.length > 6) {
      setIsBackupCode(true);
    } else {
      setIsBackupCode(false);
    }
  };

  const handleUseBackupCode = () => {
    setIsBackupCode(true);
    setCode("");
    setError("");
  };

  const handleUseAuthApp = () => {
    setIsBackupCode(false);
    setCode("");
    setError("");
  };

  if (!user) {
    return null; // Vai redirecionar
  }

  return (
    <main className="min-h-screen bg-background flex items-center justify-center p-4 relative overflow-hidden">
      {/* Decorative elements */}
      <DecorativeBlob
        size="sm"
        placement="topLeftQuarter"
        className="animate-pulse opacity-100"
      />
      <DecorativeBlob
        size="sm"
        placement="bottomRightQuarter"
        className="animate-pulse delay-1000 opacity-100"
      />

      <Card
        variant="elevated"
        className="w-full max-w-md relative z-10 animate-scale-in"
      >
        <CardHeader>
          <div className="flex justify-center mb-6">
            <LogoAuth />
          </div>
          
          <div className="flex justify-center mb-4">
            <div className="p-3 bg-primary/10 rounded-full">
              <Shield className="h-8 w-8 text-primary" />
            </div>
          </div>

          <h1 className="text-2xl font-bold text-secondary text-center mb-2">
            Verificação de Dois Fatores
          </h1>
          <p className="text-muted-foreground text-center text-sm">
            {isBackupCode
              ? "Digite um dos seus códigos de backup"
              : "Digite o código de 6 dígitos do seu app autenticador"}
          </p>
        </CardHeader>

        <form onSubmit={handleVerify} className="p-6 space-y-5">
          {/* Erro */}
          {error && (
            <div
              role="alert"
              aria-live="polite"
              className="flex items-center gap-2 p-3 bg-error/10 border border-error/30 rounded-lg text-error text-sm"
            >
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Informação do usuário */}
          <div className="p-3 bg-muted rounded-lg text-sm">
            <p className="text-muted-foreground">Verificando acesso para:</p>
            <p className="font-medium text-secondary">{user.email}</p>
          </div>

          {/* Input de Código */}
          <div className="space-y-2">
            <label className="block text-sm font-semibold text-secondary">
              {isBackupCode ? "Código de Backup" : "Código 2FA"}
            </label>
            <Input
              type="text"
              inputMode={isBackupCode ? "text" : "numeric"}
              maxLength={isBackupCode ? 9 : 6}
              value={code}
              onChange={(e) => handleCodeChange(e.target.value)}
              placeholder={isBackupCode ? "XXXX-XXXX" : "000000"}
              className="text-center text-2xl tracking-widest font-mono"
              disabled={isLoading}
              autoFocus
              autoComplete="off"
            />
            <p className="text-xs text-muted-foreground text-center">
              {isBackupCode
                ? "Formato: XXXX-XXXX (cada código só pode ser usado uma vez)"
                : "O código muda a cada 30 segundos"}
            </p>
          </div>

          {/* Submit Button */}
          <Button
            type="submit"
            size="lg"
            className="w-full"
            disabled={isLoading || !code}
            isLoading={isLoading}
          >
            Verificar Código
          </Button>

          {/* Alternar entre TOTP e Backup Code */}
          <div className="pt-4 border-t text-center space-y-2">
            {isBackupCode ? (
              <button
                type="button"
                onClick={handleUseAuthApp}
                className="text-sm text-primary hover:text-primary font-medium transition-colors"
                disabled={isLoading}
              >
                Usar código do app autenticador
              </button>
            ) : (
              <button
                type="button"
                onClick={handleUseBackupCode}
                className="text-sm text-primary hover:text-primary font-medium transition-colors flex items-center justify-center gap-1"
                disabled={isLoading}
              >
                <KeyRound className="h-4 w-4" />
                Usar código de backup
              </button>
            )}
          </div>

          {/* Ajuda */}
          <div className="pt-2 text-center">
            <p className="text-xs text-muted-foreground">
              Perdeu acesso ao app autenticador?{" "}
              <a
                href="/suporte"
                className="text-primary hover:text-primary font-medium"
              >
                Entre em contato com o suporte
              </a>
            </p>
          </div>
        </form>
      </Card>
    </main>
  );
}
