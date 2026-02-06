/**
 * Página de Configuração de Segurança
 * Gerenciamento de autenticação de dois fatores (2FA)
 */

"use client";

import { useState } from "react";
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Shield,
  CheckCircle2,
  XCircle,
  KeyRound,
  Smartphone,
  AlertTriangle,
} from "lucide-react";
import { use2FA } from "@/hooks/use-2fa";
import { TwoFactorSetupModal } from "@/components/2fa/TwoFactorSetupModal";
import { TwoFactorDisableModal } from "@/components/2fa/TwoFactorDisableModal";
import { toast } from "sonner";

export default function SecuritySettingsPage() {
  const { status, isLoading, isEnabled, refetchStatus } = use2FA();
  const [setupModalOpen, setSetupModalOpen] = useState(false);
  const [disableModalOpen, setDisableModalOpen] = useState(false);

  const handleSetupComplete = () => {
    toast.success("2FA configurado com sucesso!");
    refetchStatus();
  };

  const handleDisableComplete = () => {
    toast.success("2FA desabilitado");
    refetchStatus();
  };

  return (
    <DashboardLayout>
      <div className="container max-w-4xl mx-auto py-8 space-y-8">
        {/* Cabeçalho */}
        <div className="space-y-2">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-primary/10 rounded-lg">
              <Shield className="h-6 w-6 text-primary" />
            </div>
            <div>
              <h1 className="text-3xl font-bold">Segurança da Conta</h1>
              <p className="text-muted-foreground">
                Proteja sua conta com autenticação de dois fatores
              </p>
            </div>
          </div>
        </div>

        {/* Status Geral de Segurança */}
        <Card className="p-6">
          <div className="flex items-start justify-between">
            <div className="space-y-1">
              <h2 className="text-xl font-semibold">Status de Segurança</h2>
              <p className="text-sm text-muted-foreground">
                {isEnabled
                  ? "Sua conta está protegida com 2FA"
                  : "Aumente a segurança ativando 2FA"}
              </p>
            </div>
            {isLoading ? (
              <Skeleton className="h-6 w-20" />
            ) : (
              <Badge
                variant={isEnabled ? "default" : "secondary"}
                className="flex items-center gap-1.5"
              >
                {isEnabled ? (
                  <>
                    <CheckCircle2 className="h-3.5 w-3.5" />
                    Ativo
                  </>
                ) : (
                  <>
                    <XCircle className="h-3.5 w-3.5" />
                    Inativo
                  </>
                )}
              </Badge>
            )}
          </div>
        </Card>

        {/* Card de 2FA */}
        <Card className="p-6">
          <div className="space-y-6">
            {/* Cabeçalho do Card */}
            <div className="flex items-start gap-4">
              <div className="p-3 bg-primary/10 rounded-lg shrink-0">
                <Smartphone className="h-6 w-6 text-primary" />
              </div>
              <div className="flex-1 space-y-1">
                <h3 className="text-lg font-semibold">
                  Autenticação de Dois Fatores (2FA)
                </h3>
                <p className="text-sm text-muted-foreground">
                  Adicione uma camada extra de segurança além da senha. Você precisará 
                  de um código gerado no seu celular para fazer login.
                </p>
              </div>
            </div>

            {/* Status e Ações */}
            {isLoading ? (
              <div className="space-y-3">
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-10 w-32" />
              </div>
            ) : isEnabled ? (
              <div className="space-y-4">
                {/* 2FA Ativo */}
                <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                  <div className="flex items-start gap-3">
                    <CheckCircle2 className="h-5 w-5 text-green-600 shrink-0 mt-0.5" />
                    <div className="space-y-1 flex-1">
                      <p className="font-medium text-green-900">
                        2FA está ativo
                      </p>
                      <p className="text-sm text-green-700">
                        Sua conta está protegida com autenticação de dois fatores.
                        {status?.confirmed_at && (
                          <> Ativado em {new Date(status.confirmed_at).toLocaleDateString("pt-BR")}.</>
                        )}
                      </p>
                      {status?.backup_codes_remaining !== undefined && (
                        <p className="text-sm text-green-700">
                          <KeyRound className="h-3.5 w-3.5 inline mr-1" />
                          {status.backup_codes_remaining} código{status.backup_codes_remaining !== 1 && "s"} de backup restante{status.backup_codes_remaining !== 1 && "s"}
                        </p>
                      )}
                    </div>
                  </div>
                </div>

                {/* Botão Desabilitar */}
                <Button
                  variant="outline"
                  onClick={() => setDisableModalOpen(true)}
                  className="text-destructive hover:text-destructive"
                >
                  Desabilitar 2FA
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                {/* 2FA Inativo */}
                <div className="p-4 bg-amber-50 border border-amber-200 rounded-lg">
                  <div className="flex items-start gap-3">
                    <AlertTriangle className="h-5 w-5 text-amber-600 shrink-0 mt-0.5" />
                    <div className="space-y-1">
                      <p className="font-medium text-amber-900">
                        2FA não está ativo
                      </p>
                      <p className="text-sm text-amber-700">
                        Recomendamos ativar 2FA para proteger sua conta contra acessos 
                        não autorizados.
                      </p>
                    </div>
                  </div>
                </div>

                {/* Botão Ativar */}
                <Button
                  onClick={() => setSetupModalOpen(true)}
                  className="w-full sm:w-auto"
                >
                  <Shield className="mr-2 h-4 w-4" />
                  Ativar 2FA
                </Button>
              </div>
            )}

            {/* Informações sobre 2FA */}
            <div className="pt-4 border-t space-y-3">
              <p className="text-sm font-medium">Como funciona o 2FA:</p>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li className="flex items-start gap-2">
                  <span className="text-primary font-semibold mt-0.5">1.</span>
                  <span>
                    Instale um app autenticador no celular (Google Authenticator, 
                    Authy, Microsoft Authenticator)
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-primary font-semibold mt-0.5">2.</span>
                  <span>
                    Escaneie o QR Code gerado pela Ouvify no app
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-primary font-semibold mt-0.5">3.</span>
                  <span>
                    Ao fazer login, digite o código de 6 dígitos exibido no app
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-primary font-semibold mt-0.5">4.</span>
                  <span>
                    Guarde seus códigos de backup em local seguro para emergências
                  </span>
                </li>
              </ul>
            </div>
          </div>
        </Card>

        {/* Outras Configurações de Segurança (Futuro) */}
        <Card className="p-6 opacity-50">
          <div className="space-y-4">
            <h3 className="text-lg font-semibold flex items-center gap-2">
              <KeyRound className="h-5 w-5" />
              Outras Opções de Segurança
            </h3>
            <p className="text-sm text-muted-foreground">
              Em breve: Gerenciamento de sessões ativas, histórico de login, 
              e notificações de segurança.
            </p>
          </div>
        </Card>
      </div>

      {/* Modais */}
      <TwoFactorSetupModal
        open={setupModalOpen}
        onOpenChange={setSetupModalOpen}
        onComplete={handleSetupComplete}
      />

      <TwoFactorDisableModal
        open={disableModalOpen}
        onOpenChange={setDisableModalOpen}
        onComplete={handleDisableComplete}
      />
    </DashboardLayout>
  );
}
